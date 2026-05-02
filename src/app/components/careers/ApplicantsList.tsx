import { useState, useEffect } from 'react';
import { User, MapPin, Briefcase, ChevronDown } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { CareerApplication, ApplicationStatus } from '../../types/careers';
import { APP_STATUS_LABELS, APP_STATUS_COLORS } from '../../types/careers';
import { fetchJobApplications, updateApplicationStatus } from '../../lib/careersApi';
import { toast } from 'sonner';

interface Props {
  jobId: string;
  jobTitle: string;
}

export function ApplicantsList({ jobId, jobTitle }: Props) {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchJobApplications(jobId)
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    setUpdating(appId);
    try {
      const updated = await updateApplicationStatus(appId, status);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: updated.status } : a))
      );
      toast.success('Status updated');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Applicants — {jobTitle}</h2>
        <span className="text-xs text-muted-foreground">
          {applications.length} total
        </span>
      </div>

      {applications.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No applications yet.
        </div>
      )}

      {applications.map((app) => {
        const profile = app.applicant;
        return (
          <Card key={app.id} className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00B894]/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#00B894]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold truncate">
                    {profile?.full_name ?? 'Applicant'}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      APP_STATUS_COLORS[app.status]
                    }`}
                  >
                    {APP_STATUS_LABELS[app.status]}
                  </span>
                </div>

                {profile && (
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {profile.role}
                      {profile.experience_years > 0 && ` · ${profile.experience_years}y exp`}
                    </span>
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.location}
                      </span>
                    )}
                    {profile.verification_status === 'verified' && (
                      <span className="text-[#00B894]">✓ Verified</span>
                    )}
                  </div>
                )}

                {app.cover_note && (
                  <p className="text-[11px] text-muted-foreground italic line-clamp-2 mb-3">
                    "{app.cover_note}"
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Select
                    value={app.status}
                    onValueChange={(v) =>
                      handleStatusChange(app.id, v as ApplicationStatus)
                    }
                    disabled={updating === app.id}
                  >
                    <SelectTrigger className="h-7 text-xs w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(APP_STATUS_LABELS) as ApplicationStatus[]).map((k) => (
                        <SelectItem key={k} value={k} className="text-xs">
                          {APP_STATUS_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
