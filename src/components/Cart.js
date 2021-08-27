import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import axios from 'axios';
import configData from "../includes/config.json";
import { makeMessage } from "../includes/functions";
import "../css/Cart.css";
import emptyCart from "../images/empty-cart.png";
import LoadingGif from "../images/colors_loading.gif";
import MediaQuery from "react-responsive";

class Cart extends Component
{
    constructor()
    {
        super();
        this.state = {
            productsInCart: [<img key={0} src={LoadingGif} width="250px" style={{display: "block", margin: "auto"}} alt=""/>],
            subtotal: 0,
            shipping: 0,
            message: null,
            cartQuantity: 0
        }

        this.quantityPlusHandle = this.quantityPlusHandle.bind(this);
        this.quantityMinusHandle = this.quantityMinusHandle.bind(this);
        this.removeProduct = this.removeProduct.bind(this);
        this.checkoutBtnHandle = this.checkoutBtnHandle.bind(this);
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
            this.getCart();
            this.getShipping();
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

    async getCart()
    {
        let productsInCart = [];
        let subtotal = 0;
        let shouldUpdateDB = false;
        let rowsToUpdate = [];
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        const response = await axios({
            method: 'GET',
            url: configData.server_URI + '/getCart',
            params: {
                id: accountID
            }
        });
        response.data.forEach(product => {
            const images = product.images.split(",");
            let max_quantity, quantity_section;
            switch (product.size)
            {
                case "xs":
                    max_quantity = product.xs;
                    break;
                case "s":
                    max_quantity = product.s;
                    break;
                case "m":
                    max_quantity = product.m;
                    break;
                case "l":
                    max_quantity = product.l;
                    break;
                case "xl":
                    max_quantity = product.xl;
                    break;
                case "xxl":
                    max_quantity = product.xxl;
                    break;
                case "xxxl":
                    max_quantity = product.xxxl;
                    break;
                default:
                    max_quantity = 0;
            }
            let quantity;
            if(product.quantity_added <= max_quantity)
            {
                quantity = product.quantity_added;
            }
            else
            {
                quantity = max_quantity;
                shouldUpdateDB = true;
                rowsToUpdate.push({cid: product.cid, quantity: max_quantity});
            }
            if(max_quantity !== 0)
            {
                quantity_section = <div className="QuantitySpace">
                    <button className="quantityPlus" onClick={this.quantityPlusHandle} max_quantity={max_quantity}>+</button>
                    <input className="quantityViewer" type="text" value={quantity} readOnly/>
                    <button className="quantityMinus" onClick={this.quantityMinusHandle}>-</button>
                </div>;
            }
            else
            {
                quantity_section = <p className="outOfStock">Out of Stock</p>;
            }
            const link = "/product/" + product.pid;
            productsInCart.push(
                <div key={product.cid} className="productInCart" id={product.pid}>
                    <div className="buttonImage">
                        <button className="removeProdutBtn" onClick={this.removeProduct} cart_id={product.cid} p_name={product.name}>x</button>
                        <NavLink to={link}>
                            <img className="productInCartImage" src={images[0]} alt=""/>
                        </NavLink>
                    </div>
                    <NavLink to={link} className="ProductInCartName" product_size={product.size}>{product.name} - {product.color}, {product.size}</NavLink>
                    <div className="mobileLineSpace">
                        <MediaQuery maxWidth={767}><label className="mobileLeftTitle">Price:</label></MediaQuery>
                        <label className="productInCartPrice">{product.price.toLocaleString()}</label>
                    </div>
                    <div className="mobileLineSpace">
                        <MediaQuery maxWidth={767}><label className="mobileLeftTitle">Quantity:</label></MediaQuery>
                        {quantity_section}
                    </div>
                    <div className="mobileLineSpace">
                        <MediaQuery maxWidth={767}><label className="mobileLeftTitle">Total:</label></MediaQuery>
                        <label className="productInCartTotalPrice">{(quantity * product.price).toLocaleString()}</label>
                    </div>
                </div>
            );
            subtotal += (quantity * product.price);
        });
        this.setState({
            productsInCart,
            subtotal,
            cartQuantity: productsInCart.length
        });
        if(shouldUpdateDB)
        {
            this.updateDB(rowsToUpdate);
        }
    }

    async updateDB(carts)
    {
        await axios({
            method: 'GET',
            url: configData.server_URI + '/updateCartByCid',
            params: {
                carts: JSON.stringify(carts)
            }
        });
    }

    async quantityPlusHandle(e)
    {
        if(Number(e.target.parentNode.querySelector(".quantityViewer").value) >= Number(e.target.getAttribute("max_quantity")))
        {
            this.setState({
                message: makeMessage("Cart", "You have reached the maximum quantity for this product", "#e2401c")
            });
            window.scrollTo(0, 0);
            return;
        }
        e.target.disabled = true;
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        const pid = e.target.parentNode.parentNode.parentNode.id;
        const size = e.target.parentNode.parentNode.parentNode.querySelector(".ProductInCartName").getAttribute("product_size");
        await axios({
            method: 'GET',
            url: configData.server_URI + '/updateCart',
            params: {
                id: accountID,
                pid: pid,
                size: size,
                func: 1
            }
        });
        this.getCart();
        e.target.disabled = false;
    }

    async removeProduct(e)
    {
        e.target.disabled = true;
        await axios({
            method: 'GET',
            url: configData.server_URI + '/removeFromCart',
            params: {
                cid: e.target.getAttribute("cart_id")
            }
        });
        this.getCart();
        e.target.disabled = false;
        this.setState({
            message: makeMessage("Cart", "“"+ e.target.getAttribute("p_name") +"” removed.", "#0f834d")
        });
        window.scrollTo(0, 0);
    }

    async quantityMinusHandle(e)
    {
        if(Number(e.target.parentNode.querySelector(".quantityViewer").value) <= 0)
        {
            return;
        }
        e.target.disabled = true;
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        const pid = e.target.parentNode.parentNode.parentNode.id;
        const size = e.target.parentNode.parentNode.parentNode.querySelector(".ProductInCartName").getAttribute("product_size");
        await axios({
            method: 'GET',
            url: configData.server_URI + '/updateCart',
            params: {
                id: accountID,
                pid: pid,
                size: size,
                func: 0
            }
        });
        this.getCart();
        e.target.disabled = false;
    }

    checkoutBtnHandle(e)
    {
        e.preventDefault();
        if(this.state.cartQuantity === 0 || this.state.subtotal === 0)
        {
            alert('Cart is empty!');
            return;
        }
        this.props.history.push("/checkout");
    }

    render() {
        let empty_cart, shipping_cost;
        if(this.state.productsInCart.length === 0)
        {
            empty_cart = <img className="Empty_cart" src={emptyCart} alt=""/>;
        }
        if(this.state.subtotal !== 0)
        {
            shipping_cost = <div className="CartTotalsField">
                <label className="CartTotalKey">Shipping:</label>
                <label className="CartTotalValue">&#8362;{this.state.shipping.toLocaleString()}</label>
            </div>;
        }
        return (
            <div>
                {this.state.message}
                <div className="Cart">
                    <div className="CartLeft">
                        {this.state.productsInCart}
                        {empty_cart}
                    </div>
                    <div className="CartRight">
                        <p className="cartRightTitle">Cart Totals</p>
                        <div className="subTotalFields">

                            <div className="CartTotalsField">
                                <label className="CartTotalKey">Subtotal:</label>
                                <label className="CartTotalValue">&#8362;{this.state.subtotal.toLocaleString()}</label>
                            </div>

                            {shipping_cost}

                        </div>
                        <div className="TotalLastField">
                            <div className="CartTotalsField">
                                <label className="CartTotalKey">Total:</label>
                                <label className="CartTotalValue">&#8362;{(this.state.subtotal !== 0 ? (this.state.subtotal + this.state.shipping).toLocaleString() : 0 )}</label>
                            </div>
                        </div>
                        <button className="CheckoutBtn" onClick={this.checkoutBtnHandle}>Proceed to checkout</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Cart;