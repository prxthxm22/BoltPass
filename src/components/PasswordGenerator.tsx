import React, { useState, useEffect } from 'react';
import { PasswordOptions, PasswordStrength } from '../types';
import { generatePassword, calculatePasswordStrength } from '../utils/generators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { toast } from 'sonner';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface PasswordGeneratorProps {
  onGenerate: (password: string) => void;
  onAdd?: () => void;
  className?: string;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onGenerate,
  onAdd,
  className
}) => {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true
  });
  
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('very-weak');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  useEffect(() => {
    if (generatedPassword) {
      setPasswordStrength(calculatePasswordStrength(generatedPassword));
    }
  }, [generatedPassword]);
  
  const handleLengthChange = (value: number[]) => {
    setOptions({
      ...options,
      length: value[0]
    });
  };
  
  const handleOptionChange = (option: keyof Omit<PasswordOptions, 'length'>) => {
    setOptions({
      ...options,
      [option]: !options[option as keyof Omit<PasswordOptions, 'length'>]
    });
  };
  
  const handleGenerate = () => {
    // Check if at least one option is selected
    if (!options.includeLowercase && !options.includeUppercase && 
        !options.includeNumbers && !options.includeSymbols) {
      toast.error('Please select at least one character type');
      return;
    }
    
    const password = generatePassword(options);
    setGeneratedPassword(password);
    onGenerate(password);
  };
  
  const handleToggleVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleUse = () => {
    if (generatedPassword && onAdd) {
      onAdd();
    }
  };
  
  return (
    <motion.div 
      className={`glass-card p-6 rounded-xl w-full relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <GlowingEffect disabled={false} id="password-generator" />
      <h2 className="text-xl font-semibold mb-4">Password Generator</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password-length">Length</Label>
            <span className="text-sm text-muted-foreground">
              {options.length} characters
            </span>
          </div>
          <Slider
            id="password-length"
            min={5}
            max={32}
            step={1}
            value={[options.length]}
            onValueChange={handleLengthChange}
            className="my-4"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-lowercase" className="cursor-pointer">
              Include Lowercase (a-z)
            </Label>
            <Switch
              id="include-lowercase"
              checked={options.includeLowercase}
              onCheckedChange={() => handleOptionChange('includeLowercase')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-uppercase" className="cursor-pointer">
              Include Uppercase (A-Z)
            </Label>
            <Switch
              id="include-uppercase"
              checked={options.includeUppercase}
              onCheckedChange={() => handleOptionChange('includeUppercase')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-numbers" className="cursor-pointer">
              Include Numbers (0-9)
            </Label>
            <Switch
              id="include-numbers"
              checked={options.includeNumbers}
              onCheckedChange={() => handleOptionChange('includeNumbers')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-symbols" className="cursor-pointer">
              Include Symbols (!@#$...)
            </Label>
            <Switch
              id="include-symbols"
              checked={options.includeSymbols}
              onCheckedChange={() => handleOptionChange('includeSymbols')}
            />
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={handleGenerate} 
            className="w-full gap-2 font-medium"
          >
            <RefreshCw size={16} className="mr-1" />
            Generate Password
          </Button>
        </div>
        
        {generatedPassword && (
          <div className="mt-4 space-y-2 animate-fade-in">
            <Label htmlFor="generated-password">Generated Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="generated-password"
                  type={showPassword ? 'text' : 'password'}
                  value={generatedPassword}
                  readOnly
                  className="bg-muted pr-10"
                />
                <button
                  type="button"
                  onClick={handleToggleVisibility}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
              <Button 
                variant="default" 
                onClick={handleUse}
              >
                + Add
              </Button>
            </div>
            
            <PasswordStrengthMeter strength={passwordStrength} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PasswordGenerator;
