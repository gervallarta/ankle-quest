import { useState } from 'react';
import { EXERCISES } from '../data/exercises';
import { theme } from '../theme';

export function ExerciseSelector({ session, onConfirm, onBack }) {
  const [selected, setSelected] = useState([]);

  const isMorning = session === 'morning';
  const accentColor = isMorning ? theme.colors.morning : theme.colors.afternoon;
  const accentDeep = isMorning ? theme.colors.morningDeep : theme.colors.afternoonDeep;

  function toggle(id) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  const canConfirm = selected.length === 3;

  return (
    <div style={{ animation: 'slideUp 0.4s ease forwards' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <div style={{
          fontFamily: theme.fonts.title,
          fontSize: '1.1rem',
          color: theme.colors.text,
          letterSpacing: '0.5px',
          marginBottom: '6px',
        }}>
          Elige tus tres ejercicios
        </div>
        <div style={{
          fontSize: '0.78rem',
          color: theme.colors.textMuted,
          fontWeight: 600,
        }}>
          Sesión de {isMorning ? 'mañana' : 'tarde'} · {selected.length} de 3
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '32px', height: '3px',
              borderRadius: theme.radii.full,
              background: i < selected.length ? accentColor : theme.colors.borderLight,
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {EXERCISES.map(ex => {
          const isSelected = selected.includes(ex.id);
          const isDisabled = !isSelected && selected.length >= 3;
          return (
            <ExerciseOption
              key={ex.id}
              exercise={ex}
              isSelected={isSelected}
              isDisabled={isDisabled}
              accentColor={accentColor}
              onToggle={() => !isDisabled && toggle(ex.id)}
            />
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '13px 18px',
            borderRadius: theme.radii.md,
            background: theme.colors.surfaceAlt,
            color: theme.colors.textMuted,
            fontWeight: 700,
            fontSize: '0.85rem',
            border: `1.5px solid ${theme.colors.borderLight}`,
          }}
          onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
          onMouseUp={e => e.currentTarget.style.opacity = '1'}
        >
          ← Volver
        </button>
        <button
          onClick={() => canConfirm && onConfirm(selected)}
          disabled={!canConfirm}
          style={{
            flex: 1,
            padding: '13px',
            borderRadius: theme.radii.md,
            background: canConfirm
              ? `linear-gradient(135deg, ${accentColor}, ${accentDeep})`
              : theme.colors.borderLight,
            color: canConfirm ? theme.colors.white : theme.colors.textLight,
            fontFamily: theme.fonts.body,
            fontWeight: 800,
            fontSize: '0.9rem',
            letterSpacing: '0.2px',
            boxShadow: canConfirm ? `0 4px 12px ${accentColor}35` : 'none',
            transition: 'all 0.3s',
          }}
          onMouseDown={e => canConfirm && (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {canConfirm ? 'Comenzar →' : `Selecciona ${3 - selected.length} más`}
        </button>
      </div>
    </div>
  );
}

function ExerciseOption({ exercise, isSelected, isDisabled, accentColor, onToggle }) {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '13px 14px',
          borderRadius: theme.radii.md,
          background: isSelected ? theme.colors.surfaceAlt : theme.colors.surface,
          border: `1.5px solid ${isSelected ? theme.colors.primary + '60' : theme.colors.borderLight}`,
          opacity: isDisabled ? 0.4 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: isSelected ? theme.shadows.glow : theme.shadows.card,
        }}
      >
        {/* Checkbox */}
        <div style={{
          width: '22px', height: '22px',
          borderRadius: '6px',
          border: `2px solid ${isSelected ? theme.colors.primary : theme.colors.borderLight}`,
          background: isSelected ? theme.colors.primary : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s',
        }}>
          {isSelected && (
            <span style={{ color: 'white', fontSize: '11px', fontWeight: 900, lineHeight: 1 }}>✓</span>
          )}
        </div>

        {/* Emoji */}
        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{exercise.emoji}</span>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 800,
            fontSize: '0.88rem',
            color: theme.colors.text,
            marginBottom: '2px',
          }}>
            {exercise.name}
          </div>
          <div style={{
            fontSize: '0.72rem',
            color: theme.colors.textMuted,
            fontWeight: 600,
          }}>
            {exercise.equipment}
          </div>
        </div>

        {/* Demo toggle */}
        <button
          onClick={e => { e.stopPropagation(); setShowDemo(v => !v); }}
          style={{
            padding: '5px 10px',
            borderRadius: theme.radii.sm,
            background: showDemo ? `${theme.colors.primary}15` : theme.colors.surfaceAlt,
            color: theme.colors.primary,
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.3px',
            flexShrink: 0,
            border: `1px solid ${theme.colors.primary}30`,
          }}
        >
          {showDemo ? 'Cerrar' : 'Ver'}
        </button>
      </div>

      {showDemo && <DemoPanel exercise={exercise} />}
    </div>
  );
}

function DemoPanel({ exercise }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{
      margin: '2px 0 0',
      padding: '16px',
      background: theme.colors.surfaceAlt,
      borderRadius: `0 0 ${theme.radii.md} ${theme.radii.md}`,
      border: `1.5px solid ${theme.colors.borderLight}`,
      borderTop: 'none',
      animation: 'fadeIn 0.2s ease forwards',
    }}>
      {/* Photo or illustration */}
      {!imgError ? (
        <img
          src={exercise.image}
          alt={exercise.name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            maxHeight: '220px',
            objectFit: 'cover',
            borderRadius: theme.radii.md,
            marginBottom: '12px',
          }}
        />
      ) : (
        <ExerciseIllustration exerciseId={exercise.id} />
      )}

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
        {exercise.steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: '20px', height: '20px',
              borderRadius: '50%',
              background: theme.colors.primary,
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              marginTop: '1px',
            }}>{i + 1}</div>
            <div style={{
              fontSize: '0.8rem',
              color: theme.colors.text,
              fontWeight: 600,
              lineHeight: 1.5,
            }}>{step}</div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div style={{
        padding: '10px 12px',
        background: `${theme.colors.primary}08`,
        borderRadius: theme.radii.sm,
        borderLeft: `2px solid ${theme.colors.primary}50`,
        fontSize: '0.77rem',
        fontWeight: 700,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
      }}>
        {exercise.instructions}
      </div>
    </div>
  );
}

