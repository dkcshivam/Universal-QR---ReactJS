import React, { useEffect, useState, useRef, useCallback } from "react";
import { ActionCreators } from "@/utils/actionCreators";

export const CurveTool = ({
  active,
  canvasRef,
  onFinishCurve,
  setActiveTool,
  currentColor,
  strokeStyle,
  brushSize,
  createAction,
  addAction,
  replayManager,
  historyState,
}) => {
  const [curves, setCurves] = useState([]);
  const [currentCurve, setCurrentCurve] = useState([]);
  const [selectedCurveIndex, setSelectedCurveIndex] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [curveId, setCurveId] = useState("");

  useEffect(() => {
    if (active && !curveId) {
      setCurveId(
        `curve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      );
    }
  }, [active, curveId]);

  useEffect(() => {
    if (!active) {
      setDrawing(false);
      setCurrentCurve([]);
      setMousePos(null);
      setSelectedCurveIndex(null);
    }
  }, [active]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const needsFullRedraw =
      (drawing && currentCurve.length > 1) ||
      selectedCurveIndex !== null ||
      mousePos !== null;

    if (needsFullRedraw) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (replayManager?.current) {
        const drawingActions = historyState?.actions?.filter(
          (a) => a.target === "drawing"
        );

        drawingActions?.forEach((drawingAction) => {
          replayManager.current.applyDrawingAction(drawingAction);
        });
      }
    }

    curves.forEach((curve, idx) => {
      if (curve.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(curve[0].x, curve[0].y);

      for (let i = 0; i < curve.length - 1; i++) {
        const p0 = curve[i - 1] || curve[i];
        const p1 = curve[i];
        const p2 = curve[i + 1];
        const p3 = curve[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;

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

      if (selectedCurveIndex === idx) {
        curve.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = currentColor;
          ctx.fill();
        });
      }
    });

    if (drawing && currentCurve.length > 0) {
      const previewCurve = [...currentCurve];
      if (mousePos && currentCurve.length >= 1) {
        previewCurve.push(mousePos);
      }

      ctx.save();

      if (previewCurve.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(previewCurve[0].x, previewCurve[0].y);

        for (let i = 0; i < previewCurve.length - 1; i++) {
          const p0 = previewCurve[i - 1] || previewCurve[i];
          const p1 = previewCurve[i];
          const p2 = previewCurve[i + 1];
          const p3 = previewCurve[i + 2] || p2;

          const cp1x = p1.x + (p2.x - p0.x) / 6;
          const cp1y = p1.y + (p2.y - p0.y) / 6;
          const cp2x = p2.x - (p3.x - p1.x) / 6;
          const cp2y = p2.y - (p3.y - p1.y) / 6;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }

        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;

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
        ctx.restore();
      }
    }

    if (drawing && currentCurve.length > 0 && mousePos) {
      const lastPoint = currentCurve[currentCurve.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.strokeStyle = currentColor || "#070707";
      ctx.setLineDash([brushSize, brushSize]);
      ctx.lineWidth = brushSize;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const isNear = (pt1, pt2, distance = 10) => {
    const dx = pt1.x - pt2.x;
    const dy = pt1.y - pt2.y;
    return dx * dx + dy * dy <= distance * distance;
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);

    if (drawing) {
      const newCurve = [...currentCurve, pos];
      setCurrentCurve(newCurve);
      return;
    }

    if (selectedCurveIndex !== null) {
      const curve = curves[selectedCurveIndex];
      for (let i = 0; i < curve.length; i++) {
        if (isNear(pos, curve[i])) {
          setDragging(i);
          return;
        }
      }
    }

    const hitIndex = curves.findIndex((curve) =>
      curve.some((pt) => isNear(pt, pos, 8))
    );

    if (hitIndex !== -1) {
      setSelectedCurveIndex(hitIndex);
      return;
    }

    const newCurve = [pos];
    setCurrentCurve([pos]);
    setDrawing(true);
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    setMousePos(pos);

    if (dragging !== null && selectedCurveIndex !== null) {
      setCurves((prev) => {
        const newCurves = [...prev];
        const updatedCurve = [...newCurves[selectedCurveIndex]];
        updatedCurve[dragging] = pos;
        newCurves[selectedCurveIndex] = updatedCurve;
        return newCurves;
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setMousePos(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && drawing && currentCurve.length > 1) {
      if (addAction) {
        const action = ActionCreators.drawCurve(
          currentCurve,
          currentColor,
          brushSize,
          strokeStyle
        );
        addAction(action);
      }

      setCurrentCurve([]);
      setMousePos(null);
      setDrawing(false);
      setSelectedCurveIndex(null);
      setCurveId("");

      setTimeout(() => {
        setActiveTool(null);
      }, 50);

      if (onFinishCurve) {
        onFinishCurve(currentCurve);
      }
    }
  };

  useEffect(draw, [
    curves,
    currentCurve,
    selectedCurveIndex,
    dragging,
    drawing,
    mousePos,
  ]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, currentCurve, curves, dragging, selectedCurveIndex]);

  return null;
};
