from django.db import models

class Recipe(models.Model):
    recipe_name=models.CharField(max_length=50)
    recipe_desp=models.CharField(max_length=100)
    recipe_image=models.ImageField(upload_to="recipe")

