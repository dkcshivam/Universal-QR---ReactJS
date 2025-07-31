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
  const [isConverting, setIsConverting] = useState(false);

  // audio progress bar 

  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);

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

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, chunks:", chunksRef.current.length);
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/wav",
        });
        console.log("Created blob:", blob.size, "bytes, type:", blob.type);

        // Convert to MP3
        const mp3Blob = await convertToMp3(blob);

        const url = URL.createObjectURL(mp3Blob);
        console.log("Created URL:", url);

        setAudioBlob(mp3Blob);
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

  const convertToMp3 = async (audioBlob) => {
    setIsConverting(true);
    try {
      // Import lamejs dynamically
      const lamejs = await import("lamejs");

      // Convert blob to ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();

      // Create audio context for decoding
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      // Decode audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(
        arrayBuffer
      );

      // Convert to mono if stereo
      const samples =
        audioBuffer.numberOfChannels === 2
          ? convertStereoToMono(audioBuffer)
          : audioBuffer.getChannelData(0);

      // Convert float samples to 16-bit PCM
      const pcmSamples = new Int16Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        pcmSamples[i] = Math.max(-32768, Math.min(32767, samples[i] * 32767));
      }

      // Initialize MP3 encoder
      const mp3encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
      const mp3Data = [];

      // Encode in chunks
      const sampleBlockSize = 1152;
      for (let i = 0; i < pcmSamples.length; i += sampleBlockSize) {
        const sampleChunk = pcmSamples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }
      }

      // Finalize encoding
      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }

      // Create MP3 blob
      const mp3Blob = new Blob(mp3Data, { type: "audio/mp3" });
      setIsConverting(false);
      return mp3Blob;
    } catch (error) {
      console.error("MP3 conversion failed:", error);
      setIsConverting(false);
      // Fallback to original blob
      return audioBlob;
    }
  };

  const convertStereoToMono = (audioBuffer) => {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    const mono = new Float32Array(left.length);

    for (let i = 0; i < left.length; i++) {
      mono[i] = (left[i] + right[i]) / 2;
    }

    return mono;
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
            {isConverting && (
              <div className="flex items-center justify-center gap-2 text-blue-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Converting to MP3...</span>
              </div>
            )}
          </div>

          {/* Main Control Button */}

          <div className="flex flex-col items-center gap-3 mt-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white font-semibold text-base shadow cursor-pointer transition-all duration-200 hover:bg-blue-600"
                
              >
                <FiMic className="w-7 h-7" />
                <span>
                  Start Recording 
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3">

                {/* Pause/Resume */}
                
                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-base shadow cursor-pointer transition-all duration-200 ${
                      isPaused ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-yellow-500 text-white hover:bg-yellow-600"
                    }`}
                >
                  {isPaused ? (
                    <FiPlay className="w-5 h-5" />
                  ) : (
                    <FiPause className="w-5 h-5" />
                  )}
                  <span>
                    {
                      isPaused ? "Resume Recording" : "Pause Recording"
                    }
                  </span>
                </button>

                {/* Stop */}
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-400 text-white font-semibold text-base shadow cursor-pointer transition-all duration-200 hover:bg-red-500"
                >
                  <FiMicOff className="w-5 h-5" />
                  <span>
                    Stop Recording 
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Cancel Button */}


          {!isRecording && (
            <div className="flex justify-center mt-4">
              <button
                onClick={onCancel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold text-base shadow cursor-pointer hover:bg-gray-300 transition-colors duration-200 mt-2"
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
            onTimeUpdate={e => setAudioProgress(e.target.currentTime)}
            onLoadedMetadata={e => setAudioDuration(e.target.duration)}
            onError={(e) => console.error("Audio error:", e)}
            onLoadStart={() => console.log("Audio load started")}
            onCanPlay={() => console.log("Audio can play")}
            className="w-full"
            controls
            preload="metadata"
          />

          {/* Action Buttons */}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
            <button
              onClick={deleteRecording}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-400 text-white font-semibold text-base shadow cursor-pointer transition-all duration-200 hover:bg-red-500"
            >
              <FiTrash2 className="w-5 h-5" />
              <span>Delete</span>
            </button>
            <button
              onClick={saveRecording}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white font-semibold text-base shadow cursor-pointer transition-all duration-200 hover:bg-green-600"
              
            >
              <FiCheck className="w-5 h-5" />
              <span>Save</span>
            </button>
          </div>

          {/* Cancel Option */}

          <div className="flex justify-center mt-6">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold text-base shadow cursor-pointer hover:bg-gray-300 transition-colors duration-200"
            >
              <FiMicOff className="w-5 h-5"/>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
