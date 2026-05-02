import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { JobCard } from './JobCard';
import { JobDetail } from './JobDetail';
import { fetchJobs, checkExistingApplication } from '../../lib/careersApi';
import type { CareerJob, JobFilters } from '../../types/careers';
import { JOB_TYPE_LABELS } from '../../types/careers';

interface Props {
  userId?: string;
}

const DEFAULT_FILTERS: JobFilters = {
  search: '',
  job_type: '',
  location: '',
  experience: null,
};

export function JobFeed({ userId }: Props) {
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);
  const [draftSearch, setDraftSearch] = useState('');
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CareerJob | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async (f: JobFilters, p: number) => {
    setLoading(true);
    try {
      const { jobs: fetched, total: t } = await fetchJobs(f, p);
      setJobs(p === 0 ? fetched : (prev) => [...prev, ...fetched]);
      setTotal(t);
    } catch {
      // silently fail — empty state shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    load(filters, 0);
  }, [filters, load]);

  useEffect(() => {
    if (!userId || jobs.length === 0) return;
    Promise.all(
      jobs.map((j) => checkExistingApplication(j.id, userId))
    ).then((results) => {
      const ids = new Set<string>();
      results.forEach((r, i) => { if (r) ids.add(jobs[i].id); });
      setAppliedIds(ids);
    });
  }, [jobs, userId]);

  const handleSearch = () => {
    setFilters((f) => ({ ...f, search: draftSearch }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setDraftSearch('');
  };

  const hasActiveFilters =
    filters.search || filters.job_type || filters.location || filters.experience !== null;

  if (selectedJob) {
    return (
      <JobDetail
        job={selectedJob}
        userId={userId}
        applied={appliedIds.has(selectedJob.id)}
        onBack={() => setSelectedJob(null)}
        onApplied={() => {
          setAppliedIds((prev) => new Set([...prev, selectedJob.id]));
          setSelectedJob(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search jobs, roles…"
            className="pl-9 text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters((v) => !v)}
          className={showFilters ? 'border-primary text-primary' : ''}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
        <Button size="sm" style={{ backgroundColor: '#E8194A' }} onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="flex flex-col gap-3 p-3 bg-muted/30 rounded-xl border border-border">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Job type</p>
              <Select
                value={filters.job_type}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, job_type: v as any }))
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {(Object.keys(JOB_TYPE_LABELS) as Array<keyof typeof JOB_TYPE_LABELS>).map(
                    (k) => (
                      <SelectItem key={k} value={k}>
                        {JOB_TYPE_LABELS[k]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Location</p>
              <Input
                value={filters.location}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="City…"
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Max experience required (years)
            </p>
            <Input
              type="number"
              min={0}
              value={filters.experience ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  experience: e.target.value ? Number(e.target.value) : null,
                }))
              }
              placeholder="e.g. 5"
              className="h-8 text-xs"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-[#E8194A] self-start"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {total} job{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Job list */}
      <div className="flex flex-col gap-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSelect={() => setSelectedJob(job)}
            onApply={() => setSelectedJob(job)}
            applied={appliedIds.has(job.id)}
          />
        ))}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No jobs found. Try adjusting your filters.
          </div>
        )}

        {!loading && jobs.length < total && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              load(filters, next);
            }}
          >
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}
