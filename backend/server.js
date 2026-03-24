import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4
].filter(key => key);
console.log(`System loaded ${apiKeys.length} API keys.`);

apiKeys.forEach((key, index) => {
    console.log(`Key ${index + 1}: ${key.substring(0, 5)}...`);
});

const corsOptions = {
  origin: ['https://krobbus.github.io', 'http://127.0.0.1:5500', 'http://localhost:5500'] ,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

let currentKeyIndex = 0;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
//switch project
async function smartGenerate(prompt) {
  let keyAttempts = 0;

  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3-flash"];

  while (keyAttempts < apiKeys.length) {
    const currentKey = apiKeys[currentKeyIndex];
    const genAI = new GoogleGenerativeAI(currentKey);

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        const isRateLimit = error.status === 429 || error.message.includes("429");

        if (isRateLimit) {
          console.warn(`Rate limit on Key ${currentKeyIndex + 1}, Model ${modelName}. Trying next model/key...`);
          await sleep(1000);
          continue;
        }
        console.error(`Error with ${modelName}:`, error.message);
        continue;
      }
    }
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    keyAttempts++;
    console.log(`Rotating to Key ${currentKeyIndex + 1}...`);
  }
  throw new Error("QUOTA_EXHAUSTED: All keys and models have reached their limits.");
}


// endpoint to generate quiz questions
app.post("/api/generate-quiz-questions", async (req, res) => {
  const { question, userAnswer, correctAnswer, courseName, quizType } = req.body;
  const numQuestions = 5;

  const courseDescriptions = {
    CITCS: "Computer Science & IT program focusing on coding, AI, and systems.",
    CCJ: "Criminal Justice studies focusing on law enforcement, forensics, and criminology.",
    CBA: "Business Administration with management and marketing foundations.",
    CAS: "Arts and Sciences track for critical thinking and creativity.",
    CTE: "Education-focused program for teaching and pedagogy training.",
    COM: "Medicine program centered on healthcare, anatomy, and medical research.",
    ISW: "Social Work institute dedicated to community service and social welfare practices.",
    IPPG: "Public Policy and Governance program focused on leadership and civic management."
  };
  
  const prompt = `
  YOU MUST generate quiz questions in STRICT JSON ONLY.

  === COURSE INFORMATION ===
  Course Code: ${courseName}
  Course Meaning: "${courseDescriptions[courseName]}"
  Question: "${question}"
  Selected Answer: "${userAnswer}"
  Correct Answer: "${correctAnswer}"

  === DIFFICULTY SETTING ===
  DIFFICULTY: EASY TO MEDIUM.
  - Focus on fundamental concepts, definitions, and core principles of the subject.
  - Avoid obscure trivia or highly advanced technical details.
  - Questions should be clear and assess foundational knowledge.

  === STRICT OUTPUT RULES ===
  - Output ONLY a pure JSON array (NO markdown, NO extra text, NO explanations).
  - DO NOT repeat the answer inside other options.
  - DO NOT include generic distractors like "None of the above", "All of the above" unless relevant.
  - USE the course meaning to ensure questions match the correct subject.
  - JSON MUST be 100% valid and parsable.
    OUTPUT:
    1. "question"
    2. "answer"
    3. "options"
    4. "hint": ONLY for indentification quiz type
    5. "explanation" 

  === RULES PER QUIZ TYPE ===
  1. IF quizType is "multipleChoice":
    - Each question MUST include EXACTLY 4 meaningful, realistic options.
    - Options must be real answers, DO NOT generate letters as options ("A","B","C","D"). Every option must be a valid concept.
    - Every single question MUST have an "explanation".
    - No placeholder, no generic labels, no empty values.
    Format:
    { "question": "...", "options": ["...","...","...","..."], "answer": "...", "explanation": "..."}

  2. IF quizType is "identification":
    - ANSWWERS must be ONE-TWO WORDS ONLY.
    - "answer": The most common short name (e.g., "AI").
    - "variants": An array of 3-5 closely related or full-name versions of the answer. (Example: if answer is "AI", variants are ["Artificial Intelligence", "Intelligent Agent", "A.I."]).
    - Every single question MUST have an "explanation" and a "hint".
    - hint must be 1 short sentence that helps without giving the answer away.
    - NO "options" allowed.
    Format:
    { "question": "...", "answer": "...", "variants": ["...", "..."], "explanation": "...", "hint": "..."}

  === COMPONENT RULES ===
  1. STRICT RULES FOR EXPLANATION (REQUIRED FOR ALL):
    - Explain why the answer is correct/incorrect in 1-2 sentences.
    - After the explanation, provide at least one reliable source or reference related to the correct answer (prefer .edu, .org, or .gov sites).
    - Return ONLY the explanation and link.
    Format:
    Explanation:
    <your explanation here>

    Source:
    <website title>

    URL:
    <URL>

  2. STRICT RULES FOR HINT (IDENTIFICATION ONLY):
    - You generate a hint for a question
    - KEEP IT SHORT (1 sentence only).
    - DO NOT reveal the exact answer.
    - DO NOT mention that it's a hint.
    - DO NOT give multiple hints.
    - DO NOT restate the full question.
    - DO NOT return markdown or labels.
    - The hint must help but NOT directly give away the answer.
    - Output ONLY plain text.
    Format:
    Hint: <hint here>

  Return ONLY a JSON array containing the questions, answers, hint, and their corresponding explanations. GENERATE ${numQuestions} QUESTIONS NOW:
  `;

  try {
    const text = await smartGenerate(prompt);
    const cleanText = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in AI response");
    const questions = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate quiz. Try again in 60s." });
  }
});


