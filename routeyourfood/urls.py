from django.conf.urls import url

from . import views
# from django.views.generic.base import TemplateView
# from django.views.generic.list import ListView

urlpatterns = [
	url(r'^$', views.LandingView.as_view(), name='landing'),
	url(r'^front/$', views.FrontView.as_view(), name='front'),
	url(r'^details/(?P<page>[0-9]+)/(?P<order>[a-z\-]+)/$', views.RestaurantListView.as_view(), name='detailspage'),
	url(r'^front/process/$', views.process, name='process')
]