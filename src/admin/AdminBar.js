import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import MediaQuery from "react-responsive";
import "../admin/css/AdminBar.css";

class AdminBar extends Component
{

    onMenuBtnClick(e)
    {
        const dropDown = e.target.parentNode.querySelector(".AdminBarSection");
        if(dropDown.style.display === "none")
            dropDown.style.display = "block";
        else
            dropDown.style.display = "none";
    }

    render() {

        const Links = <div>
            <NavLink to="/Admin">Home</NavLink>
            <NavLink to="/Admin/additem">Add new product</NavLink>
            <NavLink to="/Admin/addcategory">Add new category</NavLink>
            <NavLink to="/Admin/addsubcategory">Add new subcategory</NavLink>
            <NavLink to="/Admin/updateshipping">Update shipping</NavLink>
            <NavLink to="/Admin/updateabout">Update About</NavLink>
            <NavLink to="/Admin/removeproduct">Remove product</NavLink>
        </div>

        return (
            <div className="AdminBar">
                <MediaQuery maxWidth={767}>
                    <button className="menuDropDownBtn" onClick={this.onMenuBtnClick}>Menu</button>
                    <div style={{display: "none"}} className="AdminBarSection">
                        {Links}
                    </div>
                </MediaQuery>
                
                <MediaQuery minWidth={768}>
                    <div className="AdminBarSection">
                        {Links}
                    </div>
                </MediaQuery>
            </div>
        );
    }
}

export default AdminBar;