// endpoint to generate test questions
app.post("/api/generate-test-questions", async (req, res) => {
  const { courseName, quizType } = req.body;
  const numQuestions = 5;

  const courseDescriptions = {
    CITCS: "Computer Science & IT program focusing on coding, AI, and systems.",
    CCJ: "Criminal Justice studies focusing on law enforcement, forensics, and criminology.",
    CBA: "Business Administration with management and marketing foundations.",
    CAS: "Arts and Sciences track for critical thinking and creativity.",
    CTE: "Education-focused program for teaching and pedagogy training.",
    COM: "Medicine program centered on healthcare, anatomy, and medical research.",
    ISW: "Social Work institute dedicated to community service and social welfare practices.",
    IPPG: "Public Policy and Governance program focused on leadership and civic management."
  };

  const courseInfo = courseDescriptions[courseName] || "General academic excellence and career readiness.";
  
  const prompt = `
  YOU MUST generate test questions in STRICT JSON ONLY.

  === COURSE INFORMATION ===
  Course Code: ${courseName}
  Course Meaning: ${courseInfo}

  === TASKS ===
  You are an educational guidance AI designed to evaluate whether a student’s personality traits and skills align with a specific college course.
  Generate ${numQuestions} first-person statements to evaluate if a student's ${quizType} matches this course.
  Your task is to generate two distinct sets of questions:
  - If type is PERSONALITY: focusing on interests, preferences, work habits, motivation, and attitudes.
  - If type is SKILL: focusing on abilities, problem-solving approaches, and task-related competencies.

  === JSON FORMAT RULES ===
  - Output ONLY a PURE JSON ARRAY of objects.
  Format:
    {
      "question": "Statement here (e.g., 'I enjoy breaking down complex problems into smaller parts.')",
      "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      "category": "The specific trait being measured"
    }
  
  === STRICT OUTPUT RULES ===
  - NO academic/fact-based questions.. Instead, they should assess what the student likes or dislikes, how they think and behave, and how they approach tasks related to the course.
  - The purpose is to help the AI determine whether the student’s overall profile aligns with the selected course and to generate personalized feedback after the assessment.
  - Organize each set under clear headings (Personality and Skills), with short thematic subcategories if needed.
  - Statements must be in the FIRST PERSON ("I am...", "I enjoy...", "I can...") and answered using a 5-point Likert scale: { Strongly Agree, Agree, Neutral, Disagree, Strongly Disagree }.

  === REQUEST ===
  Course: ${courseName}
  Quiz Type: ${quizType}
  Number of Questions: ${numQuestions}

  Generate now. Return ONLY a JSON array containing the questions.
  Output raw JSON only.
  `;

  try {
    const text = await smartGenerate(prompt);
    const cleanText = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in AI response");

    const questions = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate test questions. Try again in 60s." });
  }
});

