import React, { Component } from "react";
import axios from 'axios';
import configData from "../includes/config.json";
import { NavLink } from "react-router-dom";
import dateFormat from 'dateformat';
import "../css/Profile.css";
import emptyEishList from "../images/wishlist-empty.jpg";
import BtnLoading from "../images/colors_loading_btn.gif";
import { makeMessage } from "../includes/functions";
import LoadingGif from "../images/colors_loading.gif";
import { getFormattedPhoneNum } from "../includes/functions"

class Profile extends Component
{

    constructor(props)
    {
        super(props);
        this.state = {
            id: localStorage.getItem("itsBluzaLoggedId"),
            wishlist: [<img key={0} src={LoadingGif} width="200px" alt=""/>],
            wishlist_limit: 5,
            wishlist_count: 0,
            orders: [<img key={0} src={LoadingGif} width="200px" alt=""/>],
            orders_count: 0,
            page: this.props.match.params.page ? Number(this.props.match.params.page) : 0,
            username: "",
            about: [],
            correct_password: "",
            message: null,
            loadingUpdateEmail: false,
            loadingUpdateUsername: false,
            loadingUpdatePassword: false
        }

        this.loggout = this.loggout.bind(this);
        this.updateEmail = this.updateEmail.bind(this);
        this.updateUsername = this.updateUsername.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.removeWishlistItem = this.removeWishlistItem.bind(this);
        this.onWishlistBtnClick = this.onWishlistBtnClick.bind(this);
        this.onOrdersBtnClick = this.onOrdersBtnClick.bind(this);
        this.onPersonalInfoBtnClick = this.onPersonalInfoBtnClick.bind(this);
        this.wishlistLoadMoreBtn = this.wishlistLoadMoreBtn.bind(this);
    }

    async componentDidMount()
    {
        window.scrollTo(0, 0);
        if(!this.state.id)
        {
            this.props.history.push("/");
            return;
        }
        await this.getOrders();
        await this.getAbout();
        await this.getWishlist();
    }

    async getOrders()
    {
        const response = await axios({
            method: 'GET',
            url: configData.server_URI + '/getOrders',
            params: {
                id: this.state.id
            }
        });
        this.setState({
            orders_count: response.data.length
        });
        if(response.data.length === 0)
        {
            const no_orders = 
                <div className="noOrdersDiv">
                    <p className="noOrdersTitle">No orders found</p>
                    <NavLink to="/shop">Go to shop</NavLink>
                </div>;
            this.setState({
                orders: no_orders
            });
            return;
        }
        let bags = [];
        response.data.forEach(async order=>{
            let productsInBag = [];
            const cartResponse = await axios({
                method: 'GET',
                url: configData.server_URI + '/getInsideCart',
                params: {
                    cart: order.cart
                }
            });
            cartResponse.data.forEach(product=>{
                const link_path = "/product/" + product.pid;
                const images = product.images.split(",");
                const details = this.cartDetailsByPid(order.cart, product.pid);
                let item_details = [];
                details.forEach((detail, i) => {
                    item_details.push(
                    <p style={{margin: 0, fontSize: "12px"}} key={i}>
                        Size:
                        <label style={{fontWeight: "600"}}> {detail.size.toUpperCase()} </label>
                        <label style={{fontSize: "12px"}}>x</label>
                        <label style={{fontWeight: "600"}}> {detail.quantity}</label>
                    </p>
                    );
                });
                productsInBag.push(
                    <NavLink key={product.pid} to={link_path}>
                    <div className="orderProduct">
                            <img className="orderProductImage" src={configData.server_URI+"\\"+images[0]} alt=""/>
                            <div className="orderProductDetails">
                                <p className="orderProductName">{product.name}</p>
                                {item_details}
                            </div>
                        </div>
                    </NavLink>
                );
            });
            bags.push(
                <div key={order.oid} className="orderBag">
                    {productsInBag}
                    <button className="reOrderBtn" onClick={()=>{this.onReorderBtnHandle(order.cart)}}>Reorder</button>
                </div>
            );
            this.setState({
                orders: bags
            });
        });        
    }

    async onReorderBtnHandle(prev_order)
    {
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        await axios({
            method: 'GET',
            url: configData.server_URI + '/insertMultipleToCart',
            params: {
                id: accountID,
                items: prev_order
            }
        });
        this.setState({
            message: makeMessage("Cart", "Your previous order has been added to cart", "#0f834d", "View cart", "cart")
        }); 
        window.scrollTo(0, 0);
    }

    cartDetailsByPid(cart, pid)
    {
        let res = [];
        JSON.parse(cart).forEach(product=>
        {
            if(product.pid  === pid)
            {
                res.push({size: product.size, quantity: product.quantity});
            }
        });
        return res;
    }

