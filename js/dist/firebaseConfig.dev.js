"use strict";

// firebaseConfig.js — fixed (no auto guest creation)
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

var db = firebase.database(); // --- Generate unique ID ---

function generateUniqueID(prefix) {
  var random = Math.floor(1000 + Math.random() * 9000);
  return "".concat(prefix, "_").concat(random);
} // --- Check if a player already exists locally ---


var playerID = localStorage.getItem("playerID") || null;
window.db = db;
window.playerID = playerID;
window.generateUniqueID = generateUniqueID;