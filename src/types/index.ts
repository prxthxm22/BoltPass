export type UsernameCategory = 'tech' | 'nature' | 'food' | 'custom' | 'random';

export interface UsernameOptions {
  category: UsernameCategory;
  length: number;
  customWords?: string[];
}

export interface PasswordOptions {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export interface Credential {
  id: string;
  username: string;
  password: string;
  notes: string;
  createdAt: Date;
}

export interface PDFOptions {
  title: string;
  password?: string;
  includeNotes: boolean;
}

export type PasswordStrength = 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
