import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { CareerOrganization, OrgType } from '../../types/careers';
import { ORG_TYPE_LABELS, VERIFICATION_STATUS_COLORS } from '../../types/careers';
import { fetchMyOrg, upsertOrg } from '../../lib/careersApi';
import { toast } from 'sonner';

interface Props {
  userId: string;
  onOrgReady: (org: CareerOrganization) => void;
}

const BLANK = {
  name: '',
  type: '' as OrgType | '',
  location: '',
  description: '',
  website: '',
};

export function OrgProfile({ userId, onOrgReady }: Props) {
  const [org, setOrg] = useState<CareerOrganization | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyOrg(userId)
      .then((o) => {
        if (o) {
          setOrg(o);
          setForm({
            name: o.name,
            type: o.type,
            location: o.location,
            description: o.description ?? '',
            website: o.website ?? '',
          });
          onOrgReady(o);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    if (!form.name || !form.type || !form.location) {
      toast.error('Name, type and location are required');
      return;
    }
    setSaving(true);
    try {
      const saved = await upsertOrg(userId, {
        name: form.name,
        type: form.type as OrgType,
        location: form.location,
        description: form.description || undefined,
        website: form.website || undefined,
      });
      setOrg(saved);
      onOrgReady(saved);
      toast.success('Organisation saved!');
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
      {org && (
        <Card className="p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold">{org.name}</p>
            <p className="text-xs text-muted-foreground">
              {ORG_TYPE_LABELS[org.type]} · {org.location}
            </p>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              VERIFICATION_STATUS_COLORS[org.verification_status]
            }`}
          >
            {org.verification_status}
          </span>
        </Card>
      )}

      <Card className="p-4 flex flex-col gap-4">
        <h2 className="text-sm font-bold">
          {org ? 'Edit Organisation' : 'Register Organisation'}
        </h2>

        <div>
          <Label className="text-xs mb-1 block">Organisation Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Apollo Hospitals"
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs mb-1 block">Type *</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as OrgType }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ORG_TYPE_LABELS) as OrgType[]).map((k) => (
                  <SelectItem key={k} value={k}>{ORG_TYPE_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Location *</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Mumbai"
              className="text-sm"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs mb-1 block">About</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of your organisation…"
            className="text-sm resize-none"
            rows={3}
          />
        </div>

        <div>
          <Label className="text-xs mb-1 block">Website</Label>
          <Input
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            placeholder="https://apollohospitals.com"
            className="text-sm"
          />
        </div>

        <Button
          className="w-full"
          style={{ backgroundColor: '#E8194A' }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Organisation'}
        </Button>
      </Card>
    </div>
  );
}
