export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  location?: string;
}

export interface Doctor {
  id: string;
  userId: string; // Links to User
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  hospitalId: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  about: string;
  image: string;
  availability: string[]; // e.g., ["Mon", "Wed", "Fri"]
  verified: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  location: string; // City, State
  address: string;
  rating: number;
  reviewCount: number;
  image: string;
  specialties: string[];
  facilities: string[];
  contactPhone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'video' | 'in-person';
  notes?: string;
}
