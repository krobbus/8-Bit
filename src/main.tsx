import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Phaser from 'phaser';

import LoadingScene from './pages/scenes/loadingScene.js';
import Outdoor from './pages/scenes/outdoor.js';
import LeftWing from './pages/scenes/leftWing.js';
import Hallway from './pages/scenes/hallway.js';
import Classroom from './pages/scenes/classroom.js';
import RightWing from './pages/scenes/rightWing.js';

import AccountManagement from './components/AccountManagement.js';
import Dashboard from './components/Dashboard.js';

declare global {
  interface Window {
    game: Phaser.Game;
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1300,
  height: 600,
  input: { 
    activePointers: 3
  },
  physics: { 
    default: 'arcade',
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
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    expandParent: false
  },
  scene: [LoadingScene, Outdoor, LeftWing, Hallway, Classroom, RightWing]
};

const UIOverlay = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  useEffect(() => {
    const game = new Phaser.Game(config);
    window.game = game;

    let titleInterval: ReturnType<typeof setInterval>;

    const handleUpdateTitle = (e: any) => {
      if (titleInterval) clearInterval(titleInterval);

      let titleText = e.detail.text + " | ";
      titleInterval = setInterval(() => {
        titleText = titleText.substring(1) + titleText.substring(0, 1);
        document.title = titleText;
      }, 250);
    };
    window.addEventListener('updateGameTitle', handleUpdateTitle);

    const handleOpenAccountModal = () => setIsAccountOpen(true);
    const handleOpenDashboardModal = () => setIsDashboardOpen(true);

    window.addEventListener('openAccountModal', handleOpenAccountModal);
    window.addEventListener('openDashboardModal', handleOpenDashboardModal);

    return () => {
      game.destroy(true);
      if (titleInterval) clearInterval(titleInterval);
      window.removeEventListener('updateGameTitle', handleUpdateTitle);
      window.removeEventListener('openAccountModal', handleOpenAccountModal);
      window.removeEventListener('openDashboardModal', handleOpenDashboardModal);
    };
  }, []);

  return (
    <>
      <AccountManagement 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
      />

      <Dashboard 
        isOpen={isDashboardOpen} 
        onClose={() => setIsDashboardOpen(false)} 
      />
    </>
  );
};

const rootElement = document.getElementById('ui-root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<UIOverlay />);
}