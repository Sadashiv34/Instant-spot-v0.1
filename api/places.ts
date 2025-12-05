import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyRateLimit } from './middleware';

// SECURE BACKEND KEY - NEVER EXPOSED TO FRONTEND
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || "49f54774eecb471b98f1afec04a2df6a";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Rate Limiting (IP-based)
  const rateLimitResult = applyRateLimit(req, 'places');
  if (rateLimitResult.blocked) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  // 2. Validate Method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 3. Extract Query Params
  const { lat, lon, radius = '30000', categories, limit = '30' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing latitude or longitude' });
  }

  // 4. Construct Backend-to-API Call
  // Filter: circle:lon,lat,radiusMeters
  const filter = `circle:${lon},${lat},${radius}`;
  // Default categories if not provided
  const cats = categories || 'tourism,entertainment,leisure,natural,building.historic';
  
  const url = `https://api.geoapify.com/v2/places?categories=${cats}&filter=${filter}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    // 5. Call Geoapify (Server-to-Server)
    if (rateLimitResult.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, rateLimitResult.delay));
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
        console.error(`Geoapify API Error: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ error: 'Failed to fetch places' });
    }

    const data = await response.json();

    // 6. Return Safe JSON
    res.status(200).json(data);

  } catch (error) {
    console.error('Backend Places Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}