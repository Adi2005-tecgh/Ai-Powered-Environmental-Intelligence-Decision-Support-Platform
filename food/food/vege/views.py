from django.shortcuts import render, redirect
from .models import Recipe

# Create your views here.
def recipes(request):
    if request.method == 'POST':
        data = request.POST
        recipe_name = data.get('recipe_name')
        recipe_desp = data.get('recipe_desp')
        recipe_image = request.FILES.get('recipe_image')

        # Create Recipe object
        Recipe.objects.create(
            recipe_name=recipe_name,
            recipe_desp=recipe_desp,
            recipe_image=recipe_image
        )
        return redirect('/vege/recipes/') 
    
    # Fetch all recipes
    queryset = Recipe.objects.all()
    context = {'recipes': queryset}
    
    return render(request, 'vege/recipes.html', context)

def delete_recipe(request,id):
    queryset=Recipe.objects.get(id=id)  
    queryset.delete()
    return redirect('/vege/recipes/') 

def update_recipe(request, id):
    queryset = Recipe.objects.get(id=id)
    
    if request.method == 'POST':
        recipe_name = request.POST.get('recipe_name')
        recipe_desp = request.POST.get('recipe_desp')
        recipe_image = request.FILES.get('recipe_image')

        queryset.recipe_name = recipe_name
        queryset.recipe_desp = recipe_desp
        
        if recipe_image:
            queryset.recipe_image = recipe_image
        
        queryset.save()
        return redirect('/vege/recipes/') 

    content = {'recipe': queryset}
    return render(request, 'vege/update_recipe.html', content)


