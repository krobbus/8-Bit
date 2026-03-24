const roleSelect = document.getElementById("roleSelect");
const idInput = document.getElementById("inputId");
const passwordInput = document.getElementById("inputPassword");
const passInput = document.getElementById("inputPass");
const togglePassBtn = document.getElementById("togglePass");

const popupOverlay = document.getElementById("popupOverlay");
const popupTitle = document.getElementById("popupTitle");
const popupContent = document.getElementById("popupContent");
const popupClose = document.getElementById("popupClose");

const popupOverlayManual = document.getElementById("popupOverlayManual");
const popupTitleManual = document.getElementById("popupTitleManual");
const popupContentManual = document.getElementById("popupContentManual");
const popupCloseManual = document.getElementById("popupCloseManual");

const loginBtn = document.getElementById("loginButton");
const guestBtn = document.getElementById("startButton");
const msg = document.getElementById("loginMessage");
const loadingScreen = document.getElementById("loadingScreen");

let isHidden = true;
togglePassBtn.addEventListener("click", () => {
  isHidden = !isHidden;
  passwordInput.type = isHidden ? "password" : "text";
  togglePassBtn.querySelector("img").src = isHidden ? "public/assets/WebAssets/PadlockClosed.png" : "public/assets/WebAssets/PadlockOpened.png";
});

msg.style.transition = "opacity 0.5s ease";                                                                    // login message
msg.style.opacity = 0;
function showMessage(text, color = "white", delay = 100) {
  msg.style.opacity = 0;
  setTimeout(() => {
    msg.textContent = text;
    msg.style.color = color;
    msg.style.opacity = 1;
  }, delay);
}

function playAsGuest() {                                                                                      // guest login
  showMessage('Proceeding to the Game...', "lightgreen");

  setTimeout(() => {
    window.location.href = "./Game.html";
  }, 800);
}

async function loginUser() {                                                                                  // permanent player login
  loadingScreen.style.display = "flex";

  const userInput = idInput.value.trim();
  const passInput = passwordInput.value.trim();
  const role = roleSelect.value;

  if (!userInput || !passInput) {
    showMessage("Please fill all fields", "red");
    loadingScreen.style.display = "none";
    return;
  }
  showMessage("Checking account...", "gray");

  try {
    let userData = null;
    let finalPlayerID = null;

    const isEmail = userInput.includes(".");
    if (isEmail) {
      const emailQuery = await db.ref("webGame")
        .orderByChild("email")
        .equalTo(userInput)
        .once("value");

      if (emailQuery.exists()) {
        const results = emailQuery.val();
        finalPlayerID = Object.keys(results)[0]; 
        userData = results[finalPlayerID];
      }
    } else {
      const idSnapshot = await db.ref("webGame/" + userInput).once("value");
      if (idSnapshot.exists()) {
        userData = idSnapshot.val();
        finalPlayerID = userInput;
      }
    }

    if (!userData) {
      showMessage("Player ID/Email not found.", "lightcoral");
      loadingScreen.style.display = "none";
      return;
    }

    if (userData.temporary) {
      showMessage("Guest accounts cannot log in permanently.", "lightcoral");
      loadingScreen.style.display = "none";
      return;
    }

    if (userData.pass !== passInput) {
      showMessage("Incorrect Password.", "lightcoral");
      loadingScreen.style.display = "none";
      return;
    }

    if (role === "admin" && userData.adminMode !== true) {                                                    // role restriction
      showMessage("You are not allowed to access Admin Mode.", "red");
      loadingScreen.style.display = "none";
      return;
    }

    if (role === "player" && userData.playerMode !== true) {
      showMessage("You are not a Player.", "red");
      loadingScreen.style.display = "none";
      return;
    }

    localStorage.setItem("playerID", finalPlayerID);
    showMessage("Login successful! Redirecting...", "lightgreen");

    setTimeout(() => {
      loadingScreen.classList.add("fade-out");

      setTimeout(() => {
        loadingScreen.style.display = "none";
        if (role === "admin") window.location.href = "admin-dashboard.html";
        else { 
          window.location.href = "./Game.html";
          localStorage.setItem("startScene", "LeftWing");
        };
      }, 500);
    }, 300);

  } catch (error) {
    console.error("Error:", error);
    showMessage("Error checking account. Try again later.", "lightcoral");
    loadingScreen.style.display = "none";
  }
}

