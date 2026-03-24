"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function updatePlayerData(data) {
  return db.ref("webGame/" + playerID).update(data);
}

function getPlayerData(callback) {
  db.ref("webGame/" + playerID).on("value", function (snapshot) {
    callback(snapshot.val());
  });
}

function removePlayerData() {
  return db.ref("webGame/" + playerID).remove();
}

function convertToPermanent(userInfo) {
  return db.ref("webGame/" + playerID).update(_objectSpread({}, userInfo, {
    temporary: false,
    savedAt: Date.now()
  }));
}

window.updatePlayerData = updatePlayerData;
window.getPlayerData = getPlayerData;
window.removePlayerData = removePlayerData;
window.convertToPermanent = convertToPermanent;