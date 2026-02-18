
export function getBaseUrl(): string {
  // Browser environment - use current window origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

 
// Vercel environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

// Next.js Preview environment
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Custom production URL
  if (process.env.NEXT_PUBLIC_TRADE_URL) {
    return process.env.NEXT_PUBLIC_TRADE_URL;
  }

  // Fallback to localhost for local development
  return 'http://localhost:3000';
}


export function getTradeUrl(): string {
  // For production domain, always use the stable production URL
  if (process.env.NEXT_PUBLIC_TRADE_URL && process.env.VERCEL_ENV === 'production') {
    return process.env.NEXT_PUBLIC_TRADE_URL;
  }
  return getBaseUrl();
}


export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
