from django.contrib import admin
from .models import Product, PriceHistory, UserPreference

admin.site.register(Product)
admin.site.register(PriceHistory)
admin.site.register(UserPreference)
