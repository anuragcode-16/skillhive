import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

const AudioPlayer = ({ src, id, onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef(null);

  // Set up audio events when component mounts
  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handlePlayState = () => {
      setIsPlaying(!audio.paused);
    };

    // Add event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlayState);
    audio.addEventListener('pause', handlePlayState);
    audio.addEventListener('ended', () => setIsPlaying(false));
    
    // Simulate loading delay for demo
    setTimeout(() => {
      if (isLoading) setIsLoading(false);
    }, 1500);

    // Clean up event listeners
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlayState);
      audio.removeEventListener('pause', handlePlayState);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [isLoading]);

  // Format time in MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.pause();
    } else {
      // Ensure all other audio elements are paused
      document.querySelectorAll('audio').forEach(player => {
        if (player !== audio && !player.paused) {
          player.pause();
        }
      });
      
      // Create a promise to handle play() method
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
            setIsPlaying(true);
            if (onPlay) onPlay(id);
          })
          .catch(error => {
            // Auto-play was prevented or other error
            console.error("Playback error:", error);
            setIsPlaying(false);
          });
      }
    }
  };

  // Handle progress bar click
  const handleProgressChange = (e) => {
    const newTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="flex items-center">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={src}
        id={id}
        preload="metadata"
      />
      
      {/* Play/Pause button */}
      <button 
        onClick={togglePlay}
        className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none transition-colors flex-shrink-0"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          isPlaying ? <FaPause /> : <FaPlay className="ml-1" />
        )}
      </button>
      
      <div className="flex-1 ml-3">
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden w-full"
          onClick={handleProgressChange}>
          <div 
            className="h-full bg-blue-500" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        
        {/* Time display */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer; 