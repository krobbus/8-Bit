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
var react_1 = require("react");
var firebaseConfig_1 = require("./firebaseConfig");
require("../styles/Modal.css");
require("../styles/Dashboard.css");
var StatisticsLoad_1 = require("./StatisticsLoad");
var apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:10000'
    : 'https://eight-bit-backend.onrender.com';
var Dashboard = function (_a) {
    var onClose = _a.onClose, isOpen = _a.isOpen;
    var _b = react_1.useState(true), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(null), userData = _c[0], setUserData = _c[1];
    var _d = react_1.useState(false), showPassword = _d[0], setShowPassword = _d[1];
    var _e = react_1.useState(false), showPin = _e[0], setShowPin = _e[1];
    var _f = react_1.useState(false), isGeneratingAI = _f[0], setIsGeneratingAI = _f[1];
    var playerID = localStorage.getItem("playerID");
    react_1.useEffect(function () {
        if (!isOpen || !playerID)
            return;
        var userRef = firebaseConfig_1.db.ref("webGame/" + playerID);
        var handleData = function (snapshot) {
            var data = snapshot.val();
            if (data) {
                setUserData(data);
            }
            setLoading(false);
        };
        userRef.on('value', handleData);
        return function () { return userRef.off('value', handleData); };
    }, [isOpen, playerID]);
    react_1.useEffect(function () {
        var _a, _b;
        if ((_b = (_a = window.game) === null || _a === void 0 ? void 0 : _a.input) === null || _b === void 0 ? void 0 : _b.keyboard) {
            isOpen ? window.game.input.keyboard.stopListeners() : window.game.input.keyboard.startListeners();
        }
        return function () { var _a, _b, _c; return (_c = (_b = (_a = window.game) === null || _a === void 0 ? void 0 : _a.input) === null || _b === void 0 ? void 0 : _b.keyboard) === null || _c === void 0 ? void 0 : _c.startListeners(); };
    }, [isOpen]);
    var stats = react_1.useMemo(function () {
        if (!userData)
            return {
                progress: 0,
                courseProgress: {},
                skills: [],
                personalities: []
            };
        var courses = userData.courses || [];
        var scores = userData.scores || {};
        var tags = userData.tags || [];
        var courseProgressMap = {};
        var totalTasksCompleted = 0;
        var totalTasksPossible = courses.length * 4;
        courses.forEach(function (course) {
            var courseScores = scores[course] || {};
            var completedTasks = 0;
            if (courseScores.multipleChoice != null)
                completedTasks++;
            if (courseScores.identification != null)
                completedTasks++;
            if (courseScores.skill != null)
                completedTasks++;
            if (courseScores.personality != null)
                completedTasks++;
            courseProgressMap[course] = Math.round((completedTasks / 4) * 100);
            totalTasksCompleted += completedTasks;
        });
        var overallProgress = totalTasksPossible > 0
            ? Math.round((totalTasksCompleted / totalTasksPossible) * 100)
            : 0;
        return {
            progress: overallProgress,
            courseProgress: courseProgressMap,
            skills: tags.filter(function (t) { return t.type === "skill" && t.status === "valid"; }).slice(0, 5),
            personalities: tags.filter(function (t) { return t.type === "personality" && t.status === "valid"; }).slice(0, 5)
        };
    }, [userData]);
    var handleGenerateAI = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result, aiText, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (stats.progress < 100 || isGeneratingAI)
                        return [2 /*return*/];
                    setIsGeneratingAI(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch(apiBaseUrl + "/api/comment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                playerEmail: userData.email,
                                playerName: userData.name,
                                coursesTaken: userData.courses,
                                scores: userData.scores,
                                tags: userData.tags,
                                quizResults: userData.quizResults
                            })
                        })];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _b.sent();
                    aiText = ((_a = result.aiText) === null || _a === void 0 ? void 0 : _a.trim()) || "No response from AI.";
                    return [4 /*yield*/, firebaseConfig_1.db.ref("webGame/" + playerID + "/comment").set(aiText)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _b.sent();
                    alert("Failed to generate analysis.");
                    return [3 /*break*/, 7];
                case 6:
                    setIsGeneratingAI(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var copyToClipboard = function (text) {
        navigator.clipboard.writeText(text).then(function () {
            alert("Email copied to clipboard!");
        });
    };
    var handleLogout = function () {
        localStorage.removeItem("playerID");
        window.location.href = "../../index.html";
    };
    var handleReset = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("Reset all progress?")) return [3 /*break*/, 2];
                    return [4 /*yield*/, firebaseConfig_1.db.ref("webGame/" + playerID).update({
                            quizResults: {},
                            scores: {},
                            progress: 0,
                            comment: ""
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteAccount = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("PERMANENTLY DELETE ACCOUNT? This cannot be undone.")) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, firebaseConfig_1.db.ref("webGame/" + playerID).remove()];
                case 2:
                    _a.sent();
                    handleLogout();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    alert("Error deleting account.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen)
        return null;
    return (react_1["default"].createElement("div", { className: "modalBackdrop" },
        react_1["default"].createElement("button", { id: "closeButton", onClick: onClose }, "X"),
        react_1["default"].createElement("div", { className: "modalContainer" },
            react_1["default"].createElement("div", { className: "modalContent" },
                react_1["default"].createElement("section", { className: "dashboardContainer" },
                    react_1["default"].createElement("h1", { id: "mainTitle" }, "DASHBOARD"),
                    react_1["default"].createElement("nav", null,
                        react_1["default"].createElement("ul", null,
                            react_1["default"].createElement("li", { id: "home" },
                                react_1["default"].createElement("a", { href: "#mainTitle" }, "HOME")),
                            react_1["default"].createElement("li", null,
                                react_1["default"].createElement("a", { href: "#profile" }, "PROFILE")),
                            react_1["default"].createElement("li", null,
                                react_1["default"].createElement("a", { href: "#statistics" }, "STATISTICS"),
                                react_1["default"].createElement("ul", null,
                                    react_1["default"].createElement("li", null,
                                        react_1["default"].createElement("a", { href: "#progress" }, "PROGRESS AND SCORES")),
                                    react_1["default"].createElement("li", null,
                                        react_1["default"].createElement("a", { href: "#skills-personality" }, "SKILLS AND PERSONALITY TRAITS")),
                                    react_1["default"].createElement("li", null,
                                        react_1["default"].createElement("a", { href: "#comment" }, "AI COMMENT AND SUGGESTIONS")))),
                            react_1["default"].createElement("li", null,
                                react_1["default"].createElement("a", { href: "#actions" }, "ACTIONS")),
                            react_1["default"].createElement("li", { id: "logout" },
                                react_1["default"].createElement("a", { href: "javascript:void(0)", onClick: handleLogout }, "LOGOUT")))),
                    react_1["default"].createElement("main", null, loading ? (react_1["default"].createElement("p", null, "Loading Player Data...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("div", { id: "profile", className: "profileContainer" },
                            react_1["default"].createElement("label", { className: "mainHeader" }, "PROFILE"),
                            react_1["default"].createElement("div", { className: "imgWrapper" },
                                react_1["default"].createElement("img", { src: (userData === null || userData === void 0 ? void 0 : userData.gender) === 'Female' ? "/assets/Character/StaticFemale.gif" : "/assets/Character/StaticMale.gif", alt: "Avatar" })),
                            react_1["default"].createElement("div", { className: "idContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "PLAYER ID:"),
                                react_1["default"].createElement("label", { className: "subLabel" }, playerID || "N/A")),
                            react_1["default"].createElement("div", { className: "emailContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "PLAYER EMAIL:"),
                                react_1["default"].createElement("div", { className: "emailField" },
                                    react_1["default"].createElement("input", { style: { fontSize: "18px", fontFamily: '"Press Start 2P", cursive', color: "#fff" }, value: (userData === null || userData === void 0 ? void 0 : userData.email) || "N/A", readOnly: true }),
                                    react_1["default"].createElement("img", { "typeof": "text/svg", style: { filter: "invert()", width: "28px", height: "auto" }, onClick: function () { return copyToClipboard(userData === null || userData === void 0 ? void 0 : userData.email); }, src: "/assets/WebAssets/Copy.svg", alt: "Copy Email" }))),
                            react_1["default"].createElement("div", { className: "nameContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "PLAYER NAME:"),
                                react_1["default"].createElement("label", { className: "subLabel" }, (userData === null || userData === void 0 ? void 0 : userData.name) || "Guest")),
                            react_1["default"].createElement("div", { className: "passContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "PASSWORD:"),
                                react_1["default"].createElement("div", { className: "passField" },
                                    react_1["default"].createElement("input", { type: showPassword ? "text" : "password", style: { fontSize: "18px", fontFamily: '"Press Start 2P", cursive', color: "#fff" }, value: (userData === null || userData === void 0 ? void 0 : userData.pass) || "No Password Available", readOnly: true }),
                                    react_1["default"].createElement("img", { onClick: function () { return setShowPassword(!showPassword); }, src: "../../assets/WebAssets/Padlock" + (showPassword ? 'Opened' : 'Closed') + ".png", alt: "Show/Hide Password" }))),
                            react_1["default"].createElement("div", { className: "genderContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "GENDER:"),
                                react_1["default"].createElement("label", { className: "subLabel" }, (userData === null || userData === void 0 ? void 0 : userData.gender) || "N/A")),
                            react_1["default"].createElement("div", { className: "pinContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "PIN:"),
                                react_1["default"].createElement("div", { className: "pinField" },
                                    react_1["default"].createElement("input", { type: showPin ? "text" : "password", style: { fontSize: '18px', fontFamily: '"Press Start 2P", cursive', color: "#fff" }, value: (userData === null || userData === void 0 ? void 0 : userData.pin) || "No PIN available", readOnly: true }),
                                    react_1["default"].createElement("img", { onClick: function () { return setShowPin(!showPin); }, src: "../../assets/WebAssets/Padlock" + (showPin ? 'Opened' : 'Closed') + ".png", alt: "Show/Hide PIN" })))),
                        react_1["default"].createElement(StatisticsLoad_1["default"], { stats: stats, userData: userData, isGeneratingAI: isGeneratingAI, onGenerateAI: handleGenerateAI }),
                        react_1["default"].createElement("div", { className: "actionsContainer" },
                            react_1["default"].createElement("label", { className: "label", id: "actions" }, "ACTIONS"),
                            react_1["default"].createElement("div", { className: "buttonWrapper" },
                                react_1["default"].createElement("button", { id: "resetButton", onClick: handleReset }, "RESET PROGRESS"),
                                react_1["default"].createElement("button", { id: "deleteButton", onClick: handleDeleteAccount }, "DELETE ACCOUNT")))))))))));
};
exports["default"] = Dashboard;
