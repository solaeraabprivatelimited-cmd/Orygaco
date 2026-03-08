import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, ChevronLeft, Edit, Save, Camera, Bell, Lock, CreditCard, HelpCircle, LogOut, Eye, Upload, ShieldCheck, AlertCircle, CheckCircle2, FileText, Smartphone, Monitor } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Progress } from './ui/progress';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function DoctorProfile() {
  const { navigate, goBack } = useAppNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    specialty: "",
    qualification: "",
    experience: "",
    email: "",
    phone: "",
    license: "",
    hospital: "",
    location: "",
    bio: "",
    languages: ["English"],
    consultationFee: 500
  });

  // New State for Additive Features
  const [profileScore, setProfileScore] = useState(0);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [consultationRules, setConsultationRules] = useState<any>({
      video: { enabled: true, days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
      in_person: { enabled: true, clinic_only: true }
  });
  const [notificationPrefs, setNotificationPrefs] = useState<any>({
      appointments: { push: true, email: true, sms: true },
      reminders: { push: true, email: false },
      marketing: { email: false },
      system: { email: true }
  });
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [showPatientPreview, setShowPatientPreview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const headers = { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token };
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-44966e3b`;

      // 1. Fetch Basic Profile
      const profileRes = await fetch(`${baseUrl}/doctor-profile`, { headers });
      if (profileRes.ok) {
         const data = await profileRes.json();
         // Pre-fill from auth if empty
         if (!data.name && session.user.user_metadata) {
             data.name = session.user.user_metadata.full_name;
             data.email = session.user.email;
         }
         setProfile(prev => ({ ...prev, ...data }));
      }

      // 2. Fetch New Data (Additive)
      const [scoreRes, credsRes, rulesRes, prefsRes, historyRes] = await Promise.all([
          fetch(`${baseUrl}/doctor/profile-score`, { headers }),
          fetch(`${baseUrl}/doctor/credentials`, { headers }),
          fetch(`${baseUrl}/doctor/consultation-rules`, { headers }),
          fetch(`${baseUrl}/doctor/notification-preferences`, { headers }),
          fetch(`${baseUrl}/doctor/login-history`, { headers })
      ]);

      if (scoreRes.ok) setProfileScore((await scoreRes.json()).score);
      if (credsRes.ok) setCredentials(await credsRes.json());
      if (rulesRes.ok) setConsultationRules(await rulesRes.json());
      if (prefsRes.ok) setNotificationPrefs(await prefsRes.json());
      if (historyRes.ok) setLoginHistory(await historyRes.json());

    } catch (e) {
      console.error('Error fetching data:', e);
      toast.error("Failed to load some profile data");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-44966e3b`;
      const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': session.access_token
      };

      // Save Profile
      const profileRes = await fetch(`${baseUrl}/doctor-profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ authToken: session.access_token, ...profile })
      });

      // Save Rules
      await fetch(`${baseUrl}/doctor/consultation-rules`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ authToken: session.access_token, rules: consultationRules })
      });

      // Save Notification Prefs
      await fetch(`${baseUrl}/doctor/notification-preferences`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ authToken: session.access_token, preferences: notificationPrefs })
      });

      if (profileRes.ok) {
        toast.success('Profile and settings saved');
        setIsEditing(false);
        fetchData(); // Refresh score
      } else {
        toast.error('Failed to save profile');
      }
    } catch (error) {
       console.error(error);
       toast.error('Error saving profile');
    }
  };

  const uploadCredential = async () => {
      // Mock Upload
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          
          const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-44966e3b`;
          const res = await fetch(`${baseUrl}/doctor/credentials`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'X-Supabase-Auth': session.access_token
              },
              body: JSON.stringify({ 
                  authToken: session.access_token, 
                  type: 'certificate', 
                  label: 'Advanced Life Support', 
                  fileUrl: 'https://example.com/cert.pdf' 
              })
          });

          if (res.ok) {
              const data = await res.json();
              setCredentials([...credentials, data.credential]);
              toast.success("Document uploaded for verification");
              fetchData(); // Refresh score
          }
      } catch (e) {
          toast.error("Upload failed");
      }
  };

  return (
    <div className="h-screen pt-24 pb-16 bg-background overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl mb-1 font-bold tracking-tight">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your professional profile, visibility, and account security</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => setShowPatientPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                View as Patient
             </Button>
             <Button variant="outline" onClick={goBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Dashboard
             </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl font-semibold">Professional Information</h2>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialty">Specialty *</Label>
                        <Input
                          id="specialty"
                          value={profile.specialty}
                          onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                          disabled={!isEditing}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="qualification">Qualifications *</Label>
                      <Input
                        id="qualification"
                        value={profile.qualification}
                        onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="experience">Experience</Label>
                        <Input
                          id="experience"
                          value={profile.experience}
                          onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                          disabled={!isEditing}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fee">Consultation Fee (₹)</Label>
                        <Input
                          id="fee"
                          type="number"
                          value={profile.consultationFee}
                          onChange={(e) => setProfile({ ...profile, consultationFee: parseInt(e.target.value) })}
                          disabled={!isEditing}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        disabled={!isEditing}
                        className="mt-2 min-h-[100px]"
                        placeholder="Share your expertise and background..."
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hospital">Hospital/Clinic</Label>
                        <Input
                          id="hospital"
                          value={profile.hospital}
                          onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
                          disabled={!isEditing}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          disabled={!isEditing}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Enhanced Consultation Preferences */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Consultation Preferences</h2>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border bg-slate-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded text-blue-600">
                                <Monitor className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium">Video Consultations</div>
                                <div className="text-sm text-muted-foreground">Offer remote consultations via video</div>
                            </div>
                        </div>
                        <Switch
                          checked={consultationRules.video.enabled}
                          onCheckedChange={(checked) => setConsultationRules({...consultationRules, video: {...consultationRules.video, enabled: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                      {consultationRules.video.enabled && (
                          <div className="pl-12 space-y-2">
                             <Label className="text-xs text-muted-foreground uppercase tracking-wide">Available Days</Label>
                             <div className="flex flex-wrap gap-2">
                                 {['mon','tue','wed','thu','fri','sat','sun'].map(day => (
                                     <Badge 
                                        key={day} 
                                        variant={consultationRules.video.days.includes(day) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            if (!isEditing) return;
                                            const days = consultationRules.video.days.includes(day)
                                                ? consultationRules.video.days.filter((d: string) => d !== day)
                                                : [...consultationRules.video.days, day];
                                            setConsultationRules({...consultationRules, video: {...consultationRules.video, days}});
                                        }}
                                     >
                                         {day.charAt(0).toUpperCase() + day.slice(1,3)}
                                     </Badge>
                                 ))}
                             </div>
                          </div>
                      )}
                    </div>

                    <div className="p-4 rounded-lg border border-border bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded text-green-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium">In-person Visits</div>
                                <div className="text-sm text-muted-foreground">Accept patients at your registered clinic</div>
                            </div>
                         </div>
                        <Switch
                          checked={consultationRules.in_person.enabled}
                          onCheckedChange={(checked) => setConsultationRules({...consultationRules, in_person: {...consultationRules.in_person, enabled: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6">
                  <div className="text-center mb-4">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-4xl shadow-lg border-4 border-white">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {isEditing && (
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                          <Camera className="w-5 h-5 text-white" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl font-medium mb-1">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.specialty}</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.qualification || "No qualifications listed"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.experience || "0 Years"} experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.location || "Location not set"}</span>
                    </div>
                  </div>
                </Card>

                {/* Profile Strength Card (Additive) */}
                <Card className={`p-6 border-l-4 ${profileScore >= 80 ? 'border-l-green-500' : (profileScore >= 50 ? 'border-l-amber-500' : 'border-l-red-500')}`}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> Profile Strength
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>{profileScore}% Complete</span>
                      <span className="text-muted-foreground">{profileScore >= 80 ? 'Excellent' : 'Action Required'}</span>
                    </div>
                    <Progress value={profileScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                       {profileScore < 50 ? "Complete your bio and upload credentials to improve visibility." : 
                        profileScore < 80 ? "Add more details to reach 'Excellent' status." : 
                        "Your profile is optimized for maximum visibility!"}
                    </p>
                  </div>
                  {profileScore < 100 && (
                      <Button size="sm" variant="ghost" className="w-full mt-4 text-xs h-8" onClick={() => setIsEditing(true)}>
                          Improve Score
                      </Button>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">{lang}</Badge>
                    ))}
                    {isEditing && (
                        <Badge variant="outline" className="border-dashed cursor-pointer hover:bg-slate-50">+ Add</Badge>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Credentials Tab (Enhanced) */}
          <TabsContent value="credentials">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-semibold">Professional Credentials</h2>
                 <Button onClick={uploadCredential}>
                     <Upload className="w-4 h-4 mr-2" />
                     Upload Document
                 </Button>
              </div>
              
              <div className="space-y-4">
                 {/* License Field */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <Label htmlFor="license" className="text-slate-600">Medical License Number</Label>
                  <div className="flex gap-4 mt-2">
                      <Input
                        id="license"
                        value={profile.license || "LIC-1234-5678"}
                        className="bg-white max-w-sm"
                        disabled
                      />
                      <Badge className="bg-green-100 text-green-800 border-green-200 h-10 px-4">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Verified
                      </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">Uploaded Documents</h3>
                  
                  {/* Static Mock Data + Dynamic Credentials */}
                  {[
                      { type: 'license', label: 'Medical Board License', status: 'verified' },
                      { type: 'degree', label: 'MBBS Degree Certificate', status: 'verified' },
                      ...credentials
                  ].map((cred, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            cred.type === 'license' ? 'bg-blue-100 text-blue-600' : 
                            cred.type === 'degree' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{cred.label || 'Document'}</div>
                          <div className="text-xs text-muted-foreground capitalize">{cred.type} • {cred.uploadedAt ? new Date(cred.uploadedAt).toLocaleDateString() : 'Dec 2024'}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`
                          ${cred.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 
                            cred.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-yellow-50 text-yellow-700 border-yellow-200'}
                      `}>
                          {cred.status === 'verified' ? 'Verified' : (cred.status === 'rejected' ? 'Action Required' : 'Pending Review')}
                      </Badge>
                    </div>
                  ))}
                  
                  {credentials.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm italic">
                          No additional documents uploaded.
                      </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab (Enhanced Notifications) */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </h2>
                <div className="space-y-6">
                  {/* Group 1: Critical */}
                  <div>
                      <h3 className="text-sm font-medium text-slate-900 mb-3">Appointments & Schedule</h3>
                      <div className="space-y-3">
                          <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">New Bookings</div>
                              <div className="flex items-center gap-4">
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                      <Switch 
                                        checked={notificationPrefs.appointments.email}
                                        onCheckedChange={c => setNotificationPrefs({...notificationPrefs, appointments: {...notificationPrefs.appointments, email: c}})} 
                                      /> Email
                                  </label>
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                      <Switch 
                                        checked={notificationPrefs.appointments.sms}
                                        onCheckedChange={c => setNotificationPrefs({...notificationPrefs, appointments: {...notificationPrefs.appointments, sms: c}})} 
                                      /> SMS
                                  </label>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Group 2: Reminders */}
                  <div>
                      <h3 className="text-sm font-medium text-slate-900 mb-3">System & Updates</h3>
                      <div className="space-y-3">
                          <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">Earnings Reports</div>
                              <Switch 
                                checked={notificationPrefs.system.email}
                                onCheckedChange={c => setNotificationPrefs({...notificationPrefs, system: {...notificationPrefs.system, email: c}})}
                              />
                          </div>
                          <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">Marketing & Tips</div>
                              <Switch 
                                checked={notificationPrefs.marketing.email}
                                onCheckedChange={c => setNotificationPrefs({...notificationPrefs, marketing: {...notificationPrefs.marketing, email: c}})}
                              />
                          </div>
                      </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                      <Button onClick={handleSave} className="w-full sm:w-auto">Save Preferences</Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-slate-50/50">
                    <div>
                      <div className="font-medium mb-1">Public Profile Visibility</div>
                      <div className="text-sm text-muted-foreground">Allow new patients to discover you in search</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab (Enhanced History) */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Security Settings
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="mt-2" />
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input type="password" placeholder="Enter new password" className="mt-2" />
                  </div>
                  <Button variant="outline">Update Password</Button>
                </div>
              </Card>

              {/* Login History (Additive) */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Login History</h3>
                <div className="rounded-md border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="p-3">Device</th>
                                <th className="p-3">Location</th>
                                <th className="p-3">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loginHistory.map((entry, i) => (
                                <tr key={i} className="bg-white">
                                    <td className="p-3 flex items-center gap-2">
                                        {entry.device.toLowerCase().includes('phone') ? <Smartphone className="w-4 h-4 text-slate-400" /> : <Monitor className="w-4 h-4 text-slate-400" />}
                                        {entry.device}
                                    </td>
                                    <td className="p-3 text-slate-600">{entry.location}</td>
                                    <td className="p-3 text-slate-600">{new Date(entry.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                            {loginHistory.length === 0 && (
                                <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No recent history available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </Card>

              <Card className="p-6 border-red-100 bg-red-50/30">
                <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out Everywhere
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Patient View Modal */}
      <Dialog open={showPatientPreview} onOpenChange={setShowPatientPreview}>
          <DialogContent className="max-w-md">
              <DialogHeader>
                  <DialogTitle>Patient View Preview</DialogTitle>
                  <DialogDescription>
                      This is how your profile appears to patients in search results.
                  </DialogDescription>
              </DialogHeader>
              <div className="border rounded-lg p-4 bg-white shadow-sm mt-2">
                  <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl">
                          {profile.name.charAt(0)}
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-900">{profile.name || "Dr. Name"}</h4>
                          <p className="text-sm text-blue-600 font-medium">{profile.specialty || "Specialty"}</p>
                          <p className="text-xs text-slate-500 mt-1">{profile.qualification} • {profile.experience} Exp</p>
                      </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                       <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">
                           <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                       </Badge>
                       <Badge variant="outline">{profile.languages[0]}</Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                      <div>
                          <span className="text-xs text-slate-500">Consultation Fee</span>
                          <div className="font-bold text-slate-900">₹{profile.consultationFee}</div>
                      </div>
                      <Button size="sm">Book Appointment</Button>
                  </div>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}