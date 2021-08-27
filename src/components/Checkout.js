import React, { Component } from "react";
import axios from 'axios';
import configData from "../includes/config.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCcPaypal } from '@fortawesome/free-brands-svg-icons';
import BtnLoading from "../images/colors_loading_btn.gif";
import { faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import "../css/Checkout.css";

class Checkout extends Component
{

    constructor()
    {
        super();
        this.state = {
            cart: [],
            cartAsJson: null,
            paypalItems: null,
            subtotal: 0,
            shipping: 0,
            cartQuantity: 0,
            first_name: "",
            last_name: "",
            phone_number: "",
            street_address: "",
            city: "",
            zip_code: "",
            fnameError_display: "none",
            lnameError_display: "none",
            phoneError_display: "none",
            streetError_display: "none",
            zipError_display: "none",
            payment_method: "Paypal",
            loadingPlaceOrderBtn: false
        }

        this.paymentOptionClick = this.paymentOptionClick.bind(this);
        this.handleFirstnameChange = this.handleFirstnameChange.bind(this);
        this.handleLastnameChange = this.handleLastnameChange.bind(this);
        this.handlePhoneNumberChange = this.handlePhoneNumberChange.bind(this);
        this.handleStreetChange = this.handleStreetChange.bind(this);
        this.handleCityChange = this.handleCityChange.bind(this);
        this.handleZipCodeChange = this.handleZipCodeChange.bind(this);
        this.placeOrderBtnHandle = this.placeOrderBtnHandle.bind(this);
    }

    componentDidMount()
    {
        window.scrollTo(0, 0);
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        if(!accountID)
        {
            alert("Please Login first.");
            this.props.history.push("/login");
        }
        else //if logged in get cart from database
        {
            this.getAccountInfo();
            this.getShipping();
            this.getCart();
        }
    }

    async getShipping()
    {
        const response = await axios({
            method: 'GET',
            url: configData.server_URI + '/getShipping'
        });
        this.setState({
            shipping: response.data.cost
        });
    }

    async getAccountInfo()
    {
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        const response = await axios({
            method: 'POST',
            url: configData.server_URI + '/getAccount',
            params: {
                id: accountID
            }
        });
        this.setState({
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            phone_number: response.data.phone_number,
            city: response.data.city,
            street_address: response.data.street,
            zip_code: response.data.zipcode+""
        });
    }

    async getCart()
    {
        let subtotal = 0;
        let cartAsJson = [];
        let paypalItems = [];
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        const response = await axios({
            method: 'GET',
            url: configData.server_URI + '/getCart',
            params: {
                id: accountID
            }
        });
        response.data.forEach(product=>{
            if(product.quantity_added > 0)
            {
                const node = {pid: product.pid, size: product.size, quantity: product.quantity_added};
                const paypal_node = {name: product.name+" - "+product.size.toUpperCase(), price: product.price+"", quantity: product.quantity_added, currency: "ILS"};
                cartAsJson.push(node);
                paypalItems.push(paypal_node);
            }
            subtotal += product.quantity_added * product.price;
        });
        paypalItems.push({name: "Shipping", price: this.state.shipping+"", quantity: 1, currency: "ILS"});
        if(!response.data.length || subtotal === 0)
        {
            alert("Cart is Empty!");
            this.props.history.push("/cart");
            return;
        }
        this.setState({
            cart: response.data,
            cartAsJson,
            paypalItems,
            cartQuantity: response.data.length,
            subtotal
        });
    }

    paymentOptionClick(e)
    {
        this.setState({
            payment_method: e.target.value
        });
    }

    handleFirstnameChange(e)
    {
        const value = e.target.value;
        let display;
        if(value.length < 2 || value.length > 50)
        {
            e.target.style.border = "1px solid red";
            display = "block";
        }
        else
        {
            e.target.style.border = "1px solid #e7e7e7";
            display = "none";
        }
        this.setState({
            first_name: e.target.value,
            fnameError_display: display
        });
    }

    handleLastnameChange(e)
    {
        const value = e.target.value;
        let display;
        if(value.length < 2 || value.length > 50)
        {
            e.target.style.border = "1px solid red";
            display = "block";
        }
        else
        {
            e.target.style.border = "1px solid #e7e7e7";
            display = "none";
        }
        this.setState({
            last_name: e.target.value,
            lnameError_display: display
        });
    }

    handlePhoneNumberChange(e)
    {
        const value = e.target.value;
        let display;
        var regex = /^0(5[^7]|[2-4]|[8-9]|7[0-9])[0-9]{7}$/;
        if(!regex.test(value))
        {
            e.target.style.border = "1px solid red";
            display = "block";
        }
        else
        {
            e.target.style.border = "1px solid #e7e7e7";
            display = "none";
        }
        this.setState({
            phone_number: e.target.value,
            phoneError_display: display
        });
    }

    handleStreetChange(e)
    {
        const value = e.target.value;
        let display;
        if(value.length < 5 || value.length > 120)
        {
            e.target.style.border = "1px solid red";
            display = "block";
        }
        else
        {
            e.target.style.border = "1px solid #e7e7e7";
            display = "none";
        }
        this.setState({
            street_address: e.target.value,
            streetError_display: display
        });
    }

    handleCityChange(e)
    {
        this.setState({
            city: e.target.value
        });
    }

    handleZipCodeChange(e)
    {
        const value = e.target.value;
        let display;
        const regex = /^\d{7}$/;
        if(!regex.test(value))
        {
            e.target.style.border = "1px solid red";
            display = "block";
        }
        else
        {
            e.target.style.border = "1px solid #e7e7e7";
            display = "none";
        }
        this.setState({
            zip_code: e.target.value,
            zipError_display: display
        });
    }

    async placeOrderBtnHandle(e)
    {
        e.target.disabled = true;
        const first_name = this.state.first_name;
        const last_name = this.state.last_name;
        const phone_number = this.state.phone_number;
        const city = this.state.city;
        const street = this.state.street_address;
        const zip_code = this.state.zip_code;
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        if(!first_name.length || !last_name.length || !phone_number.length || !city.length || !street.length || !zip_code.length)
        {
            alert("Please fill in all the required fields.");
            return;
        }
        if(this.state.fnameError_display === "block" || this.state.lnameError_display === "block" ||
           this.state.phoneError_display === "block" || this.state.streetError_display === "block" ||
           this.state.zipError_display === "block")
        {
            return;
        }
        this.setState({
            loadingPlaceOrderBtn: true
        });
        this.updateAddressInDB();
        if(this.state.payment_method === "Cash")
        {
            await this.placeOrder();
            this.props.history.push("/thankyou");
        }
        else if(this.state.payment_method === "Paypal")
        {
            const response = await axios({
                method: 'POST',
                url: configData.server_URI + '/paypal_pay',
                params: {
                    items: JSON.stringify(this.state.paypalItems),
                    total: this.getTotalPrice(),
                    id: accountID
                }
            });
            window.location.href = response.request.responseURL;
        }
    }

    async placeOrder()
    {
        const first_name = this.state.first_name;
        const last_name = this.state.last_name;
        const phone_number = this.state.phone_number;
        const city = this.state.city;
        const street = this.state.street_address;
        const zip_code = this.state.zip_code;
        const cartAsJson = this.state.cartAsJson;
        const payment = this.state.payment_method;
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        await axios({
            method: 'GET',
            url: configData.server_URI + '/insertOrder',
            params: {
                id: accountID,
                first_name,
                last_name,
                phone_number,
                city,
                street,
                zip_code,
                cart: JSON.stringify(cartAsJson),
                payment
            }
        });
    }

    async updateAddressInDB()
    {
        const first_name = this.state.first_name;
        const last_name = this.state.last_name;
        const phone_number = this.state.phone_number;
        const city = this.state.city;
        const street = this.state.street_address;
        const zip_code = this.state.zip_code;
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        await axios({
            method: 'GET',
            url: configData.server_URI + '/updateAccountInfo',
            params: {
                id: accountID,
                first_name,
                last_name,
                phone_number,
                city,
                street,
                zip_code
            }
        });
    }

    getTotalPrice()
    {
        return this.state.subtotal + this.state.shipping;
    }

    render() {
        return (
        <div className="Checkout">
            <div className="checkoutLeft">
                <div className="address_Section">
                    <form className="addressDetails" onChange={this.handleAddressChange}>
                        <p className="formTitle">Shipping Address</p>
                        
                        <div className="addressDetailsRow">
                            <label className="addressDetailName">First name *</label>
                            <input className="addressDetailsInput" type="text" value={this.state.first_name} onChange={this.handleFirstnameChange}/>
                            <p className="errorMessage" style={{display: this.state.fnameError_display}}>First Name should contain 2-50 characters</p>
                        </div>

                        <div className="addressDetailsRow">
                            <label className="addressDetailName">Last name *</label>
                            <input className="addressDetailsInput" type="text" value={this.state.last_name} onChange={this.handleLastnameChange}/>
                            <p className="errorMessage" style={{display: this.state.lnameError_display}}>Last Name should contain 2-50 characters</p>
                        </div>

                        <div className="addressDetailsRow">
                            <label className="addressDetailName">Phone Number *</label>
                            <input className="addressDetailsInput" type="number" placeholder="For example: 0501234567" value={this.state.phone_number} onChange={this.handlePhoneNumberChange}/>
                            <p className="errorMessage" style={{display: this.state.phoneError_display}}>Invalid phone number</p>
                        </div>

                        <div className="addressDetailsRow">
                            <label className="addressDetailName">City *</label>
                            <input className="addressDetailsInput" type="text" value={this.state.city} onChange={this.handleCityChange}/>
                        </div>

                        <div className="addressDetailsRow">
                            <label className="addressDetailName">Street Address *</label>
                            <input className="addressDetailsInput" type="text" placeholder="Street Address, Apartment, suite, unit etc." value={this.state.street_address} onChange={this.handleStreetChange}/>
                            <p className="errorMessage" style={{display: this.state.streetError_display}}>Street Address should contain 5-120 characters.</p>
                        </div>

                        <div className="addressDetailsRow">
                            <label className="addressDetailName">Post/Zip Code *</label>
                            <input className="addressDetailsInput" type="number" value={this.state.zip_code} onChange={this.handleZipCodeChange}/>
                            <p className="errorMessage" style={{display: this.state.zipError_display}}>ZIP/Postal Code should be a 7-digit number, e.g. 1234567</p>
                        </div>
                    </form>
                </div>
                <div className="payment_section">
                    <p className="payment_Title">Payment Method</p>

                    <label style={{display: "block"}}>
                        <div className="payment_option">
                            <input type="radio" className="payment_radio" name="paymentMethod" value="Paypal" onChange={this.paymentOptionClick} checked={this.state.payment_method === "Paypal"}/>
                            <div className="payment_value">
                                <FontAwesomeIcon className="payment_icon" icon={faCcPaypal} size="2x" style={{color: "#3b7bbf"}}/>
                                <div className="payment_desc">
                                    <span className="payment_name">Paypal</span>
                                    <span className="payment_info">If you don't have a paypal account,you can also pay via paypal with your credit card or bank debit card. Payment can be submitted in any currency!</span>
                                </div>
                            </div>
                        </div>
                    </label>

                    <label style={{display: "block"}}>
                        <div className="payment_option">
                            <input type="radio" className="payment_radio" name="paymentMethod" value="Cash" onChange={this.paymentOptionClick} checked={this.state.payment_method === "Cash"}/>
                            <div className="payment_value">
                                <FontAwesomeIcon className="payment_icon" icon={faMoneyBillWave} size="2x" style={{color: "#85bb65"}}/>
                                <div className="payment_desc">
                                    <span className="payment_name">Cash</span>
                                    <span className="payment_info">cash payment method</span>
                                </div>
                            </div>
                        </div>
                    </label>

                </div>

            </div>
            <div className="checkoutRight">
                <p className="orderRightTitle">Order Summary</p>
                <div className="subTotalFields">

                    <div className="orderTotalsField">
                        <label className="orderTotalKey">Subtotal:</label>
                        <label className="orderTotalValue">&#8362;{this.state.subtotal.toLocaleString()}</label>
                    </div>

                    <div className="orderTotalsField">
                        <label className="orderTotalKey">Shipping:</label>
                        <label className="orderTotalValue">&#8362;{this.state.shipping.toLocaleString()}</label>
                    </div>

                </div>

                <div className="TotalLastField">
                    <div className="orderTotalsField">
                        <label className="orderTotalKey">Total:</label>
                        <label className="orderTotalValue">&#8362;{this.getTotalPrice().toLocaleString()}</label>
                    </div>
                </div>

                <div className="CouponSection">
                    <input type="text" className="CouponInput" placeholder="Coupon Code"/>
                    <button className="CouponBtn">Apply</button>
                </div>
                <button className="CheckoutBtn" onClick={this.placeOrderBtnHandle}>
                    {this.state.loadingPlaceOrderBtn ? <img src={BtnLoading} height="100%" alt=""/> : "Place Order"}
                </button>
            </div>
        </div>
        );
    }
}

export default Checkout;