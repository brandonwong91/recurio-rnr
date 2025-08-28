import * as React from "react";
import { View, TextInput, FlatList } from "react-native";
import { Calendar } from "react-native-calendars";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function Screen() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [taskText, setTaskText] = React.useState("");

  const addTask = () => {
    if (taskText.trim().length > 0) {
      setTasks([
        ...tasks,
        { id: Date.now().toString(), text: taskText, completed: false },
      ]);
      setTaskText("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <View className="flex-1 p-6 bg-secondary/30 max-w-sm mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>To-Do List</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex-row mb-4">
            <TextInput
              className="flex-1 border border-input rounded-md p-2 mr-2"
              placeholder="Add a new task"
              value={taskText}
              onChangeText={setTaskText}
            />
            <Button onPress={addTask}>
              <Text>Add</Text>
            </Button>
          </View>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-center mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => toggleTask(item.id)}
                >
                  <Text>{item.completed ? "[x]" : "[ ]"}</Text>
                </Button>
                <Text className={item.completed ? "line-through" : ""}>
                  {item.text}
                </Text>
              </View>
            )}
          />
        </CardContent>
      </Card>
    </View>
  );
}
