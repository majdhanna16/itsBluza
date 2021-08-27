import React, { Component } from "react";
import axios from 'axios';
import configData from "../includes/config.json";
import "../css/Login.css";

class Login extends Component
{

    constructor(props)
    {
        super(props);
        this.state = {
            Title: "Login",
            toggleTitle: "Don't have an account ?",
            note: "",
            passwordError_display: "none",
            usernameError_display: "none"
        }

        this.ToggleBtnHandle = this.ToggleBtnHandle.bind(this);
        this.onRegisterBtnClick = this.onRegisterBtnClick.bind(this);
        this.onLoginBtnClick = this.onLoginBtnClick.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onUsernameChange = this.onUsernameChange.bind(this);

    }

    componentDidMount()
    {
        window.scrollTo(0, 0);
    }

    ToggleBtnHandle(e)
    {
        this.reset_form();
        if(this.state.Title === "Login") //change to register
        {
            this.setState({
                Title: "Register",
                toggleTitle: "Already have an account"
            });
            e.target.innerText = "Login";
        }
        else //change to login
        {
            this.setState({
                Title: "Login",
                toggleTitle: "Don't have an account ?"
            });
            e.target.innerText = "Register";
        }
    }

    reset_form()
    {
        this.LoginForm.reset();
        this.LoginForm.childNodes.forEach(child=>{
            if(child.querySelector(".fieldInput"))
            {
                child.querySelector(".fieldInput").style.border = "1px solid #e7e7e7";
            }
        });
        this.setState({
            usernameError_display: "none",
            passwordError_display: "none",
            note: ""
        });
    }

    onLoginBtnClick(e)
    {
        e.preventDefault();
        const data = e.target;
        if(!data.usernameOrEmail.value || !data.password.value)
        {
            this.setState({
                note: "Please fill in all the required fields."
            });
            return;
        }
        axios({
            method: 'POST',
            url: configData.server_URI + '/login',
            params: {
                usernameOrEmail: data.usernameOrEmail.value,
                password: data.password.value
            }
          }).then((response)=>{
            if(response.data.id)
            {
                this.props.login(response.data.id);
                this.props.history.goBack();
            }
            else
            {
                this.setState({
                    note: response.data
                });
            }
        });
    }

    onRegisterBtnClick(e)
    {
        e.preventDefault();
        const data = e.target;
        if(!data.username.value || !data.email.value || !data.password.value || !data.repassword.value)
        {
            this.setState({
                note: "Please fill in all the required fields."
            });
            return;
        }
        if(this.state.usernameError_display === "block" || this.state.passwordError_display === "block")
        {
            return;
        }
        if(data.password.value !== data.repassword.value)
        {
            this.setState({
                note: "Password and confirm password does not match"
            });
            return;
        }
        axios({
            method: 'POST',
            url: configData.server_URI + '/register',
            params: {
                username: data.username.value,
                email: data.email.value,
                password: data.password.value
            }
            }).then((response)=>{
                if(response.data.affectedRows && response.data.affectedRows > 0)
                {
                    this.props.login(response.data.insertId);
                    this.props.history.goBack();
                }
                else
                {
                    this.setState({
                        note: response.data
                    });
                }
          });
    }

    onUsernameChange(e)
    {
        const value = e.target.value;
        let display;
        if(value.length < 6 || value.length > 50)
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
            usernameError_display: display
        });
    }

    onPasswordChange(e)
    {
        const value = e.target.value;
        let display;
        if(value.length < 8 || value.length > 32)
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
            passwordError_display: display
        });
    }

    render() {
        let formContent;
        if(this.state.Title === "Login")
        {
            formContent = 
            <form ref={(el)=> this.LoginForm = el} onSubmit={this.onLoginBtnClick}>
                <div className="fieldContent">
                    <p className="fieldTitle">Username Or Email *</p>
                    <input className="fieldInput" name="usernameOrEmail" type="text" placeholder="Username Or Email"/>
                </div>
                <div className="fieldContent">
                    <p className="fieldTitle">Password *</p>
                    <input className="fieldInput" name="password" type="password" placeholder="Password"/>
                </div>
                <input className="LoginBtn" type="submit" value="Login" />
            </form>
        }
        else if(this.state.Title === "Register")
        {
            formContent = 
            <form ref={(el)=> this.LoginForm = el} onSubmit={this.onRegisterBtnClick}>
                <div className="fieldContent">
                    <p className="fieldTitle">Username *</p>
                    <input className="fieldInput" name="username" type="text" placeholder="Username" onChange={this.onUsernameChange}/>
                    <p className="LoginInputNote" style={{display: this.state.usernameError_display}}>Username should contain 6-50 characters</p>
                </div>
                <div className="fieldContent">
                    <p className="fieldTitle">Email *</p>
                    <input className="fieldInput" name="email" type="email" placeholder="Email"/>
                </div>
                <div className="fieldContent">
                    <p className="fieldTitle">Password *</p>
                    <input className="fieldInput" name="password" type="password" placeholder="Password" onChange={this.onPasswordChange}/>
                    <p className="LoginInputNote" style={{display: this.state.passwordError_display}}>Password should contain 8-32 characters</p>
                </div>
                <div className="fieldContent">
                    <p className="fieldTitle">Confirm Password *</p>
                    <input className="fieldInput" name="repassword" type="password" placeholder="Confirm password"/>
                </div>
                <input className="LoginBtn" type="submit" value="Register"/>
            </form>
        }
        return (
            <div className="Login">
                <div className="LoginSection">
                    <p className="LoginTitle">{this.state.Title}</p>
                    <div className="LoginContent">
                        <p className="noteMsg">{this.state.note}</p>
                        {formContent}
                    </div>
                    <div className="ToggleSection">
                        <p className="ToggleTitle">{this.state.toggleTitle}</p>
                        <button className="ToggleBtn" onClick={this.ToggleBtnHandle}>Register</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;