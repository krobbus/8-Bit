export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
};

export interface StatisticsProps {
  stats: {
    assessments: any;
    hasOneCompleteCourse: boolean,
    selectedCourses: string[];
    nonselectedCourses: string[];
    skills: any[];
    personalities: any[];
  };
  userData: any;
  isGeneratingAI: boolean;
  onGenerateAI: () => Promise<void>;
}

export interface CourseItemProps {
  courseCode: string;
  assessments: any;
}