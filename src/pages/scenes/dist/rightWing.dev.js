"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _firebaseConfig = require("../../components/firebaseConfig");

var _player = _interopRequireDefault(require("/src/pages/prefabs/player.js"));

var _controls = require("/src/pages/utils/controls.js");

var _settings = _interopRequireDefault(require("/src/pages/prefabs/settings.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var RightWing =
/*#__PURE__*/
function (_Phaser$Scene) {
  _inherits(RightWing, _Phaser$Scene);

  function RightWing() {
    _classCallCheck(this, RightWing);

    return _possibleConstructorReturn(this, _getPrototypeOf(RightWing).call(this, 'RightWing'));
  }

  _createClass(RightWing, [{
    key: "create",
    value: function create() {
      var _this = this;

      var screenCenterX, screenCenterY, bounds, spawnX, spawnY, lastPosition, lastScene, savedPos, playerID, snapshot, userData, gender, existingAudio, debugGraphics;
      return regeneratorRuntime.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
              screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
              this.bg = this.add.sprite(screenCenterX, screenCenterY, 'rightwingbg').setScale(1.5); // bg

              this.physics.world.setBounds(80, 400, 1140, 40); // bounds

              bounds = this.add.graphics().setDepth(100) //.lineStyle(4, 0xffff00, 1)
              .strokeRect(this.physics.world.bounds.x, this.physics.world.bounds.y, this.physics.world.bounds.width, this.physics.world.bounds.height);
              spawnX = 100;
              spawnY = 450;
              lastPosition = localStorage.getItem('lastActivePosition');
              lastScene = localStorage.getItem('lastActiveScene');

              if (lastPosition && lastScene === 'Hallway') {
                savedPos = JSON.parse(lastPosition);
                spawnX = savedPos.x;
                spawnY = savedPos.y;
                localStorage.removeItem('lastActivePosition');
              }

              playerID = localStorage.getItem("playerID");
              _context.next = 13;
              return regeneratorRuntime.awrap(_firebaseConfig.db.ref("webGame/".concat(playerID)).once('value'));

            case 13:
              snapshot = _context.sent;
              userData = snapshot.val();
              gender = userData && userData.gender ? userData.gender : 'male';
              this.player = new _player["default"](this, spawnX, spawnY, gender) // player
              .setDepth(1).setScale(3);
              existingAudio = this.sound.get('audiosample'); // audio

              if (!existingAudio) {
                this.gameAudio = this.sound.add('audiosample', {
                  loop: true
                });
                this.gameAudio.play();
              } else {
                this.gameAudio = existingAudio;

                if (!this.gameAudio.isPlaying) {
                  this.gameAudio.play();
                }
              }

              if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
              }

              this.settings = new _settings["default"](this); // settings

              this.settings.setDepth(3000);
              this.add.sprite(this.scale.width - 50, 10, 'settings').setScale(0.1).setOrigin(1, 0).setInteractive({
                useHandCursor: true
              }).on("pointerdown", function () {
                _this.player.body.setVelocity(0);

                _this.player.anims.stop();

                _this.settings.toggle();
              });
              this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
              debugGraphics = this.add.graphics(); //.lineStyle(2, 0x00ff00, 1);

              this.activeZone = null;
              this.zones = [{
                x: 50,
                y: 400,
                w: 50,
                h: 40,
                hintText1: "ENTER",
                hintText2: "HALLWAY ?",
                hintWidth: 130,
                spawnInNextScene: {
                  x: 5950,
                  y: 420
                },
                target: "Hallway"
              }, {
                x: 280,
                y: 400,
                w: 200,
                h: 40,
                hintText1: "DO YOU WANT TO",
                hintText2: "GO OUTSIDE ?",
                hintWidth: 190,
                spawnInNextScene: {
                  x: 1200,
                  y: 350
                },
                target: "Outdoor"
              }, {
                x: 700,
                y: 400,
                w: 220,
                h: 40,
                hintText1: "VIEW",
                hintText2: "LEADERBOARD ?",
                hintWidth: 170,
                spawnInNextScene: {
                  x: 50,
                  y: 420
                },
                target: ""
              }];
              this.zones.forEach(function (z) {
                debugGraphics.strokeRect(z.x, z.y, z.w, z.h);
              });
              this.mobileControls = (0, _controls.createMobileControls)(this);
              this.createUIElements();
              this.isMobileMode = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
              this.updateMobileUI();

            case 32:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "createUIElements",
    value: function createUIElements() {
      var _this2 = this;

      var screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
      var screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
      var color = 0x125729;
      var alpha = 0.9;
      var outlineColor = 0xffffff;
      this.hintBubble = this.add.graphics();
      this.zones.forEach(function (z) {
        _this2.hintLabel = _this2.add.container(0, 0).setVisible(false).setDepth(20);
        _this2.hintPart1 = _this2.add.text(0, 0, "", {
          fontFamily: '"Press Start 2P"',
          fontSize: "10px",
          fill: "#ffffff"
        }).setOrigin(0, 0.5);
        _this2.hintPart2 = _this2.add.text(0, 20, "", {
          fontFamily: '"Press Start 2P"',
          fontSize: "10px",
          fill: "#ffffff"
        }).setOrigin(0, 0.5);

        _this2.hintLabel.add([_this2.hintBubble, _this2.hintPart1, _this2.hintPart2]);
      });
    }
  }, {
    key: "update",
    value: function update() {
      if (!this.mobileControls || !this.player || !this.player.body) {
        return;
      }

      if (this.settings && this.settings.isOpened) {
        this.player.body.setVelocity(0, 0);
        this.player.anims.stop();
        return;
      }

      var joystick = this.mobileControls.getForce();
      this.player.update(this.isMobileMode, joystick.x, joystick.y, joystick.isRunning);
      this.checkProximity();
    }
  }, {
    key: "checkProximity",
    value: function checkProximity() {
      var _this3 = this;

      this.activeZone = this.zones.find(function (z) {
        return _this3.player.x >= z.x && _this3.player.x <= z.x + z.w && _this3.player.y >= z.y && _this3.player.y <= z.y + z.h;
      });

      if (this.activeZone) {
        var spaceJustDown = Phaser.Input.Keyboard.JustDown(this.spaceKey);
        var mobileInteractDown = this.mobileControls.isInteractJustDown();

        if (spaceJustDown || mobileInteractDown) {
          var returnPos = this.activeZone.spawnInNextScene || null;
          this.startPageTransition(this.activeZone.target, returnPos);
        }

        this.hintBubble.clear().fillStyle(0x125729, 0.9).lineStyle(4, 0xffffff, 1).fillRoundedRect(-20, -15, this.activeZone.hintWidth, 50, 10).strokeRoundedRect(-20, -15, this.activeZone.hintWidth, 50, 10);
        this.hintPart1.setText(this.activeZone.hintText1);
        this.hintPart2.setText(this.activeZone.hintText2);
        var labelX = this.activeZone.x;
        var labelY = this.activeZone.y - 120;

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          this.startPageTransition(this.activeZone.target);
        }

        if (this.activeZone.specialLayout) {
          this.hintLabel.setPosition(this.player.x - 170, this.player.y);
        } else {
          this.hintLabel.setPosition(this.player.x + 70, this.player.y);
        }

        this.hintLabel.setVisible(true);
      } else {
        this.hintLabel.setVisible(false);
      }
    }
  }, {
    key: "updateMobileUI",
    value: function updateMobileUI() {
      this.mobileControls.setVisible(this.isMobileMode);
    }
  }, {
    key: "toggleSettings",
    value: function toggleSettings() {
      this.settingsPanel.setVisible(!this.settingsPanel.visible);
    }
  }, {
    key: "startPageTransition",
    value: function startPageTransition(targetSceneName, lastPosition) {
      var _this4 = this;

      var width = this.scale.width;
      var height = this.scale.height;
      var overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setAlpha(0);
      overlay.setScrollFactor(0).setDepth(100);
      this.tweens.add({
        targets: overlay,
        alpha: 1,
        duration: 800,
        onComplete: function onComplete() {
          document.title = "".concat(targetSceneName, " - An AI-Driven 8-bit Web Game For Personalized College Program Matching and Career Exploration");
          localStorage.setItem('lastActiveScene', targetSceneName);

          if (lastPosition) {
            localStorage.setItem('lastActivePosition', JSON.stringify(lastPosition));
          }

          _this4.scene.start(targetSceneName);
        }
      });
    }
  }]);

  return RightWing;
}(Phaser.Scene);

exports["default"] = RightWing;