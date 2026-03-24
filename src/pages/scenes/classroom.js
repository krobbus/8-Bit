import { db } from '../../components/firebaseConfig';
import { createMobileControls } from '/src/pages/utils/controls.js';
import Settings from '/src/pages/prefabs/settings.js';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:10000' 
    : 'https://eight-bit-backend.onrender.com';

export default class Classroom extends Phaser.Scene {
    constructor() {
        super('Classroom');
        this.courseQuestions = [];
        this.currentQuestionIndex = 0;
    }

    init(data) {
        const courseNames = {
            CITCS: "COLLEGE OF INFORMATION TECHNOLOGY AND COMPUTER STUDIES (CITCS)",
            CCJ: "COLLEGE OF CRIMINAL JUSTICE (CCJ)",
            CBA: "COLLEGE OF BUSINESS ADMINISTRATION (CBA)",
            CAS: "COLLEGE OF ARTS AND SCIENCES (CAS)",
            CTE: "COLLEGE OF TEACHER EDUCATION (CTE)",
            COM: "COLLEGE OF MEDICINE (COM)",
            ISW: "INSTITUTE OF SOCIAL WORK (ISW)",
            IPPG: "INSTITUTE OF PUBLIC POLICY AND GOVERNANCE (IPPG)"
        };

        const typeNames = {
            CourseRelated: "COURSE-RELATED ASSESSMENT",
            Skill: "SKILL ASSESSMENT",
            Personality: "PERSONALITY ASSESSMENT",
        };
        this.courseCode = data.selectedCourse; 
        this.rawType = data.selectedType;
        this.selectedCourse = courseNames[data.selectedCourse] || "GENERAL";
        this.selectedType = typeNames[data.selectedType] || "ASSESSMENT";
    }

    async create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        const playerID = localStorage.getItem("playerID");
        const snapshot = await db.ref(`webGame/${playerID}`).once('value');
        const userData = snapshot.val();
        const playerName = (userData && userData.name) ? userData.name : "Guest";
        this.gender = (userData && userData.gender) ? userData.gender.toLowerCase() : 'male';
        
        this.bg = this.add.sprite(screenCenterX, screenCenterY, `default${this.gender}`).setScale(1.5);                // bg

        this.headerContainer = this.add.container(0, 10);                                                              // header
            const CourseText = this.add.text(screenCenterX, 30, `${this.selectedCourse}`, {  
                fontFamily: '"Press Start 2P"',
                fontSize: "14px",
                color: "#344E41",
                align: "center"
            }).setOrigin(0.5, 0);

