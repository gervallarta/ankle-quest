import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { useNotifications } from './hooks/useNotifications';
import { Header } from './components/Header';
import { SessionCard } from './components/SessionCard';
import { ExerciseSelector } from './components/ExerciseSelector';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { CompletionScreen } from './components/CompletionScreen';
import { EXERCISES } from './data/exercises';
import { theme } from './theme';

export default function App() {
  const {
    streak,
    history,
    morning,
    afternoon,
    bothDone,
    selectExercises,
    completeSession,
    resetSession,
  } = useAppState();

  const { permission, requestPermission } = useNotifications(morning, afternoon);

  const [view, setView] = useState('home');
  const [activeSession, setActiveSession] = useState(null);

  const sessionData = activeSession === 'morning' ? morning : afternoon;

  function handleStartSession(session) {
    setActiveSession(session);
    const data = session === 'morning' ? morning : afternoon;
    if (data.selected.length === 3) {
      setView('playing');
    } else {
      setView('selecting');
    }
  }

  function handleExercisesSelected(ids) {
    selectExercises(activeSession, ids);
    setView('playing');
  }

  function handleWorkoutComplete() {
    completeSession(activeSession, sessionData.selected);
    // Avisar al servidor para que no mande push si ya hizo la sesión
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    fetch(`/api/complete?session=${activeSession}&date=${today}`).catch(() => {});
    setView('completed');
  }

  function handleDismissCompletion() {
    setView('home');
    setActiveSession(null);
  }

  function handleBackToHome() {
    setView('home');
    setActiveSession(null);
  }

  function handleBackToSelector() {
    resetSession(activeSession);
    setView('selecting');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header streak={streak} />

      <main style={{
        flex: 1,
        padding: '20px 16px 32px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}>
        {view === 'home' && (
          <HomeView
            morning={morning}
            afternoon={afternoon}
            bothDone={bothDone}
            streak={streak}
            history={history}
            onStart={handleStartSession}
            onViewHistory={() => setView('history')}
            notifPermission={permission}
            onEnableNotifs={requestPermission}
          />
        )}

        {view === 'history' && (
          <HistoryView
            history={history}
            onBack={() => setView('home')}
          />
        )}

        {view === 'selecting' && (
          <ExerciseSelector
            session={activeSession}
            onConfirm={handleExercisesSelected}
            onBack={handleBackToHome}
          />
        )}

        {view === 'playing' && (
          <WorkoutPlayer
            session={activeSession}
            selectedIds={sessionData.selected}
            onComplete={handleWorkoutComplete}
            onBack={handleBackToSelector}
          />
        )}

        {view === 'completed' && (
          <CompletionScreen
            session={activeSession}
            bothDone={bothDone}
            onDismiss={handleDismissCompletion}
          />
        )}
      </main>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function HomeView({ morning, afternoon, bothDone, streak, history, onStart, onViewHistory, notifPermission, onEnableNotifs }) {
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const greeting = bothDone
    ? 'Día completo — extraordinario'
    : morning.completed
      ? 'Mañana lista — ¿y la tarde?'
      : afternoon.completed
        ? 'Tarde lista — ¿y la mañana?'
        : 'Tu misión de hoy te espera';

  const hasHistory = Object.values(history || {}).some(day =>
    normalizeSession(day.morning) || normalizeSession(day.afternoon)
  );

  return (
    <div style={{ animation: 'slideUp 0.4s ease forwards' }}>
      {/* Date & greeting */}
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <div style={{
          fontSize: '0.72rem',
          color: theme.colors.textLight,
          fontWeight: 700,
          textTransform: 'capitalize',
          letterSpacing: '0.8px',
          marginBottom: '6px',
        }}>
          {today}
        </div>
        <div style={{
          fontFamily: theme.fonts.title,
          fontSize: '1.1rem',
          color: theme.colors.text,
          letterSpacing: '0.3px',
        }}>
          {greeting}
        </div>
      </div>

      {/* Both done celebration */}
      {bothDone && (
        <div style={{
          background: `linear-gradient(135deg, ${theme.colors.gold}15, ${theme.colors.goldLight}10)`,
          borderRadius: theme.radii.lg,
          padding: '16px 20px',
          textAlign: 'center',
          border: `1.5px solid ${theme.colors.gold}40`,
          marginBottom: '20px',
          animation: 'glowPulse 2.5s ease infinite',
        }}>
          <div style={{ fontSize: '1.1rem', color: theme.colors.gold, marginBottom: '4px' }}>✦ ✦ ✦</div>
          <div style={{
            fontFamily: theme.fonts.title,
            fontSize: '0.95rem',
            color: theme.colors.goldDeep,
            letterSpacing: '0.3px',
          }}>
            Día completo · Racha: {streak.count} {streak.count === 1 ? 'día' : 'días'}
          </div>
        </div>
      )}

      {/* Session cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
        <SessionCard session="morning" data={morning} onStart={() => onStart('morning')} />
        <SessionCard session="afternoon" data={afternoon} onStart={() => onStart('afternoon')} />
      </div>

      {/* Info section */}
      <InfoSection />

      {/* Activar recordatorios — solo si no se ha dado permiso aún */}
      {notifPermission === 'default' && (
        <button
          onClick={onEnableNotifs}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '11px',
            borderRadius: theme.radii.md,
            background: 'transparent',
            border: `1px solid ${theme.colors.borderLight}`,
            color: theme.colors.textMuted,
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'opacity 0.15s',
            cursor: 'pointer',
          }}
          onMouseDown={e => e.currentTarget.style.opacity = '0.55'}
          onMouseUp={e => e.currentTarget.style.opacity = '1'}
          onTouchStart={e => e.currentTarget.style.opacity = '0.55'}
          onTouchEnd={e => e.currentTarget.style.opacity = '1'}
        >
          🔔 Activar recordatorios
        </button>
      )}

      {/* Ver historial — subtle link-style button, only when data exists */}
      {hasHistory && (
        <button
          onClick={onViewHistory}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '11px',
            borderRadius: theme.radii.md,
            background: 'transparent',
            border: `1px solid ${theme.colors.borderLight}`,
            color: theme.colors.textMuted,
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: '0.3px',
            transition: 'opacity 0.15s',
          }}
          onMouseDown={e => e.currentTarget.style.opacity = '0.55'}
          onMouseUp={e => e.currentTarget.style.opacity = '1'}
          onTouchStart={e => e.currentTarget.style.opacity = '0.55'}
          onTouchEnd={e => e.currentTarget.style.opacity = '1'}
        >
          Ver historial →
        </button>
      )}

      {/* Recordatorios activos — indicador sutil debajo de historial */}
      {notifPermission === 'granted' && (
        <div style={{
          marginTop: '10px',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: theme.colors.textLight,
          fontWeight: 600,
          letterSpacing: '0.2px',
        }}>
          🔔 Recordatorios activos · 12 pm y 8 pm
        </div>
      )}
    </div>
  );
}

