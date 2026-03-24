"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMobileControls = createMobileControls;

function createMobileControls(scene) {
  if (!scene) return;
  var state = {
    forceX: 0,
    forceY: 0,
    interactPressed: false,
    isRunning: false
  };
  var idleAlpha = 0.5;
  var activeAlpha = 1.0;
  var screenHeight = scene.scale.height;
  var screenWidth = scene.scale.width;
  var dpadContainer = scene.add.container(0, 0) // d-pad
  .setSize(200, 200).setInteractive().setVisible(false).setDepth(1000).setScrollFactor(0);
  var dpadVisual = scene.add.sprite(0, 0, 'dpadunclicked').setScale(3);
  dpadContainer.add(dpadVisual);

  var createZone = function createZone(x, y, width, height, direction) {
    var zone = scene.add.rectangle(x, y, width, height, 0x000000, 0).setInteractive();
    zone.on('pointerdown', function () {
      if (direction === 'up') {
        state.forceY = -1;
        dpadVisual.setTexture('dpadup').setAlpha(activeAlpha);
      }

      if (direction === 'down') {
        state.forceY = 1;
        dpadVisual.setTexture('dpaddown').setAlpha(activeAlpha);
      }

      if (direction === 'left') {
        state.forceX = -1;
        dpadVisual.setTexture('dpadleft').setAlpha(activeAlpha);
      }

      if (direction === 'right') {
        state.forceX = 1;
        dpadVisual.setTexture('dpadright').setAlpha(activeAlpha);
      }
    });
    return zone;
  };

  var upZone = createZone(0, -40, 60, 50, 'up').setScrollFactor(0);
  var downZone = createZone(0, 40, 60, 50, 'down').setScrollFactor(0);
  var leftZone = createZone(-40, 0, 50, 60, 'left').setScrollFactor(0);
  var rightZone = createZone(40, 0, 50, 60, 'right').setScrollFactor(0);
  dpadContainer.add([upZone, downZone, leftZone, rightZone]);
  scene.input.on('pointerup', function () {
    state.forceX = 0;
    state.forceY = 0;
    dpadVisual.setTexture('dpadunclicked').setAlpha(idleAlpha);
  });
  var interactBtn = scene.add.sprite(0, 0, 'interactunselected') // interact
  .setInteractive().setScrollFactor(0).setDepth(1000).setScale(2).setAlpha(idleAlpha).setVisible(false);
  interactBtn.on('pointerdown', function () {
    interactBtn.setTexture('interactselected').setAlpha(activeAlpha);
    state.interactPressed = true;

    if (scene.activeZone) {
      scene.startPageTransition(scene.activeZone.target);
    }
  });
  interactBtn.on('pointerup', function () {
    interactBtn.setTexture('interactunselected').setAlpha(idleAlpha);
    state.interactPressed = false;
  });
  var runBtn = scene.add.sprite(0, 0, 'rununclicked') // run
  .setInteractive().setScrollFactor(0).setDepth(1000).setScale(2).setAlpha(idleAlpha).setVisible(false);
  runBtn.on('pointerdown', function () {
    runBtn.setTexture('runclicked').setAlpha(activeAlpha);
    state.isRunning = true;
  });
  runBtn.on('pointerup', function () {
    runBtn.setTexture('rununclicked').setAlpha(idleAlpha);
    state.isRunning = false;
  });

  var reposition = function reposition() {
    var viewWidth = scene.cameras.main.width;
    var viewHeight = scene.cameras.main.height;
    dpadContainer.setPosition(150, viewHeight - 160);
    runBtn.setPosition(viewWidth - 130, viewHeight - 280);
    interactBtn.setPosition(viewWidth - 150, viewHeight - 160);
  };

  reposition();
  return {
    reposition: reposition,
    setVisible: function setVisible(bool) {
      dpadContainer.setVisible(bool);
      runBtn.setVisible(bool);
      interactBtn.setVisible(bool);
    },
    getForce: function getForce() {
      return {
        x: state.forceX,
        y: state.forceY,
        isRunning: state.isRunning
      };
    },
    isInteractJustDown: function isInteractJustDown() {
      var val = state.interactPressed;
      state.interactPressed = false;
      return val;
    }
  };
}