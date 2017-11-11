from django.conf.urls import url

from . import views
from django.views.generic import TemplateView

urlpatterns = [
	# url(r'^$', views.FrontView.as_view(), name='front'),
	# url(r'^$', TemplateView.as_view(template_name="routeyourfood/front.html")),
	url(r'^$', views.front, name='front'),
	url(r'^details', views.details, name='detailspage'),
	url(r'^process/$', views.process, name='process')
]