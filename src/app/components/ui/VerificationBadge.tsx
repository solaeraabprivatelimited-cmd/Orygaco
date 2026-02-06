import { CheckCircle, Clock, Shield } from 'lucide-react';
import { Badge } from './badge';
import { cn } from './utils';

interface VerificationBadgeProps {
  status?: string; // 'verified_doctor' | 'verified_hospital' | 'pending_verification' | 'rejected'
  className?: string;
  showLabel?: boolean;
}

export function VerificationBadge({ status, className, showLabel = true }: VerificationBadgeProps) {
  if (!status) return null;

  if (status === 'verified_doctor' || status === 'verified_hospital') {
    return (
      <Badge variant="secondary" className={cn("bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 gap-1.5", className)}>
        <CheckCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
        {showLabel && (status === 'verified_doctor' ? 'Verified Doctor' : 'Verified Hospital')}
      </Badge>
    );
  }

  if (status === 'govt_registered') {
    return (
      <Badge variant="secondary" className={cn("bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 gap-1.5", className)}>
        <Shield className="w-3.5 h-3.5 fill-blue-600 text-white" />
        {showLabel && 'Govt Registered'}
      </Badge>
    );
  }

  if (status === 'pending_verification') {
    return (
      <Badge variant="outline" className={cn("text-slate-500 border-slate-300 gap-1.5", className)}>
        <Clock className="w-3.5 h-3.5" />
        {showLabel && 'Verification Pending'}
      </Badge>
    );
  }

  return null;
}
