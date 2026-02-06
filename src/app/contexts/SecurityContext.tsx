import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Replicating Backend Constants for Frontend Usage
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HOSPITAL_ADMIN: 'hospital',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient'
};

export const PERMISSIONS = {
  VIEW_OWN_APPOINTMENTS: 'view_own_appointments',
  VIEW_HOSPITAL_APPOINTMENTS: 'view_hospital_appointments',
  MANAGE_APPOINTMENTS: 'manage_appointments',
  MANAGE_SLOTS: 'manage_slots',
  VERIFY_USERS: 'verify_users',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_STAFF: 'manage_staff',
  SECURE_EXPORT: 'secure_export',
  MANAGE_SETTINGS: 'manage_settings'
};

// Define permission mapping with string keys to avoid type indexing issues
const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.HOSPITAL_ADMIN]: [
    PERMISSIONS.VIEW_HOSPITAL_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_SLOTS,
    PERMISSIONS.SECURE_EXPORT,
    PERMISSIONS.VIEW_OWN_APPOINTMENTS,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.MANAGE_SETTINGS
  ],
  [ROLES.DOCTOR]: [
    PERMISSIONS.VIEW_OWN_APPOINTMENTS,
    PERMISSIONS.MANAGE_SLOTS,
    PERMISSIONS.MANAGE_APPOINTMENTS
  ],
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.VIEW_HOSPITAL_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS
  ],
  [ROLES.PATIENT]: [
    PERMISSIONS.VIEW_OWN_APPOINTMENTS
  ]
};

interface SecurityContextType {
  user: User | null;
  role: string;
  permissions: string[];
  isVerified: boolean;
  isLoading: boolean;
  checkPermission: (permission: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType>({
  user: null,
  role: 'patient',
  permissions: [],
  isVerified: false,
  isLoading: true,
  checkPermission: () => false
});

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('patient');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        resolveRole(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        resolveRole(session.user);
      } else {
        setUser(null);
        setRole('patient');
        setIsVerified(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const resolveRole = async (currentUser: User) => {
    // 1. Check Metadata first (Fastest)
    let userRole = currentUser.user_metadata?.role || 'patient';
    let verified = currentUser.user_metadata?.verification_status?.startsWith('verified') || false;

    setRole(userRole);
    setIsVerified(verified);
    setIsLoading(false);
  };

  const checkPermission = (permission: string) => {
    const userPermissions = ROLE_PERMISSIONS[role] || [];
    return userPermissions.includes(permission);
  };

  const permissions = ROLE_PERMISSIONS[role] || [];

  return (
    <SecurityContext.Provider value={{ user, role, permissions, isVerified, isLoading, checkPermission }}>
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => useContext(SecurityContext);
