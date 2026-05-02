import { MapPin, Clock, Briefcase, Building2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { CareerJob } from '../../types/careers';
import { JOB_TYPE_LABELS, timeAgo } from '../../types/careers';

interface Props {
  job: CareerJob;
  onSelect: () => void;
  onApply: () => void;
  applied?: boolean;
}

export function JobCard({ job, onSelect, onApply, applied = false }: Props) {
  const org = job.organization;

  return (
    <Card
      className="p-4 hover:shadow-md transition-all cursor-pointer border border-border hover:border-primary/30"
      onClick={onSelect}
    >
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-0.5">
            <h3 className="flex-1 text-sm font-semibold leading-snug truncate">{job.title}</h3>
            <Badge variant="secondary" className="text-[10px] shrink-0 px-1.5 py-0">
              {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mb-2 truncate">
            {org?.name ?? 'Organisation'}
            {org?.verification_status === 'verified' && (
              <span className="ml-1 text-[#00B894] text-[10px]">✓ Verified</span>
            )}
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {job.role}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(job.created_at)}
            </span>
          </div>

          {job.experience_required > 0 && (
            <p className="text-[11px] text-muted-foreground mb-3">
              {job.experience_required}+ yrs experience
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-foreground">
              {job.salary_range ?? 'Salary not disclosed'}
            </span>
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              style={{ backgroundColor: '#E8194A' }}
              onClick={(e) => {
                e.stopPropagation();
                onApply();
              }}
              disabled={applied}
            >
              {applied ? 'Applied' : 'Apply'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
