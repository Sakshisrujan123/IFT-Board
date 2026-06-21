import React, { useState, useEffect, useRef } from "react";
import { Beaker, ShieldAlert, Zap, Flame, Grid, Lightbulb, Trash, Info, RefreshCw, Layers, Plus } from "lucide-react";
import { Chemical, CircuitElement } from "../types";

export default function ScienceLab() {
  const [activeLab, setActiveLab] = useState<"chem" | "physics">("chem");

  // =========================================================================
  // 1. CHEMISTRY LAB MIXER ENGINE
  // =========================================================================
  const beakerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [beakerChemicals, setBeakerChemicals] = useState<{ chem: Chemical; volume: number }[]>([
    { chem: { id: "water", name: "Water", color: "rgba(186, 230, 253, 0.4)", formula: "H₂O", ph: 7 }, volume: 150 }
  ]);
  const [temperature, setTemperature] = useState<number>(22); // Celcius
  const [burnerActive, setBurnerActive] = useState<boolean>(false);
  const [activeIndicator, setActiveIndicator] = useState<"none" | "litmus" | "phenolphthalein">("none");
  const bubbleParticlesRef = useRef<{ x: number; y: number; r: number; speed: number }[]>([]);

  const chemicalStock: Chemical[] = [
    { id: "water", name: "Water (Neutral Base)", color: "rgba(186, 230, 253, 0.4)", formula: "H₂O", ph: 7 },
    { id: "copper", name: "Copper Sulfate (Blue)", color: "rgba(59, 130, 246, 0.7)", formula: "CuSO₄", ph: 5.5 },
    { id: "cobalt", name: "Cobalt(II) Chloride", color: "rgba(244, 63, 94, 0.65)", formula: "CoCl₂", ph: 6 },
    { id: "acid", name: "Hydrochloric Acid (Acid)", color: "rgba(224, 242, 254, 0.3)", formula: "HCl", ph: 1 },
    { id: "alkali", name: "Sodium Hydroxide (Alkali)", color: "rgba(241, 245, 249, 0.3)", formula: "NaOH", ph: 13 },
  ];

  // Run bubble updates and boiling physics loop
  useEffect(() => {
    let animId: number;
    const canvas = beakerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set stable dims
    canvas.width = 240;
    canvas.height = 240;

    const runRenderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Bunsen burner flame if active
      if (burnerActive) {
        setTemperature((t) => Math.min(100, t + 0.1));
        drawFlame(ctx, canvas.width, canvas.height);
      } else {
        setTemperature((t) => Math.max(22, t - 0.05));
      }

      // 2. Draw glass Beaker structure
      drawGlassBeaker(ctx, canvas.width, canvas.height);

      // 3. Compute chemistry solution color blending
      const solutionColor = calculateChemColor();
      drawLiquid(ctx, canvas.width, canvas.height, solutionColor);

      // 4. Boil particle physics effects if temp is high
      if (temperature > 40) {
        updateBoilingBubbles(ctx, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(runRenderLoop);
    };

    runRenderLoop();
    return () => cancelAnimationFrame(animId);
  }, [beakerChemicals, burnerActive, temperature, activeIndicator]);

  const drawFlame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const time = Date.now() * 0.015;
    ctx.save();
    ctx.translate(width / 2, height - 20);

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const s = 10 + i * 5;
      const xoffset = Math.sin(time + i * 15) * 4;
      ctx.moveTo(-s + xoffset, 0);
      ctx.quadraticCurveTo(0, -50 - i * 15, s + xoffset, 0);
      ctx.closePath();
      ctx.fillStyle = i === 0 ? "rgba(239, 68, 68, 0.85)" : i === 1 ? "rgba(249, 115, 22, 0.9)" : "rgba(253, 224, 71, 0.95)";
      ctx.fill();
    }
    ctx.restore();
  };

  const drawGlassBeaker = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "rgba(200, 220, 255, 0.8)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    // draw flask beaker cup lines
    ctx.beginPath();
    ctx.moveTo(50, 40);
    ctx.lineTo(50, height - 30);
    ctx.lineTo(width - 50, height - 30);
    ctx.lineTo(width - 50, 40);
    ctx.stroke();

    // Measurement grids hashes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.2;
    for (let h = (height - 60); h >= 60; h -= 28) {
      ctx.beginPath();
      ctx.moveTo(50, h);
      ctx.lineTo(68, h);
      ctx.stroke();
    }
  };

  const calculateChemColor = (): string => {
    if (beakerChemicals.length === 0) return "rgba(255, 255, 255, 0)";

    // Calculate fluid pH
    let totalVol = 0;
    let phWeightedSum = 0;
    
    // Check if metal pigments exist
    let hasCopper = false;
    let hasCobalt = false;

    beakerChemicals.forEach((item) => {
      totalVol += item.volume;
      phWeightedSum += item.chem.ph * item.volume;
      if (item.chem.id === "copper") hasCopper = true;
      if (item.chem.id === "cobalt") hasCobalt = true;
    });

    const averagePH = phWeightedSum / (totalVol || 1);

    // Apply litmus or phenolphthalein overrides
    if (activeIndicator === "litmus") {
      // Litmus: Red in acid (pH < 6), Blue in alkali (pH > 8), Purple in neutral
      if (averagePH < 6) return "rgba(239, 68, 68, 0.55)"; // Light red
      if (averagePH > 8) return "rgba(37, 99, 235, 0.55)"; // Light blue
      return "rgba(139, 92, 246, 0.55)"; // Purple tint
    } else if (activeIndicator === "phenolphthalein") {
      // Colorless below pH 8.2, turns deep magenta-pink in alkali
      if (averagePH > 8.3) return "rgba(236, 72, 153, 0.65)"; // Magenta pink
      return "rgba(240, 249, 255, 0.15)"; // near transparent
    }

    // Default physical substance color blending
    if (hasCopper && hasCobalt) {
      return "rgba(147, 51, 234, 0.6)"; // purple mix
    }
    if (hasCopper) {
      return "rgba(59, 130, 246, 0.72)"; // Copper sulfate rich blue
    }
    if (hasCobalt) {
      // Cobalt turns blue if boiling hot, pink if room temp!
      if (temperature > 70) {
        return "rgba(30, 64, 175, 0.68)"; // Cobalt complex blue hot
      }
      return "rgba(244, 63, 94, 0.62)"; // cobalt complex pink cool
    }

    // Strong base (NaOH) + strong acid (HCl) creates clear salty solution
    if (averagePH < 4) return "rgba(224, 242, 254, 0.22)"; // slight acid tint
    if (averagePH > 10) return "rgba(248, 250, 252, 0.22)"; // slight basic tint

    return "rgba(186, 230, 253, 0.35)"; // clean water default
  };

  const drawLiquid = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    // Height determined by total sum of chemical volume in beaker
    let totalVol = 0;
    beakerChemicals.forEach((item) => { totalVol += item.volume; });

    const maxVol = 600;
    const fillPercent = Math.min(0.92, totalVol / maxVol);
    const waveHeight = (height - 30) - fillPercent * (height - 80);

    ctx.save();
    ctx.beginPath();
    // Round beaker bottom cup clipper boundary
    ctx.rect(52, 42, width - 104, height - 74);
    ctx.clip();

    // Wave swell animations
    const offset = Date.now() * 0.003;
    ctx.beginPath();
    ctx.moveTo(52, height - 30);
    ctx.lineTo(52, waveHeight);
    
    // Draw dynamic liquid waves
    for (let x = 52; x <= width - 52; x += 10) {
      const y = waveHeight + Math.sin(x * 0.02 + offset) * 3;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width - 50, height - 28);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  const updateBoilingBubbles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const bubbleDensity = Math.floor((temperature - 40) / 7);
    
    // Init particles if empty
    if (bubbleParticlesRef.current.length < bubbleDensity) {
      bubbleParticlesRef.current.push({
        x: 60 + Math.random() * (width - 120),
        y: height - 42,
        r: 1 + Math.random() * 4,
        speed: 1 + Math.random() * 3,
      });
    }

    // draw and drift particles upward
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;

    bubbleParticlesRef.current.forEach((bub, i) => {
      bub.y -= bub.speed;
      // Zigzag sway
      bub.x += Math.sin(Date.now() * 0.01 + i) * 0.5;

      ctx.beginPath();
      ctx.arc(bub.x, bub.y, bub.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Reset bottom if reached surface
      let totalVol = 0;
      beakerChemicals.forEach((item) => { totalVol += item.volume; });
      const fillPercent = Math.min(0.92, totalVol / 600);
      const surfaceY = (height - 30) - fillPercent * (height - 80);

      if (bub.y < surfaceY) {
        bub.y = height - 42;
        bub.x = 60 + Math.random() * (width - 120);
      }
    });

    // Trim size matches threshold
    if (bubbleParticlesRef.current.length > bubbleDensity) {
      bubbleParticlesRef.current = bubbleParticlesRef.current.slice(0, bubbleDensity);
    }
  };

  const addChemicalToBeaker = (chem: Chemical) => {
    setBeakerChemicals((prev) => {
      // Accumulate volume if already exists, else append
      const existing = prev.find((item) => item.chem.id === chem.id);
      if (existing) {
        return prev.map((item) => item.chem.id === chem.id ? { ...item, volume: Math.min(400, item.volume + 75) } : item);
      }
      return [...prev, { chem, volume: 100 }];
    });
  };

  const getSolutionStats = () => {
    let totalVol = 0;
    let phWeightedSum = 0;
    beakerChemicals.forEach((item) => {
      totalVol += item.volume;
      phWeightedSum += item.chem.ph * item.volume;
    });
    const pH = Number((phWeightedSum / (totalVol || 1)).toFixed(1));
    return { volume: totalVol, pH };
  };

  const clearBeaker = () => {
    setBeakerChemicals([{ chem: chemicalStock[0], volume: 150 }]);
    setActiveIndicator("none");
    setBurnerActive(false);
    setTemperature(22);
    bubbleParticlesRef.current = [];
  };

  // =========================================================================
  // 2. CIRCUITS PHYSICS BUILDER ENGINE
  // =========================================================================
  const [circuitElements, setCircuitElements] = useState<CircuitElement[]>([
    { id: "bat-1", type: "battery", x: 1, y: 3, value: 9 }, // grid cell x, y
    { id: "lamp-1", type: "lamp", x: 3, y: 1, value: 10 },
    { id: "sw-1", type: "switch", x: 5, y: 3, value: 0, isActive: false },
    { id: "wire-1", type: "wire", x: 3, y: 5, value: 0 },
  ]);
  const [resistance, setResistance] = useState<number>(30); // Ohm's slider adjustment
  const [batteryVoltage, setBatteryVoltage] = useState<number>(12); // Volts adjustment
  const [wireParticleOffset, setWireParticleOffset] = useState<number>(0);

  // Compute loop closed states
  const checkCircuitCompleted = (): boolean => {
    // If switch in active elements list is disabled, loop is open
    const toggleSwitch = circuitElements.find(el => el.type === "switch");
    if (toggleSwitch && !toggleSwitch.isActive) return false;
    return true; // Simple sandbox toggle completeness
  };

  const isClosed = checkCircuitCompleted();
  // Speed of electrons based on voltage / resistance (Ohm's Law!)
  const currentFlowRate = isClosed ? (batteryVoltage / resistance) : 0;

  // Electron moving wire loops inside physics grids
  useEffect(() => {
    if (isClosed) {
      const runner = setInterval(() => {
        setWireParticleOffset((prev) => (prev + currentFlowRate * 12) % 100);
      }, 30);
      return () => clearInterval(runner);
    }
  }, [isClosed, currentFlowRate]);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm text-slate-800">
      
      {/* Subject Lab Selector Tabs */}
      <div className="flex bg-slate-50 border-b border-slate-150 py-2 px-4 space-x-2 select-none">
        <button
          onClick={() => setActiveLab("chem")}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs transition cursor-pointer ${activeLab === "chem" ? "bg-white border border-slate-200 text-blue-600 font-extrabold shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
        >
          <Beaker className="w-4 h-4 text-blue-600" />
          <span>🧪 Chemistry Lab Beaker</span>
        </button>

        <button
          onClick={() => setActiveLab("physics")}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs transition cursor-pointer ${activeLab === "physics" ? "bg-white border border-slate-200 text-blue-600 font-extrabold shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>⚡ Circuit Physics Builder</span>
        </button>
      </div>

      {/* Primary Simulator Panel */}
      <div className="flex-grow p-4 bg-slate-900/60 overflow-y-auto">
        
        {/* =========================================================================
            A. CHEMISTRY FLASK SIMULATOR PANEL
            ========================================================================= */}
        {activeLab === "chem" && (
          <div className="flex flex-col lg:flex-row gap-5 items-stretch h-full">
            
            {/* Left Box Beaker Flask Renderer */}
            <div className="flex-1 bg-slate-950 p-4 border border-slate-800 rounded-2xl flex flex-col items-center justify-between min-h-[300px] relative">
              
              {/* Flask HUD display readings */}
              <div className="flex justify-between w-full border-b border-slate-850 pb-2 text-[11px] font-mono font-bold text-slate-400">
                <div className="flex flex-col text-left">
                  <span>Fluid Level: <span className="text-amber-400">{getSolutionStats().volume}ml</span></span>
                  <span>Temperature: <span className="text-rose-450">{temperature.toFixed(1)}°C</span></span>
                </div>
                <div className="flex flex-col text-right">
                  <span>Mix Scale: <span className={`font-black ${getSolutionStats().pH < 5 ? "text-rose-500" : getSolutionStats().pH > 8.5 ? "text-blue-500" : "text-emerald-500"}`}>{getSolutionStats().pH} pH</span></span>
                  <span className="text-[9px] uppercase tracking-wider">{getSolutionStats().pH === 7 ? "✓ NEUTRAL" : getSolutionStats().pH < 7 ? "⚠️ ACIDIC" : "☣️ ALKALINE"}</span>
                </div>
              </div>

              {/* Dynamic boiled Beaker Flask Canvas */}
              <div className="my-3 py-1 relative">
                <canvas ref={beakerCanvasRef} />
              </div>

              {/* Lab accessories sliders controls */}
              <div className="w-full flex items-center justify-between border-t border-slate-850 pt-2 pointer-events-auto">
                <button
                  onClick={() => setBurnerActive(!burnerActive)}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-black shadow transition ${burnerActive ? "bg-rose-600 text-white animate-bounce" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
                >
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>{burnerActive ? "Boiling..." : "Flame Burner"}</span>
                </button>

                <button
                  onClick={clearBeaker}
                  className="flex items-center space-x-1.5 px-4_5 py-2 bg-slate-800 border border-slate-705 text-slate-400 font-bold text-xs rounded-full hover:text-rose-400"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Lab</span>
                </button>
              </div>

            </div>

            {/* Right Side Chemical compound shelf */}
            <div className="w-full lg:w-56 flex flex-col justify-between">
              
              {/* Elements compound box selector */}
              <div>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase block mb-1.5">Add Solutions</span>
                <div className="space-y-1.5">
                  {chemicalStock.map((chem) => (
                    <button
                      key={chem.id}
                      onClick={() => addChemicalToBeaker(chem)}
                      className="w-full flex items-center justify-between p-2 bg-slate-950/60 rounded-xl border border-slate-800 hover:scale-102 hover:border-amber-500 transition text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-205">{chem.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">{chem.formula} (pH: {chem.ph})</span>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Chemical indicators */}
              <div className="mt-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase block mb-1.5">pH Indicators</span>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setActiveIndicator(activeIndicator === "litmus" ? "none" : "litmus")}
                    className={`p-1.5 text-center text-[10px] font-black rounded-lg border leading-none ${activeIndicator === "litmus" ? "bg-purple-605/20 border-purple-500 text-purple-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    🎨 Litmus solution
                  </button>

                  <button
                    onClick={() => setActiveIndicator(activeIndicator === "phenolphthalein" ? "none" : "phenolphthalein")}
                    className={`p-1.5 text-center text-[10px] font-black rounded-lg border leading-none ${activeIndicator === "phenolphthalein" ? "bg-pink-605/20 border-pink-500 text-pink-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    🧪 Phenolphthalein
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            B. PHYSICS CLOSED LOOP CIRCUIT BUILDER PANEL
            ========================================================================= */}
        {activeLab === "physics" && (
          <div className="flex flex-col lg:flex-row gap-5 items-stretch h-full">
            
            {/* Closed loop visualizer box */}
            <div className="flex-1 bg-slate-950 p-4 border border-slate-800 rounded-2xl flex flex-col justify-between min-h-[300px] relative overflow-hidden select-none">
              
              <div className="flex justify-between items-center border-b border-slate-850 pb-2 text-[11px] font-mono font-bold text-slate-450">
                <span className="flex items-center space-x-1.5 text-slate-400">
                  <Grid className="w-3.5 h-3.5" />
                  <span>Circuit Sandbox Grid</span>
                </span>
                
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider ${isClosed ? "bg-amber-600/20 text-yellow-400" : "bg-slate-905 text-slate-500"}`}>
                  {isClosed ? "✓ Completed closed loop" : "⚠️ OPEN CIRCUIT"}
                </span>
              </div>

              {/* Render dynamic virtual circuit elements and electron dots */}
              <div className="grow my-8 relative flex flex-col justify-center items-center pointer-events-auto">
                
                {/* SVG Circuit Drawing overlays */}
                <div className="w-64 h-48 border-2 border-slate-850 bg-slate-950/80 rounded-2xl relative p-4 grid grid-cols-3 gap-y-12 shadow">
                  
                  {/* Outer wire bounds displaying electron paths */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none flex">
                    {/* Rectangle track wire */}
                    <rect x="40" y="30" width="176" height="126" rx="14" fill="none" className="stroke-slate-800" strokeWidth="6" />
                    
                    {/* Glowing yellow electron particles moving along track */}
                    {isClosed && (
                      <>
                        <circle cx={`${40 + (176 * (wireParticleOffset / 100))}`} cy="30" r="4.5" className="fill-yellow-400 shadow shadow-yellow-500 animate-pulse" />
                        <circle cx="216" cy={`${30 + (126 * (wireParticleOffset / 100))}`} r="4.5" className="fill-yellow-400 shadow shadow-yellow-500 animate-pulse" />
                        <circle cx={`${216 - (176 * (wireParticleOffset / 100))}`} cy="156" r="4.5" className="fill-yellow-400 shadow shadow-yellow-500 animate-pulse" />
                        <circle cx="40" cy={`${156 - (126 * (wireParticleOffset / 100))}`} r="4.5" className="fill-yellow-400 shadow shadow-yellow-500 animate-pulse" />
                      </>
                    )}
                  </svg>

                  {/* Cell 1: Lamp bulb */}
                  <div className="flex flex-col items-center justify-center relative col-start-2">
                    <div className={`p-3 rounded-full border-2 transition ${isClosed ? "bg-yellow-500/20 border-yellow-400 scale-102 shadow-lg shadow-yellow-500/20" : "bg-slate-900 border-slate-750"}`}>
                      <Lightbulb className={`w-8 h-8 transition-transform ${isClosed ? "text-yellow-450 fill-yellow-400 rotate-12 scale-110" : "text-slate-500"}`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 mt-1 font-mono">{isClosed ? `${((batteryVoltage * batteryVoltage) / resistance).toFixed(1)}W Power` : "Lamp Bulb"}</span>
                  </div>

                  {/* Cell 2: Battery adjustable */}
                  <div className="flex flex-col items-center justify-center relative col-start-1 row-start-2">
                    <div className="p-2.5 rounded-xl border border-rose-500 bg-rose-955/30 hover:scale-105 transition">
                      <span className="text-xs font-black text-rose-500 tracking-wider">BATTERY</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-extrabold mt-1">{batteryVoltage}V Source</span>
                  </div>

                  {/* Cell 3: Toggle Switch */}
                  <div className="flex flex-col items-center justify-center relative col-start-3 row-start-2">
                    <button
                      onClick={() => {
                        setCircuitElements(circuitElements.map(el => el.type === "switch" ? { ...el, isActive: !el.isActive } : el));
                      }}
                      className={`p-2.5 rounded-xl border font-bold text-[10px] uppercase transition cursor-pointer ${isClosed ? "bg-emerald-600 border-emerald-400 text-white" : "bg-slate-900 border-rose-600 text-rose-400"}`}
                    >
                      {isClosed ? "Switch: ON" : "Switch: OFF"}
                    </button>
                    <span className="text-[9px] text-slate-500 mt-1">Interrupter Switch</span>
                  </div>

                </div>

              </div>

              {/* physics settings adjustment inputs */}
              <div className="w-full grid grid-cols-2 gap-3 border-t border-slate-850 pt-3">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase font-mono mb-1">Set Battery Voltage</span>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={batteryVoltage}
                    onChange={(e) => setBatteryVoltage(Number(e.target.value))}
                    className="h-1.5 bg-slate-800 accent-rose-600 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-slate-300 font-mono mt-1">{batteryVoltage} Volts</span>
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase font-mono mb-1">Bulb Resistance (R)</span>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={resistance}
                    onChange={(e) => setResistance(Number(e.target.value))}
                    className="h-1.5 bg-slate-800 accent-yellow-500 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-slate-300 font-mono mt-1">{resistance} Ohms (Ω)</span>
                </div>
              </div>

            </div>

            {/* Quick circuit definitions sidebar */}
            <div className="w-full lg:w-48 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-405 font-mono tracking-wider font-extrabold uppercase block mb-2 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ohm's Law Lab</span>
                </span>
                
                <p style={{ fontSize: "10px" }} className="text-slate-400 leading-relaxed font-normal">
                  Adjust inputs to show the fundamental ratio of electricity: 
                  <strong className="text-yellow-400 block font-mono mt-1 font-bold text-[11px]">I (Current) = V / R</strong>
                </p>
              </div>

              <div className="bg-slate-950 p-2 border border-slate-850 rounded-lg text-left" style={{ fontSize: "10px" }}>
                <span className="text-yellow-405 font-bold uppercase block text-[9px] mb-1 font-mono tracking-wide">Real-time stats</span>
                
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between border-b border-slate-850/60 pb-0.5">
                    <span>Volt (V):</span>
                    <span className="text-rose-450 font-bold">{batteryVoltage}V</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850/60 pb-0.5">
                    <span>Resist (R):</span>
                    <span className="text-emerald-450 font-bold">{resistance}Ω</span>
                  </div>
                  <div className="flex justify-between font-bold text-yellow-403">
                    <span>Current (I):</span>
                    <span>{currentFlowRate.toFixed(2)}A</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
