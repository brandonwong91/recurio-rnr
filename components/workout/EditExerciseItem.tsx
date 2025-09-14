import { Check, X, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { View, TextInput } from "react-native";
import { Button } from "~/components/ui/button";
import { useWorkoutStore, Exercise } from "~/lib/stores/workoutStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Text } from "~/components/ui/text";

type EditExerciseItemProps = {
  exercise: Exercise;
};

export function EditExerciseItem({ exercise }: EditExerciseItemProps) {
  const { updateExercise, setEditingExerciseId, deleteExercise } =
    useWorkoutStore();
  const [name, setName] = useState(exercise.name);

  const handleSave = () => {
    if (name.trim()) {
      updateExercise(exercise.id, name.trim());
    }
  };

  const handleCancel = () => {
    setEditingExerciseId(null);
  };

  return (
    <View className="mb-2">
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg p-2 mr-2 dark:text-white"
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <Button onPress={handleSave} size="sm" variant={"ghost"}>
          <Check size={16} color={"green"} />
        </Button>
        <Button
          onPress={handleCancel}
          variant="ghost"
          size="sm"
          className="ml-2"
        >
          <X size={16} color={"red"} />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant={"ghost"}>
              <Trash2 size={16} color={"red"} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                exercise and all its sets.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={() => deleteExercise(exercise.id)}>
                <Text>Delete</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
    </View>
  );
}
