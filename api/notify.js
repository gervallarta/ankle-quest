// GET /api/notify?session=morning|afternoon
// Llamado por GitHub Actions. Envía push solo si la sesión no fue completada.
import webpush from 'web-push';
import { kv } from '@vercel/kv';

const MESSAGES = {
  morning: {
    title: 'Ankle Quest ✨',
    body: '¡Son las 12! ¿Ya hiciste tu sesión de mañana? Tu tobillo te espera 💪',
    tag: 'morning-reminder',
  },
  afternoon: {
    title: 'Ankle Quest ✨',
    body: '¡Son las 8 de la noche! Aún puedes hacer tu sesión de tarde 🌙',
    tag: 'afternoon-reminder',
  },
};

export default async function handler(req, res) {
  // Auth — solo GitHub Actions puede llamar esto
  if (req.headers['x-notify-secret'] !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { session } = req.query;
  if (!session || !MESSAGES[session]) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  // Fecha de hoy en CST (UTC-6) — México City permanente desde 2023
  const nowCST = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const todayCST = nowCST.toISOString().split('T')[0];

  try {
    // ¿Ya completó la sesión hoy?
    const done = await kv.get(`done_${session}_${todayCST}`);
    if (done) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'already done' });
    }

    // Lee suscripción guardada
    const subJson = await kv.get('push_subscription');
    if (!subJson) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    webpush.setVapidDetails(
      'mailto:gervallarta@gmail.com',
      process.env.VITE_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    // @vercel/kv auto-parsea JSON al leer, subJson ya es un objeto
    const subscription = typeof subJson === 'string' ? JSON.parse(subJson) : subJson;
    const payload = JSON.stringify(MESSAGES[session]);

    await webpush.sendNotification(subscription, payload);
    res.status(200).json({ ok: true, sent: true });
  } catch (err) {
    console.error('notify error:', err);
    res.status(500).json({ error: err.message });
  }
}
