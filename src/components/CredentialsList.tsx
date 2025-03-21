import React, { useState } from 'react';
import { Credential } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Save, Eye, EyeOff, Plus, FileText } from 'lucide-react';
import { calculatePasswordStrength } from '../utils/generators';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface CredentialsListProps {
  credentials: Credential[];
  onAdd: (credential: Credential) => void;
  onUpdate: (credential: Credential) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  className?: string;
}

const CredentialsList: React.FC<CredentialsListProps> = ({
  credentials,
  onAdd,
  onUpdate,
  onDelete,
  onExport,
  className
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [editForm, setEditForm] = useState<Partial<Credential>>({});
  
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
  
  return (
    <motion.div 
      className={`glass-card p-6 rounded-xl w-full relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <GlowingEffect disabled={false} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Generated Credentials</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExport}
            className="gap-1"
            disabled={credentials.length === 0}
          >
            <FileText size={16} />
            Export
          </Button>
        </div>
      </div>
      
      {credentials.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No credentials yet. Generate some above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {credentials.map((credential) => (
              <motion.div
                key={credential.id}
                className="border border-border rounded-lg p-4 bg-muted/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                layout
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
                      <div className="relative">
                        <Input
                          id={`password-${credential.id}`}
                          name="password"
                          type={visiblePasswords.has(credential.id) ? 'text' : 'password'}
                          value={editForm.password || ''}
                          onChange={handleInputChange}
                          className="mt-1 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(credential.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {visiblePasswords.has(credential.id) ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      
                      {editForm.password && (
                        <div className="mt-2">
                          <PasswordStrengthMeter 
                            strength={calculatePasswordStrength(editForm.password)} 
                          />
                        </div>
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
                      >
                        <Save size={14} />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{credential.username}</h3>
                        <div className="flex items-center mt-1">
                          <Input
                            type={visiblePasswords.has(credential.id) ? 'text' : 'password'}
                            value={credential.password}
                            readOnly
                            className="h-7 py-0 border-none bg-transparent focus-visible:ring-0"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(credential.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {visiblePasswords.has(credential.id) ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(credential)}
                          className="h-8 w-8"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(credential.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    {credential.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {credential.notes}
                      </p>
                    )}
                    
                    <div className="mt-1 text-xs text-muted-foreground">
                      Created: {new Date(credential.createdAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default CredentialsList;
