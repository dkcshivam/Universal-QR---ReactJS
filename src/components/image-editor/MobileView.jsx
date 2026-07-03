import React from "react";
import {
  ArrowRight, ArrowRightLeft, Circle, Crop, DotIcon,
  Eraser, Grip, Minus, MinusIcon, Pencil, PenTool,
  Plus, Redo2, Square, Type, Undo2,
} from "lucide-react";
import { TbArrowCurveRight } from "react-icons/tb";
import { toast } from "react-toastify";

import { Button } from "./ui/Button";
import { Label }  from "./ui/Label";
import { Slider } from "./ui/Slider";
import { Select, SelectItem } from "./ui/Select";

const MobileView = ({
  undo, canUndo,
  redo, canRedo,
  setActiveTool, activeTool,
  drawingCanvasRef, handleToolChange,
  currentColor, setCurrentColor,
  backgroundColor, setBackgroundColor,
  brushSize, setBrushSize, minBrushSize, maxBrushSize,
  showCropConfirm,       setShowCropConfirm,
  showCurveConfirm,      setShowCurveConfirm,
  showCurveArrowConfirm, setShowCurveArrowConfirm,
  flattenLayers, applyCrop,
  cropArea, setCropArea,
  strokeStyle, setStrokeStyle,
}) => {

  // helper — does the drawing canvas have any pixel content?
  const hasCanvasContent = () => {
    const c = drawingCanvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return false;
    return ctx.getImageData(0, 0, c.width, c.height).data
                .some((p, i) => i % 4 === 3 && p !== 0);
  };

  const toolButtons = [
    { tool: "pencil",       icon: <Pencil        className="h-4 w-4" />, label: "Pencil"       },
    { tool: "eraser",       icon: <Eraser        className="h-4 w-4" />, label: "Eraser"       },
    { tool: "line",         icon: <MinusIcon     className="h-4 w-4" />, label: "Line"         },
    { tool: "rectangle",    icon: <Square        className="h-4 w-4" />, label: "Rectangle"    },
    { tool: "circle",       icon: <Circle        className="h-4 w-4" />, label: "Circle"       },
    { tool: "text",         icon: <Type          className="h-4 w-4" />, label: "Text"         },
    { tool: "arrow",        icon: <ArrowRight    className="h-4 w-4" />, label: "Arrow"        },
    { tool: "double-arrow", icon: <ArrowRightLeft className="h-4 w-4"/>, label: "Double Arrow" },
  ];

  // Tools that need a "flatten + confirm" guard before switching
  const guardedTools = {
    curve: {
      icon:    <PenTool          className="h-4 w-4" />,
      label:   "Curve",
      confirm: setShowCurveConfirm,
    },
    "curve-arrow": {
      icon:    <TbArrowCurveRight className="h-4 w-4" />,
      label:   "Curve Arrow",
      confirm: setShowCurveArrowConfirm,
    },
    crop: {
      icon:    <Crop             className="h-4 w-4" />,
      label:   "Crop",
      confirm: setShowCropConfirm,
    },
  };

  // ── Confirm overlay (shared structure) ────────────────────────────────────
  const ConfirmOverlay = ({ visible, message, onProceed, onCancel }) => {
    if (!visible) return null;
    return (
      <div className="flex flex-col gap-2 z-10 absolute top-0 left-0 right-0 bg-white px-4 py-3 border-b shadow-md overflow-y-auto">
        <p className="text-[12px] text-gray-500">{message}</p>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onProceed} className="!flex !px-3 !py-1 !h-max text-sm">
            Proceed
          </Button>
          <Button variant="outline" onClick={onCancel} className="!flex !px-3 !py-1 !h-max text-sm">
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const confirmMsg = "These changes will be saved and cannot be undone after this action. You can make new changes afterwards.";

  return (
    <div className="lg:hidden flex flex-col w-full items-center py-2 px-2 sm:p-4 gap-2 border-t relative z-50">

      {/* ── Tool strip ──────────────────────────────────────────────────── */}
      <div className="w-full flex flex-row gap-2 p-2 border rounded-md items-center">

        {/* Undo / Redo */}
        <div className="flex justify-center border-r pr-2 gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable tool buttons */}
        <div className="flex flex-row flex-1 gap-1 overflow-x-auto whitespace-nowrap items-center">

          {/* Simple tools — no guard needed */}
          {toolButtons.map(({ tool, icon, label }) => (
            <Button
              key={tool}
              variant={activeTool === tool ? "secondary" : "ghost"}
              onClick={() => handleToolChange(tool)}
              className="flex flex-col px-2 py-1 gap-1 min-w-[40px] h-max flex-shrink-0"
              title={label}
            >
              {icon}
              <span className="sr-only">{label}</span>
            </Button>
          ))}

          {/* Guarded tools — curve / curve-arrow / crop */}
          {Object.entries(guardedTools).map(([tool, { icon, label, confirm }]) => (
            <Button
              key={tool}
              variant={activeTool === tool ? "secondary" : "ghost"}
              onClick={() => {
                if (hasCanvasContent() && activeTool !== tool) {
                  confirm(true);
                } else {
                  tool === "crop" ? handleToolChange("crop") : setActiveTool(tool);
                }
              }}
              className="flex flex-col px-2 py-1 gap-1 min-w-[40px] h-max flex-shrink-0"
              title={label}
            >
              {icon}
              <span className="sr-only">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* ── Color + brush size row ───────────────────────────────────────── */}
      <div className="flex flex-row gap-3 mt-1 w-full justify-between items-center flex-wrap">

        {/* Stroke colour */}
        <div className="flex items-center gap-2">
          <Label htmlFor="color-picker-sm" className="text-sm">Color</Label>
          <input
            id="color-picker-sm"
            type="color"
            value={currentColor}
            onChange={e => setCurrentColor(e.target.value)}
            className="rounded-full w-6 h-6 cursor-pointer border-0"
          />
        </div>

        {/* Background colour */}
        <div className="flex items-center gap-2">
          <Label htmlFor="bg-color-picker-sm" className="text-sm">Bg</Label>
          <input
            id="bg-color-picker-sm"
            type="color"
            value={backgroundColor === "transparent" ? "#ffffff" : backgroundColor}
            onChange={e => setBackgroundColor(e.target.value)}
            className="rounded-full w-6 h-6 cursor-pointer border-0"
          />
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Label htmlFor="brush-size-sm" className="text-sm whitespace-nowrap">
            Size: {brushSize}px
          </Label>
          <Button variant="outline" size="icon" onClick={() => setBrushSize(Math.max(minBrushSize, brushSize - 1))} className="h-6 w-6 flex-shrink-0">
            <Minus className="h-3 w-3" />
          </Button>
          <Slider
            id="brush-size-sm"
            min={minBrushSize}
            max={maxBrushSize}
            step={1}
            value={[brushSize]}
            onValueChange={v => setBrushSize(v[0])}
            className="flex-grow"
          />
          <Button variant="outline" size="icon" onClick={() => setBrushSize(Math.min(maxBrushSize, brushSize + 1))} className="h-6 w-6 flex-shrink-0">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* ── Stroke style (shown for relevant tools) ──────────────────────── */}
      {activeTool && ["line","rectangle","circle","arrow","double-arrow","curve","curve-arrow"].includes(activeTool) && (
        <div className="flex items-center gap-2 w-full">
          <Label htmlFor="stroke-style-sm" className="flex items-center gap-1 text-sm whitespace-nowrap">
            <Grip className="h-3 w-3" /> Style
          </Label>
          <Select value={strokeStyle} onValueChange={setStrokeStyle}>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </Select>
        </div>
      )}

      {/* ── Crop controls (when crop tool active) ───────────────────────── */}
      {activeTool === "crop" && (
        <div className="flex flex-col gap-2 z-10 absolute top-0 left-0 right-0 bg-white px-4 py-3 border-b shadow-md">
          <p className="text-sm text-gray-500">
            Draw a rectangle to crop. Tap Apply to confirm.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCropArea(null);
                setActiveTool(null);
                const ctx = drawingCanvasRef.current?.getContext("2d");
                if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
              }}
              className="!flex !px-3 !py-1 !h-max text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={applyCrop}
              disabled={!cropArea}
              className="!flex !px-3 !py-1 !h-max text-sm"
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* ── Confirm overlays ─────────────────────────────────────────────── */}
      <ConfirmOverlay
        visible={showCropConfirm}
        message={confirmMsg}
        onProceed={() => {
          flattenLayers();
          handleToolChange("crop");
          setShowCropConfirm(false);
          toast.success("Previous changes saved. You can crop now.", { autoClose: 3000 });
        }}
        onCancel={() => setShowCropConfirm(false)}
      />

      <ConfirmOverlay
        visible={showCurveConfirm}
        message={confirmMsg}
        onProceed={() => {
          flattenLayers();
          setActiveTool("curve");
          setShowCurveConfirm(false);
          toast.success("Previous changes saved.", { autoClose: 3000 });
        }}
        onCancel={() => setShowCurveConfirm(false)}
      />

      <ConfirmOverlay
        visible={showCurveArrowConfirm}
        message={confirmMsg}
        onProceed={() => {
          flattenLayers();
          setActiveTool("curve-arrow");
          setShowCurveArrowConfirm(false);
          toast.success("Previous changes saved.", { autoClose: 3000 });
        }}
        onCancel={() => setShowCurveArrowConfirm(false)}
      />
    </div>
  );
};

export default MobileView;