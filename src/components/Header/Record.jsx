import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPause, FaPlay, FaTimes } from 'react-icons/fa';

const Record = ({ isExpanded, onToggle, isCollapsed, isMobile }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    console.log('Record component mounted');
    
    // Check microphone permission with better error handling
    const checkPermission = async () => {
      console.log('Checking microphone permission...');
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          console.log('MediaDevices API available, requesting permission...');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('Microphone permission granted');
          setHasPermission(true);
          // Immediately stop the stream since we're just checking permission
          stream.getTracks().forEach(track => {
            console.log('Stopping track:', track.label);
            track.stop();
          });
        } else {
          console.log('MediaDevices API not available');
          setHasPermission(false);
        }
      } catch (error) {
        console.log('Microphone access denied or error:', error.name, error.message);
        setHasPermission(false);
      }
    };

    checkPermission();

    return () => {
      console.log('Record component unmounting, cleaning up...');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        console.log('Timer cleared');
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        console.log('Animation frame cleared');
      }
    };
  }, []);

  const startRecording = async () => {
    console.log('Starting recording...');
    try {
      console.log('Calling onToggle(true) to expand component');
      onToggle(true);
      
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone stream obtained:', stream);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      console.log('MediaRecorder created');

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Data available from recorder, size:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log('MediaRecorder stopped');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('Recording stopped, audio blob:', audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => {
          console.log('Stopping track on recording stop:', track.label);
          track.stop();
        });
      };

      console.log('Starting MediaRecorder...');
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      console.log('Recording state updated to true');

      // Start timer
      console.log('Starting timer...');
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          console.log('Timer tick:', prev + 1);
          return prev + 1;
        });
      }, 1000);

      // Start audio level animation
      console.log('Starting animation...');
      animateRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setHasPermission(false);
      onToggle(false);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      console.log('MediaRecorder exists and is recording, stopping...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setRecordingLevel(0);
      onToggle(false);
      console.log('Recording state updated to false');

      if (timerRef.current) {
        console.log('Clearing timer...');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationRef.current) {
        console.log('Clearing animation frame...');
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      console.log('Cannot stop recording - MediaRecorder not available or not recording');
    }
  };

  const pauseRecording = () => {
    console.log('Pause/Resume button clicked');
    console.log('Current state:', { isRecording, isPaused });
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (isPaused) {
          console.log('Resuming recording...');
          mediaRecorderRef.current.resume();
          setIsPaused(false);
          timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
          }, 1000);
          animateRecording();
        } else {
          console.log('Pausing recording...');
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
        console.error('Error pausing/resuming recording:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    } else {
      console.log('Cannot pause/resume - MediaRecorder not available or not recording');
    }
  };

  const animateRecording = () => {
    console.log('Animation frame called:', { isRecording, isPaused, animationRef: !!animationRef.current });
    
    if (isRecording && !isPaused) {
      setRecordingLevel(Math.random() * 100);
      animationRef.current = requestAnimationFrame(animateRecording);
    } else {
      console.log('Animation stopped:', { isRecording, isPaused });
    }
  };

  const handleRecordClick = () => {
    console.log('Record button clicked');
    console.log('Current state:', { hasPermission, isRecording });
    
    if (!hasPermission) {
      console.log('No microphone permission, cannot start recording');
      return;
    }

    try {
      if (!isRecording) {
        console.log('Not recording, starting recording...');
        startRecording();
      } else {
        console.log('Currently recording, stopping recording...');
        stopRecording();
      }
    } catch (error) {
      console.error('Error in handleRecordClick:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  };

  const handleContainerClick = () => {
    if (!hasPermission) return;
    if (!isRecording && !isExpanded) {
      startRecording();
    } else if (isExpanded && !isRecording) {
      // Allow collapse if expanded but not recording
      onToggle(false);
    }
  };

  const handleRecordButtonClick = (e) => {
    e.stopPropagation();
    if (!hasPermission) return;
    handleRecordClick();
  };

  const formatTime = (seconds) => {
    try {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '0:00';
    }
  };

  // Add error boundary for rendering
  if (hasPermission === null) {
    console.log('Permission still being checked, showing loading state');
  }

  console.log('Rendering Record component with state:', {
    isRecording,
    isPaused,
    hasPermission,
    isExpanded,
    isCollapsed,
    isMobile
  });

  const baseClasses = isMobile 
    ? "transition-all duration-300 ease-in-out"
    : "transition-all duration-300 ease-in-out";

  const containerClasses = isMobile
    ? `${baseClasses} ${
        isCollapsed 
          ? 'w-12 h-12' 
          : isExpanded 
            ? 'w-72' 
            : 'w-40'
      }`
    : `${baseClasses} ${
        isCollapsed 
          ? 'w-12 h-12' 
          : 'w-full max-w-xs'
      }`;

  return (
    <div className={containerClasses}>
      {(isCollapsed && !isExpanded) ? (
        /* Collapsed Icon State */
        <button
          onClick={handleContainerClick}
          disabled={!hasPermission}
          className={`w-full h-full rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer ${
            hasPermission 
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaMicrophone className="h-4 w-4" />
        </button>
      ) : (
        /* Normal/Expanded State */
        <div 
          className={`flex items-center h-12 bg-white rounded-lg border transition-all duration-300 cursor-pointer ${
            isRecording 
              ? 'border-red-500' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={handleContainerClick}
        >
          {/* Record Button */}
          <div className="pl-3 pr-2">
            <button
              onClick={handleRecordButtonClick}
              disabled={!hasPermission}
              className={`p-2 rounded-full transition-all duration-300 ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : hasPermission
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
            <span className="flex-1 text-gray-500 text-xs font-normal pr-3 truncate">
              Voice Record
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
                    {isPaused ? <FaPlay className="h-2 w-2" /> : <FaPause className="h-2 w-2" />}
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
                          recordingLevel > (i * 33) && !isPaused
                            ? 'bg-red-500 h-2'
                            : 'bg-gray-300 h-1'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Recording Status */}
                  <span className="text-xs text-gray-600">
                    {isPaused ? 'Paused' : 'Recording'}
                  </span>
                </>
              ) : (
                // If expanded but not recording, allow click to collapse
                <button
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                  onClick={e => {
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
