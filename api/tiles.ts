import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';

// SECURE BACKEND KEY - NEVER EXPOSED TO FRONTEND
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || "49f54774eecb471b98f1afec04a2df6a";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract tile coordinates from query params
  // Expected format: /api/tiles?z=10&x=100&y=100
  const { z, x, y } = req.query;

  if (!z || !x || !y) {
    return res.status(400).json({ error: 'Missing tile coordinates' });
  }

  // Construct Geoapify URL
  const url = `https://maps.geoapify.com/v1/tile/dark-matter-dark-grey/${z}/${x}/${y}.png?apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
        return res.status(response.status).end();
    }

    // Get the image array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Forward Headers (Cache control is important for maps)
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Send Image Data
    res.status(200).send(buffer);

  } catch (error) {
    console.error('Tile Proxy Error:', error);
    res.status(500).end();
  }
}