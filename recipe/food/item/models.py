from django.db import models

class Recipe(models.Model):
    name=models.CharField(max_length=50)
    detail=models.CharField(max_length=50)
    # image=models.ImageField(upload_to=None, height_field=None, width_field=None, max_length=None)
    type=models.CharField(max_length=50,choices=(('VEG','VEG'),('NON-VEG','NON-VEG')))

    def __str__(self):
        return self.name
    
class ingrediants(models.Model):
    name=models.CharField(max_length=50)
    quantity=models.CharField(max_length=50)

    def __str__(self):
        return self.name    