    async getAbout()
    {
        let about = [];
        const response = await axios({
            method: 'POST',
            url: configData.server_URI + '/getAccount',
            params: {
                id: this.state.id
            }
        });
        if(response.data.first_name)
        {
            about.push(
                <div key={response.data.first_name} className="AboutField">
                    <label className="AboutTitle">Name:</label>
                    <label className="AboutContent">{response.data.first_name +" "+ response.data.last_name}</label>
                </div>
            );
        }
        about.push(
            <div key={response.data.email} className="AboutField">
                <label className="AboutTitle">Email:</label>
                <label className="AboutContent">{response.data.email}</label>
            </div>
        );
        about.push(
            <div key={response.data.joined_date} className="AboutField">
                <label className="AboutTitle">Joined In:</label>
                <label className="AboutContent">{dateFormat(response.data.joined_date, "dddd, mmmm dS, yyyy")}</label>
            </div>
        );
        if(response.data.phone_number)
        {
            about.push(
                <div key={response.data.phone_number} className="AboutField">
                    <label className="AboutTitle">Phone number:</label>
                    <label className="AboutContent">{getFormattedPhoneNum(response.data.phone_number)}</label>
                </div>
            );
        }
        about.push(
            <div key="orders_count" className="AboutField">
                <label className="AboutTitle">Orders</label>
                <label className="AboutContent">{this.state.orders_count}</label>
            </div>
        );
        this.setState({
            username: response.data.username,
            about,
            correct_password: {
                iv: response.data.password_iv,
                encryptedData: response.data.password
            }
        });
    }

    async getWishlist()
    {
        const response = await axios({
            method: 'GET',
            url: configData.server_URI + '/getWishlist',
            params: {
                id: this.state.id,
                limit: this.state.wishlist_limit
            }
        });
        let products = [];
        response.data.forEach(product=>{
            let saleTag = "";
            let prevPrice = "";
            const link_path = "/product/" + product.pid;
            if(product.prev_price)
            {
                saleTag = <span className="productCardOnSaleTag">Sale</span>;
                prevPrice = <label className="productCardBSPrice">&#8362;{product.prev_price.toFixed(2)}</label>;
            }
            products.push(
                <NavLink key={product.pid} className="wishlistProductCardLink" to={link_path}>
                    <div className="wishlistProductCard">
                        <div className="productCardImageSpace">
                            {saleTag}
                            <img className="productCardImage" src={configData.server_URI+"\\"+product.images.split(",")[0]} alt=""/>
                        </div>
                        <p className="productCardTitle">{product.name}</p>
                        <div className="productCardPriceSpace">
                            {prevPrice}
                            <label className="productCardPrice">&#8362;{product.price.toFixed(2)}</label>
                        </div>
                        <div className="wishlistItemBtns">
                            <button className="wishlistItemRemoveBtn" pid={product.pid} onClick={this.removeWishlistItem}>Remove</button>
                        </div>
                    </div>
                </NavLink>
            );
        });
        const wishlist_count = products.length;
        if(!wishlist_count)
        {
            products.push(<img key={0} className="emptyWishListImg" src={emptyEishList} alt="" />);
        }
        this.setState({
            wishlist: products,
            wishlist_count
        });
    }

    async removeWishlistItem(e)
    {
        e.preventDefault();
        const pid = e.target.getAttribute("pid");
        await axios({
            method: 'GET',
            url: configData.server_URI + '/removeItemFromWishlist',
            params: {
                id: this.state.id,
                pid: pid
            }
        });
        this.getWishlist();
    }

    loggout()
    {
        this.props.loggout();
        this.props.history.push("/");
    }

    async updateEmail(e)
    {
        e.preventDefault();
        const email = e.target.new_email.value;
        if(email === "")
        {
            alert("Please fill in all the required fields.");
            return;
        }
        this.setState({
            loadingUpdateEmail: true
        });
        await axios({
            method: 'POST',
            url: configData.server_URI + '/updateEmail',
            params: {
                id: this.state.id,
                email
            }
        });
        alert("Account email successfully updated.");
        e.target.reset();
        this.setState({
            loadingUpdateEmail: false
        });
    }

    async updateUsername(e)
    {
        e.preventDefault();
        const username = e.target.new_username.value;
        if(username === "")
        {
            alert("Please fill in all the required fields.");
            return;
        }
        this.setState({
            loadingUpdateUsername: true
        });
        await axios({
            method: 'POST',
            url: configData.server_URI + '/updateUsername',
            params: {
                id: this.state.id,
                username
            }
        });
        alert("Account username successfully updated.");
        e.target.reset();
        this.setState({
            loadingUpdateUsername: false
        });
    }

