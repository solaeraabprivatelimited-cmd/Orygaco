import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Users, Calendar, Briefcase, Activity, TrendingUp, TrendingDown, Clock, FileText, DollarSign, Plus, Trash2, Ban, CheckCircle, AlertTriangle, AlertCircle, Search, Building, ChevronRight, ChevronLeft, MapPin, Settings, Phone, User, RefreshCw, Copy, ShieldAlert, PauseCircle, PlayCircle, StopCircle, CreditCard } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { VerificationBadge } from './ui/VerificationBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useEffect, useState, lazy, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DoctorManagementModal } from './hospital/DoctorManagementModal';
import { StaffManagement } from './hospital/StaffManagement';
import { HospitalProfile } from './hospital/HospitalProfile';
import { HospitalAnalytics } from './hospital/HospitalAnalytics';
import { useSecurity, PERMISSIONS } from '../contexts/SecurityContext';
import { format } from "date-fns";
import { cn } from "./ui/utils";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const HospitalProfileSettings = lazy(() => import('./hospital/HospitalProfileSettings').then(module => ({ default: module.HospitalProfileSettings })));

interface HospitalAdminProps {
  onNavigate: (view: string) => void;
  isAuthenticated: boolean;
  userRole: 'guest' | 'patient' | 'doctor' | 'hospital';
}

