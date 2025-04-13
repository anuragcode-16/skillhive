import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const SimpleAudioPlayer = ({ src, id, onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Use YouTube Embed as fallback for audio
  const youtubeId = id.replace('audio-', '');
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=0`;

  // Set up audio events when component mounts
  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handlePlayState = () => {
      setIsPlaying(!audio.paused);
    };
    
    const handleError = (e) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      setError("Could not load audio. Click to play on YouTube instead.");
    };

    // Add event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlayState);
    audio.addEventListener('pause', handlePlayState);
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('error', handleError);
    
    // Set initial volume
    audio.volume = volume;
    
    // For demo, ensure loading state doesn't stay forever
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 3000);

    // Clean up event listeners
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlayState);
      audio.removeEventListener('pause', handlePlayState);
      audio.removeEventListener('ended', () => setIsPlaying(false));
      audio.removeEventListener('error', handleError);
      clearTimeout(timeout);
    };
  }, [isLoading, id]);

  // Format time in MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (error) {
      // If there's an error, open YouTube instead
      window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
      return;
    }
    
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
            setError("Could not play audio. Try clicking on YouTube link below.");
          });
      }
    }
  };
  
  // Handle seeking by clicking on progress bar
  const handleSeek = (e) => {
    if (!audioRef.current || error) return;
    
    const progressBar = progressRef.current;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    
    // Calculate percentage and update current time
    const percentage = offsetX / width;
    const seekTime = percentage * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      
      // Update mute state based on volume
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume > 0 ? volume : 0.7;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  return (
    <div>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        id={id}
        preload="metadata"
        onLoadStart={() => setIsLoading(true)}
      />
      
      <div className="flex items-center">
        {/* Play button */}
        <button 
          onClick={togglePlay}
          className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${
            error ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={error ? 'Play on YouTube instead' : (isPlaying ? 'Pause' : 'Play')}
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            isPlaying ? <FaPause size={14} /> : <FaPlay size={14} className="ml-1" />
          )}
        </button>
        
        {/* Time and progress bar */}
        <div className="flex-1">
          {/* Times */}
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          {/* Progress bar */}
          <div 
            ref={progressRef} 
            className={`h-2 bg-gray-200 rounded-full w-full cursor-pointer ${error ? 'opacity-50' : ''}`}
            onClick={handleSeek}
          >
            <div 
              className={`h-full ${error ? 'bg-red-500' : 'bg-blue-500'} rounded-full transition-all`}
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
          
          {/* Error message */}
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>
        
        {/* Volume control */}
        <div className="ml-3 flex items-center">
          <button 
            onClick={toggleMute}
            className="text-gray-500 hover:text-gray-700 mr-2"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 appearance-none bg-gray-300 rounded-full"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${isMuted ? 0 : volume * 100}%, #d1d5db ${isMuted ? 0 : volume * 100}%, #d1d5db 100%)`
            }}
          />
        </div>
      </div>
      
      {/* Fallback link to YouTube */}
      <div className="mt-3 flex items-center justify-between">
        <a
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-sm hover:underline flex items-center"
        >
          View on YouTube →
        </a>
        
        {isPlaying && (
          <span className="text-xs text-gray-500 animate-pulse">
            ● Playing
          </span>
        )}
      </div>
    </div>
  );
};

export default SimpleAudioPlayer; 