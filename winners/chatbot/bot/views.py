from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def get_products(request):
    products = [
        {"id": 1, "name": "Laptop", "price": 800},
        {"id": 2, "name": "Phone", "price": 500},
    ]
    return Response(products)


