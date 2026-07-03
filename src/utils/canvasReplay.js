/**
 * Applies a single recorded drawing action onto a canvas 2D context.
 * Used by useHistoryManager's replayManager ref and during line preview.
 */
export function applyDrawingAction(ctx, action) {
  if (!ctx || !action?.payload) return;

  const { type, payload } = action;
  ctx.save();

  // ── Pencil / Eraser ──────────────────────────────────────────────────────
  if (type === "DRAW_PENCIL" || type === "DRAW_ERASER") {
    const { points, color, strokeWidth, isEraser } = payload;
    if (!points?.length) { ctx.restore(); return; }

    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = color || "#000000";
    ctx.lineWidth   = strokeWidth || 3;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  // ── Straight line ────────────────────────────────────────────────────────
  if (type === "DRAW_LINE") {
    const { startPoint, endPoint, color, strokeWidth, strokeStyle } = payload;
    if (!startPoint || !endPoint) { ctx.restore(); return; }

    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color || "#000000";
    ctx.lineWidth   = strokeWidth || 3;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    switch (strokeStyle) {
      case "dashed": ctx.setLineDash([strokeWidth * 3, strokeWidth * 2]); break;
      case "dotted": ctx.setLineDash([strokeWidth, strokeWidth]);          break;
      default:       ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x,   endPoint.y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Clears the canvas then replays every drawing action in the provided list.
 * Call this with the slice of history up to the current step.
 */
export function replayAllDrawingActions(canvas, actions) {
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";

  actions
    .filter(a => a.target === "drawing")
    .forEach(a => applyDrawingAction(ctx, a));
}