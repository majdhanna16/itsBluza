import React, { Component } from "react";
import axios from 'axios';
import configData from "../includes/config.json";
import AdminBar from "./AdminBar";
import BtnLoading from "../images/colors_loading_btn.gif";
import "../admin/css/common.css";

class AdminAddCategory extends Component
{   

    constructor()
    {
        super();

        this.state = {
            loadingAddBtn: false
        }

        this.addCategorySubmitBtn = this.addCategorySubmitBtn.bind(this);
    }

    async componentDidMount()
    {
        await this.checkIfAdmin();  
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

    addCategorySubmitBtn(e)
    {
        e.preventDefault();
        const category_name = e.target.category_name.value;
        const category_image = e.target.category_image.files;
        //check inputs
        if(category_name === '' || !category_image.length)
        {
            alert("Please fill in all the required fields.");
            return;
        }
        this.setState({
            loadingAddBtn: true
        });

        const imageData = new FormData();
        imageData.append('name', category_image[0].name);
        imageData.append('file', category_image[0]);

        axios.post(configData.server_URI + "/uploadImage", imageData).then(async(result) => {
            await axios({
                method: 'POST',
                url: configData.server_URI + '/admin/addCategory',
                params: {
                    name: category_name,
                    path: result.data[0].path
                }
            });
            e.target.reset();
            this.setState({
                loadingAddBtn: false
            });
            alert("successfully added new category.");
        });
    }

    render() {
        return (
        <div className="Admin">
            <AdminBar />
            <div className="AdminContent">
                <p className="AdminPageMainTitle">Add New Category</p>

                <form onSubmit={this.addCategorySubmitBtn}>

                    <div className="inputRowData">
                        <p className="inputMainTitle">Category name *</p>
                        <input className="inputValue" type="text" name="category_name"/>
                    </div>

                    <div className="inputRowData">
                        <p className="inputMainTitle">Image *</p>
                        <input className="inputValue" type="file" name="category_image" multiple={false} accept="image/*" />
                    </div>

                    <button className="inputSubmitBtn" type="submit">
                        {this.state.loadingAddBtn ? <img src={BtnLoading} height="100%" alt=""/> : "Add"}
                    </button>

                </form>

            </div>
        </div>
        );
    }
}

export default AdminAddCategory;