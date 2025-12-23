import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { predictSign } from '../api/api';

export default function SignToText() {
  const webcamRef = useRef(null);
  const [prediction, setPrediction] = useState("Waiting...");
  const [cameraStatus, setCameraStatus] = useState("Loading Camera...");

  // Camera settings
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  // --- TEXT TO SPEECH LOGIC ---
  const speakPrediction = () => {
    if ('speechSynthesis' in window) {
        // Clean the prediction string (e.g. "HELLO (98%)" -> "HELLO")
        const textToSpeak = prediction.split('(')[0].trim();
        
        if (textToSpeak && textToSpeak !== "Waiting..." && textToSpeak !== "Error") {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            // You can set language here if needed, e.g., utterance.lang = 'hi-IN';
            window.speechSynthesis.speak(utterance);
        }
    } else {
        alert("Text-to-Speech not supported in this browser.");
    }
  };

  // --- CAPTURE & PREDICT LOGIC ---
  const capture = useCallback(async () => {
    if (!webcamRef.current) {
        console.error("❌ Webcam reference is missing!");
        return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    
    if (imageSrc) {
      try {
        // Convert base64 image to blob for upload
        const blob = await (await fetch(imageSrc)).blob();
        const formData = new FormData();
        formData.append("file", blob, "sign.jpg");

        console.log("🚀 Sending image to backend...");
        const { data } = await predictSign(formData);
        
        console.log("✅ Prediction received:", data);
        
        // Format the prediction string
        const confidence = data.confidence ? (data.confidence * 100).toFixed(0) : 0;
        setPrediction(`${data.label} (${confidence}%)`);
        
      } catch (error) {
        console.error("❌ Prediction failed", error);
        setPrediction("Error: Is Backend Running?");
      }
    } else {
        console.error("❌ Failed to take screenshot. Is camera active?");
    }
  }, [webcamRef]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Sign to Text Translation</h1>
      
      {/* Webcam Container */}
      <div className="relative border-4 border-blue-500 rounded-lg overflow-hidden bg-black shadow-2xl" 
           style={{ minHeight: "480px", minWidth: "640px" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
          videoConstraints={videoConstraints}
          onUserMedia={() => setCameraStatus("Camera Active ✅")}
          onUserMediaError={(err) => setCameraStatus(`❌ Camera Error: ${err.message}`)}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        {/* Camera Status Overlay */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded text-sm z-10">
            Status: {cameraStatus}
        </div>
      </div>

      {/* Result & Audio Area */}
      <div className="mt-8 p-4 bg-gray-800 rounded-xl shadow-lg w-full max-w-lg text-center border border-gray-700 flex items-center justify-between px-8">
        <div className="text-left">
            <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-1">Detected Sign</h2>
            <p className="text-4xl font-extrabold text-yellow-400">{prediction}</p>
        </div>
        
        {/* Speak Button */}
        <button 
            onClick={speakPrediction}
            className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full transition shadow-lg hover:scale-105 transform"
            title="Listen to translation"
        >
            🔊
        </button>
      </div>

      {/* Capture Button */}
      <button 
        onClick={capture}
        className="mt-8 px-10 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-xl transition transform hover:scale-105 shadow-xl"
      >
        📸 Capture & Translate
      </button>
    </div>
  );
}