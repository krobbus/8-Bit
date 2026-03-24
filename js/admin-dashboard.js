const loadingScreen = document.getElementById("loading-screen");
const displayID = document.getElementById("id");
const displayName = document.getElementById("name");

const pinField = document.getElementById("pin-field");
const pinInput = document.getElementById("edit-pin");
const pintoggle = document.getElementById("pin-toggle");

const passField = document.getElementById("pass-field");
const passInput = document.getElementById("edit-pass");
const passtoggle = document.getElementById("pass-toggle");

const usersTableBody = document.querySelector("#users-table tbody");
const restrictEditCheckbox = document.getElementById("restrict-new-users");
const restrictResetCheckbox = document.getElementById("restrict-password-reset");
const backupBtn = document.querySelector("#data-backup button");
const viewLogsBtn = document.querySelector("#system-logs button");

const editModal = document.getElementById("edit-modal");
const closeModal = document.querySelector(".close");
const saveBtn = document.getElementById("save-user-btn");

const popupOverlay = document.getElementById("ai-popup-overlay");
const popupBox = document.getElementById("ai-popup-box");
const popupHeader = document.querySelector("#ai-popup-box h2");
const popupContent = document.getElementById("ai-popup-content");
const popupClose = document.getElementById("ai-popup-close");

const courseNames = {
  CITCS: "College of Information Technology and Computer Studies (CITCS)",
  CCJ: "College of Criminal Justice (CCJ)",
  CBA: "College of Business Administration (CBA)",
  CAS: "College of Arts and Sciences (CAS)",
  CTE: "College of Teacher Education (CTE)",
  COM: "College of Medicine (COM)",
  ISW: "Institute of Social Work (ISW)",
  IPPG: "Institute of Public Policy and Governance (IPPG)"
};

const roleNames = {
  adminMode: "Admin",
  playerMode: "Player"
};

let currentEditingID = null;
let index = 0;

let isPinHidden = true;
let isPassHidden = true;

let leaderboardData = [];
let newUserCount = 0;
let newUsers = [];

// restrictions
const settingsRef = db.ref("webGame/settings");
settingsRef.once("value").then(snapshot => {
  const settings = snapshot.val() || {};

  restrictEditCheckbox.checked = settings.restrictEdit || false;
  restrictResetCheckbox.checked = settings.restrictReset || false;
});

restrictEditCheckbox.addEventListener("change", () => {
  settingsRef.update({ restrictEdit: restrictEditCheckbox.checked })
    .then(() => console.log("restrictEdit updated!"))
    .catch(err => console.error(err));
});

restrictResetCheckbox.addEventListener("change", () => {
  settingsRef.update({ restrictReset: restrictResetCheckbox.checked })
    .then(() => console.log("restrictReset updated!"))
    .catch(err => console.error(err));
});

let existingUsers = new Set();
db.ref("webGame").once("value").then(snapshot => {
  const data = snapshot.val() || {};
  Object.keys(data).forEach(key => {
    if (key !== "settings" && !key.startsWith("Admin_")) {
      existingUsers.add(key);
    }
  });
  window.initialLoadDone = true;
});

function updateLeaderboard() {
  if (!leaderboardData.length) {
    document.getElementById("top-players").innerHTML = "<section>No players available</section>";
    return;
  }

  const hasScores = leaderboardData.some(u => u.average > 0);

  if (!hasScores) {
    document.getElementById("top-players").innerHTML = `<section style="font-size: 2rem; font-style: italic">No one has answered this course yet.</section>`;
    return;
  }

  const sorted = leaderboardData.sort((a, b) => b.average - a.average);
  const topThree = sorted.slice(0, 3);

  const trophies = [
    "css/assets/top-one.png",
    "css/assets/top-two.png",
    "css/assets/top-three.png"
  ];

  const html =
    topThree.length === 0
      ? "<section>No players available</section>"
      : topThree
          .map((u, i) => `
        <section style="font-size: 3rem; display: flex; align-items: center; gap: 1rem;">
          <img src="${trophies[i]}" alt="Trophy ${i + 1}" style="width: 40px; height: 40px;">
          ${u.displayName} (Avg: ${u.average}%)
        </section>
      `)
          .join("");
  document.getElementById("top-players").innerHTML = html;
}

