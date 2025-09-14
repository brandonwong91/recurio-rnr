import React, { useEffect } from "react";
import { View, ScrollView, Pressable, Platform } from "react-native";
import { Text } from "~/components/ui/text";
import { useWorkoutStore } from "~/lib/stores/workoutStore";
import { Button } from "~/components/ui/button";
import { EditExerciseItem } from "~/components/workout/EditExerciseItem";
import { EditWorkoutItem } from "~/components/workout/EditWorkoutItem";
import { ActiveWorkout } from "~/components/workout/ActiveWorkout";
import { ExerciseStats } from "~/components/workout/ExerciseStats";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import { Plus } from "lucide-react-native";
import { AddWorkoutDialog } from "~/components/workout/AddWorkoutDialog";
import { AddExerciseDialog } from "~/components/workout/AddExerciseDialog";

function daysAgo(dateString: string | null) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}

export default function WorkoutsScreen() {
  const {
    workouts,
    exercisesWithMetrics,
    editingExerciseId,
    setEditingExerciseId,
    editingWorkoutId,
    setEditingWorkoutId,
    activeWorkoutSession,
    startWorkout,
    fetchExercises,
    fetchExercisesWithMetrics,
    fetchWorkouts,
    viewingStatsForExerciseId,
    setViewingStatsForExerciseId,
    isAddWorkoutDialogOpen,
    setAddWorkoutDialogOpen,
    isAddExerciseDialogOpen,
    setAddExerciseDialogOpen,
  } = useWorkoutStore();

  useEffect(() => {
    fetchWorkouts();
    fetchExercises();
    fetchExercisesWithMetrics();
  }, []);

  if (activeWorkoutSession) {
    return <ActiveWorkout />;
  }

  return (
    <ScrollView className="flex-1 p-4 flex flex-col max-w-md w-full mx-auto bg-secondary/30">
      <AddWorkoutDialog
        isOpen={isAddWorkoutDialogOpen}
        onOpenChange={setAddWorkoutDialogOpen}
      />
      <AddExerciseDialog
        isOpen={isAddExerciseDialogOpen}
        onOpenChange={setAddExerciseDialogOpen}
      />

      <View className="mt-8">
        <View className="flex flex-row justify-between items-center">
          <Text className="text-2xl font-bold mb-4">Workouts</Text>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="p-2 rounded-lg"
            onPress={() => setAddWorkoutDialogOpen(true)}
          >
            <Icon
              as={Plus}
              className={cn(
                "text-foreground size-4",
                Platform.select({ web: "pointer-events-none" })
              )}
            />
          </Button>
        </View>
        {workouts.map((workout) =>
          editingWorkoutId === workout.id ? (
            <EditWorkoutItem key={workout.id} workout={workout} />
          ) : (
            <View key={workout.id} className="p-4 border rounded-lg mb-4">
              <View className="flex-row justify-between items-center">
                <Pressable onPress={() => setEditingWorkoutId(workout.id)}>
                  <Text className="text-xl font-bold">{workout.name}</Text>
                </Pressable>
                <Button onPress={() => startWorkout(workout.id)} size="sm">
                  <Text>Start</Text>
                </Button>
              </View>
              {workout.exercises.map((exercise) =>
                editingExerciseId === exercise.id ? (
                  <EditExerciseItem key={exercise.id} exercise={exercise} />
                ) : (
                  <Pressable
                    key={exercise.id}
                    onPress={() => setEditingExerciseId(exercise.id)}
                  >
                    <Text className="ml-4 mt-2">- {exercise.name}</Text>
                  </Pressable>
                )
              )}
            </View>
          )
        )}
      </View>

      <View className="mt-8">
        <View className="flex flex-row justify-between items-center">
          <Text className="text-2xl font-bold mb-4">All Exercises</Text>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="p-2 rounded-lg"
            onPress={() => setAddExerciseDialogOpen(true)}
          >
            <Icon
              as={Plus}
              className={cn(
                "text-foreground size-4",
                Platform.select({ web: "pointer-events-none" })
              )}
            />
          </Button>
        </View>
        <View className="flex flex-col space-y-4">
          {exercisesWithMetrics.map((exercise) =>
            editingExerciseId === exercise.id ? (
              <EditExerciseItem key={exercise.id} exercise={exercise} />
            ) : (
              <View key={exercise.id} className="p-4 border rounded-lg">
                <Pressable onPress={() => setEditingExerciseId(exercise.id)}>
                  <Text className="text-lg font-bold">{exercise.name}</Text>
                  <Text>Last done: {daysAgo(exercise.last_done)}</Text>
                  {exercise.best_weight ? (
                    <Text>Best weight: {exercise.best_weight} kg</Text>
                  ) : exercise.best_reps ? (
                    <Text>Best reps: {exercise.best_reps}</Text>
                  ) : (
                    <Text>No data yet</Text>
                  )}
                </Pressable>
                <Button
                  onPress={() => setViewingStatsForExerciseId(exercise.id)}
                  size="sm"
                  className="mt-2"
                >
                  <Text>Stats</Text>
                </Button>
                {viewingStatsForExerciseId === exercise.id && (
                  <View>
                    <ExerciseStats exerciseId={exercise.id} />
                    <Button
                      onPress={() => setViewingStatsForExerciseId(null)}
                      size="sm"
                      variant="outline"
                      className="mt-2"
                    >
                      <Text>Close</Text>
                    </Button>
                  </View>
                )}
              </View>
            )
          )}
        </View>
      </View>
    </ScrollView>
  );
}
