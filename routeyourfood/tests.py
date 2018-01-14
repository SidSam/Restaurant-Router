# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.test import TestCase
from django.urls import reverse
from routeyourfood.models import Restaurant
import random, string
from django.db import IntegrityError
from django.core.exceptions import ValidationError
import pickle

# Create your tests here.

place_id = 'AFx93Fnfso90HGOxhty'
photos_list = ['http://www.dummyurl_0.com', 'http://www.dummyurl_1.com', 'http://www.dummyurl_2.com']

class FrontViewTest(TestCase):
	def test_front_view(self):
		response = self.client.get(reverse('front'))
		self.assertEqual(response.status_code, 200)

class LandingViewTest(TestCase):
	def test_landing_view(self):
		response = self.client.get(reverse('landing'))
		self.assertEqual(response.status_code, 200)

class RestaurantDatabaseIntegrityTests(TestCase):
	def test_objects_with_same_place_id(self):
		Restaurant.objects.create(
			place_id=place_id,
			photos=photos_list,
			lat=78.999242,
			lng=56.134233,
			distance_from_route=50
		)
		try:
			Restaurant.objects.create(
			place_id=place_id,
			photos=photos_list,
			lat=78.999242,
			lng=56.134233,
			distance_from_route=50
		)
		except:
			self.assertRaises(IntegrityError)

	def test_object_with_null_photos(self):
		try:
			Restaurant.objects.create(
			place_id=place_id,
			lat=78.999242,
			lng=56.134233,
			distance_from_route=50
		)
		except:
			self.assertRaises(IntegrityError)

	def test_object_with_null_latitude(self):
		try:
			Restaurant.objects.create(
			place_id=place_id,
			photos=photos_list,
			lng=56.134233,
			distance_from_route=50
		)
		except Exception:
			self.assertRaises(IntegrityError)

	def test_object_with_null_longitude(self):
		try:
			Restaurant.objects.create(
			place_id=place_id,
			photos=photos_list,
			lat=78.999242,
			distance_from_route=50
		)
		except Exception:
			self.assertRaises(IntegrityError)

	def test_object_with_null_distance_from_route(self):
		try:
			Restaurant.objects.create(
			place_id=place_id,
			photos=photos_list,
			lat=78.999242,
			lng=56.134233
		)
		except:
			self.assertRaises(IntegrityError)

class RestaurantDatabaseValidationTests(TestCase):
	def test_object_with_long_place_id(self):
		try:
			Restaurant.objects.create(
				place_id=''.join(random.choice(string.digits) for _ in xrange(90)),
				photos=photos_list,
				lat=78.999242,
				lng=56.134233,
				distance_from_route=50
			)
		except Exception:
			self.assertRaises(ValidationError)

	def test_object_with_non_float_latitude(self):
		try:
			Restaurant.objects.create(
				place_id=place_id,
				photos=photos_list,
				lat='non_float_lat',
				lng=56.134233,
				distance_from_route=50
			)
		except Exception:
			self.assertRaises(ValidationError)

	def test_object_with_non_float_longitude(self):
		try:
			Restaurant.objects.create(
				place_id=place_id,
				photos=photos_list,
				lat=78.999242,
				lng='non_float_lng',
				distance_from_route=50
			)
		except Exception:
			self.assertRaises(ValidationError)

	def test_object_with_string_rating(self):
		try:
			Restaurant.objects.create(
				place_id=place_id,
				photos=photos_list,
				rating='string_rating',
				lat=78.999242,
				lng=56.134233,
				distance_from_route=50
			)
		except Exception:
			self.assertRaises(ValidationError)

	def test_object_with_string_distance_from_route(self):
		try:
			Restaurant.objects.create(
				place_id=place_id,
				photos=photos_list,
				lat=78.999242,
				lng=56.134233,
				distance_from_route='string'
			)
		except Exception:
			self.assertRaises(ValidationError)