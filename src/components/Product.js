import React, { Component } from "react";
import InnerImageZoom from 'react-inner-image-zoom'
import axios from 'axios';
import configData from "../includes/config.json";
import { makeMessage } from "../includes/functions";
import BtnLoading from "../images/colors_loading_btn.gif";
import LoadingGif from "../images/colors_loading.gif";
import "../css/styles.css";
import "../css/Product.css";

class Product extends Component
{

    constructor()
    {
        super();
        this.state = {
            pid: null,
            productTitle: "",
            main_image: "",
            mini_images: [],
            price: 0,
            prev_price: null,
            colors: [],
            sizes: [],
            description: "",
            bottomContent: 'Description',
            choosedColor: "",
            choosedSize: "",
            message: null,
            reviews: [<img key={0} src={LoadingGif} width="200px" style={{display: "block", margin: "auto"}} alt=""/>],
            reviews_count: 0,
            nameError_display: "none",
            loadingAddtoCart: false,
            loadingAddtoWishlist: false,
            loadingSubmitReviewBtn: false
        };

        this.onMiniImageClick = this.onMiniImageClick.bind(this);
        this.deatilsTopBarBtnHandle = this.deatilsTopBarBtnHandle.bind(this);
        this.colorChangeHandle = this.colorChangeHandle.bind(this);
        this.addToCartBtnHandle = this.addToCartBtnHandle.bind(this);
        this.sizeChanged = this.sizeChanged.bind(this);
        this.addReviewSubmitHandle = this.addReviewSubmitHandle.bind(this);
        this.addToWishlistBtnHandle = this.addToWishlistBtnHandle.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
    }

    componentDidUpdate(prevProps)
    {
        if(this.props.location !== prevProps.location)
            this.componentDidMount();
    }

    componentDidMount()
    {
        window.scrollTo(0, 0);
        const pid = this.props.match.params.pid;
        this.setState({
            pid: pid
        }, this.getReviews);
        axios({
            method: 'GET',
            url: configData.server_URI + '/get/product',
            params: {
                pid: pid
            }
        }).then((response)=>{
            if(!response.data.length)
            {
                this.props.history.push("/error");
                return;
            }
            let mini_images = [], availableSizes = [];
            const product = response.data[0];
            const images = product.images.split(",");
            this.getProductColor(product.code, pid);
            images.forEach((image, i)=>{
                mini_images.push(<img key={i} className="miniImage" src={configData.server_URI+"\\"+image} alt="" onClick={this.onMiniImageClick} />);
            });
            if(product.xs > 0)
                availableSizes.push(<option key="xs" value="xs">XS</option>);
            if(product.s > 0)
                availableSizes.push(<option key="s" value="s">S</option>);
            if(product.m > 0)
                availableSizes.push(<option key="m" value="m">M</option>);
            if(product.l > 0)
                availableSizes.push(<option key="l" value="l">L</option>);
            if(product.xl > 0)
                availableSizes.push(<option key="xl" value="xl">XL</option>);
            if(product.xxl > 0)
                availableSizes.push(<option key="xxl" value="xxl">XXL</option>);
            if(product.xxxl > 0)
                availableSizes.push(<option key="xxxl" value="xxxl">XXXL</option>);
            this.setState({
                choosedSize: availableSizes[0].key
            });
            this.setState({
                productTitle: product.name,
                main_image: configData.server_URI+"\\"+images[0],
                mini_images: mini_images,
                price: product.price,
                prev_price: product.prev_price,
                sizes: availableSizes,
                description: product.description ? product.description : "No description"
            })
        });
    }

    getProductColor(code, currPid)
    {
        axios({
            method: 'GET',
            url: configData.server_URI + '/get/productByCode',
            params: {
                code: code
            }
        }).then((response)=>{
            let colors = [];
            response.data.forEach(product=>{
                if(Number(product.pid) === Number(currPid))
                {
                    this.setState({
                        choosedColor: product.color
                    });
                    colors.unshift(<option key={product.color} value={product.pid}>{product.color}</option>);
                }
                else
                    colors.push(<option key={product.color} value={product.pid}>{product.color}</option>);
            });
            this.setState({
                colors
            });
        });
    }