pintoggle.addEventListener("click", (e) => {
  e.preventDefault();
  isPinHidden = !isPinHidden;
  pinInput.type = isPinHidden ? "password" : "text";
  pintoggle.src = isPinHidden ? "css/assets/padlock-closed.png" : "css/assets/padlock-opened.png";
});

passtoggle.addEventListener("click", (e) => {
  e.preventDefault();
  isPassHidden = !isPassHidden;
  passInput.type = isPassHidden ? "password" : "text";
  passtoggle.src = isPassHidden ? "css/assets/padlock-closed.png" : "css/assets/padlock-opened.png";
});

// get average per courses
function getCourseAverage(user, selectedCourse) {
  if (!user.scores) return 0;
  return user.scores[selectedCourse]?.average || 0;
}

// load all users
async function loadUsers() {
  const userPlayerID = localStorage.getItem("playerID");
  displayID.innerText = `Welcome, \n${userPlayerID}!`;
  
  usersTableBody.innerHTML = "<tr><td colspan='15'>Loading...</td></tr>";

  index = 0;

  try {
    const snapshot = await db.ref("webGame").once("value");
    const data = snapshot.val();

    let totalUsers = 0;
    let totalPlayers = 0;
    let totalAdmins = 0;

    if (!data) {
      usersTableBody.innerHTML = "<tr><td colspan='15'>No users found</td></tr>";
      return;
    }

    const getDisplayName = (key, player) => {
      const isGuest = player.accountType === 'guest' || !player.name || player.name.toLowerCase() === "guest";
      return isGuest ? `Guest: ${key.substring(0, 8)}...` : player.name; 
    };

    leaderboardData = Object.entries(data)
      .filter(([key, player]) => key !== "settings" && key !== "logs" && player.scores)
      .map(([key, player]) => ({
        playerID: key,
        displayName: getDisplayName(key, player),
        average: getCourseAverage(player, "CITCS"),
        rawUser: player
      })).filter(item => item.average !== null && item.average > 0);
    updateLeaderboard();

    const courseFilter = document.getElementById("course-filter");
    if (courseFilter) {
      courseFilter.addEventListener("change", (e) => {
        const selectedCourse = e.target.value;

        leaderboardData = leaderboardData.map(item => ({
          ...item,
          average: getCourseAverage(item.rawUser, selectedCourse)
        }));

        updateLeaderboard();
      });
    }

    document.getElementById("total-users").textContent = totalUsers;
    document.getElementById("total-players").textContent = totalPlayers;
    document.getElementById("total-admins").textContent = totalAdmins;

    usersTableBody.innerHTML = "";

    Object.entries(data)
      .filter(([playerID]) => playerID !== "settings" && playerID !== "logs") 
      .forEach(([playerID, user]) => {

      totalUsers++;
      if (user.playerMode) totalPlayers++;
      if (user.adminMode) totalAdmins++;

      index++;

      let displayGender = (user.gender || "N/A").toLowerCase();
      displayGender = displayGender.charAt(0).toUpperCase() + displayGender.slice(1);

      let roles = [];
      if (user.adminMode === true) roles.push("Admin");
      if (user.playerMode === true) roles.push("Player");
      const role = roles.length > 0 ? roles.join(" & ") : "N/A";
      
      // grabbable
      const slider = document.querySelector(".table-wrapper");
      let isDown = false;
      let startX;
      let scrollLeft;

      slider.addEventListener("mousedown", (e) => {
        isDown = true;
        slider.classList.add("active");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;

        slider.style.cursor = "grabbing";
      });

      slider.addEventListener("mouseleave", () => {
        isDown = false;
        slider.classList.remove("active");

        slider.style.cursor = "default";
      });

      slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.classList.remove("active");

        slider.style.cursor = "grab";
      });

      slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1; // scroll speed
        slider.scrollLeft = scrollLeft - walk;
      });

      // touch support
      slider.addEventListener("touchstart", (e) => {
        isDown = true;
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });

      slider.addEventListener("touchend", () => {
        isDown = false;
      });

      slider.addEventListener("touchmove", (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 1;
        slider.scrollLeft = scrollLeft - walk;
      });
      slider.style.cursor = "grab";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index}</td>
        <td>
          <button class="view-user-activity-btn">View User Activity</button>
        </td>
        <td>${playerID}</td>
        <td>${user.name || "N/A"}</td>
        <td>
          <button class="view-password-btn">View Password</button>
        </td>
        <td>
          <button class="view-pin-btn">View PIN Code</button>
        </td>
        <td>${displayGender}</td>
        <td>${user.progress || 0}%</td>
        <td>${Array.isArray(user.courses) ? user.courses.join(", ") : "None"}</td>
        <td>
          <button class="view-scores-btn">View Scores</button>
        </td>
        <td>
          <button class="view-skills-btn">View Skills</button>
        </td>
        <td>
          <button class="view-personalities-btn">View Personalities</button>
        </td>
        <td>
          <button class="view-comment-btn">View Comment</button>
        </td>
        <td>${role}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;

      tr.querySelector(".view-user-activity-btn").addEventListener("click", () => {
        const joined = user.joinedAt ? new Date(user.joinedAt).toLocaleString() : "N/A";
        const lastActive = user.lastActive ? new Date(user.lastActive).toLocaleString() : "N/A";
        const saved = user.savedAt ? new Date(user.savedAt).toLocaleString() : "N/A";

        popupHeader.textContent = "USER ACTIVITY/DATES";
        popupContent.innerHTML = 
          `<strong class="strongDatesText">Joined:</strong> <span class="joinedText">${joined}</span><br>`+
          `<strong class="strongDatesText">Last Active:</strong> <span class="lastActiveText">${lastActive}</span><br>`+
          `<strong class="strongDatesText">Last Saved:</strong> <span class="lastSavedText">${saved}</span>`
        ;
        popupBox.style.width = '80%';
        popupOverlay.style.display = "flex";
      });

      tr.querySelector(".view-skills-btn").addEventListener("click", () => {
        const skills = Array.isArray(user.tags) 
          ? user.tags.filter(t => t.type === 'skill').map(t => t.text) 
          : [];

        popupHeader.textContent = "SKILLS";
        if (skills.length > 0) {
          popupContent.innerHTML = `
            <ul>
              ${skills.map(s => `<li>${s}</li>`).join("")}
            </ul>
          `;
        } else {
          popupContent.innerHTML = "<p>No skills identified yet.</p>";
        }
        popupBox.style.width = '80%';
        popupOverlay.style.display = "flex";
      });

      tr.querySelector(".view-personalities-btn").addEventListener("click", () => {
        const personalities = Array.isArray(user.tags)
          ? user.tags.filter(t => t.type === 'personality').map(t => t.text) 
          : [];

        popupHeader.textContent = "PERSONALITIES";
        if (personalities.length > 0) {
          popupContent.innerHTML = `
            <ul>
              ${personalities.map(s => `<li>${s}</li>`).join("")}
            </ul>
          `;
        } else {
          popupContent.innerHTML = "<p>No skills identified yet.</p>";
        }

        popupBox.style.width = '80%';
        popupOverlay.style.display = "flex";
      });

      // view comment
      tr.querySelector(".view-comment-btn").addEventListener("click", () => {
        const commentText = user.comment || "No comment available.";

        popupHeader.textContent = "COMMENT";
        popupContent.innerHTML = commentText.replace(/\n/g, "<br>");
        popupBox.style.width = '80%';
        popupOverlay.style.display = "flex";
      });

      // view password
      tr.querySelector(".view-password-btn").addEventListener("click", () => {
        const passwordText = user.pass || "N/A";
        popupHeader.textContent = "PASSWORD";
        popupContent.innerHTML = `<strong>Password:</strong> <span class="passText">${passwordText}</span>`;
        popupBox.style.width = '50%';
        popupOverlay.style.display = "flex";
      });

      // view PIN
      tr.querySelector(".view-pin-btn").addEventListener("click", () => {
        const pinText = user.pin || "N/A";
        popupHeader.textContent = "PIN CODE";
        popupContent.innerHTML = `<strong>PIN:</strong> <span class="pinText">${pinText}</span>`;
        popupBox.style.width = '50%';
        popupOverlay.style.display = "flex";
      });

      tr.querySelector(".view-scores-btn").addEventListener("click", () => {
        popupHeader.textContent = "SCORES";

        if (!user.scores || Object.keys(user.scores).length === 0) {
          popupContent.innerHTML = "No scores available.";
        } else {
          // build table
          let scoresHTML = "<table border='1' style='text-align: center; border: 8px solid black; border-collapse: collapse; min-width: 200px;'>";
          scoresHTML += 
            `<tr>
              <th style='padding: 1rem; font-size: 5vmin; letter-spacing: 2px; border: 5px solid black; background-color: deepskyblue; color: white;'>COURSE</th>
              <th style='padding: 1rem; font-size: 5vmin; letter-spacing: 2px; border: 5px solid black; background-color: deepskyblue; color: white;'>TYPE</th>
              <th style='padding: 1rem; font-size: 5vmin; letter-spacing: 2px; border: 5px solid black; background-color: deepskyblue; color: white;'>SCORE</th>
            </tr>`;

          Object.entries(user.scores).forEach(([courseKey, typesObj]) => {
            const courseName = courseNames[courseKey] || courseKey;
            const typeEntries = Object.entries(typesObj);
            const avg = typesObj.average || 0;

            typeEntries.forEach(([type, score], index) => {
              scoresHTML += 
              `<tr>
                ${index === 0 ? 
                `<td style='padding: 1rem; font-size: 4vmin; border: 5px solid black;' rowspan='${typeEntries.length + 1}'>${courseName}</td>` : ""}
                <td style='padding: 1rem; font-size: 4vmin; border: 5px solid black;'>${type}</td>
                <td style='padding: 1rem; font-size: 4vmin; border: 5px solid black;'>${score}</td>
              </tr>`;
            });
            scoresHTML += 
            `<tr>
              <td style='padding: 1rem; font-size: 4vmin; background-color: deepskyblue; color: white; border: 5px solid black;'>Average</td>
              <td style='padding: 1rem; font-size: 4vmin; background-color: deepskyblue; color: white; border: 5px solid black;'>${avg}</td>
            </tr>`;
          });

          scoresHTML += "</table>";
          popupContent.innerHTML = `<section style="overflow-x: auto; width: 100%;">${scoresHTML}</section>`;
        }

        popupBox.style.width = '80%';
        popupOverlay.style.display = "flex";
      });

      // edit user
      tr.querySelector(".edit-btn").addEventListener("click", () => openEditModal(playerID, user, tr));

      // delete user
      tr.querySelector(".delete-btn").addEventListener("click", async () => {
        const name = user.name || playerID;

        if (confirm(`Are you sure you want to delete ${name}?`)) {
          try {
            await db.ref("webGame/" + playerID).remove();

            const adminID = localStorage.getItem("playerID") || "Unknown Admin";
            await addAdminLog("DELETED USER", `${adminID} deleted user ${playerID}`);

            loadUsers();
          } catch (err) {
            console.error(err);
            alert("Failed to delete user.");
          }
        }
      });

      usersTableBody.appendChild(tr);
    });
    document.getElementById("total-users").textContent = totalUsers;
    document.getElementById("total-players").textContent = totalPlayers;
    document.getElementById("total-admins").textContent = totalAdmins;

    setTimeout(() => {
      loadingScreen.classList.add("fade-out");
      setTimeout(() => (loadingScreen.style.display = "none"), 500);
    }, 300);
  } catch (err) {
    console.error(err);
    usersTableBody.innerHTML = "<tr><td colspan='15'>Error loading users</td></tr>";
    loadingScreen.style.display = "none";
  }
}

