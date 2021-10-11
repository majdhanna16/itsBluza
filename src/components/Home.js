import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import axios from 'axios';
import configData from "../includes/config.json";
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'
import LoadingGif from "../images/colors_loading.gif";
import slide1 from "../images/slides/slide1.jpg";
import slide2 from "../images/slides/slide2.jpg";
import slide3 from "../images/slides/slide3.jpg";
import "../css/Home.css";

class Home extends Component
{

  constructor()
  {
    super();
    this.state = {
      categories: [<img key={0} src={LoadingGif} width="150px" alt=""/>],
      products: [<img key={0} src={LoadingGif} width="200px" alt=""/>]
    }

    this.onHomeProductsBtnClick = this.onHomeProductsBtnClick.bind(this);
  }

  componentDidMount()
  { 
    window.scrollTo(0, 0);
    this.getCategories(4);
    this.getProducts(10);

  }

  getCategories(limit)
  {
    axios({
      method: 'GET',
      url: configData.server_URI + '/get/categories',
      params: {
        limit
      }
    }).then((response)=>{
      let categories = [];
      response.data.forEach(category=>{
        const link = "/shop/" + category.category_name.toUpperCase();
        categories.push(
          <NavLink key={category.cid} to={link}>
              <img className="homeCatLogo" src={configData.server_URI+"\\"+category.category_image_path} alt=""/>
              <label className="homeCatName">{category.category_name}</label>
          </NavLink>
        );

      });
      this.setState({categories});
    });
  }

  getProducts(limit, func)
  {
    axios({
      method: 'GET',
      url: configData.server_URI + '/get/products',
      params: {
        limit,
        func
      }
    }).then((response)=>{
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
          <NavLink key={product.pid} className="homeProductCardLink" to={link_path}>
            <div className="homeProductCard">
              <div className="productCardImageSpace">
                {saleTag}
                <img className="productCardImage" src={configData.server_URI+"\\"+product.images.split(",")[0]} alt=""/>
              </div>
              <p className="productCardTitle">{product.name}</p>
              <div className="productCardPriceSpace">
                {prevPrice}
                <label className="productCardPrice">&#8362;{product.price.toFixed(2)}</label>
              </div>
            </div>
          </NavLink>
        );

      });
      this.setState({products});
    });
  }
  
  onHomeProductsBtnClick(e)
  {
    var arr = Array.prototype.slice.call( e.target.parentNode.children )
    arr.forEach(btn=>{
      btn.style.color = "#999";
    });
    e.target.style.color = "#000";
    this.getProducts(10, e.target.value);
  }


  Slideshow = () => {
    const slideImages = [
      slide1,
      slide2,
      slide3
    ];
    return (
      <div className="slide-container">
        <Slide>
          <div className="each-slide">
            <div style={{'backgroundImage': `url(${slideImages[0]})`}}>
            </div>
          </div>
          <div className="each-slide">
            <div style={{'backgroundImage': `url(${slideImages[1]})`}}>
            </div>
          </div>
          <div className="each-slide">
            <div style={{'backgroundImage': `url(${slideImages[2]})`}}>
            </div>
          </div>
        </Slide>
      </div>
    )
  }

  render() {

    return (
      <div className="Home">

        {this.Slideshow()};
        
        <div className="HomeContent">
          <div className="homeCategories">
            {this.state.categories}
          </div>
          <div className="homeProductsviewer">
            <div className="homeProductsBtns">
              <button onClick={this.onHomeProductsBtnClick} value={0} style={{color: "#000"}}>New</button>
              <button onClick={this.onHomeProductsBtnClick} value={1}>On Sale</button>
              <button onClick={this.onHomeProductsBtnClick} value={2}>Old</button>
            </div>
            <div className="homeProductsViewerContent">
              {this.state.products}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;