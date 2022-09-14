import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import configData from "../includes/config.json";
import { NavLink } from "react-router-dom";
import LoadingGif from "../images/colors_loading.gif";
import "../css/Shop.css";
import noProductsFound from "../images/no-products-found.png";

class Shop extends Component
{

    constructor()
    {
        super();
        this.state = {
            mainCategory: 'ALL',
            subCategoryFilter: [],
            sizeFilter: [],
            colorFilter: [],
            products: [<img key={0} src={LoadingGif} width="250px" alt=""/>],
            availableCategories: [],
            availableSubCategories: [],
            availableColors: []
        }

        this.onCatDropDownClick = this.onCatDropDownClick.bind(this);
        this.onSubCatDropDownClick = this.onSubCatDropDownClick.bind(this);
        this.onsizeFilterDropDownClick = this.onsizeFilterDropDownClick.bind(this);
        this.oncolorFilterDropDownClick = this.oncolorFilterDropDownClick.bind(this);
        this.clearFiltersBtnHandle = this.clearFiltersBtnHandle.bind(this);
        this.addQuery = this.addQuery.bind(this);
        this.removeQuery = this.removeQuery.bind(this);
        this.getQuery = this.getQuery.bind(this);
        this.onRouteChange = this.onRouteChange.bind(this);
    }

    componentDidUpdate(prevProps)
    {
        if(this.props.location !== prevProps.location)
            this.onRouteChange();
    }

    async componentDidMount()
    {
        window.scrollTo(0, 0);
        await this.updateCategories();
        this.onRouteChange();
    }

    updateCategories(){
        let availableCategories = ["ALL"];
        axios({
            method: 'GET',
            url: configData.server_URI + '/get/categories'
        }).then((response)=>{
            response.data.forEach(category=>{
                availableCategories.push(category.category_name);
            });
        });
        this.setState({
            availableCategories
        });
    }

    clearFiltersBtnHandle()
    {
        this.setState({
            subCategoryFilter: [],
            sizeFilter: [],
            colorFilter: []
        });
        this.props.history.push({search: ""});
    }

    updateShop()
    {
        this.updateProducts();
    }

    updateProducts()
    {
        axios({
            method: 'GET',
            url: configData.server_URI + '/get/products'
        }).then((response)=>{
            let products = [];
            let availableSubCategories = [];
            let availableColors = [];
            response.data.forEach(product=>{
                //add available left bar data
                if(product.sub_category && !availableSubCategories.includes(product.sub_category))
                    availableSubCategories.push(product.sub_category);
                if(!availableColors.includes(product.color))
                    availableColors.push(product.color);
                //check filters
                if(this.state.mainCategory !== "ALL")
                {
                    if(product.main_category.toLowerCase() !== this.state.mainCategory.toLowerCase())
                        return;
                }
                if(this.state.subCategoryFilter.length)
                {
                    if(product.sub_category == null || !this.state.subCategoryFilter.includes(product.sub_category.toUpperCase()))
                        return;
                }
                if(this.state.colorFilter.length)
                {
                    if(!this.state.colorFilter.includes(product.color.toUpperCase()))
                        return;
                }
                let isSizeFound = false;
                this.state.sizeFilter.forEach(filter=>{
                    switch(filter)
                    {
                        case "XS":
                            if(product.xs > 0)
                                isSizeFound = true;
                            break;
                        case "S":
                            if(product.s > 0)
                                isSizeFound = true;
                            break;
                        case "M":
                            if(product.m > 0)
                                isSizeFound = true;
                            break;
                        case "L":
                            if(product.l > 0)
                                isSizeFound = true;
                            break;
                        case "XL":
                            if(product.xl > 0)
                                isSizeFound = true;
                            break;
                        case "XXL":
                            if(product.xxl > 0)
                                isSizeFound = true;
                            break;
                        case "XXXL":
                            if(product.xxxl > 0)
                                isSizeFound = true;
                            break;
                        default:
                            break;
                    }
                    if(isSizeFound)
                        return;
                });
                if(this.state.sizeFilter.length && !isSizeFound)
                    return;

                //make a product card
                let saleTag = "";
                let prevPrice = "";
                const link_path = "/product/" + product.pid;
                if(product.prev_price)
                {
                    saleTag = <span className="shopProductCardOnSaleTag">Sale</span>;
                    prevPrice = <label className="shopProductCardBSPrice">&#36;{product.prev_price.toFixed(2)}</label>;
                }
                products.push(
                    <NavLink key={product.pid} className="shopProductCardLink" to={link_path}>
                        <div className="shopProductCard">
                            <div className="shopProductCardImageSpace">
                                {saleTag}
                                <img className="shopProductCardImage" src={configData.server_URI+"\\"+product.images.split(",")[0]} alt=""/>
                            </div>
                            <p className="shopProductCardTitle">{product.name}</p>
                            <div className="shopProductCardPriceSpace">
                                {prevPrice}
                                <label className="shopProductCardPrice">&#36;{product.price.toFixed(2)}</label>
                            </div>
                        </div>
                    </NavLink>
                );
            });
            this.setState({
                products,
                availableSubCategories,
                availableColors
            });
        });
    }

