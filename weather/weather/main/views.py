from django.shortcuts import render
import json
import urllib.request

def index(request):
    if request.method == 'POST':
        city = request.POST['city']

        # Make the API request
        source = urllib.request.urlopen( 
            f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid=f02fba0ab4abcbc1091f4c8fc28582f6'
        ).read()
        
        # Convert JSON response to Python dictionary
        list_of_data = json.loads(source)
        
        # Create a data dictionary to pass to the template
        data = {
            "country_code": str(list_of_data['sys']['country']), 
            "coordinate": f"{list_of_data['coord']['lon']} {list_of_data['coord']['lat']}",
            "temp": f"{list_of_data['main']['temp']}K",
            "pressure": str(list_of_data['main']['pressure']),
            "humidity": str(list_of_data['main']['humidity']),
        }
        
        print(data)  # Debugging output
        
    else:
        data = {}

    return render(request, "main/index.html", data)
