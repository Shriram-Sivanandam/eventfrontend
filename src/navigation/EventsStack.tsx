import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsScreen from '../screens/main/EventsScreen';
import CreateEventScreen from '../screens/main/CreateEventScreen';

const Stack = createNativeStackNavigator();

export default function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
    </Stack.Navigator>
  );
}
