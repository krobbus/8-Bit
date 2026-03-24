"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var SettingsPanel =
/*#__PURE__*/
function (_Phaser$GameObjects$C) {
  _inherits(SettingsPanel, _Phaser$GameObjects$C);

  function SettingsPanel(scene) {
    var _this;

    _classCallCheck(this, SettingsPanel);

    var _scene$scale = scene.scale,
        width = _scene$scale.width,
        height = _scene$scale.height;
    _this = _possibleConstructorReturn(this, _getPrototypeOf(SettingsPanel).call(this, scene, width / 2, height / 2));
    _this.scene = scene;

    _this.setDepth(100);

    _this.setVisible(false);

    _this.setScrollFactor(0);

    var panelBg = scene.add.rectangle(0, 0, 380, 420, 0x000000, 0.9).setStrokeStyle(5, 0xffffff);

    _this.add(panelBg);

    var items = [{
      key: 'title',
      text: 'Settings',
      y: -140,
      size: '22px',
      fill: '#ffff00'
    }, {
      key: 'mobile',
      text: "Mobile Mode: ".concat(scene.isMobileMode ? 'ON' : 'OFF'),
      y: -80,
      size: '18px',
      fill: '#ffffff',
      interactive: true
    }, {
      key: 'volume',
      text: "Sound: ".concat(scene.sound.mute ? 'OFF' : 'ON'),
      y: -40,
      size: '18px',
      fill: '#ffffff',
      interactive: true
    }, {
      key: 'resume',
      text: 'Resume',
      y: 100,
      size: '18px',
      fill: '#00ff00',
      interactive: true
    }, {
      key: 'exit',
      text: 'Exit To Title',
      y: 150,
      size: '18px',
      fill: '#ff0000',
      interactive: true
    }];
    _this.menuTexts = {};
    items.forEach(function (item) {
      var txt = scene.add.text(0, item.y, item.text, {
        fontFamily: '"Press Start 2P"',
        fontSize: item.size,
        fill: item.fill,
        align: "center"
      }).setScrollFactor(0).setOrigin(0.5);

      if (item.interactive) {
        txt.setInteractive({
          useHandCursor: true
        });

        _this.setupItemEvents(item.key, txt);
      }

      _this.menuTexts[item.key] = txt;

      _this.add(txt);
    });
    scene.add.existing(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(SettingsPanel, [{
    key: "setupItemEvents",
    value: function setupItemEvents(key, textObj) {
      var _this2 = this;

      textObj.on('pointerdown', function _callee() {
        return regeneratorRuntime.async(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.t0 = key;
                _context.next = _context.t0 === 'mobile' ? 3 : _context.t0 === 'volume' ? 7 : _context.t0 === 'resume' ? 10 : _context.t0 === 'exit' ? 12 : 15;
                break;

              case 3:
                _this2.scene.isMobileMode = !_this2.scene.isMobileMode;

                _this2.scene.updateMobileUI();

                textObj.setText("Mobile Mode: " + (_this2.scene.isMobileMode ? "ON" : "OFF"));
                return _context.abrupt("break", 15);

              case 7:
                _this2.scene.sound.mute = !_this2.scene.sound.mute;
                textObj.setText("Sound: " + (_this2.scene.sound.mute ? "ON" : "OFF"));
                return _context.abrupt("break", 15);

              case 10:
                _this2.toggle();

                return _context.abrupt("break", 15);

              case 12:
                _context.next = 14;
                return regeneratorRuntime.awrap(_this2.handleExit());

              case 14:
                return _context.abrupt("break", 15);

              case 15:
              case "end":
                return _context.stop();
            }
          }
        });
      });
    }
  }, {
    key: "handleExit",
    value: function handleExit() {
      var playerID, snapshot, data;
      return regeneratorRuntime.async(function handleExit$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              playerID = localStorage.getItem("playerID");
              _context2.next = 3;
              return regeneratorRuntime.awrap(db.ref("webGame/" + playerID).once("value"));

            case 3:
              snapshot = _context2.sent;
              data = snapshot.val();

              if (!data) {
                _context2.next = 13;
                break;
              }

              if (!data.temporary) {
                _context2.next = 11;
                break;
              }

              _context2.next = 9;
              return regeneratorRuntime.awrap(db.ref("webGame/" + playerID).remove());

            case 9:
              _context2.next = 13;
              break;

            case 11:
              _context2.next = 13;
              return regeneratorRuntime.awrap(updatePlayerData({
                lastActive: Date.now(),
                progress: data.progress || 0
              }));

            case 13:
              localStorage.removeItem("playerID");
              window.location.href = "../index.html";

            case 15:
            case "end":
              return _context2.stop();
          }
        }
      });
    }
  }, {
    key: "toggle",
    value: function toggle() {
      this.isOpened = !this.isOpened;
      this.setVisible(this.isOpened);
    }
  }]);

  return SettingsPanel;
}(Phaser.GameObjects.Container);

exports["default"] = SettingsPanel;