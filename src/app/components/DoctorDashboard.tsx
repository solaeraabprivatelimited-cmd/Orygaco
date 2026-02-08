import { Calendar, Users, Clock, Video, FileText, CheckCircle, XCircle, MoreVertical, TrendingUp, DollarSign, Bell, Search, Filter, ChevronRight, Activity, MapPin, Plus, Star, Phone, Zap, AlertTriangle, Pause, Play, ChevronDown, Check } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface DoctorDashboardProps {
  onNavigate: (view: string) => void;
}

const patientActivityData = [
  { name: 'Mon', visits: 12 },
  { name: 'Tue', visits: 18 },
  { name: 'Wed', visits: 15 },
  { name: 'Thu', visits: 22 },
  { name: 'Fri', visits: 20 },
  { name: 'Sat', visits: 10 },
  { name: 'Sun', visits: 5 },
];

interface KPIStats {
  patientsSeenToday: number;
  todaysEarnings: number;
  nextAppointmentTime: string | null;
  totalPatients: number;
  averageRating: number;
  monthlyRevenue: number;
}

interface NextAppointment {
  appointmentId: string;
  patientId: string;
  patientName: string;
  type: 'Video' | 'In-person';
  startTime: string;
  date: string;
  status: string;
  image?: string;
}

interface ActionItem {
  id: string;
  type: 'prescription' | 'report' | 'follow_up' | 'no_show';
  label: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
}

