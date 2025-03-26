from django.db import models

class Product(models.Model):
    name=models.CharField(max_length=255)
    description=models.TextField(max_length=500)
    image=models.ImageField(upload_to='products/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    def edit(self,name,description,image):
        self.name=name
        self.description=description
        self.image=image
        self.save
    
    def short_des(self):
        words=self.description.split()
        if len(words)>50:
            return ' '.join(words[:30])+'....'
        else:
            return self.description

