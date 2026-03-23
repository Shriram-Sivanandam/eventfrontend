import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsScreen from '../screens/main/EventsScreen';
import CreateEventScreen from '../screens/main/CreateEventScreen';
import EventDetailsScreen from '../screens/main/EventDetailsScreen';
import HostProfileScreen from '../screens/main/HostProfileScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import HelpAndSupport from '../screens/profile/HelpAndSupport';
import MyEvents from '../screens/profile/MyEvents';
import RegisteredEvents from '../screens/profile/RegisteredEvents';
import EventDashboard from '../screens/profile/EventDashboard';
import EditProfile from '../screens/profile/EditProfile';

const Stack = createNativeStackNavigator();

export default function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="HostProfile" component={HostProfileScreen} />

      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="MyEvents" component={MyEvents} />
      <Stack.Screen name="EventDashboard" component={EventDashboard} />
      <Stack.Screen name="RegisteredEvents" component={RegisteredEvents} />
      <Stack.Screen name="HelpAndSupport" component={HelpAndSupport} />
    </Stack.Navigator>
  );
}
