import React, { useRef, useState, useEffect } from "react";
import { Pen, Eraser, RotateCcw, RotateCw, Trash2, Layers, Download, Check, ShieldAlert, Compass as CompassIcon, Sparkles } from "lucide-react";
import { ToolType, DrawingPath, WhiteboardSlide } from "../types";

interface WhiteboardCanvasProps {
  activeSlide: WhiteboardSlide;
  onUpdateSlide: (updatedSlide: WhiteboardSlide) => void;
}

export default function WhiteboardCanvas({ activeSlide, onUpdateSlide }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing state
  const [activeTool, setActiveTool] = useState<ToolType>("pen");
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [strokeColor, setStrokeColor] = useState<string>("#e11d48"); // default rose-600
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  
  // Undo / Redo stacks local or stored in slide
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);

  // Interactive Math Geometrical Tools Overlay State
  const [showMathTools, setShowMathTools] = useState(false);
  const [ruler, setRuler] = useState({ x: 200, y: 300, angle: 0, width: 350, height: 60, isDragging: false });
  const [protractor, setProtractor] = useState({ x: 600, y: 250, angle: 0, size: 240, isDragging: false });
  const [compass, setCompass] = useState({ x: 400, y: 150, angle: -30, radius: 100, isDragging: false, needleDragging: false, pencilDragging: false });

  // Dragger reference values for non-jitter offset dragging
  const dragOffsetRef = useRef({ x: 0, y: 0, startAngle: 0, startRadius: 100 });

  // Update canvas sizing on mount or resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const tempCanvas = tempCanvasRef.current;
      const container = containerRef.current;
      if (!canvas || !tempCanvas || !container) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      canvas.width = width;
      canvas.height = height;
      tempCanvas.width = width;
      tempCanvas.height = height;

      drawSlideContent();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Quick delay to ensure initial container dimensions are calculated
    const timer = setTimeout(resizeCanvas, 100);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      clearTimeout(timer);
    };
  }, [activeSlide.id]);

  // Redraw when the slide data triggers changes
  useEffect(() => {
    drawSlideContent();
  }, [activeSlide.paths, activeSlide.backgroundTemplate, activeSlide.backgroundColor]);

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Apply Solid Color
    ctx.fillStyle = activeSlide.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    const template = activeSlide.backgroundTemplate;
    if (template === "grid" || template === "coordinate") {
      ctx.strokeStyle = "rgba(100, 150, 240, 0.15)";
      ctx.lineWidth = 1;
      const gridSize = 40;

      // Draw vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // If coordinate, draw axes
      if (template === "coordinate") {
        ctx.strokeStyle = "rgba(100, 150, 240, 0.5)";
        ctx.lineWidth = 3;
        const hMid = Math.floor(height / 2);
        const wMid = Math.floor(width / 2);

        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, hMid);
        ctx.lineTo(width, hMid);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(wMid, 0);
        ctx.lineTo(wMid, height);
        ctx.stroke();

        // Arrow markers
        ctx.fillStyle = "rgba(100, 150, 240, 0.6)";
        ctx.font = "12px monospace";
        // Numbers
        ctx.fillText("Y", wMid + 8, 20);
        ctx.fillText("X", width - 20, hMid - 8);
      }
    } else if (template === "ruled") {
      ctx.strokeStyle = "rgba(100, 110, 180, 0.25)";
      ctx.lineWidth = 1;

      // Vertical pink margin line
      ctx.beginPath();
      ctx.moveTo(120, 0);
      ctx.lineTo(120, height);
      ctx.strokeStyle = "rgba(230, 100, 100, 0.4)";
      ctx.stroke();

      ctx.strokeStyle = "rgba(100, 110, 180, 0.25)";
      for (let y = 80; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (template === "dotted") {
      ctx.fillStyle = "rgba(100, 120, 180, 0.4)";
      const dSize = 30;
      for (let x = dSize; x < width; x += dSize) {
        for (let y = dSize; y < height; y += dSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (template === "music") {
      ctx.strokeStyle = "rgba(100, 100, 100, 0.35)";
      ctx.lineWidth = 1;
      const margin = 80;
      for (let block = 0; block < height; block += 160) {
        if (block + 120 > height) break;
        for (let line = 0; line < 5; line++) {
          ctx.beginPath();
          ctx.moveTo(40, block + 60 + line * 14);
          ctx.lineTo(width - 40, block + 60 + line * 14);
          ctx.stroke();
        }
      }
    } else if (template === "sports-court") {
      // Draw standard field markings (half soccer/basketball)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2.5;
      
      // Outer rect
      ctx.strokeRect(60, 40, width - 120, height - 80);
      
      // Center line
      ctx.beginPath();
      ctx.moveTo(width / 2, 40);
      ctx.lineTo(width / 2, height - 40);
      ctx.stroke();

      // Center circle
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Left Penalty Box
      ctx.strokeRect(60, height / 2 - 120, 140, 240);
      // Right Penalty Box
      ctx.strokeRect(width - 200, height / 2 - 120, 140, 240);
    }
  };

  const drawPathOnCtx = (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
    if (path.points.length === 0) return;

    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = path.width;

    if (path.tool === "highlighter") {
      ctx.strokeStyle = path.color;
      ctx.globalAlpha = 0.45;
    } else {
      ctx.strokeStyle = path.color;
      ctx.globalAlpha = 1.0;
    }

    if (path.tool === "pen" || path.tool === "highlighter") {
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    } else if (path.tool === "line") {
      const start = path.points[0];
      const end = path.points[path.points.length - 1];
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (path.tool === "arrow") {
      const start = path.points[0];
      const end = path.points[path.points.length - 1];
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // draw arrow tip
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const arrowLength = Math.max(12, path.width * 2.5);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - arrowLength * Math.cos(angle - Math.PI / 6),
        end.y - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        end.x - arrowLength * Math.cos(angle + Math.PI / 6),
        end.y - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = path.color;
      ctx.fill();
    } else if (path.tool === "rect") {
      const start = path.points[0];
      const end = path.points[path.points.length - 1];
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (path.tool === "circle") {
      const start = path.points[0];
      const end = path.points[path.points.length - 1];
      const rx = (end.x - start.x) / 2;
      const ry = (end.y - start.y) / 2;
      const cx = start.x + rx;
      const cy = start.y + ry;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.scale(Math.abs(rx), Math.abs(ry));
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.restore();
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0; // Reset
  };

  const drawSlideContent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawBackground(ctx, canvas.width, canvas.height);

    // Apply and draw each stored path
    activeSlide.paths.forEach((path) => {
      drawPathOnCtx(ctx, path);
    });
  };

  // Helper to get coordinates
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Drawing event triggers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === "none") return;
    const pos = getPointerPos(e);

    setIsDrawing(true);

    const tempCanvas = tempCanvasRef.current;
    if (!tempCanvas) return;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    if (activeTool === "eraser_stroke" || activeTool === "eraser_rect") {
      setIsErasing(true);
      performErase(pos.x, pos.y);
    } else {
      // Start a path
      const newPath: DrawingPath = {
        id: Math.random().toString(36).substring(2, 9),
        tool: activeTool,
        color: strokeColor,
        width: lineWidth,
        points: [pos],
      };
      
      drawPathOnTemp(newPath);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getPointerPos(e);

    const tempCanvas = tempCanvasRef.current;
    if (!tempCanvas) return;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    if (isErasing) {
      performErase(pos.x, pos.y);
    } else {
      // Draw temporary path
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      const lastPaths = activeSlide.paths;
      const activeStroke: DrawingPath = {
        id: "temp",
        tool: activeTool,
        color: strokeColor,
        width: lineWidth,
        points: isDrawing ? [...(tempPathsRef.current || []), pos] : [pos],
      };

      if (!tempPathsRef.current) {
        tempPathsRef.current = [pos];
      } else {
        // limit size for performance
        tempPathsRef.current.push(pos);
      }

      activeStroke.points = tempPathsRef.current;
      drawPathOnTemp(activeStroke);
    }
  };

  const tempPathsRef = useRef<{ x: number; y: number }[] | null>(null);

  const drawPathOnTemp = (path: DrawingPath) => {
    const tempCanvas = tempCanvasRef.current;
    if (!tempCanvas) return;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    drawPathOnCtx(tempCtx, path);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setIsErasing(false);

    const tempCanvas = tempCanvasRef.current;
    if (tempCanvas) {
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    if (tempPathsRef.current && tempPathsRef.current.length > 0 && activeTool !== "eraser_stroke" && activeTool !== "eraser_rect") {
      const newPath: DrawingPath = {
        id: Math.random().toString(36).substring(2, 9),
        tool: activeTool,
        color: strokeColor,
        width: lineWidth,
        points: [...tempPathsRef.current],
      };

      // Save to undo history before editing active list
      setUndoStack([...undoStack, activeSlide.paths]);
      setRedoStack([]); // Clear redo

      const updatedPaths = [...activeSlide.paths, newPath];
      onUpdateSlide({
        ...activeSlide,
        paths: updatedPaths,
      });
    }

    tempPathsRef.current = null;
  };

  // Erasing shapes or segments based on bounding proximity calculation
  const performErase = (x: number, y: number) => {
    const hoverRadius = 15 + lineWidth;
    
    // Backup state for undo before first erase drag point
    if (isErasing && tempPathsRef.current === null) {
      setUndoStack([...undoStack, activeSlide.paths]);
      tempPathsRef.current = []; // token lock
    }

    const filtered = activeSlide.paths.filter((path) => {
      // If eraser rect, check coordinate within a square
      if (activeTool === "eraser_rect") {
        return !path.points.some(
          (point) => Math.abs(point.x - x) < hoverRadius && Math.abs(point.y - y) < hoverRadius
        );
      } else {
        // Stroke eraser deletes entire overlapping line path
        return !path.points.some((point) => {
          const dx = point.x - x;
          const dy = point.y - y;
          return Math.sqrt(dx * dx + dy * dy) < hoverRadius;
        });
      }
    });

    if (filtered.length !== activeSlide.paths.length) {
      onUpdateSlide({
        ...activeSlide,
        paths: filtered,
      });
    }
  };

  // Whiteboard quick actions
  const handleClearAll = () => {
    if (activeSlide.paths.length === 0) return;
    setUndoStack([...undoStack, activeSlide.paths]);
    setRedoStack([]);
    onUpdateSlide({
      ...activeSlide,
      paths: [],
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack([...redoStack, activeSlide.paths]);
    setUndoStack(undoStack.slice(0, -1));
    onUpdateSlide({
      ...activeSlide,
      paths: prev,
    });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack([...undoStack, activeSlide.paths]);
    setRedoStack(redoStack.slice(0, -1));
    onUpdateSlide({
      ...activeSlide,
      paths: next,
    });
  };

  // Export board as PNG snapshot
  const exportBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${activeSlide.title.toLowerCase().replace(/\s+/g, "-")}-whiteboard.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color preset swatches
  const colorSwatches = [
    { value: "#000000", label: "Black" },
    { value: "#ffffff", label: "White" },
    { value: "#e11d48", label: "Red" },
    { value: "#ea580c", label: "Orange" },
    { value: "#eab308", label: "Yellow" },
    { value: "#16a34a", label: "Green" },
    { value: "#2563eb", label: "Blue" },
    { value: "#7c3aed", label: "Purple" },
  ];

  // Ruler event drags
  const startRulerDrag = (e: React.MouseEvent, type: "move" | "rotate") => {
    e.preventDefault();
    dragOffsetRef.current = {
      x: e.clientX - ruler.x,
      y: e.clientY - ruler.y,
      startAngle: ruler.angle - Math.atan2(e.clientY - ruler.y, e.clientX - ruler.x),
      startRadius: ruler.width,
    };
    
    const handleMove = (moveEv: MouseEvent) => {
      if (type === "move") {
        setRuler((r) => ({
          ...r,
          x: moveEv.clientX - dragOffsetRef.current.x,
          y: moveEv.clientY - dragOffsetRef.current.y,
        }));
      } else {
        const dx = moveEv.clientX - ruler.x;
        const dy = moveEv.clientY - ruler.y;
        const angle = Math.atan2(dy, dx) + dragOffsetRef.current.startAngle;
        setRuler((r) => ({
          ...r,
          angle: angle,
        }));
      }
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  // Protractor event drags
  const startProtractorDrag = (e: React.MouseEvent, type: "move" | "rotate") => {
    e.preventDefault();
    dragOffsetRef.current = {
      x: e.clientX - protractor.x,
      y: e.clientY - protractor.y,
      startAngle: protractor.angle - Math.atan2(e.clientY - protractor.y, e.clientX - protractor.x),
      startRadius: protractor.size,
    };

    const handleMove = (moveEv: MouseEvent) => {
      if (type === "move") {
        setProtractor((p) => ({
          ...p,
          x: moveEv.clientX - dragOffsetRef.current.x,
          y: moveEv.clientY - dragOffsetRef.current.y,
        }));
      } else {
        const dx = moveEv.clientX - protractor.x;
        const dy = moveEv.clientY - protractor.y;
        const angle = Math.atan2(dy, dx) + dragOffsetRef.current.startAngle;
        setProtractor((p) => ({
          ...p,
          angle: angle,
        }));
      }
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  const startCompassDrag = (e: React.MouseEvent, part: "pivot" | "radius" | "draw") => {
    e.preventDefault();
    const pivotX = compass.x;
    const pivotY = compass.y;
    
    dragOffsetRef.current = {
      x: e.clientX - pivotX,
      y: e.clientY - pivotY,
      startAngle: compass.angle,
      startRadius: compass.radius
    };

    const handleMove = (moveEv: MouseEvent) => {
      if (part === "pivot") {
        setCompass((c) => ({
          ...c,
          x: moveEv.clientX - dragOffsetRef.current.x,
          y: moveEv.clientY - dragOffsetRef.current.y
        }));
      } else if (part === "radius") {
        // Resize distance from pivot
        const dx = moveEv.clientX - pivotX;
        const dy = moveEv.clientY - pivotY;
        const newRadius = Math.max(40, Math.min(300, Math.sqrt(dx * dx + dy * dy)));
        const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        setCompass((c) => ({
          ...c,
          radius: newRadius,
          angle: newAngle
        }));
      } else if (part === "draw") {
        // Compute circular sweep line path directly onto whiteboard slide
        const dx = moveEv.clientX - pivotX;
        const dy = moveEv.clientY - pivotY;
        const curAngle = Math.atan2(dy, dx);
        const radius = compass.radius;
        
        // Add coordinates in increments of angle to draw circle beautifully
        const newAngleDeg = curAngle * (180 / Math.PI);
        setCompass((c) => ({ ...c, angle: newAngleDeg }));

        // Directly insert standard drawing path segments
        const pointsCount = 40;
        const circlePoints = [];
        for (let i = 0; i <= pointsCount; i++) {
          const theta = curAngle - (Math.PI * 2 * (i / pointsCount));
          circlePoints.push({
            x: pivotX + radius * Math.cos(theta),
            y: pivotY + radius * Math.sin(theta)
          });
        }

        const circlePath: DrawingPath = {
          id: Math.random().toString(36).substring(2, 9),
          tool: "circle",
          color: strokeColor,
          width: lineWidth,
          points: circlePoints
        };

        // Inject circle standard paths
        onUpdateSlide({
          ...activeSlide,
          paths: [...activeSlide.paths, circlePath]
        });
      }
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200">
      
      {/* Top Left Menu: Whiteboard Background Patterns & Slide Info */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-lg">
        <span className="text-slate-800 font-bold text-xs mr-2">{activeSlide.title}</span>
        
        <div className="h-4 w-px bg-slate-200 mx-2" />
        
        {/* Quick presets */}
        <select
          value={activeSlide.backgroundTemplate}
          onChange={(e) => {
            onUpdateSlide({
              ...activeSlide,
              backgroundTemplate: e.target.value as any,
              backgroundColor: e.target.value === "chalkboard" ? "#14532d" : "#fafafa",
            });
          }}
          className="bg-slate-50 text-slate-700 text-xs font-semibold py-1 px-2 rounded-md border border-slate-200 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <option value="white">⬜ Blank White</option>
          <option value="chalkboard">🟩 Chalkboard</option>
          <option value="grid">📐 Math Grid</option>
          <option value="coordinate">🎯 Cartesian Plane</option>
          <option value="ruled">📝 Ruled lines</option>
          <option value="dotted">🔲 Dotted Grid</option>
          <option value="music">🎵 Music stave</option>
          <option value="sports-court">🏀 Sports Court</option>
        </select>
        
        <button
          onClick={() => setShowMathTools(!showMathTools)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${showMathTools ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
        >
          <CompassIcon className="w-3.5 h-3.5" />
          <span>Geo Tools</span>
        </button>
      </div>

      {/* Main Container */}
      <div 
        ref={containerRef} 
        className="w-full flex-grow relative overflow-hidden"
        style={{ cursor: activeTool === "none" ? "default" : "crosshair" }}
      >
        {/* Draw Content Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 bg-transparent"
        />

        {/* Temporary dynamic drawing canvas for fluid response */}
        <canvas
          ref={tempCanvasRef}
          className="absolute inset-0 bg-transparent touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* ========================================================================= */}
        {/* DYNAMIC MOVABLE CLASSROOM GEOMETRICAL MATH OVERLAYS */}
        {/* ========================================================================= */}
        {showMathTools && (
          <div className="absolute inset-0 pointer-events-none select-none z-10 w-full h-full">

            {/* A. Dynamic Ruler Interactive */}
            <div
              style={{
                left: ruler.x,
                top: ruler.y,
                transform: `translate(-50%, -50%) rotate(${ruler.angle}rad)`,
                width: ruler.width,
                height: ruler.height,
              }}
              className="absolute pointer-events-auto bg-amber-100/80 backdrop-blur-xs border border-amber-500 rounded-lg flex flex-col justify-between p-1.5 shadow-lg shadow-amber-950/20 active:border-amber-600 group"
            >
              {/* Ruler Tick lines */}
              <div className="flex justify-between items-end h-4 w-full border-b border-amber-900/30">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div className="h-3 w-px bg-amber-900/50" />
                    <span style={{ fontSize: "7px" }} className="-mt-1 text-amber-900/70 font-semibold font-mono">{i}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 px-2 select-none h-4">
                <span className="cursor-move text-[10px] bg-amber-200 px-1 py-0.5 rounded cursor-all-scroll font-mono" onMouseDown={(e) => startRulerDrag(e, "move")}>✥ Drag</span>
                <span className="text-[9px] font-semibold opacity-75">15cm Classroom Ruler</span>
                <span className="cursor-pointer text-[10px] bg-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-300 font-mono" onMouseDown={(e) => startRulerDrag(e, "rotate")}>⟳ Rotate</span>
              </div>
            </div>

            {/* B. Dynamic Protractor Interactive */}
            <div
              style={{
                left: protractor.x,
                top: protractor.y,
                transform: `translate(-50%, -100%) rotate(${protractor.angle}rad)`,
                width: protractor.size,
                height: protractor.size / 2,
              }}
              className="absolute pointer-events-auto bg-sky-200/85 backdrop-blur-xs border border-sky-500 rounded-t-full flex flex-col justify-end p-2 shadow-lg shadow-sky-950/20 group"
            >
              {/* Angle scale on curve */}
              <div className="absolute inset-0 rounded-t-full border-t border-sky-900/20 overflow-hidden">
                {Array.from({ length: 19 }).map((_, i) => {
                  const deg = i * 10;
                  const rad = (deg * Math.PI) / 180;
                  const x = 50 + 50 * Math.cos(-rad);
                  const y = 100 + 100 * Math.sin(-rad);
                  return (
                    <div
                      key={i}
                      style={{
                        left: `${50 + 44 * Math.cos(Math.PI - rad)}%`,
                        bottom: `${44 * Math.sin(Math.PI - rad)}%`,
                        transform: `rotate(${90 - deg}deg)`,
                      }}
                      className="absolute text-[8px] text-sky-950/60 font-bold font-mono"
                    >
                      {deg}°
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between z-10 text-[10px] font-extrabold text-sky-950/90 bg-sky-100/90 px-3 py-1 rounded border border-sky-300 w-full">
                <span className="cursor-move bg-sky-200 px-1.5 py-0.5 rounded" onMouseDown={(e) => startProtractorDrag(e, "move")}>✥ Move</span>
                <span className="text-[9px]">180° Protractor</span>
                <span className="cursor-pointer bg-sky-200 px-2 py-0.5 rounded-full" onMouseDown={(e) => startProtractorDrag(e, "rotate")}>⟳ Rotate</span>
              </div>
            </div>

            {/* C. Interactive Drawing Compass */}
            <div
              style={{
                left: compass.x,
                top: compass.y,
                width: "40px",
                height: "120px",
                transformOrigin: "20px 10px",
                transform: `rotate(${compass.angle}deg)`,
              }}
              className="absolute pointer-events-auto group text-amber-700"
            >
              {/* Needle pivot anchor */}
              <div 
                className="w-10 h-10 bg-slate-800 border-2 border-amber-500 rounded-full cursor-all-scroll flex items-center justify-center p-1 font-mono text-[9px] font-black text-rose-500 select-none shadow"
                onMouseDown={(e) => startCompassDrag(e, "pivot")}
              >
                ⚓ Pivot
              </div>
              
              {/* Arm extending to radius marker and pencil */}
              <div className="w-1 bg-amber-500 mx-auto" style={{ height: `${compass.radius - 20}px` }} />

              {/* Slider resize trigger */}
              <div
                style={{ bottom: "20px" }}
                className="absolute left-1/2 -translate-x-1/2 w-8 h-6 bg-amber-600 border border-amber-300 text-white rounded text-[8px] font-extrabold flex items-center justify-center cursor-ew-resize hover:bg-amber-700 z-10"
                onMouseDown={(e) => startCompassDrag(e, "radius")}
              >
                ↔ {Math.round(compass.radius)}px
              </div>
              
              {/* Drawing Pencil end trigger */}
              <div
                style={{ top: `${compass.radius + 10}px` }}
                className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-rose-600 border-2 border-white text-white font-black text-[9px] cursor-pointer flex items-center justify-center hover:scale-105 active:bg-rose-700 shadow"
                onMouseDown={(e) => startCompassDrag(e, "draw")}
                title="Hold and drag to sweep-draw a circle!"
              >
                ✏️ Drawing
              </div>
            </div>

          </div>
        )}
      </div>

      {/* WHITEBOARD BOTTOM Relocatable TOOLBAR PANEL */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-200 shadow-xl w-max max-w-[95%]">
        
        {/* Draw settings */}
        <div className="flex items-center space-x-4 mb-3 w-full border-b border-slate-105 pb-3">
          
          {/* Swatches block */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200">
            {colorSwatches.map((swatch) => (
              <button
                key={swatch.value}
                onClick={() => setStrokeColor(swatch.value)}
                style={{ backgroundColor: swatch.value }}
                className={`w-6 h-6 rounded-lg transition border hover:scale-110 ${strokeColor === swatch.value ? "border-slate-850 scale-105 shadow-md" : "border-slate-200"}`}
                title={swatch.label}
              />
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Line weight slider */}
          <div className="flex items-center space-x-2.5 flex-1">
            <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase">Brush</span>
            <input
              type="range"
              min="1"
              max="45"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-650"
            />
            <span className="text-xs text-slate-850 font-mono font-extrabold">{lineWidth}px</span>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Preset templates */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearAll}
              className="p-1.5 bg-slate-50 text-red-500 border border-slate-200 rounded-lg hover:bg-red-50"
              title="Clear Whiteboard Slide"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={exportBoard}
              className="p-1.5 bg-slate-50 text-emerald-600 border border-slate-200 rounded-lg hover:bg-emerald-50"
              title="Download Snapshot PNG"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Major Tool Mode Toggles */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTool("pen")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTool === "pen" ? "bg-blue-600 text-white shadow" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Pencil Pen</span>
          </button>

          <button
            onClick={() => setActiveTool("highlighter")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTool === "highlighter" ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300 shadow-sm" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span>Highlighter</span>
          </button>

          <button
            onClick={() => setActiveTool("eraser_stroke")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTool === "eraser_stroke" ? "bg-blue-600 text-white shadow" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Stroke Eraser</span>
          </button>

          <button
            onClick={() => setActiveTool("eraser_rect")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTool === "eraser_rect" ? "bg-amber-600 text-white shadow" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Area Eraser</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Geometry shapes quick select */}
          <select
            value={activeTool}
            onChange={(e) => setActiveTool(e.target.value as ToolType)}
            className={`px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 ${["line", "circle", "rect", "arrow"].includes(activeTool) ? "bg-blue-650 text-white ring-2 ring-blue-500" : ""}`}
          >
            <option value={activeTool}>✏️ Custom Drawing</option>
            <option value="line">📏 Draw Line</option>
            <option value="arrow">➡️ Draw Arrow</option>
            <option value="rect">▭ Draw Rectangle</option>
            <option value="circle">⚪ Draw Oval Circle</option>
            <option value="none">🖐️ Pan & View Mouse</option>
          </select>
        </div>

      </div>
    </div>
  );
}