export function HospitalAdmin({ onNavigate, isAuthenticated, userRole }: HospitalAdminProps) {
  const { checkPermission, isVerified, role } = useSecurity();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>({
    stats: {
      todayOpd: 0,
      activeDoctors: 0,
      totalAppointments: 0,
      completedAppointments: 0,
      revenueToday: 0
    },
    recentAppointments: []
  });
  
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  const [activeDepartmentFilter, setActiveDepartmentFilter] = useState<string | null>(null);

  // Local state for other lists
  const [doctors, setDoctors] = useState<any[]>([]);
  const [openPositions, setOpenPositions] = useState<any[]>([]);

  // Schedule / Slot Management State
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });
  const [opdDayStatus, setOpdDayStatus] = useState('ACTIVE');
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    tokenCount: '20',
    duration: '', 
    capacity: '1',
    doctorId: '',
    consultationType: 'OPD',
    isOverflow: false,
    // Recurring & Advanced
    recurrenceType: 'one-time', // one-time | daily | weekdays | custom
    endDate: '',
    occurrences: '10',
    endCondition: 'date', // date | count
    customDays: [] as number[], // 0=Sun, 1=Mon...
    overflowEnabled: false,
    overflowCapacity: '5',
    useTemplate: '' 
  });

  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: '',
    location: '',
    specialties: '',
    description: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Doctor Management State
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    id: '',
    name: '',
    specialty: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    location: '', // Can default to hospital location
    image: '', // URL
    availableToday: true,
    videoConsultation: true
  });
  const [savingDoctor, setSavingDoctor] = useState(false);
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Local state for authentication bridging
  const [localSessionVerified, setLocalSessionVerified] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [sessionError, setSessionError] = useState(false);
  const [userId, setUserId] = useState('');

  // Appointment Logs & Reschedule
  const [appointmentLogs, setAppointmentLogs] = useState<any[]>([]);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [showRescheduleSuccess, setShowRescheduleSuccess] = useState(false);
  const [rescheduledDetails, setRescheduledDetails] = useState<any>(null);

  useEffect(() => {
      if (selectedAppointment) {
          fetchLogs(selectedAppointment.id);
      }
  }, [selectedAppointment]);

  async function fetchLogs(id: string) {
      try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/appointment-logs/${id}`);
          if (response.ok) {
              setAppointmentLogs(await response.json());
          }
      } catch (e) {
          console.error("Failed to fetch logs", e);
      }
  }

  // Check authentication first
  useEffect(() => {
    const initDashboard = async () => {
      // Wait for any pending auth state to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('[HospitalAdmin] Session found, loading dashboard');
        setLocalSessionVerified(true);
        setUserId(session.user.id);
        // Get hospital name from metadata
        const name = session.user.user_metadata?.hospital_name || session.user.user_metadata?.full_name || 'Hospital Admin';
        setHospitalName(name);
        fetchStats();
        fetchAdvancedStats();
        fetchProfile();
        fetchHospitalDoctors();
      } else {
        console.log('[HospitalAdmin] No session - user needs to login first');
        // Don't redirect here - let App.tsx handle auth flow
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  useEffect(() => {
    if (selectedDate && isAuthenticated) {
      fetchSlots(selectedDate);
      fetchAdvancedStats(selectedDate);
      fetchOpdDayStatus(selectedDate);
    }
  }, [selectedDate, isAuthenticated]);

  async function fetchOpdDayStatus(date: string) {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/opd-day-status?date=${date}&authToken=${session.access_token}`, {
              headers: { 
                 'Authorization': `Bearer ${publicAnonKey}`,
                 'X-Supabase-Auth': session.access_token 
              }
          });
          if (response.ok) {
              const data = await response.json();
              setOpdDayStatus(data.status || 'ACTIVE');
          }
      } catch (e) {
          console.error("Failed to fetch day status", e);
      }
  }

  async function handleUpdateDayStatus(status: string) {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/opd-day-status`, {
              method: 'POST',
              headers: { 
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${publicAnonKey}`,
                 'X-Supabase-Auth': session.access_token 
              },
              body: JSON.stringify({
                  authToken: session.access_token,
                  date: selectedDate,
                  status
              })
          });
          if (response.ok) {
              setOpdDayStatus(status);
              toast.success(`OPD is now ${status}`);
          }
      } catch (e) {
          toast.error("Failed to update status");
      }
  }

  // Helper for consistent auth error handling
  const handleAuthError = () => {
     console.error("Authentication error detected");
     setSessionError(true);
     toast.error("Session expired or invalid. Please reload the page.");
  };

  async function fetchAdvancedStats(dateStr?: string) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/advanced-dashboard-stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
                'X-Supabase-Auth': session.access_token
            },
            body: JSON.stringify({ 
                authToken: session.access_token,
                date: dateStr || selectedDate
            })
        });

        if (response.ok) {
            const data = await response.json();
            setAdvancedStats(data);
        }
    } catch (e) {
        console.error("Failed to fetch advanced stats", e);
    }
  }

  async function fetchProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/hospital-profile?authToken=${session.access_token}`, {
         headers: { 
             'Authorization': `Bearer ${publicAnonKey}`,
             'X-Supabase-Auth': session.access_token 
         },
         cache: 'no-store'
      });
      
      if (response.ok) {
         const data = await response.json();
         if (data && data.name) {
             setProfileForm({
                 name: data.name || '',
                 location: data.location || '',
                 specialties: data.specialties || '',
                 description: data.description || ''
             });
             setHospitalName(data.name);
             setVerificationStatus(data.verification_status || '');
         } else {
             // Auto-fill from signup metadata if profile doesn't exist yet
             const meta = session.user.user_metadata || {};
             const signupName = meta.hospital_name || meta.full_name || meta.name || '';
             const signupLocation = meta.location || meta.city || ''; // common metadata fields
             
             if (signupName) {
                setProfileForm(prev => ({
                    ...prev,
                    name: signupName,
                    location: signupLocation
                }));
                setHospitalName(signupName);
             }
             setVerificationStatus(meta.verification_status || '');
         }
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  }

  async function fetchStats() {
    try {
      setSessionError(false);
      if (!projectId) {
         console.error('[HospitalAdmin] Project ID missing');
         return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        let token = session.access_token;
        if (!token) {
            console.error('[HospitalAdmin] Session exists but token is missing');
            return;
        }
        
        const doFetch = async (authToken: string) => {
             return fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/hospital-stats`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
                'X-Supabase-Auth': authToken
              },
              body: JSON.stringify({ authToken }),
              cache: 'no-store'
            });
        };

        let response = await doFetch(token);
        
        // Retry logic for expired tokens
        if (response.status === 401) {
            console.log('[HospitalAdmin] 401 on stats, checking session status...');
            
            // 1. Check if session was already refreshed by another concurrent request
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (currentSession && currentSession.access_token !== token) {
                // Token has changed, meaning it was refreshed elsewhere. Retry with new token.
                console.log('[HospitalAdmin] Session already refreshed, retrying with new token');
                token = currentSession.access_token;
                response = await doFetch(token);
            } else {
                // 2. Token is still the same, so WE need to refresh it
                console.log('[HospitalAdmin] Refreshing session...');
                const { data: { session: refreshed }, error: refreshError } = await supabase.auth.refreshSession();
                
                if (refreshed && !refreshError) {
                    token = refreshed.access_token;
                    response = await doFetch(token);
                } else {
                    console.error('[HospitalAdmin] Session refresh failed:', refreshError);
                    setSessionError(true);
                    toast.error("Session expired. Please refresh the page.");
                    return;
                }
            }
        }
        
        if (response.status === 401) {
            let errorMsg = 'Unauthorized';
            let responseText = '';
            try {
                responseText = await response.text();
                console.log('[HospitalAdmin] Raw 401 Body:', responseText); // Debug log
                try {
                    const errData = JSON.parse(responseText);
                    errorMsg = errData.error || errorMsg;
                } catch (jsonErr) {
                    if (responseText.length < 200) errorMsg = responseText;
                    else errorMsg = 'Non-JSON response from server';
                }
            } catch (e) { /* ignore */ }
            
            console.error(`[HospitalAdmin] Server rejected fresh token (401). Reason: ${errorMsg}`);
            
            // Show error but don't crash
            toast.error(`Sync Error: ${errorMsg}`);
            return;
        }

        if (response.ok) {
          const data = await response.json();
          
          // Deduplicate recentAppointments locally as a safety measure
          const uniqueAppointments = Array.from(new Map(data.recentAppointments.map((apt:any) => [apt.id, apt])).values());
          
          setDashboardData({
              ...data,
              recentAppointments: uniqueAppointments
          });
        }
      }
    } catch (error) {
      console.error('Error fetching hospital stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSlots(date: string) {
    setLoadingSlots(true);
    setSessionError(false);
    try {
      if (!projectId) {
         toast.error('System Error: Missing Project ID');
         return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let token = session.access_token;
      if (!token) return;

      console.log('Fetching slots for:', date);
      
      const doFetch = async (authToken: string) => {
          return fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/get-slots`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Supabase-Auth': authToken
            },
            body: JSON.stringify({
                authToken,
                date,
                hospitalId: session.user.id,
                includeAll: true
            }),
            cache: 'no-store'
          });
      };

      let response = await doFetch(token);
      
      // Retry logic
      if (response.status === 401) {
          console.log('[HospitalAdmin] 401 on slots, checking session status...');
          
          // 1. Check if session was already refreshed by another concurrent request
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          
          if (currentSession && currentSession.access_token !== token) {
             console.log('[HospitalAdmin] Session already refreshed, retrying slots with new token');
             token = currentSession.access_token;
             response = await doFetch(token);
          } else {
             // 2. Refresh it ourselves
             console.log('[HospitalAdmin] Refreshing session for slots...');
             const { data: { session: refreshed }, error: refreshError } = await supabase.auth.refreshSession();
             
             if (refreshed && !refreshError) {
                  token = refreshed.access_token;
                  response = await doFetch(token);
             } else {
                 console.error('[HospitalAdmin] Session refresh failed for slots:', refreshError);
                 setSessionError(true);
                 return;
             }
          }
      }
      
      if (response.status === 401) {
         let errorMsg = 'Unauthorized';
         let responseText = '';
         try {
             responseText = await response.text();
             console.log('[HospitalAdmin] Raw 401 Body:', responseText); // Debug log
             try {
                const errData = JSON.parse(responseText);
                errorMsg = errData.error || errorMsg;
             } catch (jsonErr) {
                if (responseText.length < 200) errorMsg = responseText;
                else errorMsg = 'Non-JSON response from server';
             }
         } catch (e) { /* ignore */ }

         console.error(`[HospitalAdmin] Server rejected fresh token (401) for slots. Reason: ${errorMsg}`);
         toast.error(`Sync failed: ${errorMsg}`);
         return;
      }

      if (response.ok) {
        const data = await response.json();
        // Safety: Deduplicate slots on frontend just in case
        const uniqueSlots = Array.from(new Map(data.map((s:any) => [s.id, s])).values());
        setSlots(uniqueSlots);
      } else {
        console.error('Failed to fetch slots:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load slots');
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/hospital-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': session.access_token
        },
        body: JSON.stringify({
          authToken: session.access_token,
          ...profileForm
        })
      });

      if (response.ok) {
        setHospitalName(profileForm.name);
        setShowSuccessModal(true);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function fetchHospitalDoctors() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/hospital-doctors?authToken=${session.access_token}`, {
         headers: { 
             'Authorization': `Bearer ${publicAnonKey}`,
             'X-Supabase-Auth': session.access_token 
         },
         cache: 'no-store'
      });
      
      if (response.ok) {
          const data = await response.json();
          // Safety: Deduplicate locally
          const uniqueDoctors = Array.from(new Map(data.map((d:any) => [d.id, d])).values());
          setDoctors(uniqueDoctors);
          // Update active doctors count in stats locally if needed
          setDashboardData((prev: any) => ({
             ...prev,
             stats: { ...prev.stats, activeDoctors: uniqueDoctors.length }
          }));
      }
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  }

  async function handleSaveDoctor() {
    setSavingDoctor(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Basic validation
      if (!doctorForm.name || !doctorForm.specialty) {
          toast.error("Name and Specialty are required");
          setSavingDoctor(false);
          return;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/hospital-doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': session.access_token
        },
        body: JSON.stringify({
          authToken: session.access_token,
          ...doctorForm,
          // Ensure fees and numeric values are parsed if needed, though string is fine for display
          location: doctorForm.location || profileForm.location, // Default to hospital location if empty
          hospital: profileForm.name // Denormalize hospital name
        })
      });

      if (response.ok) {
        toast.success('Doctor saved successfully');
        setShowAddDoctor(false);
        fetchHospitalDoctors();
        // Reset form
        setDoctorForm({
            id: '',
            name: '',
            specialty: '',
            qualification: '',
            experience: '',
            consultationFee: '',
            location: '',
            image: '',
            availableToday: true,
            videoConsultation: true
        });
      } else {
        const errText = await response.text();
        let errorMsg = 'Failed to save doctor';
        try {
            const err = JSON.parse(errText);
            errorMsg = err.error || errorMsg;
        } catch (e) {
            errorMsg = errText || errorMsg;
        }
        console.error('Save doctor failed:', errText);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error('Failed to save doctor');
    } finally {
      setSavingDoctor(false);
    }
  }

  async function handleDeleteDoctor(id: string) {
     if (!confirm('Are you sure you want to remove this doctor?')) return;
     
     try {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) return;

       const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/hospital-doctors/${id}?authToken=${session.access_token}`, {
          method: 'DELETE',
          headers: { 
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Supabase-Auth': session.access_token
          }
       });

       if (response.ok) {
           toast.success('Doctor removed');
           fetchHospitalDoctors();
       } else {
           toast.error('Failed to remove doctor');
       }
     } catch (e) {
        console.error('Error deleting doctor:', e);
        toast.error('Error deleting doctor');
     }
  }

  async function handleCreateSlots() {
    try {
      setSessionError(false);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to generate slots');
        return;
      }
      
      if (!projectId) {
         toast.error('Configuration error: Missing Project ID');
         return;
      }

      console.log('Creating slots with:', slotForm);
      
      // Calculate duration based on token count
      const start = new Date(`2000/01/01 ${slotForm.startTime}`);
      const end = new Date(`2000/01/01 ${slotForm.endTime}`);
      const totalMinutes = (end.getTime() - start.getTime()) / 60000;
      const tokens = parseInt(slotForm.tokenCount);
      
      if (isNaN(tokens) || tokens <= 0) {
          toast.error("Please enter a valid number of tokens");
          return;
      }

      const calculatedDuration = Math.floor(totalMinutes / tokens);
      
      /* 
      if (calculatedDuration < 1) {
          toast.error("Too many tokens for the selected time range. Slots would be less than 1 minute.");
          return;
      }
      */
      
      // Use retry logic here too? For now, just direct call but handle 401 better
      // Ideally we'd refactor doFetch to be reusable, but for this fix we'll just handle the error.
      
      let token = session.access_token;
      
      const performCreate = async (authToken: string) => {
          return fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/slots`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Supabase-Auth': authToken
            },
            body: JSON.stringify({
              authToken,
              ...slotForm,
              duration: calculatedDuration,
              capacity: parseInt(slotForm.capacity)
            })
          });
      };

      let response = await performCreate(token);

      // Handle 401
      if (response.status === 401) {
          console.log('[HospitalAdmin] 401 on create slots, trying refresh...');
          const { data: { session: refreshed }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshed && !refreshError) {
              token = refreshed.access_token;
              response = await performCreate(token);
          } else {
              handleAuthError();
              return;
          }
      }

      if (response.status === 401) {
           const errText = await response.text();
           console.error('[HospitalAdmin] Create slots 401:', errText);
           toast.error('Unauthorized: Unable to create slots');
           return;
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Slots created:', result);
        toast.success(`Successfully generated ${result.slots?.length || 0} slots`);
        setShowCreateSlot(false);
        // Ensure we refresh the date we just added slots to
        if (selectedDate !== slotForm.date) {
            setSelectedDate(slotForm.date);
        } else {
            fetchSlots(slotForm.date);
        }
      } else {
        const errText = await response.text();
        
        let errorMessage = 'Failed to generate slots';
        let isConflict = response.status === 409;
        
        try {
            const err = JSON.parse(errText);
            errorMessage = err.error || errorMessage;
            if (errorMessage && errorMessage.includes("Slots already generated")) isConflict = true;
        } catch (e) {
            errorMessage = errText;
            if (errText && errText.includes("Slots already generated")) isConflict = true;
        }

        if (isConflict) {
            // If it's a conflict, prompt the user to overwrite
            if (confirm("Slots already exist for this date. Do you want to clear them and generate new ones?")) {
                const deleteResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/slots?date=${slotForm.date}&authToken=${token}`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `Bearer ${publicAnonKey}`,
                        'X-Supabase-Auth': token
                    }
                });

                if (deleteResponse.ok) {
                    // Retry Create
                    response = await performCreate(token);
                    if (response.ok) {
                         const result = await response.json();
                         toast.success(`Schedule overwritten: Generated ${result.slots?.length || 0} new slots`);
                         setShowCreateSlot(false);
                         if (selectedDate !== slotForm.date) {
                             setSelectedDate(slotForm.date);
                         } else {
                             fetchSlots(slotForm.date);
                         }
                         return;
                    } else {
                        const retryErr = await response.text();
                        console.error('Retry generation failed:', retryErr);
                        toast.error("Failed to generate new slots after clearing.");
                    }
                } else {
                     const delErrText = await deleteResponse.text();
                     let delMsg = "Could not clear existing slots.";
                     try {
                         const delJson = JSON.parse(delErrText);
                         delMsg = delJson.error || delMsg;
                     } catch (e) {}
                     toast.error(delMsg);
                }
            }
            return;
        }
        
        // Only log and show error if it wasn't a handled conflict
        console.error('Slot generation failed:', errText);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating slots:', error);
      toast.error('Failed to create slots: ' + error.message);
    }
  }

  async function handleUpdateSlot(slotId: string, updates: any) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/slots/${slotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': session.access_token
        },
        body: JSON.stringify({
            authToken: session.access_token,
            date: selectedDate, // Needed for key lookup optimization
            ...updates
        })
      });

      if (response.status === 401) {
          handleAuthError();
          return;
      }

      if (response.ok) {
        toast.success('Slot updated');
        fetchSlots(selectedDate);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to update slot');
      }
    } catch (error) {
        console.error('Error updating slot:', error);
        toast.error('Failed to update slot');
    }
  }

  async function handleSlotAction(slotId: string, action: 'pause' | 'resume' | 'block') {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/slots/${slotId}/${action}?date=${selectedDate}`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'X-Supabase-Auth': session.access_token
              },
              body: JSON.stringify({ authToken: session.access_token })
          });

          if (response.ok) {
              toast.success(`Slot ${action}d`);
              fetchSlots(selectedDate);
          } else {
              toast.error(`Failed to ${action} slot`);
          }
      } catch (e) {
          toast.error("Action failed");
      }
  }

  async function handleDeleteSlot(slotId: string) {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/slots/${slotId}?date=${selectedDate}&authToken=${session.access_token}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': session.access_token
        }
      });

      if (response.status === 401) {
          handleAuthError();
          return;
      }

      if (response.ok) {
        toast.success('Slot deleted');
        fetchSlots(selectedDate);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to delete slot');
      }
    } catch (error) {
        console.error('Error deleting slot:', error);
        toast.error('Failed to delete slot');
    }
  }

  async function handleClearDay() {
    if (!slots.length) return;
    if (!confirm(`Are you sure you want to delete all ${slots.length} slots for ${selectedDate}? This cannot be undone.`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/slots?date=${selectedDate}&authToken=${session.access_token}`, {
         method: 'DELETE',
         headers: { 
             'Authorization': `Bearer ${publicAnonKey}`,
             'X-Supabase-Auth': session.access_token 
         }
      });

      if (response.ok) {
          toast.success("Schedule cleared successfully");
          fetchSlots(selectedDate);
      } else {
          const err = await response.json();
          toast.error(err.error || "Failed to clear schedule");
      }
    } catch (e) {
        console.error("Error clearing schedule:", e);
        toast.error("Error clearing schedule");
    }
  }

  async function handleMarkDayCompleted() {
    if (!slots.length) return;
    if (!confirm(`Mark all appointments for ${selectedDate} as Completed?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/mark-day-completed`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Supabase-Auth': session.access_token
          },
          body: JSON.stringify({
              authToken: session.access_token,
              date: selectedDate
          })
      });

      if (response.ok) {
          const result = await response.json();
          toast.success(`Completed: ${result.count} appointments updated`);
          fetchStats(); // Update stats (revenue, etc.)
          fetchSlots(selectedDate); // Refresh slots view
      } else {
          const err = await response.json();
          toast.error(err.error || "Failed to mark appointments as completed");
      }
    } catch (e) {
        console.error("Error marking completed:", e);
        toast.error("Error marking completed");
    }
  }

  const stats = advancedStats ? [
    { 
      label: "Today's OPD", 
      value: advancedStats.kpi.opd.value.toString(), 
      icon: <Users className="w-5 h-5" />,
      trend: `${advancedStats.kpi.opd.trend.direction === 'up' ? '+' : '-'}${advancedStats.kpi.opd.trend.value}%`,
      trendDir: advancedStats.kpi.opd.trend.direction,
      color: "text-blue-600"
    },
    { 
      label: "Active Doctors", 
      value: advancedStats.kpi.activeDoctors.value.toString(), 
      icon: <Activity className="w-5 h-5" />,
      trend: `${advancedStats.kpi.activeDoctors.utilization}% util`,
      trendDir: 'neutral',
      color: "text-green-600"
    },
    { 
      label: "Appointments", 
      value: advancedStats.kpi.appointments.total.toString(), 
      icon: <Calendar className="w-5 h-5" />,
      trend: `${advancedStats.kpi.appointments.pending} pending`,
      trendDir: 'neutral',
      color: "text-purple-600"
    },
    { 
      label: "Revenue Today", 
      value: `₹${advancedStats.kpi.revenue.actual.toLocaleString()}`, 
      icon: <DollarSign className="w-5 h-5" />,
      trend: `${advancedStats.kpi.revenue.trend.direction === 'up' ? '+' : '-'}${advancedStats.kpi.revenue.trend.value}%`,
      trendDir: advancedStats.kpi.revenue.trend.direction,
      color: "text-emerald-600"
    }
  ] : [
    { 
      label: "Today's OPD", 
      value: dashboardData.stats.todayOpd.toString(), 
      icon: <Users className="w-5 h-5" />,
      trend: "+0% vs yesterday",
      trendDir: 'up',
      color: "text-blue-600"
    },
    { 
      label: "Active Doctors", 
      value: dashboardData.stats.activeDoctors.toString(), 
      icon: <Activity className="w-5 h-5" />,
      trend: "0 on leave",
      trendDir: 'neutral',
      color: "text-green-600"
    },
    { 
      label: "Appointments", 
      value: dashboardData.stats.totalAppointments.toString(), 
      icon: <Calendar className="w-5 h-5" />,
      trend: "+0 pending",
      trendDir: 'neutral',
      color: "text-purple-600"
    },
    { 
      label: "Revenue Today", 
      value: `₹${dashboardData.stats.revenueToday}`, 
      icon: <DollarSign className="w-5 h-5" />,
      trend: "+0% vs yesterday",
      trendDir: 'up',
      color: "text-emerald-600"
    }
  ].filter(s => userRole === 'doctor' ? !s.label.includes('Revenue') : true);

  // Show login prompt if not authenticated
  // We check both the prop (from App) and our local verification to prevent race conditions
  if (!loading && !isAuthenticated && !localSessionVerified) {
    return (
      <div className="h-screen pt-24 pb-16 bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Hospital Dashboard</h2>
          <p className="text-muted-foreground mb-6">
            Unable to verify session. Please sign in again.
          </p>
          <div className="space-y-3">
             <Button onClick={() => onNavigate('auth-hospital')} className="w-full">
                Sign In
             </Button>
             <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Retry Connection
             </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
     return (
        <div className="h-screen pt-24 pb-16 bg-background flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        </div>
     );
  }

  async function handleSecureExport(type: 'appointments' | 'patients') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const allowed = checkPermission(PERMISSIONS.SECURE_EXPORT);
      if (!allowed) {
          toast.error("Access Denied: You do not have permission to export data.");
          return;
      }
      
      toast.promise(
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/admin/secure-export`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Supabase-Auth': session.access_token
          },
          body: JSON.stringify({
              authToken: session.access_token,
              type
          })
        }).then(async (res) => {
            if (!res.ok) throw new Error("Export failed");
            return res.json();
        }),
        {
          loading: 'Generating secure export with audit trail...',
          success: (data) => `Export complete! ${data.data.length} records retrieved. Watermark: ${data.watermark}`,
          error: 'Export failed'
        }
      );

    } catch (e) {
        console.error(e);
        toast.error("Export error");
    }
  }

  return (
    <div className="min-h-screen pt-8 pb-20 bg-[#F8FAFC] w-full px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Session Error Banner */}
        {sessionError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-900 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-full">
                        <Ban className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                        <span className="font-semibold block text-sm">Connection Lost</span>
                        <span className="text-xs opacity-90">We're having trouble syncing your data.</span>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="bg-white hover:bg-rose-50 border-rose-200 text-rose-700 shadow-sm rounded-lg">
                    Reload Page
                </Button>
            </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] text-indigo-600">
               <Building className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{hospitalName || 'Hospital Dashboard'}</h1>
                  {verificationStatus && <VerificationBadge status={verificationStatus} />}
                </div>
                <p className="text-sm text-slate-500 font-medium mt-1">Administration & Operations Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
              {/* Alert Stack */}
              {advancedStats?.alerts?.length > 0 && (
                  <div className="hidden lg:flex flex-col items-end gap-2 mr-2">
                      {advancedStats.alerts.map((alert: any, idx: number) => (
                          !dismissedAlerts.includes(idx) && (
                            <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm animate-in slide-in-from-top-2 group relative pr-7 cursor-default ${
                                alert.type === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {alert.type === 'critical' ? <AlertCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                {alert.message}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDismissedAlerts([...dismissedAlerts, idx]);
                                    }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
                          )
                      ))}
                  </div>
              )}
              
              <div className="hidden md:block text-right mr-2">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today</div>
                 <div className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric'})}</div>
              </div>
              <Button onClick={() => setShowCreateSlot(true)} className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95">
                 <Plus className="w-5 h-5 mr-2" />
                 New Schedule
              </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden border-0 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group cursor-pointer rounded-2xl"
              onClick={() => {
                const tabs = ['appointments', 'doctors', 'appointments', 'analytics'];
                setActiveTab(tabs[index]);
              }}
            >
              <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${stat.color.replace('text-', 'bg-').replace('700', '50')}/60 transition-colors group-hover:bg-opacity-100`}>
                          <div className={stat.color}>{stat.icon}</div>
                      </div>
                      {stat.trend && (
                        <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${
                            stat.trendDir === 'down' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                            stat.trendDir === 'up' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                            'text-slate-600 bg-slate-50 border-slate-100'
                        }`}>
                            {stat.trendDir === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : stat.trendDir === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                            {stat.trend}
                        </div>
                      )}
                  </div>
                  <div>
                      <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{stat.value}</div>
                      <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                  </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur-sm pb-2 pt-1 -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm inline-flex w-full overflow-x-auto scrollbar-hide">
                      <TabsList className="h-auto p-0 bg-transparent w-full justify-start gap-1">
                        {[
                            { id: 'schedule', label: 'Slot Manager', roles: ['hospital'] },
                            { id: 'appointments', label: 'Appointments', roles: ['hospital', 'doctor'] },
                            { id: 'doctors', label: 'Doctors', roles: ['hospital'] },
                            { id: 'profile', label: 'Profile', roles: ['hospital', 'doctor'] },
                            { id: 'staffing', label: 'Staffing', roles: ['hospital'] },
                            { id: 'analytics', label: 'Analytics', roles: ['hospital'] },
                            { id: 'settings', label: 'Settings', roles: ['hospital'] },
                            { id: 'security', label: 'Security & Audit', roles: ['hospital'] }
                        ].filter(t => t.roles.includes(userRole || 'hospital')).map(tab => (
                            <TabsTrigger 
                                key={tab.id}
                                value={tab.id} 
                                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex-1 whitespace-nowrap"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                      </TabsList>
                  </div>
              </div>

              {/* Slot Management Tab */}
              <TabsContent value="schedule" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <Card className="border-0 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-3xl overflow-hidden bg-white">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                             <div className="flex items-center gap-3 w-full sm:w-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                                <Button size="sm" variant="ghost" onClick={() => fetchSlots(selectedDate)} className="h-9 w-9 p-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm">
                                    <Search className="w-4 h-4" />
                                </Button>
                                <div className="h-4 w-px bg-slate-200"></div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"ghost"}
                                            className={cn(
                                                "bg-transparent border-0 text-sm font-medium text-slate-700 focus:ring-0 p-1 w-full sm:w-auto h-auto justify-start text-left hover:bg-slate-100/50",
                                                !selectedDate && "text-muted-foreground"
                                            )}
                                        >
                                            {selectedDate ? format(new Date(selectedDate), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={selectedDate ? new Date(selectedDate) : undefined}
                                            onSelect={(date) => date && setSelectedDate(format(date, "yyyy-MM-dd"))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                             </div>
                             
                             {/* Day Status Selector */}
                             {slots.length > 0 && (
                                 <div className="flex items-center gap-2">
                                     <Select value={opdDayStatus} onValueChange={handleUpdateDayStatus}>
                                         <SelectTrigger 
                                             className={cn(
                                                 "text-xs font-bold uppercase tracking-wide px-3 py-2 h-auto w-[180px] rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none",
                                                 opdDayStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                 opdDayStatus === 'CLOSING_SOON' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                 opdDayStatus === 'COMPLETED' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                                 'bg-white text-slate-500 border-slate-200'
                                             )}
                                         >
                                             <SelectValue placeholder="Select Status" />
                                         </SelectTrigger>
                                         <SelectContent>
                                             <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                             <SelectItem value="ACTIVE">Active (Open)</SelectItem>
                                             <SelectItem value="CLOSING_SOON">Closing Soon</SelectItem>
                                             <SelectItem value="COMPLETED">Completed</SelectItem>
                                             <SelectItem value="ARCHIVED">Archived</SelectItem>
                                         </SelectContent>
                                     </Select>
                                 </div>
                             )}
                         </div>
                         
                         <div className="flex gap-2 w-full sm:w-auto">
                             {slots.length > 0 && (
                                <>
                                    <Button size="sm" variant="ghost" className="flex-1 sm:flex-none h-10 px-4 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-medium transition-colors" onClick={handleMarkDayCompleted}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Complete Day
                                    </Button>
                                    <Button size="sm" variant="ghost" className="flex-1 sm:flex-none h-10 px-4 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl font-medium transition-colors" onClick={handleClearDay}>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear
                                    </Button>
                                </>
                             )}
                         </div>
                    </div>
                    
                    {loadingSlots ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-400 text-sm font-medium animate-pulse">Syncing schedule...</p>
                        </div>
                    ) : (
                        <div className="p-6 bg-slate-50/30 min-h-[400px]">
                             {slots.length === 0 ? (
                                 <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                                     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center shadow-inner mb-5">
                                        <Calendar className="w-8 h-8 text-slate-300" />
                                     </div>
                                     <h3 className="text-lg font-bold text-slate-900 mb-2">No schedule configured</h3>
                                     <p className="text-slate-500 max-w-xs text-center mb-8 leading-relaxed">
                                         Generate slots for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} to start accepting appointments.
                                     </p>
                                     <Button onClick={() => setShowCreateSlot(true)} className="rounded-xl px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Generate Slots
                                     </Button>
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                     {slots.map((slot) => (
                                         <div 
                                            key={slot.id} 
                                            className={`
                                                relative group flex flex-col
                                                p-4 rounded-2xl border transition-all duration-300
                                                ${slot.isBooking ? 'z-[10] ring-4 ring-indigo-500/10 shadow-2xl scale-105 bg-white border-indigo-200' : ''}
                                                ${slot.status === 'disabled' ? 'bg-slate-100/50 border-slate-200 text-slate-400' : 
                                                  slot.bookedCount >= slot.capacity ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900' : 
                                                  slot.bookedCount > 0 ? 'bg-amber-50/40 border-amber-100 text-amber-900' :
                                                  'bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.05)]'}
                                            `}
                                         >
                                             {/* Booking Form Overlay */}
                                             {slot.isBooking && (
                                                 <Dialog 
                                                     open={true} 
                                                     onOpenChange={(open) => {
                                                         if (!open) {
                                                             setSlots(slots.map(s => s.id === slot.id ? { ...s, isBooking: false, bookingStep: undefined, tempDetails: undefined } : s));
                                                         }
                                                     }}
                                                 >
                                                     <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                                                         <DialogHeader>
                                                             <DialogTitle>{slot.bookingStep === 'payment' ? 'Secure Payment' : 'New Appointment'}</DialogTitle>
                                                             <DialogDescription>
                                                                 {slot.bookingStep === 'payment' ? 'Process payment to confirm this booking.' : `Book appointment for ${slot.time}`}
                                                             </DialogDescription>
                                                         </DialogHeader>

                                                         {slot.bookingStep === 'payment' ? (
                                                             <div className="space-y-4 py-2">
                                                                 <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border">
                                                                     <div>
                                                                         <p className="text-xs text-slate-500">Consultation Fee</p>
                                                                         <p className="text-lg font-bold text-slate-900">₹500.00</p>
                                                                     </div>
                                                                     <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Standard OPD</Badge>
                                                                 </div>
                                                                 
                                                                 <Tabs defaultValue="card" className="w-full">
                                                                     <TabsList className="grid w-full grid-cols-2">
                                                                         <TabsTrigger value="card">Card</TabsTrigger>
                                                                         <TabsTrigger value="cash">Cash / UPI</TabsTrigger>
                                                                     </TabsList>
                                                                     <TabsContent value="card" className="space-y-3 pt-3">
                                                                         <div className="space-y-2">
                                                                             <label className="text-xs font-medium">Card Number</label>
                                                                             <div className="relative">
                                                                                 <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                                                                 <input className="w-full h-9 pl-9 pr-3 text-sm border rounded-md" placeholder="0000 0000 0000 0000" disabled />
                                                                             </div>
                                                                             <div className="grid grid-cols-2 gap-2">
                                                                                 <div className="space-y-2">
                                                                                     <label className="text-xs font-medium">Expiry</label>
                                                                                     <input className="w-full h-9 px-3 text-sm border rounded-md" placeholder="MM/YY" disabled />
                                                                                 </div>
                                                                                 <div className="space-y-2">
                                                                                     <label className="text-xs font-medium">CVV</label>
                                                                                     <input className="w-full h-9 px-3 text-sm border rounded-md" placeholder="123" disabled />
                                                                                 </div>
                                                                             </div>
                                                                         </div>
                                                                     </TabsContent>
                                                                     <TabsContent value="cash" className="pt-3">
                                                                          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-slate-50">
                                                                              <DollarSign className="w-8 h-8 text-slate-400 mb-2" />
                                                                              <p className="text-sm font-medium">Collect Cash at Counter</p>
                                                                              <p className="text-xs text-slate-500">Mark as paid to proceed</p>
                                                                          </div>
                                                                     </TabsContent>
                                                                 </Tabs>
                                                             </div>
                                                         ) : (
                                                             <div className="space-y-3 py-2">
                                                                 <div className="space-y-1">
                                                                     <label className="text-xs font-medium">Patient Name</label>
                                                                     <input 
                                                                         className="w-full h-9 px-3 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                                                                         placeholder="Enter name"
                                                                         autoFocus
                                                                         value={slot.tempDetails?.name || ''}
                                                                         onChange={(e) => setSlots(slots.map(s => s.id === slot.id ? { ...s, tempDetails: { ...s.tempDetails, name: e.target.value } } : s))}
                                                                     />
                                                                 </div>
                                                                 <div className="grid grid-cols-3 gap-3">
                                                                     <div className="space-y-1 col-span-1">
                                                                         <label className="text-xs font-medium">Age</label>
                                                                         <input 
                                                                             className="w-full h-9 px-3 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                                                                             placeholder="Age"
                                                                             value={slot.tempDetails?.age || ''}
                                                                             onChange={(e) => setSlots(slots.map(s => s.id === slot.id ? { ...s, tempDetails: { ...s.tempDetails, age: e.target.value } } : s))}
                                                                         />
                                                                     </div>
                                                                     <div className="space-y-1 col-span-2">
                                                                         <label className="text-xs font-medium">Gender</label>
                                                                         <Select 
                                                                              value={slot.tempDetails?.gender || ''} 
                                                                              onValueChange={(v) => setSlots(slots.map(s => s.id === slot.id ? { ...s, tempDetails: { ...s.tempDetails, gender: v } } : s))}
                                                                         >
                                                                             <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                                                                             <SelectContent>
                                                                                 <SelectItem value="Male">Male</SelectItem>
                                                                                 <SelectItem value="Female">Female</SelectItem>
                                                                                 <SelectItem value="Other">Other</SelectItem>
                                                                             </SelectContent>
                                                                         </Select>
                                                                     </div>
                                                                 </div>
                                                                 <div className="space-y-1">
                                                                     <label className="text-xs font-medium">Phone</label>
                                                                     <input 
                                                                         className="w-full h-9 px-3 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                                                                         placeholder="Phone number"
                                                                         value={slot.tempDetails?.phone || ''}
                                                                         onChange={(e) => setSlots(slots.map(s => s.id === slot.id ? { ...s, tempDetails: { ...s.tempDetails, phone: e.target.value } } : s))}
                                                                     />
                                                                 </div>
                                                             </div>
                                                         )}

                                                         <DialogFooter className="gap-2 sm:gap-0">
                                                              {slot.bookingStep === 'payment' ? (
                                                                  <>
                                                                       <Button variant="outline" onClick={() => setSlots(slots.map(s => s.id === slot.id ? { ...s, bookingStep: undefined } : s))}>
                                                                          Back
                                                                       </Button>
                                                                       <Button 
                                                                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                          onClick={async () => {
                                                                              const details = slot.tempDetails;
                                                                              if (!details?.name) return toast.error("Name is required");
                                                                              
                                                                              try {
                                                                                   const { data: { session } } = await supabase.auth.getSession();
                                                                                   if (!session) return;
                                                                                   
                                                                                   toast.loading("Processing Payment...");
                                                                                   await new Promise(r => setTimeout(r, 1500)); 
                                                                                   
                                                                                   toast.dismiss();
                                                                                   toast.loading("Booking...");

                                                                                   const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/bookings?authToken=${session.access_token}`, {
                                                                                       method: 'POST',
                                                                                       headers: {
                                                                                           'Content-Type': 'application/json',
                                                                                           'Authorization': `Bearer ${publicAnonKey}`,
                                                                                           'X-Supabase-Auth': session.access_token
                                                                                       },
                                                                                       body: JSON.stringify({
                                                                                           slotId: slot.id,
                                                                                           date: slot.date,
                                                                                           doctorId: slot.doctorId || session.user.id,
                                                                                           hospitalId: session.user.id,
                                                                                           patientDetails: { 
                                                                                               name: details.name, 
                                                                                               age: details.age, 
                                                                                               gender: details.gender, 
                                                                                               phone: details.phone, 
                                                                                               type: 'offline',
                                                                                               paymentStatus: 'paid',
                                                                                               amount: 500
                                                                                           },
                                                                                           status: 'confirmed'
                                                                                       })
                                                                                   });
                                                                                   
                                                                                   toast.dismiss();
                                                                                   if (response.ok) {
                                                                                       toast.success("Payment Successful & Booking Confirmed");
                                                                                       fetchSlots(selectedDate);
                                                                                   } else {
                                                                                       const err = await response.json();
                                                                                       toast.error(err.error || "Booking failed");
                                                                                   }
                                                                              } catch (err) {
                                                                                   console.error(err);
                                                                                   toast.dismiss();
                                                                                   toast.error("Error occurred");
                                                                              }
                                                                          }}
                                                                       >
                                                                          Confirm Payment
                                                                       </Button>
                                                                  </>
                                                              ) : (
                                                                  <>
                                                                      <Button variant="outline" onClick={() => setSlots(slots.map(s => s.id === slot.id ? { ...s, isBooking: false, tempDetails: undefined } : s))}>
                                                                          Cancel
                                                                      </Button>
                                                                      <Button onClick={() => {
                                                                          if (!slot.tempDetails?.name) {
                                                                              toast.error("Please enter patient name");
                                                                              return;
                                                                          }
                                                                          setSlots(slots.map(s => s.id === slot.id ? { ...s, bookingStep: 'payment' } : s));
                                                                      }}>
                                                                          Proceed to Payment
                                                                      </Button>
                                                                  </>
                                                              )}
                                                         </DialogFooter>
                                                     </DialogContent>
                                                 </Dialog>
                                             )}

                                             {/* Slot Info */}
                                             <div className="mb-2 md:mb-0">
                                                 <div className="flex justify-between items-start mb-3">
                                                     <div className="font-bold text-lg text-slate-800">
                                                         #{slots.findIndex(s => s.id === slot.id) + 1}
                                                     </div>
                                                     <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                         slot.status === 'disabled' ? 'bg-slate-100 text-slate-400' :
                                                         slot.bookedCount >= slot.capacity ? 'bg-emerald-100 text-emerald-700' :
                                                         slot.bookedCount > 0 ? 'bg-amber-100 text-amber-700' :
                                                         'bg-indigo-50 text-indigo-600'
                                                     }`}>
                                                         {slot.status === 'disabled' ? 'OFF' :
                                                          slot.bookedCount >= slot.capacity ? 'FULL' :
                                                          slot.bookedCount > 0 ? `${slot.bookedCount}/${slot.capacity}` : 'OPEN'}
                                                     </div>
                                                 </div>
                                                 
                                                 <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3 bg-slate-50 w-fit px-2 py-1 rounded-md">
                                                    <Clock className="w-3 h-3" />
                                                    {slot.time}
                                                 </div>

                                                 {/* Patient Name Display */}
                                                 {slot.patients && slot.patients.length > 0 ? (
                                                     <div className="mt-3 space-y-2 pt-3 border-t border-dashed border-slate-200">
                                                         {slot.patients.map((p: any, i: number) => (
                                                             <div key={i} className="text-xs font-medium flex items-center gap-2 truncate text-slate-700 bg-white p-1.5 rounded-md shadow-sm border border-slate-100" title={p.name}>
                                                                 <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[8px] flex-shrink-0 font-bold">
                                                                     {p.name.charAt(0)}
                                                                 </div>
                                                                 <span className="truncate">{p.name}</span>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 ) : (
                                                     <div className="text-xs flex justify-between items-center mt-2 text-slate-400 font-medium">
                                                         <span>Capacity: {slot.capacity}</span>
                                                     </div>
                                                 )}
                                             </div>
                                             
                                             {/* Actions */}
                                             {!slot.isBooking && (
                                                <div className="
                                                    mt-auto pt-3 border-t border-dashed border-slate-100 flex items-center justify-end gap-1
                                                    md:absolute md:inset-0 md:bg-white/95 md:dark:bg-slate-950/95 md:justify-center md:items-center md:gap-2 
                                                    md:opacity-0 md:group-hover:opacity-100 md:transition-all md:duration-300 md:border-0 md:mt-0 md:pt-0 md:backdrop-blur-[2px]
                                                    md:scale-95 md:group-hover:scale-100 md:rounded-2xl
                                                ">
                                                    {slot.status === 'available' || slot.status === 'overflow' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleSlotAction(slot.id, 'pause')}
                                                                className="h-8 w-8 flex items-center justify-center bg-amber-50 hover:bg-amber-100 rounded-full text-amber-600 border border-amber-200 transition-colors shadow-sm"
                                                                title="Pause Booking"
                                                            >
                                                                <PauseCircle className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSlotAction(slot.id, 'block')}
                                                                className="h-8 w-8 flex items-center justify-center bg-rose-50 hover:bg-rose-100 rounded-full text-rose-600 border border-rose-200 transition-colors shadow-sm"
                                                                title="Block Slot"
                                                            >
                                                                <StopCircle className="w-4 h-4" />
                                                            </button>
                                                            
                                                            {/* Manual Booking Button */}
                                                            {slot.bookedCount < slot.capacity && (
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSlots(slots.map(s => s.id === slot.id ? { ...s, isBooking: true } : s));
                                                                    }}
                                                                    className="h-8 w-8 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 rounded-full text-indigo-600 border border-indigo-200 transition-colors shadow-sm"
                                                                    title="Book Patient"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Resume for Paused/Blocked/Disabled */}
                                                            {(slot.status === 'paused' || slot.status === 'blocked' || slot.status === 'disabled') && (
                                                                <button 
                                                                    onClick={() => handleSlotAction(slot.id, 'resume')}
                                                                    className="h-8 w-8 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 rounded-full text-emerald-600 border border-emerald-200 transition-colors shadow-sm"
                                                                    title="Resume / Enable"
                                                                >
                                                                    <PlayCircle className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    
                                                    {slot.bookedCount === 0 && (
                                                        <button 
                                                            onClick={() => handleDeleteSlot(slot.id)}
                                                            className="h-8 w-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 border border-slate-200 transition-colors shadow-sm hover:text-rose-500 hover:border-rose-200"
                                                            title="Delete Slot"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                             )}
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    )}
                 </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-0 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-3xl overflow-hidden bg-white">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900">Today's Appointments</h3>
                        {activeDepartmentFilter && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 gap-1 pr-1">
                                {activeDepartmentFilter}
                                <button onClick={() => setActiveDepartmentFilter(null)} className="hover:bg-slate-200 rounded-full p-0.5">
                                    <span className="sr-only">Clear</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 border border-slate-100">{dashboardData.stats.totalAppointments} Total</div>
                      <div className="px-3 py-1 bg-emerald-50 rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-100">{dashboardData.stats.completedAppointments} Completed</div>
                    </div>
                  </div>

                  <div className="p-5">
                    {(() => {
                        const filteredAppointments = activeDepartmentFilter 
                            ? dashboardData.recentAppointments.filter((apt: any) => {
                                // Try to match doctor to get specialty
                                // The backend returns doctor name string in recentAppointments
                                const docName = apt.doctor || "";
                                const doc = doctors.find(d => d.name === docName || docName.includes(d.name) || d.name.includes(docName));
                                const dept = doc?.specialty || 'General OPD';
                                return dept === activeDepartmentFilter;
                            })
                            : dashboardData.recentAppointments;

                        if (filteredAppointments.length === 0) {
                            return (
                                <div className="text-center py-16 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                                        <Calendar className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <span className="font-medium text-slate-900">No appointments found</span>
                                    <p className="text-xs mt-1">{activeDepartmentFilter ? `No appointments for ${activeDepartmentFilter}` : "Check back later or view future dates."}</p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-3">
                            {filteredAppointments.map((appointment: any) => (
                              <div 
                                key={appointment.id} 
                                className="group flex items-center gap-5 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.05)] transition-all cursor-pointer bg-white"
                                onClick={() => setSelectedAppointment(appointment)}
                              >
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                                  <Users className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-1.5">
                                      <div className="text-base font-bold text-slate-900 truncate">{appointment.patient}</div>
                                      <div className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wide">
                                        Token #{appointment.token || '?'}
                                      </div>
                                  </div>
                                  <div className="text-sm text-slate-500 flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5" /> {appointment.time}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="truncate flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {appointment.doctor}</span>
                                    {appointment.estimatedWaitTime > 0 && (appointment.status === 'Confirmed' || appointment.status === 'scheduled') && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Wait: ~{appointment.estimatedWaitTime}m</span>
                                        </>
                                    )}
                                  </div>
                                </div>
                                <Badge 
                                  variant={appointment.status === 'In Progress' ? 'default' : 'secondary'}
                                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                                      appointment.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200' : 
                                      appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                      'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {appointment.status}
                                </Badge>
                                <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                              </div>
                            ))}
                            </div>
                        );
                    })()}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <HospitalProfile />
              </TabsContent>

              <TabsContent value="doctors" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="border-slate-200 shadow-sm p-0 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Active Doctors</h3>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => setShowAddDoctor(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Doctor
                    </Button>
                  </div>
                  
                  <div className="p-4">
                  {doctors.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/30">
                            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="font-medium text-slate-900 mb-1">No doctors registered yet</p>
                            <p className="text-slate-500 mb-4">Add doctors to display them on your hospital profile.</p>
                            <Button variant="outline" onClick={() => setShowAddDoctor(true)}>Add First Doctor</Button>
                       </div>
                  ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {doctors.map((doc) => (
                              <div key={doc.id} className="border border-slate-200 rounded-xl p-4 relative group hover:shadow-lg hover:border-blue-200 transition-all bg-white">
                                  <div className="flex gap-4">
                                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
                                          {doc.image ? (
                                              <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                                          ) : (
                                              <Users className="w-6 h-6 text-slate-400" />
                                          )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1">
                                              <div className="font-bold text-slate-900 truncate">{doc.name}</div>
                                              {doc.verification_status === 'verified' && <VerificationBadge status="verified" />}
                                          </div>
                                          <div className="flex items-center gap-2 mb-0.5">
                                              <div className="text-xs font-medium text-blue-600">{doc.specialty}</div>
                                              {doc.verification_status === 'pending' && <Badge variant="outline" className="text-[10px] py-0 h-4 bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>}
                                              {doc.verification_status === 'rejected' && <Badge variant="outline" className="text-[10px] py-0 h-4 bg-red-50 text-red-600 border-red-200">Rejected</Badge>}
                                          </div>
                                          <div className="text-xs text-slate-500 truncate">{doc.qualification}</div>
                                      </div>
                                  </div>
                                  
                                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                      <div className="flex gap-2">
                                          <div className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                                              {doc.experience ? `${doc.experience}y Exp` : 'N/A'}
                                          </div>
                                          {/* Profile Completion (Mock) */}
                                          <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1">
                                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                              80%
                                          </div>
                                      </div>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button 
                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            onClick={() => {
                                                setDoctorForm(doc);
                                                setShowAddDoctor(true);
                                            }}
                                            title="Edit"
                                          >
                                              <Settings className="w-4 h-4" />
                                          </button>
                                          <button 
                                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                            onClick={() => {
                                                setDoctorForm(doc);
                                                setShowAddDoctor(true);
                                            }}
                                            title="Leaves"
                                          >
                                              <Calendar className="w-4 h-4" />
                                          </button>
                                          <button 
                                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                            onClick={() => handleDeleteDoctor(doc.id)}
                                            title="Remove"
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="staffing" className="space-y-3">
                  <StaffManagement />
              </TabsContent>

              <TabsContent value="analytics">
                 <HospitalAnalytics />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                 <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Settings Module...</div>}>
                    <HospitalProfileSettings />
                 </Suspense>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-indigo-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-slate-900">Security & Compliance Center</h3>
                        <p className="text-sm text-slate-500">Manage access controls and audit logs</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <h4 className="font-semibold text-sm text-slate-900 mb-3">Data Export (Audit Tracked)</h4>
                          <div className="flex gap-3">
                              <Button variant="outline" onClick={() => handleSecureExport('appointments')} className="bg-white">
                                  Export Appointments (CSV)
                              </Button>
                              <Button variant="outline" onClick={() => handleSecureExport('patients')} className="bg-white">
                                  Export Patient List (CSV)
                              </Button>
                          </div>
                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                             <Activity className="w-3 h-3" />
                             All exports are watermarked and logged in the audit trail.
                          </p>
                      </div>
                      
                      <div>
                          <h4 className="font-semibold text-sm text-slate-900 mb-3">Recent Activity</h4>
                          <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                              Audit logs are being captured in the background. 
                              <br/>
                              Viewable by Super Admins.
                          </div>
                      </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Department Monitoring Cards */}
            <Card className="border-0 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-3xl overflow-hidden bg-white">
              <div className="p-5 border-b border-slate-100 bg-white">
                 <h3 className="font-bold text-slate-900">Department Status</h3>
              </div>
              <div className="p-5">
                {!advancedStats ? (
                    <div className="text-center py-6 text-slate-400 text-sm font-medium">
                        Loading monitor...
                    </div>
                ) : (
                    <div className="space-y-4">
                      {advancedStats.departments.map((dept: any) => (
                          <div 
                            key={dept.id} 
                            className={`flex flex-col gap-2 pb-4 border-b border-slate-50 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors ${activeDepartmentFilter === dept.name ? 'bg-slate-50 ring-1 ring-slate-200' : ''}`}
                            onClick={() => {
                                if (activeDepartmentFilter === dept.name) {
                                    setActiveDepartmentFilter(null);
                                } else {
                                    setActiveDepartmentFilter(dept.name);
                                    setActiveTab('appointments');
                                }
                            }}
                          >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">{dept.name}</span>
                                <Badge className={`shadow-none px-2.5 py-0.5 ${
                                    dept.status === 'Overloaded' ? 'bg-red-100 text-red-700 border-red-200' :
                                    dept.status === 'Busy' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                    'bg-emerald-100 text-emerald-700 border-emerald-200'
                                }`}>{dept.status}</Badge>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Queue: <span className="font-semibold text-slate-900">{dept.queueLength}</span></span>
                                <span>Wait: <span className="font-semibold text-slate-900">~{dept.avgWaitTime}m</span></span>
                                <span>Docs: <span className="font-semibold text-slate-900">{dept.activeDoctors}</span></span>
                            </div>
                          </div>
                      ))}
                      {advancedStats.departments.length === 0 && (
                          <div className="text-center text-slate-400 text-xs">No active departments</div>
                      )}
                    </div>
                )}
              </div>
            </Card>

            {/* Financial Projection Panel */}
            {userRole !== 'doctor' && (
            <Card className="border-0 shadow-lg relative overflow-hidden bg-[#0F172A] text-white rounded-3xl">
              <div className="p-8 relative z-10">
                <div className="flex items-center gap-2 mb-6 text-indigo-200">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                        <DollarSign className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Financial Health</span>
                </div>
                
                {advancedStats ? (
                    <>
                        <div className="mb-6">
                            <div className="text-sm text-slate-400 mb-1">Projected Month-End</div>
                            <div className="text-4xl font-bold tracking-tight flex items-end gap-3">
                                ₹{advancedStats.finance.projectedRevenue.toLocaleString()}
                                {advancedStats.finance.trend === 'up' && <TrendingUp className="w-6 h-6 text-emerald-400 mb-1" />}
                                {advancedStats.finance.trend === 'stable' && <Activity className="w-6 h-6 text-blue-400 mb-1" />}
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-6 border-t border-slate-800">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Daily Run Rate</span>
                                <span className="font-semibold text-white">₹{advancedStats.finance.dailyRunRate.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">MTD Revenue</span>
                                <span className="font-semibold text-emerald-400">₹{advancedStats.finance.mtdRevenue.toLocaleString()}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-slate-500">Loading financial data...</div>
                )}
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-[60px] -ml-20 -mb-20"></div>
            </Card>
            )}

            {/* Doctor Utilization (Sidebar Widget or should be main? It fits here as a summary list) */}
            {advancedStats?.doctorUtilization?.length > 0 && (
                <Card className="border-0 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-3xl overflow-hidden bg-white">
                    <div className="p-5 border-b border-slate-100 bg-white">
                        <h3 className="font-bold text-slate-900">Doctor Utilization</h3>
                    </div>
                    <div className="p-2">
                        {advancedStats.doctorUtilization.slice(0, 5).map((doc: any) => (
                            <div key={doc.id} className="p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-semibold text-slate-700">{doc.name}</span>
                                    <span className={`text-xs font-bold ${
                                        doc.utilization > 90 ? 'text-rose-600' : 
                                        doc.utilization > 70 ? 'text-emerald-600' : 'text-slate-500'
                                    }`}>{doc.utilization}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${
                                            doc.utilization > 90 ? 'bg-rose-500' : 
                                            doc.utilization > 70 ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`} 
                                        style={{ width: `${doc.utilization}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                                    <span>{doc.slotsUsed}/{doc.slotsAssigned} slots</span>
                                    <span>{doc.department}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <>
            <style>{`
              @keyframes celebrate-fall {
                0% { transform: translateY(-20vh) rotate(0deg) translateX(0); opacity: 1; }
                25% { transform: translateY(20vh) rotate(90deg) translateX(20px); }
                50% { transform: translateY(50vh) rotate(180deg) translateX(-20px); }
                75% { transform: translateY(80vh) rotate(270deg) translateX(20px); }
                100% { transform: translateY(120vh) rotate(360deg) translateX(0); opacity: 0; }
              }
            `}</style>
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
              {Array.from({ length: 50 }).map((_, i) => {
                const left = ((i * 1337 + 42) % 100) + '%';
                const delay = ((i * 314) % 5000) / 1000 + 's';
                const duration = 3 + ((i * 999) % 4000) / 1000 + 's';
                const bg = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'][(i * 7) % 5];
                return (
                  <div 
                    key={i}
                    className="absolute w-3 h-8 rounded-sm opacity-80"
                    style={{
                      left,
                      top: '-50px',
                      backgroundColor: bg,
                      animation: `celebrate-fall ${duration} linear infinite`,
                      animationDelay: delay
                    }}
                  />
                );
              })}
            </div>
            <Card className="relative z-10 w-full max-w-sm p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-t-4 border-t-green-500 text-center transform transition-all scale-100 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-200/20 animate-pulse rounded-full"></div>
                  <CheckCircle className="w-10 h-10 text-green-600 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 tracking-tight">Profile Published!</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                  Your hospital profile and doctor list have been successfully updated. Patients can now find and book appointments with you.
              </p>
              <Button 
                onClick={() => setShowSuccessModal(false)} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium h-12 shadow-lg hover:shadow-green-500/25 transition-all"
              >
                  Awesome, Continue
              </Button>
            </Card>
          </>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
            <DialogContent className="max-w-md border-0 shadow-2xl">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle>Appointment Details</DialogTitle>
                    <DialogDescription>
                        Booking Reference: <span className="font-mono text-slate-900">#{selectedAppointment.id.slice(0, 8).toUpperCase()}</span>
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    {showReschedule ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center gap-2 mb-4">
                                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100" onClick={() => setShowReschedule(false)}>
                                     <ChevronLeft className="w-4 h-4" />
                                 </Button>
                                 <h4 className="font-semibold text-slate-900">Reschedule Appointment</h4>
                             </div>
                             
                             <div className="space-y-4">
                                 <div>
                                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Select New Date</label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal border-slate-200 shadow-sm h-10",
                                                    !rescheduleDate && "text-muted-foreground"
                                                )}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {rescheduleDate ? format(new Date(rescheduleDate + "T00:00:00"), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[100]" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={rescheduleDate ? new Date(rescheduleDate + "T00:00:00") : undefined}
                                                onSelect={async (date) => {
                                                     if (!date) return;
                                                     const dateStr = format(date, "yyyy-MM-dd");
                                                     setRescheduleDate(dateStr);
                                                     setRescheduleSlots([]);
                                                     
                                                     try {
                                                          const { data: { session } } = await supabase.auth.getSession();
                                                          if (!session) return;
                                                          
                                                          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/get-slots`, {
                                                              method: 'POST',
                                                              headers: {
                                                                  'Content-Type': 'application/json',
                                                                  'Authorization': `Bearer ${publicAnonKey}`,
                                                                  'X-Supabase-Auth': session.access_token
                                                              },
                                                              body: JSON.stringify({
                                                                  authToken: session.access_token,
                                                                  date: dateStr,
                                                                  hospitalId: session.user.id,
                                                                  includeAll: false
                                                              })
                                                          });
                                                          
                                                          if (response.ok) {
                                                              const data = await response.json();
                                                              setRescheduleSlots(data.filter((s:any) => s.status === 'available'));
                                                          }
                                                     } catch(err) {
                                                         toast.error("Failed to load slots");
                                                     }
                                                }}
                                                initialFocus
                                                fromDate={new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                 </div>
                                 
                                 {rescheduleDate && (
                                     <div>
                                         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Available Slots</label>
                                         {rescheduleSlots.length > 0 ? (
                                             <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                                                 {rescheduleSlots.map(slot => (
                                                     <button
                                                         key={slot.id}
                                                         onClick={async () => {
                                                             if(!confirm(`Reschedule to ${slot.time} on ${slot.date}?`)) return;
                                                             
                                                             const { data: { session } } = await supabase.auth.getSession();
                                                             if (!session) return;

                                                             const toastId = toast.loading("Rescheduling...");
                                                             try {
                                                                  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/reschedule-appointment`, {
                                                                      method: 'POST',
                                                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token },
                                                                      body: JSON.stringify({
                                                                          authToken: session.access_token,
                                                                          appointmentId: selectedAppointment.id,
                                                                          newSlotId: slot.id,
                                                                          date: slot.date,
                                                                          time: slot.time
                                                                      })
                                                                  });
                                                                  
                                                                  if (response.ok) {
                                                                      setRescheduledDetails({
                                                                          patient: selectedAppointment.patient,
                                                                          date: slot.date,
                                                                          time: slot.time
                                                                      });
                                                                      setShowReschedule(false);
                                                                      setSelectedAppointment(null);
                                                                      setShowRescheduleSuccess(true);
                                                                      fetchStats();
                                                                      fetchSlots(selectedDate);
                                                                  } else {
                                                                      const err = await response.json();
                                                                      toast.error(err.error || "Reschedule failed");
                                                                  }
                                                             } catch (e) {
                                                                 toast.error("Connection error");
                                                             }
                                                             toast.dismiss(toastId);
                                                         }}
                                                         className="px-2 py-2 text-sm border rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-center bg-white"
                                                     >
                                                         {slot.time}
                                                     </button>
                                                 ))}
                                             </div>
                                         ) : (
                                             <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed rounded-lg bg-slate-50">
                                                 No available slots found for this date.
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
                        </div>
                    ) : (
                        <>
                            {/* Status Badge */}
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                 <span className="text-sm font-medium text-slate-600">Current Status</span>
                                 <Badge variant={selectedAppointment.status === 'In Progress' ? 'default' : 'secondary'} className={`uppercase ${selectedAppointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                                     {selectedAppointment.status}
                                 </Badge>
                            </div>

                            {/* Patient Info */}
                            <div>
                                 <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">Patient</h4>
                                 <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                                     <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-md">
                                         <Users className="w-5 h-5" />
                                     </div>
                                     <div>
                                         <div className="font-bold text-base text-slate-900">{selectedAppointment.patient}</div>
                                         <div className="text-sm text-slate-500">
                                             {selectedAppointment.patientDetails?.age ? `${selectedAppointment.patientDetails.age} yrs` : 'Age N/A'} • {selectedAppointment.patientDetails?.gender || 'Gender N/A'}
                                         </div>
                                         {selectedAppointment.patientDetails?.phone && (
                                             <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                                                 <Phone className="w-3 h-3" /> {selectedAppointment.patientDetails.phone}
                                             </div>
                                         )}
                                     </div>
                                 </div>
                            </div>
                            
                            {/* Visit Info */}
                            <div>
                                 <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">Consultation</h4>
                                 <div className="grid grid-cols-2 gap-3 text-sm p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                                     <div>
                                         <span className="text-slate-400 block text-xs font-medium mb-0.5">Assigned Doctor</span>
                                         <span className="font-semibold text-slate-900">{selectedAppointment.doctor}</span>
                                     </div>
                                     <div>
                                         <span className="text-slate-400 block text-xs font-medium mb-0.5">Date & Time</span>
                                         <span className="font-semibold text-slate-900">{selectedAppointment.date || 'Today'} • {selectedAppointment.time}</span>
                                     </div>
                                     {selectedAppointment.estimatedWaitTime > 0 && selectedAppointment.status === 'Confirmed' && (
                                         <div className="col-span-2 pt-3 border-t border-slate-200 mt-1 flex items-center gap-2">
                                             <Clock className="w-4 h-4 text-amber-500" />
                                             <span className="text-slate-600 font-medium">Estimated Wait: <span className="text-slate-900 font-bold">{selectedAppointment.estimatedWaitTime} mins</span></span>
                                         </div>
                                     )}
                                     {selectedAppointment.reason && (
                                         <div className="col-span-2 pt-3 border-t border-slate-200 mt-1">
                                             <span className="text-slate-400 block text-xs font-medium mb-0.5">Reason for Visit</span>
                                             <span className="font-medium text-slate-700">{selectedAppointment.reason}</span>
                                         </div>
                                     )}
                                 </div>
                            </div>

                            {/* History / Audit Log */}
                            {appointmentLogs.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">History</h4>
                                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 max-h-32 overflow-y-auto space-y-2">
                                        {appointmentLogs.map(log => (
                                            <div key={log.id} className="text-xs flex justify-between items-center text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${log.newStatus === 'completed' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {log.previousStatus} → <strong>{log.newStatus}</strong>
                                                </span>
                                                <span className="opacity-70">{new Date(log.changedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2 flex-col sm:flex-row">
                    <Button variant="ghost" onClick={() => setSelectedAppointment(null)} className="h-10">Close</Button>
                    
                    {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'no_show' && (
                        <>
                            {userRole === 'hospital' && (
                                <Button variant="outline" className="h-10 text-slate-600" onClick={() => setShowReschedule(true)}>
                                    Reschedule
                                </Button>
                            )}
                            
                            {userRole === 'hospital' && (
                                <Button variant="outline" className="h-10 text-amber-700 hover:bg-amber-50 border-amber-200" onClick={async () => {
                                    if(!confirm("Mark as No-Show?")) return;
                                    const { data: { session } } = await supabase.auth.getSession();
                                    if (!session) return;
                                    
                                    const toastId = toast.loading("Updating...");
                                    try {
                                        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/update-appointment-status`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token },
                                            body: JSON.stringify({ authToken: session.access_token, appointmentId: selectedAppointment.id, status: 'no_show' })
                                        });
                                        if (response.ok) { 
                                            toast.success("Marked as No-Show"); 
                                            fetchStats(); 
                                            setSelectedAppointment(null); 
                                        } else {
                                            toast.error("Failed to update status");
                                        }
                                    } catch (e) {
                                        toast.error("Connection error");
                                    }
                                    toast.dismiss(toastId);
                                }}>
                                    No-Show
                                </Button>
                            )}

                            <Button className="h-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={async () => {
                                const { data: { session } } = await supabase.auth.getSession();
                                if (!session) return;
                                
                                const toastId = toast.loading("Completing appointment...");
                                try {
                                    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/update-appointment-status`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token },
                                        body: JSON.stringify({ authToken: session.access_token, appointmentId: selectedAppointment.id, status: 'completed' })
                                    });
                                    if (response.ok) { 
                                        toast.success("Marked as Completed"); 
                                        fetchStats(); 
                                        setSelectedAppointment(null); 
                                    } else {
                                        toast.error("Failed to complete appointment");
                                    }
                                } catch (e) { 
                                    toast.error("Connection error"); 
                                }
                                toast.dismiss(toastId);
                            }}>
                                <CheckCircle className="w-4 h-4 mr-2" /> Complete
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      {/* Create Slot Modal */}
      {showCreateSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-6 bg-white shadow-2xl border-0 rounded-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Generate Slots</h3>
                <div className="flex items-center gap-2">
                    <select 
                        className="text-xs border-slate-200 rounded-lg py-1 px-2 bg-slate-50 text-slate-600 outline-none focus:ring-1 focus:ring-blue-500"
                        onChange={(e) => {
                             if(e.target.value === 'morning') {
                                 setSlotForm(prev => ({...prev, startTime: '09:00', endTime: '13:00', tokenCount: '16'}));
                             } else if(e.target.value === 'evening') {
                                 setSlotForm(prev => ({...prev, startTime: '17:00', endTime: '21:00', tokenCount: '16'}));
                             }
                        }}
                    >
                        <option value="">Use Template...</option>
                        <option value="morning">Morning OPD (9-1)</option>
                        <option value="evening">Evening OPD (5-9)</option>
                    </select>
                </div>
            </div>
            
            <div className="space-y-5">
              {/* Recurrence Type Selector */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Frequency</label>
                  <div className="grid grid-cols-4 gap-2">
                      {['one-time', 'daily', 'weekdays', 'custom'].map(type => (
                          <button
                              key={type}
                              className={`py-2 px-1 text-xs font-semibold rounded-lg capitalize border transition-all ${
                                  slotForm.recurrenceType === type 
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                              }`}
                              onClick={() => setSlotForm({...slotForm, recurrenceType: type})}
                          >
                              {type}
                          </button>
                      ))}
                  </div>
              </div>

              {slotForm.recurrenceType === 'one-time' ? (
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-slate-700">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-9 pr-3 py-2.5 h-auto justify-start text-left font-normal border-slate-200 hover:bg-transparent",
                                !slotForm.date && "text-muted-foreground"
                              )}
                            >
                              {slotForm.date ? format(new Date(slotForm.date + "T00:00:00"), "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={slotForm.date ? new Date(slotForm.date + "T00:00:00") : undefined}
                              onSelect={(date) => date && setSlotForm({...slotForm, date: format(date, "yyyy-MM-dd")})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                    </div>
                  </div>
              ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-sm font-semibold mb-1.5 block text-slate-700">Start Date</label>
                              <input 
                                type="date" 
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={slotForm.date}
                                onChange={(e) => setSlotForm({...slotForm, date: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="text-sm font-semibold mb-1.5 block text-slate-700">End Condition</label>
                              <select 
                                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white outline-none"
                                  value={slotForm.endCondition}
                                  onChange={(e) => setSlotForm({...slotForm, endCondition: e.target.value})}
                              >
                                  <option value="date">End Date</option>
                                  <option value="count">Occurrence Count</option>
                              </select>
                          </div>
                      </div>
                      
                      {slotForm.endCondition === 'date' ? (
                          <div>
                              <label className="text-sm font-semibold mb-1.5 block text-slate-700">End Date</label>
                              <input 
                                type="date" 
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={slotForm.endDate}
                                onChange={(e) => setSlotForm({...slotForm, endDate: e.target.value})}
                              />
                          </div>
                      ) : (
                          <div>
                              <label className="text-sm font-semibold mb-1.5 block text-slate-700">Number of Occurrences</label>
                              <input 
                                type="number" 
                                min="1" max="365"
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={slotForm.occurrences}
                                onChange={(e) => setSlotForm({...slotForm, occurrences: e.target.value})}
                              />
                          </div>
                      )}

                      {slotForm.recurrenceType === 'custom' && (
                          <div>
                              <label className="text-sm font-semibold mb-2 block text-slate-700">Select Days</label>
                              <div className="flex justify-between gap-1">
                                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                                      const isSelected = slotForm.customDays.includes(idx);
                                      return (
                                          <button
                                              key={idx}
                                              className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                                                  isSelected 
                                                  ? 'bg-blue-600 text-white shadow-md scale-105' 
                                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                              }`}
                                              onClick={() => {
                                                  const newDays = isSelected 
                                                      ? slotForm.customDays.filter(d => d !== idx)
                                                      : [...slotForm.customDays, idx];
                                                  setSlotForm({...slotForm, customDays: newDays});
                                              }}
                                          >
                                              {day}
                                          </button>
                                      );
                                  })}
                              </div>
                              {slotForm.customDays.length === 0 && <p className="text-xs text-rose-500 mt-1">Please select at least one day.</p>}
                          </div>
                      )}
                  </div>
              )}
              
              <div>
                <label className="text-sm font-semibold mb-1.5 block text-slate-700">Assign Doctor (Optional)</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                        value={slotForm.doctorId}
                        onChange={(e) => setSlotForm({...slotForm, doctorId: e.target.value})}
                    >
                        <option value="">-- General / Unassigned --</option>
                        {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                        ))}
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-slate-700">Type</label>
                    <select 
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                        value={slotForm.consultationType}
                        onChange={(e) => setSlotForm({...slotForm, consultationType: e.target.value})}
                    >
                        <option value="OPD">Standard OPD</option>
                        <option value="VIDEO">Video Consultation</option>
                        <option value="EMERGENCY">Emergency / Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block text-slate-700">Start Time</label>
                    <input 
                        type="time" 
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={slotForm.startTime}
                        onChange={(e) => setSlotForm({...slotForm, startTime: e.target.value})}
                    />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700">End Time</label>
                  <input 
                    type="time" 
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({...slotForm, endTime: e.target.value})}
                  />
                </div>
                 <div>
                    <label className="text-sm font-semibold mb-1.5 block text-slate-700">No. of Tokens</label>
                    <input 
                        type="number"
                        min="1"
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={slotForm.tokenCount}
                        onChange={(e) => setSlotForm({...slotForm, tokenCount: e.target.value})}
                    />
                 </div>
              </div>

              {/* Advanced / Overflow Settings */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-500" />
                          Overflow Configuration
                      </label>
                      <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            id="overflowEnabled"
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300 cursor-pointer mr-2"
                            checked={slotForm.overflowEnabled}
                            onChange={(e) => setSlotForm({...slotForm, overflowEnabled: e.target.checked})}
                        />
                        <label htmlFor="overflowEnabled" className="text-xs text-slate-600 cursor-pointer select-none">Enable Overflow</label>
                      </div>
                  </div>
                  
                  {slotForm.overflowEnabled && (
                      <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-3 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-1">
                          <div>
                              <label className="text-xs font-semibold mb-1 block text-slate-700">Overflow Slots</label>
                              <input 
                                  type="number" 
                                  min="1"
                                  className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
                                  value={slotForm.overflowCapacity}
                                  onChange={(e) => setSlotForm({...slotForm, overflowCapacity: e.target.value})}
                              />
                          </div>
                          <div className="flex items-center pt-5">
                              <p className="text-[10px] text-amber-700 leading-tight">
                                  Overflow slots activate automatically when regular capacity ({slotForm.tokenCount}) is full.
                              </p>
                          </div>
                      </div>
                  )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setShowCreateSlot(false)} className="hover:bg-slate-100">Cancel</Button>
                <Button onClick={handleCreateSlots} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                  {slotForm.recurrenceType === 'one-time' ? 'Generate Slots' : 'Create Recurring Schedule'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Add/Edit Doctor Modal - Enhanced with Tabs and Shifts */}
      <DoctorManagementModal 
          isOpen={showAddDoctor}
          onClose={() => {
              setShowAddDoctor(false);
              setDoctorForm({
                  id: '', name: '', specialty: '', qualification: '', experience: '', 
                  consultationFee: '', location: '', image: '', availableToday: true, videoConsultation: true
              });
          }}
          doctor={doctorForm.id ? doctorForm : null}
          onSuccess={() => {
              fetchHospitalDoctors();
              setShowAddDoctor(false);
              setDoctorForm({
                  id: '', name: '', specialty: '', qualification: '', experience: '', 
                  consultationFee: '', location: '', image: '', availableToday: true, videoConsultation: true
              });
          }}
          hospitalId={userId}
          userRole={userRole}
      />

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
                <h3 className="text-lg font-bold mb-4">Reschedule Appointment</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700">Select New Date</label>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal border-slate-200 shadow-sm",
                                            !rescheduleDate && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {rescheduleDate ? format(new Date(rescheduleDate + "T00:00:00"), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[80]" align="start">
                                    <CalendarComponent
                                        mode="single"
                                        selected={rescheduleDate ? new Date(rescheduleDate + "T00:00:00") : undefined}
                                        onSelect={(date) => setRescheduleDate(date ? format(date, "yyyy-MM-dd") : '')}
                                        initialFocus
                                        fromDate={new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Button className="bg-slate-900 text-white" onClick={async () => {
                                 if(!rescheduleDate) return;
                                 const { data: { session } } = await supabase.auth.getSession();
                                 if(!session) return;
                                 const toastId = toast.loading("Finding slots...");
                                 try {
                                     const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/get-slots`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token },
                                        body: JSON.stringify({ authToken: session.access_token, date: rescheduleDate, hospitalId: session.user.id })
                                     });
                                     if(response.ok) {
                                         const data = await response.json();
                                         setRescheduleSlots(data);
                                         if(data.length === 0) toast.error("No slots found for this date");
                                     }
                                 } catch(e) { toast.error("Error fetching slots"); }
                                 toast.dismiss(toastId);
                            }}>
                                Find
                            </Button>
                        </div>
                    </div>
                    
                    {rescheduleSlots.length > 0 && (
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Select a time slot:</p>
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                                {rescheduleSlots.filter(s => s.status === 'available').map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={async () => {
                                            if(!confirm(`Reschedule to ${slot.time}?`)) return;
                                            const { data: { session } } = await supabase.auth.getSession();
                                            if(!session) return;
                                            
                                            const toastId = toast.loading("Rescheduling...");
                                            try {
                                                const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/reschedule-appointment`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token },
                                                    body: JSON.stringify({ 
                                                        authToken: session.access_token, 
                                                        appointmentId: selectedAppointment.id,
                                                        newSlotId: slot.id,
                                                        date: slot.date,
                                                        time: slot.time
                                                    })
                                                });
                                                
                                                if(response.ok) {
                                                    setRescheduledDetails({
                                                        patient: selectedAppointment.patient,
                                                        date: slot.date,
                                                        time: slot.time
                                                    });
                                                    setShowReschedule(false);
                                                    setSelectedAppointment(null);
                                                    setShowRescheduleSuccess(true);
                                                    fetchStats();
                                                    fetchSlots(selectedDate);
                                                } else {
                                                    toast.error("Failed to reschedule");
                                                }
                                            } catch(e) { toast.error("Error"); }
                                            toast.dismiss(toastId);
                                        }}
                                        className="p-2 text-xs border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all font-medium"
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                    <Button variant="ghost" onClick={() => setShowReschedule(false)}>Cancel</Button>
                </div>
            </Card>
        </div>
      )}
      
      {/* Reschedule Success Modal */}
      {showRescheduleSuccess && rescheduledDetails && (
        <Dialog open={showRescheduleSuccess} onOpenChange={setShowRescheduleSuccess}>
          <DialogContent className="sm:max-w-md text-center">
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-xl">Rescheduled Successfully!</DialogTitle>
                <DialogDescription className="text-center pt-2">
                  Appointment for <span className="font-bold text-slate-900">{rescheduledDetails.patient}</span> has been moved to:
                </DialogDescription>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                  <div className="text-lg font-bold text-slate-900">{rescheduledDetails.time}</div>
                  <div className="text-sm text-slate-500 font-medium">{format(new Date(rescheduledDetails.date + "T00:00:00"), 'PPP')}</div>
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button onClick={() => setShowRescheduleSuccess(false)} className="bg-slate-900 text-white min-w-[120px]">
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}