import React, { useEffect, useState, useMemo } from 'react';
import type { ModalProps } from './props';
import { db } from './firebaseConfig';
import '../styles/Modal.css';
import '../styles/Dashboard.css';
import StatisticsLoad from './StatisticsLoad';

const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:10000' : 'https://eight-bit-backend.onrender.com';

const courseNames: Record<string, string> = {
    CITCS: "COLLEGE OF INFORMATION TECHNOLOGY AND COMPUTER STUDIES (CITCS)",
    CCJ: "COLLEGE OF CRIMINAL JUSTICE (CCJ)",
    CBA: "COLLEGE OF BUSINESS ADMINISTRATION (CBA)",
    CAS: "COLLEGE OF ARTS AND SCIENCES (CAS)",
    CTE: "COLLEGE OF TEACHER EDUCATION (CTE)",
    COM: "COLLEGE OF MEDICINE (COM)",
    ISW: "INSTITUTE OF SOCIAL WORK (ISW)",
    IPPG: "INSTITUTE OF PUBLIC POLICY AND GOVERNANCE (IPPG)"
};

const Dashboard: React.FC<ModalProps> = ({onClose , isOpen}) => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const playerID = localStorage.getItem("playerID");

    useEffect(() => {
        if (!isOpen || !playerID) return;
        const userRef = db.ref(`webGame/${playerID}`);
        
        const handleData = (snapshot: any) => {
            const data = snapshot.val();
            if (data) {
                setUserData(data);
            }
            setLoading(false);
        };

        userRef.on('value', handleData);
        return () => userRef.off('value', handleData);
    }, [isOpen, playerID]);

    useEffect(() => {
        if (window.game?.input?.keyboard){
            isOpen ? window.game.input.keyboard.stopListeners() : window.game.input.keyboard.startListeners();
        }
        return () => window.game?.input?.keyboard?.startListeners();
    }, [isOpen]);

    const stats = useMemo(() => {
        if (!userData) return { 
            progress: 0, 
            courseProgress: {},
            selectedCourses: [],
            nonselectedCourses: [],
            skills: [], 
            personalities: []
        };

        const tags = userData.tags || [];
        const selectedCourses = userData.courses || [];
        const scores = userData.scores || {};

        const allCourseNames = Object.keys(courseNames);
        const notselectedCourses = allCourseNames.filter(code => {
            const isAlreadySelected = selectedCourses.some((fullString: string) => 
                fullString.toUpperCase().includes(code.toUpperCase())
            );

            return !isAlreadySelected;
        });
        const courseProgressMap: Record<string, number> = {};

        let totalTasksCompleted = 0;

        selectedCourses.forEach((course: string) => {
            const courseScores = scores[course] || {};
            let completedTasks = 0;

            if (courseScores.multipleChoice != null) completedTasks++;
            if (courseScores.identification != null) completedTasks++;
            if (courseScores.skill != null) completedTasks++;
            if (courseScores.personality != null) completedTasks++;

            courseProgressMap[course] = Math.round((completedTasks / 4) * 100);
            totalTasksCompleted += completedTasks;
        });

        const totalTasksPossible = selectedCourses.length * 4;
        const overallProgress = totalTasksPossible > 0 
            ? Math.round((totalTasksCompleted/ totalTasksPossible) * 100) 
            : 0;

        return {
            progress: overallProgress,
            courseProgress: courseProgressMap,
            selectedCourses: selectedCourses,
            nonselectedCourses: notselectedCourses,
            skills: tags.filter((t: any) => t.type === "skill" && t.status === "valid").slice(0, 5),
            personalities: tags.filter((t: any) => t.type === "personality" && t.status === "valid").slice(0, 5)
        };
    }, [userData]);

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

    const handleGenerateAI = async () => {
        if (stats.progress < 100 || isGeneratingAI) return;
        setIsGeneratingAI(true);

        try {
            const response = await fetch(`${apiBaseUrl}/api/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerEmail: userData.email,
                    playerName: userData.name,
                    coursesTaken: userData.courses,
                    scores: userData.scores,
                    tags: userData.tags,
                    quizResults: userData.quizResults
                })
            });

            const result = await response.json();
            const aiText = result.aiText?.trim() || "No response from AI.";
            await db.ref(`webGame/${playerID}/comment`).set(aiText);
        } catch (error) {
            alert("Failed to generate analysis.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Email copied to clipboard!");
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("playerID");
        window.location.href = "../../index.html";
    };

    const handleReset = async () => {
        if (window.confirm("Reset all progress?")) {
            await db.ref(`webGame/${playerID}`).update({
                quizResults: {},
                scores: {},
                progress: 0,
                comment: ""
            });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("PERMANENTLY DELETE ACCOUNT? This cannot be undone.")) {
            try {
                await db.ref(`webGame/${playerID}`).remove();
                handleLogout();
            } catch (error) {
                alert("Error deleting account.");
            }
        }
    };

    if (!isOpen) return null;

    return(
        <div className="modalBackdrop">
            <button id="closeButton" onClick={onClose}>X</button>

            <div className="modalContainer">
                <div className="modalContent">
                    <section className="dashboardContainer">
                        <h1 id="mainTitle">DASHBOARD</h1>

                        <nav>
                            <ul>
                                <li id="home"><a href="#mainTitle" onClick={(e) => handleNavClick(e, 'mainTitle')}>HOME</a></li>
                                <li><a href="#profileContainer" onClick={(e) => handleNavClick(e, 'profileContainer')}>PROFILE</a></li>
                                <li>
                                    <a href="#statisticContainer" onClick={(e) => handleNavClick(e, 'statisticContainer')}>STATISTICS</a>
                                    <ul>
                                        <li><a href="#courseProgressContainer" onClick={(e) => handleNavClick(e, 'courseProgressContainer')}>COURSE PROGRESS AND SCORES</a></li>
                                        <li><a href="#skillsPersonalityContainer" onClick={(e) => handleNavClick(e, 'skillsPersonalityContainer')}>SKILLS AND PERSONALITY TRAITS</a></li>
                                        <li><a href="#commentContainer" onClick={(e) => handleNavClick(e, 'commentContainer')}>AI COMMENT AND SUGGESTIONS</a></li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="#actionsContainer" onClick={(e) => handleNavClick(e, 'actionsContainer')}>ACTIONS</a>
                                </li>
                                <li id="logout"><a href="javascript:void(0)" onClick={handleLogout}>LOGOUT</a></li>
                            </ul>
                        </nav>

                        <main>
                            {loading ? (
                                <p>Loading Player Data...</p>
                            ) : (
                                <>
                                    <div id="profileContainer" className="profileContainer">
                                        <label className="mainHeader">PROFILE</label>
                                        <div className="imgWrapper">
                                            <img src={userData?.gender === 'Female' ? "/assets/Character/StaticFemale.gif" : "/assets/Character/StaticMale.gif"} alt="Avatar" />
                                        </div>

                                        <div className="idContainer">
                                            <label className="subHeader">PLAYER ID:</label>
                                            <div className="idField">
                                                <input
                                                    style={{ fontSize: "18px", fontFamily: '"Press Start 2P", cursive', color: "#fff" }}
                                                    value={playerID || "No Player ID"} readOnly
                                                />

                                                {(playerID || playerID === "N/A") && (
                                                    <img
                                                        typeof="text/svg"
                                                        style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                        onClick={() => copyToClipboard(userData?.email)}
                                                        src={"/assets/WebAssets/Copy.svg"} 
                                                        alt="Copy Email" 
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="emailContainer">
                                            <label className="subHeader">PLAYER EMAIL:</label>
                                            <div className="emailField">
                                                <input
                                                    style={{ fontSize: "18px", fontFamily: '"Press Start 2P", cursive', color: "#fff" }}
                                                    value={userData?.email || "N/A"} readOnly
                                                />

                                                {(userData?.email || userData.email === "N/A") && (
                                                    <img
                                                        typeof="text/svg"
                                                        style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                        onClick={() => copyToClipboard(userData?.email)}
                                                        src={"/assets/WebAssets/Copy.svg"} 
                                                        alt="Copy Email" 
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="nameContainer">
                                            <label className="subHeader">PLAYER NAME:</label>
                                            <label className="subLabel">{userData?.name || "Guest"}</label>
                                        </div>

                                        <div className="passContainer">
                                            <label className="subHeader">PASSWORD:</label>
                                            <div className="passField">
                                                <input 
                                                    type={(!userData?.pass || userData.pass === "No Password") ? "text" : (showPassword ? "text" : "password")}
                                                    style={{ fontSize: "18px", fontFamily: '"Press Start 2P", cursive', color: "#fff" }}
                                                    value={userData?.pass || "No Password"} readOnly
                                                />

                                                {(userData?.pass || userData.pass === "No Password") && (
                                                    <img
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        src={`/assets/WebAssets/Padlock${showPassword ? 'Opened' : 'Closed'}.png`} 
                                                        alt="Show/Hide Password" 
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="genderContainer">
                                            <label className="subHeader">GENDER:</label>
                                            <label className="subLabel">{userData?.gender || "N/A"}</label>
                                        </div>

                                        <div className="pinContainer">
                                            <label className="subHeader">PIN:</label>
                                            <div className="pinField">
                                                <input 
                                                    type={(!userData?.pin || userData.pin === "No PIN") ? "text" : (showPin ? "text" : "password")}
                                                    style={{ fontSize: '18px', fontFamily: '"Press Start 2P", cursive', color: "#fff" }}
                                                    value={userData?.pin || "No PIN"} readOnly
                                                />

                                                {(userData?.pin || userData.pin === "No PIN") && (
                                                    <img
                                                        onClick={() => setShowPin(!showPin)}
                                                        src={`/assets/WebAssets/Padlock${showPin ? 'Opened' : 'Closed'}.png`} 
                                                        alt="Show/Hide PIN" 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <StatisticsLoad 
                                        stats={stats}
                                        userData={userData}
                                        isGeneratingAI={isGeneratingAI}
                                        onGenerateAI={handleGenerateAI}
                                    />

                                    <div id="actionsContainer" className="actionsContainer">
                                        <label className="label" id="actions">ACTIONS</label>
                                        <div className="buttonWrapper">
                                            <button id="resetButton" onClick={handleReset}>RESET PROGRESS</button>
                                            <button id="deleteButton" onClick={handleDeleteAccount}>DELETE ACCOUNT</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </main>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;