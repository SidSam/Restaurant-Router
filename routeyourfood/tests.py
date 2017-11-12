# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.test import TestCase
from django.urls import reverse

# Create your tests here.

class FrontViewTests(TestCase):
	def test_front_view(self):
		response = self.client.get(reverse('front'))
		self.assertEqual(response.status_code, 200)
		
