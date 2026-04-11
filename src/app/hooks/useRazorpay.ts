// src/app/hooks/useRazorpay.ts
//
// Loads the Razorpay checkout script once and exposes a typed openCheckout()
// function. Safe to call from any component — script is only injected once.

import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RazorpayOptions {
  key: string;
  amount: number;           // in paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    contact?: string;
    email?: string;
  };
  notes?: Record<string, string>;
  theme?: { color: string };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
  handler: (response: RazorpaySuccessResponse) => void;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: () => void) => void;
}

export interface OpenCheckoutParams {
  orderId: string;
  amount: number;           // in paise
  description: string;
  prefill?: {
    name?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

export function useRazorpay() {
  const scriptLoadedRef = useRef(false);

  // Load the Razorpay script on mount (once per app session)
  useEffect(() => {
    if (scriptLoadedRef.current || document.getElementById('razorpay-script')) {
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
    };
    script.onerror = () => {
      console.error('[Razorpay] Failed to load checkout script');
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove — keep loaded for the session
    };
  }, []);

  const openCheckout = useCallback(
    ({
      orderId,
      amount,
      description,
      prefill,
      notes,
      onSuccess,
      onDismiss,
    }: OpenCheckoutParams) => {
      if (!window.Razorpay) {
        console.error('[Razorpay] Script not loaded yet. Retry in a moment.');
        return;
      }

      if (!RAZORPAY_KEY_ID) {
        console.error('[Razorpay] VITE_RAZORPAY_KEY_ID is not set in .env');
        return;
      }

      const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'Oryga',
        description,
        order_id: orderId,
        prefill: {
          name: prefill?.name ?? '',
          contact: prefill?.contact ?? '',
        },
        notes: notes ?? {},
        theme: {
          color: '#E8194A', // Oryga primary pink
        },
        modal: {
          escape: false,          // prevent accidental close via Escape key
          backdropclose: false,   // prevent close on backdrop click
          ondismiss: onDismiss,
        },
        handler: onSuccess,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    []
  );

  return { openCheckout };
}
