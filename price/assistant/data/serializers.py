from rest_framework import serializers
from .models import Product, PriceHistory

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class PriceHistorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PriceHistory
        fields = ['product_name', 'price', 'timestamp']
