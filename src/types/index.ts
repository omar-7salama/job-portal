export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'JOB_SEEKER' | 'EMPLOYER';
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  status: 'OPEN' | 'CLOSED';
  employerId: string;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  appliedAt: string;
  job?: Job;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'JOB_SEEKER' | 'EMPLOYER';
}

export interface CreateJobRequest {
  title: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
}

export interface ApplyJobRequest {
  jobId: string;
  coverLetter: string;
}