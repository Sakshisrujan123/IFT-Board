import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Zero-dependency CORS-allowing middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Cache for generated image data if needed, or inline
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint 1: Generate Full Classroom Lesson (JSON Structure)
app.post("/api/generate-lesson", async (req, res) => {
  try {
    const { topic, gradeLevel, subject } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const queryPrompt = `Create a visually rich, engaging lesson plan divided into 4 key slides/sections with teaching materials and a 3-question student interactive review quiz for the topic: "${topic}" suitable for grade level "${gradeLevel || "All grades"}" under the subject of "${subject || "General Science"}". Do not write markdown, generate a strict JSON response fitting the required schema. Ensure the slides are highly pedagogical, start with an hook/introduction, visual explanation of the main sub-concepts, and a final practical recap.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: queryPrompt,
      config: {
        systemInstruction: "You are an expert curriculum developer and instructional designer. You create slides, student activities, teacher talking points, and interactive quizzes optimized for 4K classroom Interactive Flat Panels.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lessonTitle: { type: Type.STRING, description: "Captivating title of the lesson" },
            subject: { type: Type.STRING },
            gradeLevel: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              description: "Sequence of exactly 4 pedagogical slides for the classroom whiteboard.",
              items: {
                type: Type.OBJECT,
                properties: {
                  slideTitle: { type: Type.STRING, description: "Title of this slide" },
                  subtitle: { type: Type.STRING, description: "Optional brief kicker or subtitle" },
                  bulletPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 to 4 short, readable, bulleted teaching points. Avoid dense paragraphs."
                  },
                  interactiveChallenge: { type: Type.STRING, description: "An on-screen challenge for a student to solve at the board (e.g., 'Draw arrows from X to Y', 'Circle the correct word')" },
                  teacherGuideSpeech: { type: Type.STRING, description: "Notes, script, and background information for the teacher while showing this slide." },
                  suggestedInkDrawings: { type: Type.STRING, description: "Creative prompts suggesting what the teacher can manually draw or sketch on the chalkboard to visually supplement this slide" },
                  visualStyleHint: { type: Type.STRING, description: "Visual template styling recommendation (e.g. 'chalkboard', 'lined', 'grid', 'diagram-space')" }
                },
                required: ["slideTitle", "bulletPoints", "interactiveChallenge", "teacherGuideSpeech", "suggestedInkDrawings"]
              }
            },
            quizQuestions: {
              type: Type.ARRAY,
              description: "3 multiple-choice interactive quiz questions for a quick plenary session.",
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING, description: "The multiple choice question to display" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options"
                  },
                  correctIndex: { type: Type.INTEGER, description: "Zero-based index of the correct answer (0 to 3)" },
                  explanation: { type: Type.STRING, description: "Educational explanation of why this answer is correct" }
                },
                required: ["questionText", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["lessonTitle", "subject", "gradeLevel", "slides", "quizQuestions"]
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error generating lesson:", error);
    res.status(500).json({ error: error.message || "Failed to generate lesson" });
  }
});

// Endpoint 2: Instant Concept Explainer
app.post("/api/explain-concept", async (req, res) => {
  try {
    const { phrase, grade } = req.body;
    if (!phrase) {
      return res.status(400).json({ error: "Concept/Phrase is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Explain the concept "${phrase}" in a simple, highly visual way for a ${grade || "middle school"} student using an analogy. Also provide 2 quick sandbox-drawing ideas the teacher can draw right now to show it. Return custom JSON matching the structure.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            analogyTitle: { type: Type.STRING },
            analogyText: { type: Type.STRING },
            quickFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            interactiveBoardActivities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  activityTitle: { type: Type.STRING },
                  instructions: { type: Type.STRING }
                }
              }
            }
          },
          required: ["title", "analogyTitle", "analogyText", "quickFacts", "interactiveBoardActivities"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error explaining concept:", error);
    res.status(500).json({ error: error.message || "Failed to explain concept" });
  }
});

// Setup Vite Development Middleware or Production Static Server
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IFP Server] Running on http://localhost:${PORT} with Node environment: ${process.env.NODE_ENV || "development"}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
