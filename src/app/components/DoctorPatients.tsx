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
import { useAppNavigate } from '../hooks/useAppNavigate';

type ViewMode = 'list' | 'detail';

export function DoctorPatients() {
  const { navigate, goBack } = useAppNavigate();
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
              const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/patients/index`, {
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
          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/patients/${id}/metadata`, {
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
             <Button variant="ghost" onClick={goBack} className="w-fit pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
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

const mockPatients = [
  {
    id: '1', name: 'Rajesh Kumar', age: 45, gender: 'Male', phone: '+91 98765 43210',
    email: 'rajesh@example.com', bloodGroup: 'O+', image: '',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    currentMedications: ['Amlodipine 5mg', 'Metformin 500mg'],
    lastVisit: '2025-12-15', totalVisits: 12,
    consultations: [
      { date: '2025-12-15', diagnosis: 'Routine BP Check', type: 'In-person', status: 'Completed', complaint: 'Headache', outcome: 'Stable' },
      { date: '2025-11-10', diagnosis: 'Diabetes Review', type: 'Video', status: 'Completed', complaint: 'Fatigue', outcome: 'Improved' },
    ],
    vitalHistory: [
      { date: '2025-12-15', bp: '135/88', pulse: '82', bmi: '27.5' },
      { date: '2025-11-10', bp: '128/82', pulse: '78', bmi: '27.2' },
    ],
  },
  {
    id: '2', name: 'Priya Nair', age: 32, gender: 'Female', phone: '+91 87654 32109',
    email: 'priya@example.com', bloodGroup: 'A+', image: '',
    conditions: ['Asthma'],
    currentMedications: ['Salbutamol Inhaler'],
    lastVisit: '2025-12-20', totalVisits: 5,
    consultations: [
      { date: '2025-12-20', diagnosis: 'Seasonal Asthma Flare', type: 'Video', status: 'Completed', complaint: 'Breathlessness', outcome: 'Treated' },
    ],
    vitalHistory: [
      { date: '2025-12-20', bp: '118/76', pulse: '88', bmi: '22.1' },
    ],
  },
  {
    id: '3', name: 'Amit Patel', age: 58, gender: 'Male', phone: '+91 76543 21098',
    email: 'amit@example.com', bloodGroup: 'B+', image: '',
    conditions: ['Coronary Artery Disease', 'Hyperlipidemia'],
    currentMedications: ['Atorvastatin 20mg', 'Aspirin 75mg', 'Metoprolol 50mg'],
    lastVisit: '2025-12-18', totalVisits: 20,
    consultations: [
      { date: '2025-12-18', diagnosis: 'Post-Angioplasty Follow-up', type: 'In-person', status: 'Completed', complaint: 'Chest discomfort', outcome: 'Stable' },
    ],
    vitalHistory: [
      { date: '2025-12-18', bp: '142/92', pulse: '95', bmi: '29.8' },
      { date: '2025-11-20', bp: '138/88', pulse: '90', bmi: '29.5' },
    ],
  },
];

function RiskCard({ patientId, risk, onUpdate }: { patientId: string; risk: any; onUpdate: () => void }) {
  return (
    <Card className={`p-4 border-l-4 ${risk?.level === 'HIGH' ? 'border-l-red-500' : risk?.level === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-green-500'}`}>
      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Risk Level
      </h4>
      <Badge className={risk?.level === 'HIGH' ? 'bg-red-100 text-red-800' : risk?.level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
        {risk?.level || 'LOW'}
      </Badge>
      {risk?.reason && <p className="text-xs text-muted-foreground mt-2">{risk.reason}</p>}
    </Card>
  );
}

function FollowUpCard({ patientId, followup, onUpdate }: { patientId: string; followup: any; onUpdate: () => void }) {
  return (
    <Card className="p-4">
      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
        <Calendar className="w-3 h-3" /> Follow-up
      </h4>
      {followup?.date ? (
        <div className="text-sm">
          <div className="font-medium">{new Date(followup.date).toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">{followup.notes || 'Scheduled'}</div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No follow-up scheduled</p>
      )}
    </Card>
  );
}

function DoctorNotesCard({ patientId, notes, onUpdate }: { patientId: string; notes: any[]; onUpdate: () => void }) {
  return (
    <Card className="p-4">
      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
        <FileText className="w-3 h-3" /> Notes
      </h4>
      {notes && notes.length > 0 ? (
        <div className="text-xs text-muted-foreground space-y-1">
          {notes.slice(0, 2).map((note: any, i: number) => (
            <p key={i}>{note.text || note}</p>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No notes yet</p>
      )}
    </Card>
  );
}