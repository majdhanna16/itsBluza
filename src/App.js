import React, { Component } from "react";
import { Switch, Route} from "react-router-dom";

import Header from "./components/Header";
import Home from "./components/Home";
import Shop from "./components/Shop";
import Product from "./components/Product";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Contact from "./components/Contact";
import Thankyou from "./components/Thankyou";
import BottomBar from "./components/BottomBar";
import ErrorPage from "./components/ErrorPage";

import Admin from "./admin/Home";
import AdminAddItem from "./admin/AdminAddItem";
import AdminAddCategory from "./admin/AdminAddCategory";
import AdminAddSubCategory from "./admin/AdminAddSubCategory";
import AdminUpdateShipping from "./admin/AdminUpdateShipping";

import 'font-awesome/css/font-awesome.min.css';

class App extends Component
{

  constructor()
  {
    super();
    this.state = {
      loggedId: localStorage.getItem("itsBluzaLoggedId")
    }

    this.login = this.login.bind(this);
    this.loggout = this.loggout.bind(this);

  }

  login(id)
  {
    localStorage.setItem("itsBluzaLoggedId", id)
    this.setState({
      loggedId: id
    });
  }

  loggout()
  {
    localStorage.removeItem("itsBluzaLoggedId");
    this.setState({
      loggedId: null
    });
  }

  render() {
    return (
      <div className="App">
        <Header id={this.state.loggedId} cartInfo={this.state.updateCartInfo}/>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/shop" component={Shop}/>
          <Route path="/shop/:category" component={Shop}/>
          <Route path="/product/:pid" component={Product}/>
          <Route path="/login" component={(props) => (<Login {...props} login={this.login} />)}/>
          <Route exact path="/profile" component={(props) => (<Profile {...props} loggout={this.loggout} />)}/>
          <Route path="/profile/:page" component={(props) => (<Profile {...props} loggout={this.loggout} />)}/>
          <Route path="/contact" component={Contact}/>
          <Route path="/cart" component={Cart}/>
          <Route path="/thankyou" component={Thankyou}/>
          <Route path="/checkout" component={Checkout}/>

          <Route exact path="/admin" component={Admin}/>
          <Route path="/admin/additem" component={AdminAddItem}/>
          <Route path="/admin/addcategory" component={AdminAddCategory}/>
          <Route path="/admin/addsubcategory" component={AdminAddSubCategory}/>
          <Route path="/admin/updateshipping" component={AdminUpdateShipping}/>
          <Route path="/" component={ErrorPage}/>
        </Switch>
        <BottomBar/>
      </div>
    );
  }
}

export default App;