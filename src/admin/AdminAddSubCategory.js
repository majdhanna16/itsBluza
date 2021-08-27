import React, { Component } from "react";
import axios from 'axios';
import configData from "../includes/config.json";
import AdminBar from "./AdminBar";
import BtnLoading from "../images/colors_loading_btn.gif";
import "../admin/css/common.css";

class AdminAddSubCategory extends Component
{   

    constructor()
    {
        super();

        this.state = {
            loadingAddBtn: false
        }

        this.addSubCategorySubmitBtn = this.addSubCategorySubmitBtn.bind(this);
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

    async addSubCategorySubmitBtn(e)
    {
        e.preventDefault();
        const subcategory_name = e.target.subcategory_name.value;
        //check inputs
        if(subcategory_name === '')
        {
            alert("Please fill in all the required fields.");
            return;
        }
        this.setState({
            loadingAddBtn: true
        });
        await axios({
            method: 'POST',
            url: configData.server_URI + '/admin/addSubCategory',
            params: {
                name: subcategory_name
            }
        });
        e.target.reset();
        this.setState({
            loadingAddBtn: false
        });
        alert("successfully added new sub-category.");
    }

    render() {
        return (
        <div className="Admin">
            <AdminBar />
            <div className="AdminContent">
                <p className="AdminPageMainTitle">Add New Sub-Category</p>

                <form onSubmit={this.addSubCategorySubmitBtn}>

                    <div className="inputRowData">
                        <p className="inputMainTitle">Sub-Category name *</p>
                        <input className="inputValue" type="text" name="subcategory_name"/>
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

export default AdminAddSubCategory;