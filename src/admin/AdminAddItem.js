import React, { Component } from "react";
import axios from 'axios';
import configData from "../includes/config.json";
import AdminBar from "./AdminBar";
import storage from '../firebase/firebase';
import "../admin/css/common.css";

class AdminAddItem extends Component
{

    constructor()
    {
        super();
        this.state = {
            categories: [],
            subCategories: [],
            colors: [""],
            totalBytes: 1,
            transferdBytes: 0
        }

        this.newColorHandle = this.newColorHandle.bind(this);
        this.addProductSubmitBtn = this.addProductSubmitBtn.bind(this);
    }
    
    async componentDidMount()
    {
        await this.checkIfAdmin();  
        await this.getCategories();
        await this.getSubCategories();
    }
    
    async getCategories()
    {
        let availableCategories = [];
        const response = await axios({
            method: 'GET',
            url: configData.server_URI + '/get/categories'
        });
        response.data.forEach(category=>{
            availableCategories.push(category.category_name);
        });
        this.setState({
            categories: availableCategories
        });
    }

    async getSubCategories()
    {
        let availableSubCategories = [];
        const response = await axios({
            method: 'GET',
            url: configData.server_URI + '/get/subCategories'
        });
        response.data.forEach(subCategory=>{
            availableSubCategories.push(subCategory.name);
        });
        this.setState({
            subCategories: availableSubCategories
        });
    }

    async checkIfAdmin()
    {
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        if(!accountID)
        {
            this.props.history.push("/");
            return;
        }
        const response = await axios({
            method: 'POST',
            url: configData.server_URI + '/getAccount',
            params: {
                id: accountID
            }
        });
        if(response.data.permission !== 255) //admin perm is 255
        {
            this.props.history.push("/");
            return;
        }
    }

    newColorHandle(e)
    {
        e.preventDefault();
        let colors = this.state.colors;
        colors.push("");
        this.setState({
            colors
        });
    }

    changeColorValue(i, e){
        let colors = this.state.colors;
        colors[i] = e.target.value;
        this.setState({
            colors
        });
    }

    async addProductSubmitBtn(e)
    {
        e.preventDefault();
        let hasColor = false;
        const jsonReq = [];
        const title = e.target.ProductTitle.value;
        const category = e.target.ProductCategory.value;
        const subCategory = e.target.ProductSubCategory.value;
        if(title === "" || category === "" || subCategory === "")
        {
            alert("Please fill in all the required fields.");
            return;
        }
        e.target.disabled = true;
        let colorsPromise = new Promise((resolve, reject) => {
            this.state.colors.forEach((color, i)=>{
                if(color !== '')
                {
                    hasColor = true;
                    const price = e.target.querySelector('[name="'+color+'Price"]').value;
                    const xs = e.target.querySelector('[name="'+color+'XSQuantity"]').value;
                    const s = e.target.querySelector('[name="'+color+'SQuantity"]').value;
                    const m = e.target.querySelector('[name="'+color+'MQuantity"]').value;
                    const l = e.target.querySelector('[name="'+color+'LQuantity"]').value;
                    const xl = e.target.querySelector('[name="'+color+'XLQuantity"]').value;
                    const xxl = e.target.querySelector('[name="'+color+'XXLQuantity"]').value;
                    const xxxl = e.target.querySelector('[name="'+color+'XXXLQuantity"]').value;
                    const description = e.target.querySelector('[name="'+color+'Description"]').value;
                    const images = e.target.querySelector('[name="'+color+'Images"]').files;
                    let images_urls = [];

                    //check inputs
                    if(price === "" || xs === "" || s === "" || m === "" || l === "" || xl === "" || xxl === "" || xxxl === "" || !images.length)
                    {
                        alert("Please fill in all the required fields.");
                        return;
                    }
                    if(Number(price) < 0)
                    {
                        alert("Price must be greater than 0.");
                        return;
                    }
                    if(Number(xs) < 0 || Number(s) < 0 || Number(m) < 0 || Number(l) < 0 || Number(xl) < 0 || Number(xxl) < 0 || Number(xxxl) < 0)
                    {
                        alert("Quantities must be greater than 0.");
                        return;
                    }

                    //upload images
                    let uploadImagesPromise = new Promise((uploadImageResolve, reject) => {
                        for(let i=0; i<images.length; i++)
                        {
                            let totalBytesAdded = false;
                            storage.ref(`/ProductsImages/${images[i].name}`).put(images[i]).on("state_changed",
                            (snap)=>{
                                if(!totalBytesAdded)
                                {
                                    this.setState({
                                        totalBytes: this.state.totalBytes + snap.totalBytes,
                                    });
                                    totalBytesAdded = true;
                                }
                                this.setState({
                                    transferdBytes: this.state.transferdBytes + snap.bytesTransferred,
                                });
                            }, (err) =>{
                            }, ()=>{
                                storage.ref('ProductsImages').child(images[i].name).getDownloadURL().then(fireBaseUrl => {
                                    images_urls.push(fireBaseUrl);
                                    if(images.length === i+1){
                                        uploadImageResolve();
                                    }
                                });
                            });
                        }
                    });

                    //when upload finish...
                    uploadImagesPromise.then(tasks => {
                        let urlsReq = '';
                        images_urls.forEach(url => {
                            urlsReq += (url + ",");
                        });
                        urlsReq = urlsReq.slice(0, -1);
                        //create a json body
                        jsonReq.push({
                            title,
                            category,
                            subCategory,
                            color,
                            price,
                            xs, s, m, l, xl, xxl, xxxl,
                            description,
                            urlsReq
                        });
                        if(this.state.colors.length === i+1)
                        {
                            resolve();
                        }
                    });
                }
            });
        });
        if(!hasColor)
        {
            alert("Please add at least one color.");
            return;
        }
        colorsPromise.then(async () => {
            await axios({
                method: "POST",
                url: configData.server_URI + "/admin/addItem",
                params: {
                    items: JSON.stringify(jsonReq)
                }
            });
            const progressValue = (this.state.transferdBytes / this.state.totalBytes) * 100;
            if(Number(progressValue.toFixed(0)) === 100)
            {
                alert("successfully added new product to shop.");
                e.target.reset();
                this.setState({
                    colors: [""],
                    transferdBytes: 0,
                    totalBytes: 1
                });
            }
            e.target.disabled = false;
        });
    }

