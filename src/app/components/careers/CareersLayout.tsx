import { useState, useEffect } from 'react';
import { Briefcase, FileText, User, Building2, ShieldCheck } from 'lucide-react';
import { JobFeed } from './JobFeed';
import { MyApplications } from './MyApplications';
import { ProfessionalProfile } from './ProfessionalProfile';
import { OrgDashboard } from './OrgDashboard';
import { VerificationUpload } from './VerificationUpload';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type Tab = 'jobs' | 'applications' | 'profile' | 'org' | 'verify';

const SEEKER_TABS: { id: Tab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'jobs', label: 'Jobs', Icon: Briefcase },
  { id: 'applications', label: 'Applied', Icon: FileText },
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'verify', label: 'Verify', Icon: ShieldCheck },
];

const ORG_TABS: { id: Tab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'jobs', label: 'Jobs', Icon: Briefcase },
  { id: 'org', label: 'My Org', Icon: Building2 },
  { id: 'verify', label: 'Verify', Icon: ShieldCheck },
];

export function CareersLayout() {
  const { isAuthenticated, userRole } = useAuth();
  const [tab, setTab] = useState<Tab>('jobs');
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated) { setUserId(undefined); return; }
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? undefined);
    });
  }, [isAuthenticated]);

  const isOrg = userRole === 'hospital';
  const tabs = isOrg ? ORG_TABS : SEEKER_TABS;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div
        className="px-4 pt-6 pb-5"
        style={{ background: 'linear-gradient(135deg, #E8194A 0%, #c0143e 100%)' }}
      >
        <h1 className="text-xl font-bold text-white mb-0.5">Healthcare Jobs</h1>
        <p className="text-sm text-white/80">Find your next role in healthcare</p>
      </div>

      {/* Tab bar — only shown when authenticated */}
      {isAuthenticated && (
        <div className="flex border-b border-border bg-background sticky top-0 z-10">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                tab === id
                  ? 'text-[#E8194A] border-b-2 border-[#E8194A]'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-4 max-w-lg mx-auto">
        {tab === 'jobs' && <JobFeed userId={userId} />}

        {tab === 'applications' && isAuthenticated && userId && (
          <MyApplications userId={userId} />
        )}

        {tab === 'profile' && isAuthenticated && !isOrg && userId && (
          <ProfessionalProfile userId={userId} />
        )}

        {tab === 'org' && isAuthenticated && isOrg && userId && (
          <OrgDashboard userId={userId} />
        )}

        {tab === 'verify' && isAuthenticated && userId && (
          <VerificationUpload userId={userId} />
        )}

        {!isAuthenticated && tab !== 'jobs' && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to access this section
            </p>
            <a
              href="/auth"
              className="inline-block px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#E8194A' }}
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
