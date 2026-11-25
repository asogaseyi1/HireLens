export const APPLICATION_STATUSES = [
  "Wishlist",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type DocumentType = "Resume" | "CoverLetter" | "InterviewPrep";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface Profile {
  email: string;
  fullName: string | null;
  baseResume: string | null;
}

export interface JobApplication {
  id: number;
  jobTitle: string;
  company: string;
  location: string | null;
  jobLink: string | null;
  jobDescription: string | null;
  status: ApplicationStatus;
  appliedDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type JobApplicationInput = Omit<JobApplication, "id" | "createdAt" | "updatedAt">;

export interface GeneratedDocument {
  id: number;
  jobApplicationId: number;
  type: DocumentType;
  content: string;
  createdAt: string;
}
