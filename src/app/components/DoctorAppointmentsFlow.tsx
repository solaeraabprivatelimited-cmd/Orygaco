import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Video, MapPin, User, Phone, Mail, FileText, Pill, X, Check, ChevronLeft, Search, Filter, Download, MessageSquare, AlertCircle, CheckCircle2, XCircle, AlertTriangle, Save, Mic, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface DoctorAppointmentsFlowProps {
  onNavigate: (view: string) => void;
  onBack: () => void;
}

type ViewMode = 'list' | 'detail' | 'prescription';

// -- New Components --

function PatientProfileCard({ patient }: { patient: any }) {
    if (!patient) return null;
    
    return (
        <Card className="p-4 bg-slate-50 border-slate-100">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0 relative">
                    <img
                    src={patient.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"}
                    alt={patient.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    {patient.bloodGroup && (
                        <Badge className="absolute -bottom-2 -right-2 text-[10px] px-1 bg-white text-slate-700 border shadow-sm">
                            {patient.bloodGroup}
                        </Badge>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{patient.name}</h3>
                        <Badge variant="outline" className="text-xs font-normal">
                            {patient.age}Y • {patient.gender}
                        </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                        {patient.conditions?.map((c: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-red-50 text-red-700 border-red-100 text-[10px]">
                                {c}
                            </Badge>
                        ))}
                        {patient.allergies && (
                            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px]">
                                Allergy: {patient.allergies}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last Visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'First Visit'}
                        </span>
                        {patient.lastMedication && (
                            <span className="flex items-center gap-1" title={`Last Rx: ${patient.lastMedication}`}>
                                <Pill className="w-3 h-3" />
                                {patient.lastMedication}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

function DoctorNotes({ appointmentId }: { appointmentId: string }) {
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

    // Load initial notes
    useEffect(() => {
        async function loadNotes() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                
                const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/notes/${appointmentId}`, {
                    headers: { 
                        'Authorization': `Bearer ${publicAnonKey}`,
                        'X-Supabase-Auth': session.access_token
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotes(data.notes || '');
                }
            } catch (e) {
                console.error(e);
            }
        }
        loadNotes();
    }, [appointmentId]);

    // Auto-save logic
    const saveNotes = useCallback(async (text: string) => {
        setStatus('saving');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/notes`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'X-Supabase-Auth': session.access_token 
                },
                body: JSON.stringify({
                    authToken: session.access_token,
                    appointmentId,
                    notes: text
                })
            });
            setStatus('saved');
        } catch (e) {
            setStatus('unsaved');
        }
    }, [appointmentId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (notes) saveNotes(notes);
        }, 2000); // 2s debounce
        return () => clearTimeout(timer);
    }, [notes, saveNotes]);

    return (
        <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Clinical Notes (Private)
                </h3>
                <div className="flex items-center gap-2">
                    {status === 'saving' && <span className="text-xs text-slate-400 animate-pulse">Saving...</span>}
                    {status === 'saved' && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Voice to Text (Coming Soon)">
                        <Mic className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
            <Textarea 
                placeholder="Type clinical observations here..." 
                className="min-h-[150px] resize-y bg-slate-50/50"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </Card>
    );
}

function FollowUpSection({ appointmentId }: { appointmentId: string }) {
    const [required, setRequired] = useState(false);
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        // Load existing plan
        async function loadPlan() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                
                const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/follow-up/${appointmentId}`, {
                    headers: { 
                        'Authorization': `Bearer ${publicAnonKey}`,
                        'X-Supabase-Auth': session.access_token
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.required) {
                        setRequired(true);
                        setDate(data.date);
                        setNote(data.notes);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        loadPlan();
    }, [appointmentId]);

    const handleSave = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/follow-up`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'X-Supabase-Auth': session.access_token 
                },
                body: JSON.stringify({
                    authToken: session.access_token,
                    appointmentId,
                    required,
                    date,
                    notes: note
                })
            });
            toast.success("Follow-up plan updated");
        } catch (e) {
            toast.error("Failed to save follow-up");
        }
    };

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Follow-up Plan
                </h3>
                <Switch checked={required} onCheckedChange={setRequired} />
            </div>
            
            {required && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs">Suggested Date</Label>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-xs">Note for Patient</Label>
                            <Input placeholder="e.g. After blood test results" value={note} onChange={(e) => setNote(e.target.value)} />
                        </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full" onClick={handleSave}>Save Plan</Button>
                </div>
            )}
        </Card>
    );
}

// -- Main Component --