    async updatePassword(e)
    {
        e.preventDefault();
        const old_password = e.target.old_password.value;
        const new_password = e.target.new_password.value;
        const confirm_password = e.target.confirm_password.value;
        if(old_password === "" || new_password === "" || confirm_password === "")
        {
            alert("Please fill in all the required fields.");
            return;
        }
        else if(new_password !== confirm_password)
        {
            alert("Password and confirm password does not match.");
            return;
        }
        this.setState({
            loadingUpdatePassword: true
        });
        const response = await axios({
            method: 'POST',
            url: configData.server_URI + '/updatePassword',
            params: {
                id: this.state.id,
                password: new_password,
                correct_password: JSON.stringify(this.state.correct_password),
                entered_old_password: old_password
            }
        });
        if(response.data.affectedRows)
        {
            alert("Account password successfully updated.");
            this.getAbout();
        }
        else
            alert("The old password you have entered is incorrect.");
        e.target.reset();
        this.setState({
            loadingUpdatePassword: false
        });
    }

    onWishlistBtnClick()
    {
        this.setState({
            page: 0
        });
        this.props.history.push({
            pathname: "/profile",
        });
    }

    onOrdersBtnClick()
    {
        this.setState({
            page: 1
        });
        this.props.history.push({
            pathname: "/profile/1",
        });
    }


    onPersonalInfoBtnClick()
    {
        this.setState({
            page: 2
        });
        this.props.history.push({
            pathname: "/profile/2",
        });
    }

    wishlistLoadMoreBtn()
    {
        this.setState({
            wishlist_limit: this.state.wishlist_limit + 5
        }, this.getWishlist);
    }

    render() {
        let profileContent, wishlistLoadMoreBtn;
        if(this.state.wishlist_count)
        {
            wishlistLoadMoreBtn = <button className="wishlistLoadMoreBtn" onClick={this.wishlistLoadMoreBtn}>Load more</button>;
        }
        if(this.state.page === 0) //wishlist
        {
            profileContent = 
            <div className="ProfileMainContent">
                <p className="ProfileMainBaseTitle">Wishlist</p>
                <div className="wishlistItems">
                    {this.state.wishlist}
                </div>
                {wishlistLoadMoreBtn}
            </div>;
        }
        else if(this.state.page === 1)
        {
            profileContent =
            <div className="ProfileMainContent">
                <p className="ProfileMainBaseTitle">Orders</p>
                <div className="ordersItems">
                    {this.state.orders}
                </div>
            </div>;
        }
        else if(this.state.page === 2) //personal information
        {
            profileContent = 
            <div className="ProfileMainContent">
                <p className="ProfileMainBaseTitle">Personal information</p>

                <form className="changeDetails" onSubmit={this.updateEmail}>
                    <p className="formTitle">Update Email</p>
                    <div className="changeDetailsRow">
                        <label className="changeDetailName">New Email *</label>
                        <input className="changeDetailsInput" name="new_email" type="email"/>
                    </div>
                    <button className="ProfileSubmitBtn" type="submit">
                        {this.state.loadingUpdateEmail ? <img src={BtnLoading} height="100%" alt=""/> : "Update Email"}
                    </button>
                </form>

                <form className="changeDetails" onSubmit={this.updateUsername}>
                    <p className="formTitle">Update Username</p>
                    <div className="changeDetailsRow">
                        <label className="changeDetailName">New Username *</label>
                        <input className="changeDetailsInput" name="new_username" type="text"/>
                    </div>
                    <button className="ProfileSubmitBtn" type="submit">
                        {this.state.loadingUpdateUsername ? <img src={BtnLoading} height="100%" alt=""/> : "Update Username"}
                    </button>
                </form>

                <form className="changeDetails" onSubmit={this.updatePassword}>
                    <p className="formTitle">Update Password *</p>
                    <div className="changeDetailsRow">
                        <label className="changeDetailName">Old password *</label>
                        <input className="changeDetailsInput" name="old_password" type="password"/>
                    </div>
                    <div className="changeDetailsRow">
                        <label className="changeDetailName">New password *</label>
                        <input className="changeDetailsInput" name="new_password" type="password"/>
                    </div>
                    <div className="changeDetailsRow">
                        <label className="changeDetailName">Confirm new password *</label>
                        <input className="changeDetailsInput" name="confirm_password" type="password"/>
                    </div>
                    <button className="ProfileSubmitBtn" type="submit">
                        {this.state.loadingUpdatePassword ? <img src={BtnLoading} height="100%" alt=""/> : "Update Password"}
                    </button>
                </form>

            </div>;
        }
        return (
        <div className="Profile">
            <div className="ProfileLeft">
                <p className="profileUsername">@{this.state.username}</p>
                <div className="About">
                    <p className="AboutBaseTitle">About</p>
                    {this.state.about}
                </div>
                {this.state.message}
                {profileContent}
            </div>
            <div className="ProfileRight">
                <button onClick={this.onWishlistBtnClick}>wishlist</button>
                <button onClick={this.onOrdersBtnClick}>Orders</button>
                <button onClick={this.onPersonalInfoBtnClick}>Personal information</button>
                <button onClick={this.loggout}>Loggout</button>
            </div>
        </div>
        );
    }
}

export default Profile;