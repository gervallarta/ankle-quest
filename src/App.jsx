import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
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

function HomeView({ morning, afternoon, bothDone, streak, history, onStart }) {
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

      {/* History section */}
      <HistorySection history={history} />
    </div>
  );
}

// ─── History helpers ──────────────────────────────────────────────────────────

function normalizeSession(raw) {
  // Handles both old format (boolean) and new format ({ completed, exercises })
  if (!raw) return null;
  if (typeof raw === 'boolean') return raw ? { completed: true, exercises: [] } : null;
  return raw.completed ? raw : null;
}

function formatHistoryDate(dateStr) {
  // Avoid timezone shift by parsing as noon local time
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date().toISOString().split('T')[0];
  const yesterday = (() => { const y = new Date(); y.setDate(y.getDate() - 1); return y.toISOString().split('T')[0]; })();
  if (dateStr === today) return 'Hoy';
  if (dateStr === yesterday) return 'Ayer';
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' });
}

function HistorySection({ history }) {
  const entries = Object.entries(history || {})
    .map(([date, day]) => ({ date, morning: normalizeSession(day.morning), afternoon: normalizeSession(day.afternoon) }))
    .filter(e => e.morning || e.afternoon)
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  if (entries.length === 0) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
        marginBottom: '12px',
        paddingLeft: '2px',
      }}>
        <div style={{
          fontFamily: theme.fonts.title,
          fontSize: '0.82rem',
          color: theme.colors.primary,
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          Historial
        </div>
        <div style={{
          fontSize: '0.68rem',
          color: theme.colors.textLight,
          fontWeight: 600,
        }}>
          para tu fisioterapeuta
        </div>
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
            {/* Date */}
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

            {/* Sessions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {morning && <HistorySessionRow session={morning} icon="☀" label="Mañana" color={theme.colors.morning} />}
              {afternoon && <HistorySessionRow session={afternoon} icon="☽" label="Tarde" color={theme.colors.afternoon} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistorySessionRow({ session, icon, label, color }) {
  const exDetails = (session.exercises || [])
    .map(id => EXERCISES.find(e => e.id === id))
    .filter(Boolean);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      {/* Icon + label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
        width: '54px',
        paddingTop: '2px',
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

      {/* Exercise chips */}
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
        // Old data format — no exercise IDs recorded
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

// ─────────────────────────────────────────────────────────────────────────────

function InfoSection() {
  const items = [
    { icon: '☀', text: 'Sesión de mañana — elige 3 ejercicios' },
    { icon: '☽', text: 'Sesión de tarde — elige 3 ejercicios' },
    { icon: '✦', text: 'Completa una sesión para mantener tu racha' },
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
