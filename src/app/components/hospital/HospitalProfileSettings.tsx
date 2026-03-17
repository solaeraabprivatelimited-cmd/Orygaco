import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Textarea } from '@/app/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { 
    Building, MapPin, Phone, Mail, Globe, 
    Stethoscope, Clock, Calendar, 
    CreditCard, DollarSign, Wallet, 
    MessageSquare, Bell, Languages, 
    ShieldCheck, FileText, Upload, Lock, Shield, 
    Save, Plus, Trash2, CheckCircle, AlertCircle,
    Eye, ExternalLink
} from 'lucide-react';
import { useSecurity, PERMISSIONS } from '@/app/contexts/SecurityContext';

export function HospitalProfileSettings() {
    const { checkPermission, user } = useSecurity();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('identity');

    // State for different sections
    const [profile, setProfile] = useState<any>({});
    const [settings, setSettings] = useState<any>({});
    const [departments, setDepartments] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    async function fetchAllData() {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const headers = { 'Authorization': `Bearer ${publicAnonKey}` };
            const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db`;

            const [resProfile, resSettings, resDepts, resDocs] = await Promise.all([
                fetch(`${baseUrl}/hospital/profile?authToken=${session.access_token}`, { headers }),
                fetch(`${baseUrl}/hospital/settings?authToken=${session.access_token}`, { headers }),
                fetch(`${baseUrl}/hospital/departments?authToken=${session.access_token}`, { headers }),
                fetch(`${baseUrl}/hospital/documents?authToken=${session.access_token}`, { headers })
            ]);

            if (resProfile.ok) setProfile(await resProfile.json());
            if (resSettings.ok) setSettings(await resSettings.json());
            if (resDepts.ok) setDepartments(await resDepts.json());
            if (resDocs.ok) setDocuments(await resDocs.json());
        } catch (e) {
            console.error("Failed to load settings", e);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    }

    async function saveProfile() {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospital/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({ authToken: session.access_token, ...profile })
            });
            
            if (res.ok) {
                toast.success("Profile updated successfully");
            } else {
                toast.error("Failed to update profile");
            }
        } catch (e) { toast.error("Error saving profile"); }
        finally { setSaving(false); }
    }

    async function saveSettings(section: string, data: any) {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospital/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({ 
                    authToken: session.access_token, 
                    section, 
                    settings: data 
                })
            });
            
            if (res.ok) {
                toast.success(`${section.replace('_', ' ')} updated`);
                const updated = await res.json();
                setSettings(updated); // Update local state with server response
            } else {
                toast.error("Failed to update settings");
            }
        } catch (e) { toast.error("Error saving settings"); }
        finally { setSaving(false); }
    }

    async function saveDepartments() {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospital/departments`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({ authToken: session.access_token, departments })
            });
            
            if (res.ok) {
                toast.success("Departments updated");
            } else {
                toast.error("Failed to update departments");
            }
        } catch (e) { toast.error("Error saving departments"); }
        finally { setSaving(false); }
    }

    async function uploadDocument(type: string, fileUrl: string) {
        // Mock upload logic - in real app would handle file upload to storage first
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospital/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({ 
                    authToken: session.access_token, 
                    document: { type, fileUrl }
                })
            });
            
            if (res.ok) {
                toast.success("Document uploaded");
                const newDoc = await res.json();
                setDocuments([...documents, newDoc]);
            } else {
                toast.error("Failed to upload document");
            }
        } catch (e) { toast.error("Error uploading document"); }
        finally { setSaving(false); }
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
    }

    // Permission Guard
    if (!checkPermission(PERMISSIONS.MANAGE_SETTINGS) && !checkPermission(PERMISSIONS.VIEW_HOSPITAL_APPOINTMENTS)) {
         return <div className="p-8 text-center text-red-500">Unauthorized Access</div>;
    }
    const canEdit = checkPermission(PERMISSIONS.MANAGE_SETTINGS);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Hospital Profile & Settings</h2>
                    <p className="text-slate-500">Manage your hospital identity, policies, and preferences.</p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => {
                        // Construct preview URL with current hospital ID
                        if (profile.id && profile.name) {
                            const url = `${window.location.origin}/#hospital-detail?id=${profile.id}&preview=true`;
                            window.open(url, '_blank');
                        } else {
                            toast.error("Please complete and save your hospital profile first.");
                        }
                    }}
                    className="gap-2"
                    disabled={(!profile.id || !profile.name) && !loading} // Disable if loaded but no ID or name
                >
                    <Eye className="w-4 h-4" />
                    View as Patient
                    <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-white border h-auto flex-wrap justify-start gap-2 p-2">
                    <TabsTrigger value="identity" className="gap-2"><Building className="w-4 h-4"/> Identity</TabsTrigger>
                    <TabsTrigger value="departments" className="gap-2"><Stethoscope className="w-4 h-4"/> Departments</TabsTrigger>
                    <TabsTrigger value="opd" className="gap-2"><Clock className="w-4 h-4"/> OPD Rules</TabsTrigger>
                    <TabsTrigger value="payment" className="gap-2"><CreditCard className="w-4 h-4"/> Billing</TabsTrigger>
                    <TabsTrigger value="communication" className="gap-2"><MessageSquare className="w-4 h-4"/> Comm.</TabsTrigger>
                    <TabsTrigger value="verification" className="gap-2"><ShieldCheck className="w-4 h-4"/> Verification</TabsTrigger>
                    <TabsTrigger value="security" className="gap-2"><Lock className="w-4 h-4"/> Security</TabsTrigger>
                </TabsList>

                {/* SECTION A: IDENTITY */}
                <TabsContent value="identity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hospital Identity</CardTitle>
                            <CardDescription>Public facing information about your facility.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Hospital Name</Label>
                                    <Input value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} disabled={!canEdit} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Facility Type</Label>
                                    <Select value={profile.type} onValueChange={v => setProfile({...profile, type: v})} disabled={!canEdit}>
                                        <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General Hospital</SelectItem>
                                            <SelectItem value="Specialty">Specialty Clinic</SelectItem>
                                            <SelectItem value="Diagnostic">Diagnostic Center</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Short Description</Label>
                                <Textarea 
                                    value={profile.description || ''} 
                                    onChange={e => setProfile({...profile, description: e.target.value})} 
                                    maxLength={300}
                                    className="h-20"
                                    disabled={!canEdit}
                                />
                                <div className="text-xs text-slate-500 text-right">Max 300 chars</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Contact Phone</Label>
                                    <Input value={profile.contact_phone || ''} onChange={e => setProfile({...profile, contact_phone: e.target.value})} disabled={!canEdit} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Support Email</Label>
                                    <Input value={profile.support_email || ''} onChange={e => setProfile({...profile, support_email: e.target.value})} disabled={!canEdit} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Emergency Contact</Label>
                                    <Input value={profile.emergency_contact || ''} onChange={e => setProfile({...profile, emergency_contact: e.target.value})} disabled={!canEdit} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website</Label>
                                    <Input value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} placeholder="https://" disabled={!canEdit} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Full Address</Label>
                                <div className="flex gap-2">
                                    <MapPin className="w-5 h-5 text-slate-400 mt-2.5" />
                                    <Textarea value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="h-20" disabled={!canEdit} />
                                </div>
                            </div>
                        </CardContent>
                        {canEdit && (
                            <CardFooter className="border-t bg-slate-50 px-6 py-4">
                                <Button onClick={saveProfile} disabled={saving} className="ml-auto"><Save className="w-4 h-4 mr-2"/> Save Changes</Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>

                {/* SECTION B: DEPARTMENTS */}
                <TabsContent value="departments">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Departments & Specialties</CardTitle>
                                <CardDescription>Manage medical departments and their OPD hours.</CardDescription>
                            </div>
                            {canEdit && (
                                <Button size="sm" onClick={() => setDepartments([...departments, { id: crypto.randomUUID(), name: 'New Dept', isPrimary: false, opdStart: '09:00', opdEnd: '17:00' }])}>
                                    <Plus className="w-4 h-4 mr-2"/> Add Dept
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Department Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>OPD Hours</TableHead>
                                        {canEdit && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.map((dept, idx) => (
                                        <TableRow key={dept.id}>
                                            <TableCell>
                                                <Input 
                                                    value={dept.name} 
                                                    onChange={e => {
                                                        const newDepts = [...departments];
                                                        newDepts[idx].name = e.target.value;
                                                        setDepartments(newDepts);
                                                    }}
                                                    disabled={!canEdit}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch 
                                                        checked={dept.isPrimary} 
                                                        onCheckedChange={checked => {
                                                            const newDepts = [...departments];
                                                            newDepts[idx].isPrimary = checked;
                                                            setDepartments(newDepts);
                                                        }}
                                                        disabled={!canEdit}
                                                    />
                                                    <span className="text-sm">{dept.isPrimary ? 'Primary' : 'Secondary'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="time" 
                                                        className="w-24 h-8" 
                                                        value={dept.opdStart} 
                                                        onChange={e => {
                                                            const newDepts = [...departments];
                                                            newDepts[idx].opdStart = e.target.value;
                                                            setDepartments(newDepts);
                                                        }}
                                                        disabled={!canEdit}
                                                    />
                                                    <span className="text-slate-400">-</span>
                                                    <Input 
                                                        type="time" 
                                                        className="w-24 h-8" 
                                                        value={dept.opdEnd}
                                                        onChange={e => {
                                                            const newDepts = [...departments];
                                                            newDepts[idx].opdEnd = e.target.value;
                                                            setDepartments(newDepts);
                                                        }}
                                                        disabled={!canEdit}
                                                    />
                                                </div>
                                            </TableCell>
                                            {canEdit && (
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-red-500"
                                                        onClick={() => {
                                                            const newDepts = departments.filter((_, i) => i !== idx);
                                                            setDepartments(newDepts);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {canEdit && (
                            <CardFooter className="border-t bg-slate-50 px-6 py-4">
                                <Button onClick={saveDepartments} disabled={saving} className="ml-auto"><Save className="w-4 h-4 mr-2"/> Save Changes</Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>

                {/* SECTION C: OPD RULES */}
                <TabsContent value="opd">
                    <Card>
                        <CardHeader>
                            <CardTitle>OPD & Appointment Policies</CardTitle>
                            <CardDescription>Configure rules for slot generation and booking.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                                    <h4 className="font-semibold text-sm flex items-center gap-2"><Clock className="w-4 h-4"/> Timing Rules</h4>
                                    <div className="space-y-2">
                                        <Label>Slot Buffer Time (Minutes)</Label>
                                        <Input 
                                            type="number" 
                                            value={settings.opd_rules?.slotBuffer || 0} 
                                            onChange={e => setSettings({...settings, opd_rules: {...settings.opd_rules, slotBuffer: parseInt(e.target.value)}})}
                                            disabled={!canEdit}
                                        />
                                        <p className="text-xs text-slate-500">Gap between consecutive slots.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Late Arrival Grace Period (Minutes)</Label>
                                        <Input 
                                            type="number" 
                                            value={settings.opd_rules?.gracePeriod || 0} 
                                            onChange={e => setSettings({...settings, opd_rules: {...settings.opd_rules, gracePeriod: parseInt(e.target.value)}})}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                                    <h4 className="font-semibold text-sm flex items-center gap-2"><Calendar className="w-4 h-4"/> Booking Limits</h4>
                                    <div className="space-y-2">
                                        <Label>Max Bookings / Patient / Day</Label>
                                        <Input 
                                            type="number" 
                                            value={settings.opd_rules?.maxBookingsPerDay || 1} 
                                            onChange={e => setSettings({...settings, opd_rules: {...settings.opd_rules, maxBookingsPerDay: parseInt(e.target.value)}})}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-4">
                                        <Label>Allow Walk-in Bookings</Label>
                                        <Switch 
                                            checked={settings.opd_rules?.walkInAllowed !== false} 
                                            onCheckedChange={c => setSettings({...settings, opd_rules: {...settings.opd_rules, walkInAllowed: c}})}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        {canEdit && (
                            <CardFooter className="border-t bg-slate-50 px-6 py-4">
                                <Button onClick={() => saveSettings('opd_rules', settings.opd_rules)} disabled={saving} className="ml-auto"><Save className="w-4 h-4 mr-2"/> Save Policies</Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>

                {/* SECTION D: PAYMENT */}
                <TabsContent value="payment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing & Payments</CardTitle>
                            <CardDescription>Manage accepted payment modes and fee structures.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-sm">Payment Modes Accepted</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['upi', 'cash', 'card', 'netbanking'].map(mode => (
                                        <div key={mode} className="flex items-center justify-between border p-3 rounded-lg">
                                            <Label className="uppercase">{mode}</Label>
                                            <Switch 
                                                checked={settings.payment_settings?.modes?.[mode] === true}
                                                onCheckedChange={c => setSettings({
                                                    ...settings, 
                                                    payment_settings: {
                                                        ...settings.payment_settings,
                                                        modes: { ...settings.payment_settings?.modes, [mode]: c }
                                                    }
                                                })}
                                                disabled={!canEdit}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label>Default OPD Fee (₹)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                        <Input 
                                            type="number" 
                                            className="pl-9"
                                            value={settings.payment_settings?.defaultOpdFee || 0}
                                            onChange={e => setSettings({...settings, payment_settings: {...settings.payment_settings, defaultOpdFee: parseInt(e.target.value)}})}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Settlement Cycle</Label>
                                    <Select 
                                        value={settings.payment_settings?.settlementCycle || 'T+1'}
                                        onValueChange={v => setSettings({...settings, payment_settings: {...settings.payment_settings, settlementCycle: v}})}
                                        disabled={!canEdit}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="T+1">T+1 (Next Day)</SelectItem>
                                            <SelectItem value="T+2">T+2 (2 Days)</SelectItem>
                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        {canEdit && (
                            <CardFooter className="border-t bg-slate-50 px-6 py-4">
                                <Button onClick={() => saveSettings('payment_settings', settings.payment_settings)} disabled={saving} className="ml-auto"><Save className="w-4 h-4 mr-2"/> Save Billing Settings</Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>

                {/* SECTION E: COMMUNICATION */}
                <TabsContent value="communication">
                    <Card>
                        <CardHeader>
                            <CardTitle>Communication Preferences</CardTitle>
                            <CardDescription>Manage automated notifications for patients and staff.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-indigo-600"/>
                                        <div>
                                            <div className="font-semibold">SMS Notifications</div>
                                            <div className="text-xs text-slate-500">Send booking confirmations & reminders via SMS</div>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={settings.communication_settings?.smsEnabled !== false}
                                        onCheckedChange={c => setSettings({...settings, communication_settings: {...settings.communication_settings, smsEnabled: c}})}
                                        disabled={!canEdit}
                                    />
                                </div>

                                <div className="flex items-center justify-between border p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-indigo-600"/>
                                        <div>
                                            <div className="font-semibold">Email Notifications</div>
                                            <div className="text-xs text-slate-500">Send detailed receipts and reports via Email</div>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={settings.communication_settings?.emailEnabled !== false}
                                        onCheckedChange={c => setSettings({...settings, communication_settings: {...settings.communication_settings, emailEnabled: c}})}
                                        disabled={!canEdit}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label>Default Communication Language</Label>
                                <Select 
                                    value={settings.communication_settings?.language || 'en'}
                                    onValueChange={v => setSettings({...settings, communication_settings: {...settings.communication_settings, language: v}})}
                                    disabled={!canEdit}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">Hindi</SelectItem>
                                        <SelectItem value="mr">Marathi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        {canEdit && (
                            <CardFooter className="border-t bg-slate-50 px-6 py-4">
                                <Button onClick={() => saveSettings('communication_settings', settings.communication_settings)} disabled={saving} className="ml-auto"><Save className="w-4 h-4 mr-2"/> Save Preferences</Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>

                {/* SECTION F: VERIFICATION */}
                <TabsContent value="verification">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance & Documents</CardTitle>
                            <CardDescription>Upload official documents for verification.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
                                <ShieldCheck className="w-6 h-6" />
                                <div>
                                    <div className="font-bold">Verification Status: {documents.length > 0 ? 'Pending/Verified' : 'Unverified'}</div>
                                    <div className="text-xs opacity-80">Upload all required documents to achieve verified status.</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Required Documents</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['Registration Certificate', 'Address Proof', 'GST Certificate', 'NABH Accreditation'].map(docType => (
                                        <div key={docType} className="border border-dashed p-4 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                                            <FileText className="w-8 h-8 text-slate-300" />
                                            <span className="text-sm font-medium text-slate-700">{docType}</span>
                                            {canEdit && (
                                                <Button variant="outline" size="sm" onClick={() => uploadDocument(docType, 'mock_url_path')} disabled={saving}>
                                                    <Upload className="w-3 h-3 mr-2" /> Upload
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <h4 className="font-semibold text-sm">Uploaded Documents</h4>
                                {documents.length === 0 ? (
                                    <div className="text-sm text-slate-400 italic">No documents uploaded yet.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {documents.map((doc: any) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-indigo-500" />
                                                    <div>
                                                        <div className="text-sm font-medium">{doc.type}</div>
                                                        <div className="text-xs text-slate-500">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} by {doc.uploadedBy}</div>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">{doc.verificationStatus}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SECTION G: SECURITY */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security & Access Control</CardTitle>
                            <CardDescription>Manage account security and session policies.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-indigo-600"/>
                                        <div>
                                            <div className="font-semibold">Two-Factor Authentication (2FA)</div>
                                            <div className="text-xs text-slate-500">Require OTP for Admin logins</div>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={settings.security_settings?.twoFactorEnabled === true}
                                        onCheckedChange={c => setSettings({...settings, security_settings: {...settings.security_settings, twoFactorEnabled: c}})}
                                        disabled={!canEdit}
                                    />
                                </div>

                                <div className="space-y-2 max-w-sm">
                                    <Label>Session Timeout (Minutes)</Label>
                                    <Select 
                                        value={String(settings.security_settings?.sessionTimeout || '60')}
                                        onValueChange={v => setSettings({...settings, security_settings: {...settings.security_settings, sessionTimeout: parseInt(v)}})}
                                        disabled={!canEdit}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 Minutes</SelectItem>
                                            <SelectItem value="30">30 Minutes</SelectItem>
                                            <SelectItem value="60">1 Hour</SelectItem>
                                            <SelectItem value="1440">24 Hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        {canEdit && (
                            <CardFooter className="border-t bg-slate-50 px-6 py-4">
                                <Button onClick={() => saveSettings('security_settings', settings.security_settings)} disabled={saving} className="ml-auto"><Save className="w-4 h-4 mr-2"/> Save Security Settings</Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}