import { useState, useRef, useEffect } from "react";
import {
  FiMic,
  FiMicOff,
  FiPlay,
  FiPause,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";

const VoiceRecorder = ({ onSave, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Check supported MIME types and use the most compatible one
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/wav";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ""; // Let browser choose
      }

      console.log("Using MIME type:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size, "bytes");
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("Recording stopped, chunks:", chunksRef.current.length);
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/wav",
        });
        console.log("Created blob:", blob.size, "bytes, type:", blob.type);

        const url = URL.createObjectURL(blob);
        console.log("Created URL:", url);

        setAudioBlob(blob);
        setAudioUrl(url);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms for better compatibility
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      console.log("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const playAudio = () => {
    console.log("Attempting to play audio:", audioUrl);
    if (audioRef.current && audioUrl) {
      audioRef.current
        .play()
        .then(() => {
          console.log("Audio started playing");
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const saveRecording = () => {
    if (audioBlob && audioUrl) {
      console.log("Saving recording:", {
        audioBlob,
        audioUrl,
        duration: recordingTime,
      });
      onSave({
        audioBlob,
        audioUrl,
        duration: recordingTime,
        timestamp: new Date().toISOString(),
        mimeType: audioBlob.type,
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      {/* Recording State */}
      {!audioBlob ? (
        <div className="space-y-4">
          {/* Timer and Status */}
          <div className="text-center">
            <div className="text-2xl font-mono text-gray-700 mb-2">
              {formatTime(recordingTime)}
            </div>
            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">
                  {isPaused ? "Paused" : "Recording"}
                </span>
              </div>
            )}
          </div>

          {/* Main Control Button */}
          <div className="flex justify-center">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FiMic className="w-7 h-7" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {/* Pause/Resume */}
                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  {isPaused ? (
                    <FiPlay className="w-5 h-5" />
                  ) : (
                    <FiPause className="w-5 h-5" />
                  )}
                </button>

                {/* Stop */}
                <button
                  onClick={stopRecording}
                  className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <FiMicOff className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Cancel Button */}
          {!isRecording && (
            <div className="flex justify-center">
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Playback State */
        <div className="space-y-4">
          {/* Timer */}
          <div className="text-center">
            <div className="text-lg font-mono text-gray-700">
              {formatTime(recordingTime)}
            </div>
            <div className="text-sm text-gray-500">Recording complete</div>
          </div>

          {/* Audio Player */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={(e) => console.error("Audio error:", e)}
            onLoadStart={() => console.log("Audio load started")}
            onCanPlay={() => console.log("Audio can play")}
            className="w-full"
            controls
            preload="metadata"
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
            >
              {isPlaying ? (
                <FiPause className="w-4 h-4" />
              ) : (
                <FiPlay className="w-4 h-4" />
              )}
            </button>

            {/* Delete */}
            <button
              onClick={deleteRecording}
              className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>

            {/* Save */}
            <button
              onClick={saveRecording}
              className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <FiCheck className="w-4 h-4" />
            </button>
          </div>

          {/* Cancel Option */}
          <div className="flex justify-center">
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
