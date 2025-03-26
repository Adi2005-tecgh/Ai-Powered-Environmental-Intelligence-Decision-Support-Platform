from django.urls import path
from .views import recipes, delete_recipe,update_recipe

urlpatterns = [
    path('recipes/', recipes, name='recipes'),
    path('deleterecipe/<int:id>/', delete_recipe, name='delete_recipe'), 
    path('updaterecipe/<int:id>/', update_recipe, name='update_recipe'), 
    
]
