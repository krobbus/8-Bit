"use strict";

var firebaseConfig = {
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

var db = firebase.database();

function fetchGemini() {
  var response, data;
  return regeneratorRuntime.async(function fetchGemini$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(fetch('http://localhost:5000/get-quiz'));

        case 3:
          response = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(response.json());

        case 6:
          data = _context.sent;
          return _context.abrupt("return", data.question);

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.error("Backend not running:", _context.t0);
          return _context.abrupt("return", "Error loading question.");

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
} // generate unique ID


function generateUniqueID(prefix) {
  var random = Math.floor(1000 + Math.random() * 9000);
  return "".concat(prefix, "_").concat(random);
} // checking if player already exists locally


var playerID = localStorage.getItem("playerID") || null;
window.db = db;
window.playerID = playerID;
window.generateUniqueID = generateUniqueID;
window.fetchGemini = fetchGemini;