import { useEffect, useRef } from 'react';
import { theme } from '../theme';

const CONFETTI_COLORS = [
  theme.colors.primary,
  theme.colors.primaryLight,
  theme.colors.gold,
  theme.colors.goldLight,
  theme.colors.rose,
  theme.colors.success,
  theme.colors.afternoon,
];

const MESSAGES = [
  '¡Lo lograste! ✦',
  'Misión cumplida ✦',
  '¡Imparable! ✦',
  'Cada repetición cuenta ✦',
];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export function CompletionScreen({ session, bothDone, onDismiss }) {
  const canvasRef = useRef(null);
  const isMorning = session === 'morning';
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const pieces = Array.from({ length: 60 }, () => ({
      x: randomBetween(0, canvas.width),
      y: randomBetween(-50, -10),
      r: randomBetween(4, 9),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      vy: randomBetween(1.5, 3.5),
      vx: randomBetween(-1, 1),
      rotation: randomBetween(0, 360),
      rotSpeed: randomBetween(-3, 3),
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) p.y = -20;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      position: 'relative',
      background: `linear-gradient(160deg, ${theme.colors.primaryDeep}10, ${theme.colors.midnight}08)`,
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      padding: '40px 24px',
      textAlign: 'center',
      border: `1.5px solid ${theme.colors.primary}30`,
      boxShadow: theme.shadows.card,
      animation: 'slideUp 0.5s ease forwards',
    }}>
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.colors.gold}25, ${theme.colors.goldLight}35)`,
          border: `2px solid ${theme.colors.gold}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: isMorning ? '1.6rem' : '1.4rem',
          animation: 'glowPulse 2.5s ease infinite',
        }}>
          {isMorning ? '☀' : '☽'}
        </div>

        {/* Sparkles */}
        <div style={{
          fontSize: '0.9rem',
          marginBottom: '14px',
          letterSpacing: '12px',
          color: theme.colors.gold,
        }}>
          ✦ ✦ ✦
        </div>

        <div style={{
          fontFamily: theme.fonts.title,
          fontSize: '1.5rem',
          color: theme.colors.text,
          letterSpacing: '0.5px',
          marginBottom: '8px',
        }}>
          {msg}
        </div>

        <div style={{
          fontSize: '0.8rem',
          color: theme.colors.textMuted,
          fontWeight: 600,
          marginBottom: '8px',
          letterSpacing: '0.3px',
        }}>
          Sesión de {isMorning ? 'mañana' : 'tarde'} completada
        </div>

        {bothDone && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: `linear-gradient(135deg, ${theme.colors.gold}20, ${theme.colors.goldLight}25)`,
            borderRadius: theme.radii.full,
            padding: '7px 20px',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: theme.colors.goldDeep,
            marginTop: '8px',
            marginBottom: '8px',
            border: `1px solid ${theme.colors.gold}40`,
          }}>
            <span>🔥</span>
            <span>Día completo — racha en marcha</span>
          </div>
        )}

        <div style={{ height: '18px' }} />

        {/* Motivational bubble */}
        <div style={{
          background: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: '16px 18px',
          marginBottom: '22px',
          boxShadow: theme.shadows.card,
          border: `1px solid ${theme.colors.borderLight}`,
          textAlign: 'left',
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: theme.colors.primary,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '6px',
          }}>
            ✦ Recuerda
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: theme.colors.text,
            fontWeight: 600,
            lineHeight: 1.65,
          }}>
            Cada ejercicio que haces es un paso más hacia recuperarte. Tu constancia es lo que hace la diferencia.
          </div>
        </div>

        <button
          onClick={onDismiss}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: theme.radii.md,
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDeep})`,
            color: theme.colors.white,
            fontFamily: theme.fonts.body,
            fontWeight: 800,
            fontSize: '0.9rem',
            letterSpacing: '0.3px',
            boxShadow: theme.shadows.button,
            transition: 'transform 0.15s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Volver al inicio →
        </button>
      </div>
    </div>
  );
}
