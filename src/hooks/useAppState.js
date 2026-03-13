import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'anklequest_data';

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getInitialData() {
  const today = getTodayDate();
  return {
    streak: { count: 0, lastCompletedDate: null },
    history: {},
    today: {
      date: today,
      morning: { selected: [], completed: false },
      afternoon: { selected: [], completed: false },
    },
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialData();
    const saved = JSON.parse(raw);
    const today = getTodayDate();

    // If saved data is from a previous day, reset today's sessions
    if (saved.today?.date !== today) {
      saved.today = {
        date: today,
        morning: { selected: [], completed: false },
        afternoon: { selected: [], completed: false },
      };
      // Check if streak should break
      if (saved.streak.lastCompletedDate !== getYesterdayDate()) {
        // More than 1 day gap — streak broken
        saved.streak.count = 0;
      }
    }
    return saved;
  } catch {
    return getInitialData();
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useAppState() {
  const [state, setState] = useState(() => loadData());

  useEffect(() => {
    saveData(state);
  }, [state]);

  const selectExercises = useCallback((session, exerciseIds) => {
    setState(prev => ({
      ...prev,
      today: {
        ...prev.today,
        [session]: { ...prev.today[session], selected: exerciseIds },
      },
    }));
  }, []);

  const completeSession = useCallback((session, exerciseIds = []) => {
    setState(prev => {
      const today = getTodayDate();
      const newToday = {
        ...prev.today,
        [session]: { ...prev.today[session], completed: true },
      };

      // Update history — store exercise IDs alongside completion flag
      const existingDay = prev.history[today] || {};
      const newHistory = {
        ...prev.history,
        [today]: {
          ...existingDay,
          [session]: { completed: true, exercises: exerciseIds },
        },
      };

      // Update streak
      let newStreak = { ...prev.streak };
      const yesterday = getYesterdayDate();
      const alreadyCompletedToday = prev.today.morning.completed || prev.today.afternoon.completed;

      if (!alreadyCompletedToday) {
        // First completion of today
        if (newStreak.lastCompletedDate === yesterday || newStreak.lastCompletedDate === today) {
          newStreak.count = newStreak.lastCompletedDate === today ? newStreak.count : newStreak.count + 1;
        } else {
          newStreak.count = 1;
        }
        newStreak.lastCompletedDate = today;
      }

      return {
        ...prev,
        streak: newStreak,
        history: newHistory,
        today: newToday,
      };
    });
  }, []);

  const resetSession = useCallback((session) => {
    setState(prev => ({
      ...prev,
      today: {
        ...prev.today,
        [session]: { selected: [], completed: false },
      },
    }));
  }, []);

  // Debug: reset all data
  const resetAll = useCallback(() => {
    const fresh = getInitialData();
    setState(fresh);
  }, []);

  const { morning, afternoon } = state.today;
  const bothDone = morning.completed && afternoon.completed;
  const oneDone = morning.completed || afternoon.completed;

  return {
    streak: state.streak,
    history: state.history,
    morning,
    afternoon,
    bothDone,
    oneDone,
    selectExercises,
    completeSession,
    resetSession,
    resetAll,
  };
}
