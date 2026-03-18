import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Navigation } from '../components/Navigation';
import { BottomNavigation } from '../components/BottomNavigation';
import { SecurityProvider } from '../contexts/SecurityContext';
import { ORYAProvider, useORYA } from '../contexts/ORYAContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ORYAContainer } from '../components/orya/ORYAContainer';
import { useAppNavigate, pathToView } from '../hooks/useAppNavigate';
import { User } from 'lucide-react';
import logo from 'figma:asset/79875bb7427953c37958c445f51a4ce2f3d7aa79.png';

function ORYARouteSync() {
  const { setContext } = useORYA();
  const location = useLocation();
  const view = pathToView(location.pathname);

  useEffect(() => {
    let context = 'system';
    if (view === 'health-records' || view === 'patient-app') context = 'report';
    if (view === 'booking' || view === 'book-doctor') context = 'appointment';
    if (view === 'doctor-app' || view.startsWith('doctor')) context = 'dashboard';
    setContext(context);
  }, [view, setContext]);

  return null;
}

function ThemeSync() {
  const location = useLocation();
  const { userRole } = useAuth();
  const pathname = location.pathname;

  const isDoctorMode =
    userRole === 'doctor' ||
    (pathname.startsWith('/doctor') && !pathname.startsWith('/doctors/')) ||
    pathname.startsWith('/auth/doctor');

  useEffect(() => {
    const root = document.documentElement;
    if (isDoctorMode) {
      root.style.setProperty('--primary', 'var(--doctor-primary)');
      root.style.setProperty('--accent', 'var(--doctor-accent)');
      root.style.setProperty('--accent-foreground', 'var(--doctor-primary)');
    } else {
      root.style.setProperty('--primary', '#E63E6D');
      root.style.setProperty('--accent', '#fce7ee');
      root.style.setProperty('--accent-foreground', '#E63E6D');
    }
  }, [isDoctorMode]);

  return null;
}

function AuthRedirector() {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const pathname = location.pathname;

  useEffect(() => {
    if (isAuthenticated && (pathname === '/' || pathname.startsWith('/auth'))) {
      const dashboard =
        userRole === 'doctor'
          ? '/doctor'
          : userRole === 'hospital'
            ? '/hospital-admin'
            : '/dashboard';
      routerNavigate(dashboard, { replace: true });
    }
  }, [isAuthenticated, userRole, pathname, routerNavigate]);

  return null;
}

function Footer() {
  const { navigate } = useAppNavigate();
  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16">
          <div className="md:col-span-5 space-y-6">
            <button
              onClick={() => navigate('home')}
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
              <span className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                ORYGA
              </span>
            </button>
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm font-light">
              Reimagining healthcare for India. A unified platform for patients, doctors, and
              hospitals—built on trust, privacy, and empathy.
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
                <li>
                  <button
                    onClick={() => navigate('book-doctor')}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block"
                  >
                    Find a Doctor
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('hospitals')}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block"
                  >
                    Top Hospitals
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('features')}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block"
                  >
                    Health Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('emergency')}
                    className="text-red-500/80 hover:text-red-600 font-medium transition-colors hover:translate-x-1 duration-200 inline-block"
                  >
                    Emergency Care
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-6 tracking-tight">For Providers</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <button
                    onClick={() => navigate('doctor-app')}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block"
                  >
                    Doctor Console
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('job-marketplace')}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block"
                  >
                    Job Marketplace
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('hospital-landing')}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block"
                  >
                    Hospitals
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">
                    Partner with Us
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-6 tracking-tight">Company</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <button
                    onClick={() => navigate('about-us')}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('contact')}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200 inline-block"
                  >
                    Contact Support
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-muted-foreground">
            &copy; 2026 ORYGA. All rights reserved.
          </div>

          <div className="flex flex-col items-center md:items-end">
            <div className="text-[10px] font-mono text-slate-300 uppercase tracking-[0.3em] hover:text-primary transition-colors cursor-default select-none">
              Product by
            </div>
            <div className="text-xs font-bold text-slate-400 tracking-wider">SOLAERAAB</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ProtectedOutlet() {
  const { isAuthenticated } = useAuth();
  const routerNavigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Sign in Required</h2>
          <p className="text-muted-foreground">
            Please sign in or create an account to access this feature. Your health data is secure
            and private.
          </p>
          <div className="flex gap-3 pt-4 justify-center">
            <button
              onClick={() => routerNavigate('/auth')}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => routerNavigate('/auth')}
              className="px-6 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

function LayoutShell() {
  const { userRole } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const isDoctorMode =
    userRole === 'doctor' ||
    (pathname.startsWith('/doctor') && !pathname.startsWith('/doctors/')) ||
    pathname.startsWith('/auth/doctor');

  const isEmergency = pathname === '/emergency';
  const isAuthPage = pathname.startsWith('/auth');

  const showFooter =
    userRole === 'guest' && !isAuthPage && !isEmergency && !pathname.startsWith('/dashboard');

  return (
    <>
      <ORYARouteSync />
      <ThemeSync />
      <AuthRedirector />
      <ORYAContainer />
      <div className="min-h-screen bg-background">
        {!isEmergency && !isAuthPage && (
          <Navigation isDoctorMode={isDoctorMode} />
        )}
        <Outlet />
        <BottomNavigation />
        {showFooter && <Footer />}
      </div>
    </>
  );
}

export function RootLayout() {
  return (
    <AuthProvider>
      <SecurityProvider>
        <ORYAProvider>
          <LayoutShell />
        </ORYAProvider>
      </SecurityProvider>
    </AuthProvider>
  );
}

export { ProtectedOutlet };