import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Calendar } from '@/app/components/ui/calendar'; // Ensure this exists or use input type date
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Clock, Calendar as CalendarIcon, User, Shield, AlertTriangle, CheckCircle, XCircle, DollarSign, Activity, FileText } from 'lucide-react';

interface DoctorManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: any | null; // null = new doctor
    onSuccess: () => void;
    hospitalId: string;
    userRole: string; // 'hospital' | 'doctor'
}

export function DoctorManagementModal({ isOpen, onClose, doctor, onSuccess, hospitalId, userRole }: DoctorManagementModalProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    
    // Profile State
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        specialty: '',
        qualification: '', // New
        registration_number: '', // New
        experience: '',
        consultationFee: '',
        avg_consult_time: '15', // New
        languages_spoken: '', // New (comma separated)
        location: '',
        image: '',
        availableToday: true,
        videoConsultation: true
    });

    // Shifts State
    const [shifts, setShifts] = useState<any[]>([]);
    
    // Leaves State
    const [leaves, setLeaves] = useState<any[]>([]);
    const [newLeave, setNewLeave] = useState({ date: '', type: 'full_day', reason: '' });

    // Verification State
    const [verificationStatus, setVerificationStatus] = useState('pending');

    // Metrics State
    const [metrics, setMetrics] = useState<any>(null);

    // Financial State
    const [finance, setFinance] = useState({
        payoutPercentage: '80', // Default
        platformCommission: '20'
    });

    // Verification Extended
    const [verificationData, setVerificationData] = useState({
        issuing_authority: '',
        degree_cert_url: '',
        registration_proof_url: '',
        admin_remarks: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (doctor) {
                // ... (Existing resets)
                setFormData({
                    id: doctor.id || '',
                    name: doctor.name || '',
                    specialty: doctor.specialty || '',
                    qualification: doctor.qualification || '',
                    registration_number: doctor.registration_number || '',
                    experience: doctor.experience || '',
                    consultationFee: doctor.consultationFee || '',
                    avg_consult_time: doctor.avg_consult_time || '15',
                    languages_spoken: Array.isArray(doctor.languages_spoken) ? doctor.languages_spoken.join(', ') : (doctor.languages_spoken || ''),
                    location: doctor.location || '',
                    image: doctor.image || '',
                    availableToday: doctor.availableToday !== false,
                    videoConsultation: doctor.videoConsultation !== false
                });
                setVerificationStatus(doctor.verification_status || 'pending');
                fetchShifts(doctor.id);
                fetchLeaves(doctor.id);
                fetchVerification(doctor.id);
                fetchFinance(doctor.id);
                if (userRole === 'hospital' || userRole === 'doctor') {
                    fetchMetrics(doctor.id);
                }
            } else {
                // ... (Existing resets)
                setFormData({
                    id: '',
                    name: '',
                    specialty: '',
                    qualification: '',
                    registration_number: '',
                    experience: '',
                    consultationFee: '',
                    avg_consult_time: '15',
                    languages_spoken: '',
                    location: '',
                    image: '',
                    availableToday: true,
                    videoConsultation: true
                });
                setShifts([]);
                setLeaves([]);
                setMetrics(null);
                setVerificationStatus('pending');
                setFinance({ payoutPercentage: '80', platformCommission: '20' });
                setVerificationData({ issuing_authority: '', degree_cert_url: '', registration_proof_url: '', admin_remarks: '' });
            }
        }
    }, [isOpen, doctor]);

    async function fetchVerification(doctorId: string) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/verification/${doctorId}?authToken=${session.access_token}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data) setVerificationData(data);
            }
        } catch (e) { console.error(e); }
    }

    async function fetchFinance(doctorId: string) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/financial-config/${doctorId}?authToken=${session.access_token}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data) setFinance(data);
            }
        } catch (e) { console.error(e); }
    }

    async function handleSaveVerification() {
        if (!doctor?.id) return;
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/verification/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({
                    authToken: session.access_token,
                    doctorId: doctor.id,
                    ...verificationData,
                    registration_number: formData.registration_number // Sync
                })
            });
            if (res.ok) toast.success("Verification data saved");
            else toast.error("Failed to save verification data");
        } catch (e) { toast.error("Error saving verification"); }
        finally { setIsLoading(false); }
    }

    async function handleSaveFinance() {
        if (!doctor?.id) return;
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/financial-config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({
                    authToken: session.access_token,
                    doctorId: doctor.id,
                    ...finance
                })
            });
            if (res.ok) toast.success("Financial config saved");
            else toast.error("Failed to save financial config");
        } catch (e) { toast.error("Error saving finance"); }
        finally { setIsLoading(false); }
    }

    async function fetchShifts(doctorId: string) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor-shifts?doctorId=${doctorId}&authToken=${session.access_token}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                setShifts(data);
            }
        } catch (e) { console.error(e); }
    }

    async function fetchLeaves(doctorId: string) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor-leaves?doctorId=${doctorId}&authToken=${session.access_token}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
            }
        } catch (e) { console.error(e); }
    }

    async function fetchMetrics(doctorId: string) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor-metrics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({ authToken: session.access_token, doctorId })
            });
            if (res.ok) setMetrics(await res.json());
        } catch (e) { console.error(e); }
    }

    async function handleSaveProfile() {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const payload = {
                authToken: session.access_token,
                ...formData,
                languages_spoken: formData.languages_spoken.split(',').map(s => s.trim()).filter(Boolean),
                hospitalId
            };

            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospital-doctors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Profile saved successfully");
                onSuccess();
                if (!doctor) onClose(); // Close if it was a new doctor
            } else {
                toast.error("Failed to save profile");
            }
        } catch (e) {
            toast.error("Error saving profile");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSaveShifts() {
        if (!doctor?.id) {
            toast.error("Please save profile first");
            return;
        }
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor-shifts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({
                    authToken: session.access_token,
                    doctorId: doctor.id,
                    shifts: shifts
                })
            });

            if (res.ok) {
                toast.success("Shifts updated");
                fetchShifts(doctor.id);
            } else {
                toast.error("Failed to update shifts");
            }
        } catch (e) { toast.error("Error updating shifts"); }
        finally { setIsLoading(false); }
    }

    async function handleAddLeave() {
        if (!doctor?.id || !newLeave.date) return;
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor-leaves`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({
                    authToken: session.access_token,
                    doctorId: doctor.id,
                    leaveDate: newLeave.date,
                    leaveType: newLeave.type,
                    reason: newLeave.reason
                })
            });

            if (res.ok) {
                toast.success("Leave added");
                setNewLeave({ date: '', type: 'full_day', reason: '' });
                fetchLeaves(doctor.id);
            } else {
                toast.error("Failed to add leave");
            }
        } catch (e) { toast.error("Error adding leave"); }
        finally { setIsLoading(false); }
    }

    async function handleVerify(status: string) {
        if (!doctor?.id) return;
        const confirmMsg = status === 'verified' ? "Verify this doctor?" : "Reject verification?";
        if (!confirm(confirmMsg)) return;

        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/verify-doctor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({
                    authToken: session.access_token,
                    doctorId: doctor.id,
                    status
                })
            });

            if (res.ok) {
                toast.success(`Doctor ${status}`);
                setVerificationStatus(status);
                onSuccess();
            }
        } catch (e) { toast.error("Error updating status"); }
        finally { setIsLoading(false); }
    }

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const updateShift = (dayIndex: number, field: string, value: any) => {
        const existingShift = shifts.find(s => s.dayOfWeek === dayIndex);
        const newShifts = [...shifts];
        
        if (existingShift) {
            const index = newShifts.indexOf(existingShift);
            newShifts[index] = { ...existingShift, [field]: value };
        } else {
            // Create new shift entry
            newShifts.push({
                dayOfWeek: dayIndex,
                startTime: '09:00',
                endTime: '17:00',
                isActive: true,
                [field]: value
            });
        }
        setShifts(newShifts);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                    <DialogDescription>Manage profile, schedule, and verification.</DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="verification" disabled={!doctor || userRole !== 'hospital'}>Verification</TabsTrigger>
                        <TabsTrigger value="availability" disabled={!doctor}>Availability</TabsTrigger>
                        <TabsTrigger value="finance" disabled={!doctor || userRole !== 'hospital'}>Financials</TabsTrigger>
                        <TabsTrigger value="metrics" disabled={!doctor}>Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Dr. John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Specialty</Label>
                                <Input value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} placeholder="Cardiology" />
                            </div>
                            <div className="space-y-2">
                                <Label>Registration Number</Label>
                                <Input value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} placeholder="MED12345" />
                            </div>
                            <div className="space-y-2">
                                <Label>Qualifications</Label>
                                <Input value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} placeholder="MBBS, MD" />
                            </div>
                            <div className="space-y-2">
                                <Label>Experience (Years)</Label>
                                <Input value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Avg Consult Time (min)</Label>
                                <Input type="number" value={formData.avg_consult_time} onChange={e => setFormData({...formData, avg_consult_time: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Languages (comma sep)</Label>
                                <Input value={formData.languages_spoken} onChange={e => setFormData({...formData, languages_spoken: e.target.value})} placeholder="English, Hindi" />
                            </div>
                            <div className="space-y-2">
                                <Label>Consultation Fee</Label>
                                <Input value={formData.consultationFee} onChange={e => setFormData({...formData, consultationFee: e.target.value})} placeholder="500" />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Profile Image URL</Label>
                                <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
                            </div>
                        </div>

                        {userRole === 'hospital' && doctor && (
                            <div className="mt-6 border-t pt-4">
                                <h4 className="font-semibold mb-2 flex items-center"><Shield className="w-4 h-4 mr-2" /> Verification Status</h4>
                                <div className="flex items-center gap-4">
                                    <Badge variant={verificationStatus === 'verified' ? 'default' : 'secondary'} className={verificationStatus === 'verified' ? 'bg-green-600' : ''}>
                                        {verificationStatus.toUpperCase()}
                                    </Badge>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleVerify('verified')}>Verify</Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleVerify('rejected')}>Reject</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-4">
                            <Button onClick={handleSaveProfile} disabled={isLoading}>Save Profile</Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="verification" className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <h4 className="font-semibold flex items-center"><Shield className="w-4 h-4 mr-2" /> Verification Details (Admin Only)</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Registration Number</Label>
                                            <Input value={formData.registration_number} disabled readOnly className="bg-slate-50" />
                                            <p className="text-xs text-muted-foreground">Updated in Profile tab</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Issuing Authority</Label>
                                            <Select value={verificationData.issuing_authority} onValueChange={(v) => setVerificationData({...verificationData, issuing_authority: v})}>
                                                <SelectTrigger><SelectValue placeholder="Select Authority" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="nmc">National Medical Commission (NMC)</SelectItem>
                                                    <SelectItem value="smc">State Medical Council</SelectItem>
                                                    <SelectItem value="ima">Indian Medical Association (IMA)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Degree Certificate URL</Label>
                                        <Input value={verificationData.degree_cert_url} onChange={(e) => setVerificationData({...verificationData, degree_cert_url: e.target.value})} placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Registration Proof URL</Label>
                                        <Input value={verificationData.registration_proof_url} onChange={(e) => setVerificationData({...verificationData, registration_proof_url: e.target.value})} placeholder="https://..." />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Admin Remarks (Internal)</Label>
                                        <Textarea value={verificationData.admin_remarks} onChange={(e) => setVerificationData({...verificationData, admin_remarks: e.target.value})} placeholder="Notes on verification..." />
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Status:</span>
                                            <Badge variant={verificationStatus === 'verified' ? 'default' : verificationStatus === 'rejected' ? 'destructive' : 'secondary'}>
                                                {verificationStatus.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => handleVerify('rejected')} className="text-red-600 border-red-200">Reject</Button>
                                            <Button variant="default" onClick={() => handleVerify('verified')} className="bg-green-600 hover:bg-green-700">Approve & Verify</Button>
                                        </div>
                                    </div>
                                    <Button className="w-full mt-2" variant="secondary" onClick={handleSaveVerification}>Save Verification Data</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="finance" className="space-y-4 py-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h4 className="font-semibold flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Financial Configuration</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Consultation Fee (₹)</Label>
                                        <Input value={formData.consultationFee} disabled readOnly className="bg-slate-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Net Payout per Visit (Est.)</Label>
                                        <div className="text-2xl font-bold text-green-600">
                                            ₹{Math.round((parseInt(formData.consultationFee || '0') * parseInt(finance.payoutPercentage || '0')) / 100)}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Doctor Payout %</Label>
                                        <Input type="number" value={finance.payoutPercentage} onChange={(e) => setFinance({...finance, payoutPercentage: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Platform Commission %</Label>
                                        <Input type="number" value={finance.platformCommission} onChange={(e) => setFinance({...finance, platformCommission: e.target.value})} />
                                    </div>
                                </div>

                                <Button className="w-full" onClick={handleSaveFinance}>Update Financials</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="availability" className="space-y-4 py-4">
                        <Tabs defaultValue="shifts" className="w-full">
                            <TabsList className="w-full">
                                <TabsTrigger value="shifts" className="flex-1">Weekly Shifts</TabsTrigger>
                                <TabsTrigger value="leaves" className="flex-1">Leave Management</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="shifts" className="space-y-4 pt-4">
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">Set recurring weekly availability.</p>
                                    {weekDays.map((day, index) => {
                                const shift = shifts.find(s => s.dayOfWeek === index);
                                const isActive = shift?.isActive !== false; // Default active if not set
                                
                                return (
                                    <div key={day} className="flex items-center gap-4 p-3 border rounded-lg bg-slate-50">
                                        <div className="w-24 font-medium">{day}</div>
                                        <Switch 
                                            checked={isActive} 
                                            onCheckedChange={(c) => updateShift(index, 'isActive', c)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                type="time" 
                                                className="w-32" 
                                                value={shift?.startTime || '09:00'} 
                                                onChange={(e) => updateShift(index, 'startTime', e.target.value)}
                                                disabled={!isActive}
                                            />
                                            <span>to</span>
                                            <Input 
                                                type="time" 
                                                className="w-32" 
                                                value={shift?.endTime || '17:00'} 
                                                onChange={(e) => updateShift(index, 'endTime', e.target.value)}
                                                disabled={!isActive}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex justify-end mt-4">
                                <Button onClick={handleSaveShifts} disabled={isLoading}>Update Schedule</Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="leaves" className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <h4 className="font-semibold">Add Leave</h4>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input type="date" value={newLeave.date} onChange={e => setNewLeave({...newLeave, date: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={newLeave.type} onValueChange={v => setNewLeave({...newLeave, type: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full_day">Full Day</SelectItem>
                                                <SelectItem value="half_day">Half Day</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reason</Label>
                                        <Input value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} placeholder="Personal, Sick, etc." />
                                    </div>
                                    <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200">
                                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                                        Adding leave will automatically block slots for this date.
                                    </div>
                                    <Button className="w-full" onClick={handleAddLeave} disabled={!newLeave.date || isLoading}>
                                        Block Date
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold mb-4">Upcoming Leaves</h4>
                                    <ScrollArea className="h-[200px]">
                                        <div className="space-y-2">
                                            {leaves.length === 0 && <p className="text-sm text-slate-500">No leaves scheduled.</p>}
                                            {leaves.map(leave => (
                                                <div key={leave.id} className="p-3 border rounded bg-slate-50 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{leave.leaveDate}</p>
                                                        <p className="text-xs text-slate-500">{leave.reason || leave.leaveType}</p>
                                                    </div>
                                                    <Badge variant="outline">{leave.leaveType === 'full_day' ? 'Full' : 'Half'}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 py-4">
                        {metrics ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold">{metrics.totalAppointments}</div>
                                        <p className="text-xs text-muted-foreground">Total Bookings</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold text-green-600">{metrics.completionRate}%</div>
                                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold text-red-600">{metrics.noShowRate}%</div>
                                        <p className="text-xs text-muted-foreground">No-Show Rate</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold">{metrics.avgConsultTime}m</div>
                                        <p className="text-xs text-muted-foreground">Avg Consult Time</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-40">
                                <p className="text-slate-500">Loading metrics...</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}