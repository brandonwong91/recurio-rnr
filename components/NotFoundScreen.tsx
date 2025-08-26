import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Text } from '~/components/ui/text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className='flex-1 items-center justify-center p-5'>
        <Card className='w-full max-w-sm'>
          <CardHeader>
            <CardTitle>Screen Not Found</CardTitle>
            <CardDescription>
              This screen doesn't exist. Please go back to the home screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href='/' asChild>
              <Button>
                <Text>Go to Home Screen</Text>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </View>
    </>
  );
}
