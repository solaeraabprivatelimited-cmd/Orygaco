import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Switch } from '@/app/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Trash2, UserPlus, Shield, User, Clock, Activity, Lock, BarChart, Calendar, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import { useSecurity, PERMISSIONS } from '@/app/contexts/SecurityContext';

export function StaffManagement() {
    const { checkPermission } = useSecurity();
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('registry');
    
    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null); // For detailed view
    
    // Forms
    const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'receptionist' });
    const [staffDetails, setStaffDetails] = useState<any>(null); // Details for selected staff
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Elevation Form
    const [elevationForm, setElevationForm] = useState({ role: 'admin', duration: '60' });

    useEffect(() => {
        if (activeTab === 'registry') fetchStaff();
        if (activeTab === 'performance') fetchPerformance();
    }, [activeTab]);

    useEffect(() => {
        if (selectedStaff) {
            fetchStaffDetails(selectedStaff.id);
        } else {
            setStaffDetails(null);
        }
    }, [selectedStaff]);

    async function fetchStaff() {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/staff?authToken=${session.access_token}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                setStaff(await res.json());
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }

    const [performanceData, setPerformanceData] = useState<any[]>([]);
    async function fetchPerformance() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/admin/staff/performance?authToken=${session.access_token}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                setPerformanceData(await res.json());
            }
        } catch (e) { console.error(e); }
    }

    async function fetchStaffDetails(id: string) {
        setLoadingDetails(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/admin/staff/${id}/details?authToken=${session.access_token}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                setStaffDetails(await res.json());
            }
        } catch (e) { console.error(e); } finally { setLoadingDetails(false); }
    }

    async function handleAddStaff() {
        if (!newStaff.name || !newStaff.email) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({
                    authToken: session.access_token,
                    ...newStaff
                })
            });
            if (res.ok) {
                toast.success("Staff added");
                setShowAddModal(false);
                setNewStaff({ name: '', email: '', role: 'receptionist' });
                fetchStaff();
            } else {
                toast.error("Failed to add staff");
            }
        } catch (e) { toast.error("Error adding staff"); }
    }

    async function handleUpdatePermissions(newPermissions: any) {
        if (!selectedStaff) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/admin/staff/${selectedStaff.id}/permissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({
                    authToken: session.access_token,
                    permissions: newPermissions
                })
            });
            
            if (res.ok) {
                toast.success("Permissions updated");
                fetchStaffDetails(selectedStaff.id);
            }
        } catch (e) { toast.error("Update failed"); }
    }

    async function handleElevateRole() {
        if (!selectedStaff) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/admin/staff/${selectedStaff.id}/elevate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({
                    authToken: session.access_token,
                    role: elevationForm.role,
                    duration: parseInt(elevationForm.duration)
                })
            });
            
            if (res.ok) {
                toast.success(`Role elevated to ${elevationForm.role}`);
                fetchStaffDetails(selectedStaff.id);
            }
        } catch (e) { toast.error("Elevation failed"); }
    }

    async function handleAssignShift(shift: any) {
        if (!selectedStaff) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const currentShifts = staffDetails?.shifts || [];
            const newShifts = [...currentShifts, { ...shift, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];

            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/admin/staff/${selectedStaff.id}/shifts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                body: JSON.stringify({
                    authToken: session.access_token,
                    shifts: newShifts
                })
            });
            
            if (res.ok) {
                toast.success("Shift assigned");
                fetchStaffDetails(selectedStaff.id);
            }
        } catch (e) { toast.error("Assignment failed"); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Remove this staff member? This action cannot be undone.")) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/staff/${id}?authToken=${session.access_token}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                toast.success("Staff removed");
                fetchStaff();
                setSelectedStaff(null);
            }
        } catch (e) { toast.error("Error removing staff"); }
    }

    // Permission Categories Helper
    const PERMISSION_GROUPS = [
        {
            name: 'Appointments',
            keys: [
                { id: 'view_appointments', label: 'View Appointments' },
                { id: 'create_appointments', label: 'Create/Book' },
                { id: 'cancel_appointments', label: 'Cancel/Delete' },
            ]
        },
        {
            name: 'Patient Records',
            keys: [
                { id: 'view_patients', label: 'View Records' },
                { id: 'edit_patients', label: 'Edit Details' },
            ]
        },
        {
            name: 'Administration',
            keys: [
                { id: 'manage_staff', label: 'Manage Staff' },
                { id: 'view_reports', label: 'View Reports' },
            ]
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="flex justify-between items-center">
                    <TabsList className="bg-white border">
                        <TabsTrigger value="registry" className="gap-2"><User className="w-4 h-4" /> Registry</TabsTrigger>
                        <TabsTrigger value="performance" className="gap-2"><BarChart className="w-4 h-4" /> Performance</TabsTrigger>
                    </TabsList>
                    
                    {activeTab === 'registry' && checkPermission(PERMISSIONS.MANAGE_STAFF) && (
                        <Button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white"><UserPlus className="w-4 h-4 mr-2" /> Add Staff</Button>
                    )}
                </div>

                <TabsContent value="registry" className="space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle>Staff Registry</CardTitle>
                            <CardDescription>Manage hospital staff, roles, and access levels.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-8 text-center text-slate-500">Loading staff...</div> : (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="pl-6">Name / Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {staff.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No staff found.</TableCell>
                                            </TableRow>
                                        )}
                                        {staff.map((s) => (
                                            <TableRow key={s.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedStaff(s)}>
                                                <TableCell className="pl-6">
                                                    <div>
                                                        <div className="font-medium text-slate-900">{s.name}</div>
                                                        <div className="text-xs text-slate-500">{s.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`capitalize ${
                                                        s.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        s.role === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-slate-50 text-slate-700 border-slate-200'
                                                    }`}>
                                                        {s.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                        <span className="text-sm text-slate-600">Active</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm">
                                                    {new Date(s.joinedAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedStaff(s); }}>
                                                        Manage
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {performanceData.map((metrics) => (
                            <Card key={metrics.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{metrics.name}</h4>
                                            <p className="text-xs text-slate-500 capitalize">{metrics.role}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${
                                            parseInt(metrics.punctuality) > 95 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            <Activity className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Appointments</span>
                                            <span className="font-medium text-slate-900">{metrics.appointmentsHandled}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Avg. Handling</span>
                                            <span className="font-medium text-slate-900">{metrics.avgHandlingTime}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Punctuality</span>
                                            <span className="font-medium text-slate-900">{metrics.punctuality}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 border-t text-xs text-center text-slate-500">
                                    Last active: Today
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add Staff Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Staff</DialogTitle>
                        <DialogDescription>Create a new staff account and assign initial role.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} placeholder="jane@hospital.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={newStaff.role} onValueChange={v => setNewStaff({...newStaff, role: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="receptionist">Receptionist</SelectItem>
                                    <SelectItem value="nurse">Nurse</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => {
                            if (!newStaff.name || !newStaff.email) {
                                toast.error("Please fill in all required fields");
                                return;
                            }
                            handleAddStaff();
                        }}>Create Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Staff Details Modal */}
            <Dialog open={!!selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    {selectedStaff && (
                        <>
                            <DialogHeader className="border-b pb-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl">{selectedStaff.name}</DialogTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="capitalize">{selectedStaff.role}</Badge>
                                                <span className="text-xs text-slate-400">{selectedStaff.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {checkPermission(PERMISSIONS.MANAGE_STAFF) && (
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedStaff.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                                        </Button>
                                    )}
                                </div>
                            </DialogHeader>

                            {loadingDetails ? <div className="py-8 text-center text-slate-500">Loading details...</div> : (
                                <Tabs defaultValue="permissions" className="w-full">
                                    <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-4 gap-6">
                                        <TabsTrigger value="permissions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:shadow-none px-0 py-2">Permissions</TabsTrigger>
                                        <TabsTrigger value="shifts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:shadow-none px-0 py-2">Shifts</TabsTrigger>
                                        <TabsTrigger value="access" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:shadow-none px-0 py-2">Access & Roles</TabsTrigger>
                                        <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:shadow-none px-0 py-2">Activity Logs</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="permissions" className="space-y-6">
                                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-3 text-sm text-amber-800">
                                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                            <p>Permissions set here override the default role permissions. Use with caution.</p>
                                        </div>
                                        
                                        <div className="grid gap-6">
                                            {PERMISSION_GROUPS.map((group) => (
                                                <div key={group.name} className="space-y-3">
                                                    <h4 className="font-semibold text-slate-900 text-sm">{group.name}</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {group.keys.map((perm) => {
                                                            const isEnabled = staffDetails?.permissions?.[perm.id] ?? false;
                                                            return (
                                                                <div key={perm.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                                                    <Label htmlFor={perm.id} className="text-sm font-medium cursor-pointer flex-1">
                                                                        {perm.label}
                                                                    </Label>
                                                                    <Switch 
                                                                        id={perm.id}
                                                                        checked={isEnabled}
                                                                        onCheckedChange={(checked) => {
                                                                            const newPerms = { ...(staffDetails?.permissions || {}), [perm.id]: checked };
                                                                            setStaffDetails({ ...staffDetails, permissions: newPerms }); // Optimistic UI
                                                                            handleUpdatePermissions(newPerms);
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="shifts" className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-slate-900">Assigned Shifts</h4>
                                            <Button size="sm" variant="outline" onClick={() => handleAssignShift({ name: 'Morning Shift', startTime: '09:00', endTime: '17:00' })}>
                                                <UserPlus className="w-4 h-4 mr-2" /> Assign Standard Shift
                                            </Button>
                                        </div>
                                        
                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50">
                                                        <TableHead>Shift Name</TableHead>
                                                        <TableHead>Time</TableHead>
                                                        <TableHead>Recurring</TableHead>
                                                        <TableHead className="text-right">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {(staffDetails?.shifts || []).length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center py-6 text-slate-500">No shifts assigned</TableCell>
                                                        </TableRow>
                                                    )}
                                                    {(staffDetails?.shifts || []).map((shift: any, idx: number) => (
                                                        <TableRow key={idx}>
                                                            <TableCell className="font-medium">{shift.name}</TableCell>
                                                            <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary">Daily</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="access" className="space-y-6">
                                        <div className="grid gap-6">
                                            <div className="p-4 border rounded-xl bg-slate-50">
                                                <h4 className="font-semibold text-slate-900 mb-1">Current Status</h4>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                    Role: <strong className="capitalize">{selectedStaff.role}</strong>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-indigo-600" />
                                                    <h4 className="font-bold text-slate-900">Temporary Role Elevation</h4>
                                                </div>
                                                <p className="text-sm text-slate-500">
                                                    Grant temporary higher-level access to this staff member. Access will automatically expire after the set duration.
                                                </p>
                                                
                                                {staffDetails?.elevation ? (
                                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                                                        <div>
                                                            <div className="font-bold text-indigo-900 flex items-center gap-2">
                                                                <Lock className="w-4 h-4" />
                                                                Elevated to {staffDetails.elevation.elevatedRole}
                                                            </div>
                                                            <div className="text-xs text-indigo-700 mt-1">
                                                                Expires: {new Date(staffDetails.elevation.endAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200">Active</Badge>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-white p-4 border rounded-xl shadow-sm">
                                                        <div className="space-y-2">
                                                            <Label>Elevate To</Label>
                                                            <Select value={elevationForm.role} onValueChange={v => setElevationForm({...elevationForm, role: v})}>
                                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="admin">Admin</SelectItem>
                                                                    <SelectItem value="doctor">Doctor</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Duration (Minutes)</Label>
                                                            <Select value={elevationForm.duration} onValueChange={v => setElevationForm({...elevationForm, duration: v})}>
                                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="30">30 Mins</SelectItem>
                                                                    <SelectItem value="60">1 Hour</SelectItem>
                                                                    <SelectItem value="240">4 Hours</SelectItem>
                                                                    <SelectItem value="1440">24 Hours</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button onClick={handleElevateRole} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                                            Grant Access
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="logs" className="space-y-4">
                                        <h4 className="font-semibold text-slate-900">Recent Activity</h4>
                                        <div className="border rounded-lg bg-slate-50 max-h-[300px] overflow-y-auto p-4 space-y-3">
                                            {(staffDetails?.logs || []).length === 0 && <p className="text-center text-slate-400 text-sm">No recent activity.</p>}
                                            {(staffDetails?.logs || []).map((log: any) => (
                                                <div key={log.id} className="flex gap-3 text-sm bg-white p-3 rounded border border-slate-100 shadow-sm">
                                                    <div className="mt-0.5">
                                                        <Activity className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">
                                                            {log.action.replace(/_/g, ' ')}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5">
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </div>
                                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                            <div className="mt-1 text-xs font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded inline-block">
                                                                {JSON.stringify(log.metadata)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}