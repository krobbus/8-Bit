import React, { useEffect } from 'react';
import type { ModalProps } from './props';
import '../styles/Modal.css';
import '../styles/Manual.css';

const Manual: React.FC<ModalProps> = ({ isOpen, onClose }) => { 
    if (!isOpen) return;  

    useEffect(() => {
        if (window.game?.input?.keyboard){
            isOpen ? window.game.input.keyboard.stopListeners() : window.game.input.keyboard.startListeners();
        }
        return () => window.game?.input?.keyboard?.startListeners();
    }, []);

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

    return(
        <div className="modalBackdrop">
            <button id="closeButton" onClick={onClose}>X</button>

            <div className="modalContainer">
                <div className="modalContent">
                    <section className="manualContainer">
                        <div className="headers">
                            <h1 id="mainTitle">An AI-Driven 8-bit Web Game For Personalized College Program Matching and Career Exploration</h1>
                            <h2 id="subTitle">Player's Manual</h2>
                        </div>

                        <nav>
                            <ul>
                                <li><a href="#introduction" onClick={(e) => handleNavClick(e, 'introductionContainer')}>INTRODUCTION</a></li>
                                <li><a href="#requirementsContainer" onClick={(e) => handleNavClick(e, 'requirementsContainer')}>SYSTEM REQUIREMENTS</a></li>
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
                                            <a href="#mapLayoutContainer" onClick={(e) => handleNavClick(e, 'mapLayoutContainer')}>MAP LAYOUT</a>
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
                                    <img src="" alt="Introduction art" />

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
                                            <img src="" alt="Web browser display" />
                                            <span className="mainContent">A device with a web browser (Google Chrome, Mozilla Firefox, or Microsoft Edge)</span>
                                        </div>

                                        <div className="cardWrapper">
                                            <img src="" alt="Internet connection display" />
                                            <span className="mainContent">Stable internet connection</span>
                                        </div>

                                        <div className="cardWrapper">
                                            <img src="" alt="Devices requirement display" />
                                            <span className="mainContent">Desktop, laptop, or mobile device</span>
                                        </div>
                                    </div>
                                </section>

                                <section id="featuresContainer">
                                    <label className="mainHeader">FEATURES</label>

                                    <section id="loginProcedureContainer">
                                        <span className="topic">Login Procedure</span>

                                        <img src="" alt="Login art" />

                                        <p className="caption">
                                            The login gateway serves as your entry point into the 8-bit world. Allow players to enter 
                                            the game using different options. Whether you are exploring as a guest or resuming your journey, 
                                            our system provides a flexible and secure way to manage your career discovery progress
                                        </p>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="" alt="Guest login" />

                                                <div className="contentWrapper">
                                                    <span className="mainContent">PLAY AS A GUEST</span>

                                                    <p className="subContent">
                                                        Jump straight into the action. Ideal for a quick look at the 8-bit settings, 
                                                        though progress is stored locally and it will be lost if you leave the game.
                                                        <br /><br />
                                                        Click “Play as a Guest” to immediately enter the game. 
                                                        Guest players can explore the game but may have limited access to saving progress
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="cardWrapper">
                                                <img src="" alt="Account login" />

                                                <div className="contentWrapper">
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
                                        </div>
                                    </section>

                                    <section id="securityMeasureContainer">
                                        <span className="topic">Security Measure</span>

                                        <img src="" alt="Security Measure" />

                                        <p className="caption">
                                            Protect your progress with integrated security features: multi-step login authentication, 
                                            sensitive data masking for PINs/passwords, and a streamlined recovery process to 
                                            ensure you never lose access to your career exploration journey
                                        </p>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="" alt="Login authentication" />
                                                <span className="mainContent">Login authentication ensures secure access</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <img src="" alt="Account login overview" />
                                                <span className="mainContent">For checking your information, players can hide their password and PIN</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <img src="" alt="Forgot password overview" />
                                                <span className="mainContent">Password recovery system assists users who forget credentials</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section id="guideForPlayersContainer">
                                        <span className="topic">Guide For Players</span>

                                        <img src="" alt="Guide art" />

                                        <p className="caption">
                                            Success in career matching comes from honesty and exploration. Interact with every NPC, 
                                            answer the AI’s questions truthfully, and don't be afraid to retake the assessments. 
                                            Pay close attention to the AI’s feedback these insights are tailored to your gameplay
                                            and academic strengths
                                        </p>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <span className="mainContent">Answer questions honestly to receive accurate AI recommendations</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <span className="mainContent">Explore different game paths to discover various career options</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <span className="mainContent">Review statistics on dashboard to track progress and improvement</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <span>Define your actual skills and personality traits to ensure accurate and correct results</span>
                                            </div>

                                            <div className="cardWrapper">
                                                <span className="mainContent">Verify that your selected traits accurately reflect your strengths for a more personalized career analysis</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section id="logoutProcedureContainer">
                                        <span className="topic">Logout Procedure</span>

                                        <img src="" alt="Logout art" />

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
                                        <span className="topic">Map Layout</span>

                                        <img src="" alt="Map layout" />

                                        <p className="caption">
                                            A lively scenery inside and outside of the main campus serves a unique purpose in 
                                            your career discovery. Use map overview as guide to understand the map layout 
                                            and identify key locations for exploration.
                                        </p>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="" alt="Outdoor scene" />
                                                <span className="mainContent">Outdoor Scene (Outside of the campus)</span>
                                                <p className="subContent"></p>
                                            </div>

                                            <div className="cardWrapper">
                                                <img src="" alt="Left wing scene" />
                                                <span className="mainContent">Left Wing Scene (Inside of the campus)</span>
                                                <p className="subContent"></p>
                                            </div>

                                            <div className="cardWrapper">
                                                <img src="" alt="Hallway scene" />
                                                <span className="mainContent">Hallway Scene (Inside of the campus)</span>
                                                <p className="subContent"></p>
                                            </div>

                                            <div className="cardWrapper">
                                                <img src="" alt="Right wing scene" />
                                                <span className="mainContent">Right Wing Scene (Inside of the campus)</span>
                                                <p className="subContent"></p>
                                            </div>
                                        </div>
                                    </section>

                                    <section id="modalsContainer">
                                        <span className="topic">Modals</span>

                                        <p className="caption">

                                        </p>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="" alt="Password recovery" />

                                                <div className="contentWrapper">
                                                    <span className="mainContent">Password Recovery Modal</span>
                                                    <p className="subContent"></p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="" alt="Dashboard" />

                                                <div className="contentWrapper">
                                                    <span className="mainContent">Dashboard Modal</span>
                                                    <p className="mainContent"></p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="" alt="Account management" />

                                                <div className="contentWrapper">
                                                    <span className="mainContent">Account Management Modal</span>
                                                    <p className="subContent"></p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="cardContainer">
                                            <div className="cardWrapper">
                                                <img src="" alt="Leaderboard" />

                                                <div className="contentWrapper">
                                                    <span className="mainContent">Leaderboard Modal</span>
                                                    <p className="subContent"></p>
                                                </div>
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