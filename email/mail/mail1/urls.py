from django.urls import path
from .views import send_mail_page

urlpatterns = [
    path('', send_mail_page, name='send_mail'),
]
