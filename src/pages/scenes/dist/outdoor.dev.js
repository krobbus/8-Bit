"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _firebaseConfig = require("../../components/firebaseConfig");

var _player = _interopRequireDefault(require("/src/pages/prefabs/player.js"));

var _npc = _interopRequireDefault(require("/src/pages/prefabs/npc.js"));

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

var Outdoor =
/*#__PURE__*/
function (_Phaser$Scene) {
  _inherits(Outdoor, _Phaser$Scene);

  function Outdoor() {
    _classCallCheck(this, Outdoor);

    return _possibleConstructorReturn(this, _getPrototypeOf(Outdoor).call(this, 'Outdoor'));
  }

  _createClass(Outdoor, [{
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
              this.bg = this.add.sprite(screenCenterX, screenCenterY, 'outdoorbg').setScale(1.5); // bg

              this.physics.world.setBounds(70, 260, 1160, 220); // bounds

              bounds = this.add.graphics().setDepth(100) //.lineStyle(4, 0xffff00, 1)
              .strokeRect(this.physics.world.bounds.x, this.physics.world.bounds.y, this.physics.world.bounds.width, this.physics.world.bounds.height);
              spawnX = 100;
              spawnY = 450;
              lastPosition = localStorage.getItem('lastActivePosition');
              lastScene = localStorage.getItem('lastActiveScene');

              if (lastPosition && lastScene === 'Outdoor') {
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
              .setDepth(1).setScale(1.8);
              this.npc = new _npc["default"](this, 500, 420, 'female1').setScale(1.8);
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
              this.add.sprite(this.scale.width - 50, 10, 'settings').setScale(0.1).setDepth(3001).setOrigin(1, 0).setInteractive({
                useHandCursor: true
              }).on("pointerdown", function () {
                _this.player.body.setVelocity(0);

                _this.player.anims.stop();

                var isModalOpened = document.querySelector('.modalBackdrop') || document.activeElement.tagName === 'INPUT';
                if (isModalOpened) return;

                _this.settings.toggle();
              });
              this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
              debugGraphics = this.add.graphics().lineStyle(2, 0x00ff00, 1);
              this.activeZone = null;
              this.zones = [{
                x: 850,
                y: 230,
                w: 160,
                h: 60,
                hintText1: "DO YOU WANT",
                hintText2: "TO ENTER ?",
                hintHeight: 50,
                hintWidth: 150,
                spawnInNextScene: {
                  x: 870,
                  y: 400
                },
                target: 'LeftWing'
              }, {
                x: 470,
                y: 430,
                w: 60,
                h: 30,
                hintText1: "COMMUNICATE ?",
                hintHeight: 30,
                hintWidth: 170,
                target: 'OPEN_DASHBOARD_MODAL'
              }];
              this.zones.forEach(function (z) {
                debugGraphics.strokeRect(z.x, z.y, z.w, z.h);
              });
              this.mobileControls = (0, _controls.createMobileControls)(this);
              this.createUIElements();
              this.isMobileMode = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
              this.updateMobileUI();

            case 33:
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
      var obstacles = [// obstacles
      {
        x: 350,
        y: 240,
        w: 610,
        h: 340
      }, {
        x: 410,
        y: 250,
        w: 720,
        h: 100
      }, {
        x: 1180,
        y: 240,
        w: 140,
        h: 340
      }, {
        x: 1150,
        y: 250,
        w: 100,
        h: 100
      }];
      this.obstacleGroup = this.physics.add.staticGroup();
      obstacles.forEach(function (ob) {
        var obstacle = _this2.add.rectangle(ob.x, ob.y, ob.w, ob.h);

        _this2.obstacleGroup.add(obstacle);
      });
      this.physics.add.collider(this.player, this.obstacleGroup); // collider

      this.physics.add.collider(this.player, this.npc);
      this.stairZones = [// stairs
      new Phaser.Geom.Rectangle(730, 250, 380, 70), new Phaser.Geom.Rectangle(600, 350, 520, 70)];
      this.stairDebug = this.add.graphics() //.lineStyle(2, 0x00ffff, 1)
      .setDepth(100);
      this.stairZones.forEach(function (z) {
        _this2.stairDebug.strokeRect(z.x, z.y, z.width, z.height);
      });
      this.hintBubble = this.add.graphics() // hint
      .fillStyle(0x125729, 0.8).lineStyle(4, 0xffffff, 1).fillRoundedRect(-20, -15, 150, 50, 10).strokeRoundedRect(-20, -15, 150, 50, 10);
      this.hintLabel = this.add.container(0, 0).setVisible(false).setDepth(20);
      this.hintPart1 = this.add.text(0, 0, "", {
        fontFamily: '"Press Start 2P"',
        fontSize: "10px",
        fill: "#ffffff"
      }).setOrigin(0, 0.5);
      this.hintPart2 = this.add.text(0, 20, "", {
        fontFamily: '"Press Start 2P"',
        fontSize: "10px",
        fill: "#ffffff"
      }).setOrigin(0, 0.5);
      this.hintLabel.add([this.hintBubble, this.hintPart1, this.hintPart2]);
    }
  }, {
    key: "update",
    value: function update() {
      var _this3 = this;

      if (!this.mobileControls || !this.player || !this.player.body) {
        return;
      }

      if (this.settings && this.settings.isOpened) {
        this.player.body.setVelocity(0, 0);
        this.player.anims.stop();
        return;
      }

      var isModalOpened = document.querySelector('.modalBackdrop') || document.activeElement.tagName === 'INPUT';

      if (isModalOpened) {
        this.player.body.setVelocity(0);
        this.player.anims.stop();
        return;
      }

      var joystick = this.mobileControls.getForce();
      this.player.update(this.isMobileMode, joystick.x, joystick.y, joystick.isRunning);
      var onStairs = this.stairZones.some(function (z) {
        return Phaser.Geom.Rectangle.Contains(z, _this3.player.x, _this3.player.y);
      });

      if (onStairs) {
        this.applyStairPhysics();
      } else {
        this.player.body.setAllowGravity(true);
      }

      ;
      this.checkProximity();
    }
  }, {
    key: "checkProximity",
    value: function checkProximity() {
      var _this4 = this;

      this.activeZone = this.zones.find(function (z) {
        return _this4.player.x >= z.x && _this4.player.x <= z.x + z.w && _this4.player.y >= z.y && _this4.player.y <= z.y + z.h;
      });

      if (this.activeZone) {
        var spaceJustDown = Phaser.Input.Keyboard.JustDown(this.spaceKey);
        var mobileInteractDown = this.mobileControls.isInteractJustDown();

        if (spaceJustDown || mobileInteractDown) {
          var returnPos = this.activeZone.spawnInNextScene || null;
          this.startPageTransition(this.activeZone.target, returnPos);
        }

        this.hintBubble.clear().fillStyle(0x125729, 0.9).lineStyle(4, 0xffffff, 1).fillRoundedRect(-20, -15, this.activeZone.hintWidth, this.activeZone.hintHeight, 10).strokeRoundedRect(-20, -15, this.activeZone.hintWidth, this.activeZone.hintHeight, 10);
        this.hintPart1.setText(this.activeZone.hintText1);
        this.hintPart2.setText(this.activeZone.hintText2);
        var labelX = this.activeZone.x;
        var labelY = this.activeZone.y - 120;
        this.hintLabel.setPosition(this.player.x + 70, this.player.y).setVisible(true);
      } else {
        this.hintLabel.setVisible(false);
      }
    }
  }, {
    key: "applyStairPhysics",
    value: function applyStairPhysics() {
      var body = this.player.body;
      var speed = 0.2;
      var slope = 0.9;

      if (Math.abs(body.velocity.y) > 0.1) {
        body.velocity.y *= speed;
        body.velocity.x = -(body.velocity.y * slope);
        body.setAllowGravity(false);
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
      var _this5 = this;

      if (targetSceneName === 'OPEN_DASHBOARD_MODAL') {
        this.input.keyboard.resetKeys();
        window.dispatchEvent(new CustomEvent('openDashboardModal'));
        return;
      }

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

          _this5.scene.start(targetSceneName);
        }
      });
    }
  }]);

  return Outdoor;
}(Phaser.Scene);

exports["default"] = Outdoor;