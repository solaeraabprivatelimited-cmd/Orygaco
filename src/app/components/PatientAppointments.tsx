import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Calendar, Clock, Video, User, Hash, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function PatientAppointments() {
  const { navigate } = useAppNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [doctorRating, setDoctorRating] = useState(0);
  const [appRating, setAppRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleRateClick = (apt: any) => {
    setSelectedAppointment(apt);
    setDoctorRating(0);
    setAppRating(0);
    setFeedback('');
    setIsRatingOpen(true);
  };

  const handleTokenClick = (apt: any) => {
    setSelectedAppointment(apt);
    setIsDetailsOpen(true);
  };

  const submitRating = async () => {
     // Here you would typically send the rating to your backend
     console.log({
        appointmentId: selectedAppointment?.id,
        doctorId: selectedAppointment?.doctorId,
        doctorRating,
        appRating,
        feedback
     });
     toast.success("Thank you for your feedback!");
     setIsRatingOpen(false);
  };

  useEffect(() => {
    async function fetchAppointments() {
      try {
        // Initial session check
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        let token = initialSession?.access_token;
        
        if (!token) {
           token = localStorage.getItem('authToken') || undefined;
        }

        if (!token) {
          console.log("No active session");
          setLoading(false);
          return;
        }

        const url = `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/appointments`;

        let response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Supabase-Auth': token
          }
        });

        // If 401, try to refresh the session and retry
        if (response.status === 401) {
          console.log("Received 401, attempting to refresh session...");
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshedSession && !refreshError) {
             token = refreshedSession.access_token;
             response = await fetch(url, {
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'X-Supabase-Auth': token
                }
             });
          } else {
             console.error("Failed to refresh session:", refreshError);
             toast.error("Session expired. Please log in again.");
             setLoading(false);
             return;
          }
        }

        if (response.ok) {
          const data = await response.json();
          setAppointments(data);
        } else {
           console.error("Failed to fetch appointments:", await response.text());
           toast.error("Failed to load appointments");
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[0px] pb-[96px] px-4 sm:px-6 lg:px-8 pr-[24px] pl-[24px]">
      <div className="max-w-5xl mx-[0px] space-y-6 px-[0px] py-[12px] my-[12px]">
        <div className="flex items-center justify-between mb-[16px] mt-[0px] mr-[0px] ml-[0px]">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your upcoming visits and history</p>
          </div>
          <Button size="sm" onClick={() => navigate('book-doctor')} className="shadow-sm">
            <Calendar className="w-4 h-4 mr-2" /> Book New
          </Button>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100 max-w-md mx-auto">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No appointments yet</h3>
            <p className="text-slate-500 text-sm max-w-[200px] mx-auto mb-6">
              Book your first appointment with a top specialist today.
            </p>
            <Button onClick={() => navigate('book-doctor')}>Find a Doctor</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((apt) => {
              const apptDate = new Date(apt.date);
              const today = new Date();
              today.setHours(0,0,0,0);
              const dateCheck = new Date(apptDate);
              dateCheck.setHours(0,0,0,0);
              
              // If date is strictly before today, it's completed (if not cancelled)
              const isDatePast = dateCheck < today;
              
              let displayStatus = apt.status;
              if (displayStatus === 'scheduled' && isDatePast) {
                  displayStatus = 'completed';
              }
              
              const isCompleted = displayStatus === 'completed' || displayStatus === 'Completed';

              return (
              <Card key={apt.id} className="p-5 border-none shadow-sm hover:shadow-md transition-all group bg-white flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary relative shrink-0">
                       <User className="w-6 h-6" />
                       {apt.token && (
                         <div 
                           className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border border-white cursor-pointer hover:bg-primary/90 transition-colors z-10"
                           onClick={(e) => { e.stopPropagation(); handleTokenClick(apt); }}
                         >
                           #{apt.token}
                         </div>
                       )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate pr-2" title={apt.doctor?.name}>{apt.doctor?.name || 'Doctor'}</h3>
                      <p className="text-xs text-slate-500 truncate">{apt.doctor?.specialty || 'General'}</p>
                    </div>
                  </div>
                  <Badge variant={displayStatus === 'scheduled' ? 'default' : (isCompleted ? 'outline' : 'secondary')} 
                         className={
                             displayStatus === 'scheduled' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 shrink-0" : 
                             (isCompleted ? "bg-slate-50 text-slate-600 border-slate-200 shrink-0" : "bg-slate-100 text-slate-700 shrink-0")
                         }>
                    {displayStatus === 'scheduled' ? 'Confirmed' : (isCompleted ? 'Completed' : displayStatus)}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="font-medium">{new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="font-medium">{apt.time}</span>
                  </div>
                  {apt.token && (
                     <div 
                       className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors text-slate-700"
                       onClick={(e) => { e.stopPropagation(); handleTokenClick(apt); }}
                     >
                       <Hash className="w-4 h-4 text-primary/60 shrink-0" />
                       <span className="font-medium">Token #{apt.token}</span>
                     </div>
                  )}
                </div>

                <div className="mt-auto flex gap-2 pt-2">
                   {apt.type === 'video' && !isCompleted && (
                     <Button className="flex-1" size="sm" variant="outline">
                       <Video className="w-4 h-4 mr-2" /> Join Call
                     </Button>
                   )}
                   {isCompleted ? (
                      <Button className="flex-1" size="sm" variant="outline" onClick={() => handleRateClick(apt)}>
                        <Star className="w-4 h-4 mr-2" /> Rate
                      </Button>
                   ) : (
                       (() => {
                          const apptDate = new Date(apt.date);
                          const limitDate = new Date(apptDate);
                          limitDate.setHours(10, 0, 0, 0);
                          const now = new Date();
                          const canReschedule = now < limitDate;

                          return (
                            <Button 
                              className="flex-1" 
                              size="sm" 
                              variant="outline" 
                              disabled={!canReschedule}
                              title={!canReschedule ? "Rescheduling is only allowed before 10 AM on the appointment day" : "Reschedule Appointment"}
                            >
                              Reschedule
                            </Button>
                          );
                       })()
                   )}
                   <Button size="sm" variant="ghost" className="px-2 text-slate-400" onClick={() => handleTokenClick(apt)}>Details</Button>
                </div>
              </Card>
            )})}
          </div>
        )}
        <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rate Experience</DialogTitle>
              <DialogDescription>
                Share your feedback about Dr. {selectedAppointment?.doctor?.name} and the app experience.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Rate Doctor</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`p-1 rounded-full transition-colors ${doctorRating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
                      onClick={() => setDoctorRating(star)}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Rate App Experience</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`p-1 rounded-full transition-colors ${appRating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
                      onClick={() => setAppRating(star)}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Additional Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us more about your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRatingOpen(false)}>Cancel</Button>
              <Button onClick={submitRating} disabled={!doctorRating || !appRating}>Submit Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Viewing details for appointment #{selectedAppointment?.id ? String(selectedAppointment.id).slice(0, 8) : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-xl border border-primary/10 mb-2">
                 <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Token Number</span>
                 <span className="text-4xl font-bold text-primary">#{selectedAppointment?.token}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Doctor</Label>
                   <div className="font-medium">{selectedAppointment?.doctor?.name}</div>
                   <div className="text-xs text-slate-500">{selectedAppointment?.doctor?.specialty}</div>
                </div>
                <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Status</Label>
                   <Badge variant={selectedAppointment?.status === 'scheduled' ? 'default' : 'secondary'} className="w-fit">
                     {selectedAppointment?.status}
                   </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Date</Label>
                   <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {selectedAppointment?.date ? new Date(selectedAppointment.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : '-'}
                   </div>
                </div>
                <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Time</Label>
                   <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {selectedAppointment?.time}
                   </div>
                </div>
              </div>

              <div className="space-y-1">
                 <Label className="text-xs text-muted-foreground">Location</Label>
                 <div className="text-sm">{selectedAppointment?.doctor?.hospital || selectedAppointment?.doctor?.location || 'Main Hospital Branch'}</div>
              </div>

              {selectedAppointment?.type === 'video' && (
                <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-start gap-2">
                  <Video className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium block">Video Consultation</span>
                    The link will be active 15 minutes before the appointment time.
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}