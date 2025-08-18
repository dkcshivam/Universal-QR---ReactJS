import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPause, FaPlay, FaTimes } from "react-icons/fa";

const Record = ({ isExpanded, onToggle, isCollapsed, isMobile }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(true); // Start with true, check only when needed

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Removed automatic permission check - will check only when user clicks record

    return () => {
      // Clean up any ongoing recording
      if (mediaRecorderRef.current && isRecording) {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.log("Error stopping recording on unmount:", error);
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      onToggle(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set permission to true since we successfully got the stream
      setHasPermission(true);

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });

        // Stop all tracks
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          return prev + 1;
        });
      }, 1000);

      // Start audio level animation
      animateRecording();
    } catch (error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      setHasPermission(false);
      onToggle(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setRecordingLevel(0);
      onToggle(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      console.log(
        "Cannot stop recording - MediaRecorder not available or not recording"
      );
    }
  };

  const pauseRecording = () => {
   

    if (mediaRecorderRef.current && isRecording) {
      try {
        if (isPaused) {
          mediaRecorderRef.current.resume();
          setIsPaused(false);
          timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);
          animateRecording();
        } else {
          mediaRecorderRef.current.pause();
          setIsPaused(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
        }
      } catch (error) {
        console.error("Error pausing/resuming recording:", error);
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    } else {
      console.log(
        "Cannot pause/resume - MediaRecorder not available or not recording"
      );
    }
  };

  const animateRecording = () => {

    if (isRecording && !isPaused) {
      setRecordingLevel(Math.random() * 100);
      animationRef.current = requestAnimationFrame(animateRecording);
    } else {
      console.log("Animation stopped:", { isRecording, isPaused });
    }
  };

  const handleRecordClick = () => {

    try {
      if (!isRecording) {
        startRecording(); // This will request permission if needed
      } else {
        stopRecording();
      }
    } catch (error) {
      console.error("Error in handleRecordClick:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
  };

  const handleContainerClick = () => {
    if (!isRecording && !isExpanded) {
      startRecording(); // This will request permission if needed
    } else if (isExpanded && !isRecording) {
      // Allow collapse if expanded but not recording
      onToggle(false);
    }
  };

  const handleRecordButtonClick = (e) => {
    e.stopPropagation();
    handleRecordClick(); // This will handle permission internally
  };

  const formatTime = (seconds) => {
    try {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "0:00";
    }
  };


  const baseClasses = isMobile
    ? "transition-all duration-300 ease-in-out"
    : "transition-all duration-300 ease-in-out";

  const containerClasses = isMobile
    ? `${baseClasses} ${
        isCollapsed ? "w-12 h-12" : isExpanded ? "w-55" : "w-30"
      }`
    : `${baseClasses} ${"h-12 w-100"}`;

  return (
    <div className={containerClasses}>
      {isCollapsed && !isExpanded ? (
        /* Collapsed Icon State */
        <button
          onClick={handleContainerClick}
          className="w-full h-full rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600"
        >
          <FaMicrophone className="h-4 w-4" />
        </button>
      ) : (
        /* Normal/Expanded State */
        <div
          className={`flex items-center h-12 bg-white rounded-lg border transition-all duration-300 cursor-pointer ${
            isRecording
              ? "border-red-500"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onClick={handleContainerClick}
        >
          {/* Record Button */}
          <div className="pl-3 pr-2">
            <button
              onClick={handleRecordButtonClick}
              className={`p-2 rounded-full transition-all duration-300 ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isRecording ? (
                <FaStop className="h-3 w-3" />
              ) : (
                <FaMicrophone className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Label Text */}
          {!isExpanded && (
            <span className="flex-1 text-gray-500 text-[12px] font-semibold pr-3 truncate">
              Help Desk
            </span>
          )}

          {/* Recording Controls and Status (when expanded) */}
          {isExpanded && (
            <div className="flex items-center space-x-2 flex-1 pr-3">
              {isRecording ? (
                <>
                  {/* Pause/Resume Button */}
                  <button
                    onClick={pauseRecording}
                    className="p-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                  >
                    {isPaused ? (
                      <FaPlay className="h-2 w-2" />
                    ) : (
                      <FaPause className="h-2 w-2" />
                    )}
                  </button>

                  {/* Recording Timer */}
                  <span className="text-xs font-mono text-red-600 font-semibold">
                    {formatTime(recordingTime)}
                  </span>

                  {/* Audio Level Indicator */}
                  <div className="flex items-center space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          recordingLevel > i * 33 && !isPaused
                            ? "bg-red-500 h-2"
                            : "bg-gray-300 h-1"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Recording Status */}
                  <span className="text-xs text-gray-600">
                    {isPaused ? "Paused" : "Recording"}
                  </span>
                </>
              ) : (
                // If expanded but not recording, allow click to collapse
                <button
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(false);
                  }}
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Record;
