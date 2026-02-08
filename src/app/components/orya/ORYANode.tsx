import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export type ORYASeverity = 'idle' | 'info' | 'assist' | 'alert' | 'critical';

interface ORYANodeProps {
  severity: ORYASeverity;
  onClick?: () => void;
  className?: string;
}

export function ORYANode({ severity, onClick, className = '' }: ORYANodeProps) {
  // Visual mapping
  const colors = {
    idle: 'bg-white border border-slate-200 shadow-lg',
    info: 'bg-blue-500 shadow-lg shadow-blue-500/30',
    assist: 'bg-indigo-500 shadow-lg shadow-indigo-500/40',
    alert: 'bg-amber-500 shadow-lg shadow-amber-500/40',
    critical: 'bg-red-600 shadow-xl shadow-red-600/50'
  };

  const sizes = {
    idle: 'w-12 h-12', // Updated to FAB size
    info: 'w-12 h-12',
    assist: 'w-14 h-14',
    alert: 'w-14 h-14',
    critical: 'w-16 h-16'
  };

  // Pulse animation variants
  const pulseVariants = {
    idle: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    active: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    alert: {
      scale: [1, 1.1, 1],
      boxShadow: [
        "0 0 0 0px rgba(245, 158, 11, 0.4)",
        "0 0 0 10px rgba(245, 158, 11, 0)",
        "0 0 0 0px rgba(245, 158, 11, 0)"
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity
      }
    },
    critical: {
      scale: [1, 1.2, 1],
      boxShadow: [
        "0 0 0 0px rgba(220, 38, 38, 0.5)",
        "0 0 0 20px rgba(220, 38, 38, 0)",
        "0 0 0 0px rgba(220, 38, 38, 0)"
      ],
      transition: {
        duration: 0.8,
        repeat: Infinity
      }
    }
  };

  const isIdle = severity === 'idle';
  const currentVariant = isIdle ? 'idle' : (severity === 'alert' ? 'alert' : (severity === 'critical' ? 'critical' : 'active'));

  return (
    <motion.div
      className={`rounded-full cursor-pointer flex items-center justify-center backdrop-blur-sm transition-colors duration-300 ${colors[severity]} ${sizes[severity]} ${className}`}
      variants={pulseVariants}
      animate={currentVariant}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      layout
    >
      {/* Inner Core for visual depth */}
      {isIdle ? (
         <div className="w-2 h-2 bg-slate-400 rounded-full opacity-50" />
      ) : (
        <div className="w-1/2 h-1/2 bg-white/20 rounded-full blur-[1px]" />
      )}
    </motion.div>
  );
}
