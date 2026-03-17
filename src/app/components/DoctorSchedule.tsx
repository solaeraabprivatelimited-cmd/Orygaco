import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, ChevronLeft, Save, X, ToggleLeft, ToggleRight, Zap, Coffee, Info, AlertCircle, BarChart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function DoctorSchedule() {
  const { navigate, goBack } = useAppNavigate();
  const [schedule, setSchedule] = useState(mockSchedule);
  const [slotDuration, setSlotDuration] = useState('30');
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState('1');
  
  // -- NEW STATE --
  const [bufferRules, setBufferRules] = useState({ enabled: false, afterAppointments: 4, breakDuration: 15 });
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ date: new Date().toISOString().split('T')[0], time: '12:00', duration: 30 });
  const [slotInsights, setSlotInsights] = useState<any>(null);
  const [featureFlags, setFeatureFlags] = useState({
      autoBuffer: true,
      emergencySlots: true,
      slotInsights: true
  }); // Simulate Feature Flags (Default ON for demo)

  useEffect(() => {
      // Fetch initial data
      async function fetchData() {
          try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;
              
              const headers = { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token };

              // 1. Buffer Rules
              if (featureFlags.autoBuffer) {
                  fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/schedule/buffer-rules`, { headers })
                    .then(res => res.json())
                    .then(data => setBufferRules(data))
                    .catch(err => console.error(err));
              }

              // 2. Insights
              if (featureFlags.slotInsights) {
                  fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/schedule/insights`, { headers })
                    .then(res => res.json())
                    .then(data => setSlotInsights(data))
                    .catch(err => console.error(err));
              }
          } catch(e) { console.error(e); }
      }
      fetchData();
  }, [featureFlags]);

  const toggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled }
    });
  };

  const addTimeSlot = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: [...schedule[day].slots, { start: '09:00', end: '17:00' }]
      }
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: schedule[day].slots.filter((_, i) => i !== index)
      }
    });
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const updatedSlots = [...schedule[day].slots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], slots: updatedSlots }
    });
  };

  const saveBufferRules = async () => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/schedule/buffer-rules`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`, 
                  'X-Supabase-Auth': session.access_token 
              },
              body: JSON.stringify({ authToken: session.access_token, ...bufferRules })
          });
          toast.success("Buffer rules updated");
      } catch (e) {
          toast.error("Failed to save rules");
      }
  };

  const createEmergencySlot = async () => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          
          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/schedule/emergency-slot`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`, 
                  'X-Supabase-Auth': session.access_token 
              },
              body: JSON.stringify({ authToken: session.access_token, ...emergencyForm })
          });
          
          if (res.ok) {
              toast.success("Emergency slot added");
              setShowEmergencyModal(false);
          } else {
              toast.error("Failed to add slot");
          }
      } catch (e) {
          toast.error("Error creating slot");
      }
  };

  return (
    <div className="h-screen pt-[32px] pb-[64px] bg-background overflow-y-auto pr-[0px] pl-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Schedule Management</h1>
            <p className="text-muted-foreground">Manage your weekly availability and working hours</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {featureFlags.emergencySlots && (
                <Button variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100" onClick={() => setShowEmergencyModal(true)}>
                    <Zap className="w-4 h-4 mr-2" />
                    Add Emergency Slot
                </Button>
            )}
            <Button variant="outline" onClick={goBack} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button className="flex-1 sm:flex-none shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Schedule */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Schedule Settings (Enhanced) */}
            <Card className="p-6 border-l-4 border-l-primary shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Slot Configuration
              </h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="slotDuration" className="text-sm font-medium">Slot Duration (minutes)</Label>
                  <div className="relative">
                     <Input
                        id="slotDuration"
                        type="number"
                        value={slotDuration}
                        onChange={(e) => setSlotDuration(e.target.value)}
                        className="pl-10 h-11"
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBookings" className="text-sm font-medium">Max Patients per Slot</Label>
                   <div className="relative">
                      <Input
                        id="maxBookings"
                        type="number"
                        value={maxBookingsPerSlot}
                        onChange={(e) => setMaxBookingsPerSlot(e.target.value)}
                        className="pl-10 h-11"
                      />
                      <Badge variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 p-0 flex items-center justify-center border-0 text-muted-foreground">
                        #
                      </Badge>
                   </div>
                </div>
              </div>

              {/* Auto Buffer Toggle (Phase 1) */}
              {featureFlags.autoBuffer && (
                  <div className="pt-4 border-t border-border mt-2">
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                              <Coffee className="w-4 h-4 text-slate-500" />
                              <Label className="text-sm font-medium">Auto Break Management</Label>
                          </div>
                          <Switch 
                              checked={bufferRules.enabled} 
                              onCheckedChange={(checked) => {
                                  setBufferRules({...bufferRules, enabled: checked});
                                  // Auto-save logic could go here or on main Save
                              }} 
                          />
                      </div>
                      
                      {bufferRules.enabled && (
                          <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <span>Inject a</span>
                                  <Input 
                                      type="number" 
                                      className="w-16 h-8 text-center" 
                                      value={bufferRules.breakDuration}
                                      onChange={(e) => setBufferRules({...bufferRules, breakDuration: parseInt(e.target.value)})} 
                                  />
                                  <span>min break</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <span>after every</span>
                                  <Input 
                                      type="number" 
                                      className="w-16 h-8 text-center" 
                                      value={bufferRules.afterAppointments}
                                      onChange={(e) => setBufferRules({...bufferRules, afterAppointments: parseInt(e.target.value)})} 
                                  />
                                  <span>appointments.</span>
                              </div>
                              <Button size="sm" variant="ghost" className="col-span-2 text-xs text-primary h-6" onClick={saveBufferRules}>
                                  Update Rules
                              </Button>
                          </div>
                      )}
                  </div>
              )}
            </Card>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Weekly Availability</h2>
                <Button size="sm" variant="outline" className="text-xs">
                  Copy Mon to All
                </Button>
              </div>

              <div className="space-y-3">
                {daysOfWeek.map((day) => {
                  // Phase 2: Heatmap Overlay Logic (Visual Only)
                  const load = slotInsights?.heatmap?.[day]?.load;
                  const loadColor = load === 'HIGH' ? 'border-l-red-400' : (load === 'MEDIUM' ? 'border-l-amber-400' : 'border-l-green-400');
                  
                  return (
                  <Card 
                    key={day} 
                    className={`
                      transition-all duration-200 border-border/60
                      ${schedule[day].enabled 
                        ? `bg-white shadow-sm ring-1 ring-black/5 ${featureFlags.slotInsights ? `border-l-4 ${loadColor}` : ''}` 
                        : 'bg-slate-50 opacity-70 border-dashed'
                      }
                    `}
                  >
                    <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Day Toggle */}
                      <div className="flex items-center gap-4 min-w-[140px]">
                        <Switch
                          checked={schedule[day].enabled}
                          onCheckedChange={() => toggleDay(day)}
                          className="data-[state=checked]:bg-green-600"
                        />
                        <div className="flex flex-col">
                          <span className={`font-semibold ${schedule[day].enabled ? 'text-slate-900' : 'text-slate-500'}`}>
                            {day}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {schedule[day].enabled ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>

                      {/* Time Slots Area */}
                      <div className="flex-1 w-full">
                        {schedule[day].enabled ? (
                          <div className="space-y-3">
                            {schedule[day].slots.map((slot, index) => (
                              <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex-1 grid grid-cols-2 gap-3 max-w-md">
                                  <div className="relative">
                                    <Input
                                      type="time"
                                      value={slot.start}
                                      onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                                      className="h-10 text-center font-medium bg-slate-50/50"
                                    />
                                    <span className="absolute -top-2 left-2 bg-background px-1 text-[10px] text-muted-foreground">Start</span>
                                  </div>
                                  <div className="relative">
                                    <Input
                                      type="time"
                                      value={slot.end}
                                      onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                                      className="h-10 text-center font-medium bg-slate-50/50"
                                    />
                                    <span className="absolute -top-2 left-2 bg-background px-1 text-[10px] text-muted-foreground">End</span>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-10 w-10 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                  onClick={() => removeTimeSlot(day, index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addTimeSlot(day)}
                              className="text-primary hover:text-primary hover:bg-primary/5 h-8 px-2 text-xs font-medium"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1.5" />
                              Add Another Slot
                            </Button>
                          </div>
                        ) : (
                          <div className="h-full flex items-center text-sm text-muted-foreground italic pl-2 border-l-2 border-slate-200">
                            No slots configured for this day
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )})}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
             {/* Sticky Container */}
            <div className="sticky top-24 space-y-6">
              
              {/* Slot Insights (Phase 2) */}
              {featureFlags.slotInsights && slotInsights && (
                  <Card className="p-4 bg-slate-50 border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <BarChart className="w-4 h-4" /> Booking Insights
                      </h3>
                      <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Most Popular Hour</span>
                              <span className="font-medium text-slate-900">{slotInsights.mostBookedHour}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Avg Booking Delay</span>
                              <span className="font-medium text-slate-900">{slotInsights.avgBookingDelay}</span>
                          </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex items-start gap-1">
                          <Info className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>Heatmap colors indicate historical booking volume.</span>
                      </div>
                  </Card>
              )}

              {/* Summary Card */}
              <Card className="overflow-hidden border-border/60 shadow-md">
                <div className="bg-slate-900 text-white p-4">
                   <h3 className="font-semibold flex items-center gap-2">
                     <Calendar className="w-4 h-4" /> Schedule Summary
                   </h3>
                </div>
                <div className="p-5 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                     <div className="text-sm text-muted-foreground">Total Working Days</div>
                     <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-900">{Object.values(schedule).filter(day => day.enabled).length}</span>
                        <span className="text-sm text-muted-foreground">/ 7</span>
                     </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Total Weekly Hours</div>
                    <div className="text-3xl font-bold text-primary">
                      {Object.entries(schedule).reduce((total, [day, data]) => {
                        if (!data.enabled) return total;
                        const dayHours = data.slots.reduce((sum, slot) => {
                          const start = parseInt(slot.start.split(':')[0]);
                          const end = parseInt(slot.end.split(':')[0]);
                          return sum + (end - start);
                        }, 0);
                        return total + dayHours;
                      }, 0)}
                      <span className="text-base font-normal text-muted-foreground ml-1">hrs</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="text-xs font-medium uppercase text-muted-foreground mb-3">Service Status</div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-sm font-medium">New Patients</span>
                          <Switch defaultChecked className="scale-75" />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-sm font-medium">Video Consult</span>
                          <Switch defaultChecked className="scale-75" />
                        </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tips Card */}
              <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                   💡 Optimization Tips
                </h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-blue-800 leading-relaxed">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Consistent schedules help improve patient retention by 25%.
                  </li>
                  <li className="flex items-start gap-2 text-xs text-blue-800 leading-relaxed">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Add 10-min buffer times between slots to avoid delays.
                  </li>
                  <li className="flex items-start gap-2 text-xs text-blue-800 leading-relaxed">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Update holiday availability at least 2 weeks in advance.
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Slot Modal */}
      {showEmergencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <Card className="w-full max-w-sm p-6 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 border-2 border-amber-200">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" /> Emergency Slot
                      </h3>
                      <Button variant="ghost" size="icon" onClick={() => setShowEmergencyModal(false)}>
                          <X className="w-4 h-4" />
                      </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                      This slot will bypass standard availability checks and remain valid for booking for 2 hours.
                  </p>
                  <div className="space-y-4">
                      <div>
                          <Label>Date</Label>
                          <Input type="date" value={emergencyForm.date} onChange={e => setEmergencyForm({...emergencyForm, date: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <Label>Time</Label>
                              <Input type="time" value={emergencyForm.time} onChange={e => setEmergencyForm({...emergencyForm, time: e.target.value})} />
                          </div>
                          <div>
                              <Label>Duration (mins)</Label>
                              <Input type="number" value={emergencyForm.duration} onChange={e => setEmergencyForm({...emergencyForm, duration: parseInt(e.target.value)})} />
                          </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                          <Button variant="ghost" onClick={() => setShowEmergencyModal(false)}>Cancel</Button>
                          <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={createEmergencySlot}>Create Slot</Button>
                      </div>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

type ScheduleDay = { enabled: boolean; slots: { start: string; end: string }[] };
type Schedule = Record<string, ScheduleDay>;

const mockSchedule: Schedule = {
  Monday: { enabled: true, slots: [{ start: '09:00', end: '13:00' }, { start: '16:00', end: '20:00' }] },
  Tuesday: { enabled: true, slots: [{ start: '09:00', end: '13:00' }, { start: '16:00', end: '20:00' }] },
  Wednesday: { enabled: true, slots: [{ start: '09:00', end: '13:00' }] },
  Thursday: { enabled: true, slots: [{ start: '09:00', end: '13:00' }, { start: '16:00', end: '20:00' }] },
  Friday: { enabled: true, slots: [{ start: '09:00', end: '13:00' }, { start: '16:00', end: '20:00' }] },
  Saturday: { enabled: true, slots: [{ start: '10:00', end: '14:00' }] },
  Sunday: { enabled: false, slots: [] },
};