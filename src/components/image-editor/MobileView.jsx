import React, { useState, useRef, useCallback } from "react";
import {
  X,
  Download,
  Crop,
  Sticker,
  Type,
  Pencil,
  Undo2,
  Check,
  Square,
  Circle,
  ArrowRight,
  ArrowRightLeft,
} from "lucide-react";

const TOOLBAR_HEIGHT = "56px"; // fixed on every level — canvas never resizes

const MobileView = ({
  historyState,
  flattenLayers,
  undo,
  canUndo,
  activeTool,
  setActiveTool,
  handleToolChange,
  drawingCanvasRef,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
  minBrushSize,
  maxBrushSize,
  cropArea,
  setCropArea,
  applyCrop,
  konvaRectRef,
  konvaCircleRef,
  konvaArrowRef,
  konvaDoubleArrowRef,
  textEditorRef,
  downloadImage,
  handleSave,
  handleCancel,
  isTextDragging,
}) => {
  const [level, setLevel] = useState(null); // null | "pencil" | "text" | "crop" | "sticker"

  const sessionFloorRef = useRef(-1);
  const scopedCanUndo =
    canUndo && historyState.currentStep > sessionFloorRef.current;

  const cropHistoryRef = useRef([]);
  const prevCropAreaRef = useRef(null);
  React.useEffect(() => {
    if (level === "crop") {
      cropHistoryRef.current.push(prevCropAreaRef.current);
    }
    prevCropAreaRef.current = cropArea;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropArea]);

  const enterLevel = (nextLevel, tool) => {
    sessionFloorRef.current = historyState.currentStep;
    cropHistoryRef.current = [];
    prevCropAreaRef.current = null;
    if (tool) handleToolChange(tool);
    setLevel(nextLevel);
  };

  const backToLevel1 = () => {
    setActiveTool(null);
    setLevel(null);
  };

  const confirmPencil = () => {
    flattenLayers();
    backToLevel1();
  };

  const confirmText = () => backToLevel1();

  const confirmSticker = () => {
    konvaRectRef.current?.flatten();
    konvaCircleRef.current?.flatten();
    konvaArrowRef.current?.flatten();
    konvaDoubleArrowRef.current?.flatten();
    flattenLayers();
    backToLevel1();
  };

  const confirmCrop = () => {
    applyCrop();
    setLevel(null);
  };

  const discardCrop = () => {
    setCropArea(null);
    const ctx = drawingCanvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    backToLevel1();
  };

  const undoCrop = useCallback(() => {
    const prev = cropHistoryRef.current.pop();
    setCropArea(prev ?? null);
  }, [setCropArea]);

  const barClass =
    "flex items-center justify-between px-3 w-full flex-shrink-0";
  const barStyle = { height: TOOLBAR_HEIGHT };

  return (
    <div className="lg:hidden flex flex-col w-full bg-black text-white">
      {/* ── Level 1 ──────────────────────────────────────────────────────── */}
      {level === null && (
        <div
          className={barClass}
          style={{
            ...barStyle,
            opacity: isTextDragging ? 0 : 1,
            pointerEvents: isTextDragging ? "none" : "auto",
          }}
        >
          <button onClick={handleCancel} title="Discard">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-5">
            <button onClick={downloadImage} title="Download">
              <Download className="h-5 w-5" />
            </button>
            <button onClick={() => enterLevel("crop", "crop")} title="Crop">
              <Crop className="h-5 w-5" />
            </button>
            <button
              onClick={() => enterLevel("sticker", "rectangle")}
              title="Sticker"
            >
              <Sticker className="h-5 w-5" />
            </button>
            <button onClick={() => enterLevel("text", "text")} title="Text">
              <Type className="h-5 w-5" />
            </button>
            <button
              onClick={() => enterLevel("pencil", "pencil")}
              title="Pencil"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={handleSave}
              title="Send"
              className="bg-green-700 p-1 rounded-full"
            >
              <Check className="h-5 w-5 text-white-400 font-bold" />
            </button>
          </div>
        </div>
      )}

      {/* ── Level 2: Pencil ──────────────────────────────────────────────── */}
      {level === "pencil" && (
        <div className={barClass} style={barStyle}>
          <div className="flex items-center gap-3">
            <button onClick={confirmPencil} title="Confirm">
              <Check className="h-5 w-5 text-green-400" />
            </button>
            <button
              onClick={undo}
              disabled={!scopedCanUndo}
              className="disabled:opacity-30"
              title="Undo"
            >
              <Undo2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-70 whitespace-nowrap">
              {brushSize}px
            </span>
            <input
              type="range"
              min={minBrushSize}
              max={maxBrushSize}
              step={1}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 accent-white"
            />
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-7 h-7 rounded-full border-0 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ── Level 2: Text ────────────────────────────────────────────────── */}
      {level === "text" && (
        <div
          className={barClass}
          style={{
            ...barStyle,
            opacity: isTextDragging ? 0 : 1,
            pointerEvents: isTextDragging ? "none" : "auto",
          }}
        >
          <button onClick={confirmText} title="Confirm">
            <Check className="h-5 w-5 text-green-400" />
          </button>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-7 h-7 rounded-full border-0 cursor-pointer"
          />
        </div>
      )}

      {/* ── Level 2: Crop ────────────────────────────────────────────────── */}
      {level === "crop" && (
        <div className={barClass} style={barStyle}>
          <div className="flex items-center gap-3">
            <button onClick={confirmCrop} disabled={!cropArea} title="Confirm">
              <Check
                className={`h-5 w-5 ${cropArea ? "text-green-400" : "text-gray-500"}`}
              />
            </button>
            <button
              onClick={undoCrop}
              disabled={cropHistoryRef.current.length === 0}
              className="disabled:opacity-30"
              title="Undo crop"
            >
              <Undo2 className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={discardCrop}
            className="text-sm opacity-80"
            title="Discard"
          >
            Discard
          </button>
        </div>
      )}

      {/* ── Level 2: Sticker ─────────────────────────────────────────────── */}
      {level === "sticker" && (
        <div className={barClass} style={barStyle}>
          <div className="flex items-center gap-3">
            <button onClick={confirmSticker} title="Confirm">
              <Check className="h-5 w-5 text-green-400" />
            </button>
            <button
              onClick={undo}
              disabled={!scopedCanUndo}
              className="disabled:opacity-30"
              title="Undo"
            >
              <Undo2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {[
              ["rectangle", <Square className="h-5 w-5" />],
              ["circle", <Circle className="h-5 w-5" />],
              ["arrow", <ArrowRight className="h-5 w-5" />],
              ["double-arrow", <ArrowRightLeft className="h-5 w-5" />],
            ].map(([tool, icon]) => (
              <button
                key={tool}
                onClick={() => handleToolChange(tool)}
                className={`p-1 rounded ${activeTool === tool ? "bg-white/20" : ""}`}
                title={tool}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileView;
