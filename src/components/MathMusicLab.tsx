import React, { useState, useEffect, useRef } from "react";
import { Plus, Minus, Info, Volume2, RefreshCw, Layers, Sliders, Music, TrendingUp, Sparkles } from "lucide-react";

export default function MathMusicLab() {
  const [activeTab, setActiveTab] = useState<"math" | "fractions" | "music">("math");

  // =========================================================================
  // 1. MATH FUNCTION PLOTTER
  // =========================================================================
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [functionExpr, setFunctionExpr] = useState<string>("Math.sin(x) * 4");
  const [exprPresets] = useState([
    { label: "Sine Wave (sin x)", value: "Math.sin(x) * 4" },
    { label: "Cosine Wave (cos x)", value: "Math.cos(x) * 3" },
    { label: "Parabola quadratic (x²)", value: "0.2 * x * x - 3" },
    { label: "Tangent Wave (tan x)", value: "Math.tan(x) * 2" },
    { label: "Sinc dampener", value: "x !== 0 ? Math.sin(x)/x * 6 : 6" },
  ]);

  useEffect(() => {
    if (activeTab !== "math") return;
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Standard dims
    canvas.width = 320;
    canvas.height = 240;

    // Clean viewport
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const scale = 20; // 20 pixels = 1 unit

    // A. Draw Grid lines
    ctx.strokeStyle = "rgba(100, 115, 180, 0.12)";
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // B. Draw Coordinate Axes
    ctx.strokeStyle = "rgba(100, 150, 240, 0.45)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, centerY); ctx.lineTo(w, centerY); // X axis
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, h); // Y axis
    ctx.stroke();

    // Center markings
    ctx.fillStyle = "rgba(100, 150, 240, 0.6)";
    ctx.font = "9px monospace";
    ctx.fillText("0", centerX + 5, centerY - 5);
    ctx.fillText("x", w - 12, centerY - 8);
    ctx.fillText("y", centerX + 6, 12);

    // C. Plot evaluated math curve
    ctx.strokeStyle = "#f43f5e"; // rose-500
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    let firstPoint = true;

    for (let pixelX = 0; pixelX < w; pixelX++) {
      // Translate pixel X to mathematical x
      const x = (pixelX - centerX) / scale;
      
      try {
        // Safe evaluation sandbox using Math library
        const yValue = evalExpressionSafe(functionExpr, x);
        
        // Translate mathematical y to pixel y
        const pixelY = centerY - yValue * scale;

        // Skip drawing point if off bounds
        if (pixelY >= 0 && pixelY <= h) {
          if (firstPoint) {
            ctx.moveTo(pixelX, pixelY);
            firstPoint = false;
          } else {
            ctx.lineTo(pixelX, pixelY);
          }
        } else {
          firstPoint = true; // Break path connection
        }
      } catch (err) {
        // Syntax error in manual formula user input
      }
    }
    ctx.stroke();
  }, [activeTab, functionExpr]);

  const evalExpressionSafe = (expr: string, x: number): number => {
    // Basic protection on math evaluations
    const sanitized = expr.replace(/[^-0-9x*+\/().\s,Math.sinMath.cosMath.tanMath.sqrtMath.absMath.pow]/g, "");
    // Use Function constructor
    const evaluator = new Function("x", `try { return ${sanitized}; } catch(e) { return 0; }`);
    return Number(evaluator(x));
  };

  // =========================================================================
  // 2. FRACTIONS ENGAGING PIE VISUALIZER
  // =========================================================================
  const pieCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [numerator, setNumerator] = useState<number>(3);
  const [denominator, setDenominator] = useState<number>(8);

  useEffect(() => {
    if (activeTab !== "fractions") return;
    const canvas = pieCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 180;
    canvas.height = 180;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 70;

    // Draw slices
    for (let i = 0; i < denominator; i++) {
      const angleStart = (i * 2 * Math.PI) / denominator - Math.PI / 2;
      const angleEnd = ((i + 1) * 2 * Math.PI) / denominator - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angleStart, angleEnd);
      ctx.closePath();

      // Highlight selected numerators
      if (i < numerator) {
        ctx.fillStyle = "rgba(249, 115, 22, 0.85)"; // orange highlighted
        ctx.strokeStyle = "#c2410c";
        ctx.lineWidth = 2.2;
      } else {
        ctx.fillStyle = "rgba(51, 65, 85, 0.4)"; // dark transparent container
        ctx.strokeStyle = "rgba(100, 116, 139, 0.3)";
        ctx.lineWidth = 1.2;
      }
      ctx.fill();
      ctx.stroke();
    }

    // Inner clear ring cap for modular beauty
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a"; // slate-900 background matches container
    ctx.fill();
    ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
    ctx.stroke();
  }, [activeTab, numerator, denominator]);

  // Adjust numerators to avoid invalid fraction values (N must be <= D)
  const adjustNumerator = (val: number) => {
    setNumerator((p) => Math.min(denominator, Math.max(1, p + val)));
  };

  const adjustDenominator = (val: number) => {
    setDenominator((prev) => {
      const next = Math.min(20, Math.max(2, prev + val));
      // Adjust numerator down to fit if it exceeds new denominator
      setNumerator((currentN) => Math.min(next, currentN));
      return next;
    });
  };

  // =========================================================================
  // 3. PIANO SYNTHESIZER AND MUSICAL G-STAFF DRAWER
  // =========================================================================
  const staveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [activePlayNote, setActivePlayNote] = useState<string | null>(null);

  const pianoKeys = [
    { note: "C4", isBlack: false, freq: 261.63, offset: 0 },
    { note: "C#4", isBlack: true, freq: 277.18, offset: 12 },
    { note: "D4", isBlack: false, freq: 293.66, offset: 24 },
    { note: "D#4", isBlack: true, freq: 311.13, offset: 36 },
    { note: "E4", isBlack: false, freq: 329.63, offset: 48 },
    { note: "F4", isBlack: false, freq: 349.23, offset: 72 },
    { note: "F#4", isBlack: true, freq: 369.99, offset: 84 },
    { note: "G4", isBlack: false, freq: 392.00, offset: 96 },
    { note: "G#4", isBlack: true, freq: 415.30, offset: 108 },
    { note: "A4", isBlack: false, freq: 440.00, offset: 120 },
    { note: "A#4", isBlack: true, freq: 466.16, offset: 132 },
    { note: "B4", isBlack: false, freq: 493.88, offset: 144 },
    { note: "C5", isBlack: false, freq: 523.25, offset: 168 },
  ];

  useEffect(() => {
    if (activeTab !== "music") return;
    drawMusicalStave();
  }, [activeTab, activePlayNote]);

  const playSynthesizerNote = (noteName: string, freq: number) => {
    setActivePlayNote(noteName);
    setTimeout(() => {
      setActivePlayNote((curr) => curr === noteName ? null : curr);
    }, 450);

    // Initialize audio context lazily
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      // Create oscillator synth soundwaves
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Volume envelope fades exponentially
      gainNode.gain.setValueAtTime(0.24, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.002, audioCtx.currentTime + 0.6);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.error("Audio Context playback error:", e);
    }
  };

  const drawMusicalStave = () => {
    const canvas = staveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 140;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw five standard lines of stave
    ctx.strokeStyle = "rgba(224, 242, 254, 0.35)";
    ctx.lineWidth = 1.5;
    
    const startY = 35;
    const spacing = 12;

    for (let i = 0; i < 5; i++) {
      const y = startY + i * spacing;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(280, y);
      ctx.stroke();
    }

    // Draw G Clef indicator graphic
    ctx.strokeStyle = "#38bdf8"; // sky-400
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Simplified loop representing clef symbol
    ctx.moveTo(35, 95);
    ctx.quadraticCurveTo(46, 18, 42, 25);
    ctx.quadraticCurveTo(34, 112, 54, 75);
    ctx.quadraticCurveTo(62, 52, 42, 56);
    ctx.stroke();

    // Map note names to stave heights (spacing = 12)
    // C4 is ledgers line 1 below, center C5 sits on the 3rd space etc.
    const noteStaveMapping: { [key: string]: number } = {
      "C4": startY + 5 * spacing + 1, // Ledger bottom line
      "C#4": startY + 5 * spacing + 1,
      "D4": startY + 5 * spacing - 6,
      "D#4": startY + 5 * spacing - 6,
      "E4": startY + 4 * spacing,
      "F4": startY + 4 * spacing - 6,
      "F#4": startY + 4 * spacing - 6,
      "G4": startY + 3 * spacing,
      "G#4": startY + 3 * spacing,
      "A4": startY + 3 * spacing - 6,
      "A#4": startY + 3 * spacing - 6,
      "B4": startY + 2 * spacing,
      "C5": startY + 2 * spacing - 6,
    };

    if (activePlayNote) {
      const targetY = noteStaveMapping[activePlayNote] || startY + 2 * spacing;
      
      // Draw accidental sharp indicator if it contains "#"
      if (activePlayNote.includes("#")) {
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("#", 114, targetY + 5);
      }

      // Draw ledger lines for C4
      if (activePlayNote.startsWith("C4")) {
        ctx.strokeStyle = "rgba(224, 242, 254, 0.65)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(116, startY + 5 * spacing);
        ctx.lineTo(142, startY + 5 * spacing);
        ctx.stroke();
      }

      // Draw round oval note circle
      ctx.fillStyle = "#e11d48"; // rose red note
      ctx.beginPath();
      ctx.arc(130, targetY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Note stem line facing upward
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(135, targetY);
      ctx.lineTo(135, targetY - 26);
      ctx.stroke();

      // Text note prompt
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(activePlayNote, 155, targetY + 4);
    } else {
      ctx.fillStyle = "rgba(100, 116, 139, 0.45)";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("Click keys below to draw notes!", 95, startY + 2.5 * spacing);
    }
  };
  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm text-slate-800">
      
      {/* Subject Lab Selector Tabs */}
      <div className="flex bg-slate-50 border-b border-slate-150 py-2 px-4 space-x-2 select-none">
        <button
          onClick={() => setActiveTab("math")}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs transition cursor-pointer ${activeTab === "math" ? "bg-white border border-slate-200 text-blue-600 font-extrabold shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
        >
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>📐 Formulas Plotter</span>
        </button>

        <button
          onClick={() => setActiveTab("fractions")}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs transition cursor-pointer ${activeTab === "fractions" ? "bg-white border border-slate-200 text-blue-600 font-extrabold shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
        >
          <Sliders className="w-4 h-4 text-blue-640" />
          <span>🍩 Fractions Visualizer</span>
        </button>

        <button
          onClick={() => setActiveTab("music")}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs transition cursor-pointer ${activeTab === "music" ? "bg-white border border-slate-200 text-blue-600 font-extrabold shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
        >
          <Music className="w-4 h-4 text-blue-600" />
          <span>🎹 Musical Stave</span>
        </button>
      </div>

      {/* Primary Simulator Panel */}
      <div className="grow p-4 bg-white overflow-y-auto">

        {/* =========================================================================
            1. MATHEMATICS FUNCTION PLOTTER COMPONENT LAYOUT
            ========================================================================= */}
        {activeTab === "math" && (
          <div className="flex flex-col lg:flex-row gap-5 items-stretch h-full">
            
            {/* Coordinate Graph Plot Canvas */}
            <div className="flex-1 bg-slate-950 p-4 border border-slate-800 rounded-2xl flex flex-col items-center justify-between min-h-[290px] relative">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase absolute top-2 left-3">Interactive Cartesian Grid</span>
              
              <div className="my-2.5">
                <canvas ref={graphCanvasRef} className="rounded-xl border border-slate-850 shadow" />
              </div>

              {/* Formula input box */}
              <div className="w-full flex items-center space-x-2 mt-2">
                <span className="text-xs font-mono font-bold text-slate-400">Y =</span>
                <input
                  type="text"
                  value={functionExpr}
                  onChange={(e) => setFunctionExpr(e.target.value)}
                  className="bg-slate-900 text-slate-100 font-mono text-xs px-3 py-2 rounded-xl flex-1 border border-slate-805 outline-none focus:border-rose-500"
                  placeholder="e.g. Math.sin(x)"
                />
              </div>
            </div>

            {/* Presets and Sandbox Math helper */}
            <div className="w-full lg:w-48 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-405 font-mono tracking-wider font-extrabold uppercase block mb-1.5">Preset functions</span>
                <div className="space-y-1.5">
                  {exprPresets.map((pr, inx) => (
                    <button
                      key={inx}
                      onClick={() => setFunctionExpr(pr.value)}
                      className="w-full text-left p-1.5 bg-slate-900 rounded-lg text-[10.5px] font-bold text-slate-350 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition"
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg text-left mt-3" style={{ fontSize: "10px" }}>
                <span className="text-[9px] uppercase tracking-wider block mb-1 font-bold text-rose-450">WHITEBOARD TIP</span>
                <p className="text-slate-400 leading-relaxed font-normal">
                  Teachers can enter direct Javascript Math formulas to evaluate curves live on screen.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            2. FRACTIONS ENGAGING PIE AND BAR VISUALIZER
            ========================================================================= */}
        {activeTab === "fractions" && (
          <div className="flex flex-col lg:flex-row gap-5 items-stretch h-full">
            
            {/* Pie Display Render Box */}
            <div className="flex-1 bg-slate-950 p-4 border border-slate-800 rounded-2xl flex flex-col items-center justify-between min-h-[300px] relative">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase absolute top-2 left-3">Fraction dividing circular Pie</span>
              
              <div className="my-2.5">
                <canvas ref={pieCanvasRef} />
              </div>

              {/* Divided Block Segment Visual Row */}
              <div className="w-full bg-slate-900/60 p-2 border border-slate-850 rounded-xl flex items-center space-x-1.5 justify-center overflow-hidden">
                {Array.from({ length: denominator }).map((_, inx) => (
                  <div
                    key={inx}
                    className={`h-4 flex-1 rounded border transition-all ${inx < numerator ? "bg-orange-500 border-orange-700" : "bg-slate-800 border-slate-700"}`}
                  />
                ))}
              </div>
            </div>

            {/* Division sliders and visual details */}
            <div className="w-full lg:w-48 bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
              
              {/* Formula numeric math boxes */}
              <div className="text-center p-3 bg-slate-950 rounded-xl border border-slate-850">
                <div className="flex flex-col items-center text-slate-205 font-black text-2xl font-mono leading-none py-1">
                  <span>{numerator}</span>
                  <div className="w-10 h-1 bg-slate-500 my-1 rounded" />
                  <span>{denominator}</span>
                </div>
                <div className="text-[11px] font-bold text-amber-500 font-mono mt-2">
                  = {((numerator / denominator) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Plus Minus control sets */}
              <div className="space-y-1.5 my-3">
                <div className="flex items-center justify-between bg-slate-900 p-1 rounded-xl border border-slate-855">
                  <span className="text-[10px] uppercase font-mono tracking-wide text-slate-400 pl-2 font-black">Num (N)</span>
                  <div className="flex space-x-1">
                    <button onClick={() => adjustNumerator(-1)} className="p-1 bg-slate-800 rounded text-slate-300 hover:bg-slate-700"><Minus className="w-3 h-3" /></button>
                    <button onClick={() => adjustNumerator(1)} className="p-1 bg-slate-800 rounded text-slate-300 hover:bg-slate-700"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-1 rounded-xl border border-slate-855">
                  <span className="text-[10px] uppercase font-mono tracking-wide text-slate-400 pl-2 font-black">Denom (D)</span>
                  <div className="flex space-x-1">
                    <button onClick={() => adjustDenominator(-1)} className="p-1 bg-slate-800 rounded text-slate-300 hover:bg-slate-700"><Minus className="w-3 h-3" /></button>
                    <button onClick={() => adjustDenominator(1)} className="p-1 bg-slate-800 rounded text-slate-300 hover:bg-slate-700"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            3. PIANO SYNTHESIZER AND GRAND NOTE STAVE
            ========================================================================= */}
        {activeTab === "music" && (
          <div className="flex flex-col h-full">
            
            {/* G Clef drawing panel */}
            <div className="bg-slate-950 p-2.5 border border-slate-800 rounded-2xl flex flex-col items-center">
              <canvas ref={staveCanvasRef} className="bg-slate-950 rounded-xl" />
            </div>

            {/* Grand Piano 13-Key Keyboard tactile */}
            <div className="flex relative justify-center bg-slate-950/30 p-2 border border-slate-850 rounded-2xl mt-4 w-full h-36 overflow-hidden select-none whitespace-nowrap">
              {pianoKeys.map((k) => {
                const isActive = activePlayNote === k.note;
                
                if (k.isBlack) {
                  return (
                    <button
                      key={k.note}
                      onClick={() => playSynthesizerNote(k.note, k.freq)}
                      style={{ left: `${38 + k.offset}px` }}
                      className={`absolute w-6 h-20 bg-slate-901 border border-black rounded-b-md z-10 hover:bg-slate-800 transition active:scale-95 ${isActive ? "bg-cyan-500 border-cyan-400" : ""}`}
                      title={k.note}
                    />
                  );
                } else {
                  return (
                    <button
                      key={k.note}
                      onClick={() => playSynthesizerNote(k.note, k.freq)}
                      className={`inline-block w-8 h-28 bg-white border border-slate-200 rounded-b-lg hover:bg-slate-100 transition shadow-inner p-1 outline-none text-left flex flex-col justify-end pb-1.5 active:scale-98 ${isActive ? "bg-cyan-150 border-cyan-300" : ""}`}
                    >
                      <span className="text-[8px] font-black text-slate-500 font-mono">{k.note}</span>
                    </button>
                  );
                }
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
