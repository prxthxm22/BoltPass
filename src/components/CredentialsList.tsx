import React, { useState, useEffect, useCallback } from 'react';
import { Credential } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Save, Eye, EyeOff, Plus, FileText, AlertTriangle } from 'lucide-react';
import { calculatePasswordStrength } from '../utils/generators';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Skeleton } from '@/components/ui/skeleton';

interface CredentialsListProps {
  credentials: Credential[];
  onAdd: (credential: Credential) => void;
  onUpdate: (credential: Credential) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  isLoading?: boolean;
  className?: string;
}

const CredentialsList: React.FC<CredentialsListProps> = ({
  credentials,
  onAdd,
  onUpdate,
  onDelete,
  onExport,
  isLoading = false,
  className
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [editForm, setEditForm] = useState<Partial<Credential>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const filteredCredentials = useCallback(() => {
    if (!searchTerm.trim()) return credentials;
    
    const term = searchTerm.toLowerCase();
    return credentials.filter(cred => 
      cred.username.toLowerCase().includes(term) || 
      cred.notes.toLowerCase().includes(term)
    );
  }, [credentials, searchTerm]);
  
  const handleAddNew = () => {
    const newCredential: Credential = {
      id: Date.now().toString(),
      username: '',
      password: '',
      notes: '',
      createdAt: new Date()
    };
    
    onAdd(newCredential);
    setEditingId(newCredential.id);
    setEditForm(newCredential);
  };
  
  const handleEdit = (credential: Credential) => {
    setEditingId(credential.id);
    setEditForm({ ...credential });
  };
  
  const handleSave = () => {
    if (editingId && editForm.username && editForm.password) {
      const updatedCredential: Credential = {
        id: editingId,
        username: editForm.username,
        password: editForm.password,
        notes: editForm.notes || '',
        createdAt: new Date()
      };
      
      onUpdate(updatedCredential);
      setEditingId(null);
      setEditForm({});
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };
  
  const handleDelete = (id: string) => {
    onDelete(id);
  };
  
  const togglePasswordVisibility = (id: string) => {
    const updatedVisible = new Set(visiblePasswords);
    if (updatedVisible.has(id)) {
      updatedVisible.delete(id);
    } else {
      updatedVisible.add(id);
    }
    setVisiblePasswords(updatedVisible);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Render loading skeletons when loading
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <div key={`skeleton-${i}`} className="border border-white/10 rounded-lg p-4 mb-4">
        <div className="flex justify-between mb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ));
  };
  
  const displayedCredentials = filteredCredentials();
  
  return (
    <motion.div 
      className={`glass-card p-6 rounded-xl w-full relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <GlowingEffect disabled={false} id="credentials-list" />
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Generated Credentials</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              className="gap-1"
              disabled={isLoading || credentials.length === 0}
            >
              <FileText size={16} />
              Export
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Input 
            placeholder="Search credentials..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-900/50"
            disabled={isLoading}
          />
          {searchTerm && displayedCredentials.length === 0 && !isLoading && (
            <div className="mt-2 text-yellow-400 text-sm flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>No credentials found matching "{searchTerm}"</span>
            </div>
          )}
        </div>
      </div>
      
      {isLoading ? (
        renderSkeletons()
      ) : displayedCredentials.length === 0 && !searchTerm ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No credentials yet. Generate some above!</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddNew}
            className="mt-4 gap-1"
          >
            <Plus size={16} />
            Add Manually
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            <AnimatePresence>
              {displayedCredentials.map((credential) => (
                <motion.div
                  key={credential.id}
                  className="border border-white/10 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                >
                  {editingId === credential.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`username-${credential.id}`}>Username</Label>
                        <Input
                          id={`username-${credential.id}`}
                          name="username"
                          value={editForm.username || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`password-${credential.id}`}>Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id={`password-${credential.id}`}
                            name="password"
                            type={visiblePasswords.has(credential.id) ? "text" : "password"}
                            value={editForm.password || ''}
                            onChange={handleInputChange}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(credential.id)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          >
                            {visiblePasswords.has(credential.id) ? (
                              <EyeOff size={16} className="text-muted-foreground" />
                            ) : (
                              <Eye size={16} className="text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        
                        {editForm.password && (
                          <PasswordStrengthMeter 
                            strength={calculatePasswordStrength(editForm.password)} 
                            className="mt-2"
                          />
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor={`notes-${credential.id}`}>Notes</Label>
                        <Textarea
                          id={`notes-${credential.id}`}
                          name="notes"
                          value={editForm.notes || ''}
                          onChange={handleInputChange}
                          placeholder="Add notes about this credential"
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={handleSave}
                          className="gap-1"
                          disabled={!editForm.username || !editForm.password}
                        >
                          <Save size={14} />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{credential.username}</h3>
                          <div className="relative mt-1 flex items-center">
                            <span className={`${visiblePasswords.has(credential.id) ? '' : 'filter blur-sm select-none'} font-mono text-sm`}>
                              {credential.password}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(credential.id)}
                              className="ml-2 text-muted-foreground hover:text-white transition-colors"
                            >
                              {visiblePasswords.has(credential.id) ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(credential)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit size={14} />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(credential.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      
                      {credential.notes && (
                        <p className="text-sm text-muted-foreground mt-2 border-t border-white/5 pt-2">
                          {credential.notes}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <PasswordStrengthMeter 
                          strength={calculatePasswordStrength(credential.password)} 
                          className="w-24"
                        />
                        <span>
                          {new Date(credential.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {!searchTerm && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline" 
                size="sm"
                onClick={handleAddNew}
                className="gap-1"
              >
                <Plus size={14} />
                Add Credential
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default CredentialsList;
