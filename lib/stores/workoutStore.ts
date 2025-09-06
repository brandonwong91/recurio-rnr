import { create } from "zustand";

type ExerciseSet = {
  reps: number;
  weight?: number;
};

export type Exercise = {
  id: string;
  name: string;
  sets: ExerciseSet[];
};

export type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
};

export type WorkoutSession = {
  workoutId: string;
  exerciseSets: Record<string, ExerciseSet[]>;
};

type WorkoutState = {
  workouts: Workout[];
  exercises: Exercise[];
  editingExerciseId: string | null;
  editingWorkoutId: string | null;
  activeWorkoutSession: WorkoutSession | null;
  addExercise: (name: string) => void;
  updateExercise: (id: string, name: string) => void;
  deleteExercise: (id: string) => void;
  addWorkout: (name: string, exerciseIds: string[]) => void;
  updateWorkout: (id: string, name: string) => void;
  deleteWorkout: (id: string) => void;
  setEditingExerciseId: (id: string | null) => void;
  setEditingWorkoutId: (id: string | null) => void;
  startWorkout: (workoutId: string) => void;
  addSet: (exerciseId: string, newSet: ExerciseSet) => void;
  updateSet: (exerciseId: string, setIndex: number, updatedSet: ExerciseSet) => void;
  duplicateSet: (exerciseId: string, setIndex: number, setToDuplicate: ExerciseSet) => void;
  endWorkout: () => void;
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  exercises: [],
  editingExerciseId: null,
  editingWorkoutId: null,
  activeWorkoutSession: null,
  addExercise: (name) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
      sets: [],
    };
    set((state) => ({ exercises: [...state.exercises, newExercise] }));
  },
  updateExercise: (id, name) => {
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === id ? { ...ex, name } : ex
      ),
      editingExerciseId: null,
    }));
  },
  deleteExercise: (id) => {
    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.id !== id),
      workouts: state.workouts.map((w) => ({
        ...w,
        exercises: w.exercises.filter((ex) => ex.id !== id),
      })),
    }));
  },
  addWorkout: (name, exerciseIds) => {
    const exercises = get().exercises.filter((ex) =>
      exerciseIds.includes(ex.id)
    );
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name,
      exercises,
    };
    set((state) => ({ workouts: [...state.workouts, newWorkout] }));
  },
  updateWorkout: (id, name) => {
    set((state) => ({
      workouts: state.workouts.map((w) => (w.id === id ? { ...w, name } : w)),
      editingWorkoutId: null,
    }));
  },
  deleteWorkout: (id) => {
    set((state) => ({
      workouts: state.workouts.filter((w) => w.id !== id),
    }));
  },
  setEditingExerciseId: (id) => set({ editingExerciseId: id }),
  setEditingWorkoutId: (id) => set({ editingWorkoutId: id }),
  startWorkout: (workoutId) => {
    set({ activeWorkoutSession: { workoutId, exerciseSets: {} } });
  },
  addSet: (exerciseId, newSet) => {
    set((state) => {
      if (!state.activeWorkoutSession) return {};
      const newExerciseSets = {
        ...state.activeWorkoutSession.exerciseSets,
      };
      if (!newExerciseSets[exerciseId]) {
        newExerciseSets[exerciseId] = [];
      }
      newExerciseSets[exerciseId].push(newSet);
      return {
        activeWorkoutSession: {
          ...state.activeWorkoutSession,
          exerciseSets: newExerciseSets,
        },
      };
    });
  },
  updateSet: (exerciseId, setIndex, updatedSet) => {
    set((state) => {
      if (!state.activeWorkoutSession) return {};
      const newExerciseSets = {
        ...state.activeWorkoutSession.exerciseSets,
      };
      if (newExerciseSets[exerciseId]?.[setIndex]) {
        newExerciseSets[exerciseId][setIndex] = updatedSet;
      }
      return {
        activeWorkoutSession: {
          ...state.activeWorkoutSession,
          exerciseSets: newExerciseSets,
        },
      };
    });
  },
  duplicateSet: (exerciseId, setIndex, setToDuplicate) => {
    set((state) => {
      if (!state.activeWorkoutSession) return {};
      const newExerciseSets = {
        ...state.activeWorkoutSession.exerciseSets,
      };
      if (setToDuplicate) {
        if (!newExerciseSets[exerciseId]) {
          newExerciseSets[exerciseId] = [];
        }
        newExerciseSets[exerciseId].splice(setIndex + 1, 0, setToDuplicate);
      }
      return {
        activeWorkoutSession: {
          ...state.activeWorkoutSession,
          exerciseSets: newExerciseSets,
        },
      };
    });
  },
  endWorkout: () => {
    // Here you might want to save the workout session to a history
    set({ activeWorkoutSession: null });
  },
}));