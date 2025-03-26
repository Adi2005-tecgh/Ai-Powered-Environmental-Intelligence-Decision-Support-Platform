from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .models import Product
from .forms import ProductForm

# ✅ List all products
def product_list(request):
    products = Product.objects.all()
    return render(request, 'gallery/index.html', {'products': products})

# ✅ View a specific product
def product_detail(request, pk):
    product = Product.objects.get(pk=pk)  # ✅ Fixed typo here
    return render(request, 'gallery/index2.html', {'product': product})

# ✅ Edit a product
def edit_product(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        form = ProductForm(request.POST, instance=product)
        if form.is_valid():
            form.save()
            return redirect('product_list')  # ✅ Redirect after saving
    else:
        form = ProductForm(instance=product)  
    return render(request, 'gallery/edit.html', {'form': form})  # ✅ Fixed indentation

# ✅ Delete a product
def delete_product(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        product.delete()
        return redirect('product_list')  # ✅ Use redirect, not render
    return render(request, 'gallery/delete.html', {'product': product})

# ✅ Simple home view
def home(request):
    return HttpResponse('Hello, World!')
