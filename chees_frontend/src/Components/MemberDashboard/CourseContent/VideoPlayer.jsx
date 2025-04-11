import React, { useState, useRef, useEffect } from 'react';
import { FiMaximize, FiMinimize, FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';
import './CourseContent.css';

const VideoPlayer = ({ videoUrl, title, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  
  // Set up event listeners for video
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      const handleLoadedMetadata = () => {
        setDuration(videoElement.duration);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(videoElement.currentTime);
        setProgress((videoElement.currentTime / videoElement.duration) * 100);
        
        // Check if video has been completed
        if (videoElement.currentTime >= videoElement.duration * 0.95) {
          if (onComplete) onComplete(); // Mark as watched at 95%
        }
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
      };
      
      // Add event listeners
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('ended', handleEnded);
      
      // Clean up
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [onComplete]);
  
  // Function to toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Function to toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Function to handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };
  
  // Function to handle seeking in the video
  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = (e.target.value / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      setProgress(e.target.value);
    }
  };
  
  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Auto-hide controls after a period of inactivity
  const showControlsTemporarily = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div 
      className="video-player-container" 
      ref={playerContainerRef}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video 
        ref={videoRef} 
        className="video-player" 
        src={videoUrl} 
        onClick={togglePlay}
        playsInline
      />
      
      {title && <h3 className="video-title">{title}</h3>}
      
      <div className={`video-controls ${showControls ? 'visible' : 'hidden'}`}>
        <div className="video-progress">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress} 
            onChange={handleSeek} 
            className="progress-slider"
          />
        </div>
        
        <div className="video-controls-main">
          <div className="video-controls-left">
            <button className="control-button" onClick={togglePlay}>
              {isPlaying ? <FiPause /> : <FiPlay />}
            </button>
            
            <div className="volume-control">
              <button className="control-button" onClick={toggleMute}>
                {isMuted ? <FiVolumeX /> : <FiVolume2 />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={volume} 
                onChange={handleVolumeChange} 
                className="volume-slider"
              />
            </div>
            
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="video-controls-right">
            <button className="control-button" onClick={toggleFullscreen}>
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
