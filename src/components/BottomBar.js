import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import configData from '../includes/config.json';
import '../css/BottomBar.css';
import aboutUsLogo from '../images/itsBluzaLogo.png';

class BottomBar extends Component {
	constructor() {
		super();
		this.state = {
			about_us: '',
		};
	}

	async componentDidMount() {
		const response = await axios({
			method: 'GET',
			url: configData.server_URI + '/getAboutUs',
		});
		if (response.data.length) {
			this.setState({
				about_us: response.data[0].about,
			});
		}
	}

	render() {
		return (
			<div>
				<div className="bottomBarAboutUs">
					<div className="aboutUsLeft">
						<img className="aboutUsLogo" src={aboutUsLogo} alt="" />
					</div>
					<div className="aboutUsMiddle">
						<p className="aboutUsTitle">About {configData.website_name}</p>
						<label className="aboutUsContent">{this.state.about_us}</label>
					</div>
					{configData.facebook_link.length > 0 && configData.instagram_link.length > 0 && (
						<div className="aboutUsRight">
							<p className="followUsTitle">FOLLOW US ON SOCIAL</p>
							<div className="followUsOptions">
								{configData.facebook_link.length > 0 && (
									<a href={configData.facebook_link} target="_blank" rel="noopener noreferrer">
										<FontAwesomeIcon icon={faFacebookF} />
									</a>
								)}
								{configData.instagram_link.length > 0 && (
									<a href={configData.instagram_link} target="_blank" rel="noopener noreferrer">
										<FontAwesomeIcon icon={faInstagram} />
									</a>
								)}
							</div>
						</div>
					)}
				</div>

				<div className="bottomMark">
					<p>© 2021 {configData.website_name}. All Rights Reserved.</p>
					<p>Powered By React</p>
				</div>
			</div>
		);
	}
}

export default BottomBar;
