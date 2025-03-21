import { 
  UsernameOptions, 
  PasswordOptions, 
  PasswordStrength, 
  UsernameCategory 
} from '../types';

// Word lists for username generation
const WORD_LISTS: Record<Exclude<UsernameCategory, 'custom'>, string[]> = {
  tech: [
    'digital', 'cyber', 'pixel', 'tech', 'data', 'code', 'binary', 'cloud',
    'quantum', 'vector', 'neural', 'crypto', 'nano', 'web', 'net', 'byte',
    'server', 'router', 'laser', 'matrix', 'circuit', 'robot', 'algorithm',
    'virtual', 'software', 'hardware', 'wireless', 'hacker', 'program', 'system'
  ],
  nature: [
    'river', 'mountain', 'forest', 'ocean', 'sky', 'leaf', 'flower', 'tree',
    'wolf', 'eagle', 'tiger', 'dolphin', 'bear', 'hawk', 'falcon', 'lion',
    'coral', 'jade', 'amber', 'crystal', 'breeze', 'stone', 'waterfall',
    'sunset', 'dawn', 'thunder', 'moon', 'star', 'desert', 'glacier'
  ],
  food: [
    'honey', 'sugar', 'spice', 'pepper', 'cinnamon', 'apple', 'cherry', 'lemon',
    'berry', 'mint', 'olive', 'truffle', 'herb', 'lime', 'melon', 'vanilla',
    'coffee', 'cocoa', 'butter', 'cream', 'cookie', 'pasta', 'bread', 'cheese',
    'mango', 'peach', 'bacon', 'steak', 'salad', 'soup'
  ]
};

// Random word selection from appropriate list
export const generateUsername = (options: UsernameOptions): string => {
  const { category, length, customWords } = options;
  
  // Use custom words if provided and category is custom
  let wordList;
  if (category === 'custom' && customWords?.length) {
    wordList = customWords;
  } else if (category === 'random') {
    // For random category, combine all word lists
    wordList = [
      ...WORD_LISTS.tech,
      ...WORD_LISTS.nature,
      ...WORD_LISTS.food
    ];
  } else {
    wordList = WORD_LISTS[category as Exclude<UsernameCategory, 'custom' | 'random'>];
  }
  
  if (!wordList || wordList.length === 0) {
    throw new Error('Word list is empty or undefined');
  }
  
  let username = '';
  
  // Add two random words together
  const firstWord = wordList[Math.floor(Math.random() * wordList.length)];
  let secondWord = wordList[Math.floor(Math.random() * wordList.length)];
  
  // Ensure words are different
  while (secondWord === firstWord) {
    secondWord = wordList[Math.floor(Math.random() * wordList.length)];
  }
  
  // Capitalize first letters
  username = firstWord.charAt(0).toUpperCase() + firstWord.slice(1) + 
            secondWord.charAt(0).toUpperCase() + secondWord.slice(1);
  
  // Add random numbers if username is too short
  if (username.length < length) {
    const numDigits = length - username.length;
    for (let i = 0; i < numDigits; i++) {
      username += Math.floor(Math.random() * 10);
    }
  }
  
  // Truncate if too long
  if (username.length > length) {
    username = username.substring(0, length);
  }
  
  return username;
};

// Character sets for password generation
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export const generatePassword = (options: PasswordOptions): string => {
  const { 
    length, 
    includeLowercase, 
    includeUppercase, 
    includeNumbers, 
    includeSymbols 
  } = options;
  
  let chars = '';
  
  if (includeLowercase) chars += LOWERCASE;
  if (includeUppercase) chars += UPPERCASE;
  if (includeNumbers) chars += NUMBERS;
  if (includeSymbols) chars += SYMBOLS;
  
  // If no character sets are selected, return empty string
  if (chars === '') return '';
  
  let password = '';
  
  // Generate random password
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  
  // Ensure at least one character from each selected type is included
  let validPassword = password;
  
  if (includeLowercase && !/[a-z]/.test(password)) {
    const randomChar = LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)];
    const randomPos = Math.floor(Math.random() * length);
    validPassword = 
      validPassword.substring(0, randomPos) + 
      randomChar + 
      validPassword.substring(randomPos + 1);
  }
  
  if (includeUppercase && !/[A-Z]/.test(password)) {
    const randomChar = UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)];
    const randomPos = Math.floor(Math.random() * length);
    validPassword = 
      validPassword.substring(0, randomPos) + 
      randomChar + 
      validPassword.substring(randomPos + 1);
  }
  
  if (includeNumbers && !/[0-9]/.test(password)) {
    const randomChar = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    const randomPos = Math.floor(Math.random() * length);
    validPassword = 
      validPassword.substring(0, randomPos) + 
      randomChar + 
      validPassword.substring(randomPos + 1);
  }
  
  if (includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>\/?]/.test(password)) {
    const randomChar = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const randomPos = Math.floor(Math.random() * length);
    validPassword = 
      validPassword.substring(0, randomPos) + 
      randomChar + 
      validPassword.substring(randomPos + 1);
  }
  
  return validPassword;
};

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return 'very-weak';
  
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  
  const typesCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  
  if (length < 8) {
    return 'very-weak';
  } else if (length < 10) {
    return typesCount <= 2 ? 'weak' : 'medium';
  } else if (length < 12) {
    return typesCount <= 2 ? 'medium' : 'strong';
  } else {
    return typesCount <= 2 ? 'strong' : 'very-strong';
  }
};
