import { jwtVerify, JWTPayload } from 'jose';

// Define the shape of the data stored inside your JWT token
export interface AuthUserPayload extends JWTPayload {
  id: string;
  email: string;
  role?: string; // Optional: If you track roles like 'admin' or 'user'
}

/**
 * Validates a JWT string token safely on Next.js Edge Middleware runtime.
 */
export async function verifyAuthToken(token: string | undefined): Promise<AuthUserPayload | null> {
  if (!token) return null;
  
  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error("Missing JWT_SECRET environment variable.");
      return null;
    }

    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, secret);
    
    // Typecast the generic JWTPayload to your strict AuthUserPayload interface
    return payload as AuthUserPayload;
  } catch (error) {
    // Gracefully handle expired, structural, or invalid signatures without crashing
    return null; 
  }
}
