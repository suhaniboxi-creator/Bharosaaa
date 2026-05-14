
export const generateHash = (input: string): string => {
  // Simple mock hash function for demo purposes
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0').substring(0, 48);
};

export const generateID = () => Math.random().toString(36).substring(2, 11);

// Frontend tokenization helpers (mirrors backend for offline mode)
export const maskAadhaar = (aadhaar: string): string => {
  const cleaned = aadhaar.replace(/\s|-/g, '');
  return `XXXX-XXXX-${cleaned.slice(-4)}`;
};

export const maskPassport = (passport: string): string => {
  const cleaned = passport.toUpperCase();
  return `${cleaned.substring(0, 2)}${'*'.repeat(Math.max(0, cleaned.length - 4))}${cleaned.slice(-2)}`;
};

export const formatAadhaar = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
};

export const validateAadhaar = (value: string): boolean => {
  const cleaned = value.replace(/\s|-/g, '');
  return /^\d{12}$/.test(cleaned);
};

export const validatePassportNumber = (value: string): boolean => {
  return /^[A-Z0-9]{6,12}$/i.test(value.replace(/\s/g, ''));
};
