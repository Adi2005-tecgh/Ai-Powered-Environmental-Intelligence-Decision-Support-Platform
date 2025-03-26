from django.db import models
from django.utils import timezone 

class business(models.Model):
    BUSINESS_TYPE=[
        ('TD','TRADING'),
        ('RS','RESTARANT'),
        ('SP','SHOP'),
    ]
    name=models.CharField(max_length=50)
    image=models.ImageField(upload_to='busi/')
    date=models.DateTimeField(default=timezone.now)
    type=models.CharField(max_length=50,choices=BUSINESS_TYPE)

    def __str__(self):
        return self.name
