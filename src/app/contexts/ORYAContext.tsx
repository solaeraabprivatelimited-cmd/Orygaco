import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '@/lib/supabase';

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
  if (!context) throw new Error('useORYA must be used within an ORYAProvider');
  return context;
}

export function ORYAProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false); // false until backend confirms
  const [events, setEvents] = useState<ORYAEvent[]>([]);
  const [activeContext, setActiveContext] = useState('system');
  const [activeResourceId, setActiveResourceId] = useState<string | undefined>(undefined);
  // Track if the endpoint has returned 404 — stop polling until next context switch
  const [endpointMissing, setEndpointMissing] = useState(false);

  const currentSeverity: ORYASeverity = events.length === 0
    ? 'idle'
    : events.reduce((prev, curr) => {
        const order = { idle: 0, info: 1, assist: 2, alert: 3, critical: 4 };
        return order[curr.severity] > order[prev] ? curr.severity : prev;
      }, 'idle' as ORYASeverity);

  const activeEvent = events.find(e => e.severity === currentSeverity) || null;

  const fetchEvents = async () => {
    // Don't hammer a known-missing endpoint
    if (!projectId || endpointMissing) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
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
        setEndpointMissing(false);
        setActive(data.active ?? false);
        const validEvents = (data.events || []).filter(
          (e: ORYAEvent) => !e.expires_at || new Date(e.expires_at) > new Date()
        );
        setEvents(validEvents);
      } else if (response.status === 404) {
        // Endpoint not implemented yet — stop polling silently
        setEndpointMissing(true);
        setActive(false);
      }
      // All other errors (401, 500, etc.) → quiet fail, keep polling
    } catch {
      // Network error — quiet fail, keep polling
      setActive(false);
    }
  };

  useEffect(() => {
    // Reset missing flag when context changes so we retry
    setEndpointMissing(false);
    fetchEvents();

    const interval = activeContext === 'system' ? 30000 : 10000;
    const timer = setInterval(fetchEvents, interval);
    return () => clearInterval(timer);
  }, [activeContext, activeResourceId]);

  const setContext = (ctx: string, resourceId?: string) => {
    if (ctx !== activeContext || resourceId !== activeResourceId) {
      setActiveContext(ctx);
      setActiveResourceId(resourceId);
      setEndpointMissing(false); // allow retry on context switch
      setTimeout(fetchEvents, 100);
    }
  };

  const dismissEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <ORYAContext.Provider value={{ active, events, activeEvent, setContext, dismissEvent, currentSeverity }}>
      {children}
    </ORYAContext.Provider>
  );
}
