function script() {
	var au = JSON.parse(sessionStorage.getItem("restos"));
	console.log(au);
	var attributes = ['name', 'address', 'phone', 'photos', 'rating', 'website', 'maps_url'];

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

	function sortByField(field, reverse) {
		var reverse = reverse ? -1 : 1;
		return function(a, b) {
			af = a[field];
			bf = b[field];
			
			if ( af != bf && typeof (af) != 'undefined' && typeof (bf) != 'undefined') return reverse * ( (af>bf) - (bf>af) )
			else if (typeof (af) === 'undefined' && typeof (bf) != 'undefined') return 1;
			else if (typeof (bf) === 'undefined' && typeof (af) != 'undefined') return -1;
			return reverse * ( (a['name']>b['name']) - (b['name']>a['name']) )
		}
	}

	function compareRatingAsc(a, b) {
		if (a.rating === undefined && b.rating === undefined)
			return compareNameAsc(a, b);
		if (a.rating < b.rating || a.rating === undefined)
			return -1;
		else if (a.rating > b.rating || b.rating === undefined)
			return 1;
		return compareNameAsc(a, b);
	}

	function compareRatingDesc(a, b) {
		if (a.rating === undefined && b.rating === undefined)
			return compareNameDesc(a, b);
		if (a.rating > b.rating || b.rating === undefined)
			return -1;
		else if (a.rating < b.rating || a.rating === undefined)
			return 1;
		return compareNameDesc(a, b);
	}

	function compareNameAsc(a, b) {
		if (a.name < b.name)
			return -1;
		else if (a.name > b.name)
			return 1;
		return 0;
	}

	function compareNameDesc(a, b) {
		if (a.name > b.name) {
			return -1;
		}
		else if (a.name < b.name) {
			return 1;
		}
		return 0;
	}

	function slide(n, index) {
		var noOfSlides = document.getElementsByClassName('slideshow-'+index);
		for (var c=0; c<noOfSlides.length; c++) {
			if (noOfSlides[c].style.display != 'none') {
				noOfSlides[c].style.display = 'none';
				if ( n == -1 )
					var nextVisibleIndex = c > 0 ? c - 1 : noOfSlides.length - 1; 
				else
					var nextVisibleIndex = c < noOfSlides.length - 1 ? c + 1 : 0; 
				noOfSlides[nextVisibleIndex].style.display = 'inline';
				break;
			}
		}	
	}

	function createRowNode(attribute, type, index) {
		var currRow = document.createElement("div");
		currRow.className += 'row';
		if (type) {
			if (type != 'photos') {
				var anchorTag = document.createElement('a');
				anchorTag.href = attribute;
				anchorTag.appendChild(document.createTextNode(type));
				currRow.appendChild(anchorTag);
			}
			else {
				currRow.style.cssText = 'height: 150px; width: 100%;';
				
				var prevDiv = document.createElement("div");
				prevDiv.className = 'col-md-1';
				var buttonPrev = document.createElement('button');
				buttonPrev.innerHTML = "&#10094;";
				buttonPrev.style.cssText = 'float: right';
				buttonPrev.onclick = function(){ slide(-1, index); };
				prevDiv.appendChild(buttonPrev);
				currRow.appendChild(prevDiv);

				var imageDiv = document.createElement('div');
				imageDiv.className = 'col-md-10';
				imageDiv.style.cssText = 'height: 150px';				
				for (var j=0; j<attribute.length; j++) {
					var imageTag = document.createElement("img");
					imageTag.src = attribute[j];
					imageTag.className = 'slideshow-'+index;
					imageTag.style.cssText = 'max-width: 100%; max-height: 100%';
					if (j)
						imageTag.style.display = 'none';
					imageDiv.appendChild(imageTag);
				}
				currRow.appendChild(imageDiv);

				var nextDiv = document.createElement("div");
				nextDiv.className = 'col-md-1';
				var buttonNext = document.createElement('button');
				buttonNext.innerHTML = "&#10095;";
				buttonNext.onclick = function(){ slide(1, index); };
				nextDiv.appendChild(buttonNext);
				currRow.appendChild(nextDiv);
				
			}
			
		}
		else 
			currRow.appendChild(document.createTextNode(attribute));	
		return currRow
	}

	function newCreateRowNode(attribute, type, index) {
		console.log(attribute);
		var currRow = document.createElement("div");
		currRow.className += 'row';
		if (type) {
			if (type != 'photos') {
				var anchorTag = document.createElement('a');
				anchorTag.href = attribute;
				anchorTag.appendChild(document.createTextNode(type));
				currRow.appendChild(anchorTag);
			}
			else {
				currRow.style.cssText = 'height: 150px; width: 100%;';
				currRow.id = index;
		
				currRow.className += ' carousel slide';
				currRow.setAttribute('data-interval', false);

				var innerRow = document.createElement('div');
				innerRow.className += 'carousel-inner';
				innerRow.setAttribute('role', 'listbox');

				for (var attr=0; attr<attribute.length; attr++) {
					var carouselItem = document.createElement('div');
					carouselItem.className += 'carousel-item';
					if (!attr) carouselItem.className += ' active';
					var carouselImage = document.createElement('img');
					carouselImage.className += 'd-block img-fluid';
					carouselImage.src = attribute[attr];
					carouselImage.style.cssText = 'max-height: 150px; max-width: 100%';
					carouselItem.appendChild(carouselImage);
					innerRow.appendChild(carouselItem);
				}

				currRow.appendChild(innerRow);

				var prevAnchor = document.createElement('a');
				prevAnchor.className += 'carousel-control-prev';
				prevAnchor.href = '#'+index;
				prevAnchor.setAttribute('role', 'button');
				prevAnchor.setAttribute('data-slide', 'prev');
				var prevIconSpan = document.createElement('span');
				prevIconSpan.className += 'carousel-control-prev-icon';
				prevIconSpan.setAttribute('aria-hidden', true);
				var prevTextSpan = document.createElement('span');
				prevTextSpan.className += 'sr-only';
				prevTextSpan.innerHTML = 'Previous';
				prevAnchor.appendChild(prevIconSpan);
				prevAnchor.appendChild(prevTextSpan);
				currRow.appendChild(prevAnchor);

				var nextAnchor = document.createElement('a');
				nextAnchor.className += 'carousel-control-next';
				nextAnchor.href = '#'+index;
				nextAnchor.setAttribute('role', 'button');
				nextAnchor.setAttribute('data-slide', 'next');
				var nextIconSpan = document.createElement('span');
				nextIconSpan.className += 'carousel-control-next-icon';
				nextIconSpan.setAttribute('aria-hidden', true);
				var nextTextSpan = document.createElement('span');
				nextTextSpan.className += 'sr-only';
				nextTextSpan.innerHTML = 'Next';
				nextAnchor.appendChild(nextIconSpan);
				nextAnchor.appendChild(nextTextSpan);
				currRow.appendChild(nextAnchor);
				
			}
			
		}
		else 
			currRow.appendChild(document.createTextNode(attribute));	
		return currRow
	}

	function createBoxNode(i) {
		var ele = document.createElement("div");
	    ele.className += 'col-md-6';
	    ele.style.cssText = 'border: 1px solid red; max-height: 200px; overflow-y: scroll;';

	    for (var a=0; a<attributes.length; a++) {
	    	if (au[i][attributes[a]] != undefined) {
	    		if (attributes[a] == 'photo_urls')
	    			ele.appendChild(createRowNode(au[i].photos, type='photos', index=i));
	    		else if (attributes[a] == 'website')
	    			ele.appendChild(createRowNode(au[i].website, type='Go to Website'));
	    		else if (attributes[a] == 'maps_url')
	    			ele.appendChild(createRowNode(au[i].url, type='See Location on Google Maps'));
	    		else
	    			ele.appendChild(createRowNode(au[i][attributes[a]]));
	    	}
	    }

	    if (au[i].permanently_closed != undefined)
			ele.className += 'closed-restaurant';

		return ele
	}

	function newCreateBoxNode(data) {
		var ele = document.createElement('div');
		ele.className += 'col-md-6';
		ele.style.cssText = 'border: 1px solid red; max-height: 200px; overflow-y: auto;';

		for (var a=0; a<attributes.length; a++) {
			if (attributes[a] == 'photos')
	    		ele.appendChild(newCreateRowNode(data.photos, type='photos', index='example'));
	    	else if (attributes[a] == 'website')
	    		ele.appendChild(newCreateRowNode(data.website, type='Go to Website'));
	    	else if (attributes[a] == 'maps_url')
	    		ele.appendChild(newCreateRowNode(data.maps_url, type='See Location on Google Maps'));
	    	else{
	    		ele.appendChild(newCreateRowNode(data[attributes[a]]));
	    	}
		}

		return ele

	}

	function populatePage() {
		var mainElement = document.getElementById('main');
		mainElement.innerHTML = '';

	    for (var i=0; i<au.length; i++) {
	    	var box = createBoxNode(i);
	    	mainElement.appendChild(box);
	    }
	}

	function successFunction(data, textStatus, jqXHR) {
		data = JSON.parse(data);
		var mainElement = document.getElementById('main');
		mainElement.innerHTML = '';

		var box = newCreateBoxNode(data);
		mainElement.appendChild(box);
	}

	function errorFunction(jqXHR, textStatus, errorThrown) {
		console.log(textStatus);
		console.log(errorThrown);
	}

	function newPopulatePage(pageNo) {
		var start = (pageNo-1) * 4;
		var stop = au.length<4 ? au.length : pageNo*4 - 1;

		for (var i=start; i<stop; i++) {
			$.ajax({
				url: 'get_details/',
				data: {'place_id': au[i]},
				type: 'POST',
				success: successFunction,
				error: errorFunction
			})
		}

	}

	var pageNo = +document.getElementById('page-no').innerHTML;
	
	// newPopulatePage(pageNo);

    document.getElementById('rating-asc').addEventListener("click", function() {
    	au.sort(sortByField('rating'));
    	// console.log(au);
    	populatePage();
    });

    document.getElementById('rating-desc').addEventListener("click", function() {
    	au.sort(sortByField('rating', true));
    	// console.log(au);
    	populatePage();
    });

    document.getElementById('name-asc').addEventListener("click", function() {
    	au.sort(sortByField('name'));
    	// console.log(au);
    	populatePage();
    });

    document.getElementById('name-desc').addEventListener("click", function() {
    	au.sort(sortByField('name', true));
    	// console.log(au);
    	populatePage();
    });

    document.getElementById('price-asc').addEventListener("click", function() {
    	au.sort(sortByField('price_level'));
    	console.log(au);
    	populatePage();
    });

    document.getElementById('price-desc').addEventListener("click", function() {
    	au.sort(sortByField('price_level', true));
    	console.log(au);
    	populatePage();
    });
    
}