
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
