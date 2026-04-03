import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Clock, Video, MapPin, User, Users, FileText, CreditCard, Check, ChevronLeft, Phone, AlertCircle, Shield, Hash, XCircle } from 'lucide-react';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import logo from 'figma:asset/79875bb7427953c37958c445f51a4ce2f3d7aa79.png';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { useLocation, useSearchParams } from 'react-router';

// ─── Razorpay types ───────────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color: string };
  modal?: { ondismiss?: () => void; escape?: boolean; backdropclose?: boolean };
  handler: (response: RazorpaySuccessResponse) => void;
}
interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance { open: () => void; }

// ─── Payment state type ───────────────────────────────────────────────────────
type PaymentStatus = 'idle' | 'creating_order' | 'awaiting_razorpay' | 'verifying' | 'error';

type BookingStep = 'datetime' | 'type' | 'token' | 'patient' | 'details' | 'review' | 'payment' | 'confirmed';

// ─── Helper: get the active auth token (same pattern used throughout the file) ─
async function getAuthToken(): Promise<string | null> {
  const customToken = localStorage.getItem('authToken');
  if (customToken) return customToken;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

// BookingFlow - requires doctor data passed via navigation state
export function BookingFlow() {
  const { navigate, goBack } = useAppNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [familyMembers, setFamilyMembers] = useState<{ id: string; name: string; relation: string; age: string }[]>([]);

  const [doctor, setDoctor] = useState<any>(location.state || null);
  const [loadingDoctor, setLoadingDoctor] = useState(!location.state && !!searchParams.get('doctorId'));

  // ─── Razorpay script loader ─────────────────────────────────────────────────
  const razorpayScriptLoaded = useRef(false);
  useEffect(() => {
    if (razorpayScriptLoaded.current || document.getElementById('razorpay-script')) {
      razorpayScriptLoaded.current = true;
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => { razorpayScriptLoaded.current = true; };
    script.onerror = () => console.error('[Razorpay] Failed to load checkout script');
    document.body.appendChild(script);
  }, []);

  // ─── Payment state ──────────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentError, setPaymentError] = useState('');
  const [confirmedPaymentId, setConfirmedPaymentId] = useState('');

  // Fallback: fetch doctor by ID if state was lost (e.g. page refresh)
  useEffect(() => {
    if (doctor) return;
    const doctorId = searchParams.get('doctorId');
    if (!doctorId) return;
    setLoadingDoctor(true);
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctors/${doctorId}`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setDoctor(data); })
      .catch(e => console.error('Failed to fetch doctor for booking:', e))
      .finally(() => setLoadingDoctor(false));
  }, [searchParams, doctor]);

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', relation: '', age: '' });

  const [currentStep, setCurrentStep] = useState<BookingStep>('datetime');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [availableSlots, setAvailableSlots] = useState<{ morning: any[], afternoon: any[], evening: any[] }>({ morning: [], afternoon: [], evening: [] });
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  useEffect(() => {
    if (selectedDate && doctor?.id) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, doctor?.id]);

  useEffect(() => {
    if (currentStep === 'patient') {
      fetchPatients();
    }
  }, [currentStep]);

  const fetchPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/patients?authToken=${token}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } });
      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data);
      }
    } catch (e) {
      console.error("Error fetching patients", e);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const fetchSlots = async (date: string) => {
    if (!doctor?.id) return;
    setIsLoadingSlots(true);
    try {
      const customToken = localStorage.getItem('authToken');
      let sbToken: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        sbToken = session?.access_token || null;
      } catch (e) {}
      const token = customToken || sbToken;
      const headers: any = { 'Authorization': `Bearer ${publicAnonKey}` };
      if (token) headers['X-Supabase-Auth'] = token;
      let url = `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/slots?date=${date}`;
      if (token) url += `&authToken=${token}`;
      const hospitalId = doctor.hospitalId || doctor.hospital_id;
      if (hospitalId) {
        url += `&hospitalId=${hospitalId}`;
      } else {
        url += `&doctorId=${doctor.id}`;
      }
      const response = await fetch(url, { headers });
      if (response.ok) {
        let slots = await response.json();
        if (hospitalId) {
          slots = slots.filter((s: any) => {
            const slotDocId = s.doctorId ? String(s.doctorId) : (s.doctor_id ? String(s.doctor_id) : null);
            const targetDocId = String(doctor.id);
            return slotDocId === targetDocId || !slotDocId;
          });
        }
        const grouped = { morning: [] as any[], afternoon: [] as any[], evening: [] as any[] };
        const getTimeVal = (t: string) => { const d = new Date(`2000/01/01 ${t}`); return isNaN(d.getTime()) ? 0 : d.getTime(); };
        slots.forEach((slot: any) => {
          const timeParts = slot.time.match(/(\d+):(\d+)\s(AM|PM)/);
          if (timeParts) {
            let hour = parseInt(timeParts[1]);
            if (timeParts[3] === 'PM' && hour !== 12) hour += 12;
            if (timeParts[3] === 'AM' && hour === 12) hour = 0;
            if (hour >= 12 && hour < 17) { grouped.afternoon.push(slot); }
            else if (hour >= 17) { grouped.evening.push(slot); }
            else { grouped.morning.push(slot); }
          }
        });
        grouped.morning.sort((a, b) => getTimeVal(a.time) - getTimeVal(b.time));
        grouped.afternoon.sort((a, b) => getTimeVal(a.time) - getTimeVal(b.time));
        grouped.evening.sort((a, b) => getTimeVal(a.time) - getTimeVal(b.time));
        if (slots.length === 0) toast.info("No slots available for this date. The hospital hasn't published slots yet.");
        setAvailableSlots(grouped);
      } else {
        setAvailableSlots({ morning: [], afternoon: [], evening: [] });
        toast.error("Could not load slots. Please try again later.");
      }
    } catch (error) {
      setAvailableSlots({ morning: [], afternoon: [], evening: [] });
      toast.error("Could not load slots. Please try again later.");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleAddMember = async () => {
    if (newMember.name && newMember.relation && newMember.age) {
      setIsLoadingPatients(true);
      try {
        const token = await getAuthToken();
        if (!token) { toast.error("Please sign in to add members"); return; }
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/patients?authToken=${token}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(newMember)
        });
        if (response.ok) {
          const savedMember = await response.json();
          setFamilyMembers([...familyMembers, savedMember]);
          setSelectedPatient(savedMember.id);
          setIsAddingMember(false);
          setNewMember({ name: '', relation: '', age: '' });
          toast.success("Patient added successfully");
        } else {
          toast.error("Failed to save patient details");
        }
      } catch (e) {
        toast.error("Error saving patient details");
      } finally {
        setIsLoadingPatients(false);
      }
    }
  };

  const steps = [
    { id: 'datetime', label: 'Date & Time' },
    { id: 'type', label: 'Consultation Type' },
    { id: 'patient', label: 'Patient Details' },
    { id: 'details', label: 'Visit Details' },
    { id: 'review', label: 'Review' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirmed', label: 'Confirmed' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // ─── Step 1: Create Razorpay order via Edge Function ─────────────────────────
  const createRazorpayOrder = async (token: string) => {
    const amountInPaise = (doctor.consultationFee || 0) * 100;
    const hospitalId = selectedSlot?.ownerId || doctor.hospitalId || doctor.hospital_id;

    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/payments/create-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': token,
        },
        body: JSON.stringify({
          hospital_id: hospitalId,
          doctor_id: doctor.id,
          amount: amountInPaise,
          description: `Consultation with ${doctor.name}`,
          // appointment details for the order notes
          date: selectedDate,
          time: selectedTime,
          type: consultationType,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Order creation failed' }));
      throw new Error(err.message ?? 'Could not create payment order');
    }

    return res.json() as Promise<{ orderId: string; amount: number; currency: string }>;
  };

  // ─── Step 2: Verify payment signature via Edge Function ──────────────────────
  const verifyPayment = async (
    token: string,
    razorpayResponse: RazorpaySuccessResponse
  ) => {
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/payments/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Supabase-Auth': token,
        },
        body: JSON.stringify({
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Verification failed' }));
      throw new Error(err.message ?? 'Payment verification failed');
    }

    return res.json() as Promise<{ success: boolean; paymentId: string }>;
  };

  // ─── Step 3: Save appointment (called after payment verified) ────────────────
  const saveAppointment = async (token: string, paymentId: string): Promise<boolean> => {
    try {
      setIsBooking(true);

      const patient = familyMembers.find(m => m.id === selectedPatient);
      if (!patient) { toast.error('Please select a patient'); return false; }

      let tokenToSend = selectedToken;
      if (!tokenToSend && selectedSlot && availableSlots) {
        const mIdx = availableSlots.morning.findIndex(s => s.time === selectedSlot.time);
        if (mIdx !== -1) { tokenToSend = String(mIdx + 1); }
        else {
          const aIdx = availableSlots.afternoon.findIndex(s => s.time === selectedSlot.time);
          if (aIdx !== -1) { tokenToSend = String(availableSlots.morning.length + aIdx + 1); }
          else {
            const eIdx = availableSlots.evening.findIndex(s => s.time === selectedSlot.time);
            if (eIdx !== -1) { tokenToSend = String(availableSlots.morning.length + availableSlots.afternoon.length + eIdx + 1); }
          }
        }
      }

      const appointmentData = {
        slotId: selectedSlot?.id,
        doctorId: selectedSlot?.doctorId || doctor.id,
        hospitalId: selectedSlot?.ownerId || doctor.hospitalId,
        doctor: doctor,
        date: selectedDate,
        time: selectedTime,
        type: consultationType,
        token: tokenToSend,
        patientDetails: patient,
        reason: reasonForVisit,
        symptoms: symptoms,
        paymentMethod: 'razorpay',   // always razorpay now
        paymentId: paymentId,         // attach the verified payment ID
        amount: doctor.consultationFee,
        paymentStatus: 'paid',
      };

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/bookings?authToken=${token}`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Supabase-Auth': token,
      };

      let response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(appointmentData) });

      // Session refresh safety net (same pattern as original)
      if (response.status === 401) {
        try {
          const { data: { session } } = await supabase.auth.refreshSession();
          if (session?.access_token) {
            const retryHeaders = { ...headers, 'X-Supabase-Auth': session.access_token };
            const retryUrl = `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/bookings?authToken=${session.access_token}`;
            response = await fetch(retryUrl, { method: 'POST', headers: retryHeaders, body: JSON.stringify(appointmentData) });
          }
        } catch { /* custom auth — ignore */ }
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to save appointment';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) errorMessage = errorJson.error;
          if (errorJson.message) errorMessage = errorJson.message;
        } catch { if (errorText.length < 100) errorMessage += `: ${errorText}`; }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.token) { setSelectedToken(result.token); }
      else if (result.queue_number) { setSelectedToken(result.queue_number); }
      else if (selectedSlot?.bookedCount !== undefined) {
        setSelectedToken(String(Number(selectedSlot.bookedCount) + 1));
      }

      return true;
    } catch (error: any) {
      console.error('Booking save error:', error);
      toast.error(error.message || 'Failed to save appointment. Please contact support.');
      return false;
    } finally {
      setIsBooking(false);
    }
  };

  // ─── Main payment + booking orchestration ────────────────────────────────────
  // Called when user clicks "Confirm & Pay" on the payment step.
  // Order: getToken → createOrder → openRazorpay → verifySignature → saveAppointment → confirmed
  const handlePayAndBook = useCallback(async () => {
    setPaymentError('');

    // Guard: Razorpay script must be loaded
    if (!window.Razorpay) {
      toast.error('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      toast.error('Please sign in to continue.');
      return;
    }

    // Get patient name + mobile for Razorpay prefill
    const patient = familyMembers.find(m => m.id === selectedPatient);
    const patientName = patient?.name ?? '';
    // Mobile comes from the custom auth token payload — best effort
    const patientMobile = (() => {
      try {
        const parts = token.split('_'); // format: access_[userId]_[ts]_[random]
        // mobile is stored in user object — try localStorage
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          return user.mobile ?? user.phone ?? '';
        }
      } catch { /* ignore */ }
      return '';
    })();

    try {
      // ── 1. Create order ──────────────────────────────────────────────────────
      setPaymentStatus('creating_order');
      const order = await createRazorpayOrder(token);

      // ── 2. Open Razorpay checkout ────────────────────────────────────────────
      setPaymentStatus('awaiting_razorpay');

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
          amount: order.amount,
          currency: 'INR',
          name: 'Oryga',
          description: `Consultation with ${doctor.name}`,
          order_id: order.orderId,
          prefill: { name: patientName, contact: patientMobile },
          notes: {
            doctor_id: String(doctor.id),
            hospital_id: String(selectedSlot?.ownerId || doctor.hospitalId || ''),
            date: selectedDate,
            time: selectedTime,
          },
          theme: { color: '#E8194A' },  // Oryga primary pink
          modal: {
            escape: false,
            backdropclose: false,
            ondismiss: () => {
              // User closed the Razorpay modal — go back to idle so they can retry
              setPaymentStatus('idle');
              reject(new Error('DISMISSED'));
            },
          },
          handler: async (razorpayResponse) => {
            try {
              // ── 3. Verify payment signature ──────────────────────────────────
              setPaymentStatus('verifying');
              const verification = await verifyPayment(token, razorpayResponse);

              if (!verification.success) {
                reject(new Error('Payment verification failed. Please contact support.'));
                return;
              }

              setConfirmedPaymentId(razorpayResponse.razorpay_payment_id);

              // ── 4. Save appointment ──────────────────────────────────────────
              const saved = await saveAppointment(token, razorpayResponse.razorpay_payment_id);
              if (saved) {
                resolve();
              } else {
                reject(new Error('Appointment could not be saved after payment. Please contact support with payment ID: ' + razorpayResponse.razorpay_payment_id));
              }
            } catch (err) {
              reject(err);
            }
          },
        });

        rzp.open();
      });

      // ── 5. Move to confirmed step ────────────────────────────────────────────
      setPaymentStatus('idle');
      setCurrentStep('confirmed');

    } catch (err: any) {
      if (err?.message === 'DISMISSED') return; // user closed modal — already reset to idle
      console.error('[Payment] Error:', err);
      setPaymentStatus('error');
      setPaymentError(err?.message ?? 'Payment failed. Please try again.');
    }
  }, [doctor, selectedDate, selectedTime, selectedPatient, familyMembers, selectedSlot, consultationType]);

  // ─── nextStep — only the payment step is changed ─────────────────────────────
  const nextStep = async () => {
    if (currentStep === 'payment') {
      // Payment step now handled entirely by handlePayAndBook — this branch
      // should not be reached since the button calls handlePayAndBook directly.
      // Kept as fallback.
      await handlePayAndBook();
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as BookingStep);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id as BookingStep);
    } else {
      goBack();
    }
  };

  const getNextDays = (count: number) => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return days;
  };

  const dates = getNextDays(7);

  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].date);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Derived button state ─────────────────────────────────────────────────────
  const isPaymentProcessing =
    paymentStatus === 'creating_order' ||
    paymentStatus === 'awaiting_razorpay' ||
    paymentStatus === 'verifying' ||
    isBooking;

  const paymentButtonLabel = (() => {
    if (paymentStatus === 'creating_order') return 'Preparing payment…';
    if (paymentStatus === 'awaiting_razorpay') return 'Complete in Razorpay…';
    if (paymentStatus === 'verifying') return 'Verifying payment…';
    if (isBooking) return 'Saving appointment…';
    if (paymentStatus === 'error') return 'Retry Payment';
    return `Pay ₹${doctor?.consultationFee ?? ''}`;
  })();

  // ─────────────────────────────────────────────────────────────────────────────

  if (loadingDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doctor || !doctor.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">No Doctor Selected</h2>
          <p className="text-sm text-slate-500 max-w-sm">Please select a doctor from the available list to proceed with booking.</p>
          <Button onClick={() => navigate('book-doctor')} className="mt-4">Browse Doctors</Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'confirmed') {
    return (
      <div className="h-screen pt-[32px] pb-[64px] bg-gradient-to-b from-primary/5 to-background overflow-y-auto pr-[0px] pl-[0px]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 sm:p-10 text-center border-2 border-primary/20">
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
              <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
            </div>

            <h1 className="text-3xl mb-3">Appointment Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your booking has been successfully confirmed
            </p>

            <Card className="p-6 bg-gradient-to-br from-accent/50 to-accent/30 border-primary/20 mb-6 text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono font-medium text-primary">#ORYGA{Math.floor(Math.random() * 10000)}</span>
                </div>
                {confirmedPaymentId && (
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Payment ID</span>
                    <span className="font-mono text-xs text-green-700 bg-green-50 px-2 py-1 rounded">{confirmedPaymentId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">{doctor.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Specialty</span>
                  <span>{doctor.specialty}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {selectedTime}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Consultation Type</span>
                  <Badge className="bg-primary/10 text-primary border border-primary/20">
                    {consultationType === 'video' ? '📹 Video Consultation' : '🏥 In-person Visit'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Patient</span>
                  <span>{familyMembers.find(m => m.id === selectedPatient)?.name}</span>
                </div>
                {consultationType === 'inperson' && selectedToken && (
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Token Number</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300">
                      <Hash className="w-3 h-3 mr-1" />
                      {(() => {
                        if (selectedSlot && availableSlots) {
                          const mIdx = availableSlots.morning.findIndex(s => s.time === selectedSlot.time);
                          if (mIdx !== -1) return String(mIdx + 1).padStart(2, '0');
                          const aIdx = availableSlots.afternoon.findIndex(s => s.time === selectedSlot.time);
                          if (aIdx !== -1) return String(availableSlots.morning.length + aIdx + 1).padStart(2, '0');
                          const eIdx = availableSlots.evening.findIndex(s => s.time === selectedSlot.time);
                          if (eIdx !== -1) return String(availableSlots.morning.length + availableSlots.afternoon.length + eIdx + 1).padStart(2, '0');
                        }
                        return selectedToken;
                      })()}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Location</span>
                  <span className="text-sm">{doctor.hospital}</span>
                </div>
                <div className="flex items-center justify-between py-3 bg-primary/5 -mx-6 px-6 rounded-lg mt-2">
                  <span className="font-medium">Amount Paid</span>
                  <span className="text-xl font-medium text-primary">₹{doctor.consultationFee}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-3 mb-6">
              <Button size="lg" className="w-full shadow-lg shadow-primary/20" onClick={() => navigate('patient-app')}>
                <Calendar className="w-5 h-5 mr-2" />
                View in My Appointments
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button size="lg" variant="outline" className="w-full" onClick={() => window.print()}>
                  <FileText className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button size="lg" variant="outline" className="w-full" onClick={() => navigate('home')}>
                  Back to Home
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Card className="p-4 bg-emerald-50/50 border-emerald-200/50">
                <div className="flex items-start gap-3 text-sm text-left">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-900 mb-1">Confirmation Sent</p>
                    <p className="text-emerald-700">A confirmation has been sent to your registered email and phone number.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-blue-50/50 border-blue-200/50">
                <div className="flex items-start gap-3 text-sm text-left">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Reminder Scheduled</p>
                    <p className="text-blue-700">You'll receive a reminder notification 1 hour before your appointment.</p>
                  </div>
                </div>
              </Card>
              {consultationType === 'video' && (
                <Card className="p-4 bg-purple-50/50 border-purple-200/50">
                  <div className="flex items-start gap-3 text-sm text-left">
                    <Video className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900 mb-1">Video Call Access</p>
                      <p className="text-purple-700">The video call link will be available 15 minutes before your scheduled time.</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Need to reschedule or cancel? Contact us at{' '}
                <a href="tel:1800-ORYGA-CARE" className="text-primary hover:underline">1800-ORYGA-CARE</a>
                {' '}or manage from your appointments dashboard.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pt-[24px] pb-[64px] bg-background overflow-y-auto pr-[0px] pl-[0px]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Step {currentStepIndex + 1} of {steps.length - 1}
              </span>
              <span className="font-semibold text-primary">
                {steps[currentStepIndex]?.label}
              </span>
            </div>
            <div className="flex w-full h-2 gap-2">
              {steps.slice(0, -1).map((step, index) => (
                <div
                  key={step.id}
                  className={`h-full flex-1 rounded-full transition-all duration-500 ${
                    index <= currentStepIndex ? 'bg-primary' : 'bg-primary/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6">

              {/* ── Date & Time ── */}
              {currentStep === 'datetime' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl mb-2">Select Date & Time</h2>
                    <p className="text-muted-foreground">Choose a convenient slot for your appointment</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-base">Select Date</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate ? new Date(selectedDate) : undefined}
                            onSelect={(date) => { if (date) setSelectedDate(format(date, 'yyyy-MM-dd')); }}
                            initialFocus
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                      {dates.map((date) => {
                        const isSelected = selectedDate === date.date;
                        return (
                          <button
                            key={date.date}
                            onClick={() => setSelectedDate(date.date)}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20 ring-offset-1'
                                : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent/5'
                            }`}
                          >
                            <span className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>{date.day}</span>
                            <span className="text-xl font-bold leading-none mb-1">{date.dayNum}</span>
                            <span className={`text-[10px] uppercase font-medium ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>{date.month}</span>
                            {isSelected && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <h3 className="font-medium text-base">Select Time Slot</h3>
                        </div>
                        {isLoadingSlots && (
                          <span className="text-sm text-primary font-medium animate-pulse flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Finding slots...
                          </span>
                        )}
                        <div className="hidden sm:flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-500"></div>
                            <span className="text-muted-foreground">Available</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-rose-50 border border-rose-200"></div>
                            <span className="text-muted-foreground">Booked</span>
                          </div>
                        </div>
                      </div>

                      {!isLoadingSlots && availableSlots.morning.length === 0 && availableSlots.afternoon.length === 0 && availableSlots.evening.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-6 bg-amber-50/50 border border-amber-200 rounded-xl text-center">
                          <AlertCircle className="w-10 h-10 text-amber-500 mb-3" />
                          <h4 className="font-semibold text-base text-amber-800 mb-1">No Slots Available</h4>
                          <p className="text-sm text-amber-700 max-w-sm">The hospital hasn't published any slots for this date. Please try a different date or contact the hospital directly.</p>
                        </div>
                      )}

                      {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                        const slots = availableSlots[period];
                        if (slots.length === 0) return null;
                        const periodConfig = {
                          morning: { label: 'Morning', color: 'bg-orange-100/50 text-orange-700 border-orange-200' },
                          afternoon: { label: 'Afternoon', color: 'bg-blue-100/50 text-blue-700 border-blue-200' },
                          evening: { label: 'Evening', color: 'bg-indigo-100/50 text-indigo-700 border-indigo-200' },
                        }[period];
                        const offset = period === 'afternoon' ? availableSlots.morning.length : period === 'evening' ? availableSlots.morning.length + availableSlots.afternoon.length : 0;
                        return (
                          <div key={period}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`px-2 py-1 rounded-md text-xs font-medium border ${periodConfig.color}`}>{periodConfig.label}</div>
                              <div className="h-px flex-1 bg-border/60"></div>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {slots.map((slot: any, idx: number) => {
                                const tokenNum = offset + idx + 1;
                                const isBooked = slot.status === 'booked';
                                const isSelected = !isBooked && selectedTime === slot.time;
                                return (
                                  <button
                                    key={slot.id || slot.time}
                                    onClick={() => { if (!isBooked) { setSelectedTime(slot.time); setSelectedSlot(slot); } }}
                                    disabled={isBooked}
                                    className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                                      isSelected ? 'bg-primary border-primary shadow-lg shadow-primary/25 scale-[1.02] ring-2 ring-primary/20 ring-offset-1 z-10'
                                        : !isBooked ? 'bg-white border-emerald-100/50 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-md cursor-pointer'
                                        : 'bg-rose-50/40 border-rose-100 opacity-60 cursor-not-allowed'
                                    }`}
                                  >
                                    <span className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${isSelected ? 'text-primary-foreground/90' : isBooked ? 'text-rose-400' : 'text-emerald-600/80'}`}>
                                      Token {String(tokenNum).padStart(2, '0')}
                                    </span>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-primary-foreground' : isBooked ? 'text-rose-900/40 line-through decoration-rose-300' : 'text-foreground'}`}>
                                      {slot.time}
                                    </span>
                                    {isSelected && (
                                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-background rounded-full flex items-center justify-center shadow-sm border border-primary/20">
                                        <Check className="w-3 h-3 text-primary" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Consultation Type ── */}
              {currentStep === 'type' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl mb-2">Consultation Type</h2>
                    <p className="text-muted-foreground">How would you like to consult?</p>
                  </div>
                  <RadioGroup value={consultationType} onValueChange={setConsultationType}>
                    <div className="space-y-3">
                      <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${consultationType === 'video' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value="video" id="video" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="w-5 h-5 text-primary" />
                            <span className="font-medium">Video Consultation</span>
                            <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Consult with the doctor from anywhere via secure video call</p>
                          <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                            <Check className="w-4 h-4" />
                            <span>Instant access • No travel required • Same quality care</span>
                          </div>
                        </div>
                      </label>
                      <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${consultationType === 'inperson' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value="inperson" id="inperson" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="font-medium">In-Person Visit</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Visit the doctor at {doctor.hospital}</p>
                          <div className="text-sm text-muted-foreground">📍 {doctor.location}</div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* ── Patient Selection ── */}
              {currentStep === 'patient' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl mb-2">Who is this appointment for?</h2>
                    <p className="text-muted-foreground">Select a patient or add a new family member</p>
                  </div>
                  {isLoadingPatients && familyMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Loading saved patients...</p>
                    </div>
                  ) : (
                    <>
                      {familyMembers.length > 0 && !isAddingMember && (
                        <RadioGroup value={selectedPatient} onValueChange={setSelectedPatient}>
                          <div className="space-y-3">
                            {familyMembers.map((member) => (
                              <label key={member.id} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPatient === member.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                <RadioGroupItem value={member.id} id={member.id} />
                                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                                  <User className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{member.name}</div>
                                  <div className="text-sm text-muted-foreground">{member.relation} • {member.age} years</div>
                                </div>
                                {member.id === 'self' && <Badge variant="secondary">You</Badge>}
                              </label>
                            ))}
                          </div>
                        </RadioGroup>
                      )}
                      {!isAddingMember && (
                        <Button variant="outline" className="w-full mt-4" onClick={() => setIsAddingMember(true)}>
                          <Users className="w-4 h-4 mr-2" />
                          Add New Family Member
                        </Button>
                      )}
                    </>
                  )}
                  {(isAddingMember || (!isLoadingPatients && familyMembers.length === 0)) && (
                    <Card className="p-4 border-2 border-primary/20 bg-primary/5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Enter Patient Details</h3>
                          {familyMembers.length > 0 && <Button variant="ghost" size="sm" onClick={() => setIsAddingMember(false)}>Cancel</Button>}
                        </div>
                        <div className="grid gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="Patient's full name" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="relation">Relation</Label>
                              <Input id="relation" placeholder="e.g. Self, Mother" value={newMember.relation} onChange={(e) => setNewMember({...newMember, relation: e.target.value})} />
                            </div>
                            <div>
                              <Label htmlFor="age">Age</Label>
                              <Input id="age" placeholder="e.g. 32" type="number" value={newMember.age} onChange={(e) => setNewMember({...newMember, age: e.target.value})} />
                            </div>
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleAddMember} disabled={!newMember.name || !newMember.relation || !newMember.age || isLoadingPatients}>
                          {isLoadingPatients ? 'Saving...' : 'Save & Select Patient'}
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* ── Visit Details ── */}
              {currentStep === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl mb-2">Visit Details</h2>
                    <p className="text-muted-foreground">Help the doctor prepare for your consultation</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Input id="reason" placeholder="e.g., Routine checkup, Follow-up, New problem" value={reasonForVisit} onChange={(e) => setReasonForVisit(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="symptoms">Describe Your Symptoms (Optional)</Label>
                      <Textarea id="symptoms" placeholder="Tell us what you're experiencing..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="mt-2 min-h-[120px]" />
                      <p className="text-xs text-muted-foreground mt-2">This information is confidential and will only be shared with your doctor</p>
                    </div>
                    <Card className="p-4 bg-accent/50 border-primary/20">
                      <div className="flex gap-3">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium mb-1">Have medical records?</div>
                          <p className="text-sm text-muted-foreground mb-3">Upload any relevant reports, prescriptions, or test results</p>
                          <Button variant="outline" size="sm">Upload Files</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* ── Review ── */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl mb-2">Review Your Booking</h2>
                    <p className="text-muted-foreground">Please verify all details before proceeding</p>
                  </div>
                  <div className="space-y-4">
                    <Card className="overflow-hidden border-2 border-primary/20">
                      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-4 border-b border-primary/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">Appointment Details</h3>
                              <p className="text-sm text-muted-foreground">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <Badge className="bg-primary text-white">{consultationType === 'video' ? '📹 Video' : '🏥 In-Person'}</Badge>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div>
                            <div><div className="text-xs text-muted-foreground mb-0.5">Time Slot</div><div className="font-medium">{selectedTime}</div></div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              {consultationType === 'video' ? <Video className="w-5 h-5 text-primary" /> : <MapPin className="w-5 h-5 text-primary" />}
                            </div>
                            <div><div className="text-xs text-muted-foreground mb-0.5">Type</div><div className="font-medium">{consultationType === 'video' ? 'Video Consultation' : 'In-Person Visit'}</div></div>
                          </div>
                          <div className={`flex items-center gap-3 p-3 rounded-lg bg-accent/30 ${consultationType === 'inperson' && selectedToken ? '' : 'sm:col-span-2'}`}>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-primary" /></div>
                            <div className="flex-1 min-w-0"><div className="text-xs text-muted-foreground mb-0.5">Location</div><div className="font-medium text-sm truncate">{doctor.hospital}</div></div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <span className="text-xl text-primary">{(doctor.name || 'Dr')[0]}</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-lg">{doctor.name}</div>
                              <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm">⭐ <span className="font-medium">{doctor.rating}</span></div>
                              <div className="text-xs text-muted-foreground">{doctor.reviews} reviews</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-blue-50/50 border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
                        <span className="font-medium text-blue-900">Patient Information</span>
                      </div>
                      <div className="pl-13">
                        <div className="font-medium">{familyMembers.find(m => m.id === selectedPatient)?.name}</div>
                        <div className="text-sm text-blue-700">{familyMembers.find(m => m.id === selectedPatient)?.relation} • {familyMembers.find(m => m.id === selectedPatient)?.age} years</div>
                      </div>
                    </Card>

                    {reasonForVisit && (
                      <Card className="p-4 bg-purple-50/50 border-purple-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>
                          <span className="font-medium text-purple-900">Visit Details</span>
                        </div>
                        <div className="space-y-2 pl-13">
                          <div><span className="text-sm text-purple-700 font-medium">Reason: </span><span className="text-sm text-purple-900">{reasonForVisit}</span></div>
                          {symptoms && <div><span className="text-sm text-purple-700 font-medium">Symptoms: </span><span className="text-sm text-purple-900">{symptoms}</span></div>}
                        </div>
                      </Card>
                    )}
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Your information is secure and confidential</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Payment ── */}
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl mb-2">Payment</h2>
                    <p className="text-muted-foreground">Review the fee and proceed to pay securely via Razorpay</p>
                  </div>

                  {/* Fee summary */}
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Consultation Fee</div>
                        <div className="text-2xl font-semibold">₹{doctor.consultationFee}</div>
                      </div>
                      <Badge className="bg-primary text-white">Pay Now</Badge>
                    </div>
                  </Card>

                  {/* What's accepted */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Accepted via Razorpay</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: '📱', label: 'UPI', sub: 'GPay, PhonePe, Paytm' },
                        { icon: '💳', label: 'Cards', sub: 'Visa, Mastercard, Rupay' },
                        { icon: '🏦', label: 'Net Banking', sub: 'All major banks' },
                        { icon: '👝', label: 'Wallets', sub: 'Paytm, Mobikwik' },
                      ].map((method) => (
                        <div key={method.label} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                          <span className="text-xl">{method.icon}</span>
                          <div>
                            <div className="text-sm font-medium">{method.label}</div>
                            <div className="text-xs text-muted-foreground">{method.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error state */}
                  {paymentStatus === 'error' && paymentError && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Payment failed</p>
                        <p className="text-xs text-red-700 mt-0.5">{paymentError}</p>
                      </div>
                    </div>
                  )}

                  {/* Security note */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>100% secure · SSL encrypted · PCI DSS compliant · Powered by Razorpay</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={previousStep} disabled={isPaymentProcessing}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {/* ── Payment step: dedicated Pay button ── */}
              {currentStep === 'payment' ? (
                <Button
                  onClick={handlePayAndBook}
                  disabled={isPaymentProcessing}
                  className="min-w-[160px]"
                >
                  {isPaymentProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {paymentButtonLabel}
                    </span>
                  ) : (
                    paymentButtonLabel
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 'datetime' && (!selectedDate || !selectedTime)) ||
                    (currentStep === 'type' && !consultationType) ||
                    (currentStep === 'patient' && !selectedPatient)
                  }
                >
                  Continue
                </Button>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="ORYGA" className="w-8 h-8" />
                <span className="text-lg">ORYGA</span>
              </div>
              <div className="space-y-4 pb-4 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-xl text-primary">{(doctor.name || 'Dr')[0]}</span>
                  </div>
                  <div>
                    <div className="font-medium mb-1">{doctor.name}</div>
                    <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center gap-1 text-sm">⭐ {doctor.rating}</div>
                      <span className="text-xs text-muted-foreground">({doctor.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.hospital}</span>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <div className="text-sm space-y-2">
                  {selectedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{selectedDate}</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{selectedTime}</span>
                    </div>
                  )}
                  {consultationType && (
                    <div className="flex items-center gap-2">
                      {consultationType === 'video' ? <Video className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-primary" />}
                      <span>{consultationType === 'video' ? 'Video Call' : 'In-person'}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Consultation Fee</span>
                    <span>₹{doctor.consultationFee}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>₹{doctor.consultationFee}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