// close comment
popupClose.addEventListener("click", () => {
  popupOverlay.style.display = "none";
});

// edit modal
function openEditModal(playerID, user, tr) {
  currentEditingID = playerID;
  const rowNumber = Array.from(tr.parentElement.children).indexOf(tr) + 1;

  document.getElementById("display-num").innerText = `USER #${rowNumber}`;
  document.getElementById("edit-name").value = user.name || "";
  document.getElementById("edit-pass").value = user.pass || "";
  document.getElementById("edit-pin").value = user.pin || "";
  document.getElementById("edit-gender").value = user.gender || "";
  document.getElementById("edit-progress").value = user.progress || 0;
  generateCourseCheckboxes(Array.isArray(user.courses) ? user.courses : []); // courses
  document.getElementById("display-comment").value = user.comment || "";
  generateRoleCheckboxes(user); // roles

  // pin and password condition
  const displayPin = pinInput.value || "N/A";
  const displayPass = passInput.value || "N/A";

  if (pinField) {
    if (displayPin === "N/A") {
      pinField.parentElement.style.display = "none";
    } else {
      pinField.parentElement.style.display = "flex";
    }
  }

  if (passField) {
    if (displayPass === "N/A") {
      passField.parentElement.style.display = "none";
    } else {
      passField.parentElement.style.display = "flex";
    }
  }

  // comment logic
  const commentBox = document.getElementById("display-comment");
  const sep = "\n\n[Notes Below]\n";
  const [originalComment, rawAdminNotes = ""] = (user.comment?.split(sep)) || ["No existing comment.", ""];
  const adminNotes = rawAdminNotes.trim() === "" ? "No notes have been created by the admin." : rawAdminNotes;

  commentBox.value = originalComment + sep + adminNotes;
  commentBox.classList.add("blink");

  // stop cursor from editing the comment
  const minPos = (originalComment + sep).length;

  commentBox.addEventListener("click", () => {
    if (commentBox.selectionStart < minPos) {
      commentBox.selectionStart = commentBox.selectionEnd = commentBox.value.length;
    }
  });

  commentBox.addEventListener("keydown", (e) => {
    if ((e.key === "Backspace" && commentBox.selectionStart <= minPos) ||
        (e.key === "Delete" && commentBox.selectionStart < minPos)) {
      e.preventDefault();
    }
  });

  editModal.style.display = "flex";
}

