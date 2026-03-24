import React, { useState } from 'react';
import '../styles/StatisticsLoad.css';
import type { StatisticsProps } from './props';
import CourseItem from './CourseItem';

const StatisticsLoad: React.FC<StatisticsProps> = ({ stats, userData, isGeneratingAI, onGenerateAI }) => {
    const [isSelectedOpen, setIsSelectedOpen] = useState(true);
    const [isNonselectedOpen, setIsNonselectedOpen] = useState(false);

    const userScores = userData?.scores || {};
    const courseProgress = stats.courseProgress || {};

    if (!stats) return null;
    return (
        <div id="statisticContainer" className="statisticContainer">
            <label className="mainHeader">STATISTICS</label>

            <div className="selectedCourses">
                <div className="selectedCoursesHeader">
                    <label className="subHeader">SELECTED COURSES</label>
                    <img 
                        className={`drawerArrow ${isSelectedOpen ? 'open' : ''}`}
                        src={`/assets/WebAssets/Drawer.png`}
                        onClick={() => setIsSelectedOpen(!isSelectedOpen)}
                    />
                </div>

                <div className={`drawerContent ${isSelectedOpen ? 'show' : 'hide'}`}>
                    {stats.selectedCourses.map(courseCode => (
                        <CourseItem 
                            key={courseCode}
                            courseCode={courseCode}
                            coursePercent={courseProgress[courseCode] || 0}
                            scores={userScores[courseCode]}
                        />
                    ))}
                </div>
            </div>
            
            <div className="nonselectedCourses">
                <div className="nonselectedCoursesHeader">
                    <label className="subHeader">OTHER AVAILABLE COURSES</label>
                    <img 
                        className={`drawerArrow ${isNonselectedOpen ? 'open' : ''}`}
                        src={`/assets/WebAssets/Drawer.png`}
                        onClick={() => setIsNonselectedOpen(!isNonselectedOpen)}
                    />
                </div>
                
                <div className={`drawerContent ${isNonselectedOpen ? 'show' : 'hide'}`}>
                    {stats.nonselectedCourses.map(courseCode => (
                        <CourseItem 
                            key={courseCode}
                            courseCode={courseCode}
                            coursePercent={0}
                            scores={null}
                        />
                    ))}
                </div>
            </div>         

            <section id="skillsPersonalityContainer" className="skillsPersonalityContainer">
                <div className="tagsContainer">
                    <label className="subHeader">YOUR SKILLS</label>

                    <div className="skillList">
                        {stats.skills.length > 0 ? (
                            <ul>
                                {stats.skills.map((skill, index) => (
                                    <li key={index}>[{index + 1}] {skill.text}</li>
                                ))}
                            </ul>
                        ) : ( <p>No skills validated yet</p> )}
                    </div>
                </div>
          
                <div className="personalityContainer">
                    <label className="subHeader">YOUR PERSONALITY</label>

                    <div className="personalityList">
                        {stats.personalities.length > 0 ? (
                            <ul>
                                {stats.personalities.map((personalities, index) => (
                                    <li key={index}>[{index + 1}] {personalities.text}</li>
                                ))}
                            </ul>
                        ) : ( <p>No personalities validated yet</p> )}
                    </div>
                </div>
            </section>

            <section id="commentContainer" className="commentContainer">
                <label className="subHeader">AI COMMENT AND SUGGESTIONS</label>

                <button 
                    onClick={onGenerateAI} 
                    disabled={stats.progress < 100 || isGeneratingAI}
                >
                    {isGeneratingAI ? "ANALYZING..." : "GENERATE AI ANALYSIS"}
                </button>

                <div className="aiCommentBox">
                    {userData?.comment || "Complete courses to unlock AI analysis..."}
                </div>
            </section>
        </div>
    );
};

export default StatisticsLoad;