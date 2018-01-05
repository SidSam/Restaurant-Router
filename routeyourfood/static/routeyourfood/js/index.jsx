import React from 'react';
import ReactDOM from 'react-dom';
import GoogleMap from './Map.jsx';
import DistanceInputFieldButton from './RoutingButton.jsx';

class MainWrapper extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			source_place_latlng: null,
			destination_place_latlng: null
		}
		this.handlePlaceChange = this.handlePlaceChange.bind(this);
		this.getPlaceObject = this.getPlaceObject.bind(this);
	}

	handlePlaceChange(lat, lng, position) {
		if (position == 'source') {
			this.setState({
				source_place_latlng: new google.maps.LatLng(lat, lng)
			});
		}
		else {
			this.setState({
				destination_place_latlng: new google.maps.LatLng(lat, lng)
			});
		}
	}

	getPlaceObject(position) {
		console.log(position);
		return (position==='source') ? this.state.source_place_latlng : this.state.destination_place_latlng;
        // return this.state.source_place_latlng;
    }

    // getDestinationObject() {
    // 	return this.state.destination_place_latlng;
    // }

	render() {
		return (
			<div>
				<GoogleMap onPlaceChange={this.handlePlaceChange} position='source' />
				<GoogleMap onPlaceChange={this.handlePlaceChange} position='destination' />
				<DistanceInputFieldButton onRoutePress={this.getPlaceObject} />
			</div>
		)
	}

}

// class MapSource extends React.Component {

// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			place_icon: null,
// 			place_name: null,
// 			place_address: null
// 		};
// 	}

// 	render() {
// 		return (
// 			<div className='col-md-6'>
// 				<div className="pac-card" id="pac-card">
// 					<div id="pac-container">
// 						<input id="pac-input-source" type="text" placeholder="Where are you starting from?" />
// 					</div>
// 				</div>

// 				<div id="map-source"></div>
				
// 				<div id="infowindow-content-source">
// 					<img src={this.state.place_icon} width="16" height="16" id="place-icon" />
// 					<span id="place-name"  className="title">{this.state.place_name}</span><br />
// 					<span id="place-address">{this.state.place_address}</span>
// 				</div>
// 			</div>

// 		);
// 	}

// 	componentDidMount() {
// 		let map_source = new google.maps.Map(document.getElementById('map-source'), {
// 			center: {lat: 17.3850, lng: 78.4867},
// 			zoom: 13
// 		});	

// 		let source = document.getElementById('pac-input-source')
// 		let autocomplete_source = new google.maps.places.Autocomplete(source);
// 		autocomplete_source.bindTo('bounds', map_source);

// 		let infowindow_source = new google.maps.InfoWindow();
// 		let infowindowContent_source = document.getElementById('infowindow-content-source');
//     	infowindow_source.setContent(infowindowContent_source);
    	
//     	let marker_source = new google.maps.Marker({
//         	map: map_source,
//         	anchorPoint: new google.maps.Point(0, -29)
//     	});

//     	autocomplete_source.addListener('place_changed', () => {
//     		infowindow_source.close();
// 	        marker_source.setVisible(false);
// 	        let place = autocomplete_source.getPlace();
// 	        if (!place.geometry) {
// 	            // User entered the name of a Place that was not suggested and
// 	            // pressed the Enter key, or the Place Details request failed.
// 	            window.alert("No details available for input: '" + place.name + "'");
// 	            return;
// 	        }

// 	        // If the place has a geometry, then present it on a map.
// 	        if (place.geometry.viewport) {
// 	            map_source.fitBounds(place.geometry.viewport);
// 	        } else {
// 	            map_source.setCenter(place.geometry.location);
// 	            map_source.setZoom(19);  
// 	        }
	        
// 	        marker_source.setPosition(place.geometry.location);
// 	        marker_source.setVisible(true);	        

// 	        this.setState({
// 	        	place_address: place.formatted_address,
// 	        	place_icon: place.icon,
// 	        	place_name: place.name,
// 	        });

// 	        infowindow_source.open(map_source, marker_source);

// 	        this.props.onSourcePlaceChange(place.geometry.location.lat(), place.geometry.location.lng());
// 	    })
// 	}

// }

// class MapDestination extends React.Component {

// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			place_icon: null,
// 			place_name: null,
// 			place_address: null
// 		};
// 	}

// 	render() {
// 		return (
// 			<div className='col-md-6'>
// 				<div className="pac-card" id="pac-card">
// 					<div id="pac-container">
// 						<input id="pac-input-destination" type="text" placeholder="Where are you going to?" />
// 					</div>
// 				</div>

// 				<div id="map-destination"></div>
				
// 				<div id="infowindow-content-destination">
// 					<img src={this.state.place_icon} width="16" height="16" id="place-icon" />
// 					<span id="place-name"  className="title">{this.state.place_name}</span><br />
// 					<span id="place-address">{this.state.place_address}</span>
// 				</div>
// 			</div>

// 		);
// 	}

// 	componentDidMount() {
// 		let map_destination = new google.maps.Map(document.getElementById('map-destination'), {
// 			center: {lat: 17.3850, lng: 78.4867},
// 			zoom: 13
// 		});	

// 		let destination = document.getElementById('pac-input-destination')
// 		let autocomplete_destination = new google.maps.places.Autocomplete(destination);
// 		autocomplete_destination.bindTo('bounds', map_destination);

// 		let infowindow_destination = new google.maps.InfoWindow();
// 		let infowindowContent_destination = document.getElementById('infowindow-content-destination');
//     	infowindow_destination.setContent(infowindowContent_destination);
    	
//     	let marker_destination = new google.maps.Marker({
//         	map: map_destination,
//         	anchorPoint: new google.maps.Point(0, -29)
//     	});

//     	autocomplete_destination.addListener('place_changed', () => {
//     		infowindow_destination.close();
// 	        marker_destination.setVisible(false);
// 	        let place = autocomplete_destination.getPlace();
// 	        if (!place.geometry) {
// 	            // User entered the name of a Place that was not suggested and
// 	            // pressed the Enter key, or the Place Details request failed.
// 	            window.alert("No details available for input: '" + place.name + "'");
// 	            return;
// 	        }

// 	        // If the place has a geometry, then present it on a map.
// 	        if (place.geometry.viewport) {
// 	            map_destination.fitBounds(place.geometry.viewport);
// 	        } else {
// 	            map_destination.setCenter(place.geometry.location);
// 	            map_destination.setZoom(19);  
// 	        }
	        
// 	        marker_destination.setPosition(place.geometry.location);
// 	        marker_destination.setVisible(true);	        

// 	        this.setState({
// 	        	place_address: place.formatted_address,
// 	        	place_icon: place.icon,
// 	        	place_name: place.name,
// 	        });

// 	        infowindow_destination.open(map_destination, marker_destination);
	        
// 	        this.props.onDestinationPlaceChange(place.geometry.location.lat(), place.geometry.location.lng());
// 	    })
// 	}
// }



ReactDOM.render(<MainWrapper />, document.getElementById('test'));