
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bloodGroup: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  hospitalId: string; // Foreign key relation
  consultationFee: number;
  availability: string[];
  image: string;
  about: string;
  verified: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  facilities: string[];
  image: string;
  phone: string;
  emergencyAvailable: boolean;
}

// --- Mock Data Sets ---

export const HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'Apollo Indraprastha',
    address: 'Sarita Vihar, Delhi Mathura Road',
    city: 'New Delhi',
    rating: 4.8,
    facilities: ['ICU', 'Cardiology', 'Neurology', 'Organ Transplant'],
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b9af9ef?q=80&w=1000&auto=format&fit=crop',
    phone: '+91-11-26925858',
    emergencyAvailable: true,
  },
  {
    id: 'h2',
    name: 'Fortis Memorial Research Institute',
    address: 'Sector 44',
    city: 'Gurugram',
    rating: 4.7,
    facilities: ['Oncology', 'Robotic Surgery', 'Pediatrics'],
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop',
    phone: '+91-124-4962200',
    emergencyAvailable: true,
  },
  {
    id: 'h3',
    name: 'Manipal Hospitals',
    address: 'Old Airport Road',
    city: 'Bengaluru',
    rating: 4.6,
    facilities: ['Orthopedics', 'Gastroenterology', 'Dialysis'],
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1000&auto=format&fit=crop',
    phone: '+91-80-25024444',
    emergencyAvailable: true,
  },
  {
    id: 'h4',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    address: 'Rao Saheb, Achutrao Patwardhan Marg, Four Bungalows, Andheri West',
    city: 'Mumbai',
    rating: 4.9,
    facilities: ['Cancer Care', 'Children Heart Centre', 'Sports Medicine'],
    image: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?q=80&w=1000&auto=format&fit=crop',
    phone: '+91-22-30999999',
    emergencyAvailable: true,
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Jen',
    specialty: 'Cardiologist',
    qualification: 'MBBS, MD (Cardiology)',
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 124,
    hospitalId: 'h1',
    consultationFee: 1500,
    availability: ['Mon', 'Wed', 'Fri'],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1080&auto=format&fit=crop',
    about: 'Expert in interventional cardiology and heart failure management with over 8 years of experience at top institutes.',
    verified: true,
  },
  {
    id: 'd2',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Neurologist',
    qualification: 'MBBS, DM (Neurology)',
    experienceYears: 15,
    rating: 4.8,
    reviewCount: 89,
    hospitalId: 'h2',
    consultationFee: 2000,
    availability: ['Tue', 'Thu', 'Sat'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1080&auto=format&fit=crop',
    about: 'Specializes in stroke management, epilepsy, and movement disorders. Formerly at AIIMS.',
    verified: true,
  },
  {
    id: 'd3',
    name: 'Dr. Anjali Gupta',
    specialty: 'Pediatrician',
    qualification: 'MBBS, MD (Pediatrics)',
    experienceYears: 10,
    rating: 4.9,
    reviewCount: 210,
    hospitalId: 'h3',
    consultationFee: 1200,
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1080&auto=format&fit=crop',
    about: 'Compassionate care for children of all ages. Expert in vaccination and developmental assessment.',
    verified: true,
  },
  {
    id: 'd4',
    name: 'Dr. Vikram Singh',
    specialty: 'Orthopedic Surgeon',
    qualification: 'MBBS, MS (Ortho)',
    experienceYears: 12,
    rating: 4.7,
    reviewCount: 150,
    hospitalId: 'h4',
    consultationFee: 1800,
    availability: ['Mon', 'Wed', 'Sat'],
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1080&auto=format&fit=crop',
    about: 'Specialist in joint replacement and sports injuries. Minimally invasive surgery expert.',
    verified: true,
  },
  {
    id: 'd5',
    name: 'Dr. Priya Sharma',
    specialty: 'Dermatologist',
    qualification: 'MBBS, MD (Dermatology)',
    experienceYears: 6,
    rating: 4.6,
    reviewCount: 75,
    hospitalId: 'h1',
    consultationFee: 1000,
    availability: ['Tue', 'Thu', 'Fri'],
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1080&auto=format&fit=crop',
    about: 'Expert in clinical and aesthetic dermatology. Laser treatments and skin rejuvenation.',
    verified: true,
  },
];

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    phone: '+91-9876543210',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1080&auto=format&fit=crop',
    bloodGroup: 'B+',
    age: 28,
    gender: 'Male',
    address: {
      street: '12, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400001',
    },
  },
  {
    id: 'u2',
    name: 'Diya Rao',
    email: 'diya.rao@example.com',
    phone: '+91-9988776655',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1080&auto=format&fit=crop',
    bloodGroup: 'O+',
    age: 34,
    gender: 'Female',
    address: {
      street: '45, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560038',
    },
  },
];
