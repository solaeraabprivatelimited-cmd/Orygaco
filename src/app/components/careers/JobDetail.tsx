import { useState } from 'react';
import { ArrowLeft, MapPin, Briefcase, Clock, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { CareerJob } from '../../types/careers';
import { JOB_TYPE_LABELS, timeAgo } from '../../types/careers';
import { applyToJob } from '../../lib/careersApi';
import { toast } from 'sonner';

interface Props {
  job: CareerJob;
  userId?: string;
  applied?: boolean;
  onBack: () => void;
  onApplied: () => void;
}

export function JobDetail({ job, userId, applied: appliedProp, onBack, onApplied }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localApplied, setLocalApplied] = useState(false);
  const org = job.organization;
  const applied = appliedProp || localApplied;

  const handleApply = async () => {
    if (!userId) {
      toast.error('Please sign in to apply');
      return;
    }
    if (!coverNote.trim()) {
      toast.error('Please add a cover note');
      return;
    }
    setSubmitting(true);
    try {
      await applyToJob(job.id, userId, coverNote);
      setLocalApplied(true);
      toast.success('Application submitted!');
      onApplied();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </button>

      <Card className="p-5">
        <div className="flex gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold leading-tight">{job.title}</h2>
            <p className="text-sm text-muted-foreground">
              {org?.name ?? 'Organisation'}
              {org?.verification_status === 'verified' && (
                <span className="ml-1 text-[#00B894] text-xs">✓ Verified</span>
              )}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs h-fit">
            {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.role}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(job.created_at)}</span>
        </div>

        {job.salary_range && (
          <div className="mb-4">
            <span className="text-sm font-semibold text-foreground">{job.salary_range}</span>
            <span className="text-xs text-muted-foreground ml-1">/ month</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-muted-foreground mb-0.5">Experience</p>
            <p className="font-medium">{job.experience_required}+ years</p>
          </div>
          {org?.location && (
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-muted-foreground mb-0.5">Org Location</p>
              <p className="font-medium">{org.location}</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Job Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        </div>

        {org?.description && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">About {org.name}</h3>
            <p className="text-sm text-muted-foreground">{org.description}</p>
          </div>
        )}

        {!applied && !showForm && (
          <Button
            className="w-full"
            style={{ backgroundColor: '#E8194A' }}
            onClick={() => setShowForm(true)}
            disabled={!userId}
          >
            {userId ? 'Apply Now' : 'Sign in to Apply'}
          </Button>
        )}

        {applied && (
          <div className="w-full py-2 rounded-lg bg-[#00B894]/10 text-[#00B894] text-sm font-medium text-center">
            ✓ Application Submitted
          </div>
        )}

        {showForm && !applied && (
          <div className="flex flex-col gap-3 mt-2">
            <div>
              <Label className="text-sm font-medium mb-1 block">Cover Note</Label>
              <Textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Tell the employer why you're a great fit..."
                className="text-sm resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: '#E8194A' }}
                onClick={handleApply}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