/*  OPTIONAL
// endpoint to generate hint
app.post("/api/get-hint", async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: "Missing question or answer" });
  }

  const prompt = `
  You generate a HINT for a quiz question.

  Strict rules:
  - KEEP IT SHORT (1 sentence only).
  - DO NOT reveal the exact answer.
  - DO NOT mention that it's a hint.
  - DO NOT give multiple hints.
  - DO NOT restate the full question.
  - DO NOT return markdown or labels.
  - The hint must help but NOT directly give away the answer.
  - Output ONLY plain text.

  Course Question:
  "${question}"

  Correct Answer:
  "${answer}"

  Give only the hint now.
  `;

  try {
    const aiText = await smartGenerate(prompt);
    res.json({ aiText });
  } catch (err) {
    res.status(429).json({ error: "Hint unavailable due to high traffic." });
  }
});


// endpoint for quiz feedback
app.post("/api/feedback", async (req, res) => {
  const { userAnswer, correctAnswer, courseName } = req.body;

  const prompt = `
    You are an educational assistant AI.

    A student is taking a quiz about the course: "${courseName}".

    They selected the answer: "${userAnswer}".
    The correct answer is: "${correctAnswer}".

    Explain why the answer is correct/incorrect in 1-2 sentences.
    After the explanation, provide at least one reliable source or reference related to the correct answer (prefer .edu, .org, or .gov sites).

    Format the output like this:
    Explanation:
    <your explanation here>

    Source:
    <website title>

    URL:
    <URL>

    Return ONLY the explanation and link.
  `;

  try {
    const aiText = await smartGenerate(prompt);
    res.json({ aiText });
  } catch (err) {
    res.status(429).json({ error: "Feedback unavailable due to high traffic." });
  }
});
*/

