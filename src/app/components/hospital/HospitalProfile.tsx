import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';
import { Building, MapPin, Clock, Stethoscope, Activity, ShieldCheck, Settings, FileText, Upload, Save, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { HospitalProfile as ProfileType } from '@/app/types/hospital';

export function HospitalProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<ProfileType>>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('identity');

  useEffect(() => {
    fetchProfile();
    fetchAuditLogs();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospital-profile?authToken=${session.access_token}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': session.access_token
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Initialize with defaults if empty
        setProfile({
            ...data,
            // Ensure nested objects exist
            locations: data.locations || [],
            operations: data.operations || { opd_start_time: '09:00', opd_end_time: '17:00', emergency_available: false },
            departments: data.departments || [],
            facilities: data.facilities || { 
                icu_available: false, nicu_available: false, ot_count: 0, 
                pharmacy_available: false, lab_available: false, ambulance_available: false 
            },
            feature_flags: data.feature_flags || { 
                online_booking: true, walkin_only: false, video_consultation: false, payments_enabled: false 
            }
        });
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAuditLogs() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospital-audit-logs?authToken=${session.access_token}`, {
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'X-Supabase-Auth': session.access_token
            }
        });

        if (response.ok) {
            setAuditLogs(await response.json());
        }
    } catch (e) {
        console.error("Failed to fetch logs", e);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospital-profile-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': session.access_token
        },
        body: JSON.stringify({
          authToken: session.access_token,
          ...profile
        })
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        fetchAuditLogs(); // Refresh logs
      } else {
        toast.error('Failed to update profile');
      }
    } catch (e) {
      console.error('Error saving profile:', e);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  const updateField = (section: keyof ProfileType | string, field: string, value: any) => {
    setProfile(prev => {
        if (section === 'root') {
            return { ...prev, [field]: value };
        }
        // Handle nested updates
        return {
            ...prev,
            [section]: {
                ...(prev[section as keyof ProfileType] as any || {}),
                [field]: value
            }
        };
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  }

  const sections = [
    { id: 'identity', label: 'Public Identity', icon: Building },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'operations', label: 'Operating Hours', icon: Clock },
    { id: 'departments', label: 'Departments', icon: Stethoscope },
    { id: 'facilities', label: 'Facilities', icon: Activity },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'logs', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[600px] bg-slate-50/50 p-2 md:p-0 rounded-xl">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeSection === section.id
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
        
        <div className="pt-6 px-4">
             <Button onClick={handleSave} disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10">
                {saving ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </>
                )}
            </Button>
            <p className="text-xs text-slate-400 text-center mt-3">
                Last updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
            </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        
        {/* Section A: Public Identity */}
        {activeSection === 'identity' && (
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle>Public Identity</CardTitle>
                    <CardDescription>Manage how your hospital appears to patients and the public.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input 
                                value={profile.display_name || ''} 
                                onChange={e => updateField('root', 'display_name', e.target.value)}
                                placeholder="e.g. City General Hospital"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Legal Name</Label>
                            <Input 
                                value={profile.legal_name || ''} 
                                onChange={e => updateField('root', 'legal_name', e.target.value)}
                                placeholder="Registered Entity Name"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Tagline</Label>
                        <Input 
                            value={profile.tagline || ''} 
                            onChange={e => updateField('root', 'tagline', e.target.value)}
                            maxLength={80}
                            placeholder="Brief slogan (max 80 chars)"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>About Description</Label>
                        <Textarea 
                            value={profile.about || ''} 
                            onChange={e => updateField('root', 'about', e.target.value)}
                            maxLength={500}
                            className="h-32"
                            placeholder="Detailed description of your hospital services and mission..."
                        />
                        <div className="text-xs text-right text-slate-400">
                            {(profile.about?.length || 0)}/500 characters
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Logo URL</Label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input 
                                    value={profile.logo_url || ''} 
                                    onChange={e => updateField('root', 'logo_url', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {profile.logo_url ? (
                                    <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="w-6 h-6 text-slate-300" />
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Section B: Location */}
        {activeSection === 'location' && (
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle>Location & Accessibility</CardTitle>
                    <CardDescription>Help patients find your hospital.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Address Line 1</Label>
                            <Input 
                                value={profile.locations?.[0]?.address_line1 || ''} 
                                onChange={e => {
                                    const locs = [...(profile.locations || [])];
                                    if (!locs[0]) locs[0] = {} as any;
                                    locs[0].address_line1 = e.target.value;
                                    updateField('root', 'locations', locs);
                                    // Sync legacy location field for backward compat
                                    updateField('root', 'location', e.target.value);
                                }}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input 
                                    value={profile.locations?.[0]?.city || ''} 
                                    onChange={e => {
                                        const locs = [...(profile.locations || [])];
                                        if (!locs[0]) locs[0] = {} as any;
                                        locs[0].city = e.target.value;
                                        updateField('root', 'locations', locs);
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input 
                                    value={profile.locations?.[0]?.state || ''} 
                                    onChange={e => {
                                        const locs = [...(profile.locations || [])];
                                        if (!locs[0]) locs[0] = {} as any;
                                        locs[0].state = e.target.value;
                                        updateField('root', 'locations', locs);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Landmark</Label>
                            <Input 
                                value={profile.locations?.[0]?.landmark || ''} 
                                onChange={e => {
                                    const locs = [...(profile.locations || [])];
                                    if (!locs[0]) locs[0] = {} as any;
                                    locs[0].landmark = e.target.value;
                                    updateField('root', 'locations', locs);
                                }}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Parking Available</Label>
                                <p className="text-sm text-slate-500">Do you have dedicated parking for patients?</p>
                            </div>
                            <Switch 
                                checked={profile.locations?.[0]?.parking_available || false}
                                onCheckedChange={checked => {
                                    const locs = [...(profile.locations || [])];
                                    if (!locs[0]) locs[0] = {} as any;
                                    locs[0].parking_available = checked;
                                    updateField('root', 'locations', locs);
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Wheelchair Accessible</Label>
                                <p className="text-sm text-slate-500">Is your facility wheelchair friendly (ramps, lifts)?</p>
                            </div>
                            <Switch 
                                checked={profile.locations?.[0]?.wheelchair_accessible || false}
                                onCheckedChange={checked => {
                                    const locs = [...(profile.locations || [])];
                                    if (!locs[0]) locs[0] = {} as any;
                                    locs[0].wheelchair_accessible = checked;
                                    updateField('root', 'locations', locs);
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Section C: Operating Hours */}
        {activeSection === 'operations' && (
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle>Operating Hours</CardTitle>
                    <CardDescription>Set your standard OPD timings and emergency availability.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
                        <div className="space-y-0.5">
                            <Label className="text-base text-rose-900">Emergency Services (24/7)</Label>
                            <p className="text-sm text-rose-600">If enabled, OPD hours are overridden for emergency cases.</p>
                        </div>
                        <Switch 
                            checked={profile.operations?.emergency_available || false}
                            onCheckedChange={checked => updateField('operations', 'emergency_available', checked)}
                            className="data-[state=checked]:bg-rose-600"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>OPD Start Time</Label>
                            <Input 
                                type="time"
                                value={profile.operations?.opd_start_time || '09:00'} 
                                onChange={e => updateField('operations', 'opd_start_time', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>OPD End Time</Label>
                            <Input 
                                type="time"
                                value={profile.operations?.opd_end_time || '17:00'} 
                                onChange={e => updateField('operations', 'opd_end_time', e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg flex gap-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                            Department-specific timings can be configured in the Scheduling module.
                            Holiday overrides are managed via the calendar.
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Section D: Departments */}
        {activeSection === 'departments' && (
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle>Departments & Specialties</CardTitle>
                    <CardDescription>Manage active departments and their load thresholds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-3">
                        {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Gynecology', 'Dermatology', 'ENT', 'Oncology'].map(deptName => {
                            const dept = profile.departments?.find(d => d.name === deptName) || { name: deptName, enabled: false, load_threshold: 'normal' };
                            
                            return (
                                <div key={deptName} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Switch 
                                            checked={dept.enabled}
                                            onCheckedChange={(checked) => {
                                                const newDepts = [...(profile.departments || [])];
                                                const idx = newDepts.findIndex(d => d.name === deptName);
                                                if (idx >= 0) {
                                                    newDepts[idx].enabled = checked;
                                                } else {
                                                    newDepts.push({ name: deptName, enabled: checked, load_threshold: 'normal' } as any);
                                                }
                                                updateField('root', 'departments', newDepts);
                                                
                                                // Sync with legacy specialties string
                                                const activeNames = newDepts.filter(d => d.enabled).map(d => d.name).join(', ');
                                                updateField('root', 'specialties', activeNames);
                                            }}
                                        />
                                        <span className={`font-medium ${dept.enabled ? 'text-slate-900' : 'text-slate-400'}`}>{deptName}</span>
                                    </div>
                                    
                                    {dept.enabled && (
                                        <Select 
                                            value={dept.load_threshold} 
                                            onValueChange={(val) => {
                                                const newDepts = [...(profile.departments || [])];
                                                const idx = newDepts.findIndex(d => d.name === deptName);
                                                if (idx >= 0) newDepts[idx].load_threshold = val as any;
                                                updateField('root', 'departments', newDepts);
                                            }}
                                        >
                                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">Normal Load</SelectItem>
                                                <SelectItem value="high">High Load</SelectItem>
                                                <SelectItem value="critical">Critical Load</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Section E: Facilities */}
        {activeSection === 'facilities' && (
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle>Facilities & Infrastructure</CardTitle>
                    <CardDescription>Available infrastructure capabilities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4 border p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <Label>ICU Availability</Label>
                                <Switch 
                                    checked={profile.facilities?.icu_available || false}
                                    onCheckedChange={c => updateField('facilities', 'icu_available', c)}
                                />
                            </div>
                            {profile.facilities?.icu_available && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-xs text-slate-500">ICU Bed Capacity</Label>
                                    <Input 
                                        type="number" 
                                        value={profile.facilities?.icu_capacity || 0}
                                        onChange={e => updateField('facilities', 'icu_capacity', parseInt(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 border p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <Label>NICU Availability</Label>
                                <Switch 
                                    checked={profile.facilities?.nicu_available || false}
                                    onCheckedChange={c => updateField('facilities', 'nicu_available', c)}
                                />
                            </div>
                            {profile.facilities?.nicu_available && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-xs text-slate-500">NICU Bed Capacity</Label>
                                    <Input 
                                        type="number" 
                                        value={profile.facilities?.nicu_capacity || 0}
                                        onChange={e => updateField('facilities', 'nicu_capacity', parseInt(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Operation Theaters (OT) Count</Label>
                            <Input 
                                type="number" 
                                value={profile.facilities?.ot_count || 0}
                                onChange={e => updateField('facilities', 'ot_count', parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 pt-4">
                        {[
                            { key: 'pharmacy_available', label: 'In-house Pharmacy' },
                            { key: 'lab_available', label: 'Diagnostic Lab' },
                            { key: 'ambulance_available', label: 'Ambulance Service' },
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <Label>{item.label}</Label>
                                <Switch 
                                    checked={(profile.facilities as any)?.[item.key] || false}
                                    onCheckedChange={c => updateField('facilities', item.key, c)}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Section F: Verification */}
        {activeSection === 'verification' && (
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle>Verification & Trust</CardTitle>
                    <CardDescription>Official verification status (Managed by Admin)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                        {profile.verification?.status === 'verified' ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-emerald-700">Verified Hospital</h3>
                                <p className="text-emerald-600 mt-1">This hospital is fully verified and trusted.</p>
                                {profile.verification?.verified_at && (
                                    <p className="text-xs text-emerald-500 mt-2">Verified on {new Date(profile.verification.verified_at).toLocaleDateString()}</p>
                                )}
                            </div>
                        ) : profile.verification?.status === 'under_review' ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-amber-700">Under Review</h3>
                                <p className="text-amber-600 mt-1">Documents are being processed.</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700">Unverified</h3>
                                <p className="text-slate-500 mt-1">Complete your profile to request verification.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                        <p className="font-semibold mb-1">Note for Admins:</p>
                        Verification status can only be changed by Super Admins after physical document verification.
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Section G: Config */}
        {activeSection === 'config' && (
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle>Configuration Flags</CardTitle>
                    <CardDescription>Control feature visibility and behavior.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {[
                        { key: 'online_booking', label: 'Enable Online Booking', desc: 'Allow patients to book slots via the app.' },
                        { key: 'walkin_only', label: 'Walk-in Only Mode', desc: 'Disable online slots, show "Walk-in Only" badge.' },
                        { key: 'video_consultation', label: 'Enable Video Consultation', desc: 'Show video call options for doctors.' },
                        { key: 'payments_enabled', label: 'Enable Payments', desc: 'Collect consultation fees online.' },
                    ].map(item => (
                        <div key={item.key} className="flex items-start justify-between p-4 border rounded-xl">
                            <div className="space-y-0.5">
                                <Label className="text-base">{item.label}</Label>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                            <Switch 
                                checked={(profile.feature_flags as any)?.[item.key] || false}
                                onCheckedChange={c => updateField('feature_flags', item.key, c)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}

        {/* Section H: Audit Logs */}
        {activeSection === 'logs' && (
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle>Audit Log</CardTitle>
                    <CardDescription>Track changes to your hospital profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                            {auditLogs.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">No logs found.</div>
                            ) : (
                                auditLogs.map((log) => (
                                    <div key={log.id} className="flex gap-4 p-3 border-b last:border-0 border-slate-50">
                                        <div className="mt-1">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {log.action.replace(/_/g, ' ').toUpperCase()}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(log.timestamp).toLocaleString()} • by {log.changedBy === profile.id ? 'You' : 'Admin'}
                                            </p>
                                            {log.details && (
                                                <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                                    <pre className="whitespace-pre-wrap font-mono">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}