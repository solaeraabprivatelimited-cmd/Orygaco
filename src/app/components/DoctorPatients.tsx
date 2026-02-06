import { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, User, Phone, Mail, Calendar, FileText, Download, TrendingUp, Activity, Heart, AlertTriangle, Clock, Flag, MoreHorizontal, Check, Plus, Edit2, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface DoctorPatientsProps {
  onNavigate: (view: string) => void;
  onBack: () => void;
}

type ViewMode = 'list' | 'detail';

// Mock Data (Static base)
const mockPatients = [
  {
    id: "1",
    name: "Arjun Mehta",
    age: 32,
    gender: "Male",
    phone: "+91 98765 43210",
    email: "arjun.mehta@email.com",
    bloodGroup: "O+",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    lastVisit: "2024-12-20",
    totalVisits: 8,
    conditions: ["Hypertension", "Mild Anxiety"],
    currentMedications: ["Metoprolol 50mg", "Aspirin 75mg"],
    consultations: [
      { date: "2024-12-20", type: "Video", diagnosis: "Routine checkup", status: "Completed", outcome: "Resolved", complaint: "Mild headache" },
      { date: "2024-11-15", type: "In-person", diagnosis: "BP monitoring", status: "Completed", outcome: "Ongoing", complaint: "BP fluctuation" },
      { date: "2024-10-10", type: "Video", diagnosis: "Follow-up", status: "Completed", outcome: "Resolved", complaint: "General wellness" }
    ],
    vitalHistory: [
      { date: "2024-12-20", bp: "128/82", pulse: "76", weight: "78", bmi: "24.5" },
      { date: "2024-11-15", bp: "132/85", pulse: "78", weight: "79", bmi: "24.8" },
      { date: "2024-10-10", bp: "135/88", pulse: "80", weight: "80", bmi: "25.1" }
    ]
  },
  {
    id: "2",
    name: "Priya Sharma",
    age: 28,
    gender: "Female",
    phone: "+91 98765 43211",
    email: "priya.sharma@email.com",
    bloodGroup: "A+",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    lastVisit: "2024-12-22",
    totalVisits: 5,
    conditions: ["Post-cardiac procedure"],
    currentMedications: ["Clopidogrel 75mg", "Atorvastatin 20mg"],
    consultations: [
      { date: "2024-12-22", type: "In-person", diagnosis: "Post-procedure checkup", status: "Completed", outcome: "Ongoing", complaint: "Checkup" },
      { date: "2024-12-01", type: "Video", diagnosis: "Recovery monitoring", status: "Completed", outcome: "Resolved", complaint: "Pain in chest" }
    ],
    vitalHistory: [
      { date: "2024-12-22", bp: "120/78", pulse: "72", weight: "62", bmi: "22.1" },
      { date: "2024-12-01", bp: "122/80", pulse: "74", weight: "63", bmi: "22.4" }
    ]
  }
];

function RiskCard({ patientId, risk, onUpdate }: { patientId: string, risk: any, onUpdate: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [level, setLevel] = useState(risk?.level || 'LOW');
    const [reason, setReason] = useState(risk?.reason || '');

    const handleSave = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/patients/${patientId}/risk`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`
                },
                body: JSON.stringify({ authToken: session.access_token, level, reason })
            });

            if (res.ok) {
                toast.success('Risk profile updated');
                setIsEditing(false);
                onUpdate();
            }
        } catch (e) {
            toast.error('Failed to update risk');
        }
    };

    const getRiskColor = (l: string) => {
        switch(l) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    return (
        <Card className="p-4 border-l-4 border-l-slate-400">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-700" />
                    Risk Priority
                </h3>
                {!isEditing && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        {['LOW', 'MEDIUM', 'HIGH'].map((l) => (
                            <button
                                key={l}
                                onClick={() => setLevel(l)}
                                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                    level === l 
                                    ? 'bg-slate-900 text-white border-slate-900' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                    <Textarea 
                        placeholder="Risk assessment notes..." 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)}
                        className="text-xs min-h-[60px]"
                    />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleSave}>Save</Button>
                    </div>
                </div>
            ) : (
                <div>
                    <Badge className={`mb-2 ${getRiskColor(risk?.level || 'LOW')}`}>
                        {risk?.level || 'LOW'} RISK
                    </Badge>
                    {risk?.reason && (
                        <p className="text-xs text-muted-foreground bg-slate-50 p-2 rounded border border-slate-100">
                            {risk.reason}
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
}

function DoctorNotesCard({ patientId, notes, onUpdate }: { patientId: string, notes: any[], onUpdate: () => void }) {
    const [newNote, setNewNote] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/patients/${patientId}/notes`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`
                },
                body: JSON.stringify({ authToken: session.access_token, note: newNote })
            });

            if (res.ok) {
                toast.success('Note added');
                setNewNote('');
                setIsAdding(false);
                onUpdate();
            }
        } catch (e) {
            toast.error('Failed to add note');
        }
    };

    return (
        <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Private Notes
                </h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsAdding(!isAdding)}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {isAdding && (
                <div className="mb-4 space-y-2">
                    <Textarea 
                        placeholder="Type internal note..." 
                        value={newNote} 
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-[80px] bg-blue-50/30"
                    />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleAddNote}>Add Note</Button>
                    </div>
                </div>
            )}

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {notes?.length === 0 && !isAdding && (
                    <p className="text-xs text-muted-foreground italic">No notes yet.</p>
                )}
                {notes?.map((note: any) => (
                    <div key={note.id} className="text-sm bg-slate-50 p-2 rounded border border-slate-100">
                        <p className="mb-1 text-slate-800 whitespace-pre-wrap">{note.text}</p>
                        <p className="text-[10px] text-slate-400 text-right">
                            {new Date(note.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function FollowUpCard({ patientId, followup, onUpdate }: { patientId: string, followup: any, onUpdate: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [date, setDate] = useState(followup?.date || '');
    const [status, setStatus] = useState(followup?.status || 'DUE');
    const [notes, setNotes] = useState(followup?.notes || '');

    const handleSave = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/patients/${patientId}/followup`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`
                },
                body: JSON.stringify({ authToken: session.access_token, date, status, notes })
            });

            if (res.ok) {
                toast.success('Follow-up updated');
                setIsEditing(false);
                onUpdate();
            }
        } catch (e) {
            toast.error('Failed to update follow-up');
        }
    };

    return (
        <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <Flag className="w-4 h-4 text-purple-600" />
                    Follow-up
                </h3>
                {!isEditing && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-[10px]">Date</Label>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div>
                            <Label className="text-[10px]">Status</Label>
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-8 text-xs rounded-md border border-input bg-background px-3 py-1"
                            >
                                <option value="DUE">Due</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="OVERDUE">Overdue</option>
                            </select>
                        </div>
                    </div>
                    <Input 
                        placeholder="Note..." 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        className="h-8 text-xs"
                    />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleSave}>Save</Button>
                    </div>
                </div>
            ) : (
                <div>
                    {followup ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {new Date(followup.date).toLocaleDateString()}
                                </span>
                                <Badge variant="outline" className={
                                    followup.status === 'OVERDUE' ? 'bg-red-50 text-red-700' : 
                                    followup.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 
                                    'bg-blue-50 text-blue-700'
                                }>
                                    {followup.status}
                                </Badge>
                            </div>
                            {followup.notes && <p className="text-xs text-muted-foreground">{followup.notes}</p>}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">No follow-up scheduled.</p>
                    )}
                </div>
            )}
        </Card>
    );
}

