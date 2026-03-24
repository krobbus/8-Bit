"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _assetLib = require("../data/assetLib.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var LoadingScene =
/*#__PURE__*/
function (_Phaser$Scene) {
  _inherits(LoadingScene, _Phaser$Scene);

  function LoadingScene() {
    _classCallCheck(this, LoadingScene);

    return _possibleConstructorReturn(this, _getPrototypeOf(LoadingScene).call(this, 'Loading'));
  }

  _createClass(LoadingScene, [{
    key: "preload",
    value: function preload() {
      var _this = this;

      var screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
      var screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
      WebFont.load({
        google: {
          families: ['Press Start 2P']
        },
        active: function active() {
          _this.fontsLoaded = true;
        }
      });
      this.anims.create({
        key: 'hourglassAnim',
        frames: this.anims.generateFrameNumbers('hourglass', {
          start: 0,
          end: 13
        }),
        frameRate: 12,
        repeat: -1
      });
      this.add.sprite(screenCenterX, screenCenterY - 60, 'hourglass').setScale(0.8).play('hourglassAnim');
      this.loadingText = this.add.text(screenCenterX, screenCenterY + 60, "Loading... 0%", {
        fontFamily: '"Press Start 2P"',
        fontSize: "1rem",
        fill: "#ffffff"
      }).setOrigin(0.5);

      _assetLib.AssetLib.spritesheets.forEach(function (asset) {
        _this.load.spritesheet(asset.key, asset.path, {
          frameWidth: asset.width,
          frameHeight: asset.height
        });
      });

      _assetLib.AssetLib.images.forEach(function (asset) {
        return _this.load.image(asset.key, asset.path);
      });

      _assetLib.AssetLib.audio.forEach(function (asset) {
        return _this.load.audio(asset.key, asset.path);
      });

      this.load.on('progress', function (value) {
        _this.loadingText.setText("Loading... ".concat(Math.floor(value * 100), "%"));
      });
    }
  }, {
    key: "create",
    value: function create() {
      var _this2 = this;

      var playerid, snapshot, anims;
      return regeneratorRuntime.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this.loadingText.setText("Fetching Player Data...");
              _context.prev = 1;
              playerid = window.playerID || localStorage.getItem("playerID");

              if (!playerid) {
                _context.next = 9;
                break;
              }

              _context.next = 6;
              return regeneratorRuntime.awrap(window.db.ref("webGame/" + playerid).once("value"));

            case 6:
              snapshot = _context.sent;
              window.playerData = snapshot.val();
              console.log("Data loaded:", window.playerData);

            case 9:
              _context.next = 14;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](1);
              console.error("Firebase error:", error);

            case 14:
              anims = [{
                key: 'standmale',
                asset: 'standmale',
                end: 3,
                rate: 2
              }, {
                key: 'standfemale',
                asset: 'standfemale',
                end: 3,
                rate: 2
              }, {
                key: 'frontmale',
                asset: 'frontmale',
                end: 3,
                rate: 6
              }, {
                key: 'frontfemale',
                asset: 'frontfemale',
                end: 3,
                rate: 6
              }, {
                key: 'sidemale',
                asset: 'sidemale',
                end: 5,
                rate: 6
              }, {
                key: 'sidefemale',
                asset: 'sidefemale',
                end: 5,
                rate: 6
              }, {
                key: 'backmale',
                asset: 'backmale',
                end: 3,
                rate: 6
              }, {
                key: 'backfemale',
                asset: 'backfemale',
                end: 3,
                rate: 6
              }];
              anims.forEach(function (anim) {
                _this2.anims.create({
                  key: anim.key,
                  frames: _this2.anims.generateFrameNumbers(anim.asset, {
                    start: 0,
                    end: anim.end
                  }),
                  frameRate: anim.rate,
                  repeat: -1
                });
              });
              this.loadingText.setText("Ready!");
              this.time.delayedCall(1000, function () {
                var lastScene = localStorage.getItem('lastActiveScene') || 'Outdoor';

                _this2.scene.start(lastScene);
              });

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[1, 11]]);
    }
  }]);

  return LoadingScene;
}(Phaser.Scene);

exports["default"] = LoadingScene;