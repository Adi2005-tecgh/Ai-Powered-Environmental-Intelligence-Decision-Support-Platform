from django.urls import path
from . import views

urlpatterns = [
    path('', views.apphome, name='apphome'),
]
