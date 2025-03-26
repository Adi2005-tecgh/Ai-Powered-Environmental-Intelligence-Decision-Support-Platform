from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product, PriceHistory
from .tasks import update_product_prices

def product_list(request):
    products = Product.objects.values('id', 'name', 'category', 'url')
    return JsonResponse(list(products), safe=False)

def update_prices(request):
    """Trigger Celery task to update product prices"""
    task = update_product_prices.delay()  # Run Celery task asynchronously
    return JsonResponse({"task_id": task.id, "status": "Started"})

# ✅ Caching Logic
def get_product(product_id):
    cache_key = f"product_{product_id}"
    return cache.get_or_set(cache_key, lambda: Product.objects.get(id=product_id), timeout=60 * 60)  # 1-hour cache

# ✅ API to Fetch Product Details
@api_view(['GET'])
def product_detail(request, product_id):
    try:
        product = get_product(product_id)
        return Response({
            "id": product.id,
            "name": product.name,
            "url": product.url,
            "category": product.category,
        })
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

# ✅ API to Fetch Price History
@api_view(['GET'])
def price_history(request, product_id):
    try:
        product = get_product(product_id)
        history = PriceHistory.objects.filter(product=product).order_by('-date')

        return Response([
            {"price": entry.price, "date": entry.date} for entry in history
        ])
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

# ✅ API to Manually Trigger Celery Price Update
@api_view(['POST'])
def trigger_price_update(request):
    update_product_prices.delay()  # Run task in the background
    return Response({"message": "Price update task started"}, status=status.HTTP_202_ACCEPTED)
