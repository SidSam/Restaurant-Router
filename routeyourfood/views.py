# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.views import generic
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from googleplaces import GooglePlaces, types, lang
from models import Restaurant
from django.core.exceptions import ObjectDoesNotExist
import simplejson as json
from decimal import *
from django.core import serializers
import traceback, sys
from haversine import haversine
from django.forms.models import model_to_dict
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.views.decorators.http import require_POST, require_GET
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views import View
import pickle

# Create your views here.

KEY = 'AIzaSyDIeaoqxd3NoRAEgDlUOjN6QCulaw7N4aA'

class LandingView(View):
	@method_decorator(require_GET)
	def dispatch(self, request, *args, **kwargs):
		return super(LandingView, self).dispatch(request, *args, **kwargs)

	def get(self, request, *args, **kwargs):
		request.session['place_ids'] = pickle.dumps(set())
		return render(request, 'routeyourfood/landingpage.html')

class FrontView(generic.TemplateView):
	template_name = 'routeyourfood/index.html'

class RestaurantListView(generic.ListView):
	model = Restaurant
	context_object_name = 'restaurants'
	template_name = 'routeyourfood/details.html'
	paginate_by = 4

	@method_decorator(require_GET)
	def dispatch(self, request, *args, **kwargs):
		return super(RestaurantListView, self).dispatch(request, *args, **kwargs)

	def get_queryset(self, **kwargs):
		self.pids = pickle.loads(self.request.session['place_ids'])
		self.order = self.kwargs['order']
		
		self.ordering_dict = {
			'rating-asc': 'rating',
			'rating-desc': '-rating',
			'name-asc': 'name',
			'name-desc': '-name',
			'distance-asc': 'distance_from_route',
			'distance-desc': '-distance_from_route'
		}
		
		if self.order == 'default':
			return Restaurant.objects.filter(place_id__in=self.pids)
		return Restaurant.objects.filter(place_id__in=self.pids).order_by(self.ordering_dict[self.order])

	def get_context_data(self, **kwargs):
		context = super(RestaurantListView, self).get_context_data(**kwargs)
		context['order'] = self.kwargs['order']
		return context
		
def check_authentic(place):
	return (place.formatted_address and place.local_phone_number and place.photos)

def check_exists(place):
	try:
		Restaurant.objects.get(place_id=place.place_id)
		return True
	except ObjectDoesNotExist:
		return False

@require_POST
@csrf_protect
def process(request):
	if request.is_ajax():
		lat, lng = request.POST['lat'], request.POST['lng']
		distance = request.POST['distance']
		google_places = GooglePlaces(KEY)

		# for coord in coords:
		query_result = google_places.radar_search(lat_lng={'lat': lat, 'lng': lng} , radius=distance, types=[types.TYPE_RESTAURANT])
		restaurants_from_db = []
		new_restaurants = []
		curr_restaurants = []

		for place in query_result.places:
			# check if place already exists in database
			if check_exists(place):
				obj = Restaurant.objects.get(place_id=place.place_id)
				curr_restaurants.append({'place_id': obj.place_id, 'name': obj.name, 'lat': Decimal(json.dumps(obj.lat, use_decimal=True)), 'lng': Decimal(json.dumps(obj.lng, use_decimal=True))})
				temp = pickle.loads(request.session['place_ids'])
				temp.add(obj.place_id)
				request.session['place_ids'] = pickle.dumps(temp)
				continue
				
			place.get_details()
				
			if check_authentic(place):
				curr_restaurants.append({'place_id': place.place_id, 'name': place.name, 'lat': Decimal(place.geo_location['lat']), 'lng': Decimal(place.geo_location['lng'])})
				temp = pickle.loads(request.session['place_ids'])
				temp.add(place.place_id)
				request.session['place_ids'] = pickle.dumps(temp)
				
				# get only 3 photos
				photo_urls = []
				for idx, photo in enumerate(place.photos):
					if idx == 3:
						break
					photo.get(maxheight=1600)
					photo_urls.append(photo.url)

				distance_from_route = haversine((float(place.geo_location['lat']), float(place.geo_location['lng'])), (float(lat), float(lng)))
					
				new_restaurant = Restaurant(place_id=place.place_id,
											name=place.name,
											address=place.formatted_address,
											phone=place.local_phone_number,
											rating=place.rating,
											website=place.website,
											maps_url=place.url,
											photos=photo_urls,
											lat=place.geo_location['lat'],
											lng=place.geo_location['lng'],
											distance_from_route=distance_from_route)
				new_restaurant.save()
		return JsonResponse(curr_restaurants, safe=False)	