// endpoint for dashboard comment
app.post("/api/comment", async (req, res) => {
  const { playerName, coursesTaken = [], scores = {}, tags = [], quizResults = {} } = req.body;

  const courseAnalysis = [];
  const personalityLogs = [];

  for (const [courseName, courseData] of Object.entries(scores)) {
    if (!courseData) continue;

    // --- A. IQ CALCULATION (Academic Performance) ---
    // Average of Multiple Choice & Identification
    let academicSum = 0;
    let academicCount = 0;
    if (courseData.multipleChoice) { academicSum += courseData.multipleChoice; academicCount++; }
    if (courseData.identification) { academicSum += courseData.identification; academicCount++; }
    
    if (academicCount > 0) {
      courseAnalysis[courseName] = (academicSum / academicCount).toFixed(1);
    }
    
    // --- B. EQ EXTRACTION (Personality/Skill Details) ---
    // We look into quizResults to find the specific Likert answers for this course  
    // --- B. Extract Likert Responses (EQ) ---
    // We get the specific text answers from the personality test to see WHO they are.
    if (quizResults[courseName]?.personality?.details) {
      const detailsArray = Array.isArray(quizResults[courseName].personality.details) 
        ? quizResults[courseName].personality.details 
        : Object.values(quizResults[courseName].personality.details);

      const log = detailsArray.map(d => `[${courseName}] Q: "${d.question}" -> User said: "${d.userResponse}"`).join("\n");
      personalityLogs.push(log);
    }
  }

  const skillTags = tags.filter(t => t.type === 'skill').map(t => t.text).join(", ");
  const personalityTags = tags.filter(t => t.type === 'personality').map(t => t.text).join(", ");

  const prompt = `
    You are an Expert Career & Educational Counselor AI.
    Your tasks/goals are:
    - Generate accurate, positive, and helpful comments for students based strictly on their performance data.
    - Recommend the best college course for a student by analyzing the "Intersection" between their Academic Performance (IQ) and their Personal Identity/Likert Responses (EQ).
    
    === STUDENT DATA ===
    Academic Performance (Averages out of 5.0): 
    ${JSON.stringify(courseAnalysis, null, 2)}

    Skills (Tags): "${skillTags}"
    Personality Traits (Tags): "${personalityTags}"

    Detailed Psychological Profile (Likert Scale Responses):
    (Use these specific answers to judge their true passion and aptitude)
    ${personalityLogs.join("\n")}

    === MISSION ===
    1. Analyze the performance for each course.
    2. Compare the student's highest-scoring courses against their detailed Likert responses and skills.
    3. **The Intersection:** If a student is good at a course (e.g., CITCS) but has a skill for another (e.g., Artistic), suggest how they can combine them (e.g., UI/UX Design or Game Art).
    4. If a skill/personality directly matches a high-scoring course, call it a "PERFECT MATCH."

    === DISCOVERY & COMPARISON ===
    Strategic Recommendations:
    > Based on your skill "[Skill Name]", you should try the [Course Name] quiz. This will help us compare your technical ability with your creative potential.
    > (Provide 1-2 suggestions if they have skills that match courses they haven't taken yet. If they have taken all courses, suggest a specialization.)

    === STRICT OUTPUT FORMAT ===
    (You MUST strictly follow this layout)

    List of Played Courses:
    > Course: <course name> (For EACH course entry found in "Academic Performance")
    > Average Score: <average score>
    > Comment: A positive and accurate reflection of the ${playerName}’s performance. Highlight strengths based on their grades, and mention how their specific Likert answers (e.g., "Since you agreed you like leading teams...") support this.
    > Suggestion: A clear, practical recommendation. If they have a skill unrelated to this course, suggest they try a course that fits that skill too.
    
    Top Recommended Course:
    > <course name> — Average Score: <average score>%
    > Why it fits you: (Provide a deep explanation. Use the Intersection logic: Compare their Grades (IQ) vs their Likert Answers (EQ). If their skills match their highest score, explain why that makes them a natural fit.)

    Follow the exact formatting shown above, and keep comments professionally encouraging, friendly, and concise.
  `;

  try {
    const aiText = await smartGenerate(prompt);
    res.json({ aiText });
  } catch (err) {
    res.status(429).json({ error: "Comment unavailable due to high traffic." });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

/*
  Your tasks/goals are:
  - Generate accurate, positive, and helpful comments for students based strictly on their performance data.
  - Recommend the best college course for a student by analyzing the "Intersection" between their Academic Performance and their Personal Identity (Skills/Personality).
  
  === STUDENT DATA ===
  Academic Performance (Averages): "${JSON.stringify(courseAverages, null, 2)}"
  Skills: "${skills.join(", ")}"
  Personality Traits: "${personality.join(", ")}"

  === MISSION ===
  1. Analyze the performance for each course.
  2. Compare the student's highest-scoring courses against their skills.
  3. If a student is good at a course (e.g., CITCS) but has a skill for another (e.g., Artistic), suggest how they can combine them (e.g., UI/UX Design or Game Art).
  4. If a skill directly matches a high-scoring course, call it a "PERFECT MATCH."

  === OUTPUT FORMAT ===
  For EACH course entry:
  Course: <course name> — Average Score: <average score>
  > Comment: A positive and accurate reflection of the student’s average score for that course. Highlight strengths and give constructive guidance. Mention how their skills and personality [List relevant skills and personality] helped them or could help them here.
  > Suggestion: A clear, practical recommendation on how the student can further improve or continue growing in this area. If they have a skill unrelated to this course, suggest they try a course that fits that skill too.

  === DISCOVERY & COMPARISON ===
  Strategic Recommendations:
  > Based on your skill "[Skill Name]", you should try the [Course Name] quiz. This will help us compare your technical ability with your creative potential for a more accurate final result.
  > (Provide 1-2 suggestions if they have skills that match courses they haven't taken yet.)

  === FINAL RECOMMENDATION ===
  Top Recommended Course:
  > <course name> — Average Score: <average score>%
  > Why it fits you: (Provide a deep explanation. Compare the top 2 courses if they are close. If their skills match their highest score, explain why that makes them a natural fit. If their skills are "Artistic" but their best score is "CITCS", suggest they pursue "CITCS" with a focus on "Arts".)

  Follow the exact formatting shown above, and keep comments professionally encouraging, friendly, and concise.
*/