export function DoctorAppointmentsFlow({ onNavigate, onBack }: DoctorAppointmentsFlowProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState([
    { medicine: '', dosage: '', frequency: '', duration: '' }
  ]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Use the enhanced endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/dashboard/today-schedule`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': session.access_token
        }
      });

      if (response.ok) {
        const data = await response.json();
        // The enhanced endpoint returns computed statuses and flags
        setAppointments(Array.isArray(data) ? data : []);
      } else {
        // Fallback to basic list if enhanced fails
        const fallback = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor-appointments`, {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Supabase-Auth': session.access_token
            }
        });
        if (fallback.ok) {
            setAppointments(await fallback.json());
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (appointment: any) => {
    // Soft validation logic
    // In a real app, check if notes/Rx are filled. Here we just warn.
    const confirm = window.confirm("Are you sure you want to complete this consultation?");
    if (!confirm) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const loadingToast = toast.loading("Updating status...");

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/update-appointment-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          authToken: session.access_token,
          appointmentId: appointment.id,
          status: 'completed'
        })
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success("Appointment marked as completed");
        setAppointments(prev => prev.map(apt => 
          apt.id === appointment.id ? { ...apt, status: 'completed' } : apt
        ));
        setViewMode('list');
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filterAppointments = (status: string) => {
    return appointments.filter(apt => {
      // Logic to handle computed statuses mapping to tabs
      let normalizedStatus = apt.status === 'scheduled' ? 'upcoming' : apt.status;
      
      // If we are looking for 'upcoming', also include 'waiting' or 'waiting_late'
      if (status === 'upcoming') {
          return (normalizedStatus === 'upcoming' || normalizedStatus === 'scheduled' || apt.computedStatus?.includes('waiting'));
      }
      
      const matchesStatus = status === 'all' || normalizedStatus === status;
      const patientName = apt.patient?.name || apt.patientDetails?.name || "Unknown";
      
      const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const handleStartConsultation = (appointment: any) => {
    setSelectedAppointment(appointment);
    if (appointment.type === 'video') {
      onNavigate('teleconsult');
    } else {
      setViewMode('detail');
    }
  };

  const getPatient = (apt: any) => apt.patient || apt.patientDetails || {};

  // List View
  if (viewMode === 'list') {
    return (
      <div className="h-screen pt-[32px] pb-[64px] bg-background overflow-y-auto pr-[0px] pl-[0px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Appointments</h1>
                <p className="text-muted-foreground">Manage your consultation schedule and patient visits</p>
              </div>
              <Button variant="outline" onClick={onBack} className="hidden sm:flex">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 w-full"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="border-b border-border/50">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6 overflow-x-auto scrollbar-hide">
                  {['upcoming', 'completed', 'all'].map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab} 
                      className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none transition-all"
                    >
                      <span className="capitalize mr-2">{tab}</span>
                      <Badge variant="secondary" className="rounded-full px-2 h-5 text-[10px] font-normal">
                        {filterAppointments(tab).length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">Loading appointments...</div>
                ) : filterAppointments(activeTab).length === 0 ? (
                  <Card className="py-16 text-center border-dashed">
                    <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-primary/40" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No appointments found</h3>
                  </Card>
                ) : (
                  filterAppointments(activeTab).map((appointment) => {
                    const patient = getPatient(appointment);
                    const flags = appointment.flags || {};
                    
                    return (
                    <Card key={appointment.id} className="group overflow-hidden hover:shadow-md transition-all duration-200 border-border/60">
                      <div className="flex flex-col lg:flex-row">
                        {/* Left Section: Patient Profile */}
                        <div className="p-5 lg:w-[280px] flex items-center lg:block border-b lg:border-b-0 lg:border-r border-border/50 bg-slate-50/50">
                            <div className="flex lg:flex-col items-center gap-4 lg:text-center w-full">
                                <div className="relative">
                                    <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden ring-4 ring-background shadow-sm">
                                      {patient.image ? (
                                        <img src={patient.image} alt={patient.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <User className="w-8 h-8 text-slate-400" />
                                      )}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${appointment.type === 'video' || appointment.type === 'Video' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                                </div>
                                <div className="flex-1 lg:flex-none">
                                    <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{patient.name || "Unknown"}</h3>
                                    <div className="mt-2 text-xs font-mono text-muted-foreground bg-white px-2 py-1 rounded border inline-block">
                                        Token #{appointment.token || '---'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Appointment Details */}
                        <div className="flex-1 p-5">
                            {/* NEW: Flags Row */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {flags.isHighRisk && (
                                    <Badge className="bg-red-50 text-red-700 border-red-200 gap-1">
                                        <AlertTriangle className="w-3 h-3" /> High Risk
                                    </Badge>
                                )}
                                {flags.patientWaiting && (
                                    <Badge className="bg-orange-50 text-orange-700 border-orange-200 gap-1 animate-pulse">
                                        <User className="w-3 h-3" /> Patient Waiting
                                    </Badge>
                                )}
                                {flags.isLate && (
                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                        <Clock className="w-3 h-3" /> Running Late
                                    </Badge>
                                )}
                                {flags.timeToStart && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 gap-1">
                                        Starts in {flags.timeToStart} min
                                    </Badge>
                                )}
                            </div>

                            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 mb-4">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Schedule</span>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <Calendar className="w-4 h-4 text-primary/60" />
                                        {new Date(appointment.date).toLocaleDateString()}
                                        <span className="text-slate-300">|</span>
                                        <Clock className="w-4 h-4 text-primary/60" />
                                        {appointment.time}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Type</span>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        {appointment.type === 'Video' || appointment.type === 'video' ? (
                                            <>
                                                <Video className="w-4 h-4 text-blue-500" />
                                                <span>Video Consultation</span>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="w-4 h-4 text-emerald-500" />
                                                <span>In-Person Visit</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Reason</span>
                                    <p className="text-sm font-medium text-slate-900">{appointment.reason || "Not specified"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Actions */}
                        <div className="p-5 lg:w-[220px] bg-slate-50/30 border-t lg:border-t-0 lg:border-l border-border/50 flex flex-col justify-center gap-3">
                            {appointment.status === 'completed' ? (
                                <Button variant="outline" className="w-full" disabled>
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                                    Completed
                                </Button>
                            ) : (
                                <Button 
                                    className="w-full shadow-sm bg-primary hover:bg-primary/90 text-white" 
                                    onClick={() => handleStartConsultation(appointment)}
                                >
                                    Start Consultation
                                </Button>
                            )}
                        </div>
                      </div>
                    </Card>
                  )})
                )}
              </TabsContent>
            </Tabs>
          </div>
      </div>
    );
  }

  // Detail View (Enhanced Consultation Mode)
  if (viewMode === 'detail' && selectedAppointment) {
    const patient = getPatient(selectedAppointment);
    return (
      <div className="h-screen pt-24 pb-16 bg-background overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                    Consultation in progress...
                </span>
                <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleMarkAsCompleted(selectedAppointment)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Visit
                </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column: Patient Profile & Vitals (Sticky-ish) */}
            <div className="lg:col-span-4 space-y-6">
                <PatientProfileCard patient={patient} />
                
                {/* Vitals Snapshot */}
                <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-500" /> Vitals
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-slate-50 rounded border text-center">
                            <div className="text-xs text-slate-500">BP</div>
                            <div className="font-mono font-medium text-lg">120/80</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border text-center">
                            <div className="text-xs text-slate-500">Pulse</div>
                            <div className="font-mono font-medium text-lg text-red-600">98</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border text-center">
                            <div className="text-xs text-slate-500">Temp</div>
                            <div className="font-mono font-medium text-lg">98.4</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border text-center">
                            <div className="text-xs text-slate-500">SpO2</div>
                            <div className="font-mono font-medium text-lg text-blue-600">97%</div>
                        </div>
                    </div>
                    <Button variant="link" size="sm" className="w-full mt-2 h-auto p-0">View History</Button>
                </Card>

                {/* Chief Complaints */}
                <Card className="p-4">
                    <h3 className="font-semibold mb-2">Reason for Visit</h3>
                    <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                        {selectedAppointment.reason || "Routine checkup"}
                    </p>
                    {selectedAppointment.symptoms && (
                        <div className="mt-3">
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Symptoms</h4>
                            <div className="flex flex-wrap gap-1">
                                {selectedAppointment.symptoms.split(',').map((s: string, i: number) => (
                                    <Badge key={i} variant="outline">{s.trim()}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Right Column: Clinical Workflow */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Doctor Notes (Auto-save) */}
                <DoctorNotes appointmentId={selectedAppointment.id} />

                {/* Prescription (Simplified) */}
                <Card className="p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        Prescription
                    </h3>
                    <div className="space-y-3">
                        {medicines.map((med, index) => (
                            <div key={index} className="flex gap-2">
                                <Input placeholder="Medicine Name" className="flex-1" value={med.medicine} onChange={(e) => {
                                    const newMeds = [...medicines];
                                    newMeds[index].medicine = e.target.value;
                                    setMedicines(newMeds);
                                }} />
                                <Input placeholder="Dosage" className="w-24" value={med.dosage} onChange={(e) => {
                                    const newMeds = [...medicines];
                                    newMeds[index].dosage = e.target.value;
                                    setMedicines(newMeds);
                                }} />
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setMedicines(medicines.filter((_, i) => i !== index));
                                }}><X className="w-4 h-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setMedicines([...medicines, { medicine: '', dosage: '', frequency: '', duration: '' }])}>
                            <Plus className="w-3 h-3 mr-1" /> Add Medicine
                        </Button>
                    </div>
                </Card>

                {/* Follow-up Plan */}
                <FollowUpSection appointmentId={selectedAppointment.id} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}