function ExerciseIllustration({ exerciseId }) {
  const color = theme.colors.primary;
  const gold = theme.colors.gold;

  const illustrations = {
    1: (
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '130px' }}>
        <rect width="200" height="140" fill={`${color}08`} rx="10" />
        <line x1="20" y1="120" x2="180" y2="120" stroke={theme.colors.borderLight} strokeWidth="1.5" strokeDasharray="5,4" />
        <rect x="28" y="104" width="28" height="16" rx="5" fill={theme.colors.roseMid} opacity="0.6" />
        <rect x="144" y="104" width="28" height="16" rx="5" fill={theme.colors.roseMid} opacity="0.6" />
        <circle cx="100" cy="38" r="12" fill={color} />
        <line x1="100" y1="50" x2="100" y2="90" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="62" x2="58" y2="96" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="55" cy="98" r="4" fill={gold} />
        <line x1="100" y1="62" x2="132" y2="70" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="100" y1="90" x2="100" y2="120" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="90" x2="116" y2="108" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <text x="100" y="136" textAnchor="middle" fontSize="9" fill={theme.colors.textMuted} fontFamily="Nunito, sans-serif" fontWeight="700">Equilibrio · toca los cojines</text>
      </svg>
    ),
    2: (
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '130px' }}>
        <rect width="200" height="140" fill={`${color}08`} rx="10" />
        <rect x="63" y="90" width="74" height="7" rx="3.5" fill={theme.colors.borderLight} />
        <rect x="68" y="97" width="7" height="26" rx="3.5" fill={theme.colors.borderLight} />
        <rect x="125" y="97" width="7" height="26" rx="3.5" fill={theme.colors.borderLight} />
        <circle cx="100" cy="44" r="12" fill={color} />
        <rect x="83" y="57" width="34" height="34" rx="9" fill={color} />
        <line x1="88" y1="91" x2="60" y2="122" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="112" y1="91" x2="140" y2="122" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <path d="M 65 112 Q 100 103 135 112" stroke={theme.colors.afternoonLight.replace('DBEAFE','4FC3F7')} strokeWidth="4" fill="none" strokeLinecap="round" />
        <text x="38" y="118" fontSize="16" fill={color} opacity="0.8">←</text>
        <text x="150" y="118" fontSize="16" fill={color} opacity="0.8">→</text>
        <text x="100" y="136" textAnchor="middle" fontSize="9" fill={theme.colors.textMuted} fontFamily="Nunito, sans-serif" fontWeight="700">Abducción con liga</text>
      </svg>
    ),
    3: (
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '130px' }}>
        <rect width="200" height="140" fill={`${color}08`} rx="10" />
        <rect x="63" y="90" width="74" height="7" rx="3.5" fill={theme.colors.borderLight} />
        <rect x="68" y="97" width="7" height="26" rx="3.5" fill={theme.colors.borderLight} />
        <rect x="125" y="97" width="7" height="26" rx="3.5" fill={theme.colors.borderLight} />
        <circle cx="100" cy="44" r="12" fill={color} />
        <rect x="83" y="57" width="34" height="34" rx="9" fill={color} />
        <line x1="89" y1="91" x2="84" y2="122" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="111" y1="91" x2="116" y2="122" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="100" cy="110" rx="14" ry="9" fill={theme.colors.morning} opacity="0.75" />
        <text x="59" y="116" fontSize="15" fill={color} opacity="0.8">→</text>
        <text x="132" y="116" fontSize="15" fill={color} opacity="0.8">←</text>
        <text x="100" y="136" textAnchor="middle" fontSize="9" fill={theme.colors.textMuted} fontFamily="Nunito, sans-serif" fontWeight="700">Squeeze con almohada</text>
      </svg>
    ),
    4: (
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '130px' }}>
        <rect width="200" height="140" fill={`${color}08`} rx="10" />
        <rect x="18" y="8" width="7" height="125" rx="3.5" fill={theme.colors.borderLight} />
        <line x1="18" y1="131" x2="182" y2="131" stroke={theme.colors.borderLight} strokeWidth="2" />
        <circle cx="94" cy="46" r="12" fill={color} />
        <rect x="22" y="58" width="28" height="44" rx="7" fill={color} />
        <line x1="50" y1="80" x2="102" y2="80" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="82" y1="80" x2="82" y2="131" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="102" y1="80" x2="102" y2="131" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <path d="M 79 75 Q 92 69 105 75" stroke="#60A5FA" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx="155" cy="58" r="22" fill="white" stroke={gold} strokeWidth="2" />
        <text x="155" y="53" textAnchor="middle" fontSize="10" fill={theme.colors.text} fontFamily="Cinzel, serif" fontWeight="600">30</text>
        <text x="155" y="66" textAnchor="middle" fontSize="8" fill={theme.colors.textMuted} fontFamily="Nunito, sans-serif">seg</text>
        <text x="100" y="136" textAnchor="middle" fontSize="9" fill={theme.colors.textMuted} fontFamily="Nunito, sans-serif" fontWeight="700">Wall sit · 30 segundos</text>
      </svg>
    ),
    5: (
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '130px' }}>
        <rect width="200" height="140" fill={`${color}08`} rx="10" />
        <line x1="20" y1="112" x2="180" y2="112" stroke={theme.colors.borderLight} strokeWidth="1.5" strokeDasharray="5,4" />
        <circle cx="52" cy="90" r="12" fill={color} />
        <line x1="62" y1="93" x2="152" y2="104" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <line x1="147" y1="104" x2="174" y2="109" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="147" y1="104" x2="168" y2="78" stroke={color} strokeWidth="6" strokeLinecap="round" opacity="0.9" />
        <line x1="62" y1="93" x2="36" y2="105" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
        <text x="170" y="76" fontSize="14" fill={gold}>↑</text>
        <text x="100" y="130" textAnchor="middle" fontSize="9" fill={theme.colors.textMuted} fontFamily="Nunito, sans-serif" fontWeight="700">Elevación lateral · ambos lados</text>
      </svg>
    ),
  };

  return (
    <div style={{ width: '100%', marginBottom: '12px', borderRadius: theme.radii.md, overflow: 'hidden' }}>
      {illustrations[exerciseId]}
    </div>
  );
}
