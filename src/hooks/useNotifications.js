import { useState, useEffect, useRef, useCallback } from 'react';

// Uses device local time (CST/CDT Mexico City when device is in that zone)
function msUntilTime(hour, minute = 0) {
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  return target.getTime() - Date.now();
}

function showNotification(title, body, tag) {
  if (Notification.permission !== 'granted') return;
  try {
    // Prefer service worker notification (works in background)
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'NOTIFY', title, body, tag });
    } else {
      new Notification(title, { body, tag, icon: '/favicon.svg', renotify: false });
    }
  } catch {
    // fallback silently
  }
}

export function useNotifications(morning, afternoon) {
  const [permission, setPermission] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Keep refs current so setTimeout callback reads latest completed state
  const morningRef = useRef(morning);
  const afternoonRef = useRef(afternoon);
  useEffect(() => { morningRef.current = morning; }, [morning]);
  useEffect(() => { afternoonRef.current = afternoon; }, [afternoon]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  // Schedule reminders whenever permission is granted
  useEffect(() => {
    if (permission !== 'granted') return;

    const timers = [];

    // 🔔 TEST — 2:25 pm (eliminar después de verificar)
    const msToTest = msUntilTime(14, 25);
    if (msToTest > 0) {
      timers.push(setTimeout(() => {
        showNotification(
          'Ankle Quest — Prueba ✨',
          '¡Las notificaciones funcionan! Llegarán a las 12 pm y 8 pm 🎉',
          'test-reminder'
        );
      }, msToTest));
    }

    // 12:00 pm — sesión de mañana
    const msToNoon = msUntilTime(12, 0);
    if (msToNoon > 0) {
      timers.push(setTimeout(() => {
        if (!morningRef.current.completed) {
          showNotification(
            'Ankle Quest ✨',
            '¡Son las 12! Aún no has hecho tu sesión de mañana 💪',
            'morning-reminder'
          );
        }
      }, msToNoon));
    }

    // 8:00 pm — sesión de tarde
    const msToEvening = msUntilTime(20, 0);
    if (msToEvening > 0) {
      timers.push(setTimeout(() => {
        if (!afternoonRef.current.completed) {
          showNotification(
            'Ankle Quest ✨',
            '¡Son las 8! Cierra el día con tu sesión de tarde 🌙',
            'afternoon-reminder'
          );
        }
      }, msToEvening));
    }

    return () => timers.forEach(clearTimeout);
  }, [permission]);

  return { permission, requestPermission };
}
