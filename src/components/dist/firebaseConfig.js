"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.db = void 0;
var app_1 = require("firebase/app");
require("firebase/database");
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
if (!app_1["default"].apps.length) {
    app_1["default"].initializeApp(firebaseConfig);
}
exports.db = app_1["default"].database();
function fetchGemini() {
    return __awaiter(this, void 0, Promise, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('http://localhost:5000/get-quiz')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data.question];
                case 3:
                    error_1 = _a.sent();
                    console.error("Backend not running:", error_1);
                    return [2 /*return*/, "Error loading question."];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function generateUniqueID(prefix) {
    var random = Math.floor(1000 + Math.random() * 9000);
    return prefix + "_" + random;
}
var playerID = localStorage.getItem("playerID");
window.db = exports.db;
window.playerID = playerID;
window.generateUniqueID = generateUniqueID;
window.fetchGemini = fetchGemini;
