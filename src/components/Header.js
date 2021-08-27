import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import "../css/Header.css";
import axios from 'axios';
import configData from "../includes/config.json";
import MediaQuery from "react-responsive";
import Logo from "../images/itsBluzaLogo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBars, faUser } from "@fortawesome/free-solid-svg-icons";

class Header extends Component
{
  constructor(props){
    super(props);
    this.state = {
      mobileMenuDisplay: 'none',
      username: ""
    }

    this.onmenuBtnClick = this.onmenuBtnClick.bind(this);
    this.onmenuHeaderRouterClick = this.onmenuHeaderRouterClick.bind(this);
    this.onmenuHeaderBGClick = this.onmenuHeaderBGClick.bind(this);
  }

  componentDidMount()
  {
    if(this.props.id)
    {
      this.getAccountDetails();
    }
  }

  componentDidUpdate(prevProps)
  {
    if(this.props.id !== prevProps.id)
    {
      this.getAccountDetails();
    }
  }

  getAccountDetails()
  {
    if(this.props.id)
    {
      axios({
        method: 'POST',
        url: configData.server_URI + '/getAccount',
        params: {
            id: this.props.id 
        }
      }).then((response)=>{
        this.setState({
          username: response.data.username
        })
      });
    }
    else
    {
      this.setState({
        username: ""
      });
    }
  }

  onmenuBtnClick(){
    this.setState({mobileMenuDisplay: 'block'});
  }

  onmenuHeaderRouterClick(){
    this.setState({mobileMenuDisplay: 'none'});
  }

  onmenuHeaderBGClick(e){
    if(e.target.className === 'menuHeaderBG')
    {
      this.setState({mobileMenuDisplay: 'none'});
    }
  }

  render() {
    let welcomeOrLogin, mobileLogin;
    const headerRouterBtns = 
    <div>
      <NavLink className="HeaderRouterBtn" exact to="/" onClick={this.onmenuHeaderRouterClick}>Home</NavLink>
      <NavLink className="HeaderRouterBtn" to="/shop" onClick={this.onmenuHeaderRouterClick}>Shop</NavLink>
      <NavLink className="HeaderRouterBtn" to="/contact" onClick={this.onmenuHeaderRouterClick}>Contact</NavLink>
    </div>
    if(this.state.username)
    {
      mobileLogin = "/profile";
      welcomeOrLogin = 
      <label>
        <span className="welcomeBtn">Welcome, </span>
        <NavLink className="loginORregisterBtn" to="/profile">{this.state.username}</NavLink>
      </label>
    }
    else
    {
      mobileLogin = "/login";
      welcomeOrLogin = <NavLink className="loginORregisterBtn" to="/login">Login / Register</NavLink>
    }

    return (
      <div className="Header">
          <div className="topBar">
            <MediaQuery minWidth={768}>
              {welcomeOrLogin}
              <div className="topBarRight">
                  <NavLink className="cartHeaderBtn" to="/cart">
                      <FontAwesomeIcon icon={faShoppingCart} />
                      <label> YOUR CART</label>
                  </NavLink>
              </div>
            </MediaQuery>
            <MediaQuery maxWidth={767}>
              <NavLink className="mobileModeHeaderBtn" to={mobileLogin}><FontAwesomeIcon icon={faUser} /></NavLink>
              <NavLink className="mobileModeHeaderBtn" to="/cart"><FontAwesomeIcon icon={faShoppingCart} /></NavLink>
            </MediaQuery>
          </div>
          <div className="RouterHeader">
                <img className="headerLogo" src={Logo} alt=""/>
                <div className="HeaderRouterBtns">
                  <MediaQuery minWidth={768}>
                    {headerRouterBtns}
                  </MediaQuery>
                  <MediaQuery maxWidth={767}>
                      <button className="mobileModeHeaderRouterBtn" onClick={this.onmenuBtnClick}><FontAwesomeIcon icon={faBars} /></button>
                      <div style={{display: this.state.mobileMenuDisplay}} className="menuHeaderBG" onClick={this.onmenuHeaderBGClick}>
                        <div className="menuHeaderBtn">
                          {headerRouterBtns}
                        </div>
                      </div>
                  </MediaQuery>
                </div>
            </div>
      </div>
    );
  }
}

export default Header;