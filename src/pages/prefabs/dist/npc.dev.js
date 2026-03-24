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

var NPC =
/*#__PURE__*/
function (_Phaser$GameObjects$S) {
  _inherits(NPC, _Phaser$GameObjects$S);

  function NPC(scene, x, y, texture, frame) {
    var _this;

    _classCallCheck(this, NPC);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(NPC).call(this, scene, x, y, texture, frame));
    scene.add.existing(_assertThisInitialized(_this));
    scene.physics.add.existing(_assertThisInitialized(_this));

    _this.body.setCollideWorldBounds(true);

    _this.body.setImmovable(true);

    _this.body.setSize(30, 30).setOffset(10, 0);

    _this.initAnims();

    _this.play("".concat(texture, "-idle"), true);

    return _this;
  }

  _createClass(NPC, [{
    key: "initAnims",
    value: function initAnims() {
      var textureKey = this.texture.key;
      var animKey = "".concat(textureKey, "-idle");
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNumbers(textureKey, {
          start: 0,
          end: 3
        }),
        frameRate: 2,
        repeat: -1
      });
    }
  }, {
    key: "update",
    value: function update() {
      if (this.body) {
        this.body.setVelocity(0, 0);
      }
    }
  }]);

  return NPC;
}(Phaser.GameObjects.Sprite);

exports["default"] = NPC;