from django.urls import path
from .views import product_list, product_detail, price_history, update_prices

urlpatterns = [
    path('', product_list, name='product_list'),  # List all products
    path('<int:product_id>/', product_detail, name='product_detail'),
    path('<int:product_id>/history/', price_history, name='price_history'),
    path('update-prices/', update_prices, name='update_prices'),
]
