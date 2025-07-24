import React, { useState, useRef, useEffect } from 'react'
import { FaMicrophone, FaStop } from 'react-icons/fa'

const Record = ({ isExpanded, isCollapsed }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const timerRef = useRef(null)

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.start()

      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setIsRecording(false)
    setRecordingTime(0)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="flex items-center">
      {!isRecording ? (
        // Voice Record button - Responsive design based on state
        <button
          onClick={startRecording}
          className={`flex items-center justify-center space-x-3 py-3 bg-white border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 hover:text-gray-900 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${
            isCollapsed 
              ? 'w-12 px-3' // Icon only when collapsed
              : isExpanded 
                ? 'w-full px-4' // Full width when expanded
                : 'w-56 px-4' // Default width
          }`}
        >
          <FaMicrophone className="w-5 h-5 text-blue-500 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-semibold text-base text-gray-800 whitespace-nowrap">
              Voice Record
            </span>
          )}
        </button>
      ) : (
        // Recording interface - Responsive design based on state
        <div className={`flex items-center justify-between py-3 px-4 bg-white border-2 border-blue-400 rounded-xl shadow-md transition-all duration-200 ${
          isCollapsed 
            ? 'w-12' // Icon only when collapsed
            : isExpanded 
              ? 'w-full' // Full width when expanded
              : 'w-56' // Default width
        }`}>
          {!isCollapsed ? (
            <>
              {/* Recording indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                <span className="text-red-600 font-mono text-sm font-semibold">
                  {formatTime(recordingTime)}
                </span>
              </div>
              
              {/* Professional Stop Button */}
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                <FaStop className="w-3 h-3" />
                <span className="font-semibold text-sm">Stop</span>
              </button>
            </>
          ) : (
            // Collapsed recording state - just pulsing dot
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm mx-auto"></div>
          )}
        </div>
      )}
    </div>
  )
}

export default Record
