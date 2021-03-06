import React from 'react';
import qs from 'qs';
import axios from 'axios';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

export default class DistanceInputFieldButton extends React.Component {

	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.getPlaceFromMainWrapper = this.getPlaceFromMainWrapper.bind(this);
		this.state = {
			distance: null
		}
	}

	getPlaceFromMainWrapper(position) {
        return this.props.onRoutePress(position);
    }

	handleChange(e) {
		this.setState({
			distance: e.target.value
		});
	}

	handleClick() {
		let source = this.getPlaceFromMainWrapper('source');
		let destination = this.getPlaceFromMainWrapper('destination');
		let distance = this.state.distance;

        document.getElementById('directions-map-row').style.display = 'block';
        document.getElementById('loader').style.display = 'block';

		let map_directions = new google.maps.Map(document.getElementById('directions-map'), {
			center: {lat: parseFloat(sessionStorage.getItem('lat')), lng: parseFloat(sessionStorage.getItem('lng'))},
			zoom: 13
		});
		
		// Draw route and get restaurants
		let directionsService = new google.maps.DirectionsService();
        let directionsDisplay = new google.maps.DirectionsRenderer();
        
        let rendererOptions = {draggable: true};
        directionsDisplay.setMap(map_directions);
        //directionsDisplay.setOptions(rendererOptions);
        // directionsDisplay.setPanel(document.getElementById('panel'));
        
        let request = {
            origin: source,
            destination: destination,
            travelMode: 'DRIVING'
        };

        let polyline_coordinates = [];

        let service = new google.maps.places.PlacesService(map_directions);

        let infoWindow_directions = new google.maps.InfoWindow();
	    let infowindowContent_directions = document.getElementById('infowindow-content-directions');
	    infoWindow_directions.setContent(infowindowContent_directions);

        let addNewMarker = (place) => {
        	let marker = new google.maps.Marker({
                map: map_directions,
                position: {'lat': parseFloat(place.lat), 'lng': parseFloat(place.lng)},
                icon: {
                    url: 'https://developers.google.com/maps/documentation/javascript/images/circle.png',
                    anchor: new google.maps.Point(10, 10),
                    scaledSize: new google.maps.Size(10, 17)
                }
            });

            google.maps.event.addListener(marker, 'click', function() {
                service.getDetails({'placeId': place.place_id}, function(result, status) {
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        console.error(status);
                        return;
                    }
                    infowindowContent_directions.children['place-icon'].src = result.icon;
                    infowindowContent_directions.children['place-name'].textContent = result.name;
                    infowindowContent_directions.children['place-address'].textContent = result.formatted_address;
                    infowindowContent_directions.children['place-icon'].style.display = 'inline';
                    infoWindow_directions.open(map_directions, marker);
                });
            });
        }

        let successResponseFunction = (response) => {
        	for (let restaurant of response.data) {
        		addNewMarker(restaurant);
        	}
        }

        directionsService.route(request, (response, status) => {
            if (status == 'OK'){
                directionsDisplay.setDirections(response);
                for (let coord of response.routes[0].overview_path) {
                    polyline_coordinates.push([coord.lat(), coord.lng()]);
                }
                
                let promises = [];
                
                for (let i=0; i<polyline_coordinates.length; i++) {
                    promises.push(axios({
                            method: 'post',
                            url: 'process/',
                            data: qs.stringify({
                                lat: polyline_coordinates[i][0],
                                lng: polyline_coordinates[i][1],
                                distance: distance
                            }),
                            headers: {'X-Requested-With': 'XMLHttpRequest',
                                      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                        }).then(successResponseFunction)
                    );   
                }

                axios.all(promises)
                    .then(axios.spread((acct, perms) => {
                        // all axios requests are complete
                        document.getElementById('loader').style.display = 'none';
                        document.getElementById('loading-text').style.display = 'none';
                        document.getElementById('footer').style.display = 'block';

                    }));
                
            }
            else {
                alert('Directions request failed');
            }
        });

	}

	render() {
		return (
			<div style={{textAlign: 'center'}}>
                <input style={{width: '25%'}} className='button-input' type='text' placeholder='Enter distance (in meters) from route' onChange={(e) => this.handleChange(e)} />
                <button className='button-input btn btn-primary' onClick={this.handleClick}>Show route</button>
                <div id='loader' style={{paddingLeft: '45%'}}>
                    <div className="lds-ellipsis">
                        <div>
                            <div></div>
                        </div>
                        <div>
                            <div></div>
                        </div>
                        <div>
                            <div></div>
                        </div>
                        <div>
                            <div></div>
                        </div>
                        <div>
                            <div></div>
                        </div>
                    </div>
                    <p style={{marginTop: '-5%', marginLeft: '-65%'}} id='loading-text'>Loading ... </p>
                </div>
			</div>
		)
	}

}