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

var Player =
/*#__PURE__*/
function (_Phaser$Physics$Arcad) {
  _inherits(Player, _Phaser$Physics$Arcad);

  function Player(scene, x, y, gender) {
    var _this;

    _classCallCheck(this, Player);

    var playerGender = gender && typeof gender === 'string' ? gender.toLowerCase() : 'male';
    var standAnim = "stand".concat(playerGender);
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Player).call(this, scene, x, y, standAnim));
    scene.add.existing(_assertThisInitialized(_this));
    scene.physics.add.existing(_assertThisInitialized(_this));
    _this.gender = playerGender;

    _this.setCollideWorldBounds(true);

    _this.body.setSize(10, 2).setOffset(20, 22);

    _this.cursors = scene.input.keyboard.createCursorKeys();
    _this.keys = scene.input.keyboard.addKeys('W,A,S,D,SHIFT');
    return _this;
  }

  _createClass(Player, [{
    key: "update",
    value: function update(isMobile, joystickX, joystickY, isRunning) {
      this.setVelocity(0);
      var speed = isRunning ? 400 : 200;

      if (!isMobile && this.keys.SHIFT.isDown) {
        speed = 400;
      }

      if (isMobile) {
        this.body.setVelocityX(joystickX * speed);
        this.body.setVelocityY(joystickY * speed);
      }

      var genderKey = this.gender;

      if (!isMobile) {
        if (this.cursors.left.isDown || this.keys.A.isDown) {
          this.setVelocityX(-speed);
          this.setFlipX(false);
          this.play("side".concat(genderKey), true);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
          this.setVelocityX(speed);
          this.setFlipX(true);
          this.play("side".concat(genderKey), true);
        } else if (this.cursors.up.isDown || this.keys.W.isDown) {
          this.setVelocityY(-speed);
          this.play("back".concat(genderKey), true);
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
          this.setVelocityY(speed);
          this.play("front".concat(genderKey), true);
        } else {
          this.play("stand".concat(genderKey), true);
        }
      } else {
        if (joystickX !== 0 || joystickY !== 0) {
          this.setVelocity(joystickX * speed, joystickY * speed);

          if (Math.abs(joystickX) > Math.abs(joystickY)) {
            this.play("side".concat(genderKey), true);
            this.setFlipX(joystickX > 0);
          } else {
            this.play(joystickY > 0 ? "front".concat(genderKey) : "back".concat(genderKey), true);
          }
        } else {
          this.play("stand".concat(genderKey), true);
        }
      }
    }
  }]);

  return Player;
}(Phaser.Physics.Arcade.Sprite);

exports["default"] = Player;