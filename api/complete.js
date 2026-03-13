// POST /api/complete?session=morning|afternoon&date=YYYY-MM-DD
// Marca que la sesión fue completada hoy — el notifier la salta si ya está hecha
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { session, date } = req.query;
  if (!session || !date) return res.status(400).json({ error: 'Missing params' });

  try {
    // TTL de 2 días para que se limpie solo
    await kv.set(`done_${session}_${date}`, '1', { ex: 60 * 60 * 48 });
    res.status(200).json({ ok: true });
  } catch {
    // No bloquear la app si KV falla
    res.status(200).json({ ok: true, skipped: true });
  }
}
