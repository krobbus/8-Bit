import { db } from '../../components/firebaseConfig';
import Player from '/src/pages/prefabs/player.js';
import NPC from '/src/pages/prefabs/npc.js';
import DialogueBubble from '/src/pages/prefabs/dialoguebubble.js';
import { createMobileControls } from '/src/pages/utils/controls.js';
import Settings from '/src/pages/prefabs/settings.js';

export default class Outdoor extends Phaser.Scene {
    constructor() {
        super('Outdoor');
    }

    async create(targetSceneName) {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.bg = this.add.sprite(screenCenterX, screenCenterY, 'outdoorbg').setScale(1.5);                 // bg
        this.physics.world.setBounds(70, 260, 1160, 220);                                                   // bounds
        let bounds = this.add.graphics().setDepth(100)
            //.lineStyle(4, 0xffff00, 1)
            .strokeRect(
            this.physics.world.bounds.x, 
            this.physics.world.bounds.y, 
            this.physics.world.bounds.width, 
            this.physics.world.bounds.height
        );

        let spawnX = 100;
        let spawnY = 450;
        const lastPosition = localStorage.getItem('lastActivePosition');
        const lastScene = localStorage.getItem('lastActiveScene');

        if (lastPosition && lastScene === 'Outdoor') {
            const savedPos = JSON.parse(lastPosition);
            spawnX = savedPos.x;
            spawnY = savedPos.y;

            localStorage.removeItem('lastActivePosition');
        }

        const playerID = localStorage.getItem("playerID");
        const snapshot = await db.ref(`webGame/${playerID}`).once('value');
        const userData = snapshot.val();
        const gender = (userData && userData.gender) ? userData.gender : 'male';
        const playerName = (userData && userData.name) ? userData.name : "Guest";        

        this.player = new Player(this, spawnX, spawnY, gender, playerName)                                          // player
            .setDepth(1)
            .setScale(1.8);

        this.npc = new NPC(this, 500, 420, 'female1').setScale(1.8);
        this.npcDialogue = new DialogueBubble(
            this,
            this.npc,
            [
                "Hello there, welcome\nto the campus!",
                "Your journey starts\nwith a single step.",
                "Talk to me if you\nneed directions."
            ],
            {
                offsetX: -20,
                offsetY: -90,
                maxWidth: 220,
                typeDelay: 45,
                linePause: 2000,
                loop: false,
                depth: 200,
                onComplete: () => {
                    window.dispatchEvent(new CustomEvent('openManualModal'));
                    this.npcDialogue.resetToIdle();
                }
            }
        );

        let existingAudio = this.sound.get('audiosample');                                                          // audio
        if (!existingAudio) { this.gameAudio = this.sound.add('audiosample', { loop: true });
        } else { this.gameAudio = existingAudio; }

        const startAudio = () => {
            if (this.sound.context.state === 'suspended') { this.sound.context.resume(); }
            if (!this.gameAudio.isPlaying) { this.gameAudio.play(); }
        };
        startAudio();

        this.input.once('pointerdown', () => { startAudio(); });

        this.settings = new Settings(this);                                                                 // settings
        this.settings.setDepth(3000);
        this.add.sprite(this.scale.width - 60, 80, 'settings')
            .setScale(0.1)
            .setDepth(3001)
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.player.body.setVelocity(0);
                this.player.anims.stop();

                const isModalOpened = document.querySelector('.modalBackdrop') || document.activeElement.tagName === 'INPUT';
                if (isModalOpened) return;
                this.settings.toggle();
            });
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        let debugGraphics = this.add.graphics().lineStyle(2, 0x00ff00, 1);
        this.activeZone = null;

        this.zones = [ 
            { 
                x: 850, y: 230, w: 160, h: 60,
                hintText1: "DO YOU WANT TO", hintText2: "ENTER LEFT WING ?",
                hintHeight: 50, hintWidth: 210, gapY: 15,
                spawnInNextScene: { x: 870, y: 400 }, target: 'LeftWing'
            },
            { 
                x: 1050, y: 300, w: 60, h: 100,
                hintText1: "DO YOU WANT TO", hintText2: "ENTER RIGHT WING ?",
                hintHeight: 50, hintWidth: 220, gapY: 15, specialLayout: true,
                spawnInNextScene: { x: 420, y: 400 }, target: 'RightWing'
            },
            {
                x: 470, y: 430, w: 60, h: 30,
                hintText1: "COMMUNICATE ?",
                hintHeight: 30, hintWidth: 170, gapY: 0,
                target: 'openManualModal'
            }
        ];
        this.zones.forEach(z => { debugGraphics.strokeRect(z.x, z.y, z.w, z.h); });

        const savedMode = localStorage.getItem('mobileMode');
        if (savedMode === null) {
            this.isMobileMode = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            localStorage.setItem('mobileMode', this.isMobileMode);
        } else { this.isMobileMode = savedMode === 'true'; }
        
        this.mobileControls = createMobileControls(this);
        this.createUIElements();
        this.updateMobileUI();
    }

    createUIElements(){
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        const obstacles = [                                                                            // obstacles
            { x: 350, y: 240, w: 610, h: 340 },
            { x: 410, y: 250, w: 720, h: 100 },
            { x: 1180, y: 240, w: 140, h: 340 },
            { x: 1150, y: 250, w: 100, h: 100 },
        ];
            this.obstacleGroup = this.physics.add.staticGroup(); 
        obstacles.forEach(ob => {
            let obstacle = this.add.rectangle(ob.x, ob.y, ob.w, ob.h);
            this.obstacleGroup.add(obstacle);
        });
        this.physics.add.collider(this.player, this.obstacleGroup);                                     // collider
        this.physics.add.collider(this.player, this.npc);

        this.stairZones = [                                                                             // stairs
            new Phaser.Geom.Rectangle(730, 230, 380, 70),
            new Phaser.Geom.Rectangle(600, 350, 520, 70)
        ];
        this.stairDebug = this.add.graphics()
            //.lineStyle(2, 0x00ffff, 1)
            .setDepth(100);
        this.stairZones.forEach(z => {
            this.stairDebug.strokeRect(z.x, z.y, z.width, z.height);
        });

        this.hintBubble = this.add.graphics()                                                            // hint
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

    update(){
        if (!this.mobileControls || !this.player || !this.player.body) return;

        if (this.settings && this.settings.isOpened) {
            this.player.body.setVelocity(0, 0);
            this.player.anims.stop();
            return;
        }
        
        const isModalOpened = document.querySelector('.modalBackdrop') || document.activeElement.tagName === 'INPUT';
        if (isModalOpened) {
            this.player.body.setVelocity(0);
            this.player.anims.stop();
            return;
        }

        const joystick = this.mobileControls.getForce();
        this.player.update(this.isMobileMode, joystick.x, joystick.y, joystick.isRunning);
        
        const onStairs = this.stairZones.some(z => 
            Phaser.Geom.Rectangle.Contains(z, this.player.x, this.player.y) 
        );
        if (onStairs) { this.applyStairPhysics() } else { this.player.body.setAllowGravity(true) }; 
        this.checkProximity();

        if (this.npcDialogue) this.npcDialogue.update();
    }

    checkProximity() {
        this.activeZone = this.zones.find(z => {
            return (
                this.player.x >= z.x && this.player.x <= z.x + z.w &&
                this.player.y >= z.y && this.player.y <= z.y + z.h
            );
        });

        if (this.activeZone) {
            const spaceJustDown = Phaser.Input.Keyboard.JustDown(this.spaceKey);
            const mobileInteractDown = this.mobileControls.isInteractJustDown();

            if (spaceJustDown || mobileInteractDown) {
                const returnPos = this.activeZone.spawnInNextScene || null;
                if (this.activeZone.target === 'openManualModal') {
                    this.npcDialogue.play();
                } else {
                    this.startPageTransition(this.activeZone.target, returnPos);
                }
            }

            this.hintBubble
                .clear()
                .fillStyle(0x125729, 0.9)
                .lineStyle(4, 0xffffff, 1)
                .fillRoundedRect(-20, -15, this.activeZone.hintWidth, this.activeZone.hintHeight, 10)
                .strokeRoundedRect(-20, -15, this.activeZone.hintWidth, this.activeZone.hintHeight, 10);

            this.hintPart1.setText(this.activeZone.hintText1);
            this.hintPart2.setText(this.activeZone.hintText2);

            const labelX = this.activeZone.x;
            const labelY = this.activeZone.y - 120;

            if (this.activeZone.specialLayout) {
                this.hintLabel.setPosition(this.player.x - 220, this.player.y - this.activeZone.gapY);
            } else {
                this.hintLabel.setPosition(this.player.x + 50, this.player.y - this.activeZone.gapY);
            }
            this.hintLabel.setVisible(true);
        } else {
            this.hintLabel.setVisible(false);
        }
    }

    applyStairPhysics() {
        const body = this.player.body;
        const speed = 0.2;
        const slope = 0.9;
        
        if (Math.abs(body.velocity.y) > 0.1) {
            body.velocity.y *= speed;
            body.velocity.x = -(body.velocity.y * slope);
            body.setAllowGravity(false);
        }
    }

    updateMobileUI() { this.mobileControls.setVisible(this.isMobileMode); }
    toggleSettings() { this.settingsPanel.setVisible(!this.settingsPanel.visible); }

    startPageTransition(targetSceneName, lastPosition) {
        const width = this.scale.width;
        const height = this.scale.height;

        let overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0);
        overlay.setScrollFactor(0).setDepth(5000);

        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 800,
            onComplete: () => {
                window.dispatchEvent(new CustomEvent('updateGameTitle', { 
                    detail: { text: `${targetSceneName} - An AI-Driven 8-bit Web Game For Personalized College Program Matching and Career Exploration` } 
                }));
                
                localStorage.setItem('lastActiveScene', targetSceneName);
                if (lastPosition){
                    localStorage.setItem('lastActivePosition', JSON.stringify(lastPosition));
                }
                this.scene.start(targetSceneName);
            }
        });
    }
}