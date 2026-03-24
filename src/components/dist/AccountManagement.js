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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var firebaseConfig_1 = require("./firebaseConfig");
var data_1 = require("./data");
var preferenceLib_js_1 = require("../pages/data/preferenceLib.js");
require("../styles/Modal.css");
require("../styles/AccountManagement.css");
var AccountManagement = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = react_1.useState('character'), view = _b[0], setView = _b[1];
    var _c = react_1.useState(true), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState([]), selectedTags = _d[0], setSelectedTags = _d[1];
    var _e = react_1.useState(''), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState(false), isDropdownOpen = _f[0], setIsDropdownOpen = _f[1];
    var dropdownRef = react_1.useRef(null);
    var _g = react_1.useState([]), selectedCourses = _g[0], setSelectedCourses = _g[1];
    var _h = react_1.useState(''), email = _h[0], setEmail = _h[1];
    var _j = react_1.useState(false), isEmailValid = _j[0], setIsEmailValid = _j[1];
    var _k = react_1.useState(''), name = _k[0], setName = _k[1];
    var _l = react_1.useState(false), isNameValid = _l[0], setIsNameValid = _l[1];
    var _m = react_1.useState('male'), gender = _m[0], setGender = _m[1];
    var _o = react_1.useState(''), password = _o[0], setPassword = _o[1];
    var _p = react_1.useState(''), confirmPassword = _p[0], setConfirmPassword = _p[1];
    var _q = react_1.useState(false), showPassword = _q[0], setShowPassword = _q[1];
    var _r = react_1.useState(false), showConfirmPassword = _r[0], setShowConfirmPassword = _r[1];
    var _s = react_1.useState(false), isPassValid = _s[0], setIsPassValid = _s[1];
    var _t = react_1.useState(''), pin = _t[0], setPin = _t[1];
    var _u = react_1.useState(''), confirmPin = _u[0], setConfirmPin = _u[1];
    var _v = react_1.useState(false), showPin = _v[0], setShowPin = _v[1];
    var _w = react_1.useState(false), showConfirmPin = _w[0], setShowConfirmPin = _w[1];
    var _x = react_1.useState(false), isPinValid = _x[0], setIsPinValid = _x[1];
    var _y = react_1.useState(null), formError = _y[0], setFormError = _y[1];
    var skills = selectedTags.filter(function (t) { return t.type === "skill"; });
    var personalities = selectedTags.filter(function (t) { return t.type === "personality"; });
    var maxLimit = 5;
    var allValidTags = react_1.useMemo(function () { return __spreadArrays(preferenceLib_js_1.ApprovedSkills.map(function (s) { return ({ text: s.toLowerCase(), type: 'skill' }); }), preferenceLib_js_1.ApprovedPersonalities.map(function (p) { return ({ text: p.toLowerCase(), type: 'personality' }); })).sort(function (a, b) { return a.text.localeCompare(b.text); }); }, []);
    var filteredTags = react_1.useMemo(function () {
        if (!searchTerm)
            return allValidTags;
        return allValidTags.filter(function (tag) { return tag.text.includes(searchTerm.toLowerCase()); });
    }, [searchTerm, allValidTags]);
    var isPermanent = react_1.useMemo(function () {
        return email.trim() !== "" || password.trim() !== "" || pin.trim() !== "";
    }, [email, password, pin]);
    react_1.useEffect(function () {
        var _a, _b;
        if ((_b = (_a = window.game) === null || _a === void 0 ? void 0 : _a.input) === null || _b === void 0 ? void 0 : _b.keyboard) {
            isOpen ? window.game.input.keyboard.stopListeners() : window.game.input.keyboard.startListeners();
        }
        return function () { var _a, _b, _c; return (_c = (_b = (_a = window.game) === null || _a === void 0 ? void 0 : _a.input) === null || _b === void 0 ? void 0 : _b.keyboard) === null || _c === void 0 ? void 0 : _c.startListeners(); };
    }, [isOpen]);
    var initDatabaseListener = function (playerID) {
        var userRef = firebaseConfig_1.db.ref("webGame/" + playerID);
        userRef.on('value', function (snapshot) {
            var _a;
            var data = snapshot.val();
            if (data) {
                setName(data.name || "");
                validateName(data.name || "");
                setSelectedTags(data.tags || []);
                setGender(((_a = data.gender) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "male" ? "male" : "female");
                setSelectedCourses(data.courses || []);
                setEmail(data.email || "");
                validateEmail(data.email || "");
                setPassword(data.pass || "");
                setConfirmPassword(data.pass || "");
                validatePass(data.pass || "");
                setPin(data.pin || "");
                setConfirmPin(data.pin || "");
                validatePin(data.pin || "");
            }
            setLoading(false);
        });
    };
    var createNewAccount = function () {
        var newID = "name_" + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem("playerID", newID);
        firebaseConfig_1.db.ref("webGame/" + newID).set({
            createdAt: new Date().toISOString(),
            progress: 0
        });
        initDatabaseListener(newID);
    };
    react_1.useEffect(function () {
        if (!isOpen)
            return;
        var existingPlayerID = localStorage.getItem("playerID");
        if (!existingPlayerID) {
            createNewAccount();
        }
        else {
            initDatabaseListener(existingPlayerID);
        }
        return function () {
            var id = localStorage.getItem("playerID");
            if (id)
                firebaseConfig_1.db.ref("webGame/" + id).off('value');
        };
    }, [isOpen]);
    var switchView = function (target) {
        setView(target);
    };
    react_1.useEffect(function () {
        if (formError) {
            setIsDropdownOpen(false);
            var timer_1 = setTimeout(function () {
                setFormError(null);
            }, 4000);
            return function () { return clearTimeout(timer_1); };
        }
    }, [formError]);
    react_1.useEffect(function () {
        var handleClickOutside = function (event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return function () {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);
    var handleAddTag = function (tag) {
        if (selectedTags.find(function (t) { return t.text === tag.text; })) {
            setFormError({ field: 'tags', message: "Tag already added!" });
            return;
        }
        var count = selectedTags.filter(function (t) { return t.type === tag.type; }).length;
        if (count >= maxLimit) {
            setFormError({ field: 'tags', message: "Limit reached for " + tag.type + "!" });
            return;
        }
        setSelectedTags(__spreadArrays(selectedTags, [__assign(__assign({}, tag), { status: "valid" })]));
        setSearchTerm('');
        setIsDropdownOpen(false);
        setFormError(null);
    };
    var handleRemoveTag = function (index) {
        setSelectedTags(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
    };
    var handleCourseChange = function (courseValue) {
        setSelectedCourses(function (prev) {
            if (prev.includes(courseValue)) {
                return prev.filter(function (c) { return c !== courseValue; });
            }
            else {
                return __spreadArrays(prev, [courseValue]);
            }
        });
    };
    var validateName = function (val) {
        var isValid = /^[A-Za-z]{4,10}$/.test(val);
        setIsNameValid(isValid);
        return isValid;
    };
    var validateEmail = function (val) {
        var isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
        setIsEmailValid(isValid);
        return isValid;
    };
    var validatePass = react_1.useCallback(function (val) {
        var isValid = /^(?=.*[a-zA-Z])(?=.*[0-9]).{5,15}$/.test(val);
        setIsPassValid(isValid);
        return isValid;
    }, []);
    var validatePin = react_1.useCallback(function (val) {
        var isValid = /^\d{4}$/.test(val);
        setIsPinValid(isValid);
        return isValid;
    }, []);
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var playerID, cleanName, randomSuffix, dbRef, snapshot, existingData, finalEmail, finalName, finalPass, finalPin, invalidFields, requirements, fieldsText, reqsText, combinedMessage, updatedData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setFormError(null);
                    playerID = localStorage.getItem("playerID");
                    if (!playerID) {
                        cleanName = name.replace(/\s+/g, '').toLowerCase() || "player";
                        randomSuffix = Math.floor(1000 + Math.random() * 9000);
                        playerID = cleanName + "_" + randomSuffix;
                        localStorage.setItem("playerID", playerID);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    dbRef = firebaseConfig_1.db.ref("webGame");
                    return [4 /*yield*/, dbRef.child(playerID || "").get()];
                case 2:
                    snapshot = _a.sent();
                    existingData = snapshot.exists() ? snapshot.val() : {};
                    finalEmail = email.trim() || existingData.email;
                    finalName = name.trim() || existingData.name;
                    finalPass = password.trim() || existingData.pass;
                    finalPin = pin.trim() || existingData.pin;
                    invalidFields = [];
                    requirements = [];
                    if (isPermanent) {
                        if (!validateEmail(finalEmail)) {
                            invalidFields.push("email");
                            requirements.push("use a valid email (example@email.com)");
                        }
                        if (!validateName(finalName)) {
                            invalidFields.push("name");
                            requirements.push(finalName.length > 10 ? "max 10 letters for name" : "letters only for name");
                        }
                        if (!validatePass(finalPass)) {
                            invalidFields.push("password");
                            requirements.push("5-15 alphanumeric characters for the password");
                        }
                        if (!validatePin(finalPin)) {
                            invalidFields.push("PIN");
                            requirements.push("exactly 4 digits for the PIN");
                        }
                        if (password !== confirmPassword) {
                            invalidFields.push("password confirmation");
                            requirements.push("matching passwords");
                        }
                        if (pin !== confirmPin) {
                            invalidFields.push("PIN confirmation");
                            requirements.push("matching PIN numbers");
                        }
                        if (invalidFields.length > 0) {
                            fieldsText = invalidFields.join(" and ");
                            reqsText = requirements.join(" and ");
                            combinedMessage = "Please check your " + fieldsText + ", must " + reqsText + ".";
                            return [2 /*return*/, setFormError({ field: 'general', message: combinedMessage })];
                        }
                    }
                    updatedData = __assign(__assign({}, existingData), { name: name.trim() || existingData.name || "Guest", gender: gender === 'male' ? 'Male' : 'Female', tags: selectedTags, courses: selectedCourses, email: email.trim() || existingData.email || "", pass: password.trim() || existingData.pass || "", pin: pin.trim() || existingData.pin || "", temporary: !isPermanent, adminMode: false, playerMode: true, lastActive: Date.now(), savedAt: Date.now() });
                    if (!(isPermanent && typeof data_1.convertToPermanent === 'function')) return [3 /*break*/, 4];
                    return [4 /*yield*/, data_1.convertToPermanent(updatedData)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, dbRef.child(playerID).set(updatedData)];
                case 5:
                    _a.sent();
                    localStorage.setItem("playerData", JSON.stringify(updatedData));
                    alert(isPermanent ? "Account Updated Successfully!" : "Guest Progress Saved!");
                    onClose();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    alert("Failed to save character.");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen)
        return null;
    return (react_1["default"].createElement("div", { className: "modalBackdrop" },
        react_1["default"].createElement("button", { id: "closeButton", onClick: onClose }, "X"),
        react_1["default"].createElement("div", { className: "modalContainer" },
            react_1["default"].createElement("div", { className: "modalContent" }, loading ? react_1["default"].createElement("p", null, "Loading...") : (react_1["default"].createElement("section", { className: "accountManagementModal" },
                react_1["default"].createElement("h1", null, "PLAYER ACCOUNT MANAGEMENT"),
                react_1["default"].createElement("nav", { className: "navContainer" },
                    react_1["default"].createElement("button", { className: view === 'character' ? 'active' : '', onClick: function () { return switchView('character'); } }, "CHARACTER CREATION"),
                    react_1["default"].createElement("button", { className: view === 'preference' ? 'active' : '', onClick: function () { return switchView('preference'); } }, "PREFERENCES DISCOVERY"),
                    react_1["default"].createElement("button", { className: view === 'account' ? 'active' : '', onClick: function () { return switchView('account'); } }, "ACCOUNT CREATION")),
                react_1["default"].createElement("div", { className: "sliderViewport" },
                    react_1["default"].createElement("div", { className: "sliderWrapper " + view },
                        react_1["default"].createElement("div", { className: "page characterPage " + (view === 'character' ? 'activePage' : '') }, react_1["default"].createElement("div", { className: 'characterContainer' },
                            react_1["default"].createElement("label", { className: "mainHeader" }, "CREATE YOUR CHARACTER"),
                            react_1["default"].createElement("div", { className: "genderContainer" },
                                react_1["default"].createElement("div", { className: 'imgContainer' },
                                    react_1["default"].createElement("img", { src: "../../public/assets/Character/Static" + gender + ".gif", alt: 'Preview' })),
                                react_1["default"].createElement("div", { className: "genderToggle" },
                                    react_1["default"].createElement("label", { className: "subHeader" }, "Select Gender"),
                                    react_1["default"].createElement("button", { className: "select " + (gender === 'male' ? 'active' : ''), id: "maleButton", onClick: function () { return setGender('male'); } }, "Male"),
                                    react_1["default"].createElement("button", { className: "select " + (gender === 'female' ? 'active' : ''), id: "femaleButton", onClick: function () { return setGender('female'); } }, "Female"))),
                            react_1["default"].createElement("div", { className: "nameContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "What's your name?"),
                                react_1["default"].createElement("input", { type: "text", value: name, onChange: function (e) {
                                        var filtered = e.target.value.replace(/[^A-Za-z]/g, '');
                                        setName(filtered);
                                        validateName(filtered);
                                        setFormError(null);
                                    }, placeholder: "Enter your name...", maxLength: 10 }),
                                react_1["default"].createElement("p", { className: "requirementHint", style: { color: isNameValid ? '#cdff77' : name.length > 0 ? '#ff9090' : '#454545' } }, isNameValid ? "Nice name!" : "Use nicknames. Must be 4-10 letters for name")),
                            (formError === null || formError === void 0 ? void 0 : formError.field) === 'name' && react_1["default"].createElement("p", { className: "errorText" }, formError.message))),
                        react_1["default"].createElement("div", { className: "page preferencePage " + (view === 'preference' ? 'activePage' : '') }, react_1["default"].createElement("div", { className: "preferenceContainer" },
                            react_1["default"].createElement("label", { className: "mainHeader" }, "SPECIFY YOUR PERSONAL PREFERENCES"),
                            react_1["default"].createElement("div", { className: "tagsInputContainer" },
                                react_1["default"].createElement("div", { className: "dropdownContainer", ref: dropdownRef },
                                    react_1["default"].createElement("input", { type: "text", placeholder: "Type to search skills & personalities...", value: searchTerm, onFocus: function () { return setIsDropdownOpen(true); }, onChange: function (e) { return setSearchTerm(e.target.value); } }),
                                    isDropdownOpen && (react_1["default"].createElement("ul", { id: "tagsDropdown" }, filteredTags.map(function (tag, i) { return (react_1["default"].createElement("li", { key: i, onMouseDown: function () { return handleAddTag(tag); } }, tag.text)); })))),
                                react_1["default"].createElement("button", { id: "addButton", onClick: function () {
                                        var match = allValidTags.find(function (t) { return t.text === searchTerm.toLowerCase(); });
                                        if (match)
                                            handleAddTag(match);
                                    } }, "+ Add Tag")),
                            (formError === null || formError === void 0 ? void 0 : formError.field) === 'tags' && react_1["default"].createElement("p", { className: "errorText center" }, formError.message),
                            react_1["default"].createElement("div", { className: "savedTagsWrapper" },
                                react_1["default"].createElement("div", { id: "skillContainer" },
                                    react_1["default"].createElement("label", { className: "subHeader" },
                                        "Skill Tags ",
                                        react_1["default"].createElement("span", { id: "skillCounter" },
                                            "(",
                                            skills.length,
                                            "/",
                                            maxLimit,
                                            ")")),
                                    react_1["default"].createElement("ul", null, skills.length === 0 ? (react_1["default"].createElement("span", null, "No skills added...")) : (skills.map(function (tag, i) { return (react_1["default"].createElement("li", { key: i, className: "skill" },
                                        react_1["default"].createElement("span", null, tag.text),
                                        react_1["default"].createElement("button", { onClick: function () { return handleRemoveTag(selectedTags.indexOf(tag)); } }, "X"))); })))),
                                react_1["default"].createElement("div", { id: "personalityContainer" },
                                    react_1["default"].createElement("label", { className: "subHeader" },
                                        "Personality Tags ",
                                        react_1["default"].createElement("span", { id: "persCounter" },
                                            "(",
                                            personalities.length,
                                            "/",
                                            maxLimit,
                                            ")")),
                                    react_1["default"].createElement("ul", null, personalities.length === 0 ? (react_1["default"].createElement("span", null, "No traits added...")) : (personalities.map(function (tag, i) { return (react_1["default"].createElement("li", { key: i, className: "personality" },
                                        react_1["default"].createElement("span", null, tag.text),
                                        react_1["default"].createElement("button", { onClick: function () { return handleRemoveTag(selectedTags.indexOf(tag)); } }, "X"))); }))))),
                            react_1["default"].createElement("label", { className: "mainHeader" }, "BASED ON PLMUN AVAILABLE COURSES, DO YOU HAVE SPECIFIC COURSE IN MIND?"),
                            react_1["default"].createElement("div", { className: "courseSelectionContainer" },
                                react_1["default"].createElement("input", { type: "checkbox", id: "CITCS", name: "course", checked: selectedCourses.includes("College of Information Technology and Computer Studies (CITCS)"), onChange: function () { return handleCourseChange("College of Information Technology and Computer Studies (CITCS)"); } }),
                                react_1["default"].createElement("label", { htmlFor: "CITCS" },
                                    react_1["default"].createElement("strong", null, "COLLEGE OF INFORMATION TECHNOLOGY AND COMPUTER STUDIES (CITCS)"),
                                    react_1["default"].createElement("em", null, "Computer Science & IT program focusing on coding, AI, and systems.")),
                                react_1["default"].createElement("input", { type: "checkbox", id: "CCJ", name: "course", value: "College of Criminal Justice (CCJ)", checked: selectedCourses.includes("College of Criminal Justice (CCJ)"), onChange: function () { return handleCourseChange("College of Criminal Justice (CCJ)"); } }),
                                react_1["default"].createElement("label", { htmlFor: "CCJ" },
                                    react_1["default"].createElement("strong", null, "COLLEGE OF CRIMINAL JUSTICE (CCJ)"),
                                    react_1["default"].createElement("em", null, "Criminal Justice studies focusing on law enforcement, forensics, and criminology.")),
                                react_1["default"].createElement("input", { type: "checkbox", id: "CAS", name: "course", checked: selectedCourses.includes("College of Arts and Sciences (CAS)"), onChange: function () { return handleCourseChange("College of Arts and Sciences (CAS)"); } }),
                                react_1["default"].createElement("label", { htmlFor: "CAS" },
                                    react_1["default"].createElement("strong", null, "COLLEGE OF ARTS AND SCIENCES (CAS)"),
                                    react_1["default"].createElement("em", null, "Arts and Sciences track for critical thinking and creativity.")),
                                react_1["default"].createElement("input", { type: "checkbox", id: "CBA", name: "course", checked: selectedCourses.includes("College of Business Administration (CBA)"), onChange: function () { return handleCourseChange("College of Business Administration (CBA)"); } }),
                                react_1["default"].createElement("label", { htmlFor: "CBA" },
                                    react_1["default"].createElement("strong", null, "COLLEGE OF BUSINESS ADMINISTRATION (CBA)"),
                                    react_1["default"].createElement("em", null, "Business Administration with management and marketing foundations.")),
                                react_1["default"].createElement("input", { type: "checkbox", id: "CTE", name: "course", checked: selectedCourses.includes("College of Teacher Education (CTE)"), onChange: function () { return handleCourseChange("College of Teacher Education (CTE)"); } }),
                                react_1["default"].createElement("label", { htmlFor: "CTE" },
                                    react_1["default"].createElement("strong", null, "COLLEGE OF TEACHER EDUCATION (CTE)"),
                                    react_1["default"].createElement("em", null, "Education-focused program for teaching and pedagogy training.")),
                                react_1["default"].createElement("input", { type: "checkbox", id: "COM", name: "course", checked: selectedCourses.includes("College of Medicine (COM)"), onChange: function () { return handleCourseChange("College of Medicine (COM)"); } }),
                                react_1["default"].createElement("label", { htmlFor: "COM" },
                                    react_1["default"].createElement("strong", null, "COLLEGE OF MEDICINE (COM)"),
                                    react_1["default"].createElement("em", null, "Medicine program centered on healthcare, anatomy, and medical research.")),
                                react_1["default"].createElement("input", { type: "checkbox", id: "IPPG", name: "course", checked: selectedCourses.includes("Institute of Social Work (ISW)"), onChange: function () { return handleCourseChange("Institute of Social Work (ISW)"); } }),
                                react_1["default"].createElement("label", { htmlFor: "IPPG" },
                                    react_1["default"].createElement("strong", null, "INSTITUTE OF SOCIAL WORK (ISW)"),
                                    react_1["default"].createElement("em", null, "Social Work institute dedicated to community service and social welfare practices.")),
                                react_1["default"].createElement("input", { type: "checkbox", id: "ISW", name: "course", checked: selectedCourses.includes("Institute of Public Policy and Governance (IPPG)"), onChange: function () { return handleCourseChange("Institute of Public Policy and Governance (IPPG)"); } }),
                                react_1["default"].createElement("label", { htmlFor: "ISW" },
                                    react_1["default"].createElement("strong", null, "INSTITUTE OF PUBLIC POLICY AND GOVERNANCE (IPPG)"),
                                    react_1["default"].createElement("em", null, "Public Policy and Governance program focused on leadership and civic management."))),
                            (formError === null || formError === void 0 ? void 0 : formError.field) === 'course' && react_1["default"].createElement("p", { className: "errorText center" }, formError.message))),
                        react_1["default"].createElement("div", { className: "page accountPage " + (view === 'account' ? 'activePage' : '') }, react_1["default"].createElement("div", { className: "accountContainer" },
                            react_1["default"].createElement("label", { className: "mainHeader" }, "REGISTER ACCOUNT"),
                            react_1["default"].createElement("div", { className: "emailContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "Enter your Email"),
                                react_1["default"].createElement("input", { type: "email", value: email, onChange: function (e) {
                                        setEmail(e.target.value);
                                        validateEmail(e.target.value);
                                        setFormError(null);
                                    }, placeholder: "Enter your Email..." }),
                                react_1["default"].createElement("p", { className: "requirementHint", style: { color: isEmailValid ? '#cdff77' : email.length > 0 ? '#ff9090' : '#454545' } }, isEmailValid ? "Email verified!" : "Please use a valid email (example@email.com)")),
                            react_1["default"].createElement("div", { className: "passContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "Enter your Password"),
                                react_1["default"].createElement("div", { className: "passWrapper" },
                                    react_1["default"].createElement("input", { type: showPassword ? "text" : "password", value: password, onChange: function (e) {
                                            setPassword(e.target.value);
                                            validatePass(e.target.value);
                                        }, placeholder: "Enter your Password..." }),
                                    react_1["default"].createElement("button", { className: "togglePass", onClick: function () { return setShowPassword(!showPassword); } },
                                        react_1["default"].createElement("img", { src: "../../assets/WebAssets/Padlock" + (showPassword ? 'Opened' : 'Closed') + ".png", alt: "Show/Hide Password" }))),
                                react_1["default"].createElement("p", { className: "requirementHint", style: { color: isPassValid ? '#cdff77' : password.length > 0 ? '#ff9090' : '#454545' } }, isPassValid ? "Password verified!" : "Must be 5-10 alphanumeric characters")),
                            react_1["default"].createElement("div", { className: "confirmPassContainer" },
                                react_1["default"].createElement("label", { className: "subHeader" }, "Confirm your Password"),
                                react_1["default"].createElement("div", { className: "passWrapper" },
                                    react_1["default"].createElement("input", { type: showConfirmPassword ? "text" : "password", value: confirmPassword, onChange: function (e) { setConfirmPassword(e.target.value); }, placeholder: "Re-enter your Password..." }),
                                    react_1["default"].createElement("button", { className: "toggleConfirmPass", onClick: function () { return setShowConfirmPassword(!showConfirmPassword); } },
                                        react_1["default"].createElement("img", { src: "../../assets/WebAssets/Padlock" + (showConfirmPassword ? 'Opened' : 'Closed') + ".png", alt: "Show/Hide Password" }))),
                                react_1["default"].createElement("p", { className: "requirementHint", style: { color: password !== confirmPassword ? '#ff9090' : confirmPassword.length > 0 ? '#cdff77' : '#454545' } }, password === confirmPassword && confirmPassword.length > 0 ? "Passwords match!" : "Passwords must match")),
                            react_1["default"].createElement("div", { className: "pinLayout" },
                                react_1["default"].createElement("div", { className: "pinContainer" },
                                    react_1["default"].createElement("label", { className: "subHeader" }, "Enter your PIN number"),
                                    react_1["default"].createElement("div", { className: "pinWrapper" },
                                        react_1["default"].createElement("input", { type: showPin ? "text" : "password", value: pin, onChange: function (e) {
                                                var filtered = e.target.value.replace(/\D/g, '');
                                                setPin(filtered);
                                                validatePin(filtered);
                                            }, placeholder: "Enter your 4-digit PIN...", maxLength: 4 }),
                                        react_1["default"].createElement("button", { id: "togglePin", onClick: function () { return setShowPin(!showPin); } },
                                            react_1["default"].createElement("img", { src: "../../assets/WebAssets/Padlock" + (showPin ? 'Opened' : 'Closed') + ".png", alt: "Show/Hide PIN" }))),
                                    react_1["default"].createElement("p", { className: "requirementHint", style: { color: isPinValid ? '#cdff77' : pin.length > 0 ? '#ff9090' : '#454545' } }, isPinValid ? "PIN verified!" : "Requires exactly 4 digits")),
                                react_1["default"].createElement("div", { className: "confirmPinContainer" },
                                    react_1["default"].createElement("label", { className: "subHeader" }, "Confirm your PIN number"),
                                    react_1["default"].createElement("div", { className: "confirmPinWrapper" },
                                        react_1["default"].createElement("input", { type: showConfirmPin ? "text" : "password", value: confirmPin, onChange: function (e) { setConfirmPin(e.target.value.replace(/\D/g, '')); }, placeholder: "Re-enter your 4-digit PIN...", maxLength: 4 }),
                                        react_1["default"].createElement("button", { id: "toggleConfirmPin", onClick: function () { return setShowConfirmPin(!showConfirmPin); } },
                                            react_1["default"].createElement("img", { src: "../../assets/WebAssets/Padlock" + (showConfirmPin ? 'Opened' : 'Closed') + ".png", alt: "Show/Hide PIN" }))),
                                    react_1["default"].createElement("p", { className: "requirementHint", style: { color: pin !== confirmPin ? '#ff9090' : confirmPin.length > 0 ? '#cdff77' : '#454545' } }, pin === confirmPin && confirmPin.length > 0 ? "PINs match!" : "PINs must match"))))))),
                (formError === null || formError === void 0 ? void 0 : formError.field) === 'general' && (react_1["default"].createElement("div", { className: "errorContainer" },
                    react_1["default"].createElement("p", { className: "combinedErrorText" }, formError.message))),
                react_1["default"].createElement("div", { className: "btnWrapper" },
                    react_1["default"].createElement("button", { id: "saveButton", onClick: handleSave }, isPermanent ? "UPDATE ACCOUNT" : "SAVE AS GUEST"))))))));
};
exports["default"] = AccountManagement;
