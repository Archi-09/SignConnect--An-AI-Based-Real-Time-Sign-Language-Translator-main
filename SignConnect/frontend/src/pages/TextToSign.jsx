import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function TextToSign() {
  // State Variables
  const [inputText, setInputText] = useState("");
  const [videoPlaylist, setVideoPlaylist] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef(null);

  // --- SPEECH RECOGNITION (Voice to Text) ---
  const startListening = () => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Change to 'hi-IN' for Hindi if needed
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Set the input text to what was spoken
      setInputText(transcript.toUpperCase());
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  // --- HANDLE INPUT CHANGE ---
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  // --- SEND TO BACKEND ---
  const handleConvert = async () => {
    if (!inputText) {
      alert("Please type or speak a word first!");
      return;
    }
    
    try {
      console.log("Sending text:", inputText);
      // Ensure this URL matches your backend address
      const response = await axios.post("[http://127.0.0.1:8000/text-to-sign](http://127.0.0.1:8000/text-to-sign)", {
        text: inputText
      });

      const videos = response.data.found_videos;
      const missing = response.data.missing_words;

      if (missing.length > 0) {
        // Log missing words but still play what was found
        console.warn(`Could not find videos/images for: ${missing.join(", ")}`);
      }
      
      if (videos.length > 0) {
        setVideoPlaylist(videos);
        setCurrentVideoIndex(0);
        setIsPlaying(true);
      } else {
        alert("No matching sign videos found.");
      }
    } catch (error) {
      console.error("Error converting text:", error);
      alert("Backend error. Is the python server running?");
    }
  };

  // --- MEDIA PLAYER LOGIC ---
  const handleVideoEnd = () => {
    // Play next item in playlist if available
    if (currentVideoIndex < videoPlaylist.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else {
      // End of playlist
      setIsPlaying(false);
    }
  };

  // Determine current media type (Video or Image)
  const currentMedia = videoPlaylist[currentVideoIndex];
  const isVideo = currentMedia && (
    currentMedia.toLowerCase().endsWith(".mp4") || 
    currentMedia.toLowerCase().endsWith(".avi") || 
    currentMedia.toLowerCase().endsWith(".mov") ||
    currentMedia.toLowerCase().endsWith(".mkv")
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-5">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Text to Sign Animation</h1>
      
      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl text-center">
        
        {/* Input Group with Microphone */}
        <div className="relative w-full mb-4">
            <input 
              className="w-full border-2 border-gray-300 p-4 pr-12 rounded-lg text-lg focus:outline-none focus:border-blue-500"
              placeholder="Type or click mic to speak..."
              value={inputText} 
              onChange={handleInputChange} 
            />
            
            <button 
                onClick={startListening}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Click to Speak"
            >
                {isListening ? (
                    <span className="text-xl">🛑</span> // Stop icon while listening
                ) : (
                    <span className="text-xl">🎤</span> // Mic icon
                )}
            </button>
        </div>
        
        <button 
          onClick={handleConvert}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition transform hover:scale-105"
        >
          Animate Sign 🎬
        </button>
      </div>

      {/* Media Player Section */}
      {videoPlaylist.length > 0 && (
        <div className="mt-8 border-4 border-black rounded-lg overflow-hidden bg-black shadow-2xl">
          {isVideo ? (
            // VIDEO PLAYER
            <video
              key={currentMedia} // Key forces re-render on new source
              ref={videoRef}
              src={currentMedia}
              autoPlay
              controls
              className="w-[600px] h-[400px]"
              onEnded={handleVideoEnd}
            />
          ) : (
            // IMAGE VIEWER (For static signs)
            <div className="relative w-[600px] h-[400px] flex items-center justify-center bg-gray-900">
                <img 
                  src={currentMedia} 
                  alt="Sign"
                  className="max-h-full max-w-full object-contain"
                />
                {/* Auto-advance image after 2 seconds if playlist is active */}
                {isPlaying && setTimeout(handleVideoEnd, 2000) && null} 
            </div>
          )}
          
          <p className="text-white text-center p-2 bg-gray-800 font-mono text-sm">
            Playing: {currentVideoIndex + 1} / {videoPlaylist.length}
          </p>
        </div>
      )}
    </div>
  );
}