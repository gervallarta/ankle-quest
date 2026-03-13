import { theme } from '../theme';

// Subtle decorative sparkles — small, elegant, not childish
const SPARKLES = [
  { char: '✦', size: 10, top: 18, left: 6, delay: 0 },
  { char: '✧', size: 7,  top: 55, left: 12, delay: 0.8 },
  { char: '✦', size: 8,  top: 30, left: 88, delay: 0.4 },
  { char: '✧', size: 6,  top: 65, left: 92, delay: 1.2 },
  { char: '✦', size: 9,  top: 14, left: 50, delay: 0.6 },
];

export function Header({ streak }) {
  return (
    <header style={{
      background: `linear-gradient(160deg, ${theme.colors.primaryDeep} 0%, ${theme.colors.midnight} 60%, #0D0B2E 100%)`,
      padding: '24px 20px 30px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '0 0 28px 28px',
      boxShadow: '0 6px 32px rgba(30, 27, 75, 0.45)',
    }}>
      {/* Subtle top border shimmer */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        backgroundImage: `linear-gradient(90deg, transparent, ${theme.colors.roseMid}, ${theme.colors.gold}, ${theme.colors.roseMid}, transparent)`,
        backgroundSize: '200% auto',
        animation: 'goldShimmer 3s ease infinite',
      }} />

      {/* Sparkle decorations */}
      {SPARKLES.map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          color: i === 1 || i === 3 ? theme.colors.roseMid : theme.colors.goldLight,
          fontSize: `${s.size}px`,
          top: `${s.top}%`,
          left: `${s.left}%`,
          animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
          pointerEvents: 'none',
        }}>{s.char}</span>
      ))}

      {/* Title */}
      <div style={{
        fontFamily: theme.fonts.display,
        fontSize: '1.7rem',
        color: theme.colors.goldLight,
        letterSpacing: '3px',
        marginBottom: '4px',
        textShadow: `0 2px 12px rgba(201,168,76,0.5)`,
        lineHeight: 1.2,
      }}>
        Ankle Quest
      </div>

      <div style={{
        fontSize: '0.72rem',
        color: 'rgba(240,208,128,0.6)',
        fontFamily: theme.fonts.body,
        fontWeight: 600,
        letterSpacing: '2.5px',
        textTransform: 'uppercase',
        marginBottom: '18px',
      }}>
        Tu misión de recuperación
      </div>

      {/* Streak badge */}
      <StreakBadge count={streak.count} />
    </header>
  );
}

function StreakBadge({ count }) {
  const isOnFire = count >= 3;
  const isEmpty = count === 0;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      background: 'rgba(240,208,128,0.12)',
      borderRadius: theme.radii.full,
      padding: '9px 22px',
      border: `1px solid rgba(201,168,76,0.35)`,
      animation: isOnFire ? 'glowPulse 2.5s ease infinite' : 'none',
    }}>
      <span style={{ fontSize: '1.1rem' }}>
        {isEmpty ? '✦' : isOnFire ? '🔥' : '✦'}
      </span>
      <div style={{ textAlign: 'left' }}>
        <div style={{
          fontFamily: theme.fonts.title,
          fontSize: '1.1rem',
          color: theme.colors.goldLight,
          lineHeight: 1,
          letterSpacing: '1px',
        }}>
          {count} {count === 1 ? 'día' : 'días'}
        </div>
        <div style={{
          fontSize: '0.62rem',
          color: 'rgba(240,208,128,0.6)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {isEmpty ? 'Empieza hoy' : isOnFire ? 'En racha' : 'de racha'}
        </div>
      </div>
    </div>
  );
}
