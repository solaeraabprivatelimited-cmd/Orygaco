import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Building, User } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { BottomNavigation } from './components/BottomNavigation';
import { HomePage } from './components/HomePage';
import { BookDoctorPage } from './components/BookDoctorPage';
import { BookingFlow } from './components/BookingFlow';
import { AuthFlow } from './components/AuthFlow';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { DoctorAppointmentsFlow } from './components/DoctorAppointmentsFlow';
import { DoctorSchedule } from './components/DoctorSchedule';
import { DoctorPatients } from './components/DoctorPatients';
import { DoctorEarnings } from './components/DoctorEarnings';
import { DoctorProfile } from './components/DoctorProfile';
import { DoctorBlogManagement } from './components/DoctorBlogManagement';
import { HealthRecordsPage } from './components/HealthRecordsPage';
import { JobMarketplace } from './components/JobMarketplace';
import { EmergencyMode } from './components/EmergencyMode';
import { HospitalAdmin } from './components/HospitalAdmin';
import { FeaturesPage } from './components/FeaturesPage';
import { TeleconsultPage } from './components/TeleconsultPage';
import { DoctorLandingPage } from './components/DoctorLandingPage';
import { HospitalLandingPage } from './components/HospitalLandingPage';
import { DoctorDetailPage } from './components/DoctorDetailPage';
import { HospitalDetailPage } from './components/HospitalDetailPage';
import { AboutUs } from './components/AboutUs';
import { PatientAppointments } from './components/PatientAppointments';
import { PatientProfile } from './components/PatientProfile';
import { BlogListPage } from './components/BlogListPage';
import { BlogDetailPage } from './components/BlogDetailPage';
import { VerificationBadge } from './components/ui/VerificationBadge';
import logo from 'figma:asset/79875bb7427953c37958c445f51a4ce2f3d7aa79.png';

import { SecurityProvider } from './contexts/SecurityContext';
import { ORYAProvider, useORYA } from './contexts/ORYAContext';
import { ORYAContainer } from './components/orya/ORYAContainer';

