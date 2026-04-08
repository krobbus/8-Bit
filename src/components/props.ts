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
  isPrivateView?: boolean;
}

export interface CourseItemProps {
  courseCode: string;
  assessments: any;
  isPrivateView?: boolean;
}