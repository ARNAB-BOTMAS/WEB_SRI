from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from AI import simple_chatbot

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/post-data', methods=['POST'])
def post_data():
    data = request.json  # data is a dict like {"message": "hi"}
    message = data.get('message', '')  # get the string message
    response_text = simple_chatbot(message)
    return jsonify({
        'received': response_text
    })

if __name__ == '__main__':
    app.run(debug=True)
