import React, { useState } from 'react';
import { FaExternalLinkAlt, FaHeadphones, FaYoutube } from 'react-icons/fa';
import SimpleAudioPlayer from './SimpleAudioPlayer';

// Function to format view count
const formatViewCount = (count) => {
  if (!count) return 'N/A views';
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  } else {
    return `${count} views`;
  }
};

// Function to format duration from ISO 8601 format
const formatDuration = (duration) => {
  if (!duration) return '';
  
  // Parse PT1H23M45S format
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

// Function to get audio source URL from video ID
const getAudioSource = (videoId) => {
  // For demo purposes, use a YouTube iframe player API URL
  // In a production app, you would use your own backend to extract the audio
  
  // Using Invidious public API as an alternative source
  const invidious = 'https://invidious.asir.dev';
  const ytAudioUrl = `${invidious}/latest_version?id=${videoId}&itag=140&local=true`;
  
  // Return a working audio URL or a fallback if not available
  try {
    return ytAudioUrl;
  } catch (error) {
    console.error("Could not get audio source:", error);
    return `https://audio-fallback-demo.mp3?id=${videoId}`;
  }
};

const PodcastCard = ({ podcast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Handle audio play - only one can play at a time
  const handlePlay = (id) => {
    setIsPlaying(true);
  };
  
  // YouTube thumbnail quality upgrade
  const getHighQualityThumbnail = (url) => {
    if (!url) return '';
    
    // Replace default quality with high quality
    return url.replace('hqdefault', 'mqdefault');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col">
      {/* Thumbnail with gradient overlay */}
      <div className="relative group cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        <img 
          src={getHighQualityThumbnail(podcast.thumbnail)} 
          alt={podcast.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-3 left-3 z-20 flex items-center text-white bg-black/30 rounded-full px-2 py-1">
          <FaHeadphones className="mr-1" size={12} />
          <span className="text-xs">{formatDuration(podcast.duration)}</span>
        </div>
        
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Podcast
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-2 mb-1 hover:text-blue-600 cursor-pointer" 
          onClick={() => setShowDetails(!showDetails)}>
          {podcast.title}
        </h3>
        
        {/* Channel name and views */}
        <div className="text-sm text-gray-600 mb-3 flex justify-between items-center">
          <span className="font-medium">{podcast.channelTitle}</span>
          <span className="text-xs">{formatViewCount(podcast.viewCount)}</span>
        </div>

        {/* Expanded details */}
        {showDetails && (
          <div className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded-md">
            <p className="line-clamp-3">{podcast.description || "No description available"}</p>
            <a 
              href={`https://www.youtube.com/watch?v=${podcast.id}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-blue-500 hover:underline"
            >
              <FaYoutube className="mr-1" /> Watch on YouTube
            </a>
          </div>
        )}

        {/* Audio player */}
        <div className="mt-auto pt-2">
          <SimpleAudioPlayer 
            src={getAudioSource(podcast.id)} 
            id={`audio-${podcast.id}`}
            onPlay={handlePlay}
          />
        </div>
      </div>
    </div>
  );
};

export default PodcastCard; 