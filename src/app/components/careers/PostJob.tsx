import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { CareerOrganization, JobType } from '../../types/careers';
import { JOB_TYPE_LABELS, HEALTHCARE_ROLES } from '../../types/careers';
import { createJob } from '../../lib/careersApi';
import { toast } from 'sonner';

interface Props {
  org: CareerOrganization;
  onPosted: () => void;
}

export function PostJob({ org, onPosted }: Props) {
  const [form, setForm] = useState({
    title: '',
    role: '',
    description: '',
    experience_required: 0,
    location: org.location,
    salary_range: '',
    job_type: '' as JobType | '',
  });
  const [saving, setSaving] = useState(false);

  const handlePost = async () => {
    if (!form.title || !form.role || !form.description || !form.job_type) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await createJob({
        organization_id: org.id,
        title: form.title,
        role: form.role,
        description: form.description,
        experience_required: Number(form.experience_required),
        location: form.location,
        salary_range: form.salary_range || undefined,
        job_type: form.job_type as JobType,
        status: 'active',
      });
      toast.success('Job posted successfully!');
      onPosted();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to post job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-bold">Post a Job</h2>
        <p className="text-xs text-muted-foreground">Posting as {org.name}</p>
      </div>

      <div>
        <Label className="text-xs mb-1 block">Job Title *</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Senior Cardiologist"
          className="text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-1 block">Role *</Label>
          <Select
            value={form.role}
            onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {HEALTHCARE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Job Type *</Label>
          <Select
            value={form.job_type}
            onValueChange={(v) => setForm((f) => ({ ...f, job_type: v as JobType }))}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((k) => (
                <SelectItem key={k} value={k}>{JOB_TYPE_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs mb-1 block">Description *</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Describe the role, responsibilities, requirements…"
          className="text-sm resize-none"
          rows={5}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-1 block">Min. Experience (years)</Label>
          <Input
            type="number"
            min={0}
            value={form.experience_required}
            onChange={(e) =>
              setForm((f) => ({ ...f, experience_required: Number(e.target.value) }))
            }
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Location</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-1 block">Salary Range</Label>
        <Input
          value={form.salary_range}
          onChange={(e) => setForm((f) => ({ ...f, salary_range: e.target.value }))}
          placeholder="e.g. ₹80,000 – ₹1,20,000/month"
          className="text-sm"
        />
      </div>

      <Button
        className="w-full"
        style={{ backgroundColor: '#E8194A' }}
        onClick={handlePost}
        disabled={saving}
      >
        {saving ? 'Posting…' : 'Post Job'}
      </Button>
    </Card>
  );
}
