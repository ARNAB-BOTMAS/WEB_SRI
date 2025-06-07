import requests
from dotenv import load_dotenv
import os

load_dotenv()

def get_weather(city="India"):
    api_key = os.getenv("WEATHER_API_KEY")
    base_url = os.getenv("SECRET_URL")
    params = {
        'q': city,
        'appid': api_key,
        'units': 'metric'
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        main = data['main']
        weather_desc = data['weather'][0]['description']
        temp = main['temp']
        humidity = main['humidity']
        return f"Todays weather in {city} will be {weather_desc}, Temperature will be {temp} and humidity is {humidity}"
    else:
        return {"error": f"Could not fetch weather for '{city}'."}

if __name__ == "__main__":
    print(get_weather())
