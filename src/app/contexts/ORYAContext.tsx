import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// Use relative import to ensure resolution works
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '@/lib/supabase';

// Types
export type ORYASeverity = 'idle' | 'info' | 'assist' | 'alert' | 'critical';

export interface ORYAEvent {
  id: string;
  severity: ORYASeverity;
  message_key: string;
  metadata?: any;
  expires_at?: string;
}

interface ORYAContextType {
  active: boolean;
  events: ORYAEvent[];
  activeEvent: ORYAEvent | null;
  setContext: (ctx: string, resourceId?: string) => void;
  dismissEvent: (id: string) => void;
  currentSeverity: ORYASeverity;
}

const ORYAContext = createContext<ORYAContextType | undefined>(undefined);

export function useORYA() {
  const context = useContext(ORYAContext);
  if (!context) {
    throw new Error('useORYA must be used within an ORYAProvider');
  }
  return context;
}

export function ORYAProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(true); // Default true, controlled by backend
  const [events, setEvents] = useState<ORYAEvent[]>([]);
  const [activeContext, setActiveContext] = useState('system');
  const [activeResourceId, setActiveResourceId] = useState<string | undefined>(undefined);
  
  // Calculate highest severity
  const currentSeverity: ORYASeverity = events.length === 0 
    ? 'idle' 
    : events.reduce((prev, curr) => {
        const order = { idle: 0, info: 1, assist: 2, alert: 3, critical: 4 };
        return order[curr.severity] > order[prev] ? curr.severity : prev;
      }, 'idle' as ORYASeverity);

  const activeEvent = events.find(e => e.severity === currentSeverity) || null;

  const fetchEvents = async () => {
    if (!projectId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Support custom token from localStorage (OTP flow)
      const customToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const effectiveToken = session?.access_token || customToken;
      
      let url = `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/orya/events?context=${activeContext}`;
      if (activeResourceId) url += `&resourceId=${activeResourceId}`;
      if (effectiveToken) url += `&authToken=${effectiveToken}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (response.ok) {
        const data = await response.json();
        setActive(data.active);
        // Filter out expired events
        const validEvents = (data.events || []).filter((e: ORYAEvent) => !e.expires_at || new Date(e.expires_at) > new Date());
        setEvents(validEvents);
      } else {
        console.warn("ORYA Fetch Failed:", response.status);
      }
    } catch (e) {
      // Quiet fail for network errors
      console.log("ORYA Service unavailable");
      setActive(false);
    }
  };

  // Poll for events (Pull-based)
  useEffect(() => {
    // Initial fetch
    fetchEvents();

    // Poll every 30s (passive) or 10s if active context
    const interval = activeContext === 'system' ? 30000 : 10000;
    const timer = setInterval(fetchEvents, interval);

    return () => clearInterval(timer);
  }, [activeContext, activeResourceId]);

  const setContext = (ctx: string, resourceId?: string) => {
    if (ctx !== activeContext || resourceId !== activeResourceId) {
      setActiveContext(ctx);
      setActiveResourceId(resourceId);
      // Trigger immediate fetch on context switch
      setTimeout(fetchEvents, 100); 
    }
  };

  const dismissEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    // Optional: Log dismissal to backend
  };

  return (
    <ORYAContext.Provider value={{ active, events, activeEvent, setContext, dismissEvent, currentSeverity }}>
      {children}
    </ORYAContext.Provider>
  );
}
