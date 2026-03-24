export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
};

export interface StatisticsProps {
  stats: {
    progress: number;
    courseProgress: Record<string, number>;
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
  coursePercent: number;
  scores: any;
}