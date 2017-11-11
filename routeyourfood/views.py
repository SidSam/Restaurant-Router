# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.views import View
from django.http import HttpResponse

# Create your views here.

class FrontView(View):
	def get(self, request):
		return HttpResponse('front')

def front(request):
	return render(request, 'routeyourfood/front.html')

def details(request):
	return render(request, 'routeyourfood/details.html')

def process(request):
	if request.is_ajax():
		# print request.POST
		# print 
		# print
		# print
		print request.POST.getlist('coords[]')
		return HttpResponse()