import { useState, useEffect } from 'react';
import { Building2, MapPin, Clock } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import type { CareerApplication } from '../../types/careers';
import { APP_STATUS_LABELS, APP_STATUS_COLORS, timeAgo } from '../../types/careers';
import { fetchMyApplications } from '../../lib/careersApi';

interface Props {
  userId: string;
}

export function MyApplications({ userId }: Props) {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications(userId)
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        You haven't applied to any jobs yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        {applications.length} application{applications.length !== 1 ? 's' : ''}
      </h2>

      {applications.map((app) => {
        const job = app.job;
        const org = job?.organization;
        return (
          <Card key={app.id} className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold leading-snug truncate">
                    {job?.title ?? '—'}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      APP_STATUS_COLORS[app.status]
                    }`}
                  >
                    {APP_STATUS_LABELS[app.status]}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-2 truncate">
                  {org?.name ?? '—'}
                  {org?.verification_status === 'verified' && (
                    <span className="ml-1 text-[#00B894] text-[10px]">✓</span>
                  )}
                </p>

                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                  {job?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Applied {timeAgo(app.created_at)}
                  </span>
                </div>

                {app.cover_note && (
                  <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2 italic">
                    "{app.cover_note}"
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
