import React, { useEffect } from 'react';
import type { ModalProps } from './props';
import '../styles/Modal.css';
import '../styles/Manual.css';

const Manual: React.FC<ModalProps> = ({ isOpen, onClose }) => { 
    useEffect(() => {
        if (window.game?.input?.keyboard){
            isOpen ? window.game.input.keyboard.stopListeners() : window.game.input.keyboard.startListeners();
        }
        return () => window.game?.input?.keyboard?.startListeners();
    }, [isOpen]);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    if (!isOpen) return;  

    return(
        <div className="modalBackdrop">
            <div className="modalContainer">
                <div className="modalContent">
                    <button id="closeButton" onClick={onClose}>X</button>

                    <section id="manualContainer" className="manualContainer">
                        <h1 id="mainTitle">PLAYER'S MANUAL</h1>

                        <nav>
                            <ul>
                                <li>
                                    <a href="#manualContainer" onClick={(e) => handleNavClick(e, 'manualContainer')}>HOME</a>
                                    <ul>
                                        <li><a href="#introductionContainer" onClick={(e) => handleNavClick(e, 'introductionContainer')}>INTRODUCTION</a></li>
                                        <li><a href="#requirementsContainer" onClick={(e) => handleNavClick(e, 'requirementsContainer')}>SYSTEM REQUIREMENTS</a></li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="#featuresContainer" onClick={(e) => handleNavClick(e, 'featuresContainer')}>FEATURES</a>
                                    <ul>
                                        <li><a href="#loginProcedureContainer" onClick={(e) => handleNavClick(e, 'loginProcedureContainer')}>LOGIN PROCEDURE</a></li>
                                        <li><a href="#securityMeasureContainer" onClick={(e) => handleNavClick(e, 'securityMeasureContainer')}>SECURITY MEASURE</a></li>
                                        <li><a href="#guideForPlayersContainer" onClick={(e) => handleNavClick(e, 'guideForPlayersContainer')}>GUIDE FOR PLAYERS</a></li>
                                        <li><a href="#logoutProcedureContainer" onClick={(e) => handleNavClick(e, 'logoutProcedureContainer')}>LOGOUT PROCEDURE</a></li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="#overviewContainer" onClick={(e) => handleNavClick(e, 'overviewContainer')}>OVERVIEW</a>
                                    <ul>
                                        <li>
                                            <a href="#scenesContainer" onClick={(e) => handleNavClick(e, 'scenesContainer')}>SCENES</a>
                                            <ul>
                                                <li><a href="#outdoorContainer" onClick={(e) => handleNavClick(e, 'outdoorContainer')}>OUTDOOR SCENE</a></li>
                                                <li><a href="#leftWingContainer" onClick={(e) => handleNavClick(e, 'leftWingContainer')}>LEFT WING SCENE</a></li>
                                                <li><a href="#hallwayContainer" onClick={(e) => handleNavClick(e, 'hallwayContainer')}>HALLWAY SCENE</a></li>
                                                <li><a href="#rightWingContainer" onClick={(e) => handleNavClick(e, 'rightWingContainer')}>RIGHT WING SCENE</a></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <a href="#modalsContainer" onClick={(e) => handleNavClick(e, 'modalsContainer')}>MODALS</a>
                                            <ul>
                                                <li><a href="#passwordRecoveryContainer" onClick={(e) => handleNavClick(e, 'passwordRecoveryContainer')}>PASSWORD RECOVERY MODAL</a></li>
                                                <li><a href="#dashboardContainer" onClick={(e) => handleNavClick(e, 'dashboardContainer')}>DASHBOARD MODAL</a></li>
                                                <li><a href="#accountManagementContainer" onClick={(e) => handleNavClick(e, 'accountManagementContainer')}>ACCOUNT MANAGEMENT MODAL</a></li>
                                                <li><a href="#leaderboardContainer" onClick={(e) => handleNavClick(e, 'leaderboardContainer')}>LEADERBOARD MODAL</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </nav>

                        <main>
                            <>
                                <section id="introductionContainer">
                                    <label className="mainHeader">AN AI-DRIVEN 8-BIT WEB GAME FOR PERSONALIZED COLLEGE PROGRAM MATCHING AND CAREER EXPLORATION</label>
                                    
                                    <img src="assets/Background/PLMUN.png" alt="PLMUN background" />
                                    <p className="caption">
                                        This user manual is designed to guide players in understanding and navigating the AI-driven 8-bit web game 
                                        for personalized college program matching and career exploration. The game uses an interactive, retro-style 
                                        environment combined with artificial intelligence to help players explore suitable college programs and career 
                                        paths based on their interests, personality, skills, and in-game decisions.
                                        <br /><br />
                                        By following this user manual, players can easily navigate the system, understand game features, and maximize 
                                        their learning experience.
                                    </p>
                                </section>

                                <section id="requirementsContainer">
                                    <label className="mainHeader">WHAT DO I NEED TO PLAY THIS GAME?</label>

                                    <div className="cardContainer">
                                        <div className="cardWrapper">
                                            <span className="cardContent">A device with a web browser (Google Chrome, Mozilla Firefox, or Microsoft Edge)</span>
                                        </div>

                                        <div className="cardWrapper">
                                            <span className="cardContent">Stable internet connection</span>
                                        </div>

                                        <div className="cardWrapper">
                                            <span className="cardContent">Desktop, laptop, or mobile device</span>
                                        </div>
                                    </div>
                                </section>

                                <section id="featuresContainer">
                                    <label className="mainHeader">FEATURES</label>

                                    <section id="loginProcedureContainer">
                                        <label className="subHeader">LOGIN PROCEDURE</label>

                                        <img src="assets/Manual/LoginPage.png" alt="Login page" />

                                        <p className="caption">
                                            The login gateway serves as your entry point into the 8-bit world. Allow players to enter 
                                            the game using different options. Whether you are exploring as a guest or resuming your journey, 
                                            our system provides a flexible and secure way to manage your career discovery progress
                                        </p>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="assets/Manual/GuestLogin.png" alt="Guest login" />

                                                <span className="mainContent">PLAY AS A GUEST</span>
                                                <p className="subContent">
                                                    Jump straight into the action. Ideal for a quick look at the 8-bit settings, 
                                                    though progress is stored locally and it will be lost if you leave the game.
                                                    <br /><br />
                                                    Click “Play as a Guest” to immediately enter the game. 
                                                    Guest players can explore the game but may have limited access to saving progress
                                                </p>
                                            </div>

                                            <div className="cardWrapper">
                                                <img src="assets/Manual/AccountLogin.png" alt="Account login" />

                                                <span className="mainContent">LOGIN WITH EXISTING ACCOUNT</span>
                                                <p className="subContent">
                                                    Securely resume your journey. Enter your unique Player ID/Email,
                                                    and continue your career matching journey.
                                                    <br /><br />
                                                    [1] Select role (Player or Admin) <br /> 
                                                    [2] Choose "Player" role <br />
                                                    [3] Enter your Player ID/Email and Password <br />
                                                    [4] Click “Log In” to proceed
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <section id="securityMeasureContainer">
                                        <label className="subHeader">SECURITY MEASURE</label>

                                        <p className="caption">
                                            Protect your progress with integrated security features: multi-step login authentication, 
                                            sensitive data masking for PINs/passwords, and a streamlined recovery process to 
                                            ensure you never lose access to your career exploration journey
                                        </p>
                                    </section>

                                    <section id="guideForPlayersContainer">
                                        <label className="subHeader">GUIDE FOR PLAYERS</label>

                                        <p className="caption">
                                            Success in career matching comes from honesty and exploration. Interact with every NPC, 
                                            answer the AI’s questions truthfully, and don't be afraid to retake the assessments. 
                                            Pay close attention to the AI’s feedback these insights are tailored to your gameplay
                                            and academic strengths
                                        </p>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <span className="cardContent">Answer questions honestly to receive accurate AI recommendations</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <span className="cardContent">Explore different game paths to discover various career options</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <span className="cardContent">Review statistics on dashboard to track progress and improvement</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <span className="cardContent">Define your actual skills and personality traits to ensure accurate and correct results</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <span className="cardContent">Verify that your selected traits accurately reflect your strengths for a more personalized career analysis</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section id="logoutProcedureContainer">
                                        <label className="subHeader">LOGOUT PROCEDURE</label>

                                        <img src="assets/Manual/SettingsLogout.png" alt="SettingsLogout" />
                                        <small>Logout can be found inside the settings panel</small>

                                        <img src="assets/Manual/DashboardLogout.png" alt="DashboardLogout" />
                                        <small>Logout can be found inside the dashboard modal</small>

                                        <p className="caption">
                                            Closing your session correctly ensures that all career matches and game progress 
                                            are synchronized with our servers. No data loss and keep your student profile up 
                                            to date for your next exploration.
                                        </p>
                                    </section>
                                </section>

                                <section id="overviewContainer">
                                    <label className="mainHeader">OVERVIEW</label>

                                    <section id="scenesContainer">
                                        <label className="subHeader">SCENES</label>

                                        <p className="caption">
                                            A lively scenery inside and outside of the main campus serves a unique purpose in 
                                            your career discovery. Use map overview as guide to understand the map layout 
                                            and identify key locations for exploration.
                                        </p>

                                        <div className="cardContainer">
                                            <div id="outdoorContainer" className="cardWrapper">
                                                <img src="assets/Manual/Outdoor.png" alt="Outdoor scene" />
                                                <span className="mainContent">Outdoor Scene (Outside of the campus)</span>
                                                <p className="subContent">

                                                </p>
                                            </div>

                                            <div id="leftWingContainer" className="cardWrapper">
                                                <img src="assets/Manual/LeftWing.png" alt="Left wing scene" />
                                                <span className="mainContent">Left Wing Scene (Inside of the campus)</span>
                                                <p className="subContent">

                                                </p>
                                            </div>

                                            <div id="hallwayContainer" className="cardWrapper">
                                                <img src="assets/Manual/Hallway.png" alt="Hallway scene" />
                                                <span className="mainContent">Hallway Scene (Inside of the campus)</span>
                                                <p className="subContent">
                                                    
                                                </p>
                                            </div>

                                            <div id="rightWingContainer" className="cardWrapper">
                                                <img src="assets/Manual/RightWing.png" alt="Right wing scene" />
                                                <span className="mainContent">Right Wing Scene (Inside of the campus)</span>
                                                <p className="subContent">

                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <section id="modalsContainer">
                                        <label className="subHeader">MODALS</label>

                                        <p className="caption">

                                        </p>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="assets/Manual/ForgotPassword.png" alt="Password recovery" />

                                                <span className="mainContent">Password Recovery Modal</span>
                                                <p className="subContent">

                                                </p>
                                            </div>
                                        </div>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="assets/Manual/Dashboard.png" alt="Dashboard" />

                                                <span className="mainContent">Dashboard Modal</span>
                                                <p className="subContent">

                                                </p>
                                            </div>
                                        </div>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="assets/Manual/AccountManagement.png" alt="Account management" />

                                                <span className="mainContent">Account Management Modal</span>
                                                <p className="subContent">

                                                </p>
                                            </div>
                                        </div>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="assets/Manual/Leaderboard.png" alt="Leaderboard" />

                                                <span className="mainContent">Leaderboard Modal</span>
                                                <p className="subContent">

                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </section>
                            </>
                        </main>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Manual;