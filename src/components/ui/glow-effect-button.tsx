import { GlowEffect } from '@/components/ui/glow-effect';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

export interface GlowEffectButtonProps {
  children?: React.ReactNode;
  rightIcon?: React.ReactNode;
  colors?: string[];
  mode?: 'rotate' | 'pulse' | 'breathe' | 'colorShift' | 'flowHorizontal' | 'static';
  blur?: 'softest' | 'soft' | 'medium' | 'strong' | 'stronger' | 'strongest' | 'none' | number;
  duration?: number;
  scale?: number;
  className?: string;
  buttonClassName?: string;
}

export function GlowEffectButton({
  children = 'Explore',
  rightIcon = <ArrowRight className='h-4 w-4' />,
  colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'],
  mode = 'colorShift',
  blur = 'soft',
  duration = 3,
  scale = 0.9,
  className = '',
  buttonClassName = '',
}: GlowEffectButtonProps) {
  return (
    <div className={cn('relative', className)}>
      <GlowEffect
        colors={colors}
        mode={mode}
        blur={blur}
        duration={duration}
        scale={scale}
      />
      <button className={cn(
        'relative inline-flex items-center justify-center gap-1 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-50 border border-white/10', 
        buttonClassName
      )}>
        {children}
        {rightIcon}
      </button>
    </div>
  );
} 