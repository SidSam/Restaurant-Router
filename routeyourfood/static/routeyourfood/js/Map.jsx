import React from 'react';

export default class GoogleMap extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			place_icon: null,
			place_name: null,
			place_address: null
		};
	}

	render() {
		if (this.props.position === 'source') {

			return (

				<div className='col-md-6'>
					<div className="pac-card" id="pac-card">
						<div id="pac-container">
							<input id="pac-input-source" type="text" placeholder="Where are you starting from?" />
						</div>
					</div>

					<div id="map-source"></div>
					
					<div id="infowindow-content-source">
						<img src={this.state.place_icon} width="16" height="16" id="place-icon" />
						<span id="place-name"  className="title">{this.state.place_name}</span><br />
						<span id="place-address">{this.state.place_address}</span>
					</div>
				</div>

			)

		}
		else {

			return (
			
				<div className='col-md-6'>
					<div className="pac-card" id="pac-card">
						<div id="pac-container">
							<input id="pac-input-destination" type="text" placeholder="Where are you going to?" />
						</div>
					</div>

					<div id="map-destination"></div>
						
					<div id="infowindow-content-destination">
						<img src={this.state.place_icon} width="16" height="16" id="place-icon" />
						<span id="place-name"  className="title">{this.state.place_name}</span><br />
						<span id="place-address">{this.state.place_address}</span>
					</div>
				</div>

			);

		}

	}

	componentDidMount() {
		let map = new google.maps.Map(document.getElementById('map-'+this.props.position), {
			center: {lat: parseFloat(sessionStorage.getItem('lat')), lng: parseFloat(sessionStorage.getItem('lng'))},
			zoom: 13
		});	
		
		let pacInput = document.getElementById('pac-input-'+this.props.position);
		let autocomplete = new google.maps.places.Autocomplete(pacInput);
		autocomplete.bindTo('bounds', map);

		let infowindow = new google.maps.InfoWindow();
		let infowindowContent = document.getElementById('infowindow-content-'+this.props.position);
    	infowindow.setContent(infowindowContent);
    	
    	let marker = new google.maps.Marker({
        	map: map,
        	anchorPoint: new google.maps.Point(0, -29)
    	});

    	autocomplete.addListener('place_changed', () => {
    		console.log('place changed');
    		infowindow.close();
	        marker.setVisible(false);
	        let place = autocomplete.getPlace();
	        if (!place.geometry) {
	            // User entered the name of a Place that was not suggested and pressed the Enter key, 
	            // or the Place Details request failed.
	            alert("No details available for input: '" + place.name + "'");
	            return;
	        }

	        // If the place has a geometry, then present it on a map.
	        if (place.geometry.viewport) {
	            map.fitBounds(place.geometry.viewport);
	        } else {
	            map.setCenter(place.geometry.location);
	            map.setZoom(19);  
	        }
	        
	        marker.setPosition(place.geometry.location);
	        marker.setVisible(true);	        

	        this.setState({
	        	place_address: place.formatted_address,
	        	place_icon: place.icon,
	        	place_name: place.name,
	        });

	        infowindow.open(map, marker);

	        this.props.onPlaceChange(place.geometry.location.lat(), place.geometry.location.lng(), this.props.position);
	    })
	}

}