import React, { useState } from "react";
import { Monitor, FileSpreadsheet, Sparkles, Layout, Compass, PenTool, Database, Laptop, Info, Plus, Copy, Trash2, Eye, Cpu, BookOpen } from "lucide-react";
import { WhiteboardSlide, DrawingPath, AILesson } from "./types";
import WhiteboardCanvas from "./components/WhiteboardCanvas";
import ClassroomWidgets from "./components/ClassroomWidgets";
import ScienceLab from "./components/ScienceLab";
import MathMusicLab from "./components/MathMusicLab";
import AILessonPlanner from "./components/AILessonPlanner";

export default function App() {
  // Presentation slide state manager
  const [slides, setSlides] = useState<WhiteboardSlide[]>([
    {
      id: "slide-1",
      title: "🏫 Classroom Workspace Session",
      paths: [],
      backgroundTemplate: "white",
      backgroundColor: "#fafafa"
    }
  ]);
  const [activeSlideId, setActiveSlideId] = useState<string>("slide-1");

  // Sidebar Layout modes: Whiteboard board vs simulation hubs vs full screen widgets
  const [activeTab, setActiveTab] = useState<"whiteboard" | "science_lab" | "math_music" | "classroom_widgets">("whiteboard");

  // Setup references
  const activeSlide = slides.find((s) => s.id === activeSlideId) || slides[0];

  // Presentation slides manager actions
  const handleAddSlide = (template: "white" | "chalkboard" | "grid" = "white") => {
    const newSlide: WhiteboardSlide = {
      id: Math.random().toString(36).substring(2, 9),
      title: `Slide #${slides.length + 1} (${template})`,
      paths: [],
      backgroundTemplate: template,
      backgroundColor: template === "chalkboard" ? "#14532d" : "#fafafa",
    };
    setSlides([...slides, newSlide]);
    setActiveSlideId(newSlide.id);
  };

  const handleDuplicateSlide = (slide: WhiteboardSlide) => {
    const dup: WhiteboardSlide = {
      ...slide,
      id: Math.random().toString(36).substring(2, 9),
      title: `${slide.title} (Copy)`,
      paths: slide.paths.map(p => ({ ...p, id: Math.random().toString(36).substring(2, 9) })),
    };
    setSlides([...slides, dup]);
    setActiveSlideId(dup.id);
  };

  const handleDeleteSlide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) return; // Must have at least one active slide frame
    const remaining = slides.filter(s => s.id !== id);
    setSlides(remaining);
    if (activeSlideId === id) {
      setActiveSlideId(remaining[0].id);
    }
  };

  const handleUpdateSlide = (updated: WhiteboardSlide) => {
    setSlides(slides.map((s) => s.id === updated.id ? updated : s));
  };

  const handlePushLessonToSlides = (aiLesson: AILesson) => {
    const freshSlides: WhiteboardSlide[] = aiLesson.slides.map((slide, sIdx) => {
      // Create horizontal dividers and helper outlines on the whiteboard to display content visually
      const paths: DrawingPath[] = [];

      // Drawing a rounded border card outline
      paths.push({
        id: `card-outline-${sIdx}`,
        tool: "rect",
        color: "rgba(100, 116, 139, 0.4)",
        width: 3,
        points: [
          { x: 40, y: 40 },
          { x: 740, y: 460 }
        ]
      });

      return {
        id: Math.random().toString(36).substring(2, 9),
        title: `📖 Lesson: ${slide.slideTitle}`,
        paths: paths,
        backgroundTemplate: slide.visualStyleHint === "chalkboard" ? "chalkboard" : slide.visualStyleHint === "grid" ? "grid" : "white",
        backgroundColor: slide.visualStyleHint === "chalkboard" ? "#14532d" : "#fafafa",
      };
    });

    // Also push a 5th slide representing the interactive Quiz!
    const quizSlide: WhiteboardSlide = {
      id: Math.random().toString(36).substring(2, 9),
      title: `📝 Quiz: ${aiLesson.lessonTitle}`,
      paths: [
        {
          id: `quiz-outline`,
          tool: "rect",
          color: "rgba(244, 63, 94, 0.55)",
          width: 3.5,
          points: [
            { x: 30, y: 30 },
            { x: 750, y: 470 }
          ]
        }
      ],
      backgroundTemplate: "white",
      backgroundColor: "#fafafa"
    };

    freshSlides.push(quizSlide);

    setSlides([...slides, ...freshSlides]);
    setActiveSlideId(freshSlides[0].id);
    setActiveTab("whiteboard");
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden font-sans select-none antialiased border-[8px] border-slate-900 rounded-3xl shadow-2xl relative">
      
      {/* 4K SMART CLASSROOM FLAT PANEL TOP HEADER BOARD */}
      <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 shrink-0 shadow-xs">
        
        {/* Left Side: Brand OS with system specs */}
        <div className="flex items-center space-x-3 text-left">
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm font-black text-sm">
            C
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider text-slate-900 flex items-center space-x-2">
              <span>ClassCore OS v4.2</span>
              <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono uppercase tracking-wide font-extrabold">● SYSTEM READY</span>
            </h1>
            <p style={{ fontSize: "9px" }} className="text-slate-400 font-mono font-bold">Interactive Flat Panel Educational Workspace</p>
          </div>
        </div>

        {/* Central Display Navigation: Big tactile app layout toggles */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 space-x-1">
          <button
            onClick={() => setActiveTab("whiteboard")}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "whiteboard" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:text-slate-900 hover:bg-white/80"}`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Whiteboard</span>
          </button>

          <button
            onClick={() => setActiveTab("science_lab")}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "science_lab" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:text-slate-900 hover:bg-white/80"}`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Science Lab Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("math_music")}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "math_music" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:text-slate-900 hover:bg-white/80"}`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Math & Music</span>
          </button>

          <button
            onClick={() => setActiveTab("classroom_widgets")}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "classroom_widgets" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:text-slate-900 hover:bg-white/80"}`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Class Tools Suite</span>
          </button>
        </div>

        {/* Right side: system Clock indicators */}
        <div className="flex items-center space-x-4">
          <div className="text-right flex flex-col justify-center">
            <span className="text-xs font-mono text-blue-650 font-black tracking-wide">10:42 AM</span>
            <span style={{ fontSize: "8px" }} className="text-slate-400 font-bold uppercase tracking-wider">Monday, Zone Standard</span>
          </div>
          
          <div className="h-6 w-px bg-slate-200" />
          
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-center font-mono text-[10px] font-bold text-slate-600 shadow-inner">
            IFP-8989
          </div>
        </div>

      </header>

      {/* PRIMARY WORKSPACE FLEX BODY */}
      <main className="flex-grow flex items-stretch overflow-hidden">
        
        {/* COLUMN A: LEFT PRESENTATION SLIDES DESK SELECTOR */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-xs">
          
          {/* Section 1: list of active slideshow frames */}
          <div className="flex-grow flex flex-col p-4 overflow-hidden">
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] text-slate-405 uppercase tracking-widest font-mono font-black">Presentation Deck ({slides.length})</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleAddSlide("white")}
                  className="p-1 text-slate-500 hover:text-blue-600 bg-slate-100 rounded-md hover:bg-slate-200 transition"
                  title="Add White Slide"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Slides list wrapper */}
            <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-none text-left pointer-events-auto">
              {slides.map((slide, sIdx) => {
                const isActive = slide.id === activeSlideId;
                return (
                  <div
                    key={slide.id}
                    onClick={() => {
                      setActiveSlideId(slide.id);
                      // Auto return focus to whiteboard draw tab for slide
                      if (activeTab !== "whiteboard") {
                        setActiveTab("whiteboard");
                      }
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer relative group flex flex-col justify-between ${isActive ? "bg-blue-50/75 border-blue-500 text-blue-900 shadow-sm" : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-705"}`}
                  >
                    <div>
                      {/* Thumbnail mini background visual */}
                      <div className={`h-10 w-full rounded-lg mb-2 border flex items-center justify-center text-[9px] uppercase font-mono tracking-wider font-extrabold pb-0.5 shadow-xs ${slide.backgroundTemplate === "chalkboard" ? "bg-emerald-900 border-emerald-950 text-emerald-350" : slide.backgroundTemplate === "grid" ? "bg-teal-50 border-teal-200 text-blue-650" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                        {slide.backgroundTemplate} background
                      </div>

                      <span className="text-[11.5px] font-bold tracking-tight leading-tight block truncate pr-5">
                        {sIdx + 1}. {slide.title}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-mono font-semibold block mt-0.5">
                        {slide.paths.length} drawing elements
                      </span>
                    </div>

                    {/* Action buttons drawer overlay */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition duration-150">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(slide); }}
                        className="p-1 bg-white hover:bg-slate-100 text-slate-500 rounded border border-slate-200 shadow-xs text-[9px] hover:text-slate-800"
                        title="Duplicate Slide Frame"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      
                      <button
                        disabled={slides.length <= 1}
                        onClick={(e) => handleDeleteSlide(slide.id, e)}
                        className="p-1 bg-white hover:bg-red-50 text-slate-430 rounded border border-slate-200 shadow-xs text-[9px] hover:text-red-500 disabled:opacity-30"
                        title="Delete Slide Frame"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Section 2: Quick Classroom templates generator helper */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-200 space-y-2 text-left shrink-0">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-extrabold block">Insert Slide Layout</span>
            
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAddSlide("chalkboard")}
                className="py-1.5 px-2 bg-white text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 flex items-center justify-center space-x-1 hover:bg-slate-100 hover:text-slate-900 shadow-xs transition"
              >
                <span>🟩 Chalkboard</span>
              </button>

              <button
                onClick={() => handleAddSlide("grid")}
                className="py-1.5 px-2 bg-white text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 flex items-center justify-center space-x-1 hover:bg-slate-100 hover:text-slate-900 shadow-xs transition"
              >
                <span>📐 Math Grid</span>
              </button>
            </div>
          </div>

        </div>

        {/* COLUMN B: CENTRAL SIMULATOR INTERACTIVE APP CANVAS WINDOW */}
        <div className="flex-grow p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-slate-105 to-blue-50/20 flex flex-col overflow-hidden relative">
          
          {/* Active app window loading based on tab state selection */}
          <div className="flex-grow h-full w-full relative">
            
            {activeTab === "whiteboard" && (
              <WhiteboardCanvas
                activeSlide={activeSlide}
                onUpdateSlide={handleUpdateSlide}
              />
            )}

            {activeTab === "science_lab" && (
              <ScienceLab />
            )}

            {activeTab === "math_music" && (
              <MathMusicLab />
            )}

            {activeTab === "classroom_widgets" && (
              <ClassroomWidgets />
            )}

          </div>

        </div>

        {/* COLUMN C: RIGHT AI COACH SIDE PANEL DRAWER */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-xs">
          
          <div className="p-4 flex-grow flex flex-col overflow-hidden">
            <AILessonPlanner
              onPushLessonToSlides={handlePushLessonToSlides}
            />
          </div>

        </div>

      </main>

      {/* BOTTOM FOOTER UTILITY INDICATORS STATUS & DOCK DRAWER */}
      <footer className="h-20 bg-slate-900 border-t border-slate-950 flex items-center justify-between px-6 z-30 shrink-0 relative">
        
        {/* Left Side: System status indicator */}
        <div className="flex items-center space-x-3 text-left">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-emerald-450 font-extrabold tracking-wide uppercase">System status: ACTIVE</span>
            <span style={{ fontSize: "8px" }} className="text-slate-400 font-mono tracking-widest uppercase">IFP 4K Resolution</span>
          </div>
        </div>

        {/* Center: Tactile Enclosed Pill Dock matching Geometric Balance Cockpit UI */}
        <div className="bg-slate-800 px-6 py-1.5 rounded-2xl border border-slate-700/80 flex items-center space-x-8 shadow-xl max-w-[65%]">
          
          <button 
            onClick={() => setActiveTab("whiteboard")}
            className={`flex flex-col items-center cursor-pointer transition-all duration-150 group ${activeTab === "whiteboard" ? "text-blue-400 scale-102" : "text-slate-400 hover:text-slate-200"}`}
          >
            <div className={`p-1.5 rounded-lg transition-colors duration-150 ${activeTab === "whiteboard" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 group-hover:bg-slate-650"}`}>
              <PenTool className="w-4 h-4" />
            </div>
            <span className="text-[8.5px] uppercase font-black font-sans tracking-wide mt-1 block">Whiteboard</span>
          </button>

          <button 
            onClick={() => setActiveTab("science_lab")}
            className={`flex flex-col items-center cursor-pointer transition-all duration-150 group ${activeTab === "science_lab" ? "text-blue-400 scale-102" : "text-slate-400 hover:text-slate-200"}`}
          >
            <div className={`p-1.5 rounded-lg transition-colors duration-150 ${activeTab === "science_lab" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 group-hover:bg-slate-650"}`}>
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[8.5px] uppercase font-black font-sans tracking-wide mt-1 block">Science Lab</span>
          </button>

          <button 
            onClick={() => setActiveTab("math_music")}
            className={`flex flex-col items-center cursor-pointer transition-all duration-150 group ${activeTab === "math_music" ? "text-blue-400 scale-102" : "text-slate-400 hover:text-slate-200"}`}
          >
            <div className={`p-1.5 rounded-lg transition-colors duration-150 ${activeTab === "math_music" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 group-hover:bg-slate-650"}`}>
              <Layout className="w-4 h-4" />
            </div>
            <span className="text-[8.5px] uppercase font-black font-sans tracking-wide mt-1 block">Math & Music</span>
          </button>

          <button 
            onClick={() => setActiveTab("classroom_widgets")}
            className={`flex flex-col items-center cursor-pointer transition-all duration-150 group ${activeTab === "classroom_widgets" ? "text-blue-400 scale-102" : "text-slate-400 hover:text-slate-200"}`}
          >
            <div className={`p-1.5 rounded-lg transition-colors duration-150 ${activeTab === "classroom_widgets" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 group-hover:bg-slate-650"}`}>
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[8.5px] uppercase font-black font-sans tracking-wide mt-1 block">Class Tools</span>
          </button>

        </div>

        {/* Right Side: Quick Specs / Controls indicators */}
        <div className="flex items-center space-x-4 text-right">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-blue-400 font-extrabold tracking-wide uppercase">Web Audio synth</span>
            <span style={{ fontSize: "8px" }} className="text-slate-400">Activated & Active</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <span className="text-xs font-bold text-slate-500 font-mono">1.2ms</span>
        </div>

      </footer>

    </div>
  );
}
