import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { Header } from './components/Header';
import { SessionCard } from './components/SessionCard';
import { ExerciseSelector } from './components/ExerciseSelector';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { CompletionScreen } from './components/CompletionScreen';
import { theme } from './theme';

export default function App() {
  const {
    streak,
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
    completeSession(activeSession);
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

function HomeView({ morning, afternoon, bothDone, streak, onStart }) {
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
    </div>
  );
}

function InfoSection() {
  const items = [
    { icon: '☀', text: 'Sesión de mañana — elige 3 de 5 ejercicios' },
    { icon: '☽', text: 'Sesión de tarde — 3 ejercicios distintos' },
    { icon: '✦', text: 'Completa una sesión para mantener tu racha' },
    { icon: '✧', text: 'Tu tobillo izquierdo te lo agradecerá' },
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
