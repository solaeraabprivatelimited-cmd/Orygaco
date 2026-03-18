import { useNavigate, useLocation } from 'react-router';

/**
 * Bidirectional mapping between legacy view names and URL paths.
 * navigate() accepts either a legacy view name OR a path.
 */
const VIEW_TO_PATH: Record<string, string> = {
  'home': '/',
  'about-us': '/about',
  'features': '/features',
  'blogs': '/blogs',
  'blog-detail': '/blogs/:id',
  'contact': '/contact',
  'book-doctor': '/find-doctors',
  'doctor-detail': '/doctors/:id',
  'doctor-landing': '/for-doctors',
  'hospital-landing': '/for-hospitals',
  'hospitals': '/hospitals',
  'hospital-detail': '/hospitals/:id',
  'emergency': '/emergency',
  'auth': '/auth',
  'auth-doctor': '/auth/doctor',
  'auth-doctor-signup': '/auth/doctor/signup',
  'auth-hospital': '/auth/hospital',
  'auth-hospital-signup': '/auth/hospital/signup',
  'patient-app': '/dashboard',
  'patient-appointments': '/dashboard/appointments',
  'patient-profile': '/dashboard/profile',
  'health-records': '/dashboard/records',
  'booking': '/dashboard/booking',
  'doctor-app': '/doctor',
  'doctor-appointments': '/doctor/appointments',
  'doctor-schedule': '/doctor/schedule',
  'doctor-patients': '/doctor/patients',
  'doctor-earnings': '/doctor/earnings',
  'doctor-profile': '/doctor/profile',
  'doctor-blog-management': '/doctor/blogs',
  'hospital-admin': '/hospital-admin',
  'teleconsult': '/teleconsult',
  'job-marketplace': '/jobs',
};

const PATH_TO_VIEW: Record<string, string> = {};
for (const [view, path] of Object.entries(VIEW_TO_PATH)) {
  if (!path.includes(':')) {
    PATH_TO_VIEW[path] = view;
  }
}

export function viewToPath(view: string): string {
  return VIEW_TO_PATH[view] || view;
}

export function pathToView(path: string): string {
  return PATH_TO_VIEW[path] || path;
}

export function useAppNavigate() {
  const routerNavigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate using either a legacy view name or a path.
   * Pass data as the second arg (forwarded as location.state).
   */
  const navigate = (viewOrPath: string, data?: any) => {
    let path = VIEW_TO_PATH[viewOrPath] || viewOrPath;

    // Ensure absolute path if no mapping found and doesn't start with /
    if (!VIEW_TO_PATH[viewOrPath] && !path.startsWith('/')) {
      path = '/' + path;
    }

    // Handle parameterized routes — replace :id with actual ID from data
    if (data && path.includes(':id')) {
      const id = data.id || data.slug || '';
      path = path.replace(':id', encodeURIComponent(id));
    }

    // For booking route, append doctorId as query param for resilience
    if (viewOrPath === 'booking' && data?.id) {
      path = `${path}?doctorId=${encodeURIComponent(data.id)}`;
    }

    routerNavigate(path, { state: data });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    routerNavigate(-1);
  };

  /**
   * Returns the current legacy "view" name based on pathname.
   * Useful for components that still need currentView-style checks.
   */
  const currentView = PATH_TO_VIEW[location.pathname] || location.pathname;

  return { navigate, goBack, currentView, location };
}