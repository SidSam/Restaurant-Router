# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.views import View
from django.http import HttpResponse
from googleplaces import GooglePlaces, types, lang
from models import Restaurant
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.

KEY = 'AIzaSyDIeaoqxd3NoRAEgDlUOjN6QCulaw7N4aA'

class FrontView(View):
	def get(self, request):
		return HttpResponse('front')

def front(request):
	return render(request, 'routeyourfood/front.html')

def details(request):
	return render(request, 'routeyourfood/details.html')

def check_authentic(place):
	try:
		Restaurant.objects.get(name=place.name, address=place.formatted_address)
		return False
	except ObjectDoesNotExist:
		return (place.formatted_address and place.local_phone_number and place.photos)

def check_exists(place):
	try:
		Restaurant.objects.get(name=place.name, address=place.formatted_address)
		return True
	except:
		return False

def process(request):
	if request.is_ajax():
		coords = request.POST.getlist('coords[]')
		distance = request.POST['distance']
		google_places = GooglePlaces(KEY)
		set_of_unique_place_ids = set()
		# set_of_encountered_non_authentic_place_ids = set()

		for coord in coords:
			print "coord is ", coord
			lat, lng = coord.split(',')
			query_result = google_places.radar_search(lat_lng={'lat': lat, 'lng': lng} , radius=distance, types=[types.TYPE_RESTAURANT])
			
			for place in query_result.places:
				# print "place is ", place
				if place.place_id not in set_of_unique_place_ids:
					print "unique place"
					set_of_unique_place_ids.add(place.place_id)
					# check if place already exists in database
					if check_exists(place):
						continue
					place.get_details()
					if check_authentic(place):
						print "place was also unique"
						print place.formatted_address
						# get only 3 photos
						photo_urls = []
						for idx, photo in enumerate(place.photos):
							if idx == 3:
								break
							photo.get(maxheight=1600)
							photo_urls.append(photo.url)

						new_restaurant = Restaurant(name=place.name,
													address=place.formatted_address,
													phone=place.local_phone_number,
													rating=place.rating,
													website=place.website,
													maps_url=place.url,
													photos=photo_urls)
						new_restaurant.save()
		return HttpResponse()