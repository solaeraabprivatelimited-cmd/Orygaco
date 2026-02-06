export interface HospitalProfile {
  id: string;
  display_name: string;
  legal_name?: string;
  tagline?: string;
  about?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  locations?: HospitalLocation[];
  operations?: HospitalOperations;
  departments?: HospitalDepartment[];
  facilities?: HospitalFacilities;
  verification?: HospitalVerification;
  feature_flags?: HospitalFeatureFlags;
}

export interface HospitalLocation {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  parking_available: boolean;
  wheelchair_accessible: boolean;
}

export interface HospitalOperations {
  opd_start_time: string;
  opd_end_time: string;
  emergency_available: boolean;
  holiday_override?: Record<string, boolean>; // date -> isOpen
}

export interface HospitalDepartment {
  id: string;
  name: string; // from "department_name" in schema
  enabled: boolean;
  load_threshold: 'normal' | 'high' | 'critical';
}

export interface HospitalFacilities {
  icu_available: boolean;
  icu_capacity?: number;
  nicu_available: boolean;
  nicu_capacity?: number;
  ot_count: number;
  pharmacy_available: boolean;
  lab_available: boolean;
  ambulance_available: boolean;
}

export interface HospitalVerification {
  status: 'unverified' | 'under_review' | 'verified' | 'suspended';
  verified_by?: string;
  verified_at?: string;
  notes?: string;
}

export interface HospitalFeatureFlags {
  online_booking: boolean;
  walkin_only: boolean;
  video_consultation: boolean;
  payments_enabled: boolean;
}

export interface HospitalAuditLog {
  id: string;
  hospital_id: string;
  changed_by: string;
  change_summary: string | Record<string, any>;
  created_at: string;
}
