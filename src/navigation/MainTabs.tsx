import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventsScreen from '../screens/main/EventsScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