export function DoctorPatients({ onNavigate, onBack }: DoctorPatientsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [patientIndex, setPatientIndex] = useState<any>({});
  const [currentMetadata, setCurrentMetadata] = useState<any>({ risk: null, notes: [], followup: null });

  // 1. Fetch Patient Index for Filtering
  useEffect(() => {
      async function fetchIndex() {
          try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;
              const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/doctor/patients/index`, {
                  headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token }
              });
              if (res.ok) {
                  setPatientIndex(await res.json());
              }
          } catch (e) { console.error(e); }
      }
      fetchIndex();
  }, []);

  // 2. Fetch Metadata for Selected Patient
  const fetchMetadata = async (id: string) => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/patients/${id}/metadata`, {
              headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token }
          });
          if (res.ok) {
              setCurrentMetadata(await res.json());
          }
      } catch (e) { console.error(e); }
  };

  const handleViewDetails = (patient: any) => {
    setSelectedPatient(patient);
    fetchMetadata(patient.id);
    setViewMode('detail');
  };

  // Smart Filtering Logic
  const filteredPatients = mockPatients.filter(patient => {
    // Search
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.phone.includes(searchQuery) ||
                          patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Index-based Filters
    const meta = patientIndex[patient.id] || {};
    if (activeFilter === 'high_risk') return meta.risk === 'HIGH';
    if (activeFilter === 'chronic') return patient.conditions.length > 0;
    if (activeFilter === 'followup') return meta.followupStatus === 'DUE' || meta.followupStatus === 'OVERDUE';
    if (activeFilter === 'recent') return true; // TODO: Check last visit date logic

    return true;
  });

  if (viewMode === 'detail' && selectedPatient) {
    return (
      <div className="h-screen pt-24 pb-16 bg-background overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Medical Records
              </Button>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Profile */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <img
                    src={selectedPatient.image}
                    alt={selectedPatient.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl mb-2">{selectedPatient.name}</h2>
                        {currentMetadata.risk?.level === 'HIGH' && (
                            <Badge className="bg-red-600 hover:bg-red-700 animate-pulse">HIGH RISK</Badge>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Age:</span>{' '}
                        <span className="font-medium">{selectedPatient.age} years</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gender:</span>{' '}
                        <span className="font-medium">{selectedPatient.gender}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Blood Group:</span>{' '}
                        <span className="font-medium">{selectedPatient.bloodGroup}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">{selectedPatient.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Medical Conditions</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.conditions.map((condition: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-red-50 border-red-200 text-red-800">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Current Medications</div>
                    <div className="text-sm space-y-1">
                      {selectedPatient.currentMedications.map((med: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                            {med}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Advanced Cards Grid */}
              <div className="grid sm:grid-cols-3 gap-4">
                  <RiskCard 
                    patientId={selectedPatient.id} 
                    risk={currentMetadata.risk} 
                    onUpdate={() => fetchMetadata(selectedPatient.id)} 
                  />
                  <FollowUpCard 
                    patientId={selectedPatient.id} 
                    followup={currentMetadata.followup} 
                    onUpdate={() => fetchMetadata(selectedPatient.id)} 
                  />
                  <DoctorNotesCard 
                    patientId={selectedPatient.id} 
                    notes={currentMetadata.notes} 
                    onUpdate={() => fetchMetadata(selectedPatient.id)} 
                  />
              </div>

              {/* Consultation History */}
              <Card className="p-6">
                <h3 className="text-xl mb-4">Consultation History</h3>
                <div className="space-y-3">
                  {selectedPatient.consultations.map((consultation: any, index: number) => (
                    <Card key={index} className="p-4 bg-accent/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium mb-1">{consultation.diagnosis}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(consultation.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                          {/* New Outcome/Complaint Fields */}
                          {consultation.complaint && (
                              <div className="text-xs text-slate-500 mt-1">
                                  <span className="font-medium text-slate-700">Complaint:</span> {consultation.complaint}
                              </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2">
                            {consultation.type}
                          </Badge>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                {consultation.status}
                            </Badge>
                            {consultation.outcome && (
                                <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100">
                                    {consultation.outcome}
                                </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Vital Signs Trend (Highlighted) */}
              <Card className="p-6">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Vital Signs Trend
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">BP</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Pulse</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">BMI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPatient.vitalHistory.map((vital: any, index: number) => {
                          const sys = parseInt(vital.bp.split('/')[0]);
                          const dia = parseInt(vital.bp.split('/')[1]);
                          const isBpHigh = sys > 130 || dia > 85;
                          const isPulseHigh = parseInt(vital.pulse) > 90;

                          return (
                            <tr key={index} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm">
                                {new Date(vital.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </td>
                            <td className="py-3 text-sm font-medium">
                                <span className={isBpHigh ? "text-red-600 font-bold bg-red-50 px-1 rounded" : ""}>
                                    {vital.bp}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">mmHg</span>
                            </td>
                            <td className="py-3 text-sm font-medium">
                                <span className={isPulseHigh ? "text-red-600 font-bold bg-red-50 px-1 rounded" : ""}>
                                    {vital.pulse}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">bpm</span>
                            </td>
                            <td className="py-3 text-sm font-medium">{vital.bmi}</td>
                            </tr>
                          );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-5">
                <h3 className="text-lg mb-4">Patient Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Visit</div>
                      <div className="font-medium">
                        {new Date(selectedPatient.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Visits</div>
                      <div className="font-medium">{selectedPatient.totalVisits} consultations</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="h-screen pt-[32px] pb-[64px] bg-background overflow-y-auto pr-[0px] pl-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div>
             <Button variant="ghost" onClick={onBack} className="w-fit pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">My Patients</h1>
              <p className="text-muted-foreground">Manage your patient records and medical history</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs (NEW) */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-6">
            <TabsList className="bg-transparent p-0 gap-4 overflow-x-auto justify-start w-full">
                {['all', 'recent', 'high_risk', 'chronic', 'followup'].map(tab => (
                    <TabsTrigger 
                        key={tab} 
                        value={tab}
                        className="rounded-full border border-slate-200 bg-white data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2 h-auto"
                    >
                        {tab === 'high_risk' ? 'High Risk' : tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>

        {/* Search and Stats */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <Card className="flex-1 p-1 flex items-center shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 shadow-none focus-visible:ring-0 h-12 text-base"
              />
            </div>
          </Card>
        </div>

        {/* Patients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="group hover:shadow-lg transition-all duration-300 border-border/60 flex flex-col overflow-hidden">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                   <div className="relative">
                      <img
                        src={patient.image}
                        alt={patient.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-background shadow-sm group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Risk Badge on List Item if High Risk */}
                      {patientIndex[patient.id]?.risk === 'HIGH' && (
                          <div className="absolute -top-1 -right-1">
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                              </span>
                          </div>
                      )}
                   </div>
                   <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Phone className="w-4 h-4" />
                   </Button>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-primary transition-colors">{patient.name}</h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{patient.age} Years</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{patient.gender}</span>
                  </div>
                </div>

                {/* Tags row */}
                <div className="flex gap-1 flex-wrap mb-4">
                    {patientIndex[patient.id]?.followupStatus === 'DUE' && (
                        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">Follow-up Due</Badge>
                    )}
                    {patientIndex[patient.id]?.risk && patientIndex[patient.id]?.risk !== 'LOW' && (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">{patientIndex[patient.id]?.risk} Risk</Badge>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Last Visit</div>
                    <div className="text-sm font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary/70" />
                      {new Date(patient.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Visits</div>
                    <div className="text-sm font-medium flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      {patient.totalVisits} Total
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50/50 border-t border-border/50 mt-auto">
                <Button
                  className="w-full shadow-sm bg-white hover:bg-slate-50 text-primary border border-primary/20 hover:border-primary/50"
                  variant="outline"
                  onClick={() => handleViewDetails(patient)}
                >
                  View Medical Records
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}