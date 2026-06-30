"use client";

import { useState, useRef } from "react";
import { X, Undo2, Crop, Pencil, Type, Sticker, Check } from "lucide-react";

export default function ImageEditor({
  imageUrl,
  onClose,
  onSend,
}) {
  const [activeTool, setActiveTool] = useState(null);
  const [hasEdits, setHasEdits] = useState(false);
  const canvasWrapRef = useRef(null);

  const handleToolTap = (tool) => {
    // Tapping the already-active tool closes its panel, like WhatsApp.
    setActiveTool((prev) => (prev === tool ? null : tool));
  };

  const handleUndo = () => {
    // TODO: pop last action off your history stack here.
  };

  const handleSend = () => {
    // TODO: flatten whatever the active tool produced onto the base image,
    // then return a data URL / Blob via onSend.
    onSend(imageUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-3 shrink-0">
        <button
          onClick={onClose}
          aria-label="Close editor"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white active:bg-white/10"
        >
          <X className="h-6 w-6" />
        </button>

        <button
          onClick={handleUndo}
          aria-label="Undo"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white active:bg-white/10 disabled:opacity-30"
          disabled={!hasEdits}
        >
          <Undo2 className="h-5 w-5" />
        </button>
      </div>

      {/* Canvas area */}
      <div
        ref={canvasWrapRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden touch-none"
      >
        {/* Base image */}
        <img
          src={imageUrl}
          alt="Editing"
          className="max-h-full max-w-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {/* --- Tool overlays: render one at a time on top of the image --- */}
        {activeTool === "crop" && (
          <div className="absolute inset-0">
            {/* TODO: crop overlay + aspect-ratio chip row (Free / 1:1 / 16:9) */}
          </div>
        )}

        {activeTool === "draw" && (
          <canvas
            className="absolute inset-0 h-full w-full"
            // TODO: pointer handlers for freehand strokes
          />
        )}

        {activeTool === "text" && (
          <div className="absolute inset-0">
            {/* TODO: tap-to-place text input, draggable/resizable layer */}
          </div>
        )}

        {activeTool === "sticker" && (
          <div className="absolute inset-0">
            {/* TODO: sticker picker tray + placed sticker layers */}
          </div>
        )}
      </div>

      {/* Tool-specific control strip */}
      {activeTool && (
        <div className="shrink-0 px-4 py-2">
          {/* TODO: swap this row's contents based on activeTool */}
        </div>
      )}

      {/* Bottom bar: tool icons + send button */}
      <div className="flex items-center justify-between px-4 pb-6 pt-2 shrink-0">
        <div className="flex items-center gap-1">
          <ToolButton
            icon={<Crop className="h-5 w-5" />}
            active={activeTool === "crop"}
            onClick={() => handleToolTap("crop")}
            label="Crop"
          />

          <ToolButton
            icon={<Pencil className="h-5 w-5" />}
            active={activeTool === "draw"}
            onClick={() => handleToolTap("draw")}
            label="Draw"
          />

          <ToolButton
            icon={<Type className="h-5 w-5" />}
            active={activeTool === "text"}
            onClick={() => handleToolTap("text")}
            label="Text"
          />

          <ToolButton
            icon={<Sticker className="h-5 w-5" />}
            active={activeTool === "sticker"}
            onClick={() => handleToolTap("sticker")}
            label="Sticker"
          />
        </div>

        <button
          onClick={handleSend}
          aria-label="Send edited image"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg active:scale-95 transition-transform"
        >
          <Check className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

function ToolButton({
  icon,
  active,
  onClick,
  label,
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-white text-black"
          : "text-white active:bg-white/10"
      }`}
    >
      {icon}
    </button>
  );
}