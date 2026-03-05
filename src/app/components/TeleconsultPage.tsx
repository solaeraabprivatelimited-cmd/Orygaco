import { useState, useEffect, useRef } from 'react';
import { Video, Phone, Mic, MicOff, MoreVertical, FileText, MessageSquare, Clock, Heart, Activity, Thermometer, User, Wifi, Maximize2, Minimize2, ChevronRight, Save, X, Stethoscope, Pill, History } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { useAuth } from '../contexts/AuthContext';

interface TeleconsultPageProps {
  appointmentId?: string;
  patientId?: string;
}

export function TeleconsultPage({ appointmentId = 'mock-apt-1', patientId = 'mock-patient-1' }: TeleconsultPageProps) {
  const { navigate } = useAppNavigate();
  const { userRole } = useAuth();
  const userType = userRole === 'doctor' ? 'doctor' : 'patient';

  // State
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'Good' | 'Poor'>('Good');
  const [vitals, setVitals] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Mock Patient Data (Fallback)
  const patientData = {
      name: "Arjun Mehta",
      age: 34,
      gender: "Male",
      bloodGroup: "O+",
      conditions: ["Hypertension", "Asthma"],
      allergies: ["Penicillin"],
      medications: ["Amlodipine 5mg", "Inhaler SOS"],
      lastVisit: "12 Dec 2024"
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const notesTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
      // Start Call Timer
      timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
      }, 1000);

      // Start Session Backend
      startSession();

      // Fetch existing data
      fetchNotes();
      fetchVitals();

      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
          if (notesTimerRef.current) clearInterval(notesTimerRef.current);
      };
  }, []);

  // Auto-save notes every 10s
  useEffect(() => {
      if (notesTimerRef.current) clearInterval(notesTimerRef.current);
      notesTimerRef.current = setInterval(() => {
          if (notes) saveNotes(true);
      }, 10000);
  }, [notes]);

  // --- API CALLS ---

  async function startSession() {
      if (userType !== 'doctor') return;
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/teleconsultation/start`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'X-Supabase-Auth': session.access_token
              },
              body: JSON.stringify({ authToken: session.access_token, appointmentId, doctorId: session.user.id, patientId })
          });
          
          if (res.ok) {
              const data = await res.json();
              setSessionId(data.session.id);
          }
      } catch (e) { console.error("Session start error", e); }
  }

  async function endCall() {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && sessionId) {
              await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/teleconsultation/end`, {
                  method: 'PATCH',
                  headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`,
                      'X-Supabase-Auth': session.access_token
                  },
                  body: JSON.stringify({ authToken: session.access_token, sessionId, duration: callDuration, networkQuality })
              });
          }
          // Save final notes
          await saveNotes(false);
          
          toast.success("Consultation Completed");
          navigate('doctor-appointments');
      } catch (e) {
          console.error("End call error", e);
          navigate('doctor-appointments'); // Fallback navigation
      }
  }

  async function fetchNotes() {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/doctor-notes/${appointmentId}`, {
              headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token }
          });
          if (res.ok) {
              const data = await res.json();
              if (data.notes) setNotes(data.notes);
          }
      } catch (e) {}
  }

  async function saveNotes(silent = false) {
      if (!notes.trim()) return;
      setIsSavingNotes(true);
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/doctor-notes/save`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'X-Supabase-Auth': session.access_token
              },
              body: JSON.stringify({ authToken: session.access_token, appointmentId, notes })
          });
          if (!silent) toast.success("Notes saved");
      } catch (e) {
          if (!silent) toast.error("Failed to save notes");
      } finally {
          setIsSavingNotes(false);
      }
  }

  async function fetchVitals() {
      // Mock fetch - in real app would hit an endpoint
      setVitals({
          bp: "120/80",
          pulse: 72,
          temp: 98.6,
          spo2: 98,
          weight: 70
      });
  }

  // --- HELPERS ---

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen pt-24 pb-4 bg-background overflow-hidden flex flex-col">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 h-full flex flex-col">
        <div className="flex-1 grid lg:grid-cols-12 gap-4 h-full min-h-0">
          
          {/* LEFT PANEL: VIDEO & CONTROLS (Persistent) */}
          <div className={`lg:col-span-8 flex flex-col h-full gap-4 transition-all duration-300`}>
            {/* Video Container */}
            <Card className="flex-1 overflow-hidden relative bg-black flex flex-col justify-center items-center rounded-xl shadow-2xl border-0">
               {/* Remote Stream */}
               <div className="absolute inset-0 w-full h-full">
                 {videoOn ? (
                    <img
                        src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2070&auto=format&fit=crop"
                        alt="Patient Video"
                        className="w-full h-full object-cover opacity-90"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <User className="w-24 h-24 text-slate-700" />
                    </div>
                 )}
               </div>

               {/* Overlays */}
               <div className="absolute top-4 left-4 flex gap-2">
                   <Badge className="bg-red-500/90 text-white border-0 animate-pulse px-3 py-1">
                       ● Live
                   </Badge>
                   <Badge variant="secondary" className="bg-black/40 backdrop-blur-md text-white border-white/10 flex items-center gap-2">
                       <Clock className="w-3 h-3" /> {formatTime(callDuration)}
                   </Badge>
               </div>

               <div className="absolute top-4 right-4">
                   <Badge variant="outline" className={`bg-black/40 backdrop-blur-md border-white/10 flex items-center gap-1.5 ${networkQuality === 'Good' ? 'text-green-400' : 'text-amber-400'}`}>
                       <Wifi className="w-3 h-3" /> {networkQuality}
                   </Badge>
               </div>

               <div className="absolute bottom-4 left-4 text-white drop-shadow-md">
                   <h3 className="text-lg font-bold">{patientData.name}</h3>
                   <p className="text-sm opacity-80">{patientData.age}y • {patientData.gender}</p>
               </div>

               {/* Self View (PIP) */}
               <div className="absolute bottom-4 right-4 w-48 aspect-video bg-slate-800 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl">
                   <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                       <span className="text-4xl">👨‍⚕️</span>
                   </div>
               </div>
            </Card>

            {/* Controls Bar */}
            <Card className="p-4 bg-slate-900 border-slate-800 rounded-xl shrink-0">
               <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
                   <div className="flex items-center gap-4">
                       <Button 
                          variant={micOn ? "secondary" : "destructive"} 
                          size="icon" 
                          className="h-12 w-12 rounded-full"
                          onClick={() => setMicOn(!micOn)}
                       >
                           {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                       </Button>
                       <Button 
                          variant={videoOn ? "secondary" : "destructive"} 
                          size="icon" 
                          className="h-12 w-12 rounded-full"
                          onClick={() => setVideoOn(!videoOn)}
                       >
                           {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                       </Button>
                   </div>

                   <Button 
                      variant="destructive" 
                      size="lg" 
                      className="px-8 rounded-full font-semibold shadow-red-900/20"
                      onClick={endCall}
                   >
                       <Phone className="w-5 h-5 mr-2" /> End Consultation
                   </Button>

                   <div className="flex items-center gap-4">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
                           <MoreVertical className="w-5 h-5" />
                       </Button>
                   </div>
               </div>
            </Card>
          </div>

          {/* RIGHT PANEL: CONTEXT & TOOLS */}
          <div className="lg:col-span-4 h-full flex flex-col min-h-0 bg-white rounded-xl border border-border overflow-hidden shadow-sm">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <div className="px-4 pt-4 pb-2 border-b bg-slate-50/50">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-200/50">
                        <TabsTrigger value="patient"><User className="w-4 h-4" /></TabsTrigger>
                        <TabsTrigger value="notes"><FileText className="w-4 h-4" /></TabsTrigger>
                        <TabsTrigger value="vitals"><Activity className="w-4 h-4" /></TabsTrigger>
                        <TabsTrigger value="rx"><Pill className="w-4 h-4" /></TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {/* 1. PATIENT SNAPSHOT TAB */}
                    <TabsContent value="patient" className="h-full m-0">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 pb-4 border-b">
                                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                                        {patientData.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{patientData.name}</h2>
                                        <div className="flex gap-2 text-sm text-slate-500 mt-1">
                                            <span>{patientData.age} yrs</span>
                                            <span>•</span>
                                            <span>{patientData.gender}</span>
                                            <span>•</span>
                                            <span className="font-semibold text-slate-700">{patientData.bloodGroup}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Known Conditions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {patientData.conditions.map((c, i) => (
                                            <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700">{c}</Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Allergies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {patientData.allergies.map((a, i) => (
                                            <Badge key={i} variant="destructive" className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100">{a}</Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Current Medications</h3>
                                    <ul className="space-y-2">
                                        {patientData.medications.map((m, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600 p-2 bg-slate-50 rounded border border-slate-100">
                                                <Pill className="w-3 h-3 text-blue-500" /> {m}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* 2. DOCTOR NOTES TAB */}
                    <TabsContent value="notes" className="h-full m-0 flex flex-col p-4">
                         <div className="flex items-center justify-between mb-2">
                             <Label className="text-sm font-medium text-slate-700">Clinical Notes (Private)</Label>
                             <div className="flex items-center gap-2">
                                 {isSavingNotes && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
                                 <Button size="sm" variant="ghost" onClick={() => saveNotes(false)} className="h-7 text-xs">
                                     <Save className="w-3 h-3 mr-1" /> Save
                                 </Button>
                             </div>
                         </div>
                         <Textarea 
                             className="flex-1 resize-none bg-yellow-50/30 border-yellow-200 focus:border-yellow-400 font-mono text-sm leading-relaxed"
                             placeholder="Type clinical observations here..."
                             value={notes}
                             onChange={(e) => setNotes(e.target.value)}
                         />
                         <p className="text-[10px] text-muted-foreground mt-2 text-right">
                             Last saved: {new Date().toLocaleTimeString()}
                         </p>
                    </TabsContent>

                    {/* 3. VITALS TAB */}
                    <TabsContent value="vitals" className="h-full m-0">
                        <ScrollArea className="h-full p-4">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Latest Readings
                            </h3>
                            {vitals ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Card className="p-3 border-l-4 border-l-blue-500">
                                        <div className="text-xs text-muted-foreground">Blood Pressure</div>
                                        <div className="text-xl font-bold text-slate-900">{vitals.bp}</div>
                                        <div className="text-[10px] text-green-600">Normal range</div>
                                    </Card>
                                    <Card className="p-3 border-l-4 border-l-red-400">
                                        <div className="text-xs text-muted-foreground">Pulse Rate</div>
                                        <div className="text-xl font-bold text-slate-900">{vitals.pulse} <span className="text-sm font-normal text-slate-500">bpm</span></div>
                                    </Card>
                                    <Card className="p-3 border-l-4 border-l-amber-400">
                                        <div className="text-xs text-muted-foreground">SpO₂</div>
                                        <div className="text-xl font-bold text-slate-900">{vitals.spo2}%</div>
                                    </Card>
                                    <Card className="p-3 border-l-4 border-l-green-500">
                                        <div className="text-xs text-muted-foreground">Temperature</div>
                                        <div className="text-xl font-bold text-slate-900">{vitals.temp}°F</div>
                                    </Card>
                                    <Card className="p-3 col-span-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-xs text-muted-foreground">Weight</div>
                                                <div className="text-lg font-bold">{vitals.weight} kg</div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 text-xs">Update</Button>
                                        </div>
                                    </Card>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    No vitals recorded recently.
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* 4. PRESCRIPTION TAB (Inline) */}
                    <TabsContent value="rx" className="h-full m-0 flex flex-col p-4">
                        <div className="flex-1 space-y-4">
                            <div>
                                <Label>Search Medicine</Label>
                                <Input placeholder="e.g. Paracetamol 500mg" className="mt-1.5" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Dosage</Label>
                                    <Input placeholder="1-0-1" className="mt-1.5" />
                                </div>
                                <div>
                                    <Label>Duration</Label>
                                    <Input placeholder="5 Days" className="mt-1.5" />
                                </div>
                            </div>
                            <div>
                                <Label>Instructions</Label>
                                <Input placeholder="After food" className="mt-1.5" />
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <Save className="w-4 h-4 mr-2" /> Add to Prescription
                            </Button>
                            
                            <div className="pt-4 border-t mt-4">
                                <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Added Items</h4>
                                <div className="bg-slate-50 p-3 rounded text-center text-sm text-slate-400 italic">
                                    Prescription list is empty.
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </div>
             </Tabs>
          </div>

        </div>
      </div>
    </div>
  );
}

function VideoOff({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    )
}