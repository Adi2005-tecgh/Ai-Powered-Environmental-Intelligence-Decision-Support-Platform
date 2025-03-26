from django.db import models

class Company(models.Model):
    company_id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=50)
    locations=models.CharField(max_length=100)
    about=models.TextField()
    type=models.CharField(max_length=50,choices=(('IT','IT'),
                                                 ('NON IT','NON IT')
                                                 ))
    added_at=models.DateTimeField(auto_now=True)
    active=models.BooleanField(default=True)
    def __str__(self):
        return self.name

class Employee(models.Model):
    name=models.CharField(max_length=50)
    email=models.CharField(max_length=100)
    address=models.CharField(max_length=100)
    phone=models.CharField(max_length=10)
    positions=models.CharField(max_length=50,choices=(('MANAGER','MANAGER'),
                                                 ('WEB DEVELOPER','WD')
                                                 ))
    company=models.ForeignKey(Company,on_delete=models.CASCADE)  
    def __str__(self):
        return self.name

