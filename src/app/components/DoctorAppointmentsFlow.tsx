import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Video, MapPin, User, Phone, Mail, FileText, Pill, X, Check, ChevronLeft, Search, Filter, Download, MessageSquare, AlertCircle, CheckCircle2, XCircle, AlertTriangle, Save, Mic, Activity, Plus } from 'lucide-react';
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
import { useAppNavigate } from '../hooks/useAppNavigate';

export function DoctorAppointmentsFlow() {
  const { navigate, goBack } = useAppNavigate();
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
      navigate('teleconsult');
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
              <Button variant="outline" onClick={goBack} className="hidden sm:flex">
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

type ViewMode = 'list' | 'detail';

function PatientProfileCard({ patient }: { patient: any }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
          {patient.image ? (
            <img src={patient.image} alt={patient.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-7 h-7 text-slate-400" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{patient.name || 'Unknown'}</h3>
          <p className="text-sm text-muted-foreground">{patient.age ? `${patient.age} years` : ''} {patient.gender || ''}</p>
        </div>
      </div>
      {patient.phone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-3 h-3" /> {patient.phone}
        </div>
      )}
    </Card>
  );
}

function DoctorNotes({ appointmentId }: { appointmentId: string }) {
  const [notes, setNotes] = useState('');
  return (
    <Card className="p-4">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-blue-600" /> Clinical Notes
      </h3>
      <Textarea
        placeholder="Write your clinical notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[120px]"
      />
      <div className="flex justify-end mt-2">
        <Button size="sm" variant="outline">
          <Save className="w-3 h-3 mr-1" /> Save
        </Button>
      </div>
    </Card>
  );
}

function FollowUpSection({ appointmentId }: { appointmentId: string }) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-purple-600" /> Follow-up Plan
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Follow-up Date</Label>
          <Input type="date" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Follow-up Notes</Label>
          <Input placeholder="e.g. Review BP readings" className="mt-1" />
        </div>
      </div>
    </Card>
  );
}