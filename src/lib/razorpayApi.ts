// src/app/lib/razorpayApi.ts
//
// All Razorpay-related API calls go through here.
// Both functions call YOUR Supabase Edge Function — not Razorpay directly.
// The Edge Function holds the secret key and talks to Razorpay's API.

import type { RazorpaySuccessResponse } from '../hooks/useRazorpay';

// ─── Config ───────────────────────────────────────────────────────────────────

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-fd75a5db`
  : '';

// Grab auth token from localStorage — same pattern as the rest of Oryga
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

async function callEdgeFunction<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(`${EDGE_FUNCTION_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error?.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateOrderParams {
  appointmentId: string;
  hospitalId: string;
  patientId: string;
  amountInPaise: number;    // e.g. 50000 for ₹500
  description: string;      // e.g. "Appointment with Dr. Sharma"
}

export interface CreateOrderResponse {
  orderId: string;          // Razorpay order ID e.g. order_XXXXXXXX
  amount: number;           // in paise
  currency: string;
  appointmentId: string;
}

export interface VerifyPaymentParams {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  appointmentId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  appointmentId: string;
  paymentId: string;
  message: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Step 1 of payment flow.
 * Calls Edge Function → Edge Function calls Razorpay Orders API.
 * Returns a Razorpay order_id to pass to the checkout widget.
 */
export async function createRazorpayOrder(
  params: CreateOrderParams
): Promise<CreateOrderResponse> {
  return callEdgeFunction<CreateOrderResponse>('/payments/create-order', {
    appointment_id: params.appointmentId,
    hospital_id: params.hospitalId,
    patient_id: params.patientId,
    amount: params.amountInPaise,
    description: params.description,
  });
}

/**
 * Step 2 of payment flow — called AFTER Razorpay checkout succeeds.
 * Sends the three Razorpay response values to the Edge Function
 * which verifies the HMAC signature and marks the appointment as paid.
 *
 * IMPORTANT: Never trust the frontend alone for payment confirmation.
 * Always verify the signature on the backend before marking as paid.
 */
export async function verifyRazorpayPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResponse> {
  return callEdgeFunction<VerifyPaymentResponse>('/payments/verify', {
    razorpay_payment_id: params.razorpay_payment_id,
    razorpay_order_id: params.razorpay_order_id,
    razorpay_signature: params.razorpay_signature,
    appointment_id: params.appointmentId,
  });
}
