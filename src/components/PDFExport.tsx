import React, { useState } from 'react';
import { Credential, PDFOptions } from '../types';
import { downloadPDF } from '../utils/pdfGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { FileText, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface PDFExportProps {
  credentials: Credential[];
  className?: string;
}

const PDFExport: React.FC<PDFExportProps> = ({ credentials, className }) => {
  const [options, setOptions] = useState<PDFOptions>({
    title: 'BoltPass Credentials',
    password: '',
    includeNotes: true
  });
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({
      ...options,
      title: e.target.value
    });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({
      ...options,
      password: e.target.value
    });
  };
  
  const handleIncludeNotesChange = (checked: boolean) => {
    setOptions({
      ...options,
      includeNotes: checked
    });
  };
  
  const handleExport = () => {
    if (credentials.length === 0) {
      toast.error('No credentials to export');
      return;
    }
    
    try {
      downloadPDF(credentials, options);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };
  
  return (
    <motion.div 
      className={`glass-card p-6 rounded-xl w-full relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <GlowingEffect disabled={false} id="pdf-export" />
      <div className="flex items-center gap-2 mb-4">
        <FileText size={20} />
        <h2 className="text-xl font-semibold">Export to PDF</h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pdf-title">Document Title</Label>
          <Input
            id="pdf-title"
            value={options.title}
            onChange={handleTitleChange}
            placeholder="BoltPass Credentials"
            className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pdf-password" className="flex items-center gap-1">
            <Lock size={14} />
            PDF Password (Recommended)
          </Label>
          <Input
            id="pdf-password"
            type="password"
            value={options.password}
            onChange={handlePasswordChange}
            placeholder="Leave blank for no password"
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Add a password to encrypt your PDF document
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="include-notes" className="cursor-pointer">
            Include notes in PDF
          </Label>
          <Switch
            id="include-notes"
            checked={options.includeNotes}
            onCheckedChange={handleIncludeNotesChange}
          />
        </div>
        
        <Button 
          onClick={handleExport} 
          disabled={credentials.length === 0}
          className="w-full mt-2 gap-2"
        >
          <Save size={16} />
          Export Credentials
        </Button>
        
        {credentials.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Generate some credentials first
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PDFExport;
