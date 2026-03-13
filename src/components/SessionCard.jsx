import { theme } from '../theme';

export function SessionCard({ session, data, onStart }) {
  const isMorning = session === 'morning';
  const color = isMorning ? theme.colors.morning : theme.colors.afternoon;
  const colorDeep = isMorning ? theme.colors.morningDeep : theme.colors.afternoonDeep;
  const bg = isMorning ? theme.colors.morningLight : theme.colors.afternoonLight;
  const icon = isMorning ? '☀' : '☽';
  const label = isMorning ? 'Mañana' : 'Tarde';
  const subLabel = isMorning ? 'Comienza el día con intención' : 'Cierra el día con fortaleza';

  const { completed, selected } = data;
  const hasSelected = selected.length === 3;

  return (
    <div style={{
      background: completed ? theme.colors.successLight : theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: '18px 20px',
      border: `1.5px solid ${completed ? theme.colors.success + '60' : theme.colors.borderLight}`,
      boxShadow: theme.shadows.card,
      animation: 'slideUp 0.4s ease forwards',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        {/* Icon circle */}
        <div style={{
          width: '42px', height: '42px',
          borderRadius: '50%',
          background: completed
            ? `${theme.colors.success}18`
            : `${color}15`,
          border: `1.5px solid ${completed ? theme.colors.success + '40' : color + '40'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
          color: completed ? theme.colors.success : color,
          flexShrink: 0,
          fontFamily: theme.fonts.body,
        }}>
          {completed ? '✓' : icon}
        </div>

        <div>
          <div style={{
            fontFamily: theme.fonts.title,
            fontSize: '0.95rem',
            color: completed ? theme.colors.successDeep : theme.colors.text,
            letterSpacing: '0.5px',
            marginBottom: '2px',
          }}>
            Sesión de {label}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: theme.colors.textMuted,
            fontWeight: 600,
          }}>
            {completed ? 'Completada' : subLabel}
          </div>
        </div>
      </div>

      {completed ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: `${theme.colors.success}18`,
          borderRadius: theme.radii.md,
          padding: '10px',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: theme.colors.successDeep,
        }}>
          <span>✦</span> Misión cumplida <span>✦</span>
        </div>
      ) : (
        <button
          onClick={onStart}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: theme.radii.md,
            background: `linear-gradient(135deg, ${color}, ${colorDeep})`,
            color: theme.colors.white,
            fontFamily: theme.fonts.body,
            fontWeight: 800,
            fontSize: '0.88rem',
            letterSpacing: '0.3px',
            boxShadow: `0 4px 12px ${color}35`,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {hasSelected ? 'Continuar sesión →' : 'Elegir ejercicios →'}
        </button>
      )}
    </div>
  );
}