    onRouteChange()
    {
        let mainCategory, sizeFilter, colorFilter, subCategoryFilter;
        if(this.props.match.params.category)
            mainCategory = this.props.match.params.category;
        else
            mainCategory = "ALL";

        if(this.getQuery("filter_subCats"))
            subCategoryFilter = this.getQuery("filter_subCats").split(",");
        else
            subCategoryFilter = [];
            
        if(this.getQuery("filter_size"))
            sizeFilter = this.getQuery("filter_size").split(",");
        else
            sizeFilter = [];

        if(this.getQuery("filter_color"))
            colorFilter = this.getQuery("filter_color").split(",");
        else
            colorFilter = [];

        this.setState({
            mainCategory,
            subCategoryFilter,
            sizeFilter,
            colorFilter
        }, this.updateShop);
    }

    addQuery = (key, value) => {
        let pathname = this.props.location.pathname;
        let searchParams = new URLSearchParams(this.props.location.search);
        searchParams.set(key, value);
        this.props.history.push({
            pathname: pathname,
            search: decodeURIComponent(searchParams.toString())
        });
    }

    removeQuery = (key) => {
        let pathname = this.props.location.pathname;
        let searchParams = new URLSearchParams(this.props.location.search);
        searchParams.delete(key);
        this.props.history.push({
            pathname: pathname,
            search: searchParams.toString()
        });
    }

    getQuery = (key) => {
        let searchParams = new URLSearchParams(this.props.location.search);
        return searchParams.get(key);
    }

    onCatDropDownClick(e)
    {
        this.setState({mainCategory: e.target.innerText});
        if(this.props.location.pathname !== "/shop/" + e.target.innerText)
        {
            this.props.history.push({
                pathname: "/shop/" + e.target.innerText,
                search: this.props.location.search
            });
        }
    }

    onSubCatDropDownClick(e)
    {
        let filter = this.state.subCategoryFilter;
        if(filter.includes(e.target.innerText))
            filter.splice(filter.indexOf(e.target.innerText), 1);
        else
            filter.push(e.target.innerText);
        this.setState({subCategoryFilter: filter});
        
        if(filter.length)
            this.addQuery("filter_subCats", filter);
        else
            this.removeQuery("filter_subCats");
    }

    onsizeFilterDropDownClick(e)
    {
        let filter = this.state.sizeFilter;
        if(filter.includes(e.target.innerText))
            filter.splice(filter.indexOf(e.target.innerText), 1);
        else
            filter.push(e.target.innerText);
        this.setState({sizeFilter: filter});
        
        if(filter.length)
            this.addQuery("filter_size", filter);
        else
            this.removeQuery("filter_size");
    }

    oncolorFilterDropDownClick(e)
    {
        let filter = this.state.colorFilter;
        if(filter.includes(e.target.innerText))
            filter.splice(filter.indexOf(e.target.innerText), 1);
        else
            filter.push(e.target.innerText);
        this.setState({colorFilter: filter});

        if(filter.length)
            this.addQuery("filter_color", filter);
        else
            this.removeQuery("filter_color");
    }

    dropDownToggleHandle(e)
    {
        let dropDown = e.target.parentNode.querySelector('.dropDown');
        if(dropDown.style.display !== "none")
            dropDown.style.display = "none";
        else
            dropDown.style.display = "block";
    }

