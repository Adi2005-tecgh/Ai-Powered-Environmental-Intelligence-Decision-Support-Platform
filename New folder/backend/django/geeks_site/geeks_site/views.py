from django.http import HttpResponse
from django.shortcuts import render


def home(request):
    return render(request,'websites/index.html')

def about(request):
    return HttpResponse("Helloe to about page")

def contact(request):
    return HttpResponse("Helloe to contact page")    