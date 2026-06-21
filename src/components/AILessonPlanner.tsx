import React, { useState } from "react";
import { Sparkles, GraduationCap, ChevronRight, ChevronLeft, Send, CheckCircle, RefreshCw, Layers, ShieldAlert, ArrowDown } from "lucide-react";
import { AILesson, WhiteboardSlide, DrawingPath } from "../types";

interface AILessonPlannerProps {
  onPushLessonToSlides: (aiLesson: AILesson) => void;
}

export default function AILessonPlanner({ onPushLessonToSlides }: AILessonPlannerProps) {
  const [topic, setTopic] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState<string>("Middle School (6-8)");
  const [subject, setSubject] = useState<string>("Science");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [lesson, setLesson] = useState<AILesson | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [pushedSuccess, setPushedSuccess] = useState<boolean>(false);

  // Concept explainer states
  const [conceptPhrase, setConceptPhrase] = useState<string>("");
  const [explainingConcept, setExplainingConcept] = useState<boolean>(false);
  const [conceptExplanation, setConceptExplanation] = useState<any>(null);

  const handleGenerateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setErrorStatus(null);
    setLesson(null);
    setPushedSuccess(false);

    try {
      const response = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, gradeLevel, subject }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach Gemini API backend. Ensure GEMINI_API_KEY is configured.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setLesson(data);
      setActiveSlideIndex(0);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "Endpoint error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplainConcept = async () => {
    if (!conceptPhrase.trim()) return;
    setExplainingConcept(true);
    setConceptExplanation(null);
    try {
      const resp = await fetch("/api/explain-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: conceptPhrase, grade: gradeLevel }),
      });
      const data = await resp.json();
      setConceptExplanation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setExplainingConcept(false);
    }
  };

  const handlePushToBoard = () => {
    if (!lesson) return;
    onPushLessonToSlides(lesson);
    setPushedSuccess(true);
    setTimeout(() => setPushedSuccess(false), 4500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-905 rounded-2xl border border-slate-800 p-2 overflow-y-auto">
      
      {/* Search planning Form */}
      <form onSubmit={handleGenerateLesson} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-3 shadow">
        <div className="flex items-center space-x-1.5 border-b border-slate-850 pb-2">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          <span className="text-xs font-black text-slate-100 tracking-wide uppercase">Gemini AI Lesson Architect</span>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Lesson Topic / Standard</label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Photosynthesis, Fractions, Solar System"
            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white placeholder-slate-500 outline-none focus:border-amber-500 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs py-1.5 px-2.5 rounded-lg text-slate-200 w-full cursor-pointer"
            >
              <option>Science</option>
              <option>Mathematics</option>
              <option>English Language</option>
              <option>Social Studies</option>
              <option>Music/Art</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Grade Target</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs py-1.5 px-2.5 rounded-lg text-slate-200 w-full cursor-pointer"
            >
              <option>Kindergarten (K-2)</option>
              <option>Elementary (3-5)</option>
              <option>Middle School (6-8)</option>
              <option>High School (9-12)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow transition"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Architecting Lesson...</span>
            </div>
          ) : (
            "Generate Curriculum Slides"
          )}
        </button>
      </form>

      {/* ERROR HANDLER OUTLET */}
      {errorStatus && (
        <div className="mt-3 p-3 bg-red-950/40 border border-red-900 text-red-200 text-xs rounded-xl flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Generation Error</span>
            <p className="opacity-75 text-[10px] mt-0.5">{errorStatus} Check that the GEMINI_API_KEY secret holds a valid key.</p>
          </div>
        </div>
      )}

      {/* AI LOADING PROGRESS SCREEN OR SLIDE RENDERER */}
      {loading && (
        <div className="mt-4 p-4 text-center bg-slate-950/40 border border-slate-850 rounded-xl space-y-2 animate-pulse">
          <GraduationCap className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
          <h4 className="text-xs font-black text-slate-300">Formulating whiteboard lesson structure</h4>
          <p style={{ fontSize: "10px" }} className="text-slate-500 leading-relaxed px-4">
            "Gemini is building customized slide structures, teacher speeches, board doodles, and flash card quizzes."
          </p>
        </div>
      )}

      {/* GENERATED OUTLINE PANEL VIEW */}
      {lesson && !loading && (
        <div className="mt-3.5 space-y-3.5 pointer-events-auto">
          
          {/* Main Title block */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-left">
            <div>
              <span className="text-[9.5px] font-bold text-amber-500 uppercase block font-mono">{lesson.subject} • {lesson.gradeLevel}</span>
              <span className="text-sm font-black text-slate-100">{lesson.lessonTitle}</span>
            </div>

            <button
              onClick={handlePushToBoard}
              className={`text-[10px] font-black px-3.5 py-1.5 rounded-lg flex items-center space-x-1 shadow transition ${pushedSuccess ? "bg-emerald-600 text-white" : "bg-gradient-to-r from-amber-600 to-rose-600 text-white hover:scale-103"}`}
            >
              {pushedSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Pushed!</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Push to Board</span>
                </>
              )}
            </button>
          </div>

          {/* Slide Detail Deck segment selector */}
          <div className="bg-slate-950/60 p-3.5 border border-slate-800 rounded-xl space-y-3 relative">
            <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-2">
              <span className="font-extrabold text-slate-300">Slide {activeSlideIndex + 1} of {lesson.slides.length}</span>
              <div className="flex space-x-1">
                <button
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex(p => p - 1)}
                  className="p-1.5 bg-slate-800 rounded disabled:opacity-30 hover:bg-slate-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  disabled={activeSlideIndex === lesson.slides.length - 1}
                  onClick={() => setActiveSlideIndex(p => p + 1)}
                  className="p-1.5 bg-slate-800 rounded disabled:opacity-30 hover:bg-slate-705"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

            {/* Slide active content */}
            <div className="text-left text-xs space-y-2">
              <span className="text-xs font-black text-rose-550 uppercase font-sans tracking-wide block">{lesson.slides[activeSlideIndex].slideTitle}</span>
              
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300 font-normal leading-relaxed">
                {lesson.slides[activeSlideIndex].bulletPoints.map((point, pi) => (
                  <li key={pi} className="text-[11px]">{point}</li>
                ))}
              </ul>

              {/* Class Challenge overlay card */}
              <div className="bg-amber-950/30 border border-amber-900/60 p-2 rounded-lg mt-3 text-[10.5px]">
                <strong className="text-yellow-450 uppercase tracking-wide block font-bold text-[9px] mb-0.5">BOARD STUDENT STUDY CHALLENGE:</strong>
                <p className="text-slate-300 italic font-normal leading-relaxed">"{lesson.slides[activeSlideIndex].interactiveChallenge}"</p>
              </div>

              {/* Suggested ink drawings */}
              <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg text-[10.5px]">
                <strong className="text-rose-450 uppercase tracking-wide block font-bold text-[9px] mb-0.5">CHALKBOARD DOODLE SUGGESTION:</strong>
                <p className="text-slate-400 font-normal leading-relaxed">"{lesson.slides[activeSlideIndex].suggestedInkDrawings}"</p>
              </div>

              {/* Teacher script guide speech */}
              <div className="bg-slate-900/80 p-2 rounded-lg text-[10.5px] border border-slate-800">
                <strong className="text-teal-400 uppercase tracking-wide block font-bold text-[9px] mb-0.5">TEACHER SCRIPT PATHWAY:</strong>
                <p className="text-slate-400 font-normal leading-normal">"{lesson.slides[activeSlideIndex].teacherGuideSpeech}"</p>
              </div>
            </div>
          </div>

          {/* Quiz Preview segment */}
          <div className="bg-slate-950/40 p-3.5 border border-slate-800 rounded-xl space-y-3 text-left">
            <span className="text-xs font-black text-slate-300 block border-b border-slate-850 pb-1.5 uppercase font-mono tracking-wider">Student Interactive Quiz Panel ({lesson.quizQuestions.length} Questions)</span>
            {lesson.quizQuestions.map((q, qi) => (
              <div key={qi} className="text-xs border-b border-slate-850/60 pb-2 mb-2 last:border-none">
                <span className="font-bold text-slate-205">{qi + 1}. {q.questionText}</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`p-1.5 rounded-lg border text-[10px] leading-tight font-medium ${oi === q.correctIndex ? "bg-emerald-950/20 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SECONDARY MINOR UTILITY: INSTANT ANALOGY EXPLAINER */}
      <div className="mt-4 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 text-left pointer-events-auto">
        <span className="text-[10px] uppercase font-mono tracking-wide text-rose-500 font-black block mb-1.5 flex items-center space-x-1">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Analogy concept explainer</span>
        </span>
        
        <div className="flex space-x-1.5">
          <input
            type="text"
            required
            value={conceptPhrase}
            onChange={(e) => setConceptPhrase(e.target.value)}
            placeholder="e.g. Gravity, Electric Current, Osmosis"
            className="bg-slate-900 text-xs px-3 py-2 rounded-xl flex-1 border border-slate-805 outline-none focus:border-rose-500 text-white font-medium"
          />
          <button
            onClick={handleExplainConcept}
            disabled={explainingConcept || !conceptPhrase.trim()}
            className="p-1 px-3 bg-rose-650 hover:bg-rose-700 disabled:opacity-40 rounded-xl text-[10.5px] font-black text-white"
          >
            {explainingConcept ? "Asking AI..." : "Explain!"}
          </button>
        </div>

        {conceptExplanation && (
          <div className="mt-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2">
            <span className="font-bold text-slate-200 block text-xs border-b border-slate-850 pb-1">{conceptExplanation.title}</span>
            <div>
              <span className="text-[9px] uppercase tracking-wide text-amber-500 font-bold block">{conceptExplanation.analogyTitle}</span>
              <p className="text-slate-300 font-normal leading-relaxed text-[11px]">{conceptExplanation.analogyText}</p>
            </div>
            
            <ul className="list-disc list-inside text-slate-400 leading-normal pl-1 space-y-1" style={{ fontSize: "10px" }}>
              {conceptExplanation.quickFacts.map((fact: string, fi: number) => (
                <li key={fi}>{fact}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}
