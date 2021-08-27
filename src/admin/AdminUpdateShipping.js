import React, { Component } from "react";
import axios from 'axios';
import configData from "../includes/config.json";
import AdminBar from "./AdminBar";
import "../admin/css/common.css";

class AdminAddItem extends Component
{
   
    constructor()
    {
        super();
        this.state = {
            shipping: 40
        }
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

    updateShippingValueBtn(e)
    {
        const shipping = e.target.Shipping_val.value;
        if(shipping === '' || Number(shipping) < 0)
        {
            alert("Please fill in all the required fields.");
            return;
        }
    }

    render() {
        return (
        <div className="Admin">
            <AdminBar />
            <div className="AdminContent">
                <p className="AdminPageMainTitle">Update shipping</p>

                <form onSubmit={this.updateShippingValueBtn}>

                    <div className="inputRowData">
                        <p className="inputMainTitle">Current shipping value</p>
                        <p>{this.state.shipping}</p>
                    </div>

                    <div className="inputRowData">
                        <p className="inputMainTitle">Shipping Value *</p>
                        <input className="inputValue" type="number" name="Shipping_val"/>
                    </div>

                    <button className="inputSubmitBtn" type="submit">Update</button>

                </form>

            </div>
        </div>
        );
    }
}

export default AdminAddItem;