import { useState, useRef, useEffect } from "react";
import { FiPlay, FiPause, FiVolume2 } from "react-icons/fi";

const AudioPlayer = ({ audioUrl, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setAudioDuration(audio.duration);
      setIsLoading(false);
      console.log("Audio loaded, duration:", audio.duration);
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error("Audio playback error:", e);
      setError("Unable to play audio");
      setIsLoading(false);
    };
    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
      console.log("Audio loading started");
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      console.log("Audio can play");
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioUrl]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || error) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        console.log("Attempting to play audio:", audioUrl);
        await audio.play();
      }
    } catch (err) {
      console.error("Error playing audio:", err);
      setError("Playback failed");
    }
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio || error) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * audioDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3 max-w-[90%]">
        <FiVolume2 className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-600">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg max-w-[90%]">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
      />

      <button
        onClick={togglePlayPause}
        disabled={isLoading}
        className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200"
      >
        {isLoading ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <FiPause className="w-4 h-4" />
        ) : (
          <FiPlay className="w-4 h-4 ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      <FiVolume2 className="w-4 h-4 text-gray-400" />

    </div>
  );
};

export default AudioPlayer;
