import React from 'react';
import '../styles/CourseItem.css';
import type { CourseItemProps } from "./props";

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

const courseDescription: Record<string, string> = {
    CITCS: "Computer Science and IT program focusing on software development, database management, and system architecture.",
    CCJ: "Criminal Justice studies focusing on law enforcement, forensics, and criminology.",
    CBA: "Business Administration with management and marketing foundations.",
    CAS: "Arts and Sciences track for critical thinking and creativity.",
    CTE: "Education-focused program for teaching and pedagogy training.",
    COM: "Medicine program centered on healthcare, anatomy, and medical research.",
    ISW: "Social Work institute dedicated to community service and social welfare practices.",
    IPPG: "Public Policy and Governance program focused on leadership and civic management."
};

const CourseItem: React.FC<CourseItemProps> = ({ courseCode, scores }) => {
    const assessments = scores || {};

    const getCode = (str: string) => {
        const match = str.match(/\(([^)]+)\)/);
        return match ? match[1] : str;
    };
    const fixedCode = getCode(courseCode);

    const courseRelatedData = assessments[`${fixedCode}_CourseRelated`];
    const skillData = assessments[`${fixedCode}_Skill`];
    const personalityData = assessments[`${fixedCode}_Personality`];

    const hasQuiz = !!courseRelatedData?.lastTakeAt;
    const hasSkill = !!skillData?.lastTakeAt;
    const hasPers = !!personalityData?.lastTakeAt;

    const finishedCount = [hasQuiz, hasSkill, hasPers].filter(Boolean).length;
    const calculatedPercent = Math.round((finishedCount / 3) * 100);

    const quizScore = courseRelatedData?.latestScore?.correct || 0;

    return (
        <div className="courseStatCard">
            <div className="courseInfo">
                <label className="courseTitle">{courseNames[fixedCode || ""] || courseCode}</label>
                <label className="courseDescription">{courseDescription[fixedCode || ""] || "No description available"}</label>
            </div>

            <div className="courseContent">
                <div className="taskGrid">
                    <div className="taskItem">
                        <span>Course-Related Assessment:</span>
                        <span className={hasQuiz ? "statusDone" : "statusPending"}>
                            {hasQuiz ? `${quizScore}/5 (Complete)` : "Pending"}
                        </span>
                    </div>

                    <div className="taskItem">
                        <span>Personality Assessment:</span>
                        <span className={hasPers ? "statusDone" : "statusPending"}>
                            {hasPers ? "Complete" : "Not Complete"}
                        </span>
                    </div>

                    <div className="taskItem">
                        <span>Skill Assessment:</span>
                        <span className={hasSkill ? "statusDone" : "statusPending"}>
                            {hasSkill ? "Complete" : "Not Complete"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="courseStatus">
                <div className="courseProgressContainer">
                    <div className="progressBarContainer">
                        <div className="progressBar" style={{ width: `${calculatedPercent}%` }}></div>
                    </div>
                    <span className="progressPercentage">{calculatedPercent}%</span>
                </div>

                <div className="statusRow">
                    <strong>AI Analysis Status:</strong>
                    <span>{(calculatedPercent === 100) ? "Ready for evaluation" : "Data Insufficient"}</span>
                </div>
            </div>
        </div>
    );
};

export default CourseItem;