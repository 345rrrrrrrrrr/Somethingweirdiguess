
export async function sha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export function maskPassword(password: string): string {
  if (password.length <= 3) return password + '***';
  return password.slice(0, 3) + '*'.repeat(Math.min(password.length - 3, 8));
}

export async function checkPasswordBreach(password: string): Promise<number> {
  if (!password) return 0;
  
  const hash = await sha1(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) throw new Error('Failed to fetch from HIBP');
    
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return parseInt(count.trim(), 10);
      }
    }
    
    return 0;
  } catch (error) {
    console.error('HIBP Check Error:', error);
    throw error;
  }
}
