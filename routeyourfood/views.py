# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.views import View
from django.http import HttpResponse
from googleplaces import GooglePlaces, types, lang
from models import Restaurant
from django.core.exceptions import ObjectDoesNotExist
import simplejson as json
from decimal import *
from django.core import serializers
import traceback, sys
from django.forms.models import model_to_dict

# Create your views here.

KEY = 'AIzaSyDIeaoqxd3NoRAEgDlUOjN6QCulaw7N4aA'

class FrontView(View):
	def get(self, request):
		return HttpResponse('front')

def front(request):
	return render(request, 'routeyourfood/front.html')

def details(request):
	return render(request, 'routeyourfood/details.html')

def get_details(request):
	if request.is_ajax():
		place_id = request.POST['place_id']
		all_restos = Restaurant.objects.all()
		print all_restos
		try:
			obj = Restaurant.objects.get(place_id=place_id)
			print obj
			# json_context = serializers.serialize('json', obj)
			json_context = model_to_dict(obj)
		except Exception as e:
			traceback.print_tb(sys.exc_info()[2])
			print e
			print "no details for ", place_id
			json_context = {}
		
		return HttpResponse(json.dumps(json_context))

def check_authentic(place):
	return (place.formatted_address and place.local_phone_number and place.photos)

def check_exists(place):
	try:
		Restaurant.objects.get(place_id=place.place_id)
		return True
	except ObjectDoesNotExist:
		return False

def process(request):
	if request.is_ajax():
		coord = request.POST.getlist('coords[]')
		distance = request.POST['distance']
		google_places = GooglePlaces(KEY)
		
		# for coord in coords:
		print "coord is ", coord
		lat, lng = coord[0], coord[1]
		query_result = google_places.radar_search(lat_lng={'lat': lat, 'lng': lng} , radius=distance, types=[types.TYPE_RESTAURANT])
		restaurants_from_db = []
		new_restaurants = []
		curr_restaurants = []

		for place in query_result.places:
			print "place is ", place.place_id
			# check if place already exists in database
			if check_exists(place):
				print "already existing in db, so continuing"
				obj = Restaurant.objects.get(place_id=place.place_id)
				curr_restaurants.append({'place_id': obj.place_id, 'name': obj.name, 'lat': Decimal(json.dumps(obj.lat, use_decimal=True)), 'lng': Decimal(json.dumps(obj.lng, use_decimal=True))})
				continue
			
			place.get_details()
			
			if check_authentic(place):
			# 	print "place was also authentic"
			# 	print place.formatted_address
				curr_restaurants.append({'place_id': place.place_id, 'name': place.name, 'lat': Decimal(place.geo_location['lat']), 'lng': Decimal(place.geo_location['lng'])})
				
			# 	# get only 3 photos
				photo_urls = []
				for idx, photo in enumerate(place.photos):
					if idx == 3:
						break
					photo.get(maxheight=1600)
					photo_urls.append(photo.url)
				
				# new_restaurant = Restaurant(place_id=place.place_id,
				# 							name=place.name,
				# 							address=place.formatted_address,
				# 							phone=place.local_phone_number,
				# 							rating=place.rating,
				# 							website=place.website,
				# 							maps_url=place.url,
				# 							photos=photo_urls,
				# 							lat=place.geo_location['lat'],
				# 							lng=place.geo_location['lng'])
				# new_restaurant.save()
			# 	break
		# return HttpResponse(json.dumps(curr_restaurants, cls=DjangoJSONEncoder))
		# return HttpResponse(pickle.dumps(curr_restaurants))
		# return HttpResponse(serializers.serialize("json", curr_restaurants))
		# print curr_restaurants
		# print json.dumps(curr_restaurants)
		return HttpResponse(json.dumps(curr_restaurants))