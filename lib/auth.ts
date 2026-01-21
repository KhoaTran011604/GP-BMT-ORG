import { jwtVerify, SignJWT } from 'jose';
import bcrypt from 'bcrypt';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
  parishId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as UserPayload;
  } catch (error) {
    return null;
  }
}

export async function getTokenFromCookie(cookieString?: string): Promise<string | null> {
  if (!cookieString) return null;
  
  const cookies = cookieString.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth='));
  
  if (!authCookie) return null;
  
  return authCookie.split('=')[1];
}
