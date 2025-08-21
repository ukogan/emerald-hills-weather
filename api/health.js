// Vercel serverless function for health check
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.json({
    success: true,
    service: 'Emerald Hills Weather API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
}