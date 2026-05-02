import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import type { CareerProfile } from '../../types/careers';
import { HEALTHCARE_ROLES, MEDICAL_SPECIALIZATIONS, VERIFICATION_STATUS_COLORS } from '../../types/careers';
import { fetchMyProfile, upsertProfile } from '../../lib/careersApi';
import { toast } from 'sonner';

interface Props {
  userId: string;
}

const BLANK: Omit<CareerProfile, 'id' | 'created_at' | 'updated_at' | 'verification_status'> = {
  full_name: '',
  role: '',
  specialization: '',
  experience_years: 0,
  current_hospital: '',
  location: '',
  skills: [],
  open_to_work: true,
  bio: '',
};

export function ProfessionalProfile({ userId }: Props) {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyProfile(userId)
      .then((p) => {
        if (p) {
          setProfile(p);
          setForm({
            full_name: p.full_name,
            role: p.role,
            specialization: p.specialization ?? '',
            experience_years: p.experience_years,
            current_hospital: p.current_hospital ?? '',
            location: p.location ?? '',
            skills: p.skills,
            open_to_work: p.open_to_work,
            bio: p.bio ?? '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    }
    setSkillInput('');
  };

  const removeSkill = (s: string) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));
  };

  const handleSave = async () => {
    if (!form.full_name || !form.role) {
      toast.error('Name and role are required');
      return;
    }
    setSaving(true);
    try {
      const saved = await upsertProfile(userId, {
        ...form,
        experience_years: Number(form.experience_years),
      });
      setProfile(saved);
      toast.success('Profile saved!');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
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
    <div className="flex flex-col gap-4">
      {profile && (
        <Card className="p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground">{profile.role}</p>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              VERIFICATION_STATUS_COLORS[profile.verification_status]
            }`}
          >
            {profile.verification_status}
          </span>
          {profile.open_to_work && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00B894]/10 text-[#00B894] font-medium">
              Open to work
            </span>
          )}
        </Card>
      )}

      <Card className="p-4 flex flex-col gap-4">
        <h2 className="text-sm font-bold">{profile ? 'Edit Profile' : 'Create Profile'}</h2>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label className="text-xs mb-1 block">Full Name *</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Dr. Priya Sharma"
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
              <Label className="text-xs mb-1 block">Specialization</Label>
              <Select
                value={form.specialization}
                onValueChange={(v) => setForm((f) => ({ ...f, specialization: v }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICAL_SPECIALIZATIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs mb-1 block">Years of Experience</Label>
              <Input
                type="number"
                min={0}
                value={form.experience_years}
                onChange={(e) =>
                  setForm((f) => ({ ...f, experience_years: Number(e.target.value) }))
                }
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Mumbai"
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Current Hospital / Clinic</Label>
            <Input
              value={form.current_hospital}
              onChange={(e) =>
                setForm((f) => ({ ...f, current_hospital: e.target.value }))
              }
              placeholder="Apollo Hospitals"
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-xs mb-1 block">Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Brief about yourself…"
              className="text-sm resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-xs mb-1 block">Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g. ECG, Suturing"
                className="text-sm"
              />
              <Button variant="outline" size="icon" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#00B894]/10 text-[#00B894]"
                  >
                    {s}
                    <button onClick={() => removeSkill(s)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.open_to_work}
              onChange={(e) =>
                setForm((f) => ({ ...f, open_to_work: e.target.checked }))
              }
              className="rounded"
            />
            Open to work
          </label>
        </div>

        <Button
          className="w-full"
          style={{ backgroundColor: '#E8194A' }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </Card>
    </div>
  );
}
