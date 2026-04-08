import React, { useEffect, useState, useMemo, type SyntheticEvent } from 'react';
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

    const loggedInPlayerID = localStorage.getItem("playerID");
    const [searchID, setSearchID] = useState("");
    const [activeViewID, setActiveViewID] = useState(loggedInPlayerID);
    const [isAdmin, setIsAdmin] = useState(false);

    const [userData, setUserData] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<any>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    useEffect(() => {
        if (!loggedInPlayerID) return;
        db.ref(`webGame/${loggedInPlayerID}/adminMode`).once('value', snapshot => {
            setIsAdmin(snapshot.val() === true);
        });
    }, [loggedInPlayerID]);

    useEffect(() => {
        if (!isOpen || !activeViewID) return;
        setUserData(null);
        setLoading(true);
        
        const userRef = db.ref(`webGame/${activeViewID}`);
        const handleData = (snapshot: any) => {
            const data = snapshot.val();
            setUserData(data || null);
            setLoading(false);
        };

        userRef.on('value', handleData);
        return () => userRef.off('value', handleData);
    }, [isOpen, activeViewID]);

    const hasFullAccess = activeViewID === loggedInPlayerID || isAdmin;
    const isPrivateView = hasFullAccess;

    const handleSearch = (e: SyntheticEvent) => {
        e.preventDefault();

        const trimmedID = searchID.trim();
        if (trimmedID) {
            setActiveViewID(trimmedID === loggedInPlayerID ? loggedInPlayerID : trimmedID);
        }
    };

    const resetToOwnProfile = () => {
        if (loggedInPlayerID) {
            setActiveViewID(loggedInPlayerID);
            setSearchID("");
        } else {
            alert("No logged-in Player ID found in storage.");
        }
    };

    useEffect(() => {
        if (window.game?.input?.keyboard){
            isOpen ? window.game.input.keyboard.stopListeners() : window.game.input.keyboard.startListeners();
        }
        return () => window.game?.input?.keyboard?.startListeners();
    }, [isOpen]);

    const stats = useMemo(() => {
        if (!userData) return { 
            assessments: {},
            hasOneCompleteCourse: false,
            selectedCourses: [],
            nonselectedCourses: [],
            skills: [], 
            personalities: []
        };

        const tags = userData.tags || [];
        const selectedCourses = userData.courses || [];
        const assessments = userData.assessments || {};

        const allCourseNames = Object.keys(courseNames);
        const notselectedCourses = allCourseNames.filter(code => {
            const isAlreadySelected = selectedCourses.some((fullString: string) => 
                fullString.toUpperCase().includes(code.toUpperCase())
            );

            return !isAlreadySelected;
        });

        const hasOneCompleteCourse = selectedCourses.some((courseCode: string) => {
            const match = courseCode.match(/\(([^)]+)\)/);
            const code = match ? match[1] : courseCode;

            const hasCourseRelated = assessments[`${code}_CourseRelated`] !== undefined;
            const hasSkill = assessments[`${code}_Skill`] !== undefined;
            const hasPers = assessments[`${code}_Personality`] !== undefined;

            return hasCourseRelated && hasSkill && hasPers;
        });

        return {
            assessments: assessments,
            hasOneCompleteCourse: hasOneCompleteCourse,
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

    const editData = (fieldName: string, currentValue: any) => {
        if (!isAdmin) {
            alert("Restricted: Only Admins can modify player data.");
            return;
        }
        setEditingField(fieldName);
        setEditValue(currentValue);
    };

    const saveEdit = async () => {
        if (!editingField || !activeViewID) return;

        try {
            let updateData = {};
            
            if (editingField === 'role') {
                updateData = {
                    adminMode: editValue === 'Admin',
                    playerMode: true 
                };
            } else {
                updateData = { [editingField]: editValue };
            }

            await db.ref(`webGame/${activeViewID}`).update(updateData);
            setEditingField(null);
            alert("Update successful!");
        } catch (error) {
            alert("Failed to update data.");
        }
    };

    const handleGenerateAI = async () => {
        if (isGeneratingAI) return;
        setIsGeneratingAI(true);

        try {
            const response = await fetch(`${apiBaseUrl}/api/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerEmail: userData.email,
                    playerName: userData.name,
                    assessments: stats.assessments,
                    coursesTaken: userData.courses,
                    scores: userData.scores,
                    tags: userData.tags,
                    quizResults: userData.quizResults
                })
            });

            const result = await response.json();
            const aiText = result.aiText?.trim() || "No response from AI.";
            await db.ref(`webGame/${activeViewID}/comment`).set(aiText);
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
            await db.ref(`webGame/${loggedInPlayerID}`).update({
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
                await db.ref(`webGame/${loggedInPlayerID}`).remove();
                handleLogout();
            } catch (error) {
                alert("Error deleting account.");
            }
        }
    };

    if (!isOpen) return null;

    return(
        <div className="modalBackdrop">
            <div className="modalContainer">
                <button id="closeButton" onClick={onClose}>X</button>
                
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

                        <div className="searchSection">
                            <form onSubmit={handleSearch}>
                                <input 
                                    type="text" 
                                    placeholder="Search Player ID to view other dashboards..." 
                                    value={searchID}
                                    onChange={(e) => setSearchID(e.target.value)}
                                    className="searchInput"
                                />

                                <button type="submit" id="searchBtn">SEARCH</button>
                            </form>

                            {activeViewID !== loggedInPlayerID && (
                                <button onClick={resetToOwnProfile} id="backBtn">MY PROFILE</button>
                            )}
                        </div>

                        <main>
                            {loading ? (
                                <div className="displayText">
                                    <p>Loading Player Data...</p>
                                </div>
                            ) : !userData ? (
                                <div className="displayText">
                                    <p>PLAYER NOT FOUND</p>
                                    <button onClick={resetToOwnProfile}>RETURN TO MY PROFILE</button>
                                </div>
                            ) : (
                                <>
                                    <div id="profileContainer" className={`profileContainer ${!isPrivateView ? 'visitorMode' : ''}`}>
                                        <label className="mainHeader">
                                            {activeViewID === loggedInPlayerID ? "MY PROFILE" : "VIEWING PLAYER"}
                                        </label>

                                        <div className="imgWrapper">
                                            <img src={userData?.gender === 'Female' ? "assets/Character/StaticFemale.gif" : "assets/Character/StaticMale.gif"} alt="Avatar" />
                                        </div>

                                        <div className="idContainer">
                                            <label className="subHeader">PLAYER ID:</label>
                                            <div className="idField">
                                                <input
                                                    style={{ fontSize: "18px", fontFamily: '"Press Start 2P", cursive', color: "#fff" }}
                                                    value={activeViewID || "No Player ID"} readOnly
                                                />

                                                {(activeViewID || activeViewID === "N/A") && (
                                                    <>
                                                        <img
                                                            typeof="text/svg"
                                                            style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                            onClick={() => copyToClipboard(activeViewID)}
                                                            src={"assets/WebAssets/Copy.svg"} 
                                                            alt="Copy Player ID" 
                                                        />
                                                        
                                                        <img
                                                            typeof="text/svg"
                                                            style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                            onClick={() => editData('playerID', activeViewID)}
                                                            src={"assets/WebAssets/Edit.svg"} 
                                                            alt="Edit Player ID" 
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {isPrivateView && (
                                            <div className="emailContainer">
                                                <label className="subHeader">PLAYER EMAIL:</label>
                                                <div className="emailField">
                                                    <input
                                                        style={{ fontSize: "18px", fontFamily: '"Press Start 2P", cursive', color: "#fff" }}
                                                        value={userData?.email || "N/A"} readOnly
                                                    />

                                                    {(userData?.email || userData.email === "N/A") && (
                                                        <>
                                                            <img
                                                                typeof="text/svg"
                                                                style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                                onClick={() => copyToClipboard(userData?.email)}
                                                                src={"assets/WebAssets/Copy.svg"} 
                                                                alt="Copy Email" 
                                                            />

                                                            <img
                                                                typeof="text/svg"
                                                                style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                                onClick={() => editData('email', userData?.email)}
                                                                src={"assets/WebAssets/Edit.svg"} 
                                                                alt="Edit Email" 
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="roleContainer">
                                            <label className="subHeader">ROLE:</label>
                                            <div className="roleField">
                                                <input
                                                    style={{ fontSize: "18px", fontFamily: '"Press Start 2P", cursive', color: "#fff" }}
                                                    value={
                                                        userData?.adminMode && userData?.playerMode ? "Admin" 
                                                        : userData?.adminMode ? "Admin" 
                                                        : userData?.playerMode ? "Player"
                                                        : "Guest"
                                                    } 
                                                    readOnly
                                                />

                                                {(userData?.adminMode && userData?.playerMode) && (
                                                    <img
                                                        typeof="text/svg"
                                                        style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                        onClick={() => editData('role', userData?.adminMode ? 'Admin' : 'Player')}
                                                        src={"assets/WebAssets/Edit.svg"} 
                                                        alt="Edit Role" 
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="nameContainer">
                                            <label className="subHeader">PLAYER NAME:</label>
                                            <label className="subLabel">{userData?.name || "Guest"}</label>
                                            {(userData?.name || userData.name === "Guest") && (
                                                <img
                                                    typeof="text/svg"
                                                    style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                    onClick={() => editData('name', userData?.name)}
                                                    src={"assets/WebAssets/Edit.svg"} 
                                                    alt="Edit Name" 
                                                />
                                            )}
                                        </div>
                                        
                                        {isPrivateView && (
                                            <div className="passContainer">
                                                <label className="subHeader">PASSWORD:</label>
                                                <div className="passField">
                                                    <input 
                                                        type={(!userData?.pass || userData.pass === "No Password") ? "text" : (showPassword ? "text" : "password")}
                                                        style={{ fontSize: "18px", fontFamily: '"Press Start 2P", cursive', color: "#fff" }}
                                                        value={userData?.pass || "No Password"} readOnly
                                                    />

                                                    {(userData?.pass || userData.pass === "No Password") && (
                                                        <>
                                                            <img
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                src={`assets/WebAssets/Padlock${showPassword ? 'Opened' : 'Closed'}.png`} 
                                                                alt="Show/Hide Password" 
                                                            />

                                                            <img
                                                                typeof="text/svg"
                                                                style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                                onClick={() => editData('pass', userData?.pass)}
                                                                src={"assets/WebAssets/Edit.svg"} 
                                                                alt="Edit Password" 
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="genderContainer">
                                            <label className="subHeader">GENDER:</label>
                                            <label className="subLabel">{userData?.gender || "N/A"}</label>
                                            {(userData?.gender || userData.gender === "N/A") && (
                                                <img
                                                    typeof="text/svg"
                                                    style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                    onClick={() => editData('gender', userData?.gender)}
                                                    src={"assets/WebAssets/Edit.svg"} 
                                                    alt="Edit Gender" 
                                                />
                                            )}
                                        </div>

                                        {isPrivateView && (
                                            <div className="pinContainer">
                                                <label className="subHeader">PIN:</label>
                                                <div className="pinField">
                                                    <input 
                                                        type={(!userData?.pin || userData.pin === "No PIN") ? "text" : (showPin ? "text" : "password")}
                                                        style={{ fontSize: '18px', fontFamily: '"Press Start 2P", cursive', color: "#fff" }}
                                                        value={userData?.pin || "No PIN"} readOnly
                                                    />

                                                    {(userData?.pin || userData.pin === "No PIN") && (
                                                        <>
                                                            <img
                                                                onClick={() => setShowPin(!showPin)}
                                                                src={`assets/WebAssets/Padlock${showPin ? 'Opened' : 'Closed'}.png`} 
                                                                alt="Show/Hide PIN" 
                                                            />

                                                            <img
                                                                typeof="text/svg"
                                                                style={{ filter: "invert()", width: "24px", height: "auto" }}
                                                                onClick={() => editData('pin', userData?.pin)}
                                                                src={"assets/WebAssets/Edit.svg"} 
                                                                alt="Edit PIN" 
                                                            />
                                                        </>
                                                    )}      
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <StatisticsLoad 
                                        stats={stats}
                                        userData={userData}
                                        isGeneratingAI={isGeneratingAI}
                                        onGenerateAI={handleGenerateAI}
                                        isPrivateView={isPrivateView}
                                    />

                                    {isPrivateView && (
                                        <div id="actionsContainer" className="actionsContainer">
                                            <label className="label" id="actions">ACTIONS</label>
                                            <div className="buttonWrapper">
                                                <button id="resetButton" onClick={handleReset}>RESET PROGRESS</button>
                                                <button id="deleteButton" onClick={handleDeleteAccount}>DELETE ACCOUNT</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {editingField && (
                                <div className="editBox">
                                    <label className="label" id="actions">Editing {editingField.toUpperCase()}</label>
                                    
                                    {editingField === 'gender' ? (
                                        <div className="radioGroup">
                                            <label>
                                                <input type="radio" name="gender" value="Male" 
                                                    checked={editValue === 'Male'} 
                                                    onChange={(e) => setEditValue(e.target.value)} /> Male
                                            </label>

                                            <label>
                                                <input type="radio" name="gender" value="Female" 
                                                    checked={editValue === 'Female'} 
                                                    onChange={(e) => setEditValue(e.target.value)} /> Female
                                            </label>
                                        </div>
                                    ) : editingField === 'role' ? (
                                        <label>
                                            <input type="checkbox" 
                                                checked={editValue === 'Admin'} 
                                                onChange={(e) => setEditValue(e.target.checked ? 'Admin' : 'Player')} 
                                            /> Is Admin?
                                        </label>
                                    ) : (
                                        <input 
                                            type="text" 
                                            className="editInput"
                                            value={editValue} 
                                            onChange={(e) => setEditValue(e.target.value)} 
                                        />
                                    )}

                                    <div className="editActions">
                                        <button onClick={saveEdit}>SAVE</button>
                                        <button onClick={() => setEditingField(null)}>CANCEL</button>
                                    </div>
                                </div>
                            )}
                        </main>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;