// ─── History view ─────────────────────────────────────────────────────────────

function HistoryView({ history, onBack }) {
  // Build exercise totals by counting IDs across all sessions
  const counts = {};
  Object.values(history || {}).forEach(day => {
    [normalizeSession(day.morning), normalizeSession(day.afternoon)].forEach(session => {
      if (!session) return;
      (session.exercises || []).forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
  });

  const totals = EXERCISES
    .filter(ex => counts[ex.id] > 0)
    .map(ex => ({ ...ex, count: counts[ex.id] }))
    .sort((a, b) => b.count - a.count);

  const maxCount = totals.length > 0 ? totals[0].count : 1;

  // Build per-day entries
  const entries = Object.entries(history || {})
    .map(([date, day]) => ({
      date,
      morning: normalizeSession(day.morning),
      afternoon: normalizeSession(day.afternoon),
    }))
    .filter(e => e.morning || e.afternoon)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalSessions = entries.reduce(
    (acc, e) => acc + (e.morning ? 1 : 0) + (e.afternoon ? 1 : 0), 0
  );

  return (
    <div style={{ animation: 'slideUp 0.4s ease forwards' }}>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 14px',
            borderRadius: theme.radii.full,
            background: theme.colors.bgDeep,
            color: theme.colors.textMuted,
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: '0.82rem',
            flexShrink: 0,
          }}
          onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
          onMouseUp={e => e.currentTarget.style.opacity = '1'}
          onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
          onTouchEnd={e => e.currentTarget.style.opacity = '1'}
        >
          ← Volver
        </button>
        <div>
          <div style={{
            fontFamily: theme.fonts.title,
            fontSize: '1.05rem',
            color: theme.colors.text,
            letterSpacing: '0.3px',
            lineHeight: 1.2,
          }}>
            Historial
          </div>
          <div style={{
            fontSize: '0.68rem',
            color: theme.colors.textLight,
            fontWeight: 600,
            marginTop: '2px',
          }}>
            {totalSessions} {totalSessions === 1 ? 'sesión completada' : 'sesiones completadas'} · para tu fisioterapeuta
          </div>
        </div>
      </div>

      {/* ── Ejercicios practicados ── */}
      {totals.length > 0 && (
        <div style={{
          background: theme.colors.surface,
          borderRadius: theme.radii.lg,
          padding: '18px 20px',
          border: `1px solid ${theme.colors.borderLight}`,
          boxShadow: theme.shadows.card,
          marginBottom: '22px',
        }}>
          <div style={{
            fontFamily: theme.fonts.title,
            fontSize: '0.82rem',
            color: theme.colors.primary,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Ejercicios practicados
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {totals.map(ex => (
              <div key={ex.id}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{ex.emoji}</span>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: theme.colors.text,
                    flex: 1,
                    lineHeight: 1.3,
                  }}>
                    {ex.name}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: theme.colors.primary,
                    flexShrink: 0,
                    minWidth: '46px',
                    textAlign: 'right',
                  }}>
                    {ex.count} {ex.count === 1 ? 'vez' : 'veces'}
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: theme.colors.bgDeep,
                  borderRadius: theme.radii.full,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(ex.count / maxCount) * 100}%`,
                    background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.primaryDeep})`,
                    borderRadius: theme.radii.full,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Por día ── */}
      {entries.length > 0 && (
        <div>
          <div style={{
            fontFamily: theme.fonts.title,
            fontSize: '0.82rem',
            color: theme.colors.primary,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '12px',
            paddingLeft: '2px',
          }}>
            Por día
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map(({ date, morning, afternoon }) => (
              <div key={date} style={{
                background: theme.colors.surface,
                borderRadius: theme.radii.md,
                padding: '12px 16px',
                border: `1px solid ${theme.colors.borderLight}`,
                boxShadow: theme.shadows.card,
              }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: theme.colors.text,
                  textTransform: 'capitalize',
                  marginBottom: '9px',
                  letterSpacing: '0.2px',
                }}>
                  {formatHistoryDate(date)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {morning && <HistorySessionRow session={morning} icon="☀" label="Mañana" color={theme.colors.morning} />}
                  {afternoon && <HistorySessionRow session={afternoon} icon="☽" label="Tarde" color={theme.colors.afternoon} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── History helpers ──────────────────────────────────────────────────────────

function normalizeSession(raw) {
  if (!raw) return null;
  if (typeof raw === 'boolean') return raw ? { completed: true, exercises: [] } : null;
  return raw.completed ? raw : null;
}

function formatHistoryDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterday = (() => {
    const y = new Date(); y.setDate(y.getDate() - 1);
    return `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  })();
  if (dateStr === today) return 'Hoy';
  if (dateStr === yesterday) return 'Ayer';
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' });
}

function HistorySessionRow({ session, icon, label, color }) {
  const exDetails = (session.exercises || [])
    .map(id => EXERCISES.find(e => e.id === id))
    .filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <span style={{ fontSize: '0.72rem', opacity: 0.65 }}>{icon}</span>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: theme.colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
        }}>
          {label}
        </span>
      </div>

      {exDetails.length > 0 ? (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {exDetails.map(ex => (
            <div key={ex.id} style={{
              background: `${color}12`,
              border: `1px solid ${color}35`,
              borderRadius: theme.radii.sm,
              padding: '2px 8px',
              fontSize: '0.66rem',
              fontWeight: 700,
              color: theme.colors.text,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span>{ex.emoji}</span>
              <span>{ex.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: theme.colors.success,
          paddingTop: '2px',
        }}>
          ✓ Completada
        </div>
      )}
    </div>
  );
}

// ─── Info section ─────────────────────────────────────────────────────────────

function InfoSection() {
  const items = [
    { icon: '☀', text: 'Sesión de mañana — elige 3 ejercicios' },
    { icon: '☽', text: 'Sesión de tarde — elige 3 ejercicios' },
    { icon: '✦', text: 'Completa ambas sesiones para mantener tu racha' },
    { icon: '✧', text: 'Tu tobillo derecho te lo agradecerá' },
  ];

  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: '18px 20px',
      boxShadow: theme.shadows.card,
      border: `1px solid ${theme.colors.borderLight}`,
    }}>
      <div style={{
        fontFamily: theme.fonts.title,
        fontSize: '0.82rem',
        color: theme.colors.primary,
        marginBottom: '12px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}>
        Tu rutina diaria
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: '0.85rem',
              color: theme.colors.primary,
              flexShrink: 0,
              marginTop: '1px',
              opacity: 0.7,
            }}>{item.icon}</span>
            <span style={{
              fontSize: '0.8rem',
              color: theme.colors.textMuted,
              fontWeight: 600,
              lineHeight: 1.55,
            }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
