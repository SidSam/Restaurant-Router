function initMap() {

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    var boxes = null;
    var boxpolys = null;
    var polyline_coordinates = [];
    var spaced_coordinates = [];
    var control_coordinates = [];
    var restaurants = [];
    var $spinner = $('div.sk-folding-cube');
    var distance = 0;
    var place_ids = new Set();
    var latitude = 0;
    var longitude = 0;
    var restaurant_details = [];
    var all_restaurants = [];
    var authentic_restaurants = [];
    var markers = [];
    var photo_urls = [];
    // var curr_results_length = [];
    // var curr_results = [];

    // var distance = document.getElementById('distance').value();

    // if ("geolocation" in navigator) {
    //     /* geolocation is available */
    //     navigator.geolocation.getCurrentPosition(function(position) {
    //         latitude = position.coords.latitude;
    //         longitude = position.coords.longitude;
    //         console.log(latitude);
    //         console.log(longitude); 
    //     });
    // } else {
    //   /* geolocation IS NOT available */
    //   latitude = 17.3850;
    //   longitude = 78.4867;
    // }

    var map_source = new google.maps.Map(document.getElementById('map-source'), {
        center: {lat: 17.3850, lng: 78.4867},
        zoom: 13
    });
    
    
    var map_destination = new google.maps.Map(document.getElementById('map-destination'), {
        center: {lat: 17.3850, lng: 78.4867},
        zoom: 13
    });

    var map_directions = new google.maps.Map(document.getElementById('directions-map'), {
            zoom: 7,
            center: {lat: 17.3850, lng: 78.4867}
        });

    var button = document.getElementById('show-route');
    var button_details = document.getElementById('get-details');
    var button_names = document.getElementById('show-names');

    var $zomato = $(':button#zomato'); 

    service = new google.maps.places.PlacesService(map_directions);

    var source = document.getElementById('source');
    var destination = document.getElementById('destination');

    var autocomplete_source = new google.maps.places.Autocomplete(source);
    var autocomplete_destination = new google.maps.places.Autocomplete(destination);

    // Bind the map's bounds (viewport) property to the autocomplete object, so that the autocomplete requests use the current 
    // map bounds for the bounds option in the request.
    autocomplete_source.bindTo('bounds', map_source);
    autocomplete_destination.bindTo('bounds', map_destination);

    var infowindow_source = new google.maps.InfoWindow();
    var infowindowContent_source = document.getElementById('infowindow-content-source');
    infowindow_source.setContent(infowindowContent_source);
    var marker_source = new google.maps.Marker({
        map: map_source,
        anchorPoint: new google.maps.Point(0, -29)
    });

    var infowindow_destination = new google.maps.InfoWindow();
    var infowindowContent_destination = document.getElementById('infowindow-content-destination');
    infowindow_destination.setContent(infowindowContent_destination);
    var marker_destination = new google.maps.Marker({
        map: map_destination,
        anchorPoint: new google.maps.Point(0, -29)
    });

    infoWindow_directions = new google.maps.InfoWindow();
    var infowindowContent_directions = document.getElementById('infowindow-content-directions');
    infoWindow_directions.setContent(infowindowContent_directions);

    autocomplete_source.addListener('place_changed', function() {
        infowindow_source.close();
        marker_source.setVisible(false);
        var place = autocomplete_source.getPlace();
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map_source.fitBounds(place.geometry.viewport);
        } else {
            map_source.setCenter(place.geometry.location);
            map_source.setZoom(17);  // Why 17? Because it looks good.
        }
        
        marker_source.setPosition(place.geometry.location);
        marker_source.setVisible(true);

        var address = '';
        address = place.formatted_address;

        infowindowContent_source.children['place-icon'].src = place.icon;
        infowindowContent_source.children['place-name'].textContent = place.name;
        infowindowContent_source.children['place-address'].textContent = address;
        infowindow_source.open(map_source, marker_source);
    });

    autocomplete_destination.addListener('place_changed', function() {
        infowindow_destination.close();
        marker_destination.setVisible(false);
        var place = autocomplete_destination.getPlace();
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map_destination.fitBounds(place.geometry.viewport);
        } else {
            map_destination.setCenter(place.geometry.location);
            map_destination.setZoom(17);  // Why 17? Because it looks good.
        }
           
        marker_destination.setPosition(place.geometry.location);
        marker_destination.setVisible(true);

        var address = '';
        address = place.formatted_address;

        infowindowContent_destination.children['place-icon'].src = place.icon;
        infowindowContent_destination.children['place-name'].textContent = place.name;
        infowindowContent_destination.children['place-address'].textContent = address;
        infowindow_destination.open(map_destination, marker_destination);
    });

    // Draw the array of boxes as polylines on the map
        function drawBoxes(boxes) {
          boxpolys = new Array(boxes.length);
          for (var i = 0; i < boxes.length; i++) {
            boxpolys[i] = new google.maps.Rectangle({
              bounds: boxes[i],
              fillOpacity: 0,
              strokeOpacity: 1.0,
              strokeColor: '#000000',
              strokeWeight: 1,
              map: map_directions
            });
          }
        }

        // Clear boxes currently on the map
        function clearBoxes() {
          if (boxpolys != null) {
            for (var i = 0; i < boxpolys.length; i++) {
              boxpolys[i].setMap(null);
            }
          }
          boxpolys = null;
        }

    function addMarker(place) {
        var marker = new google.maps.Marker({
            map: map_directions, 
            position: place.geometry.location,
            icon: {
                url: 'https://developers.google.com/maps/documentation/javascript/images/circle.png',
                anchor: new google.maps.Point(10, 10),
                scaledSize: new google.maps.Size(10, 17)
            }
        });
        // console.log(marker);
        markers.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            service.getDetails(place, function(result, status) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    console.error(status);
                    return;
                }
                infowindowContent_directions.children['place-icon'].src = place.icon;
                infowindowContent_directions.children['place-name'].textContent = place.name;
                infowindowContent_directions.children['place-address'].textContent = place.formatted_address;
                infoWindow_directions.open(map_directions, marker);
            });
        });

    }

    function addNewMarker(place) {
        // for (var i=0;i<data.length;i++) {
            var marker = new google.maps.Marker({
                map: map_directions,
                position: {'lat': parseFloat(place.lat), 'lng': parseFloat(place.lng)},
                icon: {
                    url: 'https://developers.google.com/maps/documentation/javascript/images/circle.png',
                    anchor: new google.maps.Point(10, 10),
                    scaledSize: new google.maps.Size(10, 17)
                }
            });
            // google.maps.event.addListener(marker, 'click', function() {
            //     $.ajax({
            //         url: 'get_details/',
            //         type: 'POST',
            //         data: {'place_id': data.place_id},
            //         success: function(data, textStatus, jqXHR) {
            //             // infowindowContent_directions.children['place-icon'].src = place.icon;
            //             // data = JSON.parse(data);
            //             console.log(data);
            //             console.log(data.name);
            //             console.log(data.address);
            //             infowindowContent_directions.children['place-name'].textContent = data.name;
            //             infowindowContent_directions.children['place-address'].textContent = data.address;
            //             infoWindow_directions.open(map_directions, marker);
            //         }
            //     });
            // });
            google.maps.event.addListener(marker, 'click', function() {
                service.getDetails({'placeId': place.place_id}, function(result, status) {
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        console.error(status);
                        return;
                    }
                    infowindowContent_directions.children['place-icon'].src = result.icon;
                    infowindowContent_directions.children['place-name'].textContent = result.name;
                    infowindowContent_directions.children['place-address'].textContent = result.formatted_address;
                    infoWindow_directions.open(map_directions, marker);
                });
            });

        // }
        
    }


    function drawCircles() {
        for (var i=0; i<spaced_coordinates.length; i++) {
            var curr_coords = new google.maps.LatLng(spaced_coordinates[i][0],spaced_coordinates[i][1]);  
            var populationOptions = {
                strokeColor: '#FF0000',
                strokeOpacity: 0.1,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.075,
                map: map_directions,
                center: curr_coords,
                radius: distance*1000
            }; 
            cityCircle = new google.maps.Circle(populationOptions);
        }
    }

    function checkForAuthenticity(restaurant) {
        // Details to show
        // name - always there --- name
        // address - probably always there --- formatted_address
        // phone number - probably an indicator it's a real thing --- formatted_phone_number
        // photos in a slideshow - photos
        // price level --- price_level
        // rating --- rating
        // types --- types
        // website --- website
        // permanently_closed flag
        // current scenario ---> if at least one of the other details are present, save; else discard
        // console.log(restaurant);
        // console.log(restaurant.formatted_address);
        // console.log(restaurant.formatted_phone_number);
        // console.log(restaurant.photos);
        if (!restaurant.formatted_address || !restaurant.formatted_phone_number || !restaurant.photos) 
            return false;
        return true;
    }


    function getRestaurantDetails(index) {
        console.log("index " + index);
        // console.log("results length for " + searchIndex + " is " + curr_results_length[searchIndex]);
        // console.log("results for " + searchIndex + " are " + JSON.stringify(curr_results[searchIndex]));
        console.log("result being sent is " + restaurants[index].place_id);
        service.getDetails(restaurants[index], function(result, status) {
            console.log("got some details");
            console.log("index for this detail is " + index);
            console.log(result);
            // console.log(status);
            
            if (status == google.maps.places.PlacesServiceStatus.OK) {

                // if ( !place_ids.has(result.place_id) ) {
                    // place_ids.add(result.place_id);
                    // all_restaurants.push(result);

                    if (checkForAuthenticity(result)) {
                        var curr_urls = [];
                        for (var j=0; j<result.photos.length; j++) {
                            curr_urls.push(result.photos[j].getUrl({ 'maxWidth': 1600, 'maxHeight': 1600 }));
                        }
                        result['photo_urls'] = curr_urls;
                        authentic_restaurants.push(result);
                        
                        // photo_urls.push(curr_urls);
                        // addMarker(result);
                    }
                    else {
                        markers[index].setMap(null);
                    }

                // }

            }

            if (status != google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                index++;
                // console.log("index increased to " + index);
                // console.log("results length for " + searchIndex + " is " + curr_results_length[searchIndex]);
                if (index < restaurants.length)
                    getRestaurantDetails(index);  
                else {
                    console.log("details done");
                    $spinner.hide();
                    sessionStorage.setItem("authentic_unique", JSON.stringify(authentic_restaurants));
                }             
            }
            else {
                console.log('overshoot for details');
                setTimeout(getRestaurantDetails(index), 1000);
            }
            // if (status != google.maps.places.PlacesServiceStatus.OK) {
            //     console.error(status);
            //     return
            // }
            
        });
    }

    function cbF() {
        console.log("callback being called");
    }

    function findRestaurants(searchIndex) {
        // console.log("searchIndex " + searchIndex);
        // console.log(polyline_coordinates);
        var curr_coords = new google.maps.LatLng(polyline_coordinates[searchIndex][0],polyline_coordinates[searchIndex][1]);
        var request = {location: curr_coords, 
                        radius: distance*1000,
                        type: 'restaurant'};
        // var request = {bounds: boxes[searchIndex], type: 'restaurant'};
        service.radarSearch(request, function(results, status) {
            // console.log('got some results');

            if (results != null) {
                console.log(results.length);
                // curr_results_length[searchIndex] = results.length;
                // curr_results[searchIndex] = results;
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    // console.log('status was OK');
                    for (var i=0; i < results.length; i++) {
                        all_restaurants.push(results[i]);
                    //     console.log("pushed all restaurants");
                        if (!place_ids.has(results[i].place_id)) {
                            // console.log('adding unique');
                            place_ids.add(results[i].place_id);
                            restaurants.push(results[i]);  
                            addMarker(results[i]);                            
                        }
                        
                    }
                    // getRestaurantDetails(0, searchIndex);   
                }
            }
                
                if (status != google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                    searchIndex++;
                    if (searchIndex < polyline_coordinates.length) 
                        findRestaurants(searchIndex);
                    else {
                        console.log("all done");
                        // $spinner.hide();
                        getRestaurantDetails(0);
                    }
                }
                else {
                    console.log('overshoot');
                    setTimeout(findRestaurants(searchIndex), 1000);
                } 
            
            
        });
    }

    function masterFunction() {
        findRestaurants(0);
    }

    function haversine() {
        var radians = Array.prototype.map.call(arguments, function(deg) { return deg/180.0 * Math.PI; });
        // console.log(radians);
        var lat1 = radians[0], lon1 = radians[1], lat2 = radians[2], lon2 = radians[3];
        var R = 6372.8; // km
        var dLat = lat2 - lat1;
        var dLon = lon2 - lon1;
        var a = Math.sin(dLat / 2) * Math.sin(dLat /2) + Math.sin(dLon / 2) * Math.sin(dLon /2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
    }

    function successFunction(data, textStatus, jqXHR) {
        console.log('inside success function');
        console.log(data);
        data = JSON.parse(data);
        for (var i=0;i<data.length;i++) {
            console.log(data[i]);
            restaurants.push(data[i].place_id);
            addNewMarker(data[i]);
        }
    }

    button.addEventListener("click", function() {
        polyline_coordinates = [];
        // clearBoxes();
        distance = document.getElementById('distance').value/1000;
        $spinner.show();
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();
        
        var rendererOptions = {draggable: true};
        directionsDisplay.setMap(map_directions);
        //directionsDisplay.setOptions(rendererOptions);
        directionsDisplay.setPanel(document.getElementById('panel'));
        
        var request = {
            origin: document.getElementById('source').value,
            destination: document.getElementById('destination').value,
            travelMode: 'DRIVING'
        };


        directionsService.route(request, function(response, status) {
            if (status == 'OK'){
                directionsDisplay.setDirections(response);
                // console.log(response);
                // console.log(response.routes);
                for (i=0; i<response.routes[0].overview_path.length; i++) {
                    if (!i) {
                        control_coordinates = [response.routes[0].overview_path[i].lat(), response.routes[0].overview_path[i].lng()];
                        spaced_coordinates.push([response.routes[0].overview_path[i].lat(), response.routes[0].overview_path[i].lng()]);
                        console.log("initial control coordinates " + control_coordinates[0] + ', ' + control_coordinates[1]);
                    }
                    else {
                        var curr = [response.routes[0].overview_path[i].lat(), response.routes[0].overview_path[i].lng()];
                        // console.log("curr is " + curr[0] + ', ' + curr[1]);
                        var dist_from_control = haversine(curr[0], curr[1], control_coordinates[0], control_coordinates[1]);
                        // console.log(dist_from_control);
                        // console.log(distance);
                        if (dist_from_control > distance) {
                            // console.log("greater than distance");
                            spaced_coordinates.push(curr);
                            control_coordinates = curr;
                        }
                    }
                    polyline_coordinates.push([response.routes[0].overview_path[i].lat(), response.routes[0].overview_path[i].lng()]);
                }
                
                console.log(polyline_coordinates);
                console.log(polyline_coordinates.length);
                console.log(spaced_coordinates);

                for (var i=0; i<1; i++) {
                    console.log(i);

                    $.ajax({
                        url: 'process/',
                        type: 'POST',
                        data: {'coords': polyline_coordinates[i], 'distance': distance*1000},
                        // success: function(data, textStatus, jqXHR) {
                        //     console.log(data);
                        // }
                        success: successFunction
                        // error: function(textStatus, jqXHR, errorThrown) {
                        //     console.log(textStatus);
                        // }
                    });

                }

                



                


                // ROUTEBOXER
                // var rboxer = new RouteBoxer();
                // // Default unit of distance is km. So value should be in meters.
                 
                // var path = response.routes[0].overview_path;
                // boxes = rboxer.box(path, distance);
                // drawBoxes(boxes);
                // console.log("now finding restaurants");
                // findRestaurants(0);
                // masterFunction().done(function() {console.log('all done');});
                // drawCircles();
                
            }
            else {
                alert('Directions request failed');
            }
        });
    });  

    // var dfd = $.Deferred();
    // dfd.done(tryingWithDeferred).done(function() {
    //     console.log("all done");
    // });

    // button.addEventListener("click", function() {
    //     dfd.resolve();
    // });

    button_details.addEventListener("click", function() {

        console.log(all_restaurants);
        console.log(restaurants);
        $spinner.show();
        getRestaurantDetails(0);

    });

    button_names.addEventListener("click", function() {

        console.log(all_restaurants);
        console.log(restaurants);
        console.log(authentic_restaurants);
        console.log(photo_urls);

    });

    $(':button#show-places').on("click", function() {
        console.log(all_restaurants);
        console.log(authentic_restaurants);
    });

    $(document).ajaxStop(function() {
        console.log("all done now");
        $spinner.hide();
        var detailsAnchorTag = document.getElementById('details');
        detailsAnchorTag.href = "details/1";
        detailsAnchorTag.classList.remove('disabled');
        sessionStorage.setItem('restos', JSON.stringify(restaurants));
        // window.sessionStorage.setItem("zomato", JSON.stringify(zomato_restaurants)); // Saving
        // window.location.replace('zomatorestaurants.html');
        // $zr.text(zomato_restaurants);
    });

}