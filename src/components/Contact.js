import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faFacebookMessenger, faInstagram } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import configData from '../includes/config.json';
import BtnLoading from '../images/colors_loading_btn.gif';
import '../css/Contact.css';

class Contact extends Component {
	constructor() {
		super();
		this.state = {
			nameError_display: 'none',
			subjectError_display: 'none',
			loadingSendBtn: false,
		};

		this.getInTouchSubmit = this.getInTouchSubmit.bind(this);
		this.onNameChange = this.onNameChange.bind(this);
		this.onSubjectChange = this.onSubjectChange.bind(this);
	}

	componentDidMount() {
		window.scrollTo(0, 0);
	}

	async getInTouchSubmit(e) {
		e.preventDefault();
		const name = e.target.client_name.value;
		const email = e.target.client_email.value;
		const subject = e.target.subject.value;
		const message = e.target.message.value;
		if (name === '' || email === '' || subject === '' || message === '') {
			alert('Please fill in all the required fields.');
			return;
		}
		if (this.state.nameError_display === 'block' || this.state.subjectError_display === 'block') {
			return;
		}
		this.setState({
			loadingSendBtn: true,
		});
		const response = await axios({
			method: 'GET',
			url: configData.server_URI + '/addContactMessage',
			params: {
				name,
				email,
				subject,
				message,
			},
		});
		e.target.reset();
		this.setState({
			loadingSendBtn: false,
		});
		if (response.data.affectedRows) alert('Your message has been sent successfully.');
	}

	onNameChange(e) {
		const value = e.target.value;
		let display;
		if (value.length < 2 || value.length > 50) {
			e.target.style.border = '1px solid red';
			display = 'block';
		} else {
			e.target.style.border = '1px solid #e7e7e7';
			display = 'none';
		}
		this.setState({
			nameError_display: display,
		});
	}

	onSubjectChange(e) {
		const value = e.target.value;
		let display;
		if (value.length < 2 || value.length > 120) {
			e.target.style.border = '1px solid red';
			display = 'block';
		} else {
			e.target.style.border = '1px solid #e7e7e7';
			display = 'none';
		}
		this.setState({
			subjectError_display: display,
		});
	}

	render() {
		let instagramStyle = {
			background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
			color: '#fff',
			padding: '2px',
			borderRadius: '15px',
			width: '50px',
			height: '50px',
		};
		return (
			<div className="Contact">
				<div className="contactMethods">
					<div className="contactMethod">
						<FontAwesomeIcon style={{ color: '#25D366' }} icon={faWhatsapp} />
						<p>{configData.whatsapp_Number}</p>
					</div>
					{configData.facebook_link.length > 0 && (
						<div className="contactMethod">
							<FontAwesomeIcon style={{ color: '#00c6ff' }} icon={faFacebookMessenger} />
							<p>
								<a href={configData.facebook_link} target="_blank" rel="noopener noreferrer">
									Click Here
								</a>
							</p>
						</div>
					)}

					{configData.instagram_link.length > 0 && (
						<div className="contactMethod">
							<FontAwesomeIcon style={instagramStyle} icon={faInstagram} />
							<p>
								<a href={configData.instagram_link} target="_blank" rel="noopener noreferrer">
									Click Here
								</a>
							</p>
						</div>
					)}
				</div>

				<form className="getInTouchForm" onSubmit={this.getInTouchSubmit}>
					<p className="getInTouchBaseTitle">Get In Touch</p>
					<div className="getInTouch">
						<div className="getInTouchData">
							<p className="getInTouchTitle">Your name</p>
							<input className="getInTouchInput" name="client_name" type="text" onChange={this.onNameChange} />
							<p className="getInTouchInputNote" style={{ display: this.state.nameError_display }}>
								Name should contain 2-50 characters
							</p>
						</div>
						<div className="getInTouchData">
							<p className="getInTouchTitle">Email</p>
							<input className="getInTouchInput" name="client_email" type="email" />
						</div>
						<div className="getInTouchData">
							<p className="getInTouchTitle">Subject</p>
							<input className="getInTouchInput" name="subject" type="text" onChange={this.onSubjectChange} />
							<p className="getInTouchInputNote" style={{ display: this.state.subjectError_display }}>
								Subject should contain 2-120 characters.
							</p>
						</div>
					</div>
					<div className="getInTouchDataMessage">
						<p className="getInTouchTitle">Message</p>
						<textarea className="getInTouchMessage" name="message" rows="15" aria-invalid="false"></textarea>
					</div>
					<button className="SendBtn" type="submit">
						{this.state.loadingSendBtn ? <img src={BtnLoading} height="100%" alt="" /> : 'Send'}
					</button>
				</form>
			</div>
		);
	}
}

export default Contact;
