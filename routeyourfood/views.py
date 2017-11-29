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

# Create your views here.

KEY = 'AIzaSyDIeaoqxd3NoRAEgDlUOjN6QCulaw7N4aA'

# class FrontView(View):
# 	def get(self, request):
# 		return HttpResponse('front')

# def front(request):
# 	return render(request, 'routeyourfood/front.html')

class FrontView(generic.TemplateView):
	template_name = 'routeyourfood/front.html'

class RestaurantListView(generic.ListView):
	model = Restaurant
	context_object_name = 'restaurants'
	template_name = 'routeyourfood/details.html'
	paginate_by = 4

	@method_decorator(require_GET)
	def dispatch(self, request, *args, **kwargs):
		return super(RestaurantListView, self).dispatch(request, *args, **kwargs)

	def get_queryset(self, **kwargs):
		self.pids = self.request.session['place_ids']
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

def details(request, page, order):
	pids = request.session['place_ids']
	page = int(page)

	# total_pages = len(pids)/4 + 1
	# start = (page-1)*4
	# stop = page*4-1 if len(pids) > 3 else len(pids)

	ordering_dict = {
		'rating-asc': 'rating',
		'rating-desc': '-rating',
		'name-asc': 'name',
		'name-desc': '-name',
		'distance-asc': 'distance_from_route',
		'distance-desc': '-distance_from_route'
	}

	if order == 'default':
		obj_list = Restaurant.objects.filter(place_id__in=pids)
	else:
		obj_list = Restaurant.objects.filter(place_id__in=pids).order_by(ordering_dict[order])

	paginator = Paginator(obj_list, 4, allow_empty_first_page=False)

	try:
		objs = paginator.page(page)
	except PageNotAnInteger:
		objs = paginator.page(1)
	except EmptyPage:
		objs = paginator.page(paginator.num_pages)

	json_context = {'objs': objs, 'total_pages_gen': paginator.page_range, 'order': order}
	return render(request, 'routeyourfood/details.html', json_context)

def get_details(request):
	if request.is_ajax():
		place_id = request.POST['place_id']
		all_restos = Restaurant.objects.all()
		try:
			obj = Restaurant.objects.get(place_id=place_id)
			json_context = model_to_dict(obj)
			return HttpResponse(json.dumps(json_context))
		except Exception as e:
			return HttpResponseBadRequest()
		
def check_authentic(place):
	return (place.formatted_address and place.local_phone_number and place.photos)

def check_exists(place):
	try:
		Restaurant.objects.get(place_id=place.place_id)
		return True
	except ObjectDoesNotExist:
		return False

@require_POST
def process(request):
	if request.is_ajax():
		coord = request.POST.getlist('coords[]')
		distance = request.POST['distance']
		google_places = GooglePlaces(KEY)
		request.session['place_ids'] = []
		
		# for coord in coords:
		print "coord is ", coord
		lat, lng = float(coord[0]), float(coord[1])
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
				temp = request.session['place_ids']
				temp.append(obj.place_id)
				request.session['place_ids'] = temp
				continue
			
			place.get_details()
			
			if check_authentic(place):
			# 	print "place was also authentic"
			# 	print place.formatted_address
				curr_restaurants.append({'place_id': place.place_id, 'name': place.name, 'lat': Decimal(place.geo_location['lat']), 'lng': Decimal(place.geo_location['lng'])})
				temp = request.session['place_ids']
				temp.append(place.place_id)
				request.session['place_ids'] = temp

			# 	# get only 3 photos
				photo_urls = []
				for idx, photo in enumerate(place.photos):
					if idx == 3:
						break
					photo.get(maxheight=1600)
					photo_urls.append(photo.url)

				distance_from_route = haversine((float(place.geo_location['lat']), float(place.geo_location['lng'])), (lat, lng))
				print place.name
				print distance_from_route
				
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
				# break
		# return HttpResponse(json.dumps(curr_restaurants, cls=DjangoJSONEncoder))
		# return HttpResponse(pickle.dumps(curr_restaurants))
		# return HttpResponse(serializers.serialize("json", curr_restaurants))
		# print curr_restaurants
		# print json.dumps(curr_restaurants)
		return JsonResponse(curr_restaurants, safe=False)