# 🤖 LocalLLM-Discord-Tampermonkey

Easily chat with LocalLLM using the combination of Tampermonkey, Discord, and Flask.

---

## 📌 Prerequisites
1. **LM Studio**
   - https://lmstudio.ai/
   - Simply install it, choose a model to run and then in the local server tab choose start server.

3. **Discord Token**  
   - Open Discord in your web browser.
   - Launch the developer tools (usually F12 or right-click -> Inspect).
   - Navigate to the "Network" tab.
   - Send a message in chat. You'll notice a request titled "messages".
   - Click on this "messages" request and head over to the "Headers" tab.
   - Look for the section labeled "Authorization". The string you see there is your Discord token.

---

## 🚀 Getting Started

1. Update the `listener.py` file:
   - Set the Discord token.

2. Install the Tampermonkey script.

3. Start the `listener.py` file.

---

## 📝 Note

Any message containing `!askrobot` will trigger the script. It sends the message to your local LLM and forwards the response back to the Discord server via a POST request.
- It first takes the most recent messages in a discord server as they come in and sends them to the flask app.
- The flask app then takes that input and handles it to your local LLM.
- It then sends a post request to the discord channel with the response.
