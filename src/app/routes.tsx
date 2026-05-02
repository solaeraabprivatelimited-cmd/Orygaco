import { createBrowserRouter } from 'react-router';
import { RootLayout, ProtectedOutlet } from './layouts/RootLayout';
import { HomePage } from './components/HomePage';
import { AboutUs } from './components/AboutUs';
import { FeaturesPage } from './components/FeaturesPage';
import { BlogListPage } from './components/BlogListPage';
import { BlogDetailPage } from './components/BlogDetailPage';
import { ContactUs } from './components/ContactUs';
import { BookDoctorPage } from './components/BookDoctorPage';
import { DoctorDetailPage } from './components/DoctorDetailPage';
import { DoctorLandingPage } from './components/DoctorLandingPage';
import { HospitalLandingPage } from './components/HospitalLandingPage';
import { HospitalsPage } from './components/HospitalsPage';
import { HospitalDetailPage } from './components/HospitalDetailPage';
import { EmergencyMode } from './components/EmergencyMode';
import { AuthFlow } from './components/AuthFlow';
import { AuthCallback } from './components/AuthCallback';
import { PatientDashboard } from './components/PatientDashboard';
import { PatientAppointments } from './components/PatientAppointments';
import { PatientProfile } from './components/PatientProfile';
import { HealthRecordsPage } from './components/HealthRecordsPage';
import { BookingFlow } from './components/BookingFlow';
import { DoctorDashboard } from './components/DoctorDashboard';
import { DoctorAppointmentsFlow } from './components/DoctorAppointmentsFlow';
import { DoctorSchedule } from './components/DoctorSchedule';
import { DoctorPatients } from './components/DoctorPatients';
import { DoctorEarnings } from './components/DoctorEarnings';
import { DoctorProfile } from './components/DoctorProfile';
import { DoctorBlogManagement } from './components/DoctorBlogManagement';
import { HospitalAdmin } from './components/HospitalAdmin';
import { TeleconsultPage } from './components/TeleconsultPage';
import { JobMarketplace } from './components/JobMarketplace';
import { CareersLayout } from './components/careers/CareersLayout';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page not found</p>
      <a href="/" className="px-6 py-2 bg-primary text-white rounded-lg font-medium">
        Go Home
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      // === Public Pages ===
      { index: true, Component: HomePage },
      { path: 'about', Component: AboutUs },
      { path: 'features', Component: FeaturesPage },
      { path: 'blogs', Component: BlogListPage },
      { path: 'blogs/:id', Component: BlogDetailPage },
      { path: 'contact', Component: ContactUs },
      { path: 'find-doctors', Component: BookDoctorPage },
      { path: 'doctors/:id', Component: DoctorDetailPage },
      { path: 'for-doctors', Component: DoctorLandingPage },
      { path: 'for-hospitals', Component: HospitalLandingPage },
      { path: 'hospitals', Component: HospitalsPage },
      { path: 'hospitals/:id', Component: HospitalDetailPage },
      { path: 'emergency', Component: EmergencyMode },
      { path: 'careers', Component: CareersLayout },

      // === Auth Pages ===
      { path: 'auth', Component: AuthFlow },
      { path: 'auth/doctor', Component: AuthFlow },
      { path: 'auth/doctor/signup', Component: AuthFlow },
      { path: 'auth/hospital', Component: AuthFlow },
      { path: 'auth/hospital/signup', Component: AuthFlow },
      { path: 'auth/callback', Component: AuthCallback },
      { path: 'auth/reset-password', Component: AuthCallback },

      // === Protected: Patient Dashboard ===
      {
        Component: ProtectedOutlet,
        children: [
          { path: 'dashboard', Component: PatientDashboard },
          { path: 'dashboard/appointments', Component: PatientAppointments },
          { path: 'dashboard/profile', Component: PatientProfile },
          { path: 'dashboard/records', Component: HealthRecordsPage },
          { path: 'dashboard/booking', Component: BookingFlow },
        ],
      },

      // === Protected: Doctor Dashboard ===
      {
        Component: ProtectedOutlet,
        children: [
          { path: 'doctor', Component: DoctorDashboard },
          { path: 'doctor/appointments', Component: DoctorAppointmentsFlow },
          { path: 'doctor/schedule', Component: DoctorSchedule },
          { path: 'doctor/patients', Component: DoctorPatients },
          { path: 'doctor/earnings', Component: DoctorEarnings },
          { path: 'doctor/profile', Component: DoctorProfile },
          { path: 'doctor/blogs', Component: DoctorBlogManagement },
        ],
      },

      // === Protected: Hospital Admin ===
      {
        Component: ProtectedOutlet,
        children: [
          { path: 'hospital-admin', Component: HospitalAdmin },
        ],
      },

      // === Protected: Shared ===
      {
        Component: ProtectedOutlet,
        children: [
          { path: 'teleconsult', Component: TeleconsultPage },
          { path: 'jobs', Component: JobMarketplace },
        ],
      },

      // === 404 ===
      { path: '*', Component: NotFound },
    ],
  },
]);
