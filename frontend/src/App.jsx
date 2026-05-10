
import { useState, useEffect } from 'react';
import './App.css';

function App() {

    
    const [response, setResponse] = useState({ answer: '', emotion: '' });
    const [isListening, setIsListening] = useState(false); // * start it as false because we are not listening by default.
    const [transcript, setTranscript] = useState(''); // * this is the text that we are going to get from the  speech recogintion.
  


    // ! useEffect to start the wake word listner
    useEffect(() => {
    function toggleAwake() {
      const wakeRecognizer = new window.webkitSpeechRecognition(); // * speech api to listen for the wake word
      wakeRecognizer.lang = 'en-US'; // * set the language to american english (standard)
      wakeRecognizer.continuous = true; // ! keep listening until we get the wake word.
      wakeRecognizer.interimResults = false; // * only final result matters

      wakeRecognizer.onresult = (event) => {

        const heardText = event.results[event.results.length - 1][0].transcript.toLowerCase();


        // * if we heard the wake up word
        if (heardText.includes('wake up')){
         
          wakeRecognizer.stop(); // * stop listening for the wake word once we got it

          startListening(); // ! start the main listening function to listen to the user and get the response from the bot.

        };
      };
 

        // ? in case we stop start again
        wakeRecognizer.onend = () => {
          wakeRecognizer.start(); // * restart the wake word listener if it stops for any reason, to ensure the bot is always listening for the wake word.
        };

        wakeRecognizer.start(); // * start listening for the wake word when the app loads.

      
    }

    toggleAwake(); // * start the wake word listener when the app loads.
  }, []);

  










    // ! Function to listen to the user and transform it into text.
    function startListening() {


      const recognizeVoice = new window.webkitSpeechRecognition(); // * this is the speech rec api that we are going to use. built in to the browser (edge and chrome only).

      recognizeVoice.lang = 'en-US'; // * by default to american english, though that's not my preference it is standard.
      recognizeVoice.interimResults = false; // * this means that we only want the final resault from the phrase not the process of it being spoken.

      setIsListening(true); // * turn listening on.

      recognizeVoice.start(); // * start speech recognition.

      recognizeVoice.onresult = (event) => {

        const spokenText = event.results[0][0].transcript; // * this is the text we are going get from the recognition, 0 and 0 because we take the first result and first alternetive.
        setTranscript(spokenText); // * set the transcript to what we just got from the recognition.
        setIsListening(false); // * turn listening off after we get the result.
        sendMessage(spokenText); // * send the spoken text to the backend to get the ai response.
      };
      


      // ? Error Handling...
      recognizeVoice.onerror = (event) => {

        console.error('could not recognize audio:', event.error); // * log error message.
        setIsListening(false);
      }; 



      // * when user stops speakingm stop listening and reset the state.
      recognizeVoice.onend = () => {

        setIsListening(false); 
      };
    }



    // ! Commnication Function  to send the message that it gets from the function startListening to the backend and get the response from mistral ai
    function sendMessage(message) {
      fetch('http://localhost:5001/chat', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }), // * send the message as a json object to the backend.
      })

        .then(response => response.json())
        .then(data => {
            console.log('data:', data); // ? log data into the console
            setResponse({ answer: data.answer, emotion: data.emotion}); // * set the response state to the answer and emotion we get from the mistral ai in the backend.

            speak(data.answer); // * actually speak the response

        })

        // ? Error handling...

        .catch(error => console.error('Fetch error:', error)); // * log any error that might occur during the fetching to the flask route.

  
    }

 

    // ! Speaking Function to make the bot talk using the speech synthesis api using the text we get from send messae
    function speak(text){ // get text from the sendMessage function and use it to make the bot talk
      window.speechSynthesis.cancel(); // * cancel any speech that is happening so this one can be heard as to not overlap.


      
      // * create the speaking object -statement
      const statement = new window.SpeechSynthesisUtterance(text); // * this is the speech synthesis api that we are going to use to make our bot talk, it is also built in to the browser (edge and chrome only.)

      // * configure the object -statement
      statement.lang = 'en-US'; // * set the language to american english, ONCE AGAIN not my preference
      statement.pitch = 1.5; // * set the pitch to 2 to make it sound cute ig
      statement.rate = 1.15; // * set the rate to 1.15 to make it sound a bit faster and more lively.
      statement.volume = 1; // * base volume

      // * Voice Loading 
      
      const setVoiceAndSpeak = () => {

        const voices = window.speechSynthesis.getVoices(); // * get all the voices that the browser has.
        const robotVoice = voices.find( voice =>
          voice.name.includes('Google UK English Female') || // * get the specific voice.

          voice.name.includes('Alex') ||// ? macOS fallback

          voice.name.includes('Microsoft Zira Desktop - English (United States)') // ? edge and opera gx fallback

        );
        
        

        // ? IF the robotvoice actually exists
        if (robotVoice) statement.voice = robotVoice;
        setTimeout(() => { // ? add a small delay to ensure the voice is set before speaking.
        // * fire the statement.
        window.speechSynthesis.speak(statement)  // * use the statement configurations to actually create the sound
        }, ); //? add a small delay to ensure the voice is set before speaking.
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


    
  





return (
    <div className='container'>

        <div className='bot-section'>
            <p className='emotion'>Emotion: {response.emotion}</p>
            <p className='answer'>Answer: {response.answer}</p>
        </div>

        <div className='input-section'>
            <p className='transcript'>{transcript ? `You said: ${transcript}` : ''}</p>
            <button className='talk-button' onClick={startListening} disabled={isListening}>
                {isListening ? 'Listening...' : 'Talk to Clanka'}
            </button>
        </div>

    </div>

); 
};

export default App;
