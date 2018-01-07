import React from 'react';
import ReactDOM from 'react-dom';

class WelcomeModal extends React.Component {

	render() {
		return (

			<div className="modal fade" id='welcome-modal'>
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Restaurant Router</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							<p>When I go out with my friends somewhere, and then we make plans to eat somewhere on the way back home, 
							it's not easy to search for good restaurants. I have to go to Google Maps, put in the start and
							end places, get the route, zoom in so I can see where the restaurants are, and then finally, manually
							drag along that route. <br /> I find this taxing. This app automates that work. <br /> Enter a
							start and a finish place, enter a distance (let's say 100 meters), and the app will display only
							those restaurants which are within 100 meters from that route. </p>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>

		)
	}

	componentDidMount() {
		$('#welcome-modal').modal('show');
	}

}

class LocationBar extends React.Component {

	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {

		if (!navigator.geolocation) {
			alert('Geolocation is not supported by your browser. Default coordinates pertaining to Hyderabad will be used.');
			sessionStorage.setItem('lat', 17.3850);
			sessionStorage.setItem('lng', 78.4867);
			return;
		}
		
		let getCurrentAddress = (lat, lng) => {
			let geocoder = new google.maps.Geocoder();
			lat = parseFloat(lat);
			lng = parseFloat(lng);

			let geocoderSuccess = (results, status) => {
				if (status === 'OK') {
					if (results[0]) {
						document.getElementById('location-input').value = results[0].formatted_address;
					}
					else {
						document.getElementById('location-input').value = "Unable to get address";
					}
				}
			}

			geocoder.geocode({'location': {'lat': lat, 'lng': lng}}, geocoderSuccess);
		}

		let success = (position) => {
			let lat = position.coords.latitude;
			let lng = position.coords.longitude;
			sessionStorage.setItem('lat', lat);
			sessionStorage.setItem('lng', lng);
			// document.getElementById('location-input').innerHTML = 
			getCurrentAddress(lat, lng);
			window.location.href = 'front/';
		}

		let error = () => {
			alert('Unable to retrieve your location. Default coordinates pertaining to Hyderabad will be used.');
			sessionStorage.setItem('lat', 17.3850);
			sessionStorage.setItem('lng', 78.4867);
		}

		navigator.geolocation.getCurrentPosition(success, error);

	}

	render() {
		return (
			<div>
				<input type='text' placeholder='Detect location' id='location-input'/>
				<button id='geolocate' onClick={this.handleClick}>Detect</button>
			</div>
		)
	}

}

ReactDOM.render(<WelcomeModal />, document.getElementById('main'));
ReactDOM.render(<LocationBar />, document.getElementById('location-bar'));