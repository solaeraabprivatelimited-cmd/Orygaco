// src/app/components/PaymentModal.tsx
//
// Shown between "Confirm Appointment" and the Razorpay checkout widget.
// Displays a breakdown of what the patient is paying and why.
// On "Pay Now", it calls createRazorpayOrder then opens Razorpay checkout.

import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useRazorpay } from '../hooks/useRazorpay';
import { createRazorpayOrder, verifyRazorpayPayment } from '../lib/razorpayApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentId: string) => void;

  // Appointment details
  appointmentId: string;
  hospitalId: string;
  patientId: string;
  patientName: string;
  patientMobile: string;

  // Display info
  doctorName: string;
  hospitalName: string;
  appointmentDate: string;    // e.g. "Mon, 14 Apr 2026"
  appointmentTime: string;    // e.g. "10:30 AM"
  consultationFee: number;    // in rupees e.g. 500
}

// ─── Component ────────────────────────────────────────────────────────────────

type PaymentState = 'idle' | 'creating_order' | 'awaiting_payment' | 'verifying' | 'error';

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  appointmentId,
  hospitalId,
  patientId,
  patientName,
  patientMobile,
  doctorName,
  hospitalName,
  appointmentDate,
  appointmentTime,
  consultationFee,
}: PaymentModalProps) {
  const { openCheckout } = useRazorpay();
  const [state, setState] = useState<PaymentState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Platform convenience fee — adjust as needed
  const platformFee = 0;
  const totalAmount = consultationFee + platformFee;
  const totalInPaise = totalAmount * 100;

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setErrorMessage('');
    setState('creating_order');

    try {
      // Step 1: Create Razorpay order via Edge Function
      const order = await createRazorpayOrder({
        appointmentId,
        hospitalId,
        patientId,
        amountInPaise: totalInPaise,
        description: `Consultation with ${doctorName} at ${hospitalName}`,
      });

      setState('awaiting_payment');

      // Step 2: Open Razorpay checkout
      openCheckout({
        orderId: order.orderId,
        amount: order.amount,
        description: `${doctorName} · ${appointmentDate}`,
        prefill: {
          name: patientName,
          contact: patientMobile,
        },
        notes: {
          appointment_id: appointmentId,
          hospital_id: hospitalId,
        },
        onSuccess: async (response) => {
          setState('verifying');

          try {
            // Step 3: Verify payment signature on backend
            const result = await verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
            });

            if (result.success) {
              onPaymentSuccess(result.paymentId);
            } else {
              setState('error');
              setErrorMessage('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setState('error');
            setErrorMessage(
              err instanceof Error ? err.message : 'Verification failed. Please contact support.'
            );
          }
        },
        onDismiss: () => {
          // User closed the Razorpay modal without paying
          setState('idle');
        },
      });
    } catch (err) {
      setState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not initiate payment. Please try again.'
      );
    }
  };

  const isLoading = state === 'creating_order' || state === 'verifying';

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0"
      onClick={(e) => {
        // Close on backdrop click only when idle
        if (e.target === e.currentTarget && state === 'idle') onClose();
      }}
    >
      {/* Modal card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[#E8194A]" />
            <span className="font-semibold text-gray-900 text-sm">Payment Summary</span>
          </div>
          {state === 'idle' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={16} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Appointment details */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Booking for</p>
          <p className="font-semibold text-gray-900">{doctorName}</p>
          <p className="text-sm text-gray-600">{hospitalName}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs bg-[#E8194A]/10 text-[#E8194A] px-2 py-0.5 rounded-full font-medium">
              {appointmentDate}
            </span>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
              {appointmentTime}
            </span>
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Consultation fee</span>
            <span className="text-gray-900 font-medium">₹{consultationFee}</span>
          </div>
          {platformFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Convenience fee</span>
              <span className="text-gray-900 font-medium">₹{platformFee}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-[#E8194A] text-lg">₹{totalAmount}</span>
          </div>
        </div>

        {/* Security note */}
        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={13} className="text-[#00B894] flex-shrink-0" />
            <span>Secured by Razorpay · UPI, Cards, Net Banking accepted</span>
          </div>
        </div>

        {/* Error message */}
        {state === 'error' && errorMessage && (
          <div className="mx-5 mb-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* CTA */}
        <div className="px-5 pb-5">
          <button
            onClick={handlePayNow}
            disabled={isLoading || state === 'awaiting_payment'}
            className="w-full bg-[#E8194A] hover:bg-[#c9133d] disabled:opacity-60 disabled:cursor-not-allowed
                       text-white font-semibold rounded-xl py-3.5 text-sm
                       flex items-center justify-center gap-2
                       transition-colors duration-150 active:scale-[0.98]"
          >
            {state === 'creating_order' && (
              <>
                <Loader2 size={16} className="animate-spin" />
                Preparing payment…
              </>
            )}
            {state === 'verifying' && (
              <>
                <Loader2 size={16} className="animate-spin" />
                Confirming payment…
              </>
            )}
            {state === 'awaiting_payment' && (
              <>
                <Loader2 size={16} className="animate-spin" />
                Complete payment in Razorpay…
              </>
            )}
            {(state === 'idle' || state === 'error') && (
              <>Pay ₹{totalAmount}</>
            )}
          </button>

          {state === 'idle' && (
            <button
              onClick={onClose}
              className="w-full mt-2 text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
