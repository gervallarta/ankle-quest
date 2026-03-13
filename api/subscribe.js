// POST /api/subscribe — guarda la suscripción push en Vercel KV
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const subscription = req.body;
    if (!subscription?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });

    await kv.set('push_subscription', JSON.stringify(subscription));
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('subscribe error:', err);
    res.status(500).json({ error: 'KV unavailable' });
  }
}
