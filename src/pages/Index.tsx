import React, { useState, useEffect } from 'react';
import { Credential } from '../types';
import Header from '../components/Header';
import UsernameGenerator from '../components/UsernameGenerator';
import PasswordGenerator from '../components/PasswordGenerator';
import CredentialsList from '../components/CredentialsList';
import PDFExport from '../components/PDFExport';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock } from 'lucide-react';
import { toast } from "sonner";
import { downloadPDF } from '../utils/pdfGenerator';
import { GlowEffectButton } from '@/components/ui/glow-effect-button';

const Index = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [activeUsername, setActiveUsername] = useState<string>('');
  const [activePassword, setActivePassword] = useState<string>('');
  
  // Load credentials from localStorage on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('boldPassCredentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setCredentials(parsed);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
      }
    }
  }, []);
  
  // Save credentials to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('boldPassCredentials', JSON.stringify(credentials));
  }, [credentials]);
  
  const handleUsernameGenerate = (username: string) => {
    setActiveUsername(username);
    toast.success('Username generated!');
  };
  
  const handlePasswordGenerate = (password: string) => {
    setActivePassword(password);
    toast.success('Password generated!');
  };
  
  // Add a new function to handle the +Add button click from either generator
  const handleAddFromGenerator = (source: 'username' | 'password') => {
    if (source === 'username' && activeUsername) {
      const newCredential: Credential = {
        id: Date.now().toString(),
        username: activeUsername,
        password: activePassword || '',
        notes: '',
        createdAt: new Date()
      };
      setCredentials([newCredential, ...credentials]);
      toast.success('Username added to credentials');
    } else if (source === 'password' && activePassword) {
      if (!activeUsername) {
        toast.error('Please generate a username first');
        return;
      }
      
      const newCredential: Credential = {
        id: Date.now().toString(),
        username: activeUsername,
        password: activePassword,
        notes: '',
        createdAt: new Date()
      };
      setCredentials([newCredential, ...credentials]);
      toast.success('Credentials added successfully');
    }
  };
  
  const handleAddCredential = (credential: Credential) => {
    // If this is a new credential being added via button
    if (!credential.username && !credential.password) {
      // Use the active username and password if available
      credential.username = activeUsername || '';
      credential.password = activePassword || '';
    }
    
    setCredentials([credential, ...credentials]);
  };
  
  const handleUpdateCredential = (updatedCredential: Credential) => {
    const updated = credentials.map(cred => 
      cred.id === updatedCredential.id ? updatedCredential : cred
    );
    setCredentials(updated);
    toast.success('Credential updated');
  };
  
  const handleDeleteCredential = (id: string) => {
    setCredentials(credentials.filter(cred => cred.id !== id));
    toast.success('Credential deleted');
  };
  
  const handleExportPDF = () => {
    if (credentials.length === 0) {
      toast.error('No credentials to export');
      return;
    }
    
    downloadPDF(credentials, {
      title: 'BoltPass Credentials',
      includeNotes: true
    });
    
    toast.success('PDF exported successfully');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-zinc-900">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <GlowEffectButton 
              rightIcon={null}
              colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']}
              mode="colorShift"
              blur="medium"
              scale={1.05}
              buttonClassName="bg-white/5 border border-white/10 px-4 py-2"
            >
              <Zap size={14} className="mr-1.5" />
              Secure Password Management
            </GlowEffectButton>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Generate Secure Credentials
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Create strong usernames and passwords for your accounts. 
            Export to PDF for secure offline storage.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <UsernameGenerator 
            onGenerate={handleUsernameGenerate} 
            onAdd={() => handleAddFromGenerator('username')}
          />
          <PasswordGenerator 
            onGenerate={handlePasswordGenerate} 
            onAdd={() => handleAddFromGenerator('password')}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CredentialsList
              credentials={credentials}
              onAdd={handleAddCredential}
              onUpdate={handleUpdateCredential}
              onDelete={handleDeleteCredential}
              onExport={handleExportPDF}
            />
          </div>
          <div>
            <PDFExport credentials={credentials} />
          </div>
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 border border-white/10 text-muted-foreground mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your Security Matters</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            All credentials are stored locally in your browser. 
            We never transmit your data over the internet.
          </p>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
