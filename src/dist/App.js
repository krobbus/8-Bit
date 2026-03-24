"use strict";
exports.__esModule = true;
var react_1 = require("react");
var AccountManagement_1 = require("./components/AccountManagement");
var App = function () {
    var _a = react_1.useState(false), isModalOpen = _a[0], setIsModalOpen = _a[1];
    react_1.useEffect(function () {
        var handleOpenModal = function () {
            setIsModalOpen(true);
        };
        window.addEventListener('openAccountModal', handleOpenModal);
        return function () { return window.removeEventListener('openAccountModal', handleOpenModal); };
    }, []);
    return (react_1["default"].createElement("div", { className: "game-wrapper" },
        react_1["default"].createElement(PhaserGame, null),
        react_1["default"].createElement(AccountManagement_1["default"], { isOpen: isModalOpen, onClose: function () { return setIsModalOpen(false); } })));
};
exports["default"] = App;
