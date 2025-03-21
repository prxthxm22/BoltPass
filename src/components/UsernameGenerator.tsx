import React, { useState } from 'react';
import { UsernameOptions, UsernameCategory } from '../types';
import { generateUsername } from '../utils/generators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface UsernameGeneratorProps {
  onGenerate: (username: string) => void;
  onAdd?: () => void;
  className?: string;
}

const UsernameGenerator: React.FC<UsernameGeneratorProps> = ({ 
  onGenerate,
  onAdd,
  className 
}) => {
  const [options, setOptions] = useState<UsernameOptions>({
    category: 'tech',
    length: 12,
    customWords: []
  });
  
  const [generatedUsername, setGeneratedUsername] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  
  const handleCategoryChange = (value: string) => {
    setOptions({
      ...options,
      category: value as UsernameCategory
    });
  };
  
  const handleLengthChange = (value: number[]) => {
    setOptions({
      ...options,
      length: value[0]
    });
  };
  
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomInput(e.target.value);
    
    // Parse custom words
    const words = e.target.value
      .split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0);
    
    setOptions({
      ...options,
      customWords: words
    });
  };
  
  const handleGenerate = () => {
    try {
      const username = generateUsername(options);
      setGeneratedUsername(username);
      onGenerate(username);
    } catch (error) {
      console.error('Error generating username:', error);
    }
  };
  
  const handleUse = () => {
    if (generatedUsername && onAdd) {
      onAdd();
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUsername);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div 
      className={`glass-card p-6 rounded-xl w-full relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlowingEffect disabled={false} id="username-generator" />
      <h2 className="text-xl font-semibold mb-4">Username Generator</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username-category">Category</Label>
          <Select 
            value={options.category} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="username-category" className="bg-muted">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech">Tech</SelectItem>
              <SelectItem value="nature">Nature</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {options.category === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="custom-words">
              Custom Words (comma separated)
            </Label>
            <Textarea
              id="custom-words"
              value={customInput}
              onChange={handleCustomInputChange}
              placeholder="digital, cyber, cloud, tech"
              className="bg-muted"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="username-length">Length</Label>
            <span className="text-sm text-muted-foreground">
              {options.length} characters
            </span>
          </div>
          <Slider
            id="username-length"
            min={6}
            max={20}
            step={1}
            value={[options.length]}
            onValueChange={handleLengthChange}
            className="my-4"
          />
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={handleGenerate} 
            className="w-full gap-2 font-medium"
          >
            <RefreshCw size={16} className="mr-1" />
            Generate Username
          </Button>
        </div>
        
        {generatedUsername && (
          <div className="mt-4 space-y-2 animate-fade-in">
            <Label htmlFor="generated-username">Generated Username</Label>
            <div className="flex gap-2">
              <Input
                id="generated-username"
                value={generatedUsername}
                readOnly
                className="bg-muted"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UsernameGenerator;