guestBtn.addEventListener("click", (e) => {                                                                  // guest and login buttons
  e.preventDefault();
  playAsGuest();
});

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  loginUser();
});

function renderSteps(currentStep) {
  return `
    <section class="fpSteps">
      <section class="fpStep ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "done" : ""}">1</section>
      <section class="fpStep ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "done" : ""}">2</section>
      <section class="fpStep ${currentStep >= 3 ? "active" : ""}">3</section>
    </section>
  `;
}

function forgotPassword() {                                                                                    // password recovery popup
  popupOverlay.style.display = "flex";
  popupTitle.textContent = "PASSWORD RECOVERY";

  popupContent.innerHTML = `
    ${renderSteps(1)}

    <h3 style="text-align: center;">Recover Password</h3>
    <p>Enter your Player ID to continue.</p>

    <input id="fpId" type="text" placeholder="Enter your ID" style="
      width: auto;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 6px;
      border: 5px solid black;
      font-family: 'Jersey 10';
      font-size: 2rem;
    ">

    <button id="fpNext" style="
      padding: 1rem; 
      cursor: pointer; 
      font-family: 'Jersey 10';
      font-size: 2rem;
      border: 5px solid black;
      
      transition: transform 0.3s ease-in-out;
    ">Continue</button>

    <p id="fpMessage" style="font-size: 2rem;"></p>
  `;
  popupContent.style.display = "flex";
  popupContent.style.flexDirection = "column";
  popupContent.style.justifyContent = "center";

  document.getElementById("fpNext").onclick = async () => {
    const playerID = document.getElementById("fpId").value.trim();
    
    if (!playerID) {
      fpMessage("Please enter an ID.", "red");
      return;
    }

    const snapshot = await db.ref("webGame/" + playerID).once("value");
    const data = snapshot.val();

    if (!data) {
      fpMessage("Account not found.", "red");
      return;
    }

    // go to pin verification
    fpMessage("ID verified! Proceeding...", "green");
    setTimeout(() => {
      showPinStep(playerID, data.pin);
    }, 700);
  };
}

function fpMessage(text, color = "red") {                                                                       // forgot pass message
  const box = document.getElementById("fpMessage");
  if (!box) return;

  box.style.display = "block";
  box.style.transition = "opacity 0.5s ease, height 0.5s ease";
  box.style.opacity = 0;

  setTimeout(() => {
    box.textContent = text;
    box.style.color = color;
    box.style.opacity = 1;
  }, 50);

  setTimeout(() => {
    box.style.opacity = 0;
    setTimeout(() => {
      box.style.display = "none";
    }, 500);

  }, 2000);
}

function showPinStep(playerID, correctPIN) {
  popupTitle.textContent = "PASSWORD RECOVERY";

  popupContent.innerHTML = `
    ${renderSteps(2)}

    <h3 style="text-align: center;">Verify PIN</h3>
    <p>Enter the 4-digit PIN for this account.</p>

    <section style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
      <input id="fpPin" type="password" maxlength="4" placeholder="Enter PIN" style="
        padding: 1rem;
        border-radius: 6px;
        border: 5px solid black;
        font-family: 'Jersey 10';
        font-size: 2rem;
      ">

      <img id="fpPinToggle" 
           src="public/assets/WebAssets/padlock-closed.png" 
           style="width: 40px; height: 40px; cursor: pointer;">
    </section>

    <button id="fpCheckPin" style="
      padding: 8px 15px; 
      border: 5px solid black;
      cursor:pointer; 
      font-family: 'Jersey 10';
      font-size: 2rem;
    ">Verify PIN</button>

    <p id="fpMessage" style="font-size: 2rem;"></p>
  `;

  const pinInput = document.getElementById("fpPin");
  const toggleBtn = document.getElementById("fpPinToggle");
  let hidden = true;

  toggleBtn.addEventListener("click", () => {
    hidden = !hidden;
    pinInput.type = hidden ? "password" : "text";
    toggleBtn.src = hidden
      ? "public/assets/WebAssets/PadlockClosed.png"
      : "public/assets/WebAssets/PadlockOpened.png";
  });

  document.getElementById("fpCheckPin").onclick = () => {
    const pin = document.getElementById("fpPin").value.trim();

    if (pin !== correctPIN) {
      fpMessage("Incorrect Pin.", "red");
      return;
    }

    // go to reset password
    fpMessage("PIN verified! Proceeding...", "green");
    setTimeout(() => {
      showNewPasswordStep(playerID);
    }, 700);
  };
}

