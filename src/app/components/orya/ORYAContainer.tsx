import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ORYANode } from './ORYANode';
import { useORYA } from '../../contexts/ORYAContext';
import { X } from 'lucide-react';

export function ORYAContainer() {
  const { active, activeEvent, currentSeverity, dismissEvent } = useORYA();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!active) return null;

  const isCritical = currentSeverity === 'critical';

  // Message Mapping
  const getMessage = (key: string, metadata: any) => {
    switch (key) {
      case 'REPORT_ANALYSIS_AVAILABLE':
        return "I've analyzed this report. Tap to see the breakdown.";
      case 'SLOT_AVAILABILITY_CHECK':
        return "I verified these slots are currently available.";
      case 'PATIENT_WAITING_LATE':
        return `Patient is waiting (${metadata?.count || 1}). Delay detected.`;
      case 'SYSTEM_NORMAL':
        return "System running optimally.";
      default:
        return "System notification.";
    }
  };

  const handleNodeClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`fixed z-[9999] pointer-events-none ${isCritical ? 'inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm' : 'bottom-6 right-6'}`}>
      <div className="relative pointer-events-auto flex flex-col items-end gap-2">
        
        {/* Message Bubble */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50 ring-1 ring-slate-200/50 w-[280px] mb-3 origin-bottom-right ${isCritical ? 'text-center' : 'text-left'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${activeEvent ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ORYA System</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {activeEvent 
                    ? getMessage(activeEvent.message_key, activeEvent.metadata)
                    : "System status is nominal. How can I assist you?"}
                </p>
                
                {!activeEvent && (
                  <div className="grid gap-2 pt-1">
                     <button className="group flex items-center justify-between w-full px-3 py-2.5 bg-white border border-slate-100 hover:border-primary/20 hover:shadow-sm hover:shadow-primary/5 rounded-xl transition-all">
                       <span className="text-xs font-medium text-slate-600 group-hover:text-primary transition-colors">Book Appointment</span>
                       <span className="text-xs text-slate-300 group-hover:text-primary transition-colors">→</span>
                     </button>
                     <button className="group flex items-center justify-between w-full px-3 py-2.5 bg-white border border-slate-100 hover:border-primary/20 hover:shadow-sm hover:shadow-primary/5 rounded-xl transition-all">
                       <span className="text-xs font-medium text-slate-600 group-hover:text-primary transition-colors">Find Hospital</span>
                       <span className="text-xs text-slate-300 group-hover:text-primary transition-colors">→</span>
                     </button>
                     <button className="group flex items-center justify-between w-full px-3 py-2.5 bg-red-50/50 border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all">
                       <span className="text-xs font-medium text-red-600 group-hover:text-red-700 transition-colors">Emergency</span>
                       <span className="text-xs text-red-300 group-hover:text-red-500 transition-colors">→</span>
                     </button>
                  </div>
                )}

                {activeEvent && (
                <div className="flex gap-2 pt-2 mt-2 border-t border-slate-100">
                  <button 
                    onClick={() => dismissEvent(activeEvent.id)}
                    className="flex-1 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Dismiss
                  </button>
                  {activeEvent.severity === 'assist' && (
                     <button className="flex-1 py-1.5 text-xs font-medium bg-primary text-white shadow-sm hover:bg-primary/90 rounded-lg transition-colors">
                       View Details
                     </button>
                  )}
                </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Node */}
        <ORYANode 
          severity={currentSeverity} 
          onClick={handleNodeClick}
          className={isCritical ? 'w-24 h-24' : ''}
        />
      </div>
    </div>
  );
}
