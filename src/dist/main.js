"use strict";
exports.__esModule = true;
var react_1 = require("react");
var client_1 = require("react-dom/client");
var phaser_1 = require("phaser");
var bootScene_js_1 = require("./pages/scenes/bootScene.js");
var loadingScene_js_1 = require("./pages/scenes/loadingScene.js");
var outdoor_js_1 = require("./pages/scenes/outdoor.js");
var leftWing_js_1 = require("./pages/scenes/leftWing.js");
var hallway_js_1 = require("./pages/scenes/hallway.js");
var rightWing_js_1 = require("./pages/scenes/rightWing.js");
var AccountManagement_js_1 = require("./components/AccountManagement.js");
var Dashboard_js_1 = require("./components/Dashboard.js");
var config = {
    type: phaser_1["default"].AUTO,
    width: 1300,
    height: 600,
    input: {
        activePointers: 3
    },
    physics: {
        "default": 'arcade',
        arcade: {
            debug: true
        }
    },
    render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true
    },
    scale: {
        mode: phaser_1["default"].Scale.FIT,
        autoCenter: phaser_1["default"].Scale.CENTER_BOTH,
        parent: 'game-container',
        expandParent: false
    },
    scene: [bootScene_js_1["default"], loadingScene_js_1["default"], outdoor_js_1["default"], leftWing_js_1["default"], hallway_js_1["default"], rightWing_js_1["default"]]
};
var UIOverlay = function () {
    var _a = react_1.useState(false), isAccountOpen = _a[0], setIsAccountOpen = _a[1];
    var _b = react_1.useState(false), isDashboardOpen = _b[0], setIsDashboardOpen = _b[1];
    react_1.useEffect(function () {
        var game = new phaser_1["default"].Game(config);
        window.game = game;
        var handleOpenAccountModal = function () { return setIsAccountOpen(true); };
        var handleOpenDashboardModal = function () { return setIsDashboardOpen(true); };
        window.addEventListener('openAccountModal', handleOpenAccountModal);
        window.addEventListener('openDashboardModal', handleOpenDashboardModal);
        return function () {
            game.destroy(true);
            window.removeEventListener('openAccountModal', handleOpenAccountModal);
            window.removeEventListener('openDashboardModal', handleOpenDashboardModal);
        };
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(AccountManagement_js_1["default"], { isOpen: isAccountOpen, onClose: function () { return setIsAccountOpen(false); } }),
        React.createElement(Dashboard_js_1["default"], { isOpen: isDashboardOpen, onClose: function () { return setIsDashboardOpen(false); } })));
};
var rootElement = document.getElementById('ui-root');
if (rootElement) {
    var root = client_1["default"].createRoot(rootElement);
    root.render(React.createElement(UIOverlay, null));
}
