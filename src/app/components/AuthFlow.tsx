import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useState } from 'react';
import { Mail, Lock, Phone, User, Building, Briefcase, Shield, ArrowLeft, Eye, EyeOff, Heart, Calendar, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import logo from '/Oryga P NILL.png';
import OrygaDNill from '../../imports/OrygaDNill';
import OrygaPNill from '../../imports/OrygaPNill-226-129';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router';

type AuthScreen = 'landing' | 'login' | 'signup' | 'otp' | 'forgot-password' | 'onboarding';
type UserType = 'patient' | 'doctor' | 'hospital' | null;

export function AuthFlow() {
  const { navigate } = useAppNavigate();
  const { login } = useAuth();
  const location = useLocation();

  // Derive initial user type and screen from URL path
  const deriveInitial = (): { userType: UserType; screen: AuthScreen } => {
    const path = location.pathname;
    if (path.includes('/auth/doctor/signup')) return { userType: 'doctor', screen: 'signup' };
    if (path.includes('/auth/doctor')) return { userType: 'doctor', screen: 'login' };
    if (path.includes('/auth/hospital/signup')) return { userType: 'hospital', screen: 'signup' };
    if (path.includes('/auth/hospital')) return { userType: 'hospital', screen: 'login' };
    return { userType: null, screen: 'landing' };
  };

  const initial = deriveInitial();
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(initial.screen);
  const [userType, setUserType] = useState<UserType>(initial.userType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showResend, setShowResend] = useState(false);

  // ── NEW: OTP input state (was missing in original, caused runtime error) ──
  const [otp, setOtp] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Doctor specific
    specialty: '',
    experience: '',
    qualification: '',
    registrationNumber: '',
    registrationYear: '',
    stateMedicalCouncil: '',
    // Hospital specific
    hospitalName: '',
    licenseNumber: '',
    gstin: '',
    facilityType: 'Hospital'
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Firebase Phone Auth helpers
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Initialises an invisible reCAPTCHA verifier and attaches it to the
   * persistent `#recaptcha-container` div that is always rendered at the
   * bottom of the component tree (see JSX below).
   *
   * Re-uses the existing verifier if one has already been created so that
   * switching screens doesn't break the widget.
   */
// Replace setupRecaptcha and handleSendOTP in AuthFlow.tsx with these:

const setupRecaptcha = () => {
  // Always fully destroy before recreating to avoid "already rendered" error
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (_) {}
    (window as any).recaptchaVerifier = null;
  }

  const container = document.getElementById('recaptcha-container');
  if (!container) {
    console.error('❌ #recaptcha-container not found');
    return;
  }

  // Clear any leftover reCAPTCHA DOM content
  container.innerHTML = '';

  (window as any).recaptchaVerifier = new RecaptchaVerifier(
    auth,
    container,
    { size: 'invisible' }
  );
};

const handleSendOTP = async () => {
  if (!formData.phone || formData.phone.length !== 10) {
    toast.error('Please enter a valid 10-digit mobile number');
    return;
  }

  try {
    setLoading(true);
    setupRecaptcha(); // always fresh verifier on each attempt

    const verifier = (window as any).recaptchaVerifier;
    if (!verifier) throw new Error('reCAPTCHA not initialised');

    const confirmation = await signInWithPhoneNumber(
      auth,
      `+91${formData.phone}`,
      verifier
    );

    (window as any).confirmationResult = confirmation;
    setOtp('');
    toast.success('OTP sent successfully');
    setCurrentScreen('otp');
  } catch (err: any) {
    // Always clear broken verifier on any error
    if ((window as any).recaptchaVerifier) {
      try { (window as any).recaptchaVerifier.clear(); } catch (_) {}
      (window as any).recaptchaVerifier = null;
    }

    if (err.code === 'auth/billing-not-enabled') {
      toast.error('SMS service not enabled. Please contact support.');
    } else if (err.code === 'auth/invalid-phone-number') {
      toast.error('Invalid phone number format.');
    } else if (err.code === 'auth/too-many-requests') {
      toast.error('Too many attempts. Please try again later.');
    } else {
      toast.error(err.message || 'Failed to send OTP');
    }
  } finally {
    setLoading(false);
  }
};

  /** Confirm OTP via Firebase → exchange for Supabase session */
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    const confirmation = (window as any).confirmationResult;
    if (!confirmation) {
      toast.error('Session expired. Please request a new OTP.');
      setCurrentScreen('login');
      return;
    }

    try {
      setLoading(true);

      // 1. Verify the OTP with Firebase
      const result = await confirmation.confirm(otp);
      const firebaseIdToken = await result.user.getIdToken();

      // 2. Exchange the Firebase ID token for a Supabase session
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/auth/firebase-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ firebase_id_token: firebaseIdToken })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Verification failed' }));
        throw new Error(errorData.error || 'Verification failed');
      }

      const data = await response.json();

      if (data.session?.access_token) {
        localStorage.setItem('authToken', data.session.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.isNewUser) {
          localStorage.setItem('isNewUser', 'true');
        } else {
          localStorage.removeItem('isNewUser');
        }

        toast.success('Logged in successfully');
        login((data.user?.role || 'patient') as any);
        navigate('patient-app');
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err: any) {
      console.error('OTP verify error:', err);

      // Firebase-specific error codes
      if (err.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        toast.error('OTP has expired. Please request a new one.');
        setCurrentScreen('login');
      } else {
        toast.error(err.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Existing auth helpers (unchanged)
  // ─────────────────────────────────────────────────────────────────────────────

  const themeStyles = userType === 'doctor' ? {
    '--primary': '#1890FF',
    '--primary-foreground': '#ffffff',
    '--accent': '#e6f4ff',
  } as React.CSSProperties : {};

  const LogoComponent = () => {
    if (userType === 'doctor') {
      return <div className="w-12 h-12 relative"><OrygaDNill /></div>;
    }
    return <div className="w-12 h-12 relative"><OrygaPNill /></div>;
  };

  const SmallLogoComponent = () => {
    if (userType === 'doctor') {
      return <div className="w-10 h-10 relative"><OrygaDNill /></div>;
    }
    return <img src={logo} alt="ORYGA" className="w-10 h-10" />;
  };

  const handleLogin = async () => {
    setShowResend(false);

    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      console.log('[AuthFlow] Starting login for:', formData.email, 'as role:', userType);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) throw error;

      const role = data.user?.user_metadata?.role || userType || 'patient';

      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) throw new Error('Session not established. Please try again.');

      toast.success('Signed in successfully');
      setLoading(false);

      await new Promise(resolve => setTimeout(resolve, 100));

      login(role as any);

      if (role === 'patient') {
        navigate('patient-app');
      } else if (role === 'doctor') {
        navigate('doctor-app');
      } else if (role === 'hospital') {
        navigate('hospital-admin');
      } else {
        console.warn('[AuthFlow] Unknown role:', role);
        toast.error(`Unknown user role: ${role}. Contact support.`);
        navigate('home');
      }
    } catch (error: any) {
      setLoading(false);

      if (error.message?.includes('Email not confirmed')) {
        setShowResend(true);
        toast.error('Please verify your email address to continue.');
      } else if (error.message === 'Invalid login credentials') {
        toast.error('Incorrect email or password. Please try again.');
      } else {
        console.error('Login error:', error);
        toast.error(error.message || 'Failed to sign in');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email.trim(),
      });
      if (error) throw error;
      toast.success('Verification email resent. Please check your inbox.');
      setShowResend(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupComplete = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required personal details');
      return;
    }

    if (userType === 'doctor') {
      if (!formData.specialty || !formData.registrationNumber || !formData.registrationYear || !formData.stateMedicalCouncil) {
        toast.error('Please fill in all required professional details');
        return;
      }
    }

    if (userType === 'hospital') {
      if (!formData.hospitalName || !formData.facilityType || !formData.licenseNumber) {
        toast.error('Please fill in all required hospital details');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);

      const { projectId, publicAnonKey } = await import('/utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
            full_name: formData.name,
            role: userType,
            phone: formData.phone,
            ...(userType === 'doctor' ? {
              specialty: formData.specialty,
              qualification: formData.qualification,
              registration_number: formData.registrationNumber,
              registration_year: formData.registrationYear,
              state_medical_council: formData.stateMedicalCouncil
            } : {}),
            ...(userType === 'hospital' ? {
              hospital_name: formData.hospitalName,
              license_number: formData.licenseNumber,
              gstin: formData.gstin,
              facility_type: formData.facilityType
            } : {})
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error && (
          data.error.includes('already been registered') ||
          data.error.includes('User already registered')
        )) {
          toast.info('Account already exists. Redirecting to login...');
          setCurrentScreen('login');
          return;
        }
        throw new Error(data.error || 'Failed to sign up');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (loginError) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (retryError) {
          console.warn('Auto-login failed after signup:', retryError);
          toast.success('Account created successfully! Please sign in.');
          setCurrentScreen('login');
          return;
        }
      }

      toast.success('Account created successfully!');

      const signupRole = userType || 'patient';
      login(signupRole as any);

      if (userType === 'patient') {
        navigate('patient-app');
      } else if (userType === 'doctor') {
        navigate('doctor-app');
      } else if (userType === 'hospital') {
        navigate('hospital-admin');
      } else {
        setCurrentScreen('onboarding');
      }
    } catch (error: any) {
      console.error('Signup error:', error);

      if (error.message.includes('already been registered') || error.message.includes('User already registered')) {
        toast.info('Account already exists. Redirecting to login...');
        setCurrentScreen('login');
      } else if (error.message.includes('Email signups are disabled')) {
        toast.error('Email signups are currently disabled. Please contact support.');
      } else if (error.message.includes('Database error saving new user')) {
        toast.error('System Error: Database schema missing. Please run the provided SQL script in Supabase.');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.success('Account created successfully! Please sign in.');
        setCurrentScreen('login');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    if (userType === 'patient') navigate('patient-app');
    else if (userType === 'doctor') navigate('doctor-app');
    else if (userType === 'hospital') navigate('hospital-admin');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Screens
  // ─────────────────────────────────────────────────────────────────────────────

  // Landing Screen
  if (currentScreen === 'landing') {
    return (
      <>
        <div
          className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-8"
          style={themeStyles}
        >
          <div className="max-w-5xl w-full">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <LogoComponent />
                <span className="text-3xl tracking-tight">ORYGA</span>
              </div>
              <h1 className="text-4xl md:text-5xl mb-3">Welcome to ORYGA</h1>
              <p className="text-lg text-muted-foreground">Choose how you'd like to continue</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card
                className="p-8 cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
                onClick={() => { setUserType('patient'); setCurrentScreen('login'); }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-center mb-2">USER</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Book appointments, manage health records, and consult doctors
                </p>
              </Card>

              <Card
                className="p-8 cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
                onClick={() => { setUserType('doctor'); setCurrentScreen('login'); }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-center mb-2">PLUS</h3>
                <p className="text-sm text-muted-foreground text-center">
                  For Doctors to Manage appointments, consult patients, and track your practice
                </p>
              </Card>

              <Card
                className="p-8 cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
                onClick={() => { setUserType('hospital'); setCurrentScreen('login'); }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Building className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-center mb-2">PRO</h3>
                <p className="text-sm text-muted-foreground text-center">
                  For Hospitals to Manage hospital operations, doctors, and patient flow
                </p>
              </Card>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>By continuing, you agree to ORYGA's Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </div>

        {/* ── Always-present reCAPTCHA anchor (invisible) ── */}
        <div id="recaptcha-container" />
      </>
    );
  }

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <>
        <div
          className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-8"
          style={themeStyles}
        >
          <div className="max-w-md w-full">
            <button
              onClick={() => { setUserType(null); setCurrentScreen('landing'); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <SmallLogoComponent />
                  <span className="text-2xl tracking-tight">ORYGA</span>
                </div>
                <h2 className="text-2xl mb-2">
                  Welcome back{' '}
                  {userType === 'patient' ? 'Patient' : userType === 'doctor' ? 'Doctor' : userType === 'hospital' ? 'Admin' : ''}
                </h2>
                <p className="text-muted-foreground">Sign in to continue to your account</p>
              </div>

              <div className="space-y-4">
                {userType === 'patient' ? (
                  <>
                    <div>
                      <Label htmlFor="phone">Mobile Number</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                            })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[rgb(230,62,109)]"
                      size="lg"
                      onClick={handleSendOTP}
                      disabled={loading}
                    >
                      {loading ? 'Sending OTP…' : 'Get OTP'}
                    </Button>
                  </>
                ) : (
                  <>
                    {showResend && (
                      <Alert variant="destructive" className="mb-4">
                        <Shield className="h-4 w-4" />
                        <AlertTitle>Email not confirmed</AlertTitle>
                        <AlertDescription>
                          Please check your email inbox for the confirmation link.
                          You cannot login until you verify your email address.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <button
                        onClick={() => setCurrentScreen('forgot-password')}
                        className="text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      className="w-full bg-[rgb(230,62,109)]"
                      size="lg"
                      onClick={handleLogin}
                      disabled={loading}
                    >
                      {loading ? 'Signing in…' : 'Sign In'}
                    </Button>

                    {showResend && (
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleResendVerification}
                        disabled={loading}
                      >
                        Resend Verification Email
                      </Button>
                    )}

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-muted-foreground">OR</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.info('Google Auth integration pending in backend settings')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Continue with Google
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <button
                  onClick={() => setCurrentScreen('signup')}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </div>
            </Card>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Secured by 256-bit SSL encryption</span>
            </div>
          </div>
        </div>

        {/* ── Always-present reCAPTCHA anchor ── */}
        <div id="recaptcha-container" />
      </>
    );
  }

  // Sign Up Screen
  if (currentScreen === 'signup') {
    return (
      <>
        <div
          className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-8"
          style={themeStyles}
        >
          <div className="max-w-md w-full">
            <button
              onClick={() => { setUserType(null); setCurrentScreen('landing'); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <SmallLogoComponent />
                  <span className="text-2xl tracking-tight">ORYGA</span>
                </div>
                <h2 className="text-2xl mb-2">
                  Create {userType === 'patient' ? 'Patient' : userType === 'doctor' ? 'Doctor' : 'Admin'} Account
                </h2>
                <p className="text-muted-foreground">Join thousands using ORYGA</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-phone">Phone Number <span className="text-red-500">*</span></Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Doctor specific fields */}
                {userType === 'doctor' && (
                  <>
                    <div>
                      <Label htmlFor="specialty">Specialty <span className="text-red-500">*</span></Label>
                      <select
                        id="specialty"
                        value={formData.specialty}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                      >
                        <option value="" disabled>Select your specialty</option>
                        <option value="General Physician">General Physician</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                        <option value="Gynecologist">Gynecologist</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                        <option value="Psychiatrist">Psychiatrist</option>
                        <option value="Dentist">Dentist</option>
                        <option value="ENT Specialist">ENT Specialist</option>
                        <option value="Ophthalmologist">Ophthalmologist</option>
                        <option value="Urologist">Urologist</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="registration">Medical Registration Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="registration"
                        placeholder="Enter MCI/NMC registration number"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="regYear">Registration Year <span className="text-red-500">*</span></Label>
                        <Input
                          id="regYear"
                          placeholder="YYYY"
                          value={formData.registrationYear}
                          onChange={(e) => setFormData({ ...formData, registrationYear: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="council">State Medical Council <span className="text-red-500">*</span></Label>
                        <select
                          id="council"
                          value={formData.stateMedicalCouncil}
                          onChange={(e) => setFormData({ ...formData, stateMedicalCouncil: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                        >
                          <option value="" disabled>Select Medical Council</option>
                          <option value="Andhra Pradesh Medical Council">Andhra Pradesh Medical Council</option>
                          <option value="Arunachal Pradesh Medical Council">Arunachal Pradesh Medical Council</option>
                          <option value="Assam Medical Council">Assam Medical Council</option>
                          <option value="Bihar Medical Council">Bihar Medical Council</option>
                          <option value="Chhattisgarh Medical Council">Chhattisgarh Medical Council</option>
                          <option value="Delhi Medical Council">Delhi Medical Council</option>
                          <option value="Goa Medical Council">Goa Medical Council</option>
                          <option value="Gujarat Medical Council">Gujarat Medical Council</option>
                          <option value="Haryana State Medical Council">Haryana State Medical Council</option>
                          <option value="Himachal Pradesh Medical Council">Himachal Pradesh Medical Council</option>
                          <option value="Jammu & Kashmir Medical Council">Jammu & Kashmir Medical Council</option>
                          <option value="Jharkhand Medical Council">Jharkhand Medical Council</option>
                          <option value="Karnataka Medical Council">Karnataka Medical Council</option>
                          <option value="Travancore Cochin Medical Council (Kerala)">Travancore Cochin Medical Council (Kerala)</option>
                          <option value="Madhya Pradesh Medical Council">Madhya Pradesh Medical Council</option>
                          <option value="Maharashtra Medical Council">Maharashtra Medical Council</option>
                          <option value="Manipur Medical Council">Manipur Medical Council</option>
                          <option value="Meghalaya Medical Council">Meghalaya Medical Council</option>
                          <option value="Mizoram Medical Council">Mizoram Medical Council</option>
                          <option value="Nagaland Medical Council">Nagaland Medical Council</option>
                          <option value="Odisha Council of Medical Registration">Odisha Council of Medical Registration</option>
                          <option value="Punjab Medical Council">Punjab Medical Council</option>
                          <option value="Rajasthan Medical Council">Rajasthan Medical Council</option>
                          <option value="Sikkim Medical Council">Sikkim Medical Council</option>
                          <option value="Tamil Nadu Medical Council">Tamil Nadu Medical Council</option>
                          <option value="Telangana State Medical Council">Telangana State Medical Council</option>
                          <option value="Tripura State Medical Council">Tripura State Medical Council</option>
                          <option value="Uttarakhand Medical Council">Uttarakhand Medical Council</option>
                          <option value="Uttar Pradesh Medical Council">Uttar Pradesh Medical Council</option>
                          <option value="West Bengal Medical Council">West Bengal Medical Council</option>
                          <option value="National Medical Commission">National Medical Commission (NMC)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Hospital specific fields */}
                {userType === 'hospital' && (
                  <>
                    <div>
                      <Label htmlFor="hospital-name">Hospital Name <span className="text-red-500">*</span></Label>
                      <div className="relative mt-2">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="hospital-name"
                          placeholder="Enter hospital name"
                          value={formData.hospitalName}
                          onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="facilityType">Facility Type <span className="text-red-500">*</span></Label>
                      <select
                        id="facilityType"
                        value={formData.facilityType}
                        onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                      >
                        <option value="Hospital">Hospital</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Diagnostic Center">Diagnostic Center</option>
                        <option value="Nursing Home">Nursing Home</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="license">Hospital License Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="license"
                        placeholder="Enter license number"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input
                        id="gstin"
                        placeholder="Enter GSTIN"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="signup-password">Password <span className="text-red-500">*</span></Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSignupComplete}
                  disabled={loading}
                >
                  {loading ? 'Creating Account…' : 'Create Account'}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <button
                  onClick={() => setCurrentScreen('login')}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Always-present reCAPTCHA anchor ── */}
        <div id="recaptcha-container" />
      </>
    );
  }

  // OTP Verification Screen
  if (currentScreen === 'otp') {
    return (
      <>
        <div
          className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-8"
          style={themeStyles}
        >
          <div className="max-w-md w-full">
            <button
              onClick={() => setCurrentScreen('login')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <SmallLogoComponent />
                  <span className="text-2xl tracking-tight">ORYGA</span>
                </div>
                <h2 className="text-2xl mb-2">Verify OTP</h2>
                <p className="text-muted-foreground">
                  Enter the 6-digit code sent to +91 {formData.phone}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center tracking-widest text-lg mt-2"
                    maxLength={6}
                  />
                </div>

                <Button
                  className="w-full bg-[rgb(230,62,109)]"
                  size="lg"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying…' : 'Verify & Login'}
                </Button>

                <div className="text-center mt-4">
                  <button
                    onClick={handleSendOTP}
                    className="text-sm text-primary hover:underline"
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Always-present reCAPTCHA anchor ── */}
        <div id="recaptcha-container" />
      </>
    );
  }

  // Forgot Password Screen
  if (currentScreen === 'forgot-password') {
    return (
      <>
        <div
          className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-8"
          style={themeStyles}
        >
          <div className="max-w-md w-full">
            <button
              onClick={() => { setUserType(null); setCurrentScreen('landing'); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl mb-2">Reset Password</h2>
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={async () => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(formData.email.trim())) {
                      toast.error('Please enter a valid email address');
                      return;
                    }
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim());
                      if (error) throw error;
                      toast.success('Password reset link sent to your email');
                      setCurrentScreen('login');
                    } catch (e: any) {
                      toast.error(e.message);
                    }
                  }}
                >
                  Send Reset Link
                </Button>
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Remember your password? </span>
                <button
                  onClick={() => setCurrentScreen('login')}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Always-present reCAPTCHA anchor ── */}
        <div id="recaptcha-container" />
      </>
    );
  }

  // Onboarding Screen
  if (currentScreen === 'onboarding') {
    const onboardingScreens = {
      patient: [{
        icon: <Heart className="w-12 h-12" />,
        title: 'Welcome to ORYGA',
        description: 'Your complete healthcare companion. Book appointments, consult doctors, and manage your health records all in one place.'
      }],
      doctor: [{
        icon: <Briefcase className="w-12 h-12" />,
        title: 'Welcome Doctor',
        description: 'Manage your practice efficiently with ORYGA. Handle appointments, consultations, and patient records seamlessly.'
      }],
      hospital: [{
        icon: <Building className="w-12 h-12" />,
        title: 'Hospital Management',
        description: 'Streamline your hospital operations with ORYGA\'s comprehensive admin dashboard.'
      }]
    };

    const currentScreens = onboardingScreens[userType as keyof typeof onboardingScreens] || onboardingScreens.patient;
    const currentOnboarding = currentScreens[onboardingStep];

    return (
      <>
        <div
          className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-8"
          style={themeStyles}
        >
          <div className="max-w-md w-full">
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  {currentOnboarding.icon}
                </div>
                <h2 className="text-2xl mb-3">{currentOnboarding.title}</h2>
                <p className="text-muted-foreground">{currentOnboarding.description}</p>
              </div>

              <Button className="w-full" size="lg" onClick={handleOnboardingComplete}>
                Get Started
              </Button>
            </Card>
          </div>
        </div>

        {/* ── Always-present reCAPTCHA anchor ── */}
        <div id="recaptcha-container" />
      </>
    );
  }

  return null;
}
