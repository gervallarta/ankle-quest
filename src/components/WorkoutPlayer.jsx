import { useState, useEffect, useRef, useCallback } from 'react';
import { EXERCISES } from '../data/exercises';
import { theme } from '../theme';

export function WorkoutPlayer({ session, selectedIds, onComplete, onBack }) {
  const exercises = selectedIds.map(id => EXERCISES.find(e => e.id === id));
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro | active | rest | done

  const currentExercise = exercises[exerciseIdx];
  const totalSets = currentExercise?.sets || 1;
  const isMorning = session === 'morning';
  const accentColor = isMorning ? theme.colors.morning : theme.colors.afternoon;
  const accentDeep = isMorning ? theme.colors.morningDeep : theme.colors.afternoonDeep;

  function advanceToNextSet() {
    const nextSet = setIdx + 1;
    if (nextSet >= totalSets) {
      const nextEx = exerciseIdx + 1;
      if (nextEx >= exercises.length) {
        setPhase('done');
      } else {
        setExerciseIdx(nextEx);
        setSetIdx(0);
        setPhase('intro');
      }
    } else {
      setSetIdx(nextSet);
      setPhase('rest');
    }
  }

  if (phase === 'done') {
    return <DoneScreen onComplete={onComplete} exercises={exercises} accentColor={accentColor} accentDeep={accentDeep} />;
  }

  const totalSteps = exercises.length * totalSets;
  const completedSteps = exerciseIdx * totalSets + setIdx;
  const progressPct = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease forwards' }}>
      {/* Progress header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
      }}>
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
          }}
        >← Salir</button>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: theme.colors.textLight,
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '5px',
          }}>
            <span>Ejercicio {exerciseIdx + 1}/{exercises.length}</span>
            <span>Serie {setIdx + 1}/{totalSets}</span>
          </div>
          <div style={{
            height: '4px',
            background: theme.colors.bgDeep,
            borderRadius: theme.radii.full,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${accentColor}, ${theme.colors.primary})`,
              borderRadius: theme.radii.full,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      </div>

      {phase === 'intro' && (
        <IntroScreen
          exercise={currentExercise}
          setIdx={setIdx}
          totalSets={totalSets}
          onStart={() => setPhase('active')}
          accentColor={accentColor}
          accentDeep={accentDeep}
        />
      )}
      {phase === 'active' && (
        <ActiveScreen
          exercise={currentExercise}
          setIdx={setIdx}
          totalSets={totalSets}
          onDone={advanceToNextSet}
          accentColor={accentColor}
          accentDeep={accentDeep}
        />
      )}
      {phase === 'rest' && (
        <RestScreen
          onContinue={() => setPhase('intro')}
          accentColor={accentColor}
          accentDeep={accentDeep}
        />
      )}
    </div>
  );
}

function IntroScreen({ exercise, setIdx, totalSets, onStart, accentColor, accentDeep }) {
  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: '28px 20px',
      textAlign: 'center',
      border: `1.5px solid ${theme.colors.borderLight}`,
      boxShadow: theme.shadows.card,
      animation: 'spinIn 0.4s ease forwards',
    }}>
      {/* Exercise icon */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: `${theme.colors.primary}12`,
        border: `1.5px solid ${theme.colors.primary}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: '1.8rem',
      }}>
        {exercise.emoji}
      </div>

      <div style={{
        fontFamily: theme.fonts.title,
        fontSize: '1.15rem',
        color: theme.colors.text,
        letterSpacing: '0.5px',
        marginBottom: '6px',
      }}>{exercise.name}</div>

      {totalSets > 1 && (
        <div style={{
          display: 'inline-block',
          background: `${accentColor}15`,
          borderRadius: theme.radii.full,
          padding: '3px 14px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: accentDeep,
          marginBottom: '18px',
          letterSpacing: '0.3px',
        }}>
          Serie {setIdx + 1} de {totalSets}
        </div>
      )}

      <ExerciseSummary exercise={exercise} accentColor={accentColor} accentDeep={accentDeep} />

      <button
        onClick={onStart}
        style={{
          width: '100%',
          marginTop: '22px',
          padding: '14px',
          borderRadius: theme.radii.md,
          background: `linear-gradient(135deg, ${accentColor}, ${accentDeep})`,
          color: theme.colors.white,
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: '0.9rem',
          letterSpacing: '0.3px',
          boxShadow: `0 4px 14px ${accentColor}35`,
          transition: 'transform 0.15s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Comenzar →
      </button>
    </div>
  );
}

function ExerciseSummary({ exercise, accentColor, accentDeep }) {
  const items = [];

  if (exercise.sides) {
    items.push(`${exercise.repsPerSide} reps por lado`);
  } else if (exercise.reps) {
    items.push(`${exercise.reps} repeticiones`);
  }

  if (exercise.holdSeconds) {
    items.push(`mantener ${exercise.holdSeconds}s`);
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: theme.colors.bgDeep,
          borderRadius: theme.radii.full,
          padding: '5px 14px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: theme.colors.textMuted,
          border: `1px solid ${theme.colors.borderLight}`,
        }}>
          {item}
        </div>
      ))}
      {exercise.equipment && (
        <div style={{
          background: theme.colors.bgDeep,
          borderRadius: theme.radii.full,
          padding: '5px 14px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: theme.colors.textLight,
          border: `1px solid ${theme.colors.borderLight}`,
        }}>
          {exercise.equipment}
        </div>
      )}
    </div>
  );
}

function ActiveScreen({ exercise, setIdx, totalSets, onDone, accentColor, accentDeep }) {
  const hasHold = !!exercise.holdSeconds;
  const hasSides = !!exercise.sides;
  const totalReps = exercise.repsPerSide || exercise.reps;

  const [sideIdx, setSideIdx] = useState(0);
  // repIdx only used for non-bilateral hold exercises
  const [repIdx, setRepIdx] = useState(0);
  const [holding, setHolding] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exercise.holdSeconds || 0);
  // Between-rep rest state (for exercises with restSeconds)
  const [restingBetweenReps, setRestingBetweenReps] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const intervalRef = useRef(null);

  const currentSide = hasSides ? exercise.sides[sideIdx] : null;
  const currentRep = repIdx + 1;
  const isLastSide = !hasSides || sideIdx >= exercise.sides.length - 1;
  const isLastRep = repIdx >= totalReps - 1;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  function startHold() {
    setHolding(true);
    setTimeLeft(exercise.holdSeconds);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setHolding(false);
          // Auto-start between-rep rest if applicable
          if (exercise.restSeconds) {
            setRestingBetweenReps(true);
            setRestTimeLeft(exercise.restSeconds);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Countdown for between-rep rest
  useEffect(() => {
    if (!restingBetweenReps) return;
    const t = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setRestingBetweenReps(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [restingBetweenReps]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  function handleRepDone() {
    clearTimer();
    // Bilateral: one tap per side, no per-rep tracking
    if (hasSides) {
      if (sideIdx < exercise.sides.length - 1) {
        setSideIdx(s => s + 1);
      } else {
        onDone();
      }
      return;
    }
    // Non-bilateral hold exercise: advance rep
    const nextRep = repIdx + 1;
    if (nextRep >= totalReps) {
      onDone();
    } else {
      setRepIdx(nextRep);
      setHolding(false);
      setTimeLeft(exercise.holdSeconds || 0);
    }
  }

  const progress = timeLeft > 0 ? (exercise.holdSeconds - timeLeft) / exercise.holdSeconds : holding ? 1 : 0;
  const timerStroke = timeLeft <= 5 ? '#EF4444' : theme.colors.primary;

  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: '24px 20px',
      textAlign: 'center',
      border: `1.5px solid ${theme.colors.borderLight}`,
      boxShadow: theme.shadows.card,
    }}>
      {/* Exercise name */}
      <div style={{
        fontFamily: theme.fonts.title,
        fontSize: '1rem',
        color: theme.colors.text,
        letterSpacing: '0.4px',
        marginBottom: '14px',
      }}>
        {exercise.name}
      </div>

      {/* Side indicator */}
      {hasSides && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}>
          {exercise.sides.map((side, i) => (
            <div key={i} style={{
              padding: '4px 18px',
              borderRadius: theme.radii.full,
              background: i === sideIdx
                ? `linear-gradient(135deg, ${accentColor}, ${accentDeep})`
                : theme.colors.bgDeep,
              color: i === sideIdx ? theme.colors.white : theme.colors.textMuted,
              fontSize: '0.78rem',
              fontWeight: 700,
              transition: 'all 0.3s',
            }}>
              {side}
            </div>
          ))}
        </div>
      )}

      {/* Rep display */}
      {hasSides ? (
        // Bilateral: show total reps to do (no per-rep tracking)
        <>
          <div style={{
            fontFamily: theme.fonts.title,
            fontSize: '3.8rem',
            color: theme.colors.primary,
            lineHeight: 1,
            marginBottom: '4px',
          }}>
            {totalReps}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: theme.colors.textLight,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '20px',
          }}>
            reps — {currentSide}
          </div>
        </>
      ) : (
        // Non-bilateral: show current rep progress
        <>
          <div style={{
            fontFamily: theme.fonts.title,
            fontSize: '3.8rem',
            color: theme.colors.primary,
            lineHeight: 1,
            marginBottom: '4px',
          }}>
            {currentRep}
            <span style={{ fontSize: '1.4rem', color: theme.colors.textLight }}>/{totalReps}</span>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: theme.colors.textLight,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '20px',
          }}>
            Repetición
          </div>
        </>
      )}

      {/* Timer circle */}
      {hasHold && (
        <div style={{ marginBottom: '20px', position: 'relative', display: 'inline-block' }}>
          <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="65" cy="65" r="55" fill="none" stroke={theme.colors.bgDeep} strokeWidth="8" />
            <circle
              cx="65" cy="65" r="55"
              fill="none"
              stroke={timerStroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="345"
              strokeDashoffset={345 * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            {holding ? (
              <>
                <div style={{
                  fontFamily: theme.fonts.title,
                  fontSize: '2.2rem',
                  color: timerStroke,
                  lineHeight: 1,
                  transition: 'color 0.3s',
                }}>{timeLeft}</div>
                <div style={{ fontSize: '0.65rem', color: theme.colors.textLight, fontWeight: 700, letterSpacing: '1px' }}>SEG</div>
              </>
            ) : timeLeft === 0 ? (
              <div style={{ fontFamily: theme.fonts.title, fontSize: '1.4rem', color: theme.colors.success }}>✓</div>
            ) : (
              <div style={{ fontFamily: theme.fonts.title, fontSize: '0.7rem', color: theme.colors.textLight, letterSpacing: '1px' }}>LISTO</div>
            )}
          </div>
        </div>
      )}

      {/* Action button */}
      {hasHold ? (
        restingBetweenReps ? (
          // Between-rep rest countdown
          <div style={{
            padding: '14px',
            borderRadius: theme.radii.md,
            background: `${theme.colors.success}10`,
            border: `1px solid ${theme.colors.success}30`,
            fontFamily: theme.fonts.body,
            fontSize: '0.9rem',
            fontWeight: 700,
            color: theme.colors.successDeep,
          }}>
            Descansa — {restTimeLeft}s
          </div>
        ) : !holding ? (
          <button
            onClick={timeLeft === 0 ? handleRepDone : startHold}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: theme.radii.md,
              background: timeLeft === 0
                ? `linear-gradient(135deg, ${theme.colors.success}, ${theme.colors.successDeep})`
                : `linear-gradient(135deg, ${accentColor}, ${accentDeep})`,
              color: theme.colors.white,
              fontFamily: theme.fonts.body,
              fontWeight: 800,
              fontSize: '0.88rem',
              boxShadow: `0 4px 14px ${timeLeft === 0 ? theme.colors.success : accentColor}35`,
              transition: 'all 0.3s',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {timeLeft === 0 ? 'Siguiente rep →' : `Mantener ${exercise.holdSeconds}s →`}
          </button>
        ) : (
          <div style={{
            padding: '14px',
            borderRadius: theme.radii.md,
            background: `${theme.colors.primary}10`,
            border: `1px solid ${theme.colors.primary}20`,
            fontFamily: theme.fonts.body,
            fontSize: '0.9rem',
            fontWeight: 700,
            color: theme.colors.primary,
            animation: 'softPulse 1.5s ease infinite',
          }}>
            Mantén la posición — {timeLeft}s
          </div>
        )
      ) : (
        // Non-hold exercise (includes bilateral)
        <button
          onClick={handleRepDone}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: theme.radii.md,
            background: `linear-gradient(135deg, ${accentColor}, ${accentDeep})`,
            color: theme.colors.white,
            fontFamily: theme.fonts.body,
            fontWeight: 800,
            fontSize: '0.88rem',
            boxShadow: `0 4px 14px ${accentColor}35`,
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {hasSides
            ? 'Listo 💪🏼'
            : (isLastRep ? 'Completar serie →' : 'Siguiente →')
          }
        </button>
      )}

      {/* Tip */}
      <div style={{
        marginTop: '14px',
        fontSize: '0.75rem',
        color: theme.colors.textMuted,
        fontStyle: 'italic',
        lineHeight: 1.5,
        padding: '8px 12px',
        background: theme.colors.bgDeep,
        borderRadius: theme.radii.sm,
        textAlign: 'left',
      }}>
        {exercise.instructions}
      </div>
    </div>
  );
}

function RestScreen({ onContinue, accentColor, accentDeep }) {
  const [seconds, setSeconds] = useState(15);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: '40px 24px',
      textAlign: 'center',
      border: `1.5px solid ${theme.colors.successLight}`,
      boxShadow: theme.shadows.card,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: `${theme.colors.success}15`,
        border: `1.5px solid ${theme.colors.success}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: '1.5rem',
      }}>
        ✦
      </div>

      <div style={{
        fontFamily: theme.fonts.title,
        fontSize: '1.15rem',
        color: theme.colors.successDeep,
        letterSpacing: '0.5px',
        marginBottom: '6px',
      }}>
        Descansa
      </div>
      <div style={{
        fontSize: '0.8rem',
        color: theme.colors.textMuted,
        fontWeight: 600,
        marginBottom: '28px',
        lineHeight: 1.5,
      }}>
        Respira profundo. Lo estás haciendo muy bien.
      </div>

      <div style={{
        fontFamily: theme.fonts.title,
        fontSize: '3.5rem',
        color: seconds > 0 ? theme.colors.success : theme.colors.gold,
        marginBottom: '24px',
        lineHeight: 1,
      }}>
        {seconds > 0 ? seconds : '✦'}
      </div>

      <button
        onClick={onContinue}
        style={{
          padding: '12px 32px',
          borderRadius: theme.radii.md,
          background: seconds === 0
            ? `linear-gradient(135deg, ${accentColor}, ${accentDeep})`
            : theme.colors.bgDeep,
          color: seconds === 0 ? theme.colors.white : theme.colors.textMuted,
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: '0.88rem',
          boxShadow: seconds === 0 ? `0 4px 14px ${accentColor}35` : 'none',
          transition: 'all 0.3s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {seconds > 0 ? 'Continuar →' : 'Siguiente ejercicio →'}
      </button>
    </div>
  );
}

