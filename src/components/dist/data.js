"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.isAdminMode = exports.convertToPermanent = exports.removePlayerData = exports.getPlayerData = exports.updatePlayerData = void 0;
var firebaseConfig_1 = require("./firebaseConfig");
var getPlayerID = function () {
    return localStorage.getItem("playerID");
};
function updatePlayerData(data) {
    var playerID = getPlayerID();
    if (!playerID)
        return Promise.reject("No playerID found");
    return firebaseConfig_1.db.ref("webGame/" + playerID).update(data);
}
exports.updatePlayerData = updatePlayerData;
function getPlayerData(callback) {
    var playerID = getPlayerID();
    if (!playerID)
        return callback(null);
    firebaseConfig_1.db.ref("webGame/" + playerID).on("value", function (snapshot) {
        callback(snapshot.val());
    });
}
exports.getPlayerData = getPlayerData;
function removePlayerData() {
    var playerID = getPlayerID();
    if (!playerID)
        return Promise.reject("No playerID found");
    return firebaseConfig_1.db.ref("webGame/" + playerID).remove();
}
exports.removePlayerData = removePlayerData;
function convertToPermanent(userInfo) {
    var playerID = getPlayerID();
    if (!playerID)
        return Promise.reject("No playerID found");
    return firebaseConfig_1.db.ref("webGame/" + playerID).update(__assign(__assign({}, userInfo), { temporary: false, savedAt: Date.now() }));
}
exports.convertToPermanent = convertToPermanent;
function isAdminMode(callback) {
    var sEmail = getPlayerID();
    if (!sEmail) {
        callback(false);
        return;
    }
    firebaseConfig_1.db.ref("webGame/" + sEmail + "/adminMode").once("value")
        .then(function (snapshot) { return callback(snapshot.val() === true); })["catch"](function () { return callback(false); });
}
exports.isAdminMode = isAdminMode;
window.updatePlayerData = updatePlayerData;
window.getPlayerData = getPlayerData;
window.removePlayerData = removePlayerData;
window.convertToPermanent = convertToPermanent;
window.isAdminMode = isAdminMode;
