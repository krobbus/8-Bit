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

const CourseItem: React.FC<CourseItemProps> = ({ courseCode, coursePercent, scores }) => {
    const safeScores = scores || {};
    const hasMC = safeScores.multipleChoice !== undefined;
    const mcScore = safeScores.multipleChoice || 0;
    const hasID = safeScores.identification !== undefined;
    const idScore = safeScores.identification || 0;
    const totalQuizScore = mcScore + idScore;

    const hasSkill = safeScores.skill !== undefined;
    const hasPers = safeScores.personality !== undefined;

    const getCode = (str: string) => {
        const match = str.match(/\(([^)]+)\)/);
        return match ? match[1] : str;
    };
    const fixedCode = getCode(courseCode);

    return (
        <div className="courseStatCard">
            <div className="courseInfo">
                <label className="courseTitle">{courseNames[fixedCode || ""] || courseCode}</label>
                <label className="courseDescription">{courseDescription[fixedCode || ""] || "No description available"}</label>
            </div>

            <div className="courseContent">
                <div className="taskGrid">
                    <div className="taskItem">
                        <span>Multiple Choice:</span>
                        <span className={hasMC ? "statusDone" : "statusPending"}>
                            {hasMC ? `${mcScore}/5 (Complete)` : "Pending"}
                        </span>
                    </div>
                    <div className="taskItem">
                        <span>Identification:</span>
                        <span className={hasID ? "statusDone" : "statusPending"}>
                            {hasID ? `${idScore}/5 (Complete)` : "Pending"}
                        </span>
                    </div>
                    <div className="taskItem">
                        <span>Skill Test:</span>
                        <span className={hasSkill ? "statusDone" : "statusPending"}>
                            {hasSkill ? "Complete" : "Not Complete"}
                        </span>
                    </div>
                    <div className="taskItem">
                        <span>Personality Test:</span>
                        <span className={hasPers ? "statusDone" : "statusPending"}>
                            {hasPers ? "Complete" : "Not Complete"}
                        </span>
                    </div>
                </div>

                <div className="courseProgressContainer">
                    <div className="progressBarContainer">
                        <div className="progressBar" style={{ width: `${coursePercent}%` }}></div>
                    </div>
                    <span className="progressPercentage">{coursePercent}%</span>
                </div>
            </div>

            <div className="courseStatus">
                <div className="overallScoreRow">
                    <strong>Overall Quiz Score:</strong>
                    <span>{totalQuizScore}/10</span>
                </div>

                <div className="statusRow">
                    <strong>AI Analysis Status:</strong>
                    <span>{(coursePercent === 100) ? "Ready for evaluation" : "Data Insufficient"}</span>
                </div>
            </div>
        </div>
    );
};

export default CourseItem;