import { useState } from 'react';
import { Menu, X, AlertCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase';
import OrygaPNill from '../../imports/OrygaPNill';
import OrygaDNill from '../../imports/OrygaDNill-124-78';
import logo from 'figma:asset/79875bb7427953c37958c445f51a4ce2f3d7aa79.png';
import doctorLogo from 'figma:asset/012bc52855fab966b16a213602983ec5567509b5.png';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isDoctorMode?: boolean;
  userRole?: 'guest' | 'patient' | 'doctor' | 'hospital';
  isAuthenticated?: boolean;
}

export function Navigation({ currentView, onNavigate, isDoctorMode = false, userRole = 'guest', isAuthenticated = false }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentLogo = isDoctorMode ? doctorLogo : logo;
  
  const isPatient = userRole === 'patient';
  const isDoctor = userRole === 'doctor';
  const isHospital = userRole === 'hospital';
  
  // Robust check: Trust isAuthenticated from parent if provided, otherwise fall back to role check
  const isLoggedIn = isAuthenticated || (isPatient || isDoctor || isHospital);

  const getDashboardView = () => {
    if (isDoctor) return 'doctor-app';
    if (isHospital) return 'hospital-admin';
    return 'patient-app';
  };

  // Define public views where we show public nav links and hide dashboard controls
  const publicViews = ['home', 'features', 'blogs', 'blog-detail', 'about-us', 'doctor-landing', 'hospital-landing', 'hospitals', 'doctor-detail', 'hospital-detail', 'auth', 'auth-doctor', 'auth-hospital'];
  const isPublicView = publicViews.includes(currentView);

  let navLinks = [
    { id: isLoggedIn ? getDashboardView() : 'home', label: isLoggedIn ? 'Dashboard' : 'Home' },
    { id: 'book-doctor', label: 'Find Doctors' },
    { id: 'hospital-landing', label: 'Hospitals' },
    { id: 'blogs', label: 'Insights' },
  ];

  if (!isPublicView) {
    if (isPatient) {
      navLinks = [
        { id: 'patient-app', label: 'Dashboard' },
        { id: 'patient-appointments', label: 'My Appointments' },
        { id: 'book-doctor', label: 'Find Doctors' },
        { id: 'health-records', label: 'My Records' },
      ];
    } else if (isDoctor) {
      navLinks = [
        { id: 'doctor-app', label: 'Dashboard' },
        { id: 'doctor-appointments', label: 'Appointments' },
        { id: 'doctor-patients', label: 'My Patients' },
        { id: 'doctor-schedule', label: 'Schedule' },
      ];
    } else if (isHospital) {
      navLinks = [
        { id: 'hospital-admin', label: 'Dashboard' },
        { id: 'job-marketplace', label: 'Job Marketplace' },
      ];
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('home');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex lg:grid lg:grid-cols-[1fr_auto_1fr] items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center justify-start min-w-0">
            <button 
              onClick={() => onNavigate(isLoggedIn ? getDashboardView() : 'home')}
              className="group flex items-center gap-2 hover:opacity-100 transition-opacity text-center shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {isDoctorMode ? (
                  <div className="w-9 h-9 relative z-9 transition-transform duration-300 group-hover:scale-105">
                    <OrygaDNill />
                  </div>
                ) : (
                  <div className="w-9 h-9 relative z-9 transition-transform duration-300 group-hover:scale-105">
                    <OrygaPNill />
                  </div>
                )}
              </div>
              <span className="text-2xl tracking-tight text-foreground font-bold">
                {isDoctor ? 'ORYGA Plus' : (isHospital ? 'ORYGA Plus' : 'Oryga')}
              </span>
            </button>
          </div>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center justify-center">
            <nav className="flex items-center gap-1 p-1.5 rounded-full bg-slate-50/80 backdrop-blur-md border border-slate-200/60 shadow-sm">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentView === item.id 
                      ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' 
                      : 'text-slate-600 hover:text-foreground hover:bg-slate-100/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-3">
            <div className="hidden md:flex items-center gap-3">
              {/* For Doctors Link (Public Only) */}
              {!isLoggedIn && (
                <button
                  onClick={() => onNavigate('doctor-landing')}
                  className="hidden xl:block text-sm font-medium text-slate-500 hover:text-primary transition-colors px-2"
                >
                  For Doctors
                </button>
              )}

              {isLoggedIn ? (
                // Logged In State
                <div className="flex items-center bg-slate-50/80 backdrop-blur-sm p-1.5 rounded-full border border-slate-200/60 shadow-sm gap-1">
                   {isPublicView ? (
                     <Button 
                      size="sm"
                      className="rounded-full px-5 shadow-sm bg-primary hover:bg-primary/90 text-white border border-white/20"
                      onClick={() => onNavigate(getDashboardView())}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                   ) : (
                     <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="rounded-full px-4 text-slate-600 hover:text-foreground hover:bg-white transition-all"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs ml-1">
                         {isDoctor ? 'DR' : (isHospital ? 'HA' : 'PT')}
                      </div>
                     </>
                   )}
                </div>
              ) : (
                // Guest State
                <div className="flex items-center bg-slate-50/80 backdrop-blur-sm p-1.5 rounded-full border border-slate-200/60 shadow-sm gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hidden lg:flex rounded-full px-4 text-slate-600 hover:text-foreground hover:bg-white transition-all"
                    onClick={() => onNavigate('auth')}
                  >
                    Log in
                  </Button>
                  
                  <Button 
                    size="sm"
                    className="rounded-full px-5 shadow-sm bg-primary hover:bg-primary/90 text-white border border-white/20"
                    onClick={() => onNavigate('book-doctor')}
                  >
                    Book
                  </Button>
                </div>
              )}

              {/* Emergency Button (Hide for Hospital) */}
              {!isHospital && (
                <button 
                  onClick={() => onNavigate('emergency')}
                  className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-white border-2 border-red-50 hover:border-red-100 shadow-sm hover:shadow-md hover:shadow-red-100/50 transition-all duration-300"
                  title="Emergency SOS"
                >
                  <span className="absolute inset-0 rounded-full bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <AlertCircle className="w-5 h-5 text-red-500 relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white z-20 animate-pulse"></span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col gap-2">
              {(isLoggedIn ? (
                  isPatient ? [
                    { id: 'patient-app', label: 'Dashboard' },
                    { id: 'patient-appointments', label: 'Appointments' },
                    { id: 'health-records', label: 'Health Records' },
                    { id: 'book-doctor', label: 'Find Doctors' },
                    { id: 'patient-profile', label: 'My Profile' }
                  ] : isDoctor ? [
                    { id: 'doctor-app', label: 'Dashboard' },
                    { id: 'doctor-appointments', label: 'Appointments' },
                    { id: 'doctor-patients', label: 'My Patients' },
                    { id: 'doctor-schedule', label: 'Schedule' }
                  ] : [
                    { id: 'hospital-admin', label: 'Dashboard' },
                    { id: 'job-marketplace', label: 'Job Marketplace' }
                  ]
              ) : navLinks).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                    currentView === item.id
                      ? 'bg-primary/5 text-primary ring-1 ring-primary/20' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {!isLoggedIn && (
                 <>
                    <button
                      onClick={() => {
                        onNavigate('about-us');
                        setMobileMenuOpen(false);
                      }}
                      className="p-3.5 rounded-xl text-sm font-medium transition-colors text-left w-full bg-slate-50 text-slate-600 hover:bg-slate-100"
                    >
                      About Us
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('doctor-landing');
                        setMobileMenuOpen(false);
                      }}
                      className="p-3.5 rounded-xl text-sm font-medium transition-colors text-left w-full bg-slate-50 text-slate-600 hover:bg-slate-100"
                    >
                      For Doctors
                    </button>
                 </>
              )}
            </div>

            <div className="space-y-3">
              {isLoggedIn ? (
                <Button 
                  className="w-full rounded-xl h-12 text-base shadow-lg"
                  variant="outline"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button 
                  className="w-full rounded-xl h-12 text-base shadow-lg shadow-primary/20"
                  onClick={() => {
                    onNavigate('book-doctor');
                    setMobileMenuOpen(false);
                  }}
                >
                  Book Appointment
                </Button>
              )}
              
              {!isHospital && (
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  onClick={() => {
                    onNavigate('emergency');
                    setMobileMenuOpen(false);
                  }}
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Emergency SOS
                </Button>
              )}
            </div>
            
            {!isLoggedIn && (
              <div className="pt-6 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {
                      onNavigate('auth');
                      setMobileMenuOpen(false);
                  }}
                  className="text-sm text-slate-500 hover:text-foreground font-medium inline-flex items-center justify-center gap-1"
                >
                  Already have an account? <span className="text-primary font-semibold">Sign In</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}