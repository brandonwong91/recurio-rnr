import { create } from "zustand";
import {
  getWorkouts,
  getExercises,
  getExercisesWithMetrics,
  addWorkout as dbAddWorkout,
  addExercise as dbAddExercise,
  updateWorkout as dbUpdateWorkout,
  updateExercise as dbUpdateExercise,
  deleteWorkout as dbDeleteWorkout,
  deleteExercise as dbDeleteExercise,
  startWorkoutSession as dbStartWorkoutSession,
  addWorkoutSet as dbAddWorkoutSet,
  updateWorkoutSet as dbUpdateWorkoutSet,
  deleteWorkoutSet as dbDeleteWorkoutSet,
  endWorkoutSession as dbEndWorkoutSession,
} from "../supabase";

type ExerciseSet = {
  id: string;
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
  id: string;
  workoutId: string;
  exerciseSets: Record<string, ExerciseSet[]>;
};

type WorkoutState = {
  workouts: Workout[];
  exercises: Exercise[];
  exercisesWithMetrics: any[];
  editingExerciseId: string | null;
  editingWorkoutId: string | null;
  activeWorkoutSession: WorkoutSession | null;
  loading: boolean;
  fetchWorkouts: () => Promise<void>;
  fetchExercises: () => Promise<void>;
  fetchExercisesWithMetrics: () => Promise<void>;
  addExercise: (name: string) => Promise<void>;
  updateExercise: (id: string, name: string) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  addWorkout: (name: string, exerciseIds: string[]) => Promise<void>;
  updateWorkout: (id: string, name: string) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  setEditingExerciseId: (id: string | null) => void;
  setEditingWorkoutId: (id: string | null) => void;
  startWorkout: (workoutId: string) => Promise<void>;
  addSet: (exerciseId: string, newSet: Omit<ExerciseSet, "id">) => Promise<void>;
  updateSet: (
    exerciseId: string,
    setIndex: number,
    updatedSet: ExerciseSet
  ) => Promise<void>;
  duplicateSet: (
    exerciseId: string,
    setIndex: number,
    setToDuplicate: ExerciseSet
  ) => Promise<void>;
  deleteSet: (exerciseId: string, setIndex: number) => Promise<void>;
  endWorkout: () => Promise<void>;
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  exercises: [],
  exercisesWithMetrics: [],
  editingExerciseId: null,
  editingWorkoutId: null,
  activeWorkoutSession: null,
  loading: false,
  fetchWorkouts: async () => {
    set({ loading: true });
    const workouts = await getWorkouts();
    set({ workouts, loading: false });
  },
  fetchExercises: async () => {
    set({ loading: true });
    const exercises = await getExercises();
    set({ exercises, loading: false });
  },
  fetchExercisesWithMetrics: async () => {
    set({ loading: true });
    const exercisesWithMetrics = await getExercisesWithMetrics();
    set({ exercisesWithMetrics, loading: false });
  },
  addExercise: async (name) => {
    const newExercise = await dbAddExercise(name);
    if (newExercise) {
      set((state) => ({ exercises: [...state.exercises, newExercise] }));
    }
  },
  updateExercise: async (id, name) => {
    await dbUpdateExercise(id, name);
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === id ? { ...ex, name } : ex
      ),
      editingExerciseId: null,
    }));
  },
  deleteExercise: async (id) => {
    await dbDeleteExercise(id);
    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.id !== id),
      workouts: state.workouts.map((w) => ({
        ...w,
        exercises: w.exercises.filter((ex) => ex.id !== id),
      })),
    }));
  },
  addWorkout: async (name, exerciseIds) => {
    const newWorkout = await dbAddWorkout(name, exerciseIds);
    if (newWorkout) {
      const exercises = get().exercises.filter((ex) =>
        exerciseIds.includes(ex.id)
      );
      set((state) => ({
        workouts: [...state.workouts, { ...newWorkout, exercises }],
      }));
    }
  },
  updateWorkout: async (id, name) => {
    await dbUpdateWorkout(id, name);
    set((state) => ({
      workouts: state.workouts.map((w) => (w.id === id ? { ...w, name } : w)),
      editingWorkoutId: null,
    }));
  },
  deleteWorkout: async (id) => {
    await dbDeleteWorkout(id);
    set((state) => ({
      workouts: state.workouts.filter((w) => w.id !== id),
    }));
  },
  setEditingExerciseId: (id) => set({ editingExerciseId: id }),
  setEditingWorkoutId: (id) => set({ editingWorkoutId: id }),
  startWorkout: async (workoutId) => {
    set({ loading: true });
    const { workouts } = get();
    const workoutExists = workouts.some((w) => w.id === workoutId);

    let currentWorkouts = workouts;

    if (!workoutExists) {
      // Fetch all workouts and update the store
      const freshWorkouts = await getWorkouts();
      set({ workouts: freshWorkouts });
      currentWorkouts = freshWorkouts;
    }

    // Double check it exists now before creating a session
    const workoutNowExists = currentWorkouts.some((w) => w.id === workoutId);
    if (!workoutNowExists) {
      console.error(`Workout with id ${workoutId} not found in database.`);
      set({ loading: false });
      return;
    }

    const session = await dbStartWorkoutSession(workoutId);
    if (session) {
      set({
        activeWorkoutSession: {
          ...(session as any),
          workoutId: (session as any).workout_id,
          exerciseSets: {},
        },
        loading: false,
      });
    } else {
      // Failed to start session
      set({ loading: false });
    }
  },
  addSet: async (exerciseId, newSet) => {
    const state = get();
    if (!state.activeWorkoutSession) return;

    const addedSet = await dbAddWorkoutSet(
      state.activeWorkoutSession.id,
      exerciseId,
      newSet.reps,
      newSet.weight
    );

    if (addedSet) {
      set((state) => {
        if (!state.activeWorkoutSession) return {};
        const newExerciseSets = {
          ...state.activeWorkoutSession.exerciseSets,
        };
        if (!newExerciseSets[exerciseId]) {
          newExerciseSets[exerciseId] = [];
        }
        newExerciseSets[exerciseId].push(addedSet);
        return {
          activeWorkoutSession: {
            ...state.activeWorkoutSession,
            exerciseSets: newExerciseSets,
          },
        };
      });
    }
  },
  updateSet: async (exerciseId, setIndex, updatedSet) => {
    await dbUpdateWorkoutSet(updatedSet.id, updatedSet.reps, updatedSet.weight);
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
  duplicateSet: async (exerciseId, setIndex, setToDuplicate) => {
    const state = get();
    if (!state.activeWorkoutSession) return;

    const addedSet = await dbAddWorkoutSet(
      state.activeWorkoutSession.id,
      exerciseId,
      setToDuplicate.reps,
      setToDuplicate.weight
    );

    if (addedSet) {
      set((state) => {
        if (!state.activeWorkoutSession) return {};
        const newExerciseSets = {
          ...state.activeWorkoutSession.exerciseSets,
        };
        if (!newExerciseSets[exerciseId]) {
          newExerciseSets[exerciseId] = [];
        }
        newExerciseSets[exerciseId].splice(setIndex + 1, 0, addedSet);
        return {
          activeWorkoutSession: {
            ...state.activeWorkoutSession,
            exerciseSets: newExerciseSets,
          },
        };
      });
    }
  },
  deleteSet: async (exerciseId, setIndex) => {
    const state = get();
    if (!state.activeWorkoutSession) return;
    const setId = state.activeWorkoutSession.exerciseSets[exerciseId][setIndex].id;
    await dbDeleteWorkoutSet(setId);
    set((state) => {
      if (!state.activeWorkoutSession) return {};
      const newExerciseSets = {
        ...state.activeWorkoutSession.exerciseSets,
      };
      if (newExerciseSets[exerciseId]?.[setIndex]) {
        newExerciseSets[exerciseId].splice(setIndex, 1);
      }
      return {
        activeWorkoutSession: {
          ...state.activeWorkoutSession,
          exerciseSets: newExerciseSets,
        },
      };
    });
  },
  endWorkout: async () => {
    const state = get();
    if (state.activeWorkoutSession) {
      await dbEndWorkoutSession(state.activeWorkoutSession.id);
      set({ activeWorkoutSession: null });
    }
  },
}));