// Helper to sync route state with Guardian Node
function ORYARouteSync({ view, data }: { view: string, data?: any }) {
  const { setContext } = useORYA();
  useEffect(() => {
    let context = 'system';
    if (view === 'health-records' || view === 'patient-app') context = 'report';
    if (view === 'booking' || view === 'book-doctor') context = 'appointment';
    if (view === 'doctor-app' || view === 'doctor-dashboard') context = 'dashboard';
    
    setContext(context, data?.id);
  }, [view, data, setContext]);
  return null;
}

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'guest' | 'patient' | 'doctor' | 'hospital'>('guest');
  const [teleconsultUserType, setTeleconsultUserType] = useState<'patient' | 'doctor'>('patient');
  const [bookingData, setBookingData] = useState<any>(null);

  // Handle browser history and back button
  useEffect(() => {
    // Handle initial load from URL hash
    const hash = window.location.hash.slice(1);
    const [view, query] = hash.split('?');
    
    if (view && view !== currentView) {
      setCurrentView(view);
      if (window.history.state?.data) {
        setBookingData(window.history.state.data);
      }
    } else if (!hash) {
      // Set initial history state for home
      window.history.replaceState({ view: 'home' }, '', '#home');
    }

    // Listen for back/forward navigation
    const onPopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
        if (event.state.data) {
          setBookingData(event.state.data);
        }
      } else {
        // Fallback for manual URL changes
        const currentHash = window.location.hash.slice(1);
        const [hashView] = currentHash.split('?');
        if (hashView) {
          setCurrentView(hashView);
        } else {
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    // Check active session on mount and when view changes
    const checkSession = async () => {
      let { data: { session } } = await supabase.auth.getSession();
      
      // Auto-healing: Attempt refresh if session is missing
      if (!session) {
        const { data } = await supabase.auth.refreshSession();
        session = data.session;
      }

      // Check for custom auth token from OTP login
      const customToken = localStorage.getItem('authToken');
      const customUser = localStorage.getItem('user');

      console.log('[App.tsx] Session check:', { hasSession: !!session, hasCustomToken: !!customToken, userId: session?.user?.id });
      
      if (session) {
        setIsAuthenticated(true);
        const role = session.user.user_metadata?.role as any || 'patient';
        setUserRole(role);
      } else if (customToken && customUser) {
        setIsAuthenticated(true);
        try {
            const parsedUser = JSON.parse(customUser);
            setUserRole(parsedUser.role || 'patient');
        } catch (e) {
            console.error('Error parsing custom user:', e);
            setUserRole('patient');
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[App.tsx] Auth state changed:', { event: _event, hasSession: !!session, userId: session?.user?.id });
      setIsAuthenticated(!!session);
      
      if (_event === 'SIGNED_OUT') {
        setUserRole('guest');
        setCurrentView('home');
      } else if (session?.user) {
        const role = session.user.user_metadata?.role as any || 'patient';
        setUserRole(role);
        console.log('[App.tsx] Auth listener updated role to:', role);
      } else {
        setUserRole('guest');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);

  const isDoctorMode = userRole === 'doctor' || (currentView.startsWith('doctor-') && currentView !== 'doctor-detail') || currentView === 'doctor-app' || currentView.startsWith('auth-doctor');

  // Update user role based on current view (fallback/override for guest navigation)
  useEffect(() => {
    if (!isAuthenticated) {
        if (currentView === 'patient-app') {
          // Redirect or handle guest accessing protected route? For now, we rely on dashboard to show "Sign In"
        } else if (currentView === 'home') {
          setUserRole('guest');
        }
    }
  }, [currentView, isAuthenticated]);

  // Redirect authenticated users from landing page/auth to dashboard
  useEffect(() => {
    if (isAuthenticated && (currentView === 'home' || currentView.startsWith('auth'))) {
       const dashboard = userRole === 'doctor' ? 'doctor-app' : (userRole === 'hospital' ? 'hospital-admin' : 'patient-app');
       console.log('[App.tsx] Authenticated user on public page, redirecting to dashboard:', dashboard);
       
       // Use replaceState so we don't trap the user in history loop
       window.history.replaceState({ view: dashboard }, '', `#${dashboard}`);
       setCurrentView(dashboard);
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView, isAuthenticated, userRole]);

  // Apply doctor theme when in doctor views
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDoctorMode) {
      // Apply doctor blue theme
      root.style.setProperty('--primary', 'var(--doctor-primary)');
      root.style.setProperty('--accent', 'var(--doctor-accent)');
      root.style.setProperty('--accent-foreground', 'var(--doctor-primary)');
    } else {
      // Restore patient pink theme
      root.style.setProperty('--primary', '#E63E6D');
      root.style.setProperty('--accent', '#fce7ee');
      root.style.setProperty('--accent-foreground', '#E63E6D');
    }
  }, [currentView]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isNewUser');
    setIsAuthenticated(false);
    setUserRole('guest');
    setCurrentView('home');
    window.history.pushState({ view: 'home' }, '', '#home');
  };

  const handleNavigate = (view: string, data?: any) => {
    // Detect if teleconsult is being accessed from doctor or patient context
    if (view === 'teleconsult') {
      // Check if coming from doctor views
      if (currentView.startsWith('doctor-')) {
        setTeleconsultUserType('doctor');
      } else {
        setTeleconsultUserType('patient');
      }
    }
    
    if (data) {
      setBookingData(data);
    }
    
    // Push new state to history if view changes
    if (currentView !== view) {
      window.history.pushState({ view, data }, '', `#${view}`);
    }
    
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    // Helper for protected routes
    const Protected = ({ children }: { children: React.ReactNode }) => {
      if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Sign in Required</h2>
                    <p className="text-muted-foreground">
                        Please sign in or create an account to access this feature.
                        Your health data is secure and private.
                    </p>
                    <div className="flex gap-3 pt-4 justify-center">
                         <button onClick={() => setCurrentView('auth')} className="px-6 py-2 bg-primary text-white rounded-lg font-medium">
                            Sign In
                         </button>
                         <button onClick={() => setCurrentView('auth')} className="px-6 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
                            Sign Up
                         </button>
                    </div>
                </div>
            </div>
        );
      }
      return <>{children}</>;
    };

    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'auth':
        return <AuthFlow onNavigate={handleNavigate} />;
      case 'auth-doctor':
        return <AuthFlow onNavigate={handleNavigate} initialUserType="doctor" initialScreen="login" />;
      case 'auth-doctor-signup':
        return <AuthFlow onNavigate={handleNavigate} initialUserType="doctor" initialScreen="signup" />;
      case 'auth-hospital':
        return <AuthFlow onNavigate={handleNavigate} initialUserType="hospital" initialScreen="login" />;
      case 'auth-hospital-signup':
        return <AuthFlow onNavigate={handleNavigate} initialUserType="hospital" initialScreen="signup" />;
      case 'about-us':
        return <AboutUs onNavigate={handleNavigate} />;
      case 'book-doctor':
        // Public search page, but clicking "Book" will trigger 'booking' view which is protected
        return <BookDoctorPage onNavigate={handleNavigate} />;
      case 'doctor-landing':
        return <DoctorLandingPage onNavigate={handleNavigate} />;
      case 'hospital-landing':
        return <HospitalLandingPage onNavigate={handleNavigate} />;
      case 'doctor-detail':
        return <DoctorDetailPage onNavigate={handleNavigate} doctor={bookingData} />;
      case 'hospital-detail':
        return <HospitalDetailPage onNavigate={handleNavigate} hospital={bookingData} />;
      case 'booking':
        return <Protected><BookingFlow onNavigate={handleNavigate} onBack={() => handleNavigate('book-doctor')} bookingData={bookingData} /></Protected>;
      case 'patient-app':
        return <Protected><PatientDashboard onNavigate={handleNavigate} /></Protected>;
      case 'patient-appointments':
        return <Protected><PatientAppointments onNavigate={handleNavigate} /></Protected>;
      case 'patient-profile':
        return <Protected><PatientProfile onNavigate={handleNavigate} onBack={() => handleNavigate('patient-app')} /></Protected>;
      case 'doctor-app':
        return <Protected><DoctorDashboard onNavigate={handleNavigate} /></Protected>;
      case 'doctor-appointments':
        return <Protected><DoctorAppointmentsFlow onNavigate={handleNavigate} onBack={() => handleNavigate('doctor-app')} /></Protected>;
      case 'doctor-schedule':
        return <Protected><DoctorSchedule onNavigate={handleNavigate} onBack={() => handleNavigate('doctor-app')} /></Protected>;
      case 'doctor-patients':
        return <Protected><DoctorPatients onNavigate={handleNavigate} onBack={() => handleNavigate('doctor-app')} /></Protected>;
      case 'doctor-earnings':
        return <Protected><DoctorEarnings onNavigate={handleNavigate} onBack={() => handleNavigate('doctor-app')} /></Protected>;
      case 'doctor-profile':
        return <Protected><DoctorProfile onNavigate={handleNavigate} onBack={() => handleNavigate('doctor-app')} /></Protected>;
      case 'doctor-blog-management':
        return <Protected><DoctorBlogManagement onNavigate={handleNavigate} onBack={() => handleNavigate('doctor-app')} /></Protected>;
      case 'health-records':
        return <Protected><HealthRecordsPage onNavigate={handleNavigate} onBack={() => handleNavigate('patient-app')} /></Protected>;
      case 'job-marketplace':
        return <Protected><JobMarketplace onNavigate={handleNavigate} /></Protected>;
      case 'emergency':
        // Emergency should probably be accessible? But "App features" rule says "All features". 
        // I will keep Emergency public as it is critical.
        return <EmergencyMode onNavigate={handleNavigate} />;
      case 'hospital-admin':
        return <Protected><HospitalAdmin onNavigate={handleNavigate} isAuthenticated={isAuthenticated} userRole={userRole} /></Protected>;
      case 'features':
        return <FeaturesPage onNavigate={handleNavigate} />;
      case 'blogs':
        return <BlogListPage onNavigate={handleNavigate} />;
      case 'blog-detail':
        return <BlogDetailPage onNavigate={handleNavigate} onBack={() => handleNavigate('blogs')} post={bookingData} />;
      case 'hospitals':
        return <HospitalsPage onNavigate={handleNavigate} />;
      case 'teleconsult':
        return <Protected><TeleconsultPage onNavigate={handleNavigate} userType={teleconsultUserType} /></Protected>;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <SecurityProvider>
      <ORYAProvider>
      <ORYARouteSync view={currentView} data={bookingData} />
      <ORYAContainer />
      <div className="min-h-screen bg-background">
        {currentView !== 'emergency' && !currentView.startsWith('auth') && (
        <Navigation 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          isDoctorMode={isDoctorMode} 
          userRole={userRole} 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
      )}
      {renderView()}
      <BottomNavigation currentView={currentView} onNavigate={handleNavigate} userRole={userRole} />
      {userRole === 'guest' && !currentView.startsWith('auth') && 
       !['emergency', 'booking'].includes(currentView) && 
       <Footer onNavigate={handleNavigate} />}
      </div>
      </ORYAProvider>
    </SecurityProvider>
  );
}

// Hospitals Page Component
function HospitalsPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHospitals() {
      try {
        if (!projectId) return;
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospitals`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Merge with hardcoded if empty, or just use data? 
          // For now, if empty, we might show a "No hospitals found" or fallback to demo data for display purposes if the user hasn't added any.
          // But the requirement is "Automatically added... Instantly visible".
          // So I should prefer the real data.
          setHospitals(data);
        }
      } catch (e) {
        console.error("Failed to load hospitals", e);
      } finally {
        setLoading(false);
      }
    }
    loadHospitals();
  }, []);

  return (
    <div className="min-h-screen pt-[24px] pb-[64px] pr-[0px] pl-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl tracking-tight mb-4">Partner Hospitals</h1>
          <p className="text-lg text-muted-foreground">
            Access quality care at partner hospitals across India
          </p>
        </div>

        {loading ? (
             <div className="text-center py-12">Loading hospitals...</div>
        ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {hospitals.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                      No hospitals registered yet.
                  </div>
               ) : (
                  hospitals.map((hospital) => (
                    <div key={hospital.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border flex flex-col">
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Building className="w-12 h-12 text-primary/40" />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                           <h3 className="text-xl font-semibold">{hospital.name}</h3>
                           <VerificationBadge status={hospital.verification_status || (hospital.verified ? 'verified_hospital' : null)} showLabel={false} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 flex items-start gap-2">
                             <span>📍</span> {hospital.location}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hospital.specialties ? (
                              hospital.specialties.split(',').slice(0, 3).map((specialty: string, idx: number) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-accent rounded-full">
                                  {specialty.trim()}
                                </span>
                              ))
                          ) : (
                              <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-500">General</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                             {hospital.description || "Leading healthcare provider."}
                        </p>
                        <div className="mt-auto flex gap-2">
                          <button 
                            onClick={() => onNavigate('hospital-detail', hospital)} 
                            className="flex-1 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => onNavigate('book-doctor')}
                            className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
               )}
             </div>
        )}
      </div>
    </div>
  );
}

// Footer Component
function Footer({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16">
          <div className="md:col-span-5 space-y-6">
            <button 
              onClick={() => onNavigate('home')}
              className="group flex items-center gap-3 mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img 
                  src={logo} 
                  alt="ORYGA" 
                  className="w-10 h-10 relative z-10 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">ORYGA</span>
            </button>
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm font-light">
              Reimagining healthcare for India. A unified platform for patients, doctors, and hospitals—built on trust, privacy, and empathy.
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="h-10 px-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center text-sm font-medium text-slate-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
                ABDM Compliant
              </div>
              <div className="h-10 px-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center text-sm font-medium text-slate-600">
                <span className="mr-2 text-primary">★</span>
                ISO 27001
              </div>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-6 tracking-tight">For Patients</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => onNavigate('book-doctor')} className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Find a Doctor</button></li>
                <li><button onClick={() => onNavigate('hospitals')} className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Top Hospitals</button></li>
                <li><button onClick={() => onNavigate('features')} className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Health Features</button></li>
                <li><button onClick={() => onNavigate('emergency')} className="text-red-500/80 hover:text-red-600 font-medium transition-colors hover:translate-x-1 duration-200 inline-block">Emergency Care</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-6 tracking-tight">For Providers</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => onNavigate('doctor-app')} className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Doctor Console</button></li>
                <li><button onClick={() => onNavigate('job-marketplace')} className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Job Marketplace</button></li>
                <li><button onClick={() => onNavigate('hospital-landing')} className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Hospitals</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Partner with Us</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-6 tracking-tight">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => onNavigate('about-us')} className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">About Us</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Privacy Policy</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Terms of Service</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">Contact Support</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-muted-foreground">
            © 2026 ORYGA. All rights reserved.
          </div>
          
          {/* Premium Watermark */}
          <div className="flex flex-col items-center md:items-end">
             <div className="text-[10px] font-mono text-slate-300 uppercase tracking-[0.3em] hover:text-primary transition-colors cursor-default select-none">
                Product by
             </div>
             <div className="text-xs font-bold text-slate-400 tracking-wider">
                SOLAERAAB
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}