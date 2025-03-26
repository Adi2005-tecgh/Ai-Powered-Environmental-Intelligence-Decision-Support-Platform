from rest_framework import serializers
from .models import Recipe

class recipeSerializer(serializers.ModelSerializer):
    class Meta:
        model=Recipe
        fields="__all__"

