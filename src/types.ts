export type ToolType = "pen" | "highlighter" | "eraser_stroke" | "eraser_rect" | "line" | "rect" | "circle" | "arrow" | "text" | "none";

export interface DrawingPath {
  id: string;
  tool: ToolType;
  color: string;
  width: number;
  points: { x: number; y: number }[];
  text?: string;
  isSelected?: boolean;
}

export interface WhiteboardSlide {
  id: string;
  title: string;
  paths: DrawingPath[];
  backgroundTemplate: "white" | "chalkboard" | "grid" | "ruled" | "dotted" | "music" | "sports-court" | "coordinate";
  backgroundColor: string;
}

export type WidgetType = "timer" | "stopwatch" | "picker" | "scoreboard" | "noise" | "clock" | "spotlight" | "curtain" | "periodic_table";

export interface Student {
  id: string;
  name: string;
  present: boolean;
}

// Science Simulator Chem Chemicals
export interface Chemical {
  id: string;
  name: string;
  color: string;
  formula: string;
  ph: number;
  isIndicator?: boolean;
}

// Science Simulator Physics Circuit Elements
export type CircuitElementType = "battery" | "lamp" | "switch" | "wire" | "resistor";

export interface CircuitElement {
  id: string;
  type: CircuitElementType;
  x: number;
  y: number;
  value: number; // Volts for battery, Ohms for resistor
  isActive?: boolean; // For switch
}

export interface CircuitConnection {
  fromId: string;
  toId: string;
}

// AI Generated Lesson Structure
export interface AILessonSlide {
  slideTitle: string;
  subtitle?: string;
  bulletPoints: string[];
  interactiveChallenge: string;
  teacherGuideSpeech: string;
  suggestedInkDrawings: string;
  visualStyleHint: string;
}

export interface AIQuizQuestion {
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AILesson {
  lessonTitle: string;
  subject: string;
  gradeLevel: string;
  slides: AILessonSlide[];
  quizQuestions: AIQuizQuestion[];
}
