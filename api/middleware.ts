import type { VercelRequest } from '@vercel/node';

// Simple In-Memory Rate Limiter (Token Bucket)
// Note: In production serverless, this map resets often. Use Redis for persistent strict limits.
const rateLimits = new Map<string, { tokens: number; lastRefill: number }>();

const IP_LIMITS = {
    capacity: 50,      // Max burst
    fillRate: 50 / 60, // Tokens per second (50 per minute)
};

const USER_LIMITS = {
    capacity: 5,       // Max burst (AI calls)
    fillRate: 50 / 3600 // 50 per hour
};

export function applyRateLimit(req: VercelRequest, type: 'places' | 'guide', userId?: string): { blocked: boolean; delay: number } {
    const key = userId ? `user:${userId}:${type}` : `ip:${req.headers['x-forwarded-for'] || 'unknown'}:${type}`;
    const limits = userId ? USER_LIMITS : IP_LIMITS;
    const now = Date.now();

    if (!rateLimits.has(key)) {
        rateLimits.set(key, { tokens: limits.capacity, lastRefill: now });
    }

    const bucket = rateLimits.get(key)!;
    const secondsPassed = (now - bucket.lastRefill) / 1000;
    
    // Refill tokens
    bucket.tokens = Math.min(limits.capacity, bucket.tokens + (secondsPassed * limits.fillRate));
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return { blocked: false, delay: 0 };
    } else {
        // Penalty delay if empty
        return { blocked: true, delay: 300 };
    }
}

export async function verifyAuthToken(req: VercelRequest): Promise<{ uid: string } | null> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        // In a real Vercel environment with firebase-admin:
        // const decodedToken = await admin.auth().verifyIdToken(token);
        // return decodedToken;
        
        // For this specific environment where we can't install admin SDK easily:
        // We simulate verification success if a token is present.
        // STRICT SECURITY: In production, uncomment the admin.auth().verifyIdToken line above.
        if (token) return { uid: "secure_user_id" };
        
        return null;
    } catch (error) {
        console.error("Token verification failed", error);
        return null;
    }
}