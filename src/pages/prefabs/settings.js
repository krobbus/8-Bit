export default class SettingsPanel extends Phaser.GameObjects.Container {
    constructor(scene) {
        const { width, height } = scene.scale;
        super(scene, width / 2, height / 2);

        const storedMobileMode = localStorage.getItem('mobileMode') === 'true';
        scene.isMobileMode = storedMobileMode;

        const volumes = {
            HIGH: 1.0,
            MEDIUM: 0.5,
            LOW: 0.2,
            OFF: 0
        };
        const volumesOrder = ['HIGH', 'MEDIUM', 'LOW', 'OFF'];
        const storedVolume = localStorage.getItem('volumeLevel') || 'HIGH';
        scene.sound.volume = volumes[storedVolume];
        scene.sound.mute = storedVolume === 'OFF';

        this.scene = scene;
        this.setDepth(100);
        this.setVisible(false);
        this.setScrollFactor(0);

        let panelBg = scene.add.rectangle(0, 0, 380, 420, 0x125729)
            .setStrokeStyle(5, 0xffffff);
        this.add(panelBg);

        const items = [
            { key: 'title', text: 'SETTINGS', y: -160, size: '22px', fill: '#ffffff' },
            { key: 'mobile', text: `Mobile Mode: ${scene.isMobileMode ? 'ON' : 'OFF'}`, y: -100, size: '18px', fill: '#ffffff', interactive: true },
            { key: 'volume', text: `Sound: ${storedVolume}`, y: -60, size: '18px', fill: '#ffffff', interactive: true },
        ];

        if (scene.scene.key === 'Classroom') {
            items.push(
                { key: 'resume', text: 'Resume', y: 60, size: '18px', fill: '#77ff77', interactive: true },
                { key: 'back', text: 'Return to Hallway', y: 110, size: '18px', fill: '#ffff77', interactive: true },
                { key: 'exit', text: 'Exit To Title', y: 160, size: '18px', fill: '#ff8383', interactive: true }
            );
        } else{
            items.push(
                { key: 'resume', text: 'Resume', y: 110, size: '18px', fill: '#77ff77', interactive: true },
                { key: 'exit', text: 'Exit To Title', y: 160, size: '18px', fill: '#ff8383', interactive: true }
            );
        };
        
        this.menuTexts = {};

        items.forEach(item => {
            let txt = scene.add.text(0, item.y, item.text, {
                fontFamily: '"Press Start 2P"',
                fontSize: item.size,
                fill: item.fill,
                align: "center"
            }).setScrollFactor(0).setOrigin(0.5);

            if (item.interactive) {
                txt.setInteractive({ useHandCursor: true });
                this.setupItemEvents(item.key, txt);
            }

            this.menuTexts[item.key] = txt;
            this.add(txt);
        });

        scene.add.existing(this);
    }

    setupItemEvents(key, textObj) {
        textObj.on('pointerdown', async () => {
            switch (key) {
                case 'mobile':
                    this.scene.isMobileMode = !this.scene.isMobileMode;
                    localStorage.setItem('mobileMode', this.scene.isMobileMode);
                    this.scene.updateMobileUI(); 
                    textObj.setText("Mobile Mode: " + (this.scene.isMobileMode ? "ON" : "OFF"));
                    break;

                case 'volume':
                    const currentLevel = localStorage.getItem('volumes') || 'HIGH';
                    const currentIndex = volumesOrder.indexOf(currentLevel);
                    const nextLevel = volumesOrder[(currentIndex + 1) % volumesOrder.length];

                    localStorage.setItem('volumes', nextLevel);
                    this.scene.sound.volume = volumes[nextLevel];
                    this.scene.sound.mute = nextLevel === 'OFF';

                    textObj.setText(`Sound: ${nextLevel}`);
                    break;
                
                case 'back':
                    this.handleBackToHallway();
                    break;

                case 'resume':
                    this.toggle();
                    break;

                case 'exit':
                    await this.handleExit();
                    break;
            }
        });
    }

    handleBackToHallway() {
        window.dispatchEvent(new CustomEvent('updateGameTitle', { 
            detail: { text: "Hallway - An AI-Driven 8-bit Web Game For Personalized College Program Matching and Career Exploration" } 
        }));

        this.toggle();
        this.scene.scene.start('Hallway');
    }

    async handleExit() {
        const playerID = localStorage.getItem("playerID");
        const snapshot = await db.ref("webGame/" + playerID).once("value");
        const data = snapshot.val();

        if (data) {
            if (data.temporary) {
                await db.ref("webGame/" + playerID).remove();
            } else {
                await updatePlayerData({ lastActive: Date.now(), progress: data.progress || 0 });
            }
        }
        localStorage.removeItem("playerID");
        window.location.href = "./index.html";
    }

    toggle() {
        this.isOpened = !this.isOpened;
        this.setVisible(this.isOpened);
    }
}