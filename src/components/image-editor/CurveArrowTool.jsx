import React, { useEffect, useState, useCallback } from "react";
import { ActionCreators } from "@/utils/actionCreators";

const CurveArrowTool = ({
  active,
  canvasRef,
  onFinishCurve,
  setActiveTool,
  currentColor,
  strokeStyle,
  brushSize,
  addAction,
  replayManager,
  historyState,
}) => {
  const [currentCurve, setCurrentCurve] = useState([]);
  const [drawing, setDrawing] = useState(false);

  const drawArrow = (ctx, from, to, size) => {
    const headLength = Math.max(10, size * 2.5);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    const endX = to.x;
    const endY = to.y;

    ctx.save();
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6)
    );

    ctx.lineWidth = Math.max(1.5, size * 0.9);
    ctx.stroke();
    ctx.restore();
  };

  // Dedicated helper to trigger history-state context redrawing
  const forceHistoryReplay = useCallback((ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (replayManager?.current && historyState?.actions) {
      const drawingActions = historyState.actions.filter(
        (a) => a.target === "drawing"
      );
      drawingActions.forEach((drawingAction) => {
        replayManager.current.applyDrawingAction(drawingAction);
      });
    }
  }, [historyState, replayManager]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Clear layout workspace and replay background histories
    forceHistoryReplay(ctx, canvas);

    // 2. Render real-time feedback while dragging
    if (drawing && currentCurve.length >= 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(currentCurve[0].x, currentCurve[0].y);

      // Generate a smooth quadratic Bezier curve
      for (let i = 0; i < currentCurve.length - 1; i++) {
        const p0 = currentCurve[i - 1] || currentCurve[i];
        const p1 = currentCurve[i];
        const p2 = currentCurve[i + 1];
        const p3 = currentCurve[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (strokeStyle) {
        case "dashed":
          ctx.setLineDash([brushSize * 3, brushSize * 2]);
          break;
        case "dotted":
          ctx.setLineDash([brushSize, brushSize]);
          break;
        default:
          ctx.setLineDash([]);
      }

      ctx.stroke();
      ctx.setLineDash([]);

      // Draw vector arrows dynamically at both endpoints
      drawArrow(
        ctx,
        currentCurve[Math.max(0, currentCurve.length - 2)],
        currentCurve[currentCurve.length - 1],
        brushSize
      );
      drawArrow(ctx, currentCurve[1], currentCurve[0], brushSize);
      ctx.restore();
    }
  }, [currentCurve, drawing, currentColor, strokeStyle, brushSize, canvasRef, forceHistoryReplay]);

  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleStart = (e) => {
    if ("touches" in e && e.touches.length > 1) return; // Ignore pinch-zooms
    const pos = getEventPos(e);
    setDrawing(true);
    setCurrentCurve([pos, pos]); // Seed matching coordinates to build vectors immediately
  };

  const handleMove = (e) => {
    if (!drawing) return;
    if (e.cancelable) e.preventDefault();
    const pos = getEventPos(e);

    setCurrentCurve((prev) => {
      if (prev.length < 2) return [prev[0] || pos, pos];
      const start = prev[0];
      
      // Calculate a midpoint control arc to guarantee a distinct aesthetic curvature on release
      const midPoint = {
        x: (start.x + pos.x) / 2 + (pos.y - start.y) * 0.2,
        y: (start.y + pos.y) / 2 - (pos.x - start.x) * 0.2,
      };
      return [start, midPoint, pos];
    });
  };

  const handleEnd = () => {
    if (!drawing) return;
    setDrawing(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    // Commit shape data using exact functional keys inside actionCreators.js
    if (currentCurve.length >= 2 && addAction) {
      const action = ActionCreators.drawCurveArrow(
        currentCurve,
        currentColor,
        brushSize,
        strokeStyle
      );
      addAction(action);

      if (onFinishCurve) {
        onFinishCurve(currentCurve);
      }

      // CRITICAL FIX: Direct history-force injection re-triggers layout manager execution
      // right before cleaning memory arrays to avoid empty frame clears on frame release
      if (ctx && canvas) {
        const structuralUpdateWithNewAction = {
          ...historyState,
          actions: [...(historyState?.actions || []), action]
        };
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (replayManager?.current) {
          structuralUpdateWithNewAction.actions
            .filter((a) => a.target === "drawing")
            .forEach((drawingAction) => {
              replayManager.current.applyDrawingAction(drawingAction);
            });
        }
      }
    }

    setCurrentCurve([]);
  };

  useEffect(() => {
    draw();
  }, [draw]);

  // Clean layout context on internal unmount state updates
  useEffect(() => {
    if (!active) {
      setDrawing(false);
      setCurrentCurve([]);
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Desktop Mouse Binding Hooks
    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    // Mobile / Tablet Touch Binding Hooks
    canvas.addEventListener("touchstart", handleStart, { passive: false });
    canvas.addEventListener("touchmove", handleMove, { passive: false });
    canvas.addEventListener("touchend", handleEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);

      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [active, currentCurve, drawing, currentColor, strokeStyle, brushSize]);

  return null;
};

export default CurveArrowTool;