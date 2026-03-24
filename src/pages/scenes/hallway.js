import { db } from '../../components/firebaseConfig';
import Player from '/src/pages/prefabs/player.js';
import NPC from '/src/pages/prefabs/npc.js';
import { createMobileControls } from '/src/pages/utils/controls.js';
import Settings from '/src/pages/prefabs/settings.js';

export default class Hallway extends Phaser.Scene {
    constructor() {
        super('Hallway');
    }

    async create() {
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        const viewWidth = 1200;
        const viewHeight = 600;
        const xPadding = (this.scale.width - viewWidth) / 2;
        const yPadding = (this.scale.height - viewHeight) / 2;
        const hallwayWidth = 4000 * 1.5;
        this.cameras.main.setViewport(xPadding, yPadding, viewWidth, viewHeight);
        this.cameras.main.setBounds(0, 0, hallwayWidth, 600);

        this.bg = this.add.sprite(0, screenCenterY, 'hallwaybg')                                            // bg
            .setScale(1.5)
            .setOrigin(0, 0.5)

        this.physics.world.setBounds(0, 400, hallwayWidth, 40);                                             // bounds
        let bounds = this.add.graphics().setDepth(100)
            //.lineStyle(4, 0xffff00, 1)
            .strokeRect(
            this.physics.world.bounds.x, 
            this.physics.world.bounds.y, 
            this.physics.world.bounds.width, 
            this.physics.world.bounds.height
        );

        let spawnX = 100;
        let spawnY = 420;
        const lastPosition = localStorage.getItem('lastActivePosition');
        const lastScene = localStorage.getItem('lastActiveScene');

        if (lastPosition && lastScene === 'Hallway') {
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
            .setScale(3);

        this.npc = new NPC(this, 2000, 400, 'male1').setScale(3);
        this.npc = new NPC(this, 2970, 400, 'group').setScale(3);
            
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        let existingAudio = this.sound.get('audiosample');                                                          // audio
        if (!existingAudio){
            this.gameAudio = this.sound.add('audiosample', { loop: true });
            this.gameAudio.play();
        } else{
            this.gameAudio = existingAudio;

            if (!this.gameAudio.isPlaying) {
                this.gameAudio.play();
            }
        }

        if (this.sound.context.state === 'suspended'){
            this.sound.context.resume();
        }

        this.settings = new Settings(this);                                                                         // settings
        this.settings.setDepth(3000);
        this.add.sprite(viewWidth - 10, 80, 'settings')
            .setScale(0.1)
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.player.body.setVelocity(0);
                this.player.anims.stop();
                this.settings.toggle();
            });

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        let debugGraphics = this.add.graphics();//.lineStyle(2, 0x00ff00, 1);
        this.activeZone = null;

        this.zones = [
            { 
                x: 0, y: 400, w: 50, h: 40, 
                hintText2: "ENTER LEFT WING ?", hintWidth: 210, 
                spawnInNextScene: { x: 1160, y: 420 }, target: "LeftWing"
            },
            { x: 60, y: 400, w: 590, h: 40, hintText2: "PLAY CITCS ?", hintWidth: 180, target: "openModal", course: "CITCS" },
            { x: 720, y: 400, w: 590, h: 40, hintText2: "PLAY CCJ ?", hintWidth: 180, target: "openModal", course: "CCJ" },
            { x: 1390, y: 400, w: 590, h: 40, hintText2: "PLAY CBA ?", hintWidth: 180, target: "openModal", course: "CBA" },
            { x: 2050, y: 400, w: 590, h: 40, hintText2: "PLAY CAS ?", hintWidth: 180, target: "openModal", course: "CAS" },
            { x: 3375, y: 400, w: 590, h: 40, hintText2: "PLAY CTE ?", hintWidth: 180, target: "openModal", course: "CTE" },
            { x: 4040, y: 400, w: 590, h: 40, hintText2: "PLAY COM ?", hintWidth: 180, target: "openModal", course: "COM" },
            { x: 4705, y: 400, w: 590, h: 40, hintText2: "PLAY ISW ?", hintWidth: 180, target: "openModal", course: "ISW" },
            { x: 5365, y: 400, w: 590, h: 40, hintText2: "PLAY IPPG ?", hintWidth: 180, target: "openModal", course: "IPPG", specialLayout1: true},
            { 
                x: 5960, y: 400, w: 50, h: 40, 
                hintText2: "ENTER RIGHT WING ?", hintWidth: 220, 
                spawnInNextScene: { x: 50, y: 420 }, target: "RightWing", specialLayout2: true
            }
        ];
        this.zones.forEach(z => {
            debugGraphics.strokeRect(z.x, z.y, z.w, z.h);
        });

