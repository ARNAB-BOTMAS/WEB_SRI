import google.generativeai as genai
from dotenv import load_dotenv
import os
api_key = os.getenv("OPEN_API_KEY")
def open(data):
    genai.configure(api_key=api_key)

    # Initialize the GenerativeModel
    model = genai.GenerativeModel('gemini-2.0-flash')

    response = model.generate_content(data)

    # Remove all asterisks from the generated text
    cleaned_text = response.text.replace('*', '')

    return cleaned_text