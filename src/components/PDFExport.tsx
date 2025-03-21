import React, { useState } from 'react';
import { Credential, PDFOptions } from '../types';
import { downloadPDF } from '../utils/pdfGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { FileText, Lock, Save, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PDFExportProps {
  credentials: Credential[];
  isLoading?: boolean;
  className?: string;
}

const PDFExport: React.FC<PDFExportProps> = ({ 
  credentials, 
  isLoading = false,
  className 
}) => {
  const [password, setPassword] = useState<string>('');
  const [includePasswords, setIncludePasswords] = useState<boolean>(true);
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      
      if (password && password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsExporting(false);
        return;
      }
      
      await downloadPDF(credentials, {
        includePasswords,
        includeNotes,
        password: password.length > 0 ? password : undefined
      });
      
      setIsExporting(false);
    } catch (err) {
      console.error('PDF Export error:', err);
      setError('Failed to generate PDF. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      className={`glass-card p-6 rounded-xl relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <GlowingEffect disabled={false} id="pdf-export" />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Export to PDF</h2>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-9 w-32 mt-2" />
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="bg-red-950/50 border-red-900 text-red-300 mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-password" className="flex items-center gap-1">
                  <Lock size={14} />
                  Password protect PDF (optional)
                </Label>
                <Input
                  id="pdf-password"
                  type="password"
                  placeholder="Enter a password for the PDF"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error && e.target.value.length >= 6) setError(null);
                  }}
                  className="bg-zinc-900/50"
                />
                {password && password.length < 6 && (
                  <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    Password must be at least 6 characters
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {password ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <Shield size={12} />
                      Your PDF will be password protected
                    </span>
                  ) : (
                    'Leave empty for no password protection'
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-passwords" 
                    checked={includePasswords} 
                    onCheckedChange={(checked) => 
                      setIncludePasswords(checked as boolean)
                    } 
                  />
                  <Label 
                    htmlFor="include-passwords"
                    className="text-sm cursor-pointer"
                  >
                    Include passwords in export
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-notes" 
                    checked={includeNotes} 
                    onCheckedChange={(checked) => 
                      setIncludeNotes(checked as boolean)
                    } 
                  />
                  <Label 
                    htmlFor="include-notes"
                    className="text-sm cursor-pointer"
                  >
                    Include notes in export
                  </Label>
                </div>
              </div>
              
              <Button 
                onClick={handleExport} 
                disabled={isExporting || credentials.length === 0 || (password.length > 0 && password.length < 6)}
                className="w-full mt-2 gap-2"
              >
                {isExporting ? 'Generating...' : 'Generate PDF'}
                <FileText size={16} />
              </Button>
              
              {credentials.length === 0 && (
                <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} />
                  Generate some credentials first
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PDFExport;
