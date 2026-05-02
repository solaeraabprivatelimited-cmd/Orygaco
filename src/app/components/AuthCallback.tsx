import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function AuthCallback() {
  const { navigate } = useAppNavigate();
  const { login } = useAuth();
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordReset(true);
      } else if (event === 'SIGNED_IN' && session && !isPasswordReset) {
        const role = (session.user.user_metadata?.role as string) || 'patient';
        login(role as any);
        const dest = role === 'doctor' ? 'doctor-app' : role === 'hospital' ? 'hospital-admin' : 'patient-app';
        navigate(dest);
      }
    });

    // Handle PKCE code exchange — Supabase JS v2 does this automatically on page load,
    // but we also do a getSession check for cases where the event already fired.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !window.location.hash.includes('type=recovery')) {
        const role = (session.user.user_metadata?.role as string) || 'patient';
        login(role as any);
        const dest = role === 'doctor' ? 'doctor-app' : role === 'hospital' ? 'hospital-admin' : 'patient-app';
        navigate(dest);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully! Please sign in.');
      await supabase.auth.signOut();
      navigate('auth');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (isPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl mb-2">Set New Password</h2>
              <p className="text-muted-foreground">Enter a new password for your account</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-muted-foreground">Show passwords</span>
              </label>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSetPassword}
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? 'Updating…' : 'Update Password'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  );
}
