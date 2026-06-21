import React, { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, UserCheck, Plus, Minus, Trophy, Mic, ShieldAlert, BookOpen, VolumeX, Eye, Clock, ListPlus, Lightbulb, Zap } from "lucide-react";
import { Student } from "../types";

export default function ClassroomWidgets() {
  const [activeWidget, setActiveWidget] = useState<string>("timer");

  // 1. Countdown Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 min default
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [animateTimerEnd, setAnimateTimerEnd] = useState<boolean>(false);

  // 2. Stopwatch State
  const [stopwatchMs, setStopwatchMs] = useState<number>(0);
  const [stopwatchActive, setStopwatchActive] = useState<boolean>(false);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);
  const [stopwatchLaps, setStopwatchLaps] = useState<number[]>([]);

  // 3. Random Student Picker State
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Alex Johnson", present: true },
    { id: "2", name: "Emma Watson", present: true },
    { id: "3", name: "Daniel Craig", present: true },
    { id: "4", name: "Sophia Loren", present: true },
    { id: "5", name: "Liam Neeson", present: true },
    { id: "6", name: "Lucas Vance", present: true },
    { id: "7", name: "Olivia Wilde", present: true },
    { id: "8", name: "Nathan Drake", present: true },
  ]);
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [pickedStudent, setPickedStudent] = useState<string | null>(null);
  const [pickingActive, setPickingActive] = useState<boolean>(false);

  // 4. Scoreboard State
  const [scores, setScores] = useState<{ name: string; score: number; color: string }[]>([
    { name: "Team Red", score: 0, color: "bg-red-500 hover:bg-red-650" },
    { name: "Team Blue", score: 0, color: "bg-blue-500 hover:bg-blue-650" },
    { name: "Team Yellow", score: 0, color: "bg-yellow-500 hover:bg-yellow-550 text-slate-900" },
    { name: "Team Green", score: 0, color: "bg-emerald-500 hover:bg-emerald-650" },
  ]);

  // 5. Analyser Noise Level Meter
  const [noiseLevel, setNoiseLevel] = useState<number>(10);
  const [noiseThreshold, setNoiseThreshold] = useState<number>(65);
  const [noiseMeasuring, setNoiseMeasuring] = useState<boolean>(false);
  const [micDenied, setMicDenied] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animeFrameIdRef = useRef<number | null>(null);

  // 6. Interactive / Teaching Clock State
  const [isTeachingClock, setIsTeachingClock] = useState<boolean>(false);
  const [teachingHour, setTeachingHour] = useState<number>(3);
  const [teachingMin, setTeachingMin] = useState<number>(0);
  const [realTime, setRealTime] = useState<Date>(new Date());

  // 7. Interactive Bohr Element Bohr Projections
  const elements = [
    { num: 1, sym: "H", name: "Hydrogen", mass: "1.008", shell: [1], desc: "Highly flammable gas, most abundant chemical substance in the Universe.", color: "bg-blue-900/40 text-blue-300 border-blue-500" },
    { num: 2, sym: "He", name: "Helium", mass: "4.002", shell: [2], desc: "Colorless, odorless noble gas, used in balloons and cryogenics.", color: "bg-amber-900/40 text-amber-300 border-amber-500" },
    { num: 3, sym: "Li", name: "Lithium", mass: "6.94", shell: [2, 1], desc: "Soft and silvery alkali metal, essential for modern rechargable batteries.", color: "bg-rose-900/40 text-rose-300 border-rose-500" },
    { num: 4, sym: "Be", name: "Beryllium", mass: "9.012", shell: [2, 2], desc: "Strong, lightweight alkaline earth metal used in spacecraft components.", color: "bg-emerald-900/40 text-emerald-300 border-emerald-500" },
    { num: 5, sym: "B", name: "Boron", mass: "10.81", shell: [2, 3], desc: "Low-abundance metalloid, vital in glassmaking and semiconductor doping.", color: "bg-purple-900/40 text-purple-300 border-purple-500" },
    { num: 6, sym: "C", name: "Carbon", mass: "12.011", shell: [2, 4], desc: "Tetravalent non-metal, foundational base element of all organic life.", color: "bg-purple-900/40 text-purple-300 border-purple-500" },
    { num: 7, sym: "N", name: "Nitrogen", mass: "14.007", shell: [2, 5], desc: "Gas forming about 78% of Earth's atmosphere, key component in plant biology.", color: "bg-indigo-900/40 text-indigo-300 border-indigo-500" },
    { num: 8, sym: "O", name: "Oxygen", mass: "15.999", shell: [2, 6], desc: "Highly reactive nonmetal gas, required for respiration by animal organisms.", color: "bg-indigo-900/40 text-indigo-300 border-indigo-500" },
    { num: 9, sym: "F", name: "Fluorine", mass: "18.998", shell: [2, 7], desc: "Extremely toxic, pale yellow halogen gas. Prevalent in dental fluoride protection.", color: "bg-violet-900/40 text-violet-300 border-violet-500" },
    { num: 10, sym: "Ne", name: "Neon", mass: "20.180", shell: [2, 8], desc: "Silent noble gas, glows reddish-orange in high-voltage glow discharge signs.", color: "bg-pink-900/40 text-pink-300 border-pink-500" },
  ];
  const [selectedElement, setSelectedElement] = useState<any>(elements[5]); // default to Carbon

  // Clock timing updates
  useEffect(() => {
    const clkTimer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(clkTimer);
  }, []);

  // Timer Countdown loop
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setAnimateTimerEnd(true);
            setTimeout(() => setAnimateTimerEnd(false), 4500); // end splash duration
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive]);

  // Stopwatch ticking loop
  useEffect(() => {
    if (stopwatchActive) {
      stopwatchRef.current = setInterval(() => {
        setStopwatchMs((prev) => prev + 10);
      }, 10);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    }
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [stopwatchActive]);

  // Noise Meter Audio API integration
  useEffect(() => {
    if (noiseMeasuring) {
      startMicrophone();
    } else {
      stopMicrophone();
    }
    return () => stopMicrophone();
  }, [noiseMeasuring]);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      microphoneRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Sum peak volumes
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Map average volume amplitude scale (0-128) to decibels standard visual (0-100)
        const mappedVolume = Math.min(100, Math.round((average / 110) * 100));
        
        setNoiseLevel(Math.max(10, mappedVolume));
        animeFrameIdRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      setMicDenied(true);
      setNoiseMeasuring(false);
    }
  };

  const stopMicrophone = () => {
    if (animeFrameIdRef.current) {
      cancelAnimationFrame(animeFrameIdRef.current);
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Timer helpers
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const adjustTimer = (amountSecs: number) => {
    setTimerSeconds((prev) => Math.max(0, prev + amountSecs));
  };

  // Stopwatch helpers
  const formatStopwatch = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const deciseconds = Math.floor((timeMs % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${deciseconds.toString().padStart(2, "0")}`;
  };

  // Name Picker spinner simulation
  const triggerRandomPick = () => {
    if (pickingActive || students.length === 0) return;
    setPickingActive(true);
    setPickedStudent(null);
    let count = 0;
    const items = students.filter((s) => s.present);
    if (items.length === 0) return;

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * items.length);
      setPickedStudent(items[idx].name);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setPickingActive(false);
      }
    }, 120);
  };

  const addNewStudent = () => {
    if (!newStudentName.trim()) return;
    setStudents([
      ...students,
      { id: Date.now().toString(), name: newStudentName.trim(), present: true },
    ]);
    setNewStudentName("");
  };

  // Component Bohr visual drawing
  const renderBohrModelStr = (shellData: number[]) => {
    // shellData contains array of electrons per shell (e.g. [2, 4] for Carbon)
    return (
      <svg className="w-48 h-48 mx-auto" viewBox="0 0 200 200">
        {/* Nucleus center cluster */}
        <circle cx="100" cy="100" r="14" className="fill-orange-500/90 stroke-amber-300" strokeWidth="2" />
        <text x="100" y="104" className="fill-slate-950 font-extrabold text-[10px] text-center" textAnchor="middle">
          {selectedElement.sym}
        </text>

        {shellData.map((electrons, shellIdx) => {
          const radius = 32 + (shellIdx + 1) * 24;
          return (
            <g key={shellIdx}>
              {/* Shell line */}
              <circle cx="100" cy="100" r={radius} fill="none" className="stroke-slate-700/60 stroke-dashed" strokeWidth="1" />
              {/* Electrons spinning pattern */}
              {Array.from({ length: electrons }).map((_, eleIdx) => {
                const angle = (eleIdx * 2 * Math.PI) / electrons;
                const ex = 100 + radius * Math.cos(angle);
                const ey = 100 + radius * Math.sin(angle);
                return (
                  <circle key={eleIdx} cx={ex} cy={ey} r="4" className="fill-sky-400 stroke-cyan-200" strokeWidth="1" />
                );
              })}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      
      {/* Widget Tabs Header */}
      <div className="flex bg-slate-50 overflow-x-auto border-b border-slate-150 py-2 px-3 whitespace-nowrap scrollbar-none select-none">
        {[
          { id: "timer", label: "⏲️ Timer", activeColor: "border-blue-600 text-blue-600 font-black bg-white ring-1 ring-slate-100 shadow-xs" },
          { id: "stopwatch", label: "⏱️ Stopwatch", activeColor: "border-blue-600 text-blue-600 font-black bg-white ring-1 ring-slate-101 shadow-xs" },
          { id: "picker", label: "👤 Name Picker", activeColor: "border-blue-600 text-blue-600 font-black bg-white ring-1 ring-slate-101 shadow-xs" },
          { id: "scoreboard", label: "🏆 Team Scores", activeColor: "border-blue-600 text-blue-600 font-black bg-white ring-1 ring-slate-101 shadow-xs" },
          { id: "noise", label: "🤫 Noise Meter", activeColor: "border-blue-600 text-blue-600 font-black bg-white ring-1 ring-slate-101 shadow-xs" },
          { id: "clock", label: "🕒 Math Clock", activeColor: "border-blue-600 text-blue-600 font-black bg-white ring-1 ring-slate-101 shadow-xs" },
          { id: "periodic_table", label: "🧪 Chem Elements", activeColor: "border-blue-600 text-blue-600 font-black bg-white ring-1 ring-slate-101 shadow-xs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveWidget(tab.id)}
            className={`px-3.5 py-1.5 mx-1 font-bold text-xs rounded-xl border-b-2 transition cursor-pointer ${activeWidget === tab.id ? `${tab.activeColor}` : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Widget Interactive Areas */}
      <div className="flex-grow p-4 bg-white overflow-y-auto">

        {/* 1. Countdown Timer Widget */}
        {activeWidget === "timer" && (
          <div className="flex flex-col items-center h-full justify-center">
            {animateTimerEnd && (
              <div className="absolute inset-0 z-40 bg-red-650/95 flex flex-col items-center justify-center animate-pulse text-white p-6 rounded-2xl text-center">
                <ShieldAlert className="w-24 h-24 stroke-white fill-amber-500 animate-bounce mb-3" />
                <h2 className="text-4xl font-extrabold tracking-wider animate-ping">⏰ TIME IS UP! ⏰</h2>
                <p className="text-lg mt-3 text-red-100 font-mono font-bold">Class attention spotlight, pencils down!</p>
                <button 
                  onClick={() => setAnimateTimerEnd(false)} 
                  className="mt-6 px-10 py-3 bg-white text-red-700 font-black text-sm rounded-full shadow-lg hover:scale-105 active:scale-95"
                >
                  Dismiss Ring
                </button>
              </div>
            )}

            <div className="text-5xl font-mono font-extrabold text-slate-100 tracking-wider p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
              {formatTimer(timerSeconds)}
            </div>

            {/* Incremental presets */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3.5">
              {[
                { label: "+1m", val: 60 },
                { label: "+3m", val: 180 },
                { label: "+5m", val: 300 },
                { label: "+10m", val: 600 },
                { label: "-1m", val: -60 },
                { label: "-3m", val: -180 },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => adjustTimer(btn.val)}
                  className="px-2.5 py-1 text-slate-300 bg-slate-800 rounded-lg text-xs font-bold border border-slate-705 hover:bg-slate-700 active:scale-95"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Trigger control row */}
            <div className="flex items-center space-x-3.5 mt-5">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className={`flex items-center space-x-1.5 px-6 py-2.5 rounded-full text-xs font-black shadow transition ${timerActive ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
              >
                {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{timerActive ? "Pause" : "Start"}</span>
              </button>
              
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimerSeconds(300); // Reset default to 5 min
                }}
                className="flex items-center space-x-1.5 px-4_5 py-2.5 bg-slate-800 border border-slate-705 text-slate-300 rounded-full text-xs font-bold hover:bg-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Stopwatch Unit */}
        {activeWidget === "stopwatch" && (
          <div className="flex flex-col items-center h-full justify-center">
            <div className="text-4xl font-mono font-bold text-indigo-300 tracking-wider px-5 py-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              {formatStopwatch(stopwatchMs)}
            </div>

            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={() => setStopwatchActive(!stopwatchActive)}
                className={`p-2.5 rounded-full text-white ${stopwatchActive ? "bg-amber-600" : "bg-indigo-600"}`}
              >
                {stopwatchActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  if (stopwatchActive) {
                    setStopwatchLaps([...stopwatchLaps, stopwatchMs]);
                  }
                }}
                disabled={!stopwatchActive}
                className="px-3.5 py-1.5 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 select-none disabled:opacity-40"
              >
                Lap Split
              </button>
              <button
                onClick={() => {
                  setStopwatchActive(false);
                  setStopwatchMs(0);
                  setStopwatchLaps([]);
                }}
                className="p-2.5 bg-slate-850 rounded-full text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Split records list */}
            {stopwatchLaps.length > 0 && (
              <div className="w-full max-h-24 overflow-y-auto mt-3 bg-slate-950/40 p-2 rounded-xl text-xs font-mono text-slate-400">
                {stopwatchLaps.map((lap, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-850 py-1 px-2.5">
                    <span>Split #{i + 1}</span>
                    <span className="text-indigo-300 font-bold">{formatStopwatch(lap)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Random Student Picker Screen */}
        {activeWidget === "picker" && (
          <div className="flex flex-col h-full lg:flex-row gap-4 items-center">
            {/* Spinning output side */}
            <div className="flex-1 flex flex-col items-center p-3 text-center">
              <div className="h-28 w-full border border-slate-800 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner">
                {pickingActive ? (
                  <div className="text-xl font-bold text-yellow-405 animate-pulse uppercase tracking-widest flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 stroke-yellow-404 fill-yellow-403 animate-bounce" />
                    <span>Spinning...</span>
                  </div>
                ) : pickedStudent ? (
                  <div className="animate-bounce">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-extrabold block">🎉 Lucky Drawn Student 🎉</span>
                    <span className="text-2xl font-black text-rose-500 tracking-tight block">{pickedStudent}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 font-semibold text-xs">Ready. Click 'Spin Select'!</span>
                )}
              </div>

              <button
                onClick={triggerRandomPick}
                disabled={pickingActive || students.length === 0}
                className="mt-3.5 flex items-center space-x-1.5 px-6 py-2.5 bg-teal-650 text-white rounded-full text-xs font-black transition hover:bg-teal-700 disabled:opacity-45"
              >
                <UserCheck className="w-4 h-4" />
                <span>Spin Select</span>
              </button>
            </div>

            {/* List and setup side */}
            <div className="w-full lg:w-48 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase block mb-1">Class Roll Call ({students.length})</span>
              
              <div className="max-h-24 overflow-y-auto mb-2 space-y-1">
                {students.map((student) => (
                  <div key={student.id} className="flex justify-between items-center text-xs text-slate-300 py-0.5 px-1.5 bg-slate-900 rounded">
                    <span className="truncate flex-1 font-semibold pr-1">{student.name}</span>
                    <input
                      type="checkbox"
                      checked={student.present}
                      onChange={(e) => {
                        setStudents(students.map((s) => s.id === student.id ? { ...s, present: e.target.checked } : s));
                      }}
                      className="accent-teal-500 w-3 h-3"
                      title={student.present ? "Present in class" : "Absent"}
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-1">
                <input
                  type="text"
                  placeholder="New student..."
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="bg-slate-900 text-xs px-2 py-1.5 rounded text-white flex-1 min-w-0 border border-slate-805"
                />
                <button onClick={addNewStudent} className="p-1.5 bg-slate-800 rounded text-teal-400 hover:bg-slate-700">
                  <ListPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Scoreboard Tracker Area */}
        {activeWidget === "scoreboard" && (
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wide mb-3 flex items-center space-x-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Team Classroom Points</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5 w-full">
              {scores.map((team, idx) => (
                <div key={idx} className="flex flex-col items-center p-2.5 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden">
                  <span className="text-[10px] font-bold tracking-tight text-slate-300 mb-1">{team.name}</span>
                  
                  <span className="text-3xl font-mono font-black text-slate-100">{team.score}</span>

                  <div className="flex items-center space-x-1.5 mt-2.5 w-full">
                    <button
                      onClick={() => {
                        setScores(scores.map((s, i) => i === idx ? { ...s, score: Math.max(0, s.score - 1) } : s));
                      }}
                      className="p-1 px-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-md text-xs font-bold"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => {
                        setScores(scores.map((s, i) => i === idx ? { ...s, score: s.score + 1 } : s));
                      }}
                      className={`p-1 px-2.5 flex-1 text-center rounded-md text-xs font-black text-white ${team.color}`}
                    >
                      +1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Classroom Noise-o-Meter Gauge */}
        {activeWidget === "noise" && (
          <div className="flex flex-col items-center text-center justify-center">
            <div className="relative w-full max-w-[280px] bg-slate-950/80 p-4 border border-slate-800 rounded-2xl flex flex-col items-center">
              {/* LED Scale bar meter */}
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex items-center px-1 mb-3">
                <div 
                  style={{ width: `${noiseLevel}%` }}
                  className={`h-2 rounded-full transition-all duration-75 ${noiseLevel > noiseThreshold ? "bg-rose-500 animate-pulse animate-bounce" : noiseLevel > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                />
              </div>

              {/* Status display */}
              <div className="flex flex-col items-center mb-2.5">
                {noiseLevel > noiseThreshold ? (
                  <span className="text-xs font-black text-rose-500 tracking-wide animate-pulse uppercase flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
                    <span>🤫 Class is too loud!</span>
                  </span>
                ) : noiseLevel > 45 ? (
                  <span className="text-xs font-bold text-amber-500">🗣️ Study noise discussion</span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-500">✓ Silent quiet zone</span>
                )}
                
                <span className="text-xs text-slate-400 mt-1 font-mono">Current: <span className="font-bold text-slate-200">{noiseLevel}%</span> Vol limit: <span className="font-bold text-slate-200">{noiseThreshold}%</span></span>
              </div>

              {/* Slider for volume threshold */}
              <div className="w-full flex items-center justify-between gap-2.5 mt-2">
                <VolumeX className="w-4.5 h-4.5 text-slate-500" />
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={noiseThreshold}
                  onChange={(e) => setNoiseThreshold(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg accent-rose-600 cursor-pointer"
                  title="Drag to set noise barrier"
                />
                <span className="text-[10px] font-bold text-slate-400 font-mono">{noiseThreshold}%</span>
              </div>

              {/* MIC Switch Button */}
              <button
                onClick={() => setNoiseMeasuring(!noiseMeasuring)}
                className={`mt-4 pointer-events-auto flex items-center space-x-1.5 px-4_5 py-2 rounded-full text-xs font-black transition ${noiseMeasuring ? "bg-rose-605 text-white animate-pulse" : "bg-emerald-650 text-white"}`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{noiseMeasuring ? "Off Microphone" : "On Microphone"}</span>
              </button>

              {micDenied && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center rounded-2xl">
                  <ShieldAlert className="w-8 h-8 text-amber-500 mb-1" />
                  <span className="text-xs font-bold text-slate-300">Microphone Required</span>
                  <p style={{ fontSize: "10px" }} className="text-slate-500 px-2 mt-1">Please allow microphone capture permission in your browser frame to map noise decibels.</p>
                  <button onClick={() => { setMicDenied(false); setNoiseMeasuring(true); }} className="mt-2.5 px-3 py-1 bg-amber-600 font-bold rounded text-[10px] text-white">Retry Capture</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Dynamic Teaching Hands Math Clock */}
        {activeWidget === "clock" && (
          <div className="flex flex-col items-center justify-center">
            {/* Mode toggle */}
            <div className="flex space-x-1 bg-slate-950 p-1.5 rounded-lg mb-3">
              <button 
                onClick={() => setIsTeachingClock(false)} 
                className={`px-3 py-1 text-[10px] font-bold rounded ${!isTeachingClock ? "bg-slate-800 text-pink-400" : "text-slate-400"}`}
              >
                🕒 Real-Time Clock
              </button>
              <button 
                onClick={() => setIsTeachingClock(true)} 
                className={`px-3 py-1 text-[10px] font-bold rounded ${isTeachingClock ? "bg-slate-800 text-pink-400" : "text-slate-400"}`}
              >
                ✏️ Teaching Hands Tool
              </button>
            </div>

            {/* Clock Face SVG Graphic Drawing */}
            <div className="relative w-36 h-36 border-4 border-slate-750 bg-slate-950/90 rounded-full flex items-center justify-center select-none shadow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Dial circle */}
                <circle cx="50" cy="50" r="46" fill="none" className="stroke-slate-800" strokeWidth="2" />
                
                {/* 12 dial text offsets */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const deg = (i + 1) * 30;
                  const rad = (deg * Math.PI) / 180;
                  const tx = 50 + 36 * Math.sin(rad);
                  const ty = 50 - 36 * Math.cos(rad);
                  return (
                    <text key={i} x={tx} y={ty + 3} className="fill-slate-400 text-[8px] font-extrabold font-sans" textAnchor="middle">
                      {i + 1}
                    </text>
                  );
                })}

                {/* Hour hand */}
                <line 
                  x1="50" y1="50" 
                  x2={50 + 20 * Math.sin(((isTeachingClock ? (teachingHour + teachingMin / 60) : (realTime.getHours() + realTime.getMinutes() / 60)) * 30 * Math.PI) / 180)} 
                  y2={50 - 20 * Math.cos(((isTeachingClock ? (teachingHour + teachingMin / 60) : (realTime.getHours() + realTime.getMinutes() / 60)) * 30 * Math.PI) / 180)} 
                  className="stroke-pink-500" strokeWidth="3" strokeLinecap="round" 
                />

                {/* Minute hand */}
                <line 
                  x1="50" y1="50" 
                  x2={50 + 28 * Math.sin(((isTeachingClock ? teachingMin : realTime.getMinutes()) * 6 * Math.PI) / 180)} 
                  y2={50 - 28 * Math.cos(((isTeachingClock ? teachingMin : realTime.getMinutes()) * 6 * Math.PI) / 180)} 
                  className="stroke-amber-400" strokeWidth="2.2" strokeLinecap="round" 
                />

                {/* Center cap core */}
                <circle cx="50" cy="50" r="3" className="fill-white" />
              </svg>
            </div>

            {/* Readout panel below */}
            <div className="mt-3.5 text-center">
              {isTeachingClock ? (
                <div className="flex flex-col items-center">
                  {/* Digital read editable */}
                  <span className="text-xl font-mono font-bold text-pink-300">
                    {teachingHour.toString().padStart(2, "0")}:{teachingMin.toString().padStart(2, "0")}
                  </span>
                  {/* Sliders to set hands */}
                  <div className="flex items-center space-x-2 mt-2 w-48">
                    <span className="text-[9px] text-slate-400 font-bold">Hr:</span>
                    <input 
                      type="range" min="1" max="12" step="1" value={teachingHour}
                      onChange={(e) => setTeachingHour(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 accent-pink-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-1 w-48">
                    <span className="text-[9px] text-slate-400 font-bold">Min:</span>
                    <input 
                      type="range" min="0" max="55" step="5" value={teachingMin}
                      onChange={(e) => setTeachingMin(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xl font-mono font-extrabold text-slate-300">
                  {realTime.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 7. Chemistry Table element details */}
        {activeWidget === "periodic_table" && (
          <div className="flex flex-col lg:flex-row gap-3 h-full overflow-hidden">
            {/* Bohr drawing shell visual */}
            <div className="flex-1 bg-slate-950/80 p-2 border border-slate-800 rounded-xl flex flex-col justify-between text-center min-h-[140px]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider">Atom Shell Projection</span>
                <span className="text-sm font-black text-rose-500">{selectedElement.name} ({selectedElement.num}e⁻)</span>
              </div>
              {renderBohrModelStr(selectedElement.shell)}
              <div className="text-[9px] font-semibold text-slate-400">
                Electrons per shell layer: <span className="font-mono text-purple-300 font-bold">{selectedElement.shell.join("-")}</span>
              </div>
            </div>

            {/* Periodic mini menu grid layout */}
            <div className="w-full lg:w-48 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 block uppercase font-mono mb-1">Click element</span>
                <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                  {elements.map((el) => (
                    <button
                      key={el.num}
                      onClick={() => setSelectedElement(el)}
                      className={`h-11 flex flex-col items-center justify-center p-1 rounded-lg border-2 text-xs font-bold transition hover:scale-105 ${selectedElement.num === el.num ? "border-amber-400 bg-slate-950 scale-102" : "border-slate-800 bg-slate-950/40 text-slate-300"}`}
                    >
                      <span className="text-[8px] opacity-65 font-semibold font-mono leading-none block">{el.num}</span>
                      <span className="text-sm font-black leading-none block py-0.5">{el.sym}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* element description text */}
              <div className="bg-slate-950/50 border border-slate-850 p-2 rounded-lg text-left" style={{ fontSize: "10.5px" }}>
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span className="text-rose-400 uppercase font-mono font-extrabold text-[9px]">Properties:</span>
                  <span className="text-slate-400 font-mono">MW: {selectedElement.mass}</span>
                </div>
                <p className="text-slate-300 font-normal leading-relaxed">{selectedElement.desc}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
