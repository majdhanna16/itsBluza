import React, { Component } from "react";
import axios from 'axios';
import configData from "../includes/config.json";
import AdminBar from "./AdminBar";
import "../admin/css/common.css";

class Home extends Component
{

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

    render() {
        return (
        <div className="Admin">
            <AdminBar />
            <div className="AdminContent">
                Home
            </div>
        </div>
        );
    }
}

export default Home;