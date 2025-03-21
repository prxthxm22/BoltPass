
import React from 'react';
import { PasswordStrength } from '../types';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ strength }) => {
  const getStrengthText = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'very-weak': return 'Very Weak';
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      case 'very-strong': return 'Very Strong';
      default: return '';
    }
  };

  const getStrengthValue = (strength: PasswordStrength): number => {
    switch (strength) {
      case 'very-weak': return 1;
      case 'weak': return 2;
      case 'medium': return 3;
      case 'strong': return 4;
      case 'very-strong': return 5;
      default: return 0;
    }
  };

  const strengthValue = getStrengthValue(strength);
  
  return (
    <div className="w-full space-y-2 mt-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Password Strength</span>
        <span 
          className={cn(
            "text-xs font-medium",
            strength === 'very-weak' && "text-red-400",
            strength === 'weak' && "text-orange-400",
            strength === 'medium' && "text-yellow-400",
            strength === 'strong' && "text-green-400",
            strength === 'very-strong' && "text-emerald-400"
          )}
        >
          {getStrengthText(strength)}
        </span>
      </div>
      <div className="flex gap-1.5 h-1.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <div
            key={value}
            className={cn(
              "h-full flex-1 rounded-full transition-all duration-300",
              value <= strengthValue ? `strength-${strength}` : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
