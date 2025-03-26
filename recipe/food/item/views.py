from django.shortcuts import render
from .models import Recipe
from .serializers import recipeSerializer
from rest_framework import viewsets


class RecipeViewSet(viewsets.ModelViewSet):  # ✅ Use ViewSet instead of generic view
    queryset = Recipe.objects.all()
    serializer_class = recipeSerializer
