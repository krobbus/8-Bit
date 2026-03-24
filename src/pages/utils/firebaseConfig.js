const firebaseConfig = {
  apiKey: "AIzaSyDRhBcfD2KU6RVBmjLDQJ6YkPk3apsN9NM",
  authDomain: "bit-5baab.firebaseapp.com",
  databaseURL: "https://bit-5baab-default-rtdb.firebaseio.com",
  projectId: "bit-5baab",
  storageBucket: "bit-5baab.appspot.com",
  messagingSenderId: "430682381960",
  appId: "1:430682381960:web:257bbed7f50389e587c93d",
  measurementId: "G-LFY7HWDF5Z"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

async function fetchGemini() {
  try {
    const response = await fetch('http://localhost:5000/get-quiz');
    const data = await response.json();
    return data.question;
  } catch (error) {
    console.error("Backend not running:", error);
    return "Error loading question.";
  }
}

// generate unique ID
function generateUniqueID(prefix){
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}_${random}`;
}

// checking if player already exists locally
let playerID = localStorage.getItem("playerID") || null;

window.db = db;
window.playerID = playerID;
window.generateUniqueID = generateUniqueID;
window.fetchGemini = fetchGemini;