    onMiniImageClick(e)
    {
        this.setState({main_image: e.target.src});
    }

    deatilsTopBarBtnHandle(e)
    {
        let children = [].slice.call(e.target.parentNode.children);
        children.forEach(child => {
            child.style = "none";
        });
        console.log(e.target.value);
        e.target.style.borderBottomColor = "transparent";
        e.target.style.color = "#000";
        this.setState({
            bottomContent: e.target.value
        });
    }

    colorChangeHandle(e)
    {
        this.props.history.push("/product/" + e.target.value);
    }

    sizeChanged(e)
    {
        this.setState({
            choosedSize: e.target.value
        });
    }

    async addToWishlistBtnHandle()
    {
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        if(!accountID) //if not logged in
        {
            this.setState({
                message: makeMessage("Login", "Please Login First", "#e4d00a", "press here to login", "login")
            });
            
            window.scrollTo(0, 0);
            return;
        }
        this.setState({
            loadingAddtoWishlist: true
        });
        const response = await axios({
            method: 'GET',
            url: configData.server_URI + '/addToWishlist',
            params: {
                id: accountID,
                pid: this.state.pid
            }
        });
        if(response.data.affectedRows)
        {
            this.setState({
                message: makeMessage("Wishlist", "“"+this.state.productTitle+"” has been added to your wishlist", "#0f834d", "View wishlist", "profile"),
                loadingAddtoWishlist: false
            });
        }
        else
        {
            this.setState({
                message: makeMessage("Wishlist", "“"+this.state.productTitle+"” already in your wishlist", "#e4d00a", "View wishlist", "profile"),
                loadingAddtoWishlist: false
            });
        }
        window.scrollTo(0, 0);
    }

    async addToCartBtnHandle(e)
    {
        const accountID = localStorage.getItem("itsBluzaLoggedId");
        if(!accountID) //if not logged in
        {
            this.setState({
                message: makeMessage("Login", "Please Login First", "#e4d00a", "press here to login", "login")
            });
            window.scrollTo(0, 0);
            return;
        }
        this.setState({
            loadingAddtoCart: true
        });
        await axios({
            method: 'GET',
            url: configData.server_URI + '/updateCart',
            params: {
                id: accountID,
                pid: this.state.pid,
                size: this.state.choosedSize,
                func: 1
            }
        });
        
        this.setState({
            message: makeMessage("Cart", "“"+this.state.productTitle+"” has been added to your cart", "#0f834d", "View cart", "cart"),
            loadingAddtoCart: false
        });
        window.scrollTo(0, 0);
    }


    async getReviews()
    {
        const response = await axios({
            method: 'GET',
            url: configData.server_URI + '/getReviews',
            params: {
                pid: this.state.pid
            }
        });
        let reviews = [];
        response.data.forEach(review=>{
            reviews.push(
                <div key={review.rid} className="reviewData">
                    <p className="ReviewerName">{review.name}</p>
                    <label className="reviewerComment">{review.content}</label>
                </div>
            );
        });
        if(!response.data.length)
        {
            reviews.push(<p key={0} className="no_reviews">No Reviews Found</p>)
        }
        this.setState({
            reviews,
            reviews_count: response.data.length
        });
    }

    async addReviewSubmitHandle(e)
    {
        e.preventDefault();
        const pid = this.state.pid;
        const rating = 5;
        const name = e.target.reviewerName.value;
        const email = e.target.reviewerEmail.value;
        const comment = e.target.comment.value;
        if(name === "" || email === "" || comment === "")
        {
            alert("Please fill in all the required fields.");
            return;
        }
        if(this.state.nameError_display === "block")
        {
            return;
        }
        this.setState({
            loadingSubmitReviewBtn: true
        });
        await axios({
            method: 'GET',
            url: configData.server_URI + '/addReview',
            params: {
                pid,
                rating,
                name,
                email,
                comment
            }
        });
        e.target.reset();
        this.getReviews();
        this.setState({
            loadingSubmitReviewBtn: false
        });
    }