function DoneScreen({ onComplete, exercises, accentColor, accentDeep }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '32px 20px',
      animation: 'slideUp 0.5s ease forwards',
    }}>
      {/* Gold star circle */}
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${theme.colors.gold}20, ${theme.colors.goldLight}30)`,
        border: `2px solid ${theme.colors.gold}50`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: '1.8rem',
        animation: 'glowPulse 2.5s ease infinite',
      }}>
        ✦
      </div>

      <div style={{
        fontFamily: theme.fonts.title,
        fontSize: '1.4rem',
        color: theme.colors.text,
        letterSpacing: '0.5px',
        marginBottom: '8px',
      }}>
        Sesión completada
      </div>
      <div style={{
        fontSize: '0.82rem',
        color: theme.colors.textMuted,
        fontWeight: 600,
        marginBottom: '24px',
        lineHeight: 1.6,
      }}>
        Has terminado los {exercises.length} ejercicios de esta sesión.
      </div>

      {/* Exercise badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '28px',
      }}>
        {exercises.map(ex => (
          <div key={ex.id} style={{
            background: theme.colors.bgDeep,
            border: `1.5px solid ${theme.colors.borderLight}`,
            borderRadius: theme.radii.md,
            padding: '10px 14px',
            fontSize: '1.4rem',
          }}>
            {ex.emoji}
          </div>
        ))}
      </div>

      <button
        onClick={onComplete}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: theme.radii.md,
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDeep})`,
          color: theme.colors.white,
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: '0.9rem',
          letterSpacing: '0.3px',
          boxShadow: theme.shadows.button,
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Completar sesión →
      </button>
    </div>
  );
}
