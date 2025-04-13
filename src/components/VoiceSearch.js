import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';

const VoiceSearch = ({ onSearchResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState(null);
  // Add a ref to track the initialization state
  const isInitialized = useRef(false);
  // Add a ref to track if we're in the process of starting/stopping
  const inTransition = useRef(false);
  
  // Initialize speech recognition on component mount
  useEffect(() => {
    if (isInitialized.current) return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Create speech recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Configure recognition
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      // Set up event handlers
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setError(null);
        inTransition.current = false;
        console.log('Recognition started');
      };
      
      recognitionInstance.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setTranscript(currentTranscript);
        
        // If this is a final result, send it to parent component
        if (event.results[0].isFinal) {
          onSearchResult(currentTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
        inTransition.current = false;
      };
      
      recognitionInstance.onend = () => {
        console.log('Recognition ended');
        setIsListening(false);
        inTransition.current = false;
      };
      
      setRecognition(recognitionInstance);
      isInitialized.current = true;
    } else {
      setError('Speech recognition not supported in this browser');
    }
    
    // Cleanup function to stop recognition when component unmounts
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (err) {
          console.error('Error stopping recognition on unmount:', err);
        }
      }
    };
  }, []);
  
  const toggleListening = () => {
    if (!recognition || inTransition.current) return;
    
    inTransition.current = true; // Set the transition flag to prevent rapid clicks
    
    if (isListening) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
        inTransition.current = false;
      }
    } else {
      setTranscript('');
      try {
        recognition.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        inTransition.current = false;
        
        // If we get an invalid state error, try to reset it
        if (err.name === 'InvalidStateError') {
          setTimeout(() => {
            try {
              recognition.stop();
              setTimeout(() => {
                inTransition.current = false;
                setIsListening(false);
              }, 300);
            } catch (e) {
              console.error('Failed to reset recognition:', e);
              inTransition.current = false;
              setIsListening(false);
            }
          }, 300);
        }
      }
    }
  };
  
  if (!recognition && !error) {
    return null; // Still initializing
  }
  
  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`flex items-center justify-center rounded-full w-10 h-10 ${
          isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        } text-white transition-colors ${inTransition.current ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Stop listening' : 'Start voice search'}
        disabled={!!error || inTransition.current}
      >
        {isListening ? <FaStop /> : <FaMicrophone />}
      </button>
      
      {isListening && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-3 w-64">
          <div className="text-sm text-gray-600 mb-2">
            {transcript || 'Listening...'}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                ></div>
              ))}
            </div>
            <button
              onClick={toggleListening}
              className="text-xs text-red-500 hover:text-red-700"
              disabled={inTransition.current}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-full right-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600 w-64">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceSearch; 