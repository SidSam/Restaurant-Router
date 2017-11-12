# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Restaurant(models.Model):
	place_id = models.CharField(max_length=50)
	name = models.CharField(max_length=20)
	address = models.CharField(max_length=500)
	phone = models.CharField(max_length=20)
	rating = models.FloatField(null=True)
	website = models.URLField(null=True)
	maps_url = models.URLField(null=True)
	photos = ArrayField(models.URLField())