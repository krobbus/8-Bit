"use strict";

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var app = (0, _express["default"])();
var PORT = 3000;
app.use(_express["default"]["static"](_path["default"].join(process.cwd(), "public")));
app.use(_express["default"].json()); // parse JSON request body
// Endpoint for quiz feedback

app.post("/api/feedback", function _callee(req, res) {
  var _req$body, userAnswer, correctAnswer, courseName, prompt, response, data, aiText;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, userAnswer = _req$body.userAnswer, correctAnswer = _req$body.correctAnswer, courseName = _req$body.courseName;
          prompt = "\n    You are an educational assistant AI.\n\n    A student is taking a quiz about the course: \"".concat(courseName, "\".\n\n    They selected the answer: \"").concat(userAnswer, "\".\n    The correct answer is: \"").concat(correctAnswer, "\".\n\n    Explain the correct answer clearly and concisely (2\u20133 sentences).\n    After the explanation, provide at least one reliable source or reference related to the correct answer (prefer .edu, .org, or .gov sites).\n\n    Format the output like this:\n    Explanation: <your explanation here>\n    Source: <website title> - <URL>\n  ");
          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap((0, _nodeFetch["default"])("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          }));

        case 5:
          response = _context.sent;

          if (response.ok) {
            _context.next = 8;
            break;
          }

          throw new Error("HTTP error! Status: ".concat(response.status));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(response.json());

        case 10:
          data = _context.sent;
          aiText = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text ? data.candidates[0].content.parts[0].text : "No response from Gemini.";
          res.json({
            aiText: aiText
          });
          _context.next = 19;
          break;

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](2);
          console.error("Gemini API error:", _context.t0);
          res.status(500).json({
            error: "Gemini API error"
          });

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 15]]);
});
app.listen(PORT, function () {
  console.log("Server running at http://localhost:".concat(PORT));
});