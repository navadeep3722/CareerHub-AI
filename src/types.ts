export type UserRole = 'ROLE_STUDENT' | 'ROLE_RECRUITER' | 'ROLE_ADMIN';

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  token?: string;
  companyName?: string;
  avatarUrl?: string;
}

export interface ResumeAnalysisResult {
  score: number; // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  improvements: string[];
  matchedRole: string;
}

export interface InterviewMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  feedback?: string; // AI's assessment of the user's specific answer
}

export interface InterviewSession {
  id: string;
  jobTitle: string;
  messages: InterviewMessage[];
  status: 'active' | 'completed';
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  experienceYears: number;
  skills: string[];
  education: string;
  resumeText: string;
  currentRole: string;
  // Matching information (filled after analysis)
  suitabilityScore?: number;
  criticalGaps?: string[];
  strengthsSummary?: string;
  suggestedQuestions?: string[];
  status?: 'Applied' | 'Screened' | 'Interviewing' | 'Offered' | 'Rejected';
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string; // 'Full-time' | 'Contract' | 'Internship'
  description: string;
  requirements: string[];
  salary: string;
  status: 'Active' | 'Draft' | 'Closed';
  applicantsCount: number;
  createdAt: string;
}

export interface RecruitmentAnalytics {
  totalApplicants: number;
  screenedCount: number;
  interviewingCount: number;
  offeredCount: number;
  rejectionRate: number; // percentage
  averageScore: number; // 0-100
}
