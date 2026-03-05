import { Calendar, Activity, FileText, Users, Video, Clock, Heart, Shield, AlertCircle, Plus, Search, ChevronRight, Bell, Menu, X, Pill, Stethoscope, MapPin, Star, Building } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { VoiceAssistant } from './VoiceAssistant';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function PatientDashboard() {
  const { navigate } = useAppNavigate();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [careView, setCareView] = useState<'doctors' | 'hospitals'>('doctors');
  
  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
      full_name: '',
      age: '',
      gender: '',
      email: ''
  });

  useEffect(() => {
      // Check if new user
      const isNewUser = localStorage.getItem('isNewUser') === 'true';
      if (isNewUser && user) {
          setShowOnboarding(true);
          if (user.email && !user.email.includes('placeholder')) {
              setOnboardingData(prev => ({ ...prev, email: user.email }));
          }
      }
  }, [user]);

  const handleOnboardingSubmit = async () => {
      if (!onboardingData.full_name || !onboardingData.age) {
          toast.error("Please fill in all required fields");
          return;
      }
      
      setOnboardingLoading(true); 
      try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/patient/profile`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                  authToken: token,
                  full_name: onboardingData.full_name,
                  age: onboardingData.age,
                  gender: onboardingData.gender,
                  email: onboardingData.email
              })
          });
          
          if (!response.ok) throw new Error('Failed to update profile');
          
          const data = await response.json();
          
          // Update local user
          const updatedUser = { 
              ...user, 
              ...data.user, 
              name: data.user.full_name || user.name 
          };
          
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.removeItem('isNewUser');
          setShowOnboarding(false);
          toast.success("Profile updated successfully!");
          
      } catch (e) {
          console.error(e);
          toast.error("Failed to save profile");
      } finally {
          setOnboardingLoading(false);
      }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  useEffect(() => {
    // 1. Fetch User Profile (Protected)
    async function fetchUser() {
      try {
        let user = null;
        let token = null;

        // Try Supabase Auth first
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        
        if (sbUser) {
           user = {
             name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Patient',
             email: sbUser.email,
             avatar: sbUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
             ...sbUser.user_metadata
           };
           const { data: { session } } = await supabase.auth.getSession();
           token = session?.access_token;
        } else {
           // Fallback to custom auth
           const storedUser = localStorage.getItem('user');
           const storedToken = localStorage.getItem('authToken');
           
           if (storedUser && storedToken) {
              try {
                  const parsedUser = JSON.parse(storedUser);
                  user = {
                     name: parsedUser.mobile_number || parsedUser.name || 'Patient',
                     email: parsedUser.email,
                     avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
                     ...parsedUser
                  };
                  token = storedToken;
              } catch (e) {
                  console.error('Failed to parse stored user:', e);
              }
           }
        }

        if (user) {
          setUser(user);
          
          if (token) {
             const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/appointments`, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'X-Supabase-Auth': token
                }
             });
             if (response.ok) {
                setAppointments(await response.json());
             }
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    // 2. Fetch Public Data (Doctors & Hospitals)
    async function fetchPublicData() {
        try {
            if (!projectId) {
                console.error("Missing Project ID");
                return;
            }

            // Determine correct auth token (User Token > Anon Key)
            let token = publicAnonKey;
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                token = session.access_token;
            } else {
                const storedToken = localStorage.getItem('authToken');
                if (storedToken) token = storedToken;
            }

            // Fetch Hospitals
            try {
                // Use publicAnonKey for public endpoints to avoid Gateway 401s with user tokens
                // But if we have a valid user token, sending it might be useful for some logic?
                // Actually, for public data, AnonKey is safer/simpler unless personalization is needed.
                // The original code used publicAnonKey explicitly for the fetch call, ignoring the `token` variable it computed above!
                // I will stick to publicAnonKey for the Authorization header to ensure access.
                const hRes = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospitals?t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${publicAnonKey}` },
                    cache: 'no-store'
                });
                if (hRes.ok) {
                    const hData = await hRes.json();
                    setHospitals(Array.isArray(hData) ? hData : []);
                } else {
                    console.error("Failed to fetch hospitals:", hRes.status);
                }
            } catch (hErr) {
                console.error('Error fetching hospitals:', hErr);
            }

            // Fetch Doctors
            try {
                // Use publicAnonKey for public endpoints to avoid Gateway 401s with user tokens
                const dRes = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctors?t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${publicAnonKey}` },
                    cache: 'no-store'
                });
                if (dRes.ok) {
                    const dData = await dRes.json();
                    setDoctors(Array.isArray(dData) ? dData : []);
                } else {
                    console.error("Failed to fetch doctors:", dRes.status);
                }
            } catch (dErr) {
                console.error('Error fetching doctors:', dErr);
            }
        } catch (e) {
            console.error("General fetch error:", e);
        }
    }

    fetchUser();
    fetchPublicData();
  }, [careView]); // Re-fetch on view change to keep fresh

  const handleRefresh = () => {
    setLoading(true);
    // Re-trigger the effect
    const event = new Event('visibilitychange');
    document.dispatchEvent(event); 
    // Or just reload page logic
    window.location.reload(); 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Fallback if no user (should probably redirect to login)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p>Please sign in to view your dashboard</p>
        <Button onClick={() => navigate('auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Mobile Header / Sticky Nav for Desktop */}
      <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="bg-primary/10 p-2 rounded-lg md:hidden">
                    <Heart className="w-5 h-5 text-primary fill-current" />
                 </div>
                 <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 hidden md:block">
                    My Health
                 </h1>
            </div>

            <div className="flex items-center gap-4">
                <VoiceAssistant userName={user.name?.split(' ')[0]} />
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
                <div 
                    className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('patient-profile')}
                >
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">Member</div>
                    </div>
                    <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
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
                    Good Morning, {user.name?.split(' ')[0]}
                </h2>
                <p className="text-slate-500 mt-1">
                    Welcome to your personal health dashboard.
                </p>
            </div>
            <div className="flex gap-3">
                <Button onClick={() => navigate('book-doctor')} className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 rounded-full px-6">
                    <Plus className="w-4 h-4 mr-2" /> Book Appointment
                </Button>
            </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-8 space-y-8 min-w-0">
                
                {/* Stats Grid */}
                <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
                    <Card className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-rose-50 rounded-lg text-rose-500 group-hover:bg-rose-100 transition-colors">
                                <Heart className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50">No Data</Badge>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-slate-900">-- <span className="text-sm font-normal text-slate-500">bpm</span></div>
                            <div className="text-xs text-slate-400">Avg. Heart Rate</div>
                        </div>
                    </Card>

                    <Card className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                                <Activity className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50">No Data</Badge>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-slate-900">--/--</div>
                            <div className="text-xs text-slate-400">Blood Pressure</div>
                        </div>
                    </Card>

                    <Card className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md transition-all group">
                         <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-500 group-hover:bg-purple-100 transition-colors">
                                <Users className="w-5 h-5" />
                            </div>
                             <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50">Inactive</Badge>
                        </div>
                        <div className="space-y-1">
                             <div className="text-2xl font-bold text-slate-900">Guardian</div>
                             <div className="text-xs text-slate-400">0 Members Monitored</div>
                        </div>
                    </Card>
                </motion.div>

                {/* Heart Rate Chart */}
                <motion.div variants={itemVariants}>
                    <Card className="border-none shadow-sm bg-white/80 backdrop-blur-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">Heart Rate Trends</h3>
                                <p className="text-sm text-slate-500">Weekly Summary</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-8">Details</Button>
                        </div>
                        <div className="h-[300px] w-full mt-4 pr-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E5285E" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#E5285E" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
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
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="bpm" 
                                        stroke="#E5285E" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorBpm)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* Discovery Section (Doctors & Hospitals) */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold text-slate-900">Find Care</h3>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setCareView('doctors')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${careView === 'doctors' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Doctors
                                </button>
                                <button 
                                    onClick={() => setCareView('hospitals')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${careView === 'hospitals' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Hospitals
                                </button>
                            </div>
                        </div>
                        <Button variant="link" className="text-primary" onClick={() => navigate(careView === 'doctors' ? 'book-doctor' : 'hospitals')}>See all</Button>
                    </div>
                    
                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                        <div className="flex gap-4">
                             {careView === 'doctors' ? (
                                 // Doctors List
                                 doctors.length === 0 ? (
                                    <div className="w-full text-center py-12 text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-200">
                                        <div className="mb-4 flex justify-center">
                                            <div className="bg-slate-50 p-3 rounded-full">
                                                <Users className="w-6 h-6 text-slate-300" />
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-medium text-slate-900 mb-1">No doctors found</h3>
                                        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                                            We couldn't find any doctors at the moment. Try refreshing or checking the Hospitals tab.
                                        </p>
                                        <div className="flex justify-center gap-2">
                                            <Button variant="outline" size="sm" onClick={async () => {
                                                const toastId = toast.loading('Refreshing data...');
                                                try {
                                                    if (projectId) {
                                                        // Use publicAnonKey for public endpoints
                                                        const token = publicAnonKey;
                                                        
                                                        // Fetch Doctors
                                                        const dRes = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctors?t=${Date.now()}`, {
                                                            headers: { 'Authorization': `Bearer ${token}` },
                                                            cache: 'no-store'
                                                        });
                                                        if (dRes.ok) {
                                                            const dData = await dRes.json();
                                                            setDoctors(Array.isArray(dData) ? dData : []);
                                                        }
                                                        
                                                        // Fetch Hospitals
                                                        const hRes = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospitals?t=${Date.now()}`, {
                                                            headers: { 'Authorization': `Bearer ${token}` },
                                                            cache: 'no-store'
                                                        });
                                                        if (hRes.ok) {
                                                            const hData = await hRes.json();
                                                            setHospitals(Array.isArray(hData) ? hData : []);
                                                        }
                                                        
                                                        toast.dismiss(toastId);
                                                        toast.success('Data refreshed');
                                                    }
                                                } catch (err) {
                                                    console.error('Error refreshing:', err);
                                                    toast.dismiss(toastId);
                                                    toast.error('Failed to refresh data');
                                                }
                                            }}>
                                                Refresh Data
                                            </Button>
                                            {hospitals.length > 0 && (
                                                <Button size="sm" onClick={() => setCareView('hospitals')}>
                                                    View Hospitals ({hospitals.length})
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                 ) : (
                                    doctors.map((doctor) => (
                                        <Card 
                                            key={doctor.id} 
                                            className="w-[280px] p-0 border-none shadow-sm hover:shadow-lg transition-shadow bg-white overflow-hidden cursor-pointer shrink-0 whitespace-normal"
                                            onClick={() => navigate('doctor-detail', doctor)}
                                        >
                                            <div className="h-32 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                                                {doctor.image ? (
                                                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <Users className="w-10 h-10 text-slate-300 mb-1" />
                                                        <span className="text-xs text-slate-400">No Image</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full px-2 py-0.5 text-xs font-semibold flex items-center gap-1 shadow-sm">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                    {doctor.rating || 'New'}
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 truncate">{doctor.name || 'Doctor'}</h4>
                                                    <p className="text-sm text-slate-500 truncate">{doctor.specialty || 'General'}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{doctor.location || 'Location Not Listed'}</span>
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="flex-1 text-xs h-8 border-slate-200"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('doctor-detail', doctor);
                                                        }}
                                                    >
                                                        Profile
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        className="flex-1 text-xs h-8 bg-primary hover:bg-primary/90"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('booking', doctor);
                                                        }}
                                                    >
                                                        Book
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                 )
                             ) : (
                                 // Hospitals List
                                 hospitals.length === 0 ? (
                                    <div className="w-full text-center py-12 text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-200">
                                        <div className="mb-4 flex justify-center">
                                            <div className="bg-slate-50 p-3 rounded-full">
                                                <Building className="w-6 h-6 text-slate-300" />
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-medium text-slate-900 mb-1">No hospitals found</h3>
                                        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                                            No registered hospitals found in your area.
                                        </p>
                                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                                            Refresh Data
                                        </Button>
                                    </div>
                                 ) : (
                                    hospitals.map((hospital) => (
                                        <Card 
                                            key={hospital.id} 
                                            className="w-[280px] p-0 border-none shadow-sm hover:shadow-lg transition-shadow bg-white overflow-hidden cursor-pointer shrink-0 whitespace-normal"
                                            onClick={() => navigate('hospital-detail', hospital)}
                                        >
                                            <div className="h-32 overflow-hidden relative bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                                <Building className="w-10 h-10 text-indigo-300" />
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 truncate">{hospital.name || 'Hospital'}</h4>
                                                    <p className="text-sm text-slate-500 truncate">{hospital.location || 'Unknown Location'}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                     {(hospital.specialties || 'General').split(',').slice(0, 2).map((s: string, idx: number) => (
                                                         <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                                            {s.trim()}
                                                         </span>
                                                     ))}
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="flex-1 text-xs h-8 border-slate-200"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('hospital-detail', hospital);
                                                        }}
                                                    >
                                                        Details
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        className="flex-1 text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('hospital-detail', hospital);
                                                        }}
                                                    >
                                                        View Doctors
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                 )
                             )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </motion.div>

            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8 min-w-0">
                
                {/* Upcoming Appointments Card */}
                <motion.div variants={itemVariants}>
                    <Card className="p-0 border-none shadow-md bg-white overflow-hidden">
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex justify-between items-center">
                             <div>
                                 <h3 className="font-semibold text-lg">Upcoming</h3>
                                 <p className="text-slate-400 text-sm">Your scheduled visits</p>
                             </div>
                             <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-white hover:text-white hover:bg-white/10 h-8 px-2 text-xs" 
                                onClick={() => navigate('patient-appointments')}
                             >
                                View All
                             </Button>
                        </div>
                        <div className="p-4 space-y-4">
                             {appointments.length === 0 ? (
                               <div className="text-center py-8 text-slate-400 text-sm">
                                  No upcoming appointments
                               </div>
                             ) : (
                               <div className="space-y-3">
                                 {appointments.map((apt) => (
                                   <div key={apt.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                      <div className="bg-white p-2 rounded-md shadow-sm border border-slate-100 text-center min-w-[3.5rem]">
                                         <div className="text-xs font-semibold text-slate-500 uppercase">
                                            {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                                         </div>
                                         <div className="text-xl font-bold text-slate-900">
                                            {new Date(apt.date).getDate()}
                                         </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <h4 className="font-medium text-slate-900 truncate">{apt.doctor.name}</h4>
                                         <p className="text-xs text-slate-500 truncate">{apt.doctor.specialty} • {apt.time}</p>
                                         <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                               {apt.type === 'video' ? 'Video' : 'In-person'}
                                            </Badge>
                                            <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5 font-normal bg-green-500 hover:bg-green-600">
                                               {apt.status === 'scheduled' ? 'Confirmed' : apt.status}
                                            </Badge>
                                         </div>
                                      </div>
                                   </div>
                                 ))}
                               </div>
                             )}
                             <Button variant="outline" className="w-full mt-2 text-xs border-dashed border-slate-300 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5" onClick={() => navigate('book-doctor')}>
                                <Plus className="w-3 h-3 mr-1" /> Schedule New
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Active Medications */}
                <motion.div variants={itemVariants}>
                    <Card className="p-5 border-none shadow-sm bg-white/60 backdrop-blur-xl">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Pill className="w-4 h-4 text-purple-500" /> Medications
                        </h3>
                         <div className="text-center py-4 text-slate-400 text-sm">
                            No active medications
                         </div>
                    </Card>
                </motion.div>

                 {/* Emergency Card */}
                <motion.div variants={itemVariants}>
                    <Card className="p-5 border-none shadow-sm bg-gradient-to-br from-red-50 to-white border-l-4 border-l-red-500">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-100 rounded-full text-red-600">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-900">Emergency Help</h3>
                                <p className="text-xs text-red-700/80 mt-1 mb-3">
                                    Instant connection to nearby ambulances and hospitals.
                                </p>
                                <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    className="w-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                                    onClick={() => navigate('emergency')}
                                >
                                    Call Ambulance
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>

            </div>
        </div>
      </motion.div>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide a few details to get the best care experience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                id="name"
                value={onboardingData.full_name}
                onChange={(e) => setOnboardingData({...onboardingData, full_name: e.target.value})}
                className="col-span-3"
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                value={onboardingData.age}
                onChange={(e) => setOnboardingData({...onboardingData, age: e.target.value})}
                className="col-span-3"
                placeholder="25"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender
              </Label>
              <div className="col-span-3 flex gap-2">
                  {['Male', 'Female', 'Other'].map(g => (
                      <Button 
                        key={g} 
                        type="button"
                        variant={onboardingData.gender === g ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOnboardingData({...onboardingData, gender: g})}
                        className="flex-1"
                      >
                          {g}
                      </Button>
                  ))}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={onboardingData.email}
                onChange={(e) => setOnboardingData({...onboardingData, email: e.target.value})}
                className="col-span-3"
                placeholder="john@example.com (Optional)"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleOnboardingSubmit} disabled={onboardingLoading}>
                {onboardingLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}