    render() {
        let colors = [], colorsDetails = [], availableCategories = [], availableSubCategories = [];

        //available categories
        this.state.categories.forEach((category, i)=>{
            availableCategories.push(<option key={i} value={category}>{category}</option>);
        });

        this.state.subCategories.forEach((subCategory, i)=>{
            availableSubCategories.push(<option key={i} value={subCategory}>{subCategory}</option>);
        });
        
        this.state.colors.forEach((color, i)=>{
            colors.push(<input key={i} className="inputValue" type="text" value={color} onChange={(e)=>this.changeColorValue(i, e)}/>);
            if(color !== ""){
                colorsDetails.push(
                    <div key={i} className="SpecificColorDetails">
                        <p className="colorBaseTitle">{this.state.colors[i]}</p>

                        <div className="inputRowData">
                            <p className="inputMainTitle">Images *</p>
                            <input className="inputValue" type="file" name={color+"Images"} multiple={true} accept="image/*" />
                        </div>
                        
                        <div className="inputRowData">
                            <p className="inputMainTitle">Price *</p>
                            <input className="inputValue" type="number" defaultValue="0" name={color+"Price"}/>
                        </div>

                        <div className="inputRowData">
                            <p className="inputMainTitle">XS Quantity *</p>
                            <input className="inputValue" type="number" defaultValue="0" name={color+"XSQuantity"}/>
                        </div>

                        <div className="inputRowData">
                            <p className="inputMainTitle">S Quantity *</p>
                            <input className="inputValue" type="number" defaultValue="0" name={color+"SQuantity"}/>
                        </div>
                        
                        <div className="inputRowData">
                            <p className="inputMainTitle">M Quantity *</p>
                            <input className="inputValue" type="number" defaultValue="0" name={color+"MQuantity"}/>
                        </div>

                        <div className="inputRowData">
                            <p className="inputMainTitle">L Quantity *</p>
                            <input className="inputValue" type="number" defaultValue="0" name={color+"LQuantity"}/>
                        </div>

                        <div className="inputRowData">
                            <p className="inputMainTitle">XL Quantity *</p>
                            <input className="inputValue" type="number" defaultValue="0" name={color+"XLQuantity"}/>
                        </div>

                        <div className="inputRowData">
                            <p className="inputMainTitle">XXL Quantity *</p>
                            <input className="inputValue" type="number" defaultValue="0" name={color+"XXLQuantity"}/>
                        </div>

                        <div className="inputRowData">
                            <p className="inputMainTitle">XXXL Quantity *</p>
                            <input className="inputValue" type="number" defaultValue="0" name={color+"XXXLQuantity"}/>
                        </div>

                        <div className="inputRowData">
                            <p className="inputMainTitle">Description</p>
                            <textarea className="inputValue" rows="15" aria-invalid="false" name={color+"Description"}/>
                        </div>
                    </div>
                );
            }
        });
        return (
        <div className="Admin">
            <AdminBar />
            <div className="AdminContent">
                <p className="AdminPageMainTitle">Add New Product</p>

                <form onSubmit={this.addProductSubmitBtn}>

                    <div className="inputRowData">
                        <p className="inputMainTitle">Product Title *</p>
                        <input className="inputValue" type="text" name="ProductTitle"/>
                    </div>

                    <div className="inputRowData">
                        <p className="inputMainTitle">Category *</p>
                        <select className="inputValue" name="ProductCategory" >
                            {availableCategories}
                        </select>
                    </div>

                    <div className="inputRowData">
                        <p className="inputMainTitle">SubCategory *</p>
                        <select className="inputValue" name="ProductSubCategory">
                            {availableSubCategories}
                        </select>
                    </div>

                    <div className="inputRowData">
                        <p className="inputMainTitle">Color *</p>
                        <div className="inputs">
                            {colors}
                        </div>
                        <button className="inputRowBtn" onClick={this.newColorHandle}>add another color</button>
                    </div>

                    {colorsDetails}

                    <button className="inputSubmitBtn" type="submit">Add</button>

                </form>

            </div>
        </div>
        );
    }
}

export default AdminAddItem;