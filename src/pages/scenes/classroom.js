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
        if (!data || !data.selectedCourse) {
            console.warn("No course selected. Redirecting to Hallway...");
            this.time.delayedCall(1, () => {
                this.scene.start('Hallway'); 
            });
            return;
        }

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

        this.nameContainer = this.add.container(230, 300);                                                      // name tag
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
                resolution: 2
            }).setOrigin(0.5, 0);
            
            const dynamicHeight = this.questionText.height + (padding * 2);

            this.questionContainerStyle = this.add.graphics()
                .fillStyle(0x344E41, 1)
                .lineStyle(2, 0xA3B18A, 1)
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

        const verticalGap = 10;
        const paddingSide = 20;
        const paddingTopBottom = 12;
        const maxWidth = 400;

        this.optionsContainer = this.add.container(120, 0);

        let currentY = 0;
        const labels = ['A', 'B', 'C', 'D'];

        const startX = 200;
        const offsetStep = 50;

        options.forEach((optionText, index) => {
            const currentX = startX - (index * offsetStep);

            const tempText = this.add.text(0, 0, `${labels[index]}. ${optionText}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px"
            });

            const wrap = tempText.width > (maxWidth - (paddingSide * 2));
            const finalWidth = wrap ? maxWidth : tempText.width + (paddingSide * 2);
            tempText.destroy();

            const optionsText = this.add.text(paddingSide, paddingTopBottom, `${labels[index]}. ${optionText}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                align: "center",
                fill: "#ffffff",
                wordWrap: wrap ? { width: maxWidth - (paddingSide * 2) } : null,
                lineSpacing: 5,
                resolution: 2
            }).setOrigin(0, 0);

            const finalHeight = optionsText.height + (paddingTopBottom * 2);
            const optionsStyleContainer = this.add.graphics()
                .fillStyle(0x344E41, 1)
                .lineStyle(2, 0xA3B18A, 1)
                .fillRoundedRect(0, 0, finalWidth, finalHeight, 8)
                .strokeRoundedRect(0, 0, finalWidth, finalHeight, 8);

            const hitArea = new Phaser.Geom.Rectangle(0, 0, finalWidth, finalHeight);    
            optionsStyleContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
                .on('pointerover', () => { 
                    if (!this.isSettingsOpen) optionsStyleContainer.setAlpha(0.8);
                })
                .on('pointerout', () => optionsStyleContainer.setAlpha(1))
                .on('pointerdown', () => {
                    if (this.isSettingsOpen) return; 
                    this.handleAnswer(optionText);
                });

            const buttonContainer = this.add.container(currentX, currentY, [optionsStyleContainer, optionsText]);
            this.optionsContainer.add(buttonContainer);
            currentY += finalHeight + verticalGap;
        });
        this.optionsContainer.y = screenHeight - currentY - 40;
        this.optionsContainer.setDepth(100);
    }

    async loadQuestions(){
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.questionUI("Thinking questions...");
        this.optionsUI(['...', '...', '...', '...']);

        const animKey = `thinking${this.gender}`;
        if (this.anims.exists(animKey)) this.bg.play(animKey);

        const isAssessment = ["PERSONALITY ASSESSMENT", "SKILL ASSESSMENT"].includes(this.rawType);
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
                this.courseQuestions = data.questions;
                this.currentQuestionIndex = 0;

                const firstQ = this.courseQuestions[0];
                this.questionUI(firstQ.question);
                this.optionsUI(firstQ.options || []);

                this.bg.play(`default${this.gender}`);
            } else { 
                throw new Error("Error: Empty questions list"); 
            }
        } catch (err) {
            this.questionUI("Connection Failed: The AI is sleeping. Check your backend connection.");
        }
    }

    handleAnswer(selectedOption) {
        if (this.optionsContainer) this.optionsContainer.setVisible(false);
        const raiseHandAnim = `student2${this.gender}`;
        if (this.anims.exists(raiseHandAnim)) this.bg.play(raiseHandAnim, true);

        this.showAnswerBubble(selectedOption);

        this.time.delayedCall(3000, () => {
            this.isAnswering = false;
            // this.sound.play('select_sfx', { volume: 0.5 });
            this.currentQuestionIndex++;

            if (this.answerContainer) {
                this.answerContainer.destroy();
                this.answerContainer = null;
            }

            if (this.currentQuestionIndex < this.courseQuestions.length) {
                const nextQ = this.courseQuestions[this.currentQuestionIndex];

                this.questionUI(nextQ.question);
                this.optionsUI(nextQ.options || []);

                this.bg.play(`thinking${this.gender}`, true);
                this.time.delayedCall(800, () => { 
                    this.bg.play(`default${this.gender}`, true); 
                });
            } else {
                this.finishAssessment();
            }
        });
    }

    showAnswerBubble(text) {
        if (this.answerContainer) this.answerContainer.destroy();

        this.answerContainer = this.add.container(230, 300); 
            const answerText = this.add.text(0, 0, `"${text}"`, {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                fill: "#ffffff",
                align: "center",
                wordWrap: { width: 180 },
                resolution: 2
            }).setOrigin(0.5);

            const padding = 10;
            const bgW = Math.max(60, answerText.width + padding * 2);
            const bgH = answerText.height + padding * 2;

            const bubbleBg = this.add.graphics()
                .fillStyle(0x344E41, 1)
                .lineStyle(2, 0xA3B18A, 1)
                .fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 8)
                .strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 8);

            bubbleBg.fillTriangle(
                -5, bgH / 2, 
                5, bgH / 2, 
                0, bgH / 2 + 10
            );
        this.answerContainer.add([bubbleBg, answerText]);
        this.answerContainer.setDepth(101);

        this.answerContainer.setScale(0);
        this.tweens.add({
            targets: this.answerContainer,
            scale: 1,
            duration: 200,
            ease: 'Back.out'
        });
    }

    finishAssessment() {
        this.questionUI("Assessment Complete! Analyzing your career matches...");
        this.bg.play(`default${this.gender}`);
        this.optionsContainer.destroy();

        this.time.delayedCall(2000, () => {
            this.startPageTransition('Hallway');
        });
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