import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsScreen from '../screens/main/EventsScreen';
import CreateEventScreen from '../screens/main/CreateEventScreen';
import EventDetailsScreen from '../screens/main/EventDetailsScreen';
import HostProfileScreen from '../screens/main/HostProfileScreen';

const Stack = createNativeStackNavigator();

export default function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="HostProfile" component={HostProfileScreen} />
    </Stack.Navigator>
  );
}
