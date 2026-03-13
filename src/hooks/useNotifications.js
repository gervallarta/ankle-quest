import { useState, useEffect, useRef, useCallback } from 'react';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// Fallback: muestra notificación local cuando la app está abierta
function showLocal(swReg, title, body, tag) {
  if (swReg) {
    swReg.showNotification(title, { body, tag, icon: '/favicon.svg', renotify: false });
  } else if (Notification.permission === 'granted') {
    new Notification(title, { body, tag, icon: '/favicon.svg' });
  }
}

function msUntilTime(hour, minute = 0) {
  const t = new Date();
  t.setHours(hour, minute, 0, 0);
  return t.getTime() - Date.now();
}

export function useNotifications(morning, afternoon) {
  const [permission, setPermission] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const swRegRef = useRef(null);
  const morningRef = useRef(morning);
  const afternoonRef = useRef(afternoon);

  useEffect(() => { morningRef.current = morning; }, [morning]);
  useEffect(() => { afternoonRef.current = afternoon; }, [afternoon]);

  // Registrar SW al montar
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js')
      .then(reg => { swRegRef.current = reg; })
      .catch(() => {});
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== 'granted') return;

    // Suscribir a Web Push para notificaciones cuando la app esté cerrada
    if (VAPID_PUBLIC_KEY) {
      try {
        const reg = swRegRef.current ?? await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        const sub = existing ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        });
      } catch (e) {
        console.warn('Push subscription error:', e);
      }
    }
  }, []);

  // Fallback con setTimeout — funciona cuando la app está abierta en pantalla o en background
  useEffect(() => {
    if (permission !== 'granted') return;

    const timers = [];
    const reg = swRegRef.current;

    // 🔔 TEST — 2:25 pm (eliminar después de verificar)
    const msToTest = msUntilTime(14, 25);
    if (msToTest > 0) {
      timers.push(setTimeout(() => {
        showLocal(reg, 'Ankle Quest — Prueba ✨', '¡Las notificaciones funcionan cuando la app está abierta! 🎉', 'test-reminder');
      }, msToTest));
    }

    // 12:00 pm
    const msToNoon = msUntilTime(12, 0);
    if (msToNoon > 0) {
      timers.push(setTimeout(() => {
        if (!morningRef.current.completed) {
          showLocal(reg, 'Ankle Quest ✨', '¡Son las 12! ¿Ya hiciste tu sesión de mañana? 💪', 'morning-reminder');
        }
      }, msToNoon));
    }

    // 8:00 pm
    const msToEvening = msUntilTime(20, 0);
    if (msToEvening > 0) {
      timers.push(setTimeout(() => {
        if (!afternoonRef.current.completed) {
          showLocal(reg, 'Ankle Quest ✨', '¡Son las 8! Cierra el día con tu sesión de tarde 🌙', 'afternoon-reminder');
        }
      }, msToEvening));
    }

    return () => timers.forEach(clearTimeout);
  }, [permission]);

  return { permission, requestPermission };
}