    render() {
        let activeFilters = [], filtersSection, availableCats = [], availableSubCats= [], available_colors = [], no_products_found = null;
        this.state.subCategoryFilter.forEach(filter=>{
            activeFilters.push(<label key={filter} className="activeFilterLabel">{filter}</label>);
        });

        this.state.sizeFilter.forEach(filter=>{
            activeFilters.push(<label key={filter} className="activeFilterLabel">{filter}</label>);
        });

        this.state.colorFilter.forEach(filter=>{
            activeFilters.push(<label key={filter} className="activeFilterLabel">{filter}</label>);
        });

        if(activeFilters.length)
        {
            filtersSection = 
            <div className="filtersSection">
                <p className="activeFiltersTitle"><FontAwesomeIcon icon={faStar} /> Active Filters</p>
                {activeFilters}
                <button className="clearFiltersBtn" onClick={this.clearFiltersBtnHandle}>Clear Filters</button>
            </div>
        }

        this.state.availableCategories.forEach(category=>{
            let name = "none";
            if(this.state.mainCategory === category.toUpperCase())
                name = "active";
            availableCats.push(
                <button key={this.state.availableCategories.indexOf(category)} className={name} onClick={this.onCatDropDownClick}>{category}</button>
            );
        });

        this.state.availableSubCategories.forEach(subCategory=>{
            let name = "none";
            if(this.state.subCategoryFilter.includes(subCategory.toUpperCase()))
                name = "active";
            availableSubCats.push(
                <button key={this.state.availableSubCategories.indexOf(subCategory)} className={name} onClick={this.onSubCatDropDownClick}>{subCategory}</button>
            );
        });

        this.state.availableColors.forEach(color=>{
            let name = "none";
            if(this.state.colorFilter.includes(color.toUpperCase()))
                name = "active";
            available_colors.push(
                <button key={this.state.availableColors.indexOf(color)} className={name} onClick={this.oncolorFilterDropDownClick}>{color}</button>
            );
        });

        if(this.state.products.length === 0)
        {
            no_products_found = <div className="Empty_shop">
                <img src={noProductsFound} alt=""/> 
            </div>;
        }

        return (
        <div className="Shop">
            <div className="ShopLeft">
                <div className="shopLeftContent">
                    <button className="dropDownBtn" onClick={this.dropDownToggleHandle}>Categories</button>
                    <div className="dropDown">
                        {availableCats}
                    </div>
                </div>

                <div className="shopLeftContent">
                    <button className="dropDownBtn" onClick={this.dropDownToggleHandle}>Sub Categories</button>
                    <div className="dropDown">
                        {availableSubCats}
                    </div>
                </div>

                <div className="shopLeftContent">
                    <button className="dropDownBtn" onClick={this.dropDownToggleHandle}>Filter By Size</button>
                    <div className="dropDown">
                        <button className={this.state.sizeFilter.includes("XS") ? "active" : "null"} onClick={this.onsizeFilterDropDownClick}>XS</button>
                        <button className={this.state.sizeFilter.includes("S") ? "active" : "null"} onClick={this.onsizeFilterDropDownClick}>S</button>
                        <button className={this.state.sizeFilter.includes("M") ? "active" : "null"} onClick={this.onsizeFilterDropDownClick}>M</button>
                        <button className={this.state.sizeFilter.includes("L") ? "active" : "null"} onClick={this.onsizeFilterDropDownClick}>L</button>
                        <button className={this.state.sizeFilter.includes("XL") ? "active" : "null"} onClick={this.onsizeFilterDropDownClick}>XL</button>
                        <button className={this.state.sizeFilter.includes("XXL") ? "active" : "null"} onClick={this.onsizeFilterDropDownClick}>XXL</button>
                        <button className={this.state.sizeFilter.includes("XXXL") ? "active" : "null"} onClick={this.onsizeFilterDropDownClick}>XXXL</button>
                    </div>
                </div>

                <div className="shopLeftContent">
                    <button className="dropDownBtn" onClick={this.dropDownToggleHandle}>Filter By Color</button>
                    <div className="dropDown">
                        {available_colors}
                    </div>
                </div>
            </div>

            <div className="ShopRight">

                <div className="ShopTopBar">
                    <label className="CategoryName">{this.state.mainCategory}</label>
                </div>

                {filtersSection}

                <div className="ShopContent">
                    {this.state.products}
                    {no_products_found}
                </div>

            </div>

        </div>
        );
    }
}

export default Shop;