import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sparkles, Copy, Plus, Check, RefreshCw, Key, Shuffle } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { calculatePasswordStrength } from '../utils/generators';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { Credential } from '@/types';

interface PasswordGeneratorProps {
  onGenerate: (credential: Credential) => void;
  className?: string;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onGenerate, className }) => {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [strength, setStrength] = useState<number>(0);

  // Generate password on component mount and when config changes
  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar]);

  // Calculate password strength when password changes
  useEffect(() => {
    if (password) {
      const passwordStrength = calculatePasswordStrength(password);
      setStrength(passwordStrength);
    }
  }, [password]);

  const generatePassword = () => {
    // Ensure at least one character set is selected
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      setPassword('Select at least one character set');
      return;
    }

    // Define character sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    
    // Remove similar characters if excludeSimilar is checked
    const similarChars = 'Il1O0o';
    
    // Create a pool of characters based on selected options
    let charPool = '';
    if (includeUppercase) charPool += uppercaseChars;
    if (includeLowercase) charPool += lowercaseChars;
    if (includeNumbers) charPool += numberChars;
    if (includeSymbols) charPool += symbolChars;
    
    // Remove similar characters if option selected
    if (excludeSimilar) {
      for (const char of similarChars) {
        charPool = charPool.replace(new RegExp(char, 'g'), '');
      }
    }
    
    // Generate password
    let generatedPassword = '';
    
    // Ensure at least one character from each selected group
    if (includeUppercase) {
      const char = uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
      generatedPassword += excludeSimilar && similarChars.includes(char) ? 'A' : char;
    }
    
    if (includeLowercase) {
      const char = lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
      generatedPassword += excludeSimilar && similarChars.includes(char) ? 'a' : char;
    }
    
    if (includeNumbers) {
      const char = numberChars[Math.floor(Math.random() * numberChars.length)];
      generatedPassword += excludeSimilar && similarChars.includes(char) ? '2' : char;
    }
    
    if (includeSymbols) {
      generatedPassword += symbolChars[Math.floor(Math.random() * symbolChars.length)];
    }
    
    // Fill the rest of the password
    while (generatedPassword.length < length) {
      generatedPassword += charPool[Math.floor(Math.random() * charPool.length)];
    }
    
    // Shuffle the password characters
    generatedPassword = generatedPassword
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
    
    // Trim to desired length
    generatedPassword = generatedPassword.substring(0, length);
    
    setPassword(generatedPassword);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCredential = () => {
    if (!password) return;
    
    const newCredential: Credential = {
      id: Date.now().toString(),
      username: '',
      password,
      notes: '',
      createdAt: new Date()
    };
    
    onGenerate(newCredential);
  };

  return (
    <motion.div 
      className={`glass-card p-6 rounded-xl relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <GlowingEffect disabled={false} id="password-generator" />
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Password Generator</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between items-center">
            <Label htmlFor="password">Generated Password</Label>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={generatePassword}
                className="h-7 px-2"
              >
                <RefreshCw size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
                className="h-7 px-2"
                disabled={!password}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
          <div className="relative">
            <Input
              id="password"
              value={password}
              readOnly
              className="pr-20 font-mono bg-zinc-900/50"
            />
            <Button
              size="sm"
              onClick={handleAddCredential}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 gap-1"
              disabled={!password}
            >
              <Plus size={14} />
              Add
            </Button>
          </div>
          {password && (
            <PasswordStrengthMeter strength={strength} className="mt-2" />
          )}
        </div>
        
        <div>
          <Label htmlFor="length">Length ({length} characters)</Label>
          <Slider
            id="length"
            min={8}
            max={32}
            step={1}
            value={[length]}
            onValueChange={(values) => setLength(values[0])}
            className="mt-2"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Character Sets</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-uppercase"
                checked={includeUppercase}
                onCheckedChange={(checked) => setIncludeUppercase(!!checked)}
              />
              <Label 
                htmlFor="include-uppercase"
                className="text-sm cursor-pointer"
              >
                Uppercase (A-Z)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-lowercase"
                checked={includeLowercase}
                onCheckedChange={(checked) => setIncludeLowercase(!!checked)}
              />
              <Label 
                htmlFor="include-lowercase"
                className="text-sm cursor-pointer"
              >
                Lowercase (a-z)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-numbers"
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(!!checked)}
              />
              <Label 
                htmlFor="include-numbers"
                className="text-sm cursor-pointer"
              >
                Numbers (0-9)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-symbols"
                checked={includeSymbols}
                onCheckedChange={(checked) => setIncludeSymbols(!!checked)}
              />
              <Label 
                htmlFor="include-symbols"
                className="text-sm cursor-pointer"
              >
                Symbols (!@#$%...)
              </Label>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="exclude-similar"
            checked={excludeSimilar}
            onCheckedChange={(checked) => setExcludeSimilar(!!checked)}
          />
          <Label 
            htmlFor="exclude-similar"
            className="text-sm cursor-pointer"
          >
            Exclude similar characters (I, l, 1, O, 0, o)
          </Label>
        </div>
        
        <Button 
          onClick={generatePassword} 
          className="w-full gap-2"
        >
          <Shuffle size={16} />
          Generate New Password
        </Button>
      </div>
    </motion.div>
  );
};

export default PasswordGenerator;
