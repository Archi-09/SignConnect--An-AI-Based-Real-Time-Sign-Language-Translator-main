import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { translations } from '../utils/translations'; // Import translations

export default function Dashboard() {
  const [learningSigns, setLearningSigns] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [learnedCount, setLearnedCount] = useState(0);
  
  // User Settings State
  const userEmail = localStorage.getItem("userEmail") || "Guest";
  
  // Default to English if language not found
  const savedLang = localStorage.getItem("appLanguage") || "English";
  const [language, setLanguage] = useState(savedLang);

  // Helper to get text based on current language
  const t = translations[language] || translations["English"];

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const signsRes = await axios.get('http://127.0.0.1:8000/learning/list-signs');
        setLearningSigns(signsRes.data.signs);

        const statsRes = await axios.get(`http://127.0.0.1:8000/user/stats/${userEmail}`);
        setLearnedCount(statsRes.data.total_learned);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchData();
  }, [userEmail]);

  // 2. Handle Language Change
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
    // No alert needed, UI updates instantly!
  };

  // 3. Play Tutorial Logic
  const playTutorial = async (word) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/text-to-sign', { text: word });
      if (res.data.found_videos.length > 0) {
        setSelectedVideo({ word: word, url: res.data.found_videos[0] });
        
        // Update Progress
        const progressRes = await axios.post('http://127.0.0.1:8000/user/learn', {
            email: userEmail,
            word: word
        });
        setLearnedCount(progressRes.data.total_learned);
      } else {
        alert("Video not found for " + word);
      }
    } catch (err) {
      alert("Error loading video");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP BAR: User Profile & Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-center">
            
            {/* User Info */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    👤
                </div>
                <div>
                    {/* Translated Welcome Message */}
                    <h2 className="text-2xl font-bold text-gray-800">{t.welcome}, {userEmail.split('@')[0]}!</h2>
                    <p className="text-gray-500 text-sm">{userEmail}</p>
                </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-3">
                <label className="font-semibold text-gray-700">🌐 Language:</label>
                <select 
                    value={language}
                    onChange={handleLanguageChange}
                    className="p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    {/* Add others if you add them to translations.js */}
                </select>
            </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">{t.totalSigns}</h3>
            <p className="text-3xl font-extrabold text-gray-800 mt-2">{learningSigns.length} {t.signs}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">{t.signsLearned}</h3>
            <p className="text-3xl font-extrabold text-green-600 mt-2">{learnedCount} {t.learned}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">{t.streak}</h3>
            <p className="text-3xl font-extrabold text-gray-800 mt-2">1 {t.day} 🔥</p>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Dictionary */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t.dictionaryTitle}</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {t.clickToLearn}
                </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-2">
              {learningSigns.length > 0 ? (
                learningSigns.map((sign) => (
                  <button 
                    key={sign} 
                    onClick={() => playTutorial(sign)}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition duration-200 group"
                  >
                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👐</span>
                    <span className="font-medium text-gray-700 group-hover:text-blue-700 text-sm">{sign}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-400">
                    {t.noSigns}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Video Player & History Preview */}
          <div className="space-y-8">
            {/* Video Player */}
            <div className="bg-black rounded-xl shadow-lg p-1 overflow-hidden">
                {selectedVideo ? (
                <div>
                    <div className="bg-gray-900 p-3 text-center">
                        <h3 className="text-white font-bold">
                        {t.learning}: <span className="text-yellow-400">{selectedVideo.word}</span>
                        </h3>
                    </div>
                    {selectedVideo.url.endsWith('.mp4') ? (
                        <video src={selectedVideo.url} controls autoPlay className="w-full aspect-video bg-black" />
                    ) : (
                        <img src={selectedVideo.url} alt="Sign" className="w-full aspect-video object-contain bg-black" />
                    )}
                </div>
                ) : (
                <div className="aspect-video flex flex-col items-center justify-center text-gray-500">
                    <span className="text-5xl mb-2">🎬</span>
                    <p>{t.selectSign}</p>
                </div>
                )}
            </div>

            {/* History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">{t.historyTitle}</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Practice: HELLO</span>
                        <span className="text-xs text-gray-400">2 mins ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Translation: Thank You</span>
                        <span className="text-xs text-gray-400">1 hour ago</span>
                    </div>
                    <button className="w-full mt-2 text-blue-600 text-sm font-semibold hover:underline">
                        {t.viewHistory}
                    </button>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}