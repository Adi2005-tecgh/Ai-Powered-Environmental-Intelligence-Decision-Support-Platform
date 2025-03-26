from django.shortcuts import render
from .models import business
def apphome(request):
    busi=business.objects.all()
    return render(request, 'app.html',{'busi':busi})