            const typeText = this.add.text(screenCenterX, 60, `${this.selectedType}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: "12px",
                color: "#588157",
                align: "center"
            }).setOrigin(0.5, 0);

            const gap = 10;
            const padding = 20;
            const totalTextHeight = CourseText.height + gap + typeText.height;
            const headerHeight = totalTextHeight + (padding * 2);
            const headerWidth = Math.max(CourseText.width, typeText.width) + 40;

            CourseText.y = gap + padding;
            typeText.y = CourseText.y + CourseText.height + gap;
            
            this.headerContainerStyle = this.add.graphics()
                .clear()
                .fillStyle(0xA3B18A, 1)
                .lineStyle(4, 0x344E41, 1)
                .fillRoundedRect(screenCenterX - headerWidth / 2, gap, headerWidth, headerHeight, 10)
                .strokeRoundedRect(screenCenterX - headerWidth / 2, gap, headerWidth, headerHeight, 10);
        this.headerContainer.add([this.headerContainerStyle, CourseText, typeText]);
        this.headerContainer.setDepth(100);

        this.nameContainer = this.add.container(230, 300);
            this.nameText = this.add.text(0, 0, playerName, {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                fill: "#ffffff",
                align: "center",
                resolution: 4
            }).setOrigin(0.5);

            const namePadding = 8;
            const bgW = this.nameText.width + namePadding * 2;
            const bgH = this.nameText.height + namePadding;

            this.nameBg = this.add.graphics()
                .fillStyle(0x125729, 1)
                .fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 5)
                .strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 5);
        this.nameContainer.add([this.nameBg, this.nameText]);
        this.nameContainer.setDepth(100);

        let existingAudio = this.sound.get('audiosample');                                                             // audio
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

        this.settings = new Settings(this);                                                                           // settings
        this.settings.setDepth(3000);
        this.add.sprite(this.scale.width - 60, 80, 'settings')
            .setScale(0.1)
            .setDepth(3001)
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.settings.toggle());
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        let debugGraphics = this.add.graphics().lineStyle(2, 0x00ff00, 1);
        this.activeZone = null;

        const savedMode = localStorage.getItem('mobileMode');
        if (savedMode === null) {
            this.isMobileMode = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            localStorage.setItem('mobileMode', this.isMobileMode);
        } else { this.isMobileMode = savedMode === 'true'; }
        
        this.mobileControls = createMobileControls(this);
        this.updateMobileUI();
        this.classroomAnims();
        this.loadQuestions();
    }

    classroomAnims() {
        const states = [
            'default', 'thinking',
            'student1', 'student2',
            'student3', 'student4',
            'student5', 'student6',
            'student7', 'student8'
        ];

        states.forEach(state => {
            const animKey = `${state}${this.gender}`;
            
            if (!this.anims.exists(animKey)) {
                this.anims.create({
                    key: animKey,
                    frames: this.anims.generateFrameNumbers(animKey, { start: 0, end: 1 }),
                    frameRate: 2, 
                    repeat: -1
                });
            }
        });
    }

    questionUI(question){
        if (this.questionContainer) this.questionContainer.destroy();

        this.questionContainer = this.add.container(270, 10);
            const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
            const fixedWidth = 570; 
            const padding = 30;
            const boxY = 150;
                
            this.questionText = this.add.text(screenCenterX, 0, question, {
                fontFamily: '"Press Start 2P"',
                fontSize: "12px",
                fill: "#ffffff",
                align: "center",
                wordWrap: { width: fixedWidth - (padding * 2) },
                lineSpacing: 10,
                resolution: 4
            }).setOrigin(0.5, 0);
            
            const dynamicHeight = this.questionText.height + (padding * 2);

            this.questionContainerStyle = this.add.graphics()
                .clear()
                .fillStyle(0xA3B18A, 1)
                .lineStyle(4, 0x344E41, 1)
                .fillRoundedRect(screenCenterX - fixedWidth / 2, boxY, fixedWidth, dynamicHeight, 10)
                .strokeRoundedRect(screenCenterX - fixedWidth / 2, boxY, fixedWidth, dynamicHeight, 10);
        this.questionText.y = boxY + padding;
        this.questionContainer.add([this.questionContainerStyle, this.questionText]);
        this.questionContainer.setDepth(100);
    }

    optionsUI(options) {
        if (this.optionsContainer) this.optionsContainer.destroy();

        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        const buttonWidth = 350;
        const buttonHeight = 40;
        const verticalGap = 10;
        const horizontalStep = 30;
        const paddingBottom = 60;

        const startX = (screenWidth / 3) - (buttonWidth / 2) + (horizontalStep * 1.5);
        const startY = screenHeight + paddingBottom;
        this.optionsContainer = this.add.container(startX, startY);

        const option = [...options];
        option.forEach((optionText, index) => {
            const labels = ['A', 'B', 'C', 'D'];
            const xPos = index * horizontalStep;
            const yPos = -(index + 1) * (buttonHeight + verticalGap);

            const optionsStyleContainer = this.add.graphics()
                .fillStyle(0x344E41, 1)
                .lineStyle(2, 0xA3B18A, 1)
                .fillRoundedRect(xPos, yPos, buttonWidth, buttonHeight, 8)
                .strokeRoundedRect(xPos, yPos, buttonWidth, buttonHeight, 8);

            const optionsText = this.add.text(xPos + 20, yPos + (buttonHeight / 2), `${labels[index]}. ${optionText}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                fill: "#ffffff",
                wordWrap: { width: buttonWidth - 40 }
            }).setOrigin(0, 0.5);

            const hitArea = new Phaser.Geom.Rectangle(xPos, yPos, buttonWidth, buttonHeight);      
            optionsStyleContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
                .on('pointerover', () => optionsStyleContainer.alpha(0.8))
                .on('pointerout', () => optionsStyleContainer.alpha(1))
                .on('pointerdown', () => this.handleAnswer(optionText));

            this.optionsContainer.add([optionsStyleContainer, optionsText]);
        });
        this.optionsContainer.setDepth(100);
    }

    async loadQuestions(){
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.questionUI("Thinking questions...");
        this.optionsUI(['Option A', 'Option B', 'Option C', 'Option D']);

        const animKey = `thinking${this.gender}`;
        if (this.anims.exists(animKey)) { this.bg.play(animKey); } else { this.bg.setTexture(animKey); };

        const isAssessment = ["PERSONALITY ASSESSMENT", "SKILL ASSESSMENT"].includes(this.selectedType);
        const endpoint = isAssessment ? '/api/generate-assessment' : '/api/generate-quiz';

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    courseName: this.courseCode,
                    quizType: this.rawType
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown Server Error" }));
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            }

            const data = await response.json();
            if (data.questions && data.questions.length > 0) {
                courseQuestions = data.questions;

                /*
                if ("MultipleChoice".includes(selectedType)) {
                    courseQuestions = courseQuestions.map(q => ({
                        question: q.question,
                        options: q.options || [],
                        answer: q.answer,
                        explanation: q.explanation
                    }));
                }
                */

                this.questionUI(firstQ.question, firstQ.options || []);
                this.bg.play(`default${this.gender}`);
            } else { 
                throw new Error("Empty questions list"); 
            }
        } catch (err) {
            this.loadUI("Error: Check your connection or API key.");
        }
    }

    update(){
        if (!this.mobileControls) return;
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