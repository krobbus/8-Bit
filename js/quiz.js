const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:10000' 
    : 'https://eight-bit-backend.onrender.com';

const scoreDisplay = document.getElementById("score");
const progressBar = document.getElementById("progress-bar");

const question = document.getElementById("question");
const options = document.getElementById("options");
const note = document.getElementById("note");
const resultContainer = document.getElementById("result-container");
const result = document.getElementById("result");

const nextBtn = document.getElementById("next-btn");
const retryBtn = document.getElementById("retry-btn");
const skipTestBtn = document.getElementById("skip-test-btn");
const exitBtn = document.getElementById("exit-btn");

// quiz setup
const params = new URLSearchParams(window.location.search);
const selectedCourse = params.get("course");
const selectedType = params.get("type");

let courseQuestions = [];
let currentQuestion = 0;
let score = 0;
let selectedOption = null;
let quizFinished = false;

async function loadQuestions() {
  courseQuestions = [];
  quizFinished = false;

  if (!selectedCourse || !selectedType) {
    alert("Error: No course or quiz type selected. Returning to lobby.");
    window.location.href = "lobby.html";
    return;
  }

  nextBtn.classList.add("is-loading");
  nextBtn.textContent = "Next";
  nextBtn.disabled = true;
  question.textContent = "AI is preparing your full quiz...";
  note.innerHTML = "<p><em>Please wait for a moment...</em></p>";
  resultContainer.classList.add("is-visible");
  result.style.display = "flex";
  result.style.justifyContent = "center";
  result.innerHTML = `<p style="font-style: italic;">Waiting for your answer...</p>`;

  const isTest = ["personality", "skill"].includes(selectedType);
  const endpoint = isTest ? '/api/generate-test-questions' : '/api/generate-quiz-questions';

  try {
    console.log(`Fetching from: ${endpoint} with`, { courseName: selectedCourse, quizType: selectedType });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseName: selectedCourse, quizType: selectedType })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown Server Error" }));
      throw new Error(errorData.error || `Server Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.questions && data.questions.length > 0) {
      courseQuestions = data.questions;

      if (["multipleChoice", "identification"].includes(selectedType)) {
        courseQuestions = courseQuestions.map(q => ({
          question: q.question,
          options: q.options || [],
          answer: q.answer,
          explanation: q.explanation,
          hint: q.hint
        }));
      }

      nextBtn.classList.remove("is-loading");
      nextBtn.textContent = "Next";
      note.innerHTML = `<p style='color: lightgreen;'>${isTest ? 'Test' : 'Quiz'} Ready!</p>`;

      if (typeof isAdminMode === "function") {
        setupAdminUI();
      }

      loadQuestion();
    } else { 
      throw new Error("Empty questions list"); 
    }
  } catch (err) {
    handleLoadError();
  }
}

function handleLoadError() {
  question.textContent = "AI is resting...";
  note.innerHTML = "<p style='color: #f44336;'>Unable to generate quiz at this moment.</p>";
  
  result.style.display = "none"; 
  resultContainer.classList.remove("is-visible");
  options.innerHTML = "";
  
  // Change Next button to a Finish/Exit button
  nextBtn.classList.remove("is-loading");
  nextBtn.textContent = "Go Back To Lobby";
  nextBtn.onclick = () => { window.location.href = "lobby.html"; };

  setTimeout(() => {
    options.innerHTML = `<button class="retry-all-btn" onclick="location.reload()">Retry Now</button>`;
  }, 1000);
}

function loadQuestion() {
  const q = courseQuestions[currentQuestion];
  if (!q) return;

  nextBtn.classList.add("is-loading");
  nextBtn.textContent = "Next";
  nextBtn.disabled = true;
  resultContainer.classList.add("is-visible");
  note.innerHTML = "";
  selectedOption = null;
  question.textContent = q.question;
  options.innerHTML = "";

  const isTest = ["personality", "skill"].includes(selectedType);

  // detect if question has multiple-choice options or is identification type
  if (selectedType === "multipleChoice" || isTest) {
    const displayOptions = isTest ? (q.options || ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]) : q.options;

    displayOptions.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.classList.add("option-btn");
      btn.onclick = () => handleAnswer(opt, q.answer, btn);
      options.appendChild(btn);
    });
  } else {
    // identification type
    const inputContainer = document.createElement("section");
    inputContainer.classList.add("input-container");
    const input = document.createElement("input");
    input.type = "text";
    input.id = "id-input-field";
    input.placeholder = "Type your answer here...";
    input.classList.add("identification-input");

    const btnContainer = document.createElement("section");
    btnContainer.classList.add("btn-container");
    btnContainer.style.width = "100%";
    
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit Answer";
    submitBtn.classList.add("submit-btn");
    submitBtn.style.width = "100%";

    // hint button
    const hintBtn = document.createElement("button");
    hintBtn.textContent = "Reveal Hint";
    hintBtn.classList.add("hint-btn");
    hintBtn.style.width = "100%";
    hintBtn.style.backgroundColor = "#ff9900";

    const hintDisplay = document.createElement("p");
    hintDisplay.classList.add("hint-display");
    hintDisplay.style.display = "none";
    hintDisplay.style.fontStyle = "italic";
    hintDisplay.style.color = "white";
    hintDisplay.textContent = q.hint || `Think about the core concepts of ${selectedCourse}.`;

    hintBtn.onclick = async () => {
      hintDisplay.style.display = "block";
      hintBtn.style.display = "none";
    }

    submitBtn.onclick = async () => {
      const userAnswer = input.value.trim();
      if (!userAnswer) return alert("Please enter your answer first!");

      handleAnswer(input.value.trim(), q.answer, null);

      input.disabled = true;
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.5";
      submitBtn.style.cursor = "not-allowed";
      nextBtn.classList.remove("is-loading");
    };

    options.appendChild(input);
    options.appendChild(submitBtn);
    options.appendChild(hintBtn);
    options.appendChild(hintDisplay);
  }
}

// helper to check if the answer is "close enough" (for identification only)
function isAcceptable(userInput, correctInput) {
  const user = userInput.toLowerCase().trim();
  const correct = correctInput.toLowerCase().trim();

  if (user === correct) return true;
  if (Math.abs(user.length - correct.length) > 1) return false;

  let mistakes = 0;
  let i = 0, j = 0;
  while (i < user.length && j < correct.length) {
    if (user[i] !== correct[j]) {
      mistakes++;
      if (user.length > correct.length) i++;
      else if (user.length < correct.length) j++;
      else { i++; j++; }
    } else {
      i++; j++;
    }
  }
  mistakes += (user.length - i) + (correct.length - j);
  return mistakes <= 1;
}

// handle answer
async function handleAnswer(userAnswer, correctAnswer, btn) {
  if (selectedOption || userAnswer === "") return;
  selectedOption = btn || true;

  nextBtn.disabled = false;
  nextBtn.classList.remove("is-loading");
  nextBtn.textContent = "Next";

  const q = courseQuestions[currentQuestion];
  const isTest = ["personality", "skill"].includes(selectedType);

  // disable buttons and dim non-selected ones
  Array.from(options.querySelectorAll("button, input")).forEach(el => {
    el.disabled = true;
    if (el !== btn) el.style.opacity = "0.5"; // Dim non-selected options
  });
  
  // save user response
  courseQuestions[currentQuestion].userResponse = userAnswer;

  if (isTest) {
    // test logic (personality/skill)
    if (btn) btn.style.backgroundColor = "#4A90E2";
    result.innerHTML = `<p>Selection recorded: <strong>${userAnswer}</strong></p>`;

    const likertMap = { "Strongly Disagree": 1, "Disagree": 2, "Neutral": 3, "Agree": 4, "Strongly Agree": 5 };
    if(likertMap[userAnswer]) {
      courseQuestions[currentQuestion].value = likertMap[userAnswer];
    }
    
    if (btn) btn.style.backgroundColor = "#4A90E2";
    note.innerHTML = "<p>Response recorded. Click next to continue.</p>";
    nextBtn.classList.remove("is-loading");
    nextBtn.textContent = "Next";
  } else {
    // quiz logic (multiple choice/identification)
    const cleanUserAnswer = userAnswer.toLowerCase().trim();
    const cleanCorrect = correctAnswer.toLowerCase().trim();

    let isCorrect = isAcceptable(cleanUserAnswer, cleanCorrect);

    if (!isCorrect && q.variants && Array.isArray(q.variants)) {
      isCorrect = q.variants.some(variant => isAcceptable(userAnswer, variant));
    }
    courseQuestions[currentQuestion].isCorrect = isCorrect;
    if (isCorrect) score++;
    scoreDisplay.textContent = `SCORE: ${score}`;

    const idInput = document.getElementById("id-input-field");
    if (idInput) {
      idInput.style.borderColor = isCorrect ? "#4CAF50" : "#f44336";
    } 
    if (btn) btn.style.backgroundColor = isCorrect ? "#4CAF50" : "#f44336";
    const feedbackText = isCorrect ? `Correct! Your Answer: ${userAnswer}` : `Incorrect!\nThe Correct Answer: ${correctAnswer}`;

    let formattedAI = q.explanation;
    if (!formattedAI.trim().startsWith("Explanation:")) {
      formattedAI = `Explanation: ${formattedAI}`;
    }

    try {
      note.innerHTML = "<p><em>AI is generating deeper feedback...</em></p>";
      displayFeedback(formattedAI, feedbackText);
      note.innerHTML = "";
    } catch (err) { 
      console.error("Feedback error: ", err);
      displayFeedback("Sorry, the AI could not generate detailed feedback right now.", feedbackText);
    } finally {
      nextBtn.classList.remove("is-loading");
      nextBtn.textContent = "Next";
    }
  }
}

exitBtn.addEventListener("click", () => {
  const confirmExit = confirm("Are you sure you want to exit the quiz? Your progress will not be saved.");
  if (confirmExit) {
    window.location.href = "lobby.html";
  }
});

retryBtn.addEventListener("click", async (userAnswer, correctAnswer, btn) => {
  const q = courseQuestions[currentQuestion];

  if (!q || !q.explanation) {
    result.innerHTML = "<p style='color: #ff4444;'>No explanation data found in this quiz.</p>";
    return;
  }

  if (isCorrect) score++;
  const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  if (btn) btn.style.backgroundColor = isCorrect ? "#4CAF50" : "#f44336";
  const feedbackText = isCorrect ? "Correct!" : `Incorrect!\nThe Correct Answer: ${correctAnswer}`;

  displayFeedback(aiText, feedbackText);
  retryBtn.style.display = "none";
});

function displayFeedback(aiText, feedbackText) {
  if (quizFinished) return;

  result.innerHTML = "";
  result.style.display = "flex";

  if (!aiText) {
    result.innerHTML = `<p>${feedbackText}</p><p>Explanation missing.</p>`;
    retryBtn.style.display = "block";
    return;
  }

  const sections = aiText.split(/\n(?=Explanation:|Source:|URL:)/);
  result.innerHTML = "";

  const container = document.createElement("section");
  container.className = "feedback-container";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "0.8rem";

  const header = document.createElement("h3");
  header.textContent = feedbackText;
  header.style.marginBottom = "0.5rem";
  container.appendChild(header);
  
  sections.forEach(sec => {
    const trimmedSec = sec.trim();
    if (!trimmedSec) return;

    const section = document.createElement("section");
    section.className = "feedback-section";

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrls = trimmedSec.match(urlRegex);

    if (trimmedSec.startsWith("Explanation:")) {
      const text = trimmedSec.replace("Explanation:", "").trim();
      section.innerHTML = `<strong>Explanation:</strong> ${text}`;
    } else if (trimmedSec.startsWith("Source:") || trimmedSec.startsWith("URL:")) {
      const label = trimmedSec.startsWith("Source:") ? "Source" : "URL";
      let textContent = trimmedSec.replace(`${label}:`, "").trim();

      if (foundUrls) {
        const url = foundUrls[0];
        const cleanText = textContent.replace(url, "").trim();
        
        section.innerHTML = `
          <strong>${label}:</strong> ${cleanText} 
          ${cleanText ? '<br>' : ''}
          <a href="${url}" target="_blank" class="feedback-link">${url}</a>
        `;
      } else {
        section.innerHTML = `<strong>${label}:</strong> ${textContent}`;
      }
    } else {
      section.textContent = trimmedSec;
    }

    container.appendChild(section);
  });
  result.appendChild(container);
  resultContainer.classList.add("is-visible");
}

function setupAdminUI() {                         //for testing (admin)
  const total = courseQuestions.length;
  isAdminMode((admin) => {
    if (admin) {
      skipTestBtn.style.display = "block";

      // +1 and -1 buttons
      const adjustContainer = document.createElement("section");
      adjustContainer.style.position = "fixed";
      adjustContainer.style.bottom = "70px";
      adjustContainer.style.right = "20px";
      adjustContainer.style.zIndex = "9999";

      // layout
      adjustContainer.style.display = "flex";
      adjustContainer.style.alignItems = "center";
      adjustContainer.style.gap = "8px";

      const scoreDisplay = document.createElement("span");
      scoreDisplay.style.background = "#ff3333";
      scoreDisplay.style.borderRadius = "6px";
      scoreDisplay.style.color = "white";
      scoreDisplay.style.padding = "8px 12px";
      scoreDisplay.style.width = "150px";
      scoreDisplay.style.textAlign = "center";

      const baseBtnStyle = `
        padding:10px 15px;
        background:#ff3333;
        color:white;
        border:none;
        border-radius:6px;
        cursor:pointer;
      `;

      const minusBtn = document.createElement("button");
      minusBtn.textContent = "-1";
      minusBtn.style.cssText = baseBtnStyle;

      const plusBtn = document.createElement("button");
      plusBtn.textContent = "+1";
      plusBtn.style.cssText = baseBtnStyle;

      adjustContainer.appendChild(minusBtn);
      adjustContainer.appendChild(plusBtn);
      adjustContainer.appendChild(scoreDisplay);

      // insert before skip button
      skipTestBtn.parentElement.insertBefore(adjustContainer, skipTestBtn);

      let tempScore = 0;
      scoreDisplay.textContent = ` Score: ${tempScore}/${total}`;

      // button logic
      minusBtn.addEventListener("click", () => {
        if (tempScore > 0) tempScore--;
        scoreDisplay.textContent = ` Score: ${tempScore}/${total}`;
      });

      plusBtn.addEventListener("click", () => {
        if (tempScore < total) tempScore++;
        scoreDisplay.textContent = ` Score: ${tempScore}/${total}`;
      });

      skipTestBtn.addEventListener("click", async () => {
        const confirmSkip = confirm(`Skip quiz and save score ${tempScore}/${total}?`);
        if (!confirmSkip) return;

        const course = selectedCourse;
        const type = selectedType;

        await saveQuizScoreToFirebase(course, type, tempScore, total);
        alert(`Test Mode: Saved score ${tempScore}/${total} to Firebase`);

        window.location.href = "dashboard.html";
      });

    } else {
      skipTestBtn.style.display = "none";
    }
  });
}

function showReviewSummary() {
  question.textContent = "";
  options.innerHTML = "";
  note.innerHTML = "";
  resultContainer.classList.remove("is-visible");

  const isTest = ["personality", "skill"].includes(selectedType);

  const summaryTitle = document.createElement("h2");
  summaryTitle.textContent = "Final Review";
  summaryTitle.style.textAlign = "center";
  summaryTitle.style.color = "deepskyblue";
  options.appendChild(summaryTitle);

  const reviewList = document.createElement("section");
  reviewList.className = "review-list";

  courseQuestions.forEach((q, index) => {
    const card = document.createElement("section");

    if (isTest) {
      card.className = "review-card test-mode";
      card.innerHTML = `
        <h3>Question ${index + 1}: ${q.question}</h3>
        <p><strong>Your Answer: </strong><span style="color: #4CAF50">${q.userResponse || "No Answer"}</span></p>
      `;
    } else {
      const userAns = q.userResponse || "";
      const correctAns = q.answer || "";
      const isCorrect = isAcceptable(userAns, correctAns);
      card.className = `review-card ${isCorrect ? 'correct' : 'incorrect'}`;

      card.innerHTML = `
        <h3>Question ${index + 1}: ${q.question}</h3>
        <p><strong>Your Answer: </strong><span style="color: ${isCorrect ? "#4CAF50" : "#f44336"}">${q.userResponse || "No Answer"}</span></p>
        ${!isCorrect ? `<p><strong>Correct Answer: </strong>${q.answer}</p>` : ""}
        <hr style="border: 0; border-top: 1px solid #444; margin: 10px 0;">
      `;

      const explanationContainer = document.createElement("section");
      explanationContainer.className = "explanation-text";
      
      if (q.explanation) {
        const sections = q.explanation.split(/\n(?=Explanation:|Source:|URL:)/);
        
        sections.forEach(sec => {
          const trimmedSec = sec.trim();
          if (!trimmedSec) return;

          const sectionPart = document.createElement("section");
          sectionPart.className = "feedback-section";

          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const foundUrls = trimmedSec.match(urlRegex);

          if (trimmedSec.startsWith("Explanation:")) {
            sectionPart.innerHTML = `<strong>Explanation:</strong> ${trimmedSec.replace("Explanation:", "").trim()}`;
          } else if (trimmedSec.startsWith("Source:") || trimmedSec.startsWith("URL:")) {
            const label = trimmedSec.startsWith("Source:") ? "Source" : "URL";
            let textContent = trimmedSec.replace(`${label}:`, "").trim();

            if (foundUrls) {
              const url = foundUrls[0];
              const cleanText = textContent.replace(url, "").trim();
              sectionPart.innerHTML = `
                <strong>${label}:</strong> ${cleanText} 
                ${cleanText ? '<br>' : ''}
                <a href="${url}" target="_blank" class="feedback-link">${url}</a>
              `;
            } else {
              sectionPart.innerHTML = `<strong>${label}:</strong> ${textContent}`;
            }
          } else {
            sectionPart.textContent = trimmedSec;
          }
          explanationContainer.appendChild(sectionPart);
        });
      }
      card.appendChild(explanationContainer);
    }
    reviewList.appendChild(card);
  });
  options.appendChild(reviewList);
}

nextBtn.addEventListener("click", async () => {
  if (quizFinished) return;
  nextBtn.classList.add("is-loading");

  currentQuestion++;

  if (currentQuestion < courseQuestions.length) {
    loadQuestion();
  } else {
    quizFinished = true;
    showReviewSummary();

    const isTest = ["personality", "skill"].includes(selectedType);

    if (!isTest) {
      const scoreBanner = document.createElement("section");
      scoreBanner.className = "score-banner";
      scoreBanner.innerHTML = `<h2>Final Score: ${score} / ${courseQuestions.length}</h2>`;
      options.prepend(scoreBanner);
    } else {
      const completionBanner = document.createElement("section");
      completionBanner.className = "score-banner";
      completionBanner.innerHTML = `<h2>Test Completed!</h2>`;
      options.prepend(completionBanner);
    }

    const course = params.get("course") || "UnknownCourse";
    const type = params.get("type") || "UnknownType";
    
    await saveQuizScoreToFirebase(course, type, score, courseQuestions);
    createNavigationButtons();
  }
});

// navigation buttons (Dashboard, Lobby)
function createNavigationButtons(){
  const navContainer = document.createElement("section");
  navContainer.style.display = "flex";
  navContainer.style.width = "100%";
  navContainer.style.justifyContent = "center";
  navContainer.style.alignItems = "center";
  navContainer.style.gap = "1rem";
  navContainer.style.marginTop = "1rem";

  const dashboardBtn = document.createElement("button");
  dashboardBtn.textContent = "Go back to Dashboard";
  dashboardBtn.classList.add("btn");
  dashboardBtn.onclick = () => (window.location.href = "dashboard.html");

  const lobbyBtn = document.createElement("button");
  lobbyBtn.textContent = "Go back to Lobby";
  lobbyBtn.classList.add("btn");
  lobbyBtn.style.backgroundColor = "#ff6600";
  lobbyBtn.onclick = () => (window.location.href = "lobby.html");

  navContainer.appendChild(dashboardBtn);
  navContainer.appendChild(lobbyBtn);
  options.appendChild(navContainer);
}

// gemini feedback fetcher
/*
async function getGeminiFeedback(userAnswer, correctAnswer, courseName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAnswer, correctAnswer, courseName })
    });

    const data = await response.json();
    return data.aiText || "No response from Gemini.";
  } catch (err) {
    console.error("Backend error:", err);
    return "Error contacting backend.";
  }
}
*/

/*
async function generateHint(question, answer, courseName, quizType) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/get-hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, courseName, quizType })
    });

    const data = await response.json();
    return data.hint || "No hint available.";
  } catch (err) {
    console.error("Hint error:", err);
    hintBtn.textContent = "Hint not generated";
    return "Hint unavailable.";
  }
}
*/

// save score to firebase
async function saveQuizScoreToFirebase(course, type, score, allQuestions) {
  const playerID = localStorage.getItem("playerID");
  if (!playerID) return;

  try {
    const isTest = ["personality", "skill"].includes(type);

    const detailedLog = allQuestions.map((q, index) => ({
      id: index + 1,
      question: q.question,
      correctAnswer: isTest ? "N/A" : q.answer,
      userResponse: q.userResponse || "No Answer",
      isCorrect: isTest ? true : (q.isCorrect === true),
      explanation: q.explanation || "",
      likertValue: q.value || 0
    }));
    const valueForProgress = isTest ? "Completed" : score;

    await db.ref(`webGame/${playerID}/scores/${course}/${type}`).set(valueForProgress);
    
    const snapshot = await db.ref("webGame/" + playerID).once("value");
    const playerData = snapshot.val() || {};

    // ensure base structure
    const scores = playerData.scores || {};
    const courses = playerData.courses || [];

    let courseProgressMap = playerData.courseProgress || {};
    // initialize missing course & quiz type 
    if (!scores[course]) scores[course] = {
      multipleChoice: 0,
      identification: 0,
      personality: 0, 
      skill: 0
    };
    if (!courses.includes(course)) courses.push(course);

    // Update this quiz type’s score
    scores[course][type] = valueForProgress;

    // progress calcu
    // each course = 4 quiz types (multiple-choice, identification, skill, personality)
    const completedTypes = Object.keys(scores[course]).filter(t => 
      scores[course][t] !== 0 && scores[course][t] !== null && scores[course][t] !== undefined
    ).length;
    const currentCoursePercentage = Math.min((completedTypes / 4) * 100, 100);
    courseProgressMap[course] = currentCoursePercentage;

    // global progress across all courses
    let totalProgress = 0;
    const courseShare = 100 / 8;
    for (const c of Object.keys(scores)) {
      const completed = Object.keys(scores[c]).filter(t => 
        scores[c][t] !== 0 && scores[c][t] !== null && scores[c][t] !== undefined
      ).length;
      totalProgress += (completed / 4) * courseShare;
    }
    totalProgress = Math.min(totalProgress, 100);

    const updates = {};
    updates[`webGame/${playerID}/scores`] = scores;
    updates[`webGame/${playerID}/courses`] = courses;
    updates[`webGame/${playerID}/progress`] = totalProgress;
    updates[`webGame/${playerID}/lastActive`] = Date.now();
    updates[`webGame/${playerID}/quizResults/${course}/${type}`] = {
      timestamp: Date.now(),
      finalScore: score,
      totalQuestions: allQuestions.length,
      details: detailedLog
    };

    await db.ref().update(updates);

    console.log("Full data saved successfully:", { course, type, score, detailedLog });
  } catch (err) {
    console.error("Error updating score:", err);
  }
}

// initialize quiz
document.addEventListener("DOMContentLoaded", () => {
  resultContainer.classList.add("is-visible");
  
  result.innerHTML = "";
  note.innerHTML = "<p><em>Preparing quiz...</em></p>";

  loadQuestions();
});