export function DoctorDashboard({ onNavigate }: DoctorDashboardProps) {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  
  // New State for Enhanced Dashboard
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [nextPatient, setNextPatient] = useState<NextAppointment | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  
  const [availabilityForm, setAvailabilityForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00'
  });
  const [generatingSlots, setGeneratingSlots] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setDoctor({
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Doctor',
            email: user.email,
            specialty: user.user_metadata?.specialty || 'General Practitioner',
            image: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100',
            reviewCount: 0, 
            ...user.user_metadata
          });

          // Fetch Dashboard Data
          let { data: { session } } = await supabase.auth.getSession();
          if (!session) {
             const { data: { session: refreshed } } = await supabase.auth.refreshSession();
             session = refreshed;
          }

          if (session) {
             const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
                'X-Supabase-Auth': session.access_token
             };

             // 1. Fetch KPIs
             fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/dashboard/kpis`, { headers })
               .then(res => res.json())
               .then(data => setKpis(data))
               .catch(err => console.error("KPI fetch error", err));

             // 2. Fetch Next Appointment
             fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/dashboard/next-appointment`, { headers })
               .then(res => res.json())
               .then(data => setNextPatient(data))
               .catch(err => console.error("Next Patient fetch error", err));

             // 3. Fetch Action Items
             fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/dashboard/action-items`, { headers })
               .then(res => res.json())
               .then(data => setActionItems(Array.isArray(data) ? data : []))
               .catch(err => console.error("Action Items fetch error", err));

             // 4. Fetch Today's Schedule (Enhanced)
             fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/dashboard/today-schedule`, { headers })
               .then(res => res.json())
               .then(data => setTodaySchedule(Array.isArray(data) ? data : []))
               .catch(err => console.error("Schedule fetch error", err));
          }
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleGenerateSlots = async () => {
    try {
      setGeneratingSlots(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
          toast.error("Session expired.");
          return;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': session.access_token
        },
        body: JSON.stringify({
            authToken: session.access_token,
            ...availabilityForm
        })
      });

      if (response.ok) {
        toast.success('Availability slots published');
        setShowAvailabilityModal(false);
      } else {
        toast.error('Failed to publish slots');
      }
    } catch (error) {
      toast.error('Failed to generate slots');
    } finally {
      setGeneratingSlots(false);
    }
  };

  const handleTemporaryAvailability = async (type: 'pause' | 'emergency' | 'override', duration?: number) => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const toastId = toast.loading('Updating availability...');
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/availability/temporary`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'X-Supabase-Auth': session.access_token
              },
              body: JSON.stringify({
                  authToken: session.access_token,
                  type,
                  duration
              })
          });

          toast.dismiss(toastId);
          if (response.ok) {
              toast.success(`Availability updated: ${type}`);
              setShowAvailabilityModal(false);
          } else {
              toast.error('Failed to update availability');
          }
      } catch (e) {
          toast.error('An error occurred');
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctor) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p>Please sign in to access the doctor portal</p>
        <Button onClick={() => onNavigate('auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="bg-primary/10 p-2 rounded-lg md:hidden">
                    <Activity className="w-5 h-5 text-primary fill-current" />
                 </div>
                 <h1 className="text-xl font-semibold text-slate-900 hidden md:block">
                    Doctor Portal
                 </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search patients..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer" onClick={() => onNavigate('doctor-profile')}>
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-slate-900">{doctor.name}</div>
                        <div className="text-xs text-slate-500">{doctor.specialty}</div>
                    </div>
                    <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={doctor.image} alt={doctor.name} />
                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome back, {doctor.name.split(' ')[0]}
                </h2>
                <p className="text-slate-500 mt-1">
                    You have <span className="font-semibold text-slate-900">{todaySchedule.length} appointments</span> scheduled for today.
                </p>
            </div>
            <div className="flex gap-3">
                 <Button variant="secondary" className="hidden sm:flex" onClick={() => setShowAvailabilityModal(true)}>
                    Update Availability
                </Button>
                <Button onClick={() => onNavigate('doctor-patients')} className="px-6">
                    <Plus className="w-4 h-4 mr-2" /> New Patient
                </Button>
            </div>
        </motion.div>

        {/* Next Patient Focus Card (New Feature) */}
        {nextPatient && (
            <motion.div variants={itemVariants}>
                <Card className="border-l-4 border-l-primary shadow-md bg-white overflow-hidden relative">
                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                    <AvatarImage src={nextPatient.image} />
                                    <AvatarFallback>{nextPatient.patientName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${nextPatient.type === 'Video' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                        Next Patient
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        Starts in {Math.max(0, Math.floor((new Date(`${nextPatient.date} ${nextPatient.startTime}`).getTime() - Date.now()) / 60000))} mins
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{nextPatient.patientName}</h3>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        {nextPatient.type === 'Video' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                        {nextPatient.type} Consultation
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {nextPatient.startTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                            <Button variant="outline" size="lg" className="flex-1 md:flex-none" onClick={() => onNavigate('doctor-patients')}>
                                View Profile
                            </Button>
                            <Button size="lg" className="flex-1 md:flex-none shadow-lg shadow-primary/20">
                                {nextPatient.type === 'Video' ? (
                                    <>
                                        <Video className="w-4 h-4 mr-2" /> Join Call
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" /> Start Visit
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    {/* Status Banner based on backend logic */}
                    {nextPatient.status === 'waiting_late' && (
                        <div className="bg-amber-50 text-amber-800 text-xs px-6 py-1 flex items-center justify-center font-medium border-t border-amber-100">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Patient is running late (5+ mins)
                        </div>
                    )}
                </Card>
            </motion.div>
        )}

        {/* Enhanced Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                        <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        Today
                    </span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.patientsSeenToday || 0}</div>
                <div className="text-xs text-slate-500">Patients Seen</div>
            </Card>

            <Card className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-green-50 rounded-lg text-green-500">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">Today</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">₹{kpis?.todaysEarnings || 0}</div>
                <div className="text-xs text-slate-500">Earnings</div>
            </Card>

            <Card className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-500">
                        <Star className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-500">Avg</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.averageRating || 4.8}</div>
                <div className="text-xs text-slate-500">Patient Rating</div>
            </Card>

            <Card className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">Total</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.totalPatients || 0}</div>
                <div className="text-xs text-slate-500">Total Patients</div>
            </Card>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Content (Left) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Today's Schedule (Enhanced with Intelligent Status) */}
                <motion.div variants={itemVariants}>
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">Today's Schedule</h3>
                                <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" className="gap-2">
                                    <Filter className="w-3 h-3" /> Filter
                                </Button>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {todaySchedule.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No appointments scheduled for today.
                                </div>
                            ) : (
                                todaySchedule.map((apt) => (
                                    <div key={apt.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center gap-4 group cursor-pointer">
                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-slate-100 text-slate-600 font-medium shrink-0">
                                            <span className="text-xs uppercase">{apt.time.split(' ')[1]}</span>
                                            <span className="text-lg font-bold text-slate-900">{apt.time.split(' ')[0]}</span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-slate-900 truncate">{apt.patient?.name || apt.patientDetails?.name || "Unknown Patient"}</h4>
                                                
                                                {/* Intelligent Status Badges */}
                                                {apt.computedStatus === 'waiting_late' && (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none animate-pulse">
                                                        Late (5m+)
                                                    </Badge>
                                                )}
                                                {apt.computedStatus === 'waiting' && (
                                                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">
                                                        Waiting
                                                    </Badge>
                                                )}
                                                {apt.status === 'completed' && (
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                                                        Completed
                                                    </Badge>
                                                )}
                                                {(apt.status === 'scheduled' || apt.status === 'confirmed') && !apt.computedStatus && (
                                                    <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50">
                                                        Confirmed
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    {apt.type === 'Video' || apt.type === 'video' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                                    {apt.type} Consult
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="truncate">{apt.symptoms || "Routine Checkup"}</span>
                                            </div>
                                        </div>
    
                                        <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            {apt.status !== 'completed' && (
                                                <Button size="sm" className={apt.status === 'Waiting' ? "bg-primary hover:bg-primary/90" : "bg-slate-900 hover:bg-slate-800"}>
                                                    {apt.type === 'Video' || apt.type === 'video' ? 'Join Call' : 'Start Visit'}
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <Button variant="link" className="text-primary text-sm font-medium">View Full Calendar</Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Patient Activity Chart */}
                <motion.div variants={itemVariants}>
                    <Card className="border-none shadow-sm bg-white/80 backdrop-blur-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">Patient Visits</h3>
                                <p className="text-sm text-slate-500">Last 7 Days</p>
                            </div>
                        </div>
                        <div className="h-[250px] w-full mt-4 pr-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={patientActivityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar 
                                        dataKey="visits" 
                                        fill="#3b82f6" 
                                        radius={[4, 4, 0, 0]} 
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Sidebar (Right) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Doctor Inbox (Enhanced Action Items) */}
                <motion.div variants={itemVariants}>
                    <Card className="p-0 border-none shadow-md bg-white overflow-hidden">
                         <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                             <h3 className="font-semibold text-slate-900">Doctor Inbox</h3>
                             <Badge variant="secondary" className="bg-slate-100 text-slate-600">{actionItems.length}</Badge>
                        </div>
                        <div className="divide-y divide-slate-50">
                             {actionItems.length === 0 ? (
                                 <div className="text-center text-sm text-slate-400 py-8">
                                    All clear! No pending items.
                                 </div>
                             ) : (
                                 actionItems.map((item) => (
                                     <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer">
                                         <div className={`mt-0.5 p-1.5 rounded-full ${
                                             item.type === 'prescription' ? 'bg-blue-100 text-blue-600' :
                                             item.type === 'report' ? 'bg-purple-100 text-purple-600' :
                                             'bg-orange-100 text-orange-600'
                                         }`}>
                                             {item.type === 'prescription' ? <FileText className="w-3.5 h-3.5" /> :
                                              item.type === 'report' ? <Activity className="w-3.5 h-3.5" /> :
                                              <Bell className="w-3.5 h-3.5" />}
                                         </div>
                                         <div className="flex-1">
                                             <p className="text-sm font-medium text-slate-900 leading-tight mb-1">{item.label}</p>
                                             <div className="flex items-center justify-between">
                                                 <span className="text-xs text-slate-500 capitalize">{item.priority} Priority</span>
                                                 <span className="text-xs font-semibold text-primary hover:underline">{item.action}</span>
                                             </div>
                                         </div>
                                     </div>
                                 ))
                             )}
                        </div>
                        <div className="p-3 bg-slate-50/50 text-center border-t border-slate-100">
                            <Button variant="ghost" size="sm" className="text-xs w-full text-slate-500">View All Tasks</Button>
                        </div>
                    </Card>
                </motion.div>

                 {/* Recent Patients */}
                <motion.div variants={itemVariants}>
                    <Card className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                             <h3 className="font-semibold text-slate-900">Recent Patients</h3>
                             <Button variant="ghost" size="sm" className="text-xs text-primary h-8" onClick={() => onNavigate('doctor-patients')}>View All</Button>
                        </div>
                        <div className="space-y-4">
                            {/* Placeholder for recent patients */}
                            <div className="text-center text-sm text-slate-400 py-4">
                                No recent patients
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* My Blogs */}
                <motion.div variants={itemVariants}>
                    <Card className="p-5 border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-md transition-all cursor-pointer" onClick={() => onNavigate('doctor-blog-management')}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">My Blogs</h3>
                        <p className="text-sm text-slate-600 mb-4">Share your medical expertise with patients</p>
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
                            Manage Blogs
                        </Button>
                    </Card>
                </motion.div>

                {/* System Status / Help */}
                <motion.div variants={itemVariants}>
                     <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                                <Zap className="w-6 h-6" />
                            </div>
                            <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-none">System Online</Badge>
                        </div>
                        <h4 className="font-semibold text-lg mb-1">Need Technical Help?</h4>
                        <p className="text-slate-400 text-sm mb-4">Our support team is available 24/7 for assistance.</p>
                        <Button variant="secondary" className="w-full bg-white text-slate-900 hover:bg-slate-100">
                            Contact Support
                        </Button>
                     </div>
                </motion.div>
            </div>
        </div>
      </motion.div>

      {/* Enhanced Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Update Availability</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAvailabilityModal(false)}>
                    <XCircle className="w-5 h-5 text-slate-400" />
                </Button>
            </div>
            
            <div className="space-y-6">
              {/* Quick Actions (New) */}
              <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Quick Actions</label>
                  <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="border-red-200 hover:bg-red-50 text-red-700 justify-start" onClick={() => handleTemporaryAvailability('pause', 30)}>
                          <Pause className="w-4 h-4 mr-2" /> Pause (30m)
                      </Button>
                      <Button variant="outline" className="border-blue-200 hover:bg-blue-50 text-blue-700 justify-start" onClick={() => handleTemporaryAvailability('emergency')}>
                          <Zap className="w-4 h-4 mr-2" /> Emergency Slot
                      </Button>
                  </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Standard Override</label>
                  <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Date</label>
                        <input 
                        type="date" 
                        className="w-full p-2 border rounded-md"
                        value={availabilityForm.date}
                        onChange={(e) => setAvailabilityForm({...availabilityForm, date: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="text-sm font-medium mb-1 block">Start Time</label>
                        <input 
                            type="time" 
                            className="w-full p-2 border rounded-md"
                            value={availabilityForm.startTime}
                            onChange={(e) => setAvailabilityForm({...availabilityForm, startTime: e.target.value})}
                        />
                        </div>
                        <div>
                        <label className="text-sm font-medium mb-1 block">End Time</label>
                        <input 
                            type="time" 
                            className="w-full p-2 border rounded-md"
                            value={availabilityForm.endTime}
                            onChange={(e) => setAvailabilityForm({...availabilityForm, endTime: e.target.value})}
                        />
                        </div>
                    </div>
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowAvailabilityModal(false)}>Cancel</Button>
                <Button onClick={handleGenerateSlots} disabled={generatingSlots}>
                  {generatingSlots ? 'Publishing...' : 'Publish Slots'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}