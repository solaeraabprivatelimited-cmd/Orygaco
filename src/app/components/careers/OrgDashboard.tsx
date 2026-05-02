import { useState, useEffect } from 'react';
import { Plus, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { OrgProfile } from './OrgProfile';
import { PostJob } from './PostJob';
import { ApplicantsList } from './ApplicantsList';
import type { CareerOrganization, CareerJob } from '../../types/careers';
import { JOB_TYPE_LABELS, timeAgo } from '../../types/careers';
import { fetchOrgJobs, toggleJobStatus } from '../../lib/careersApi';
import { toast } from 'sonner';

interface Props {
  userId: string;
}

type OrgView = 'profile' | 'jobs' | 'post' | 'applicants';

export function OrgDashboard({ userId }: Props) {
  const [org, setOrg] = useState<CareerOrganization | null>(null);
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [view, setView] = useState<OrgView>('profile');
  const [selectedJob, setSelectedJob] = useState<CareerJob | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (org) {
      fetchOrgJobs(org.id).then(setJobs).catch(() => {});
    }
  }, [org]);

  const handleToggleJob = async (job: CareerJob) => {
    const next = job.status === 'active' ? 'closed' : 'active';
    setToggling(job.id);
    try {
      const updated = await toggleJobStatus(job.id, next);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update job');
    } finally {
      setToggling(null);
    }
  };

  if (!org) {
    return (
      <OrgProfile
        userId={userId}
        onOrgReady={(o) => {
          setOrg(o);
          setView('jobs');
        }}
      />
    );
  }

  if (view === 'post') {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setView('jobs')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          ← Back to jobs
        </button>
        <PostJob
          org={org}
          onPosted={() => {
            fetchOrgJobs(org.id).then(setJobs).catch(() => {});
            setView('jobs');
          }}
        />
      </div>
    );
  }

  if (view === 'applicants' && selectedJob) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => { setView('jobs'); setSelectedJob(null); }}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          ← Back to jobs
        </button>
        <ApplicantsList jobId={selectedJob.id} jobTitle={selectedJob.title} />
      </div>
    );
  }

  if (view === 'profile') {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setView('jobs')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          ← Back to jobs
        </button>
        <OrgProfile userId={userId} onOrgReady={(o) => { setOrg(o); setView('jobs'); }} />
      </div>
    );
  }

  // jobs list view
  return (
    <div className="flex flex-col gap-4">
      {/* Org header */}
      <Card className="p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{org.name}</p>
          <p className="text-xs text-muted-foreground">{org.location}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => setView('profile')}
        >
          Edit
        </Button>
      </Card>

      {/* Action row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''}
        </h2>
        <Button
          size="sm"
          className="h-8 text-xs gap-1"
          style={{ backgroundColor: '#E8194A' }}
          onClick={() => setView('post')}
        >
          <Plus className="w-3.5 h-3.5" /> Post Job
        </Button>
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No jobs posted yet. Post your first job!
        </div>
      )}

      {jobs.map((job) => (
        <Card key={job.id} className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold leading-snug">{job.title}</h3>
            <Badge
              variant={job.status === 'active' ? 'default' : 'secondary'}
              className="text-[10px] px-1.5 py-0 shrink-0"
            >
              {job.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {JOB_TYPE_LABELS[job.job_type]} · {job.location} · {timeAgo(job.created_at)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 flex-1"
              onClick={() => {
                setSelectedJob(job);
                setView('applicants');
              }}
            >
              <Users className="w-3 h-3" /> Applicants
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleToggleJob(job)}
              disabled={toggling === job.id}
            >
              {job.status === 'active' ? (
                <><ToggleRight className="w-4 h-4 text-[#00B894]" /> Close</>
              ) : (
                <><ToggleLeft className="w-4 h-4" /> Reopen</>
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
