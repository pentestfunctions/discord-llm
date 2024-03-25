from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

def send_message_to_discord(response_message, channelId, roomId):
    url = f"https://discord.com/api/v9/channels/{roomId}/messages"

    headers = {
        "Authorization": "",
        "Origin": "https://discord.com",
        "Referer": f"https://discord.com/channels/{channelId}/{roomId}",
    }

    data = {"content": response_message}

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        try:
            print(response.json())
        except ValueError:
            print("Received response, but it's not a valid JSON. Response content:")
    else:
        print(f"Received a {response.status_code} status code.")

@app.route('/receive-message', methods=['POST'])
def receive_message():
    data = request.json
    print(f"Received data: {data}")
    message = data.get('message', '')
    print(f"Received message: {message}")

    channelId = data.get('channelId', '')
    roomId = data.get('roomId', '')

    # Check if the message starts with "!askrobot" or ends with "?"
    if message.startswith("!askrobot") or message.endswith("?"):
        if message.startswith("!askrobot"):
            full_question = message.split("!askrobot")[1].strip()
        else:
            full_question = message
        
        customized_question2 = "You are a helpful discord bot ready to assist people. " + full_question
        gpt_response = generate_gpt_response([
            {"role": "user", "content": customized_question2},
        ])

        print("Successfully received response from LLM")

        send_message_to_discord(gpt_response, channelId, roomId)

        return jsonify({"message": gpt_response})

    return jsonify({"message": "Received but no action taken."})

def generate_gpt_response(messages):
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0.5,
        "max_tokens": 2000,
        "n": 1,
        "stop": None,
    }

    response = requests.post("http://localhost:1234/v1/chat/completions", json=payload)

    if response.status_code == 200:
        response_data = response.json()
        return response_data['choices'][0]['message']['content'].strip()
    else:
        print(f"Failed to get response from the local LLM. Status code: {response.status_code}")
        return "There was an error processing your request."

if __name__ == "__main__":
    app.run(debug=True)
