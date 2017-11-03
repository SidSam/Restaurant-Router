function script() {
	var au = JSON.parse(window.sessionStorage.getItem("authentic_unique"));
	var attributes = ['name', 'formatted_address', 'formatted_phone_number', 'photo_urls', 'rating', 'price_level', 'website', 'url'];

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

	function createBoxNode(i) {
		var ele = document.createElement("div");
	    ele.className += 'col-md-6';
	    ele.style.cssText = 'border: 1px solid red; max-height: 200px; overflow-y: scroll;';

	    for (var a=0; a<attributes.length; a++) {
	    	if (au[i][attributes[a]] != undefined) {
	    		if (attributes[a] == 'photo_urls')
	    			ele.appendChild(createRowNode(au[i].photo_urls, type='photos', index=i));
	    		else if (attributes[a] == 'website')
	    			ele.appendChild(createRowNode(au[i].website, type='Go to Website'));
	    		else if (attributes[a] == 'url')
	    			ele.appendChild(createRowNode(au[i].url, type='See Location on Google Maps'));
	    		else
	    			ele.appendChild(createRowNode(au[i][attributes[a]]));
	    	}
	    }

	    if (au[i].permanently_closed != undefined)
			ele.className += 'closed-restaurant';

		// OPENING TIMES!!!!!!!

	 //    ele.appendChild(createRowNode(au[i].name));
	 //    ele.appendChild(createRowNode(au[i].formatted_address));
	 //    ele.appendChild(createRowNode(au[i].formatted_phone_number));
	 //    if (au[i].photo_urls != undefined)
	 //    	ele.appendChild(createRowNode(au[i].photo_urls, type='photos', index=i));
	 //    if (au[i].rating != undefined)
	 //    	ele.appendChild(createRowNode(au[i].rating));
	 //    if (au[i].price_level != undefined)
	 //    	ele.appendChild(createRowNode(au[i].price_level));
	 //    // ele.appendChild(createRowNode(au[i].types));
	 //    if (au[i].website != undefined)
	 //    	ele.appendChild(createRowNode(au[i].website, type='Go to Website'));
	 //    if (au[i].url != undefined)
		// 	ele.appendChild(createRowNode(au[i].url, type='See Location on Google Maps'));
		// if (au[i].permanently_closed != undefined) {
		// 	// ele.appendChild(createRowNode(au[i].permanently_closed));
		// 	ele.className += 'closed-restaurant';
		// }


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
	console.log('Loaded');
	populatePage();

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