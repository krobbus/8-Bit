"use strict";
exports.__esModule = true;
var react_1 = require("react");
require("../styles/Modal.css");
require("../styles/CourseLoad.css");
var courseNames = {
    CITCS: "COLLEGE OF INFORMATION TECHNOLOGY AND COMPUTER STUDIES (CITCS)",
    CCJ: "COLLEGE OF CRIMINAL JUSTICE (CCJ)",
    CBA: "COLLEGE OF BUSINESS ADMINISTRATION (CBA)",
    CAS: "COLLEGE OF ARTS AND SCIENCES (CAS)",
    CTE: "COLLEGE OF TEACHER EDUCATION (CTE)",
    COM: "COLLEGE OF MEDICINE (COM)",
    ISW: "INSTITUTE OF SOCIAL WORK (ISW)",
    IPPG: "INSTITUTE OF PUBLIC POLICY AND GOVERNANCE (IPPG)"
};
var apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:10000'
    : 'https://eight-bit-backend.onrender.com';
var StatisticsLoad = function () {
    var _a;
    var _b = react_1.useState(null), userData = _b[0], setUserData = _b[1];
    var _c = react_1.useState(false), isGeneratingAI = _c[0], setIsGeneratingAI = _c[1];
    var playerID = localStorage.getItem("playerID");
    var stats = react_1.useMemo(function () {
        if (!userData)
            return { progress: 0, skills: [], personalities: [] };
        var courses = userData.courses || [];
        var scores = userData.scores || {};
        var tags = userData.tags || [];
        var courseProgressMap = {};
        var totalPointsEarned = 0;
        var totalPointsPossible = courses.length * 3;
        courses.forEach(function (course) {
            var courseScores = scores[course] || {};
            var completedTasks = 0;
            if (courseScores.multipleChoice != null)
                completedTasks++;
            if (courseScores.skill != null)
                completedTasks++;
            if (courseScores.personality != null)
                completedTasks++;
            courseProgressMap[course] = Math.round((completedTasks / 3) * 100);
            totalPointsEarned += completedTasks;
        });
        var overallProgress = totalPointsPossible > 0
            ? Math.round((totalPointsEarned / totalPointsPossible) * 100)
            : 0;
        return {
            progress: overallProgress,
            courseProgress: courseProgressMap,
            skills: tags.filter(function (t) { return t.type === "skill" && t.status === "valid"; }).slice(0, 5),
            personalities: tags.filter(function (t) { return t.type === "personality" && t.status === "valid"; }).slice(0, 5)
        };
    }, [userData]);
    return (react_1["default"].createElement("section", { className: "statisticsCountainer" },
        react_1["default"].createElement("label", { className: "mainHeader", id: "statistics" }, "STATISTICS"),
        react_1["default"].createElement("div", { className: "scoresContainer" },
            react_1["default"].createElement("label", { className: "label" }, "COURSES TAKEN AND SCORES"),
            react_1["default"].createElement("div", { className: "scoreField" }, (_a = userData === null || userData === void 0 ? void 0 : userData.courses) === null || _a === void 0 ? void 0 : _a.map(function (course) {
                var _a, _b;
                return (react_1["default"].createElement("div", { key: course, className: "scoreList" },
                    react_1["default"].createElement("div", { className: "scoreCourse" },
                        react_1["default"].createElement("span", null, courseNames[course] || course),
                        react_1["default"].createElement("div", { className: "progressBar" },
                            react_1["default"].createElement("label", { className: "label" },
                                "OVERALL PROGRESS: ",
                                stats.progress,
                                "%"),
                            react_1["default"].createElement("div", { className: "progressFill", style: { width: stats.progress + "%" } })),
                        react_1["default"].createElement("strong", null,
                            " [Avg: ",
                            ((_b = (_a = userData.scores) === null || _a === void 0 ? void 0 : _a[course]) === null || _b === void 0 ? void 0 : _b.average) || 0,
                            "%]"))));
            }))),
        react_1["default"].createElement("div", { className: "skillsPersonalityContainer", id: "skills-personality" },
            react_1["default"].createElement("label", { className: "label" }, "SKILLS & PERSONALITY"),
            react_1["default"].createElement("div", { className: "skillsPersonalityWrapper" },
                react_1["default"].createElement("div", { id: "skillsContainer" },
                    react_1["default"].createElement("label", { className: "label" }, "SKILLS"),
                    react_1["default"].createElement("ul", null, stats.skills.map(function (s, i) { return react_1["default"].createElement("li", { key: i }, s.text.toUpperCase()); }))),
                react_1["default"].createElement("div", { id: "personalityContainer" },
                    react_1["default"].createElement("label", { className: "label" }, "PERSONALITY"),
                    react_1["default"].createElement("ul", null, stats.personalities.map(function (p, i) { return react_1["default"].createElement("li", { key: i }, p.text.toUpperCase()); }))))),
        react_1["default"].createElement("div", { className: "commentContainer", id: "comment" },
            react_1["default"].createElement("label", { className: "label" }, "AI COMMENT AND SUGGESTIONS"),
            react_1["default"].createElement("div", { className: "commentList" }, (userData === null || userData === void 0 ? void 0 : userData.comment) ? react_1["default"].createElement("p", null, userData.comment) : react_1["default"].createElement("p", null, "PLAY ONE OR MORE COURSE/S; (1)QUIZ AND (2) TESTS FOR EACH COURSES \u2014 TO GENERATE ANALYSIS")),
            react_1["default"].createElement("button", { className: "aiButton " + (stats.progress < 100 ? 'disabled' : 'enabled'), disabled: stats.progress < 100 || isGeneratingAI, onClick: handleGenerateAI }, isGeneratingAI ? "GENERATING..." : "UPDATE ANALYSIS"))));
};
exports["default"] = StatisticsLoad;
