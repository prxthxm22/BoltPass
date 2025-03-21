import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sparkles, Copy, Plus, Check, RefreshCw, User } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Credential } from '@/types';

interface UsernameGeneratorProps {
  onGenerate: (credential: Credential) => void;
  className?: string;
}

const CATEGORIES = [
  { id: 'animals', label: 'Animals', words: ['wolf', 'tiger', 'eagle', 'dolphin', 'bear', 'lion', 'fox', 'hawk', 'shark', 'panda'] },
  { id: 'nature', label: 'Nature', words: ['ocean', 'mountain', 'forest', 'river', 'storm', 'sunset', 'thunder', 'volcano', 'glacier', 'canyon'] },
  { id: 'tech', label: 'Tech', words: ['pixel', 'cyber', 'digital', 'quantum', 'binary', 'vector', 'neural', 'crypto', 'nano', 'tech'] },
  { id: 'fantasy', label: 'Fantasy', words: ['wizard', 'dragon', 'shadow', 'mystic', 'phoenix', 'frost', 'crystal', 'arcane', 'ember', 'fae'] },
];

const UsernameGenerator: React.FC<UsernameGeneratorProps> = ({ onGenerate, className }) => {
  const [username, setUsername] = useState<string>('');
  const [customWords, setCustomWords] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['animals', 'tech']);
  const [length, setLength] = useState<number>(12);
  const [copied, setCopied] = useState<boolean>(false);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);

  // Generate username on component mount and when config changes
  useEffect(() => {
    generateUsername();
  }, [selectedCategories, length, includeNumbers]);

  const generateUsername = () => {
    // Get all words from selected categories
    const allWords: string[] = [];
    
    selectedCategories.forEach(catId => {
      const category = CATEGORIES.find(c => c.id === catId);
      if (category) {
        allWords.push(...category.words);
      }
    });
    
    // Add custom words if any
    if (customWords.trim()) {
      allWords.push(...customWords.split(',').map(word => word.trim()).filter(Boolean));
    }
    
    if (allWords.length === 0) {
      setUsername('Please select categories');
      return;
    }
    
    // Generate username from random words
    const randomWord = () => allWords[Math.floor(Math.random() * allWords.length)];
    let generatedName = randomWord() + randomWord();
    
    // Add random numbers if enabled
    if (includeNumbers) {
      generatedName += Math.floor(Math.random() * 1000);
    }
    
    // Truncate or pad to match desired length
    if (generatedName.length > length) {
      generatedName = generatedName.substring(0, length);
    } else if (generatedName.length < length && includeNumbers) {
      // Pad with numbers if needed
      while (generatedName.length < length) {
        generatedName += Math.floor(Math.random() * 10);
      }
    }
    
    setUsername(generatedName);
    setCopied(false);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCredential = () => {
    if (!username) return;
    
    const newCredential: Credential = {
      id: Date.now().toString(),
      username,
      password: '',
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
      transition={{ duration: 0.5 }}
    >
      <GlowingEffect disabled={false} id="username-generator" />
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Username Generator</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between items-center">
            <Label htmlFor="username">Generated Username</Label>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={generateUsername}
                className="h-7 px-2"
              >
                <RefreshCw size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
                className="h-7 px-2"
                disabled={!username}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
          <div className="relative">
            <Input
              id="username"
              value={username}
              readOnly
              className="pr-20 bg-zinc-900/50"
            />
            <Button
              size="sm"
              onClick={handleAddCredential}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 gap-1"
              disabled={!username}
            >
              <Plus size={14} />
              Add
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="length">Length ({length} characters)</Label>
          <Slider
            id="length"
            min={6}
            max={20}
            step={1}
            value={[length]}
            onValueChange={(values) => setLength(values[0])}
            className="mt-2"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-numbers"
            checked={includeNumbers}
            onCheckedChange={(checked) => setIncludeNumbers(!!checked)}
          />
          <Label htmlFor="include-numbers" className="text-sm cursor-pointer">
            Include numbers
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                />
                <Label 
                  htmlFor={`category-${category.id}`}
                  className="text-sm cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label htmlFor="custom-words">Custom Words (comma separated)</Label>
          <Input
            id="custom-words"
            value={customWords}
            onChange={(e) => setCustomWords(e.target.value)}
            placeholder="e.g. ninja, hero, legend"
            className="mt-1 bg-zinc-900/50"
          />
        </div>
        
        <Button 
          onClick={generateUsername} 
          className="w-full gap-2"
        >
          <Sparkles size={16} />
          Generate New Username
        </Button>
      </div>
    </motion.div>
  );
};

export default UsernameGenerator;
