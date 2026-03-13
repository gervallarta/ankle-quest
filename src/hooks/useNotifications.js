import { useState, useEffect, useRef, useCallback } from 'react';

function msUntilHour(hour) {
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
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

    // 12:00 pm — morning reminder
    const msToNoon = msUntilHour(12);
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

    // 8:00 pm — afternoon reminder
    const msToEvening = msUntilHour(20);
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
