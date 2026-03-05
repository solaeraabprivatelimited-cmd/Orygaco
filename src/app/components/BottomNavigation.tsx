import { Home, Search, FileText, Calendar, Users, Clock, LayoutGrid, Briefcase, Building2, LucideIcon } from 'lucide-react';
import { useLocation } from 'react-router';
import { cn } from './ui/utils';
import { useAuth } from '../contexts/AuthContext';
import { useAppNavigate, pathToView } from '../hooks/useAppNavigate';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export function BottomNavigation() {
  const { navigate } = useAppNavigate();
  const { userRole } = useAuth();
  const location = useLocation();
  const currentView = pathToView(location.pathname);

  const isPatientDashboard = userRole === 'patient';
  const isDoctorDashboard = userRole === 'doctor';
  const isHospitalDashboard = userRole === 'hospital';

  const publicPaths = ['/', '/about', '/features', '/blogs', '/contact', '/find-doctors', '/for-doctors', '/for-hospitals', '/hospitals', '/emergency'];
  const isPublicView = publicPaths.includes(location.pathname) ||
    location.pathname.startsWith('/blogs/') ||
    location.pathname.startsWith('/doctors/') ||
    location.pathname.startsWith('/hospitals/') ||
    location.pathname.startsWith('/auth');

  if (isPublicView) return null;
  if (!isPatientDashboard && !isDoctorDashboard && !isHospitalDashboard) return null;

  let navItems: NavItem[] = [];

  if (isPatientDashboard) {
    navItems = [
      { id: 'patient-app', label: 'Home', icon: Home },
      { id: 'patient-appointments', label: 'Appts', icon: Calendar },
      { id: 'book-doctor', label: 'Find Dr', icon: Search },
      { id: 'health-records', label: 'Records', icon: FileText },
    ];
  } else if (isDoctorDashboard) {
    navItems = [
      { id: 'doctor-app', label: 'Dash', icon: LayoutGrid },
      { id: 'doctor-appointments', label: 'Appts', icon: Calendar },
      { id: 'doctor-patients', label: 'Patients', icon: Users },
      { id: 'doctor-schedule', label: 'Schedule', icon: Clock },
    ];
  } else if (isHospitalDashboard) {
    navItems = [
      { id: 'hospital-admin', label: 'Dash', icon: Building2 },
      { id: 'job-marketplace', label: 'Jobs', icon: Briefcase },
    ];
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe lg:hidden">
      <div className="flex justify-around items-center h-[64px]">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const activeColor = "#E63E6D";
          const inactiveColor = "#62748E";
          const color = isActive ? activeColor : inactiveColor;

          let iconContent;

          if (item.id === 'patient-app') {
            iconContent = (
              <div className="relative shrink-0 size-6">
                <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                  <path d="M12.857 4.06L18.723 8.877C19.053 9.147 19.25 9.563 19.25 10.007V18.81C19.25 19.624 18.612 20.25 17.867 20.25H15.25V15.5C15.25 14.7707 14.9603 14.0712 14.4445 13.5555C13.9288 13.0397 13.2293 12.75 12.5 12.75H11.5C10.7707 12.75 10.0712 13.0397 9.55546 13.5555C9.03973 14.0712 8.75 14.7707 8.75 15.5V20.25H6.133C5.388 20.25 4.75 19.624 4.75 18.81V10.008C4.75 9.563 4.947 9.148 5.277 8.878L11.143 4.059C11.3837 3.85876 11.6869 3.74912 12 3.74912C12.3131 3.74912 12.6163 3.85976 12.857 4.06ZM17.867 21.749C19.477 21.749 20.75 20.414 20.75 18.809V10.007C20.7512 9.56958 20.6553 9.13734 20.4695 8.74137C20.2836 8.34541 20.0123 7.99556 19.675 7.717L13.81 2.9C13.301 2.4794 12.6613 2.24932 12.001 2.24932C11.3407 2.24932 10.701 2.4794 10.192 2.9L4.325 7.718C3.98774 7.99656 3.71641 8.34641 3.53053 8.74237C3.34466 9.13834 3.24885 9.57058 3.25 10.008V18.81C3.25 20.415 4.523 21.75 6.133 21.75L17.867 21.749Z" fill={color} />
                </svg>
              </div>
            );
          } else if (item.id === 'patient-appointments') {
            iconContent = (
              <div className="relative shrink-0 size-6">
                <div className="absolute inset-[2.5px_3px_4px_3px]">
                  <svg className="block size-full" fill="none" viewBox="0 0 18 18">
                    <path clipRule="evenodd" d="M4 2.018C3.46 2.041 3.072 2.092 2.729 2.208C2.14238 2.40442 1.60932 2.73422 1.17171 3.17148C0.734106 3.60874 0.403882 4.14154 0.207 4.728C1.49012e-08 5.349 0 6.115 0 7.649C0 7.744 1.11759e-08 7.792 0.013 7.83C0.0252768 7.86679 0.0459435 7.90021 0.0733657 7.92763C0.100788 7.95506 0.134214 7.97572 0.171 7.988C0.209 8.001 0.257 8.001 0.353 8.001H17.647C17.743 8.001 17.791 8.001 17.829 7.988C17.8658 7.97572 17.8992 7.95506 17.9266 7.92763C17.9541 7.90021 17.9747 7.86679 17.987 7.83C18 7.791 18 7.743 18 7.647C18 6.114 18 5.347 17.793 4.729C17.5964 4.14217 17.2663 3.60897 16.8287 3.17135C16.391 2.73372 15.8578 2.40362 15.271 2.207C14.928 2.092 14.539 2.041 14 2.018V4.5C14 4.89782 13.842 5.27936 13.5607 5.56066C13.2794 5.84196 12.8978 6 12.5 6C12.1022 6 11.7206 5.84196 11.4393 5.56066C11.158 5.27936 11 4.89782 11 4.5V2H7V4.5C7 4.89782 6.84196 5.27936 6.56066 5.56066C6.27936 5.84196 5.89782 6 5.5 6C5.10218 6 4.72064 5.84196 4.43934 5.56066C4.15804 5.27936 4 4.89782 4 4.5V2.018Z" fill={color} fillRule="evenodd" />
                    <path d="M0 9.5C0 9.264 -4.47035e-08 9.146 0.073 9.073C0.146 9 0.264 9 0.5 9H17.5C17.736 9 17.854 9 17.927 9.073C18 9.146 18 9.264 18 9.5V10C18 13.771 18 15.657 16.828 16.828C15.656 17.999 13.771 18 10 18H8C4.229 18 2.343 18 1.172 16.828C0.000999928 15.656 0 13.771 0 10V9.5Z" fill={color} fillOpacity="0.25" />
                    <path d="M5.5 0.5V4.5M12.5 0.5V4.5" stroke={color} strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            );
          } else if (item.id === 'book-doctor') {
            iconContent = (
              <div className="relative shrink-0 size-6">
                <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                  <path d="M16.893 16.92L19.973 20M19 11.5C19 13.4891 18.2098 15.3968 16.8033 16.8033C15.3968 18.2098 13.4891 19 11.5 19C9.51088 19 7.60322 18.2098 6.1967 16.8033C4.79018 15.3968 4 13.4891 4 11.5C4 9.51088 4.79018 7.60322 6.1967 6.1967C7.60322 4.79018 9.51088 4 11.5 4C13.4891 4 15.3968 4.79018 16.8033 6.1967C18.2098 7.60322 19 9.51088 19 11.5Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
            );
          } else if (item.id === 'health-records') {
            iconContent = (
              <div className="relative shrink-0 size-6">
                <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                  <path d="M5 5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H11.75C11.8163 3 11.8799 3.02634 11.9268 3.07322C11.9737 3.12011 12 3.1837 12 3.25V8C12 8.53043 12.2107 9.03914 12.5858 9.41421C12.9609 9.78929 13.4696 10 14 10H18.75C18.8163 10 18.8799 10.0263 18.9268 10.0732C18.9737 10.1201 19 10.1837 19 10.25V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5Z" fill={color} fillOpacity="0.25" />
                  <path d="M13 8V3.604C12.9999 3.55449 13.0145 3.50607 13.042 3.46487C13.0695 3.42368 13.1085 3.39157 13.1543 3.37261C13.2 3.35365 13.2503 3.3487 13.2989 3.35838C13.3475 3.36806 13.392 3.39195 13.427 3.427L18.573 8.573C18.6081 8.60796 18.6319 8.65255 18.6416 8.7011C18.6513 8.74966 18.6464 8.8 18.6274 8.84573C18.6084 8.89147 18.5763 8.93055 18.5351 8.95801C18.4939 8.98547 18.4455 9.00009 18.396 9H14C13.7348 9 13.4804 8.89464 13.2929 8.70711C13.1054 8.51957 13 8.26522 13 8Z" fill={color} />
                </svg>
              </div>
            );
          } else {
            const Icon = item.icon;
            iconContent = <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />;
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1",
                isActive ? "text-[#E63E6D]" : "text-[#62748E]"
              )}
            >
              {iconContent}
              <span className="text-[10px] font-medium leading-[15px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
