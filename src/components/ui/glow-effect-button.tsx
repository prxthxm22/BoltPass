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
  borderWidth?: number;
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
  borderWidth = 2,
}: GlowEffectButtonProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      <div 
        className="relative rounded-full overflow-hidden" 
        style={{ padding: `${borderWidth}px` }}
      >
        {/* Glow effect in the border */}
        <div className="absolute inset-0 z-0">
          <GlowEffect
            colors={colors}
            mode={mode}
            blur={blur}
            duration={duration}
            scale={scale}
          />
        </div>
        
        {/* Button with black background */}
        <div className={cn(
          'relative z-10 flex items-center justify-center gap-1 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-50', 
          buttonClassName
        )}>
          {children}
          {rightIcon && rightIcon}
        </div>
      </div>
    </div>
  );
} 