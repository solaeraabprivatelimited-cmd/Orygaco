// ── Exact schema from the ORYGA Careers Module Implementation Guide ──────────

export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type ApplicationStatus = 'applied' | 'shortlisted' | 'rejected' | 'hired';
export type JobType = 'full-time' | 'part-time' | 'contract';
export type JobStatus = 'active' | 'closed';
export type OrgType = 'hospital' | 'clinic' | 'lab' | 'diagnostic_center';
export type VerificationDocType = 'medical_license' | 'hospital_proof' | 'degree';

/** career_profiles — PK is auth.users.id (not a separate uuid) */
export interface CareerProfile {
  id: string;             // = auth.uid()
  full_name: string;
  role: string;           // doctor, nurse, lab_technician, etc.
  specialization?: string;
  experience_years: number;
  current_hospital?: string;
  location?: string;
  skills: string[];
  open_to_work: boolean;
  bio?: string;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

/** career_organizations — created_by = auth.users.id */
export interface CareerOrganization {
  id: string;
  name: string;
  type: OrgType;
  location: string;
  description?: string;
  website?: string;
  verification_status: VerificationStatus;
  created_by: string;
  created_at: string;
}

/** career_jobs */
export interface CareerJob {
  id: string;
  organization_id: string;
  title: string;
  role: string;
  description: string;
  experience_required: number;
  location: string;
  salary_range?: string;   // free-text e.g. "40,000 – 60,000/month"
  job_type: JobType;
  status: JobStatus;
  created_at: string;
  organization?: CareerOrganization; // joined
}

/** career_applications — applicant_id references career_profiles(id) = auth.uid() */
export interface CareerApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  status: ApplicationStatus;
  cover_note?: string;
  created_at: string;
  job?: CareerJob;           // joined
  applicant?: CareerProfile; // joined
}

/** career_verifications — user_id references auth.users(id) */
export interface CareerVerification {
  id: string;
  user_id: string;
  document_url: string;
  type: VerificationDocType;
  status: VerificationStatus;
  reviewed_by?: string;
  created_at: string;
}

// ── UI Filter shape ───────────────────────────────────────────────────────────
export interface JobFilters {
  search: string;      // free text → ilike on title/role/description
  job_type: JobType | '';
  location: string;
  experience: number | null;  // max years the job requires (lte filter)
}

// ── Label maps ────────────────────────────────────────────────────────────────
export const JOB_TYPE_LABELS: Record<JobType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
};

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  lab: 'Pathology / Lab',
  diagnostic_center: 'Diagnostic Centre',
};

export const APP_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  rejected: 'Not Selected',
  hired: 'Hired',
};

export const APP_STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-green-100 text-green-700',
};

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  pending: 'bg-gray-100 text-gray-600',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export const HEALTHCARE_ROLES = [
  'Doctor', 'Nurse', 'Lab Technician', 'Radiographer', 'Pharmacist',
  'Physiotherapist', 'Medical Coder', 'Healthcare Administrator',
  'Receptionist', 'OT Technician', 'Dietitian', 'Dental Hygienist',
  'Optometrist', 'Paramedic', 'Medical Transcriptionist', 'Other',
];

export const MEDICAL_SPECIALIZATIONS = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics',
  'Gynecology', 'Neurology', 'Orthopedics', 'Psychiatry',
  'Dentistry', 'ENT', 'Ophthalmology', 'Urology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Oncology',
  'Endocrinology', 'Nephrology', 'Gastroenterology', 'Pulmonology',
];

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