function showNewPasswordStep(playerID) {
  popupTitle.textContent = "PASSWORD RECOVERY";
  
  popupContent.innerHTML = `
    ${renderSteps(3)}

    <h3 style="text-align: center;">Reset Password</h3>
    <p>Enter your new password below.</p>

    <section style="display: flex; justify-content: center; align-items: center; gap: 10px;">
      <input id="fpNewPass" type="password" placeholder="New Password" style="
        padding: 1rem;
        border-radius: 6px;
        border: 5px solid black;
        font-family: 'Jersey 10';
        font-size: 2rem;
      ">

      <img id="fpPassToggle"
           src="public/assets/WebAssets/padlock-closed.png" 
           style="width: 40px; height: 40px; cursor: pointer;">
    </section>

    <section class="restrictionWrapper" style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem; font-size: 1.5rem; font-style: italic;">
      <p id="countRestriction" style="color: red">[5-10]</p>
      <p id="charRestriction" style="color: red">[a-Z & 0-9]</p>
    </section>

    <button id="fpSavePass" style="
      padding: 8px 15px; 
      border: 5px solid black;
      cursor:pointer; 
      font-family: 'Jersey 10';
      font-size: 2rem;
    ">Save Password</button>

    <p id="fpMessage" style="font-size: 2rem;"></p>
  `;
  const newPassInput = document.getElementById("fpNewPass");
  const countText = document.getElementById("countRestriction");
  const charText = document.getElementById("charRestriction");
  const toggleBtn = document.getElementById("fpPassToggle");
  let hidden = true;

  function validate() {
    const val = newPassInput.value;

    const isCorrectLength = val.length >= 5 && val.length <= 10;
    countText.style.color = isCorrectLength ? "green" : "red";

    const charRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]+$/;
    const isCorrectChars = charRegex.test(val);
    charText.style.color = isCorrectChars ? "green" : "red";

    return isCorrectLength && isCorrectChars;
  }
  newPassInput.addEventListener("input", validate);

  toggleBtn.addEventListener("click", () => {
    hidden = !hidden;
    newPassInput.type = hidden ? "password" : "text";
    toggleBtn.src = hidden
      ? "public/assets/WebAssets/padlock-closed.png"
      : "public/assets/WebAssets/padlock-opened.png";
  });

  document.getElementById("fpSavePass").onclick = async () => {
    const newPass = document.getElementById("fpNewPass").value.trim();

    if (!/^[A-Za-z0-9]{5,10}$/.test(newPass)) {
      fpMessage("Invalid Password.", "gray");
      return;
    }

    await db.ref("webGame/" + playerID + "/pass").set(newPass);

    popupContent.innerHTML = `<h3 style="color: green; font-size: 2rem; margin: 2rem;">Password Updated!</h3>`
    fpMessage("Your password has been reset successfully.", "green");
  };
}

function manualDisplay() {
  popupOverlayManual.style.display = "flex";
  popupTitleManual.textContent = "PLAYER MANUAL";

  popupContentManual.innerHTML = `
    <style>
      *{
        scroll-behavior: smooth;
      }

      #manual-wrapper {
        color: black;
        font-family: "Jersey 10";
        padding: 1rem;
        line-height: 1.5;
      }

      .content-column {
        width: 80%;
        margin: 0 auto; 
        text-align: left;
      }

      #game-title{
        text-align: justify;
        text-transform: uppercase;
        text-shadow: 
          0 0 5px black,
          0 0 10px black,
          0 0 15px black;
        letter-spacing: 4px;
        color: aliceblue;
        user-select: none;
      }

      h4{
        background: rgb(0, 0, 0, 0.2);
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
      }

      .note{
        text-align: left;
        font-style: italic;
        padding-left: 1rem;
      }
      
      .table-of-contents-ol{
        width: fit-content;
        margin: auto;
        list-style-position: outside;
        list-style-type: upper-roman;
      }
      
      .manual-list-ol {
        padding-left: 4rem;
        list-style-position: outside;
        list-style-type: upper-roman;
      }

      .manual-list-ul {
        padding-left: 3rem;
        list-style-position: outside;
        list-style-type: square;
      }

      .manual-list-ul li, .manual-list-ol li {
        margin-bottom: 5px;
        display: list-item;
      }

      .table-of-contents-ol li a{
        text-decoration: underline;
        color: black;
        cursor: pointer;
      }

      @media screen and (max-width: 700px) {
        .content-column { width: 100%; }
        #game-title { font-size: 1rem; }
        .manual-list-ol { padding-left: 0.5rem }
        .manual-list-ul { padding-left: 0 }
      }
    </style>

      <br>

    <section id="manual-wrapper">
      <section class="content-column">
        <h2 id="game-title">
          An AI-Driven 8-bit Web Game for Personalized College Program Matching and Career Exploration
        </h2>
          <br>

        <h4>INTRODUCTION</h4>
          <br>
        <p style="text-align: justify; text-indent: 50px;">
          This user manual is designed to guide players in understanding and navigating the AI-driven 8-bit web game 
          for personalized college program matching and career exploration. The game uses an interactive, retro-style 
          environment combined with artificial intelligence to help players explore suitable college programs and career 
          paths based on their interests, personality, skills, and in-game decisions.
        </p>
          <br>
        
        <h4>TABLE OF CONTENTS</h4>
          <br>
        <ol class="table-of-contents-ol">
          <li><a href="#system-requirements">SYSTEM REQUIREMENTS</a></li>
          <li><a href="#login-features">LOGIN FEATURES</a></li>
          <li><a href="#dashboard-overview">DASHBOARD OVERVIEW</a></li>
          <li><a href="#gameplay-overview">GAMEPLAY OVERVIEW</a></li>
          <li><a href="#profile-management">PROFILE MANAGEMENT</a></li>
          <li><a href="#security-features">SECURITY FEATURES</a></li>
          <li><a href="#logout-procedure">LOGOUT PROCEDURE</a></li>
          <li><a href="#tips-for-players">TIPS FOR PLAYERS</a></li>
          <li><a href="#conclusion">CONCLUSION</a></li>
        </ol>
          <br>

        <h4 id="system-requirements">SYSTEM REQUIREMENTS</h4>
          <br>
        <ul class="manual-list-ul">
          <li>A device with a web browser (Google Chrome, Mozilla Firefox, or Microsoft Edge)</li>
          <li>Stable internet connection</li>
          <li>Desktop, laptop, or mobile device</li>
        </ul>
          <br>
        
        <h4 id="login-features">LOGIN FEATURES</h4>
          <br>
        <p class="note">
          The login screen allows players to enter the game using different options
        </p>
        
        <ol class="manual-list-ol">
          <li>Play As Guest</li>
            <ul class="manual-list-ul">
              <li>Click “Play as a Guest” to immediately enter the game.</li>
              <li>Guest players can explore the game but may have limited access to saving progress.</li>
            </ul>
          <li>Login With An Existing Account</li>
            <ul class="manual-list-ul">
              <li>Select role (Player or Admin). Choose "Player" role.</li>
              <li>Enter your Player ID and Password</li>
              <li>Click “Log In” to proceed</li>
            </ul>
          <li>Forgot Password Feature</li>
            <ul class="manual-list-ul">
              <li>Click “Forgot Password?”</li>
              <li>Enter your Player ID/Admin ID</li>
              <li>Click "Continue"</li>
              <li>Complete the required verification steps</li>
              <li>Create a new password</li>
            </ul>
        </ol>
          <br>
        
        <h4 id="dashboard-overview">DASHBOARD OVERVIEW</h4>
          <br>
        <p class="note">
          After successful login, the player is directed to the Dashboard, which displays essential account information and navigation options. The dashboard shows the following:
        </p>
        
        <ol class="manual-list-ol">
          <li>Profile Overview (View player information)</li>
            <ul class="manual-list-ul">
              <li>Player Avatar</li>
              <li>Player ID</li>
              <li>Player Name</li>
              <li>Player Password</li>
              <li>Player PIN (For Password Recovery Feature)</li>
              <li>Player Gender</li>
            </ul>
          <li>Statistics Overview (View gameplay progress and performance)</li>
            <ul class="manual-list-ul">
              <li>Leaderboard</li>
              <li>Progress</li>
              <li>Scores</li>
              <li>Skills & Personality Traits</li>
              <li>AI Comment & Suggestions</li>
            </ul>
          <li>Play Courses (Start game levels and career exploration activities)</li>
          <li>Actions (Account-related actions)</li>
            <ul class="manual-list-ul">
              <li>Reset Progress (For Progress, Scores, and AI Comment & Suggestions)</li>
              <li>Edit Acccount Information (Redirecting to Account Management Page)</li>
              <li>Edit Personalization (Redirecting to Personalization Page)</li>
              <li>Delete Account</li>
            </ul>
        </ol>
          <br>

        <h4 id="gameplay-overview">GAMEPLAY OVERVIEW</h4>
          <br>
        <ul class="manual-list-ul">
          <li>Players interact with the game using choices</li>
          <li>Multiple-choice and Identification Quiz; Skill and Personality Test available</li>
          <li>Decisions made in the game influence AI-based recommendations</li>
          <li>The AI system analyzes player responses to suggest suitable college programs and career paths</li>
        </ul>
          <br>
        
        <h4 id="profile-management">PROFILE/ACCOUNT MANAGEMENT</h4>
          <br>
        <p class="note">Players can:</p>
        
        <ul class="manual-list-ul">
          <li>View personal details in Dashboard</li>
          <li>Update and manage personal details in Player Personalization Page</li>
          <li>Secure their account information</li>
        </ul>
          <br>

        <h4 id="security-features">SECURITY FEATURES</h4>
          <br>
        <ul class="manual-list-ul">
          <li>Login authentication ensures secure access</li>
          <li>For viewing, players can hide their password and PIN</li>
          <li>Password recovery system assists users who forget credentials</li>
        </ul>
          <br>

        <h4 id="logout-procedure">LOGOUT PROCEDURE</h4>
          <br>
        <p class="note">
          Guest accounts are automatically deleted on logout. Save your account to prevent data loss (you must play first 1 quiz). To safely exit the game:
        </p>
        
        <ul class="manual-list-ul">
          <li>Click "Logout" from the navigation menu</li>
          <li>The system will redirect you to the login screen</li>
        </ul>
          <br>

        <h4 id="tips-for-players">TIPS FOR PLAYERS</h4>
          <br>
        <ul class="manual-list-ul">
          <li>Answer questions honestly to receive accurate AI recommendations</li>
          <li>Explore different game paths to discover various career options</li>
          <li>Review statistics to track progress and improvement</li>
          <li>Use specific, professional terms for skills and personality traits to ensure successful AI validation</li>
          <li>Verify that your selected traits accurately reflect your strengths for a more personalized career analysis</li>
        </ul>
          <br>

        <h4>CONCLUSION</h4>
          <br>
        <p style="text-align: justify; text-indent: 50px;">
          This AI-driven 8-bit webgame provides an engaging and educational way for players to explore college programs 
          and career options. By following this user manual, players can easily navigate the system, understand game features, 
          and maximize their learning experience.
        </p>
      </section>
    </section>
  `;
  popupContentManual.style.display = "flex";
  popupContentManual.style.flexDirection = "column";
  popupContentManual.style.justifyContent = "center";
}

popupClose.addEventListener("click", () => {
  popupOverlay.style.display = "none";
});

popupCloseManual.addEventListener("click", () => {
  popupOverlayManual.style.display = "none";
});

window.addEventListener("load", () => {                                                                       // load
  loadingScreen.classList.add("fade-out");

  localStorage.clear();
  setTimeout(() => {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => (loadingScreen.style.display = "none"), 500);
  }, 300);
});