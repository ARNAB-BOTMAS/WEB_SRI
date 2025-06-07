import nltk
from nltk.chat.util import Chat, reflections
from weather import get_weather
from open import open
pairs = [
    [r"my name is (.*)", ["Hello %1, how can I help you today?"]],
    [r"hi|hello|hey", ["Hello!", "Hey there!", "Hi :)"]],
    [r"what is your name\??", ["I'm Srishti AI, your friendly AI chatbot!"]],
    [r"what Are you\??|Who are you", ["I'm Srishti AI, Speak Recognition Internal System Host Technical Intelligence Created by Arnab Mondal"]],
    [r"who created you\??|creator|create you", ["I was created by Arnab Mondal."]],
    [r"who is your owner\??|Own you|Owner", ["My owner is Arnab Mondal."]],
    [r"how are you ?", ["I'm fine, thanks!", "Doing great. How can I help you?"]],
    [r"sorry (.*)", ["No problem!", "It's okay, don't worry."]],
    [r"quit", ["Bye! Have a great day."]],
    [r"what are you doing\??", ["I am assisting you with your queries."]],
    [r"how can you help me\??", ["I can answer your questions, chat with you, and assist with tasks."]],
    [r"tell me a joke", ["Why did the computer show up at work late? It had a hard drive!"]],
    [r"what is the time\??", ["I don't have a clock, but you can check your device's time."]],
    [r"thank you|thanks", ["You're welcome!", "No problem!", "Anytime!"]],
    [r"do you like (.*)\??", ["I don't have feelings, but %1 sounds interesting!"]],
    [r"(.*) weather (.*)", [lambda matches: get_weather()]],  # Use weather function dynamically
    [r"what can you do\??", ["I can chat, answer questions, tell jokes, and help with many tasks."]],
    [r"(.*) your favorite (.*)", ["I don't have preferences, but I can talk about %2 if you want!"]],
    [r"tell me something interesting", ["Did you know the first computer virus was created in 1983?"]],
    [r"(.*) help (.*)", ["I'm here to help! What do you need assistance with?"]],
    [r"(.*) love (.*)", ["Love is a beautiful thing! Tell me more."]],
    [r"(.*) food (.*)", ["I don't eat, but I love talking about food! What's your favorite?"]],
    [r"bye|exit|see you", ["Goodbye! Take care.", "See you later!"]],
    [r"(.*)", ["I'm not sure I understand. Can you rephrase?"]]
]
    
def simple_chatbot(user_input):
    chatbot = Chat(pairs, reflections)
    response = chatbot.respond(user_input)
    # If NLTK chatbot doesn't respond or fallback response, use ChatGPT
    if not response or response.lower() in ["i'm not sure i understand. can you rephrase?"]:
        if "weather" in user_input.lower():
            response = get_weather()
            print(response)
        else:
            response = open(user_input)
    return response
