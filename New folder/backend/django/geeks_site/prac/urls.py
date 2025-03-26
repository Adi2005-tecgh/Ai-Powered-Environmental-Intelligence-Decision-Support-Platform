
from django.urls import path
from . import views

urlpatterns = [
    path('',views.prac,name='prac'),

]