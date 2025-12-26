import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceSearch = ({ onSearch }) => {
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Web Speech API is not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onSearch(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <button
            type="button"
            onClick={startListening}
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            title="Search by voice"
            style={{
                background: isListening ? '#ff4d4d' : 'var(--secondary-color)',
                marginLeft: '10px'
            }}
        >
            {isListening ? <MicOff /> : <Mic />}
        </button>
    );
};

export default VoiceSearch;
