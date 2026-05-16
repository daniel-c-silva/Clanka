import { useState, useRef } from 'react';
import './App.css';

function App() {

    
    const [response, setResponse] = useState({ answer: '', emotion: '' });
    const [isListening, setIsListening] = useState(false); // * start it as false because we are not listening by default.
    const [transcript, setTranscript] = useState(''); // * this is the text that we are going to get from the  speech recogintion.

    const [isConnecting, setIsConnecting] = useState(false); // * this state is to handle the connection state to the server on render.

    const recognizeVoice = useRef(null); // * store the recognition instance so we can stop and start it from anywhere.
      




    // ! Function to listen to the user and transform it into text.
    function startListening() {


      recognizeVoice.current = new window.webkitSpeechRecognition(); // * this is the speech rec api that we are going to use. built in to the browser (edge and chrome only).

      recognizeVoice.current.lang = 'pt-PT'; // * by default to european portuguese // * by default to american english, though that's not my preference it is standard.
      recognizeVoice.current.interimResults = false; // * this means that we only want the final resault from the phrase not the process of it being spoken.

      setIsListening(true); // * turn listening on.

      recognizeVoice.current.start(); // * start speech recognition.

      // difference between start speech recoginition and start listening is that speechrec is the actual api function whereas start listening is our our state function that turns on the listening.

      recognizeVoice.current.onresult = (event) => {

        const spokenText = event.results[0][0].transcript; // * this is the text we are going get from the recognition, 0 and 0 because we take the first result and first alternetive.
        setTranscript(spokenText); // * set the transcript to what we just got from the recognition.
        setIsListening(false); // * turn listening off after we get the result.
        sendMessage(spokenText); // * send the spoken text to the backend to get the ai response.
      };
      


      // ? Error Handling...
      recognizeVoice.current.onerror = (event) => {

        console.error('could not recognize audio:', event.error); // * log error message.
        setIsListening(false);
      }; 



      // * when user stops speakingm stop listening and reset the state.
      recognizeVoice.current.onend = () => {

        setIsListening(false); 
      };
    }



    // ! Commnication Function  to send the message that it gets from the function startListening to the backend and get the response from mistral ai
    function sendMessage(message) {
      setIsConnecting(true); // * set connecting to true.

      fetch('https://clanka-ekde.onrender.com/chat', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, session_id: generateSessionID() }), // * send the message as a json object to the backend. AND send the session id so the backend can identify the user in the data base
      })

        .then(response => response.json())
        .then(data => {
            setIsConnecting(false); // * set connecting to false after we get the backend response.
            console.log('data:', data); // ? log data into the console

            setResponse({ answer: data.answer, emotion: data.emotion}); // * set the response state to the answer and emotion we get from the mistral ai in the backend.

            speak(data.answer); // * actually speak the response

        })

        // ? Error handling...

        .catch(error => console.error('Fetch error:', error)); // * log any error that might occur during the fetching to the flask route.

  
    }

   // ! speaking function to make bot talk using the speech synthesis api , it takes text as an argument from the sendmessage function
    function speak(text){ // get text from the sendMessage function and use it to make the bot talk
      window.speechSynthesis.cancel(); // * cancel any speech that is happening so this one can be heard as to not overlap.

      recognizeVoice.current.stop(); // * stop listening while clanka speaks so he doesn't hear himself and get answers himself by accident.
      
      // * create the speaking object -statement
      const statement = new window.SpeechSynthesisUtterance(text); // * this is the speech synthesis api that we are going to use to make our bot talk, it is also built in to the browser (edge and chrome only.)

      // * configure the object -statement
      statement.lang = 'pt-PT'; // * set the language to european portuguese // * set the language to american english, ONCE AGAIN not my preference
      statement.pitch = 1; // * set the pitch to 2 to make it sound cute ig
      statement.rate = 1.1; // * set the rate to 1.15 to make it sound a bit faster and more lively.
      statement.volume = 1; // * base volume

      // * Voice Loading 
      
      const setVoiceAndSpeak = () => {

        const voices = window.speechSynthesis.getVoices(); // * get all the voices that the browser has.
        const robotVoice = voices.find( voice =>
          voice.name.includes('Google português do Brasil') || // * get the specific voice.

          voice.name.includes('Alex') ||// ? macOS fallback

          voice.name.includes('Microsoft Zira Desktop - English (United States)') // ? edge and opera gx fallback

        );
        
        

        // ? IF the robotvoice actually exists
        if (robotVoice) statement.voice = robotVoice;
        setTimeout(() => { // ? add a small delay to ensure the voice is set before speaking.
        // * fire the statement.
        window.speechSynthesis.speak(statement);  // * use the statement configurations to actually create the sound
        }, ); //? add a small delay to ensure the voice is set before speaking.
      };

      // * once the phrase is done being spoken start listening again so we can continue the convo
      statement.onend = () => {
        startListening(); 
      };

      

      // ? TO SPEED THINGS UP

      // * IF the api voice was ALREADY loaded use it, as to not wait for the loading each time.

      if (window.speechSynthesis.getVoices().length > 0){ // * if the amount of voices loaded is above 0 
        setVoiceAndSpeak(); // * call the speaking function
      }
      else {
        window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak; // * if not wait for the voices to load and then call the speaking function
      }

    }

    function generateSessionID() {

      let id = localStorage.getItem('sessionID'); // * try to get the session id from local storage in case the user HAS already talked to the bot before

      if (!id) {
        id = crypto.randomUUID(); // * if there is no session id in local storage generate a new one using the crypto api from the browser.
        localStorage.setItem('sessionID', id); // * save the id to local storage
      }

      return id; // * return the id so it can be used in the backend to identify the user

    }

    

return (
    <div className='container'>

            

        <div className='bot-section'>
            <p className='emotion'>Emotion: {response.emotion}</p>
            <p className='answer'>Answer: {response.answer}</p>
        </div>

        <div className='input-section'>
            <p className='transcript'>{transcript ? `You said: ${transcript}` : ''}</p> { /* if there is a transcript show it, if not do nothing. */}
            <p className='status'>{isConnecting ? 'Connecting to the server...': ''}</p> { /* if we are connecting to the sv show this, if not nothing */ }
            <button className='talk-button' onClick={startListening} disabled={isListening}>
                {isListening ? 'Listening...' : 'Talk to Clanka'}
            </button>
        </div>

    </div>

); 
};

export default App;
