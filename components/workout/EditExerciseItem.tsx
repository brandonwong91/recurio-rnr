import { Check, X, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { View, TextInput, Alert } from "react-native";
import { Button } from "~/components/ui/button";
import { useWorkoutStore, Exercise } from "~/lib/stores/workoutStore";

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

  const handleDelete = () => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteExercise(exercise.id),
          style: "destructive",
        },
      ]
    );
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
        <Button onPress={handleDelete} size="sm" variant={"ghost"}>
          <Trash2 size={16} color={"red"} />
        </Button>
      </View>
    </View>
  );
}
