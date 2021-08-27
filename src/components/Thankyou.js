import React, { Component } from "react";
import Thanks from "../images/thanks.jpg"
import axios from 'axios';
import configData from "../includes/config.json";
import "../css/Thankyou.css";

class Thankyou extends Component
{

  constructor()
  {
    super();
    this.state = {
      first_name: "",
      last_name: ""
    }
  }

  componentDidMount()
  {
    window.scrollTo(0, 0);
    const accountID = localStorage.getItem("itsBluzaLoggedId");
    if(!accountID)
    {
      this.props.history.push("/");
      return;
    }
    this.getAccountDetails();
  }

  async getAccountDetails()
  {
    const accountID = localStorage.getItem("itsBluzaLoggedId");
    const response = await axios({
      method: 'GET',
      url: configData.server_URI + '/getOrders',
      params: {
          id: accountID
      }
    });
    if(response.data[0])
    {
      this.setState({
        first_name: response.data[0].first_name,
        last_name: response.data[0].last_name
      });
    }
    else
    {
      this.props.history.push("/");
    }
  }

  render() {
    return (
      <div className="Thankyou">
            <p className="topic_name">{this.state.first_name} {this.state.last_name}</p>
            <p className="thanks_msg">Thank you for your purchase!</p>
            <p className="message">Hi {this.state.first_name}, we're getting your order ready to be shipped. We will notify you when its has been send.</p>
            <img src={Thanks} className="thanks_image" alt=""/>
      </div>
    );
  }
}

export default Thankyou;