    onNameChange(e)
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
            nameError_display: display
        });
    }

    render() {
        let detailsContent, previousPriceSection = [];

        if(this.state.bottomContent === "Description")
        {
            detailsContent = 
            <p className="ProductDescription">
                {this.state.description}
            </p>
        }
        else if(this.state.bottomContent === "Reviews")
        {
            detailsContent = 
            <div>
                <div className="reviews">
                    {this.state.reviews}
                </div>
                <form className="addReviewForm" onSubmit={this.addReviewSubmitHandle}>
                    <p className="addReviewBaseTitle">Add Review</p>
                    <div className="addReview">
                        <div className="addReviewData">
                            <p className="addReviewTitle">Your name *</p>
                            <input className="addReviewInput" name="reviewerName" type="text" onChange={this.onNameChange}/>
                            <p className="addReviewInputNote" style={{display: this.state.nameError_display}}>Name should contain 2-50 characters</p>
                        </div>
                        <div className="addReviewData">
                            <p className="addReviewTitle">Email *</p>
                            <input className="addReviewInput" name="reviewerEmail" type="email"/>
                        </div>
                    </div>
                    <div className="addReviewDataMessage">
                            <p className="addReviewTitle">Comment *</p>
                            <textarea  className="addReviewMessage" name="comment" rows="15" aria-invalid="false" ></textarea>
                    </div>
                    <button className="SubmitBtn" type="submit">
                        {this.state.loadingSubmitReviewBtn ? <img src={BtnLoading} height="100%" alt=""/> : "Submit"}
                    </button>
                </form>
            </div>
        }

        if(this.state.prev_price)
        {
            const prevPrice = this.state.prev_price;
            const newPrice = this.state.price;
            let save = (prevPrice - newPrice) / prevPrice * 100;
            previousPriceSection.push(<label key={0} className="PrevPrice">&#36;{this.state.prev_price}</label>);
            previousPriceSection.push(<p key={1} className="savePercent">You'll save {save.toFixed(1)}%</p>);
        }

        return (
            <div>
                {this.state.message}
                <div className="Product">
                    <div className="ProductLeft">
                        <div className="viewImageSpace">
                            <InnerImageZoom className="viewImage" src={this.state.main_image} alt="" zoomScale={2} fullscreenOnMobile={true}/>
                        </div>
                        <div className="miniImages">
                            {this.state.mini_images}
                        </div>
                    </div>

                    <div className="ProductRight">

                        <p className="ProductTitle">{this.state.productTitle}</p>
                        <div className="PricesSpace">
                            <label className="Price">&#36;{this.state.price.toFixed(2)}</label>
                            {previousPriceSection}
                        </div>

                        <div className="optinsSection">

                            <div className="optinContent">
                                <label className="optionName">Color</label>
                                <select className="optionSelect" onChange={this.colorChangeHandle}>
                                    {this.state.colors}
                                </select>
                            </div>

                            <div className="optinContent">
                                <label className="optionName">Size</label>
                                <select className="optionSelect" onChange={this.sizeChanged} value={this.state.choosedSize}>
                                    {this.state.sizes}
                                </select>
                            </div>

                        </div>

                        <div className="ButtonsSection">
                            <button className="addToCartBtn" onClick={this.addToCartBtnHandle}>
                                {this.state.loadingAddtoCart ? <img src={BtnLoading} height="100%" alt=""/> : "Add to cart"}
                            </button>
                            <button className="productBtn" onClick={this.addToWishlistBtnHandle}>
                                {this.state.loadingAddtoWishlist ? <img src={BtnLoading} height="100%" alt=""/> : "Add to wishlist"}
                            </button>
                        </div>

                    </div>

                    <div className="productBottomDetails">
                        <div className="detailsTopBar">
                            <button className="detailsBtns" onClick={this.deatilsTopBarBtnHandle} value="Description" style={{borderBottomColor: "transparent", color: "#000"}}>Description</button>
                            <button className="detailsBtns" onClick={this.deatilsTopBarBtnHandle} value="Reviews">Reviews({this.state.reviews_count})</button>
                        </div>
                        <div className="detailsContent">
                            {detailsContent}
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export default Product;