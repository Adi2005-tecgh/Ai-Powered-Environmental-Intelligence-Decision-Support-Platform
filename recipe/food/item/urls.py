
from django.urls import path,include
from .views import RecipeViewSet
from rest_framework.routers import DefaultRouter

routers=DefaultRouter()
routers.register(r'recipes',RecipeViewSet)



urlpatterns = [
    path('',include(routers.urls) ),
]
