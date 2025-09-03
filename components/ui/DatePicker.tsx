import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Text } from './text';

type DatePickerProps = {
  date: string | null;
  onDateChange: (date: string) => void;
  placeholder?: string;
};

export function DatePicker({ date, onDateChange, placeholder }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDayPress = (day: { dateString: string }) => {
    onDateChange(day.dateString);
    setShowCalendar(false);
  };

  return (
    <>
      <Pressable onPress={() => setShowCalendar(true)} className="mb-4">
        <View className="border border-gray-300 rounded-lg p-3">
          <Text>{date || placeholder || 'Select Date'}</Text>
        </View>
      </Pressable>

      <Modal
        visible={showCalendar}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCalendar(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-card rounded-lg w-11/12">
            <Calendar
              onDayPress={handleDayPress}
              markedDates={date ? {
                [date]: { selected: true, selectedColor: '#00adf5' },
              } : {}}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