// close edit
closeModal.addEventListener("click", () => {
  editModal.style.display = "none";
});

// course edit section
function generateCourseCheckboxes(selectedCourses) {
  const container = document.getElementById("edit-courses");
  container.innerHTML = "";

  const allCourses = Object.keys(courseNames);

  allCourses.forEach(course => {
    const label = document.createElement("label");
    label.classList.add("edit-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = course;
    checkbox.checked = selectedCourses.includes(course);

    const span = document.createElement("span");
    span.textContent = courseNames[course];

    //assemble all
    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
  });
}

// role edit section
function generateRoleCheckboxes(user) {
  const container = document.getElementById("edit-roles");
  container.innerHTML = "";

  Object.entries(roleNames).forEach(([key, labelText]) => {
    const label = document.createElement("label");
    label.classList.add("edit-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = key;
    checkbox.checked = user[key] === true;

    const span = document.createElement("span");
    span.textContent = labelText;

    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
  });
}

backupBtn.addEventListener("click", async () => {
  try {
    const snapshot = await db.ref("webGame").once("value");
    const data = snapshot.val();

    if (!data) {
      alert("No data available for backup.");
      return;
    }

    // convert JSON object to string
    const jsonData = JSON.stringify(data, null, 2);

    // create a blob for download
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // create a temporary link to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `webGame_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    alert("Backup downloaded successfully!");
  } catch (error) {
    console.error(error);
    alert("Error while creating backup.");
  }
});

async function addAdminLog(action, details) {
  try {
    const timestamp = Date.now();
    const logRef = db.ref("webGame/logs").push(); // unique key
    await logRef.set({ action, details, timestamp });
    console.log("Log recorded:", action, details);
  } catch (err) {
    console.error("Failed to record log:", err);
  }
}

viewLogsBtn.addEventListener("click", async () => {
  try {
    const snapshot = await db.ref("webGame/logs").once("value");
    const logs = snapshot.val();

    popupHeader.textContent = "SYSTEM LOGS";

    if (!logs) {
      popupContent.innerHTML = "No logs available.";
    } else {
      // convert logs to array and sort by timestamp descending
      const logsArray = Object.values(logs).sort((a, b) => b.timestamp - a.timestamp);

      let html = "<ul style='list-style-type: none; padding: 0;'>";
      logsArray.forEach(log => {
        const date = new Date(log.timestamp).toLocaleString();
        html += `<li style="margin-bottom: 3rem; font-size: 2rem;">[${date}]\n ${log.action}\n ${log.details}</li>`;
      });
      html += "</ul>";

      popupContent.innerHTML = html;
    }

    popupBox.style.width = "80%";
    popupOverlay.style.display = "flex";
  } catch (err) {
    console.error(err);
    popupHeader.textContent = "SYSTEM LOGS";
    popupContent.innerHTML = "Error loading logs.";
    popupBox.style.width = "80%";
    popupOverlay.style.display = "flex";
  }
});

// save user
saveBtn.addEventListener("click", async () => {
  if (!currentEditingID) return;

  const newName = document.getElementById("edit-name").value.trim();
  const newPass = document.getElementById("edit-pass").value.trim();
  const newPin = document.getElementById("edit-pin").value.trim();
  const newProgress = Number(document.getElementById("edit-progress").value);
  const newGender = document.getElementById("edit-gender").value.trim();

  const container = document.getElementById("edit-courses");
  const checkedCourses = Array.from(container.querySelectorAll("input[type='checkbox']:checked"))
    .map(cb => cb.value);

  const rolesContainer = document.getElementById("edit-roles");
  const checkedRoles = Array.from(rolesContainer.querySelectorAll("input[type='checkbox']"))
    .reduce((obj, cb) => {
      obj[cb.value] = cb.checked;
      return obj;
    }, {});

  const oldRef = db.ref("webGame/" + currentEditingID);
  const oldSnap = await oldRef.once("value");
  const oldUser = oldSnap.val() || {};

  // separator for admin notes
  const notes_sep = "\n\n[Notes Below]\n";
  const commentBox = document.getElementById("display-comment");
  const [originalComment] = (oldUser.comment?.split(notes_sep)) || ["No existing comment."];

  // save only editable notes (after separator)
  const enteredAdminNotes = commentBox.value.substring((originalComment + notes_sep).length);

  const updatedUser = {
    ...oldUser,
    name: newName,
    pass: newPass,
    pin: newPin,
    gender: newGender,
    progress: newProgress,
    courses: checkedCourses,
    comment: originalComment + notes_sep + enteredAdminNotes,
    ...checkedRoles
  };

  try {
    await oldRef.update(updatedUser);

    const adminID = localStorage.getItem("playerID") || "Unknown Admin";
    const logDetails = `${adminID} modified user ${currentEditingID}`;
    await addAdminLog("MODIFIED USER", logDetails);

    editModal.style.display = "none";
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Failed to save user.");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  loadingScreen;
  loadUsers();
});