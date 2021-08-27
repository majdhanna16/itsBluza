import React, { Component } from "react";
import errorImage from "../images/error404.jpg";
import { NavLink } from "react-router-dom";
import "../css/ErrorPage.css";

class ErrorPage extends Component
{

  constructor()
  {
    super();

    this.goBackHandle = this.goBackHandle.bind(this);
  }

  componentDidMount()
  {
    window.scrollTo(0, 0);
  }

  goBackHandle()
  {
    this.props.history.goBack();
  }

  render() {
    return (
      <div className="ErrorPage">
          <img className="errorImage" src={errorImage} alt=""/>
          <p className="errorMessage">
            Page doesn’t exist or some other error occured. Go to our
            <br/>
            <NavLink to="/">Home page</NavLink> or go back to <button onClick={this.goBackHandle}>Previous page</button>
          </p>
      </div>
    );
  }
}

export default ErrorPage;