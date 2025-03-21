import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import UsernameGenerator from '@/components/UsernameGenerator';
import PasswordGenerator from '@/components/PasswordGenerator';
import CredentialsList from '@/components/CredentialsList';
import PDFExport from '@/components/PDFExport';
import { Credential } from '@/types';
import { secureStore, secureRetrieve, secureFlush } from '@/utils/secureStorage';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Layout } from '@/components/Layout';

const Index = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true);
  
  // Load credentials from storage
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        setIsLoadingCredentials(true);
        const savedCredentials = secureRetrieve();
        setCredentials(savedCredentials);
      } catch (error) {
        console.error('Error loading credentials:', error);
        // Handle error (could show error toast here)
      } finally {
        setIsLoadingCredentials(false);
      }
    };
    
    loadCredentials();
  }, []);
  
  // Save credentials to storage whenever they change
  useEffect(() => {
    // Skip saving during initial loading
    if (isLoadingCredentials) return;
    
    // Save to secure storage
    secureStore(credentials);
    
    // Flush storage on unmount
    return () => {
      secureFlush().catch(console.error);
    };
  }, [credentials, isLoadingCredentials]);
  
  // Add a new credential
  const handleAddCredential = (credential: Credential) => {
    setCredentials(prev => [...prev, credential]);
  };
  
  // Update an existing credential
  const handleUpdateCredential = (updatedCredential: Credential) => {
    setCredentials(prev => 
      prev.map(cred => 
        cred.id === updatedCredential.id ? updatedCredential : cred
      )
    );
  };
  
  // Delete a credential
  const handleDeleteCredential = (id: string) => {
    setCredentials(prev => prev.filter(cred => cred.id !== id));
  };
  
  // Export credentials to PDF
  const handleExportToPDF = () => {
    // Force flush any pending changes before export
    secureFlush().then(() => {
      document.dispatchEvent(new CustomEvent('pdf-export-trigger'));
    }).catch(console.error);
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <motion.div 
            className="inline-block relative mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <RainbowButton className="px-6 py-2 text-lg font-bold">
              <Zap size={18} className="mr-2" />
              Secure Password Management
            </RainbowButton>
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold mb-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            BoltPass
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Generate strong credentials, securely store and manage your passwords with client-side encryption.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <UsernameGenerator onGenerate={handleAddCredential} />
          <PasswordGenerator onGenerate={handleAddCredential} />
          <CredentialsList 
            credentials={credentials}
            onAdd={handleAddCredential}
            onUpdate={handleUpdateCredential} 
            onDelete={handleDeleteCredential}
            onExport={handleExportToPDF}
            isLoading={isLoadingCredentials}
            className="md:col-span-2"
          />
          <PDFExport 
            credentials={credentials}
            isLoading={isLoadingCredentials}
            className="md:col-span-2"
          />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
