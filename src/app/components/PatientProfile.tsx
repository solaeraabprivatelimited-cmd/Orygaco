import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, ArrowLeft, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PatientProfileProps {
  onNavigate: (view: string) => void;
  onBack: () => void;
}

export function PatientProfile({ onNavigate, onBack }: PatientProfileProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    blood_group: '',
    allergies: '',
    avatar_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onNavigate('auth');
        return;
      }

      // In a real app, we'd fetch from a 'patients' table. 
      // For now, we'll use user_metadata and some placeholders or local state storage if available.
      // Since we don't have a full backend schema defined for patients yet in the prompt instructions,
      // we'll rely on user_metadata.
      
      setProfile({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
        dob: user.user_metadata?.dob || '',
        blood_group: user.user_metadata?.blood_group || '',
        allergies: user.user_metadata?.allergies || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          dob: profile.dob,
          blood_group: profile.blood_group,
          allergies: profile.allergies
          // Avatar upload would be separate
        }
      });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-[80px] pt-[32px] px-[0px] py-[32px] pr-[0px] pl-[0px]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        </div>

        <div className="grid gap-6">
          {/* Identity Card */}
          <Card className="p-6 border-none shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-sm">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile.full_name?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 text-slate-500 hover:text-primary transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-center sm:text-left flex-1 space-y-1">
                <h2 className="text-xl font-semibold text-slate-900">{profile.full_name || 'Patient Name'}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">Verified Patient</span>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Personal Details */}
          <Card className="p-6 border-none shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Details
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="pl-9"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="pl-9"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    id="dob"
                    type="date"
                    value={profile.dob}
                    onChange={(e) => setProfile({...profile, dob: e.target.value})}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="pl-9"
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Medical Snapshot (Optional Basic Info) */}
          <Card className="p-6 border-none shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Medical Snapshot
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Input 
                  id="blood_group"
                  value={profile.blood_group}
                  onChange={(e) => setProfile({...profile, blood_group: e.target.value})}
                  placeholder="e.g. O+"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input 
                  id="allergies"
                  value={profile.allergies}
                  onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                  placeholder="e.g. Peanuts, Penicillin"
                />
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}