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
        this.isAnswering = false;
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

        this.headerContainer = this.add.container(0, 80);                                                              // header
            const CourseText = this.add.text(screenCenterX, 30, `${this.selectedCourse}`, {  
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                color: "#344E41",
                align: "center"
            }).setOrigin(0.5, 0);

            const typeText = this.add.text(screenCenterX, 60, `${this.selectedType}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: "8px",
                color: "#588157",
                align: "center"
            }).setOrigin(0.5, 0);

            const gap = 10;
            const padding = 20;
            const totalTextHeight = CourseText.height + gap + typeText.height;
            const headerHeight = totalTextHeight + (padding * 2);
            const headerWidth = Math.max(CourseText.width, typeText.width) + 140;
            const headerBottom = gap + headerHeight;

            this.headerWidth = headerWidth;
            this.headerBottom = headerBottom;

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

        this.bg = this.add.sprite(screenCenterX, screenCenterY, `default${this.gender}`).setScale(1.5);                // bg

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
        this.nameContainer.setDepth(110);
        
        let existingAudio = this.sound.get('audiosample');                                                          // audio
        if (!existingAudio) { this.gameAudio = this.sound.add('audiosample', { loop: true });
        } else { this.gameAudio = existingAudio; }

        const startAudio = () => {
            if (this.sound.context.state === 'suspended') { this.sound.context.resume(); }
            if (!this.gameAudio.isPlaying) { this.gameAudio.play(); }
        };
        startAudio();

        this.input.once('pointerdown', () => { startAudio(); });

        this.settings = new Settings(this);                                                                           // settings
        this.settings.setDepth(3000);
        this.add.sprite(this.scale.width - 60, 80, 'settings')
            .setScale(0.1)
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.settings.toggle());
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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

    async loadQuestions(){
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.bg.play(`thinking${this.gender}`);
        this.startThinkingAnimation();

        const isAssessment = this.rawType === 'Skill' || this.rawType === 'Personality';
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
                this.stopThinkingAnimation();

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
            this.stopThinkingAnimation();
            this.questionUI("Oops... The AI is sleeping.");
            this.optionsUI(["Error", "Error", "Error", "Error"]);
        }
    }

    questionUI(question){
        if (this.questionContainer) this.questionContainer.destroy();

        this.questionContainer = this.add.container(0, 90).setDepth(120);
            const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2; 
            const padding = 30;
            const verticalGap = 5;
            const boxWidth = this.headerWidth;
            const boxY = this.headerBottom + verticalGap;
                
            this.questionText = this.add.text(screenCenterX, 0, question, {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                fill: "#ffffff",
                align: "center",
                wordWrap: { width: boxWidth - (padding * 2) },
                lineSpacing: 10,
                resolution: 2
            }).setOrigin(0.5, 0);
            
            const dynamicHeight = this.questionText.height + (padding * 2);

            this.questionContainerStyle = this.add.graphics()
                .fillStyle(0x344E41, 1)
                .lineStyle(2, 0xA3B18A, 1)
                .fillRoundedRect(screenCenterX - boxWidth / 2, boxY, boxWidth, dynamicHeight, 10)
                .strokeRoundedRect(screenCenterX - boxWidth / 2, boxY, boxWidth, dynamicHeight, 10);
        this.questionText.y = boxY + padding;
        this.questionContainer.add([this.questionContainerStyle, this.questionText]);
    }

    optionsUI(options) {
        if (this.optionsContainer) this.optionsContainer.destroy();

        const screenHeight = this.scale.height;
        const screenWidth = this.scale.width;
        const isAssessment = this.rawType === 'Skill' || this.rawType === 'Personality';

        if (isAssessment) {
            this.optionsContainer = this.add.container(screenWidth / 2, screenHeight - 140).setDepth(130);
        
            const paddingSide = 24;
            const paddingTopBottom = 14;
            const maxWidth = 300;

            options.forEach((optionText) => {
                let offsetX = 0;
                let offsetY = 0;

                const textCheck = optionText.toUpperCase().trim();
                if (textCheck.includes("STRONGLY AGREE")) { offsetX = -100; offsetY = -50; }
                else if (textCheck.includes("STRONGLY DISAGREE")) { offsetX = 100; offsetY = 50; }
                else if (textCheck.includes("DISAGREE")) { offsetX = -100; offsetY = 50; }
                else if (textCheck.includes("AGREE")) { offsetX = 100; offsetY = -50; }
                else { offsetX = 0; offsetY = 0; }

                const optionsText = this.add.text(0, 0, optionText, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: "6px",
                    align: "center",
                    fill: "#ffffff",
                    wordWrap: { width: maxWidth - (paddingSide * 2) },
                    resolution: 2
                }).setOrigin(0.5);

                const finalWidth = optionsText.width + (paddingSide * 2);
                const finalHeight = optionsText.height + (paddingTopBottom * 2);

                const optionsStyleContainer = this.add.graphics()
                    .fillStyle(0x344E41, 1)
                    .lineStyle(2, 0xA3B18A, 1)
                    .fillRoundedRect(-finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight, 8)
                    .strokeRoundedRect(-finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight, 8);

                const hitArea = new Phaser.Geom.Rectangle(-finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);    
                optionsStyleContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
                    .on('pointerover', () => {
                        if (!this.isSettingsOpen) optionsStyleContainer.setAlpha(0.8);
                    })
                    .on('pointerout', () => optionsStyleContainer.setAlpha(1))
                    .on('pointerdown', () => {
                        if (this.isSettingsOpen) return;
                        this.handleAnswer(optionText);
                    });

                const buttonContainer = this.add.container(offsetX, offsetY, [optionsStyleContainer, optionsText]);
                this.optionsContainer.add(buttonContainer);
            });
        } else {          
            this.optionsContainer = this.add.container(120, 0).setDepth(130);

            let currentY = 0;
            const verticalGap = 10;
            const paddingSide = 24;
            const paddingTopBottom = 14;
            const maxWidth = 700;
            const startX = 250;
            const offsetStep = 50;

            options.forEach((optionText, index) => {
                const label    = String.fromCharCode(65 + index);
                const currentX = startX - (index * offsetStep);

                const optionsText = this.add.text(0, 0, `${label}. ${optionText}`, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: "8px",
                    align: "center",
                    fill: "#ffffff",
                    wordWrap: { width: maxWidth - (paddingSide * 2) },
                    lineSpacing: 6,
                    resolution: 2
                }).setOrigin(0.5);

                const finalWidth = optionsText.width + (paddingSide * 2);
                const finalHeight = optionsText.height + (paddingTopBottom * 2);

                optionsText.setPosition(finalWidth / 2, finalHeight / 2);

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
            this.optionsContainer.y = screenHeight - currentY - 80;
        }
    }

    startThinkingAnimation() {
        let dotCount = 0;
        this.thinkingTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                dotCount = (dotCount + 1) % 4;
                const dots = ".".repeat(dotCount);
                
                this.questionUI(`Thinking questions${dots}`);
                this.optionsUI([dots, dots, dots, dots]);
            },
            loop: true
        });
    }
    stopThinkingAnimation() { if (this.thinkingTimer) this.thinkingTimer.remove(); }

    getStudentPos(id) {
        const positions = {
            1: { x: 130, y: 410 }, 2: { x: 230, y: 310 }, 
            3: { x: 330, y: 410 }, 4: { x: 430, y: 310 },
            5: { x: 860, y: 410 }, 6: { x: 960, y: 310 }, 
            7: { x: 1060, y: 410 }, 8: { x: 1160, y: 310 }
        };
        return positions[id];
    }

    handleAnswer(selectedOption) {
        if (this.isAnswering) return;
        this.isAnswering = true;

        const isAssessment = this.rawType === 'Skill' || this.rawType === 'Personality';
        if (this.optionsContainer) this.optionsContainer.setVisible(false);

        const currentQ = this.courseQuestions[this.currentQuestionIndex];
        if (isAssessment) currentQ.userResponse = selectedOption;
        
        const npcCount = isAssessment ? 4 : 3;

        const otherOptions = isAssessment
            ? [...currentQ.options].sort(() => 0.5 - Math.random())
            : currentQ.options.filter(opt => opt !== selectedOption).sort(() => 0.5 - Math.random());

        const shuffledNPCs = [1, 3, 4, 5, 6, 7, 8].sort(() => 0.5 - Math.random()).slice(0, npcCount);

        const sequence = [
            { id: 2, option: selectedOption, isPlayer: true },
            ...shuffledNPCs
                .map((npcId, i) => ({ 
                    id: npcId, 
                    option: otherOptions[i] || "...", 
                    isPlayer: false 
                }))
        ];

        let delayTimer = 0;
        sequence.forEach((turn) => {
            this.time.delayedCall(delayTimer, () => {
                this.bg.play(`student${turn.id}${this.gender}`, true);
                
                const pos = this.getStudentPos(turn.id);
                this.showAnswerBubble(turn.option, pos.x, pos.y, "pending", turn.isPlayer, turn.isPlayer ? 150 : 140);
            });
            delayTimer += 800;
            this.time.delayedCall(delayTimer, () => { this.bg.play(`default${this.gender}`, true); });
            delayTimer += 200;
        });

        if (isAssessment) {
            this.time.delayedCall(delayTimer + 1200, () => { this.cleanupAndNext(); });
        } else {
            const correctAnswer = currentQ.answer || currentQ.correctAnswer;

            this.time.delayedCall(delayTimer + 1500, () => {
                this.questionUI(`The correct answer is:\n${correctAnswer}`);
                this.children.list
                    .filter(c => c.name === 'answerBubble')
                    .forEach(b => this.highlightBubble(b, b.getData('text') === correctAnswer));
            });
            this.time.delayedCall(delayTimer + 5500, () => { 
                this.children.list
                    .filter(c => c.name === 'answerBubble')
                    .forEach(c => c.destroy());
                this.questionUI(currentQ.explanation);
            });
            this.time.delayedCall(delayTimer + 10500, () => { this.cleanupAndNext(); });
        }
    }

    cleanupAndNext() {
        this.isAnswering = false;
        this.currentQuestionIndex++;

        this.children.list
            .filter(c => c.name === 'answerBubble')
            .forEach(c => c.destroy());

        if (this.currentQuestionIndex < this.courseQuestions.length) {
            const nextQ = this.courseQuestions[this.currentQuestionIndex];
            this.questionUI(nextQ.question);
            this.optionsUI(nextQ.options || []);
            if (this.optionsContainer) this.optionsContainer.setVisible(true);
        } else {
            this.finishAssessment();
        }
    }

    showAnswerBubble(text, x, y, status, isPlayer, depth) {
        const container = this.add.container(x, y);
        container.setName('answerBubble');
        container.setData('text', text);
            let bgColor = 0x344E41;
            if (status === "correct") bgColor = 0x588157;
            if (status === "wrong") bgColor = 0xBC4749;

            const answerText = this.add.text(0, 0, `"${text}"`, {
                fontFamily: '"Press Start 2P"',
                fontSize: "10px",
                fill: "#ffffff",
                align: "center",
                wordWrap: { width: 160 },
                resolution: 2
            }).setOrigin(0.5);

            const padding = 10;
            const bgW = Math.max(60, answerText.width + padding * 2);
            const bgH = answerText.height + padding * 2;
            const bubbleColor = isPlayer ? 0x588157 : 0x344E41;

            const bubbleBg = this.add.graphics()
                .setName('bg')
                .fillStyle(bubbleColor, 1)
                .lineStyle(2, 0xA3B18A, 1)
                .fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 10)
                .strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 10);
            
            bubbleBg.fillTriangle(
                -6, bgH / 2, 
                6, bgH / 2, 
                0, bgH / 2 + 12
            );
        container.add([bubbleBg, answerText]);
        container.setDepth(depth);
        container.setScale(0);

        this.tweens.add({
            targets: container,
            scale: 1,
            duration: 300,
            delay: isPlayer ? 0 : Phaser.Math.Between(100, 500),
            ease: 'Back.out'
        });
    }

    highlightBubble(container, isCorrect) {
        const bg = container.getByName('bg');
        const text = container.list.find(child => child instanceof Phaser.GameObjects.Text);
        bg.clear();

        const color = isCorrect ? 0x588157 : 0xBC4749;
        const bgW = Math.max(60, text.width + 16);
        const bgH = text.height + 16;

        bg.fillStyle(color, 1)
            .lineStyle(2, 0xffffff, 1)
            .fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 8)
            .strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 8);
        bg.fillTriangle(-5, bgH / 2, 5, bgH / 2, 0, bgH / 2 + 10);
        
        this.tweens.add({
            targets: container,
            y: container.y - 10,
            duration: 100,
            yoyo: true,
            ease: 'Power1'
        });
    }

    finishAssessment() {
        this.questionUI("Assessment Complete! Analyzing your career matches...");
        this.bg.play(`default${this.gender}`);
        if (this.optionsContainer) this.optionsContainer.destroy();
        this.time.delayedCall(2000, () => {
            this.startPageTransition('Hallway');
        });
    }

    update(){ if (!this.mobileControls) return; }
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