import { useState, useCallback } from "react";

/**
 * usePencilSketch - MVP Testing Placeholder Hook (Updated)
 * Safely stubs pixel processing state toggles and OpenCV loading logic
 * to bypass library initialization breaks during the initial Vite mount.
 */
export function usePencilSketch() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [intensity, setIntensity] = useState(50);
  
  // --- Added OpenCV Initialization Stubs for MVP Testing ---
  const [isOpenCVLoaded, setIsOpenCVLoaded] = useState(true); // Default to true so it skips waiting for an external library script

  const loadOpenCV = useCallback(async () => {
    console.log("loadOpenCV triggered (Stub Mode) - Simulating library connection.");
    return Promise.resolve(true);
  }, []);

  // Muted engine actions
  const applyPencilSketch = useCallback(async (canvasElement) => {
    console.log("Pencil Sketch filter triggered (Stub Mode)", canvasElement);
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsProcessing(false);
        resolve(true);
      }, 300);
    });
  }, []);

  const clearFilter = useCallback(() => {
    console.log("Filter cleared (Stub Mode)");
  }, []);

  // Return structure matching exactly what ImageEditorModal destructures
  return {
    isOpenCVLoaded,
    loadOpenCV,
    applyPencilSketch,
    isProcessing,
    intensity,
    setIntensity,
    clearFilter,
  };
}