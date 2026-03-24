"use strict";
exports.__esModule = true;
var react_1 = require("react");
require("../styles/StatisticsLoad.css");
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
var StatisticsLoad = function (_a) {
    var stats = _a.stats, userData = _a.userData, isGeneratingAI = _a.isGeneratingAI, onGenerateAI = _a.onGenerateAI;
    var userCourses = (userData === null || userData === void 0 ? void 0 : userData.courses) || [];
    var allScores = (userData === null || userData === void 0 ? void 0 : userData.scores) || {};
    return (react_1["default"].createElement("div", { className: "statisticContainer" },
        react_1["default"].createElement("label", { className: "mainHeader" }, "STATISTICS"),
        react_1["default"].createElement("div", { className: "courseStatList" }, userCourses.map(function (courseCode) {
            var courseData = allScores[courseCode] || {};
            var hasMC = courseData.multipleChoice !== undefined;
            var hasID = courseData.identification !== undefined;
            var hasSkill = courseData.skill !== undefined;
            var hasPers = courseData.personality !== undefined;
            var completedTasks = [hasMC, hasID, hasSkill, hasPers].filter(Boolean).length;
            var coursePercent = Math.round((completedTasks / 4) * 100);
            var mcScore = courseData.multipleChoice || 0;
            var idScore = courseData.identification || 0;
            var totalQuizScore = mcScore + idScore;
            return (react_1["default"].createElement("div", { key: courseCode, className: "courseStatCard" },
                react_1["default"].createElement("label", { className: "courseTitle" }, courseNames[courseCode] || courseCode),
                react_1["default"].createElement("div", { className: "courseProgressContainer" },
                    react_1["default"].createElement("div", { className: "progressBarContainer" },
                        react_1["default"].createElement("div", { className: "progressBar", style: { width: coursePercent + "%" } })),
                    react_1["default"].createElement("span", { className: "progressPercentage" },
                        coursePercent,
                        "%")),
                react_1["default"].createElement("div", { className: "taskGrid" },
                    react_1["default"].createElement("div", { className: "taskItem" },
                        react_1["default"].createElement("span", null, "Multiple Choice:"),
                        react_1["default"].createElement("span", { className: hasMC ? "statusDone" : "statusPending" }, hasMC ? mcScore + "/5 (Complete)" : "Pending")),
                    react_1["default"].createElement("div", { className: "taskItem" },
                        react_1["default"].createElement("span", null, "Identification:"),
                        react_1["default"].createElement("span", { className: hasID ? "statusDone" : "statusPending" }, hasID ? idScore + "/5 (Complete)" : "Pending")),
                    react_1["default"].createElement("div", { className: "taskItem" },
                        react_1["default"].createElement("span", null, "Skill Test:"),
                        react_1["default"].createElement("span", { className: hasSkill ? "statusDone" : "statusPending" }, hasSkill ? "Complete" : "Not Complete")),
                    react_1["default"].createElement("div", { className: "taskItem" },
                        react_1["default"].createElement("span", null, "Personality Test:"),
                        react_1["default"].createElement("span", { className: hasPers ? "statusDone" : "statusPending" }, hasPers ? "Complete" : "Not Complete"))),
                react_1["default"].createElement("div", { className: "overallScoreRow" },
                    react_1["default"].createElement("strong", null,
                        "Overall Quiz Score: ",
                        totalQuizScore,
                        "/10"),
                    react_1["default"].createElement("strong", null, "Status: "))));
        })),
        react_1["default"].createElement("section", { className: "skillsPersonalityContainer" },
            react_1["default"].createElement("div", { className: "tagsContainer" },
                react_1["default"].createElement("label", { className: "subHeader" }, "YOUR SKILLS"),
                stats.skills.length > 0 ? (react_1["default"].createElement("ul", null, stats.skills.map(function (skill, index) { return (react_1["default"].createElement("li", { key: index },
                    "[",
                    index + 1,
                    "] ",
                    skill.text)); }))) : (react_1["default"].createElement("p", null, "No skills validated yet"))),
            react_1["default"].createElement("div", { className: "personalityContainer" },
                react_1["default"].createElement("label", { className: "subHeader" }, "YOUR PERSONALITY"),
                stats.personalities.length > 0 ? (react_1["default"].createElement("ul", null, stats.personalities.map(function (personalities, index) { return (react_1["default"].createElement("li", { key: index },
                    "[",
                    index + 1,
                    "] ",
                    personalities.text)); }))) : (react_1["default"].createElement("p", null, "No personalities validated yet")))),
        react_1["default"].createElement("section", { className: "commentContainer" },
            react_1["default"].createElement("label", { className: "subHeader" }, "AI COMMENT AND SUGGESTIONS"),
            react_1["default"].createElement("button", { onClick: onGenerateAI, disabled: stats.progress < 100 || isGeneratingAI }, isGeneratingAI ? "ANALYZING..." : "GENERATE AI ANALYSIS"),
            react_1["default"].createElement("div", { className: "aiCommentBox" }, (userData === null || userData === void 0 ? void 0 : userData.comment) || "Complete courses to unlock AI analysis..."))));
};
exports["default"] = StatisticsLoad;