        this.isMenuOpen = false;
        this.menuIndex = 0;
        this.menuOptions = [
            { text: "COURSE-RELATED ASSESSMENT", target: "Classroom", type: "CourseRelated" },
            { text: "SKILL ASSESSMENT", target: "Classroom", type: "Skill" },
            { text: "PERSONALITY ASSESSMENT", target: "Classroom", type: "Personality" },
            { text: "CANCEL", target: "cancel" }
        ];

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
        this.hintBubble = this.add.graphics();
        this.hintLabel = this.add.container(0, 0).setVisible(false).setDepth(20);
            this.hintPart1 = this.add.text(0, 0, "DO YOU WANT TO", {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                fill: "#ffffff"
            }).setOrigin(0, 0.5);

            this.hintPart2 = this.add.text(0, 20, "", {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                fill: "#ffffff"
            }).setOrigin(0, 0.5);

            this.menuHeader = this.add.text(0, 0, "SELECT TYPE OF ASSESSMENT:", {
                fontFamily: '"Press Start 2P"', 
                fontSize: "10px", 
                fill: "#ffffff"
            }).setVisible(false);

            this.menuPointer = this.add.text(0, 0, "<", { 
                fontFamily: '"Press Start 2P"', 
                fontSize: "10px", 
                fill: "#80ff60"
            }).setVisible(false);
        this.hintLabel.add([this.hintBubble, this.hintPart1, this.hintPart2, this.menuHeader, this.menuPointer]);

