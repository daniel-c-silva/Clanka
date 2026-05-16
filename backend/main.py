from flask import Flask, request, jsonify
import flask
from mistralai.client import Mistral
from flask_cors import CORS
import psycopg2 # * import postgres sql
import os
from dotenv import load_dotenv

# !---SETUP


load_dotenv() # * load variables from .env file

# * postgres setup
conn = psycopg2.connect(os.getenv("DATABASE_URL"))


cursor = conn.cursor()



# * create table if not exists for storing convo.



cursor.execute('''CREATE TABLE IF NOT EXISTS memory (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL, 
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL
)''')
conn.commit()
cursor.close()
conn.close()




# * flask setup


app = Flask(__name__) # * the app using it to create routes and stuff
CORS(app)



# * mistral setup


MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY") # * mistral key from .env
client = Mistral(api_key=MISTRAL_API_KEY)




# ! --- HELPER FUNCTIONS



# ! Helper function to simplify the connection and cursor definition
def getDB():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    return conn, conn.cursor()



# ! context helper function
def getContext(session_id):
    # * we are going to take the last 5 user messages and the last 5 bot replies from the database
    conn, cursor = getDB()
    cursor.execute('''SELECT user_message, bot_response
    FROM memory
    WHERE session_id = %s
    ORDER BY id DESC
    LIMIT 5''', (session_id,)) # * get the last 5 messages for the session id
    rows = cursor.fetchall() # * fetch all rows
    context = ""
    for row in rows:
        user_message, bot_response = row
        context += f"User: {user_message}\nBot: {bot_response}\n"
    cursor.close()
    conn.close()
    return context



# ! Conversation Helper function
def conversation(context, userMessage):
    prompt = f"""You are Clanka, an AI robot friend. Helpful, a little childish and playful, but you talk like a normal person in a casual conversation.
    STRICT Rules you must NEVER break:
    - NEVER use asterisks or actions like *dances* or *eyes light up* or *giggles*
    - NEVER use bold text or any markdown formatting
    - NEVER give lists or options
    - NEVER use italics
    - Keep it short, 1-3 sentences max
    - Just talk like a friend texting back, plain words only
    Previous conversation (for context only, focus on the latest message):
    {context}
    Latest message (answer THIS): {userMessage}"""
    
    response = client.chat.complete(
        model = "mistral-small-latest",
        messages = [{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content # * choices[0] is the first response, message.content is the content of the response



# ! Emotions Helper Function
def getEmotions(userMessage):
    prompt = f"in one word what does this ({userMessage}) make you feel? your options are: happy, sad, angry, neutral, excited, scared, confused, frustrated, and surprised"
    response = client.chat.complete(
        model="mistral-tiny", # * cheaper and faster model, enough for emotion detection
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content



# ! store in db Helper function
def storeInDb(userMessage, botResponse, session_id):
    conn, cursor = getDB() # * get the connection and cursor
    cursor.execute('''INSERT INTO memory (user_message, bot_response, session_id)
    VALUES (%s, %s, %s)''', (userMessage, botResponse, session_id))
    # * added to keep the last 5 messages in the db
    # * delete everything except the last 5 rows for memory management.
    cursor.execute('''DELETE FROM memory
    WHERE session_id = %s
    AND id NOT IN (SELECT id FROM memory
    WHERE session_id = %s
    ORDER BY id DESC
    LIMIT 5)''', (session_id, session_id))
    conn.commit()
    cursor.close()
    conn.close()


    # ! generate response Helper function
def generate_response(userMessage, session_id): # * get all serves to get the answer and the emotion
    context = getContext(session_id) # * get the context for the session id 
    answer = conversation(context, userMessage)
    emotion = getEmotions(userMessage)
    storeInDb(userMessage, answer, session_id) # * store the convo in the database.
    return jsonify({
        "answer": answer,
        "emotion": emotion
    })



# !--- FLASK APP



# ! home route
@app.route("/")
def home():
    return "Hello, this is the backend for the chatbot application!"




# ! chat route
@app.route('/chat', methods=['POST'])
# ! chat endpoint
def chatEndpoint(): # * chat endpoint serves to get the message from the user
    data = request.json # * get the data from the request. the userMessage basically
    user_message = data.get("message") # * get the message from the data
    session_id = data.get("session_id") # * get the session id from the data
    if not user_message: # ? if the message is not found
        return jsonify({"error": "User message was not found"})
    result = generate_response(user_message, session_id) # * get the result from the getAll function
    return result




if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("FLASK_PORT", 5001)), host='0.0.0.0')
