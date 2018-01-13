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
		return (position==='source') ? this.state.source_place_latlng : this.state.destination_place_latlng;
    }

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

ReactDOM.render(<MainWrapper />, document.getElementById('test'));