        this.menuTextObjects = [];
        this.menuOptions.forEach((opt, i) => {
            let txt = this.add.text(0, i * 25 + 35, opt.text, { 
                fontFamily: '"Press Start 2P"', 
                fontSize: "10px", 
                fill: "#ffffff"
            });
            this.menuTextObjects.push(txt);
            this.hintLabel.add(txt);
        });
    }

    update(){
        if (!this.mobileControls || !this.player || !this.player.body) return;
        
        const isModalOpened = document.querySelector('.modalBackdrop') || document.activeElement.tagName === 'INPUT';
        if ((this.settings && this.settings.isOpened) || isModalOpened || this.isMenuOpen) {
            this.player.body.setVelocity(0);
            this.player.anims.stop();
            this.checkProximity();
            return;
        }
        
        const joystick = this.mobileControls.getForce();
        this.player.update(this.isMobileMode, joystick.x, joystick.y, joystick.isRunning);
        this.checkProximity();
    }

    checkProximity() {
        const interactJustDown = Phaser.Input.Keyboard.JustDown(this.spaceKey);
        const upJustDown = 
            Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)) ||
            Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W));
        const downJustDown = 
            Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)) ||
            Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S));

        this.activeZone = this.zones.find(z => {
            return (
                this.player.x >= z.x && this.player.x <= z.x + z.w &&
                this.player.y >= z.y && this.player.y <= z.y + z.h
            );
        });

        if (!this.activeZone) {
            this.isMenuOpen = false;
            if (this.hintLabel) this.hintLabel.setVisible(false);
            return;
        }

        const mobileUp = this.mobileControls.isDpadUpJustDown ? this.mobileControls.isDpadUpJustDown() : false;
        const mobileDown = this.mobileControls.isDpadDownJustDown ? this.mobileControls.isDpadDownJustDown() : false;
        const mobileInteractDown = this.mobileControls.isInteractJustDown();

        const isUp = upJustDown || mobileUp;
        const isDown = downJustDown || mobileDown;
        const isInteracting = interactJustDown || mobileInteractDown;

        if (this.activeZone.target === 'openModal') {
            if (!this.isMenuOpen) {
                if (isInteracting) {
                    this.isMenuOpen = true;
                    this.menuIndex = 0;
                }
            } else {
                if (isUp) this.menuIndex = (this.menuIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
                if (isDown) this.menuIndex = (this.menuIndex + 1) % this.menuOptions.length;

                if (isInteracting) {
                const choice = this.menuOptions[this.menuIndex];
                if (choice.target === "cancel") {
                    this.isMenuOpen = false;
                } else {
                    this.startPageTransition(choice.target, null, this.activeZone.course, choice.type);
                }
            }
            }
        } else {
            this.menuPointer.setVisible(false);
            this.isMenuOpen = false;

            if (isInteracting) {
                const returnPos = this.activeZone.spawnInNextScene || null;
                this.startPageTransition(this.activeZone.target, returnPos);
            }
        }

        this.isMenuOpen ? this.renderMenu() : this.renderStandardHint();
    }

    renderStandardHint(){
        if (this.menuHeader) this.menuHeader.setVisible(false);
        this.menuPointer.setVisible(false);
        this.menuTextObjects.forEach(t => t.setVisible(false));

        this.hintBubble
            .clear()
            .fillStyle(0x125729, 0.9)
            .lineStyle(4, 0xffffff, 1)
            .fillRoundedRect(-20, -15, this.activeZone.hintWidth, 50, 10)
            .strokeRoundedRect(-20, -15, this.activeZone.hintWidth, 50, 10);
        
        const labelX = this.activeZone.x;
        const labelY = this.activeZone.y - 120;
        
        this.hintPart1.setVisible(true);
        this.hintPart2.setVisible(true).setText(this.activeZone.hintText2);

        const offsetX = this.activeZone.specialLayout1 ? -210 : this.activeZone.specialLayout2 ? -260 : 70;
        this.hintLabel.setPosition(this.player.x + offsetX, this.player.y - 15);
        this.hintLabel.setVisible(true);
    }

    renderMenu(){
        const isMenu = this.activeZone.target === 'openModal' && this.isMenuOpen;

        this.hintBubble
            .clear()
            .fillStyle(0x125729, 0.9)
            .lineStyle(4, 0xffffff, 1)
            .fillRoundedRect(-20, -15, 310, 155, 10)
            .strokeRoundedRect(-20, -15, 310, 155, 10);

        this.hintPart1.setVisible(!isMenu);
        this.hintPart2.setVisible(!isMenu);
        if (this.menuHeader) this.menuHeader.setVisible(isMenu);
        
        if (isMenu) {
            this.menuTextObjects.forEach((txt, i) => {
                txt.setVisible(true);
                const isSelected = (i === this.menuIndex);
                const isCancel = this.menuOptions[i].target === "cancel";

                if (isSelected) {
                    txt.setFill(isCancel ? "#ff5555" : "#80ff60");
                    this.menuPointer.setFill(isCancel ? "#ff5555" : "#80ff60");
                    this.menuPointer.setVisible(true);
                    this.menuPointer.setPosition(txt.x + txt.width + 10, txt.y);
                } else { txt.setFill("#ffffff"); }
            });
        } else {
            this.menuPointer.setVisible(false);
            this.menuTextObjects.forEach(t => t.setVisible(false));
            this.hintPart1.setText(this.activeZone.hintText1);
            this.hintPart2.setText(this.activeZone.hintText2);
        }

        const hasSpecialLayout = this.activeZone.specialLayout1 || this.activeZone.specialLayout2;
        const offsetX = hasSpecialLayout ? -320 : 70;

        this.hintLabel.setPosition(this.player.x + offsetX, this.player.y - 60);
        this.hintLabel.setVisible(true);
    }

    updateMobileUI() { this.mobileControls.setVisible(this.isMobileMode); }
    toggleSettings() { this.settingsPanel.setVisible(!this.settingsPanel.visible); }

    startPageTransition(targetSceneName, lastPosition, courseName, typeName){
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
                    detail: { text: `${targetSceneName} | ${courseName} | ${typeName} - An AI-Driven 8-bit Web Game For Personalized College Program Matching and Career Exploration` } 
                }));
                
                localStorage.setItem('lastActiveScene', targetSceneName);
                if (lastPosition){
                    localStorage.setItem('lastActivePosition', JSON.stringify(lastPosition));
                }
                this.scene.start(targetSceneName, { 
                    selectedCourse: courseName,
                    selectedType: typeName,
                    prevPos: lastPosition 
                });
            }
        });
    }
}