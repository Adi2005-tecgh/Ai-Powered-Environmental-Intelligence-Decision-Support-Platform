from django.http import HttpResponse
from django.shortcuts import render

def home(request):
    # return HttpResponse("This is the home page")
    return render(request,'index.html')

def contact(request):
    return HttpResponse("This is the contact page")

def info(request):
    return HttpResponse("This is the info page")