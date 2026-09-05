import { useState } from "react";
import "./VoiceInput.css";

function VoiceInput({ onText }) {

    const [listening, setListening] = useState(false);

    const startListening = () => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        // Browser doesn't support speech recognition
        if (!SpeechRecognition) {

            alert(
                "Voice input is not supported in this browser. Please use Google Chrome."
            );

            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";

        recognition.continuous = false;

        recognition.interimResults = false;


        recognition.onstart = () => {

            setListening(true);

        };


        recognition.onresult = (event) => {

            const transcript =
                event.results[0][0].transcript;

            onText(transcript);

        };


        recognition.onerror = (event) => {

            console.log(
                "Speech recognition error:",
                event.error
            );

            setListening(false);

        };


        recognition.onend = () => {

            setListening(false);

        };


        recognition.start();

    };


    return (

        <button
            type="button"
            className={`voiceButton ${
                listening ? "listening" : ""
            }`}
            onClick={startListening}
            title={
                listening
                    ? "Listening..."
                    : "Voice input"
            }
        >

            <i
                className="fa-solid fa-microphone"
            ></i>

        </button>

    );

}

export default VoiceInput;