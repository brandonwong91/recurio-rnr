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

type WorkoutState = {
  workouts: Workout[];
  exercises: Exercise[];
  addExercise: (name: string) => void;
  addWorkout: (name: string, exerciseIds: string[]) => void;
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  exercises: [],
  addExercise: (name) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
      sets: [],
    };
    set((state) => ({ exercises: [...state.exercises, newExercise] }));
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
}));
