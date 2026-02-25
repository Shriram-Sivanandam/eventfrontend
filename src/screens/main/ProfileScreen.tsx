import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import api from '../../api/client';
import EventCard from '../../components/EventCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Radius, Shadows, Spacing } from '../../constants/layout';

export default function ProfileScreen() {
  const { setToken } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [myEvents, setMyEvents] = useState<any[]>([]);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);

      const eventsRes = await api.get('/events?host_user_id=' + res.data.id);
      setMyEvents(eventsRes.data.events);
    } catch (err) {
      console.log('PROFILE ERROR', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <Screen>
      <View style={styles.headerCont}>
        <Ionicons
          name="arrow-back"
          size={20}
          color={Colors.light.primaryText}
          style={styles.backIcon}
        />
        <AppText variant="subtitle">Profile</AppText>
      </View>

      <View style={styles.infoCont}>
        <View style={styles.headerCont}>
          <Ionicons
            name="person-circle-sharp"
            size={80}
            color={Colors.light.borderSecondary}
            style={styles.backIcon}
          />
          {user && (
            <View>
              <AppText variant="title">{user.name || user.email}</AppText>
              <AppText variant="caption">{user.email}</AppText>
            </View>
          )}
        </View>

        <Ionicons
          name="pencil-sharp"
          size={20}
          color={Colors.light.secondaryText}
          style={styles.backIcon}
        />
      </View>

      <Pressable style={styles.pressableCont}>
        <View style={styles.pressableLeftCont}>
          <Ionicons
            name="albums-outline"
            size={25}
            color={Colors.light.primaryText}
          />
          <AppText variant="body" style={styles.pressableText}>
            My Events
          </AppText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={25}
          color={Colors.light.primaryText}
        />
      </Pressable>

      <Pressable style={styles.pressableCont}>
        <View style={styles.pressableLeftCont}>
          <Ionicons
            name="calendar-clear-outline"
            size={25}
            color={Colors.light.primaryText}
          />
          <AppText variant="body" style={styles.pressableText}>
            Registered Events
          </AppText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={25}
          color={Colors.light.primaryText}
        />
      </Pressable>

      <Pressable style={styles.pressableCont}>
        <View style={styles.pressableLeftCont}>
          <Ionicons
            name="person-outline"
            size={25}
            color={Colors.light.primaryText}
          />
          <AppText variant="body" style={styles.pressableText}>
            Account Settings
          </AppText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={25}
          color={Colors.light.primaryText}
        />
      </Pressable>

      <Pressable style={styles.pressableCont} onPress={logout}>
        <View style={styles.pressableLeftCont}>
          <Ionicons
            name="exit-outline"
            size={25}
            color={Colors.light.primaryText}
          />
          <AppText variant="body" style={styles.pressableText}>
            Logout
          </AppText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={25}
          color={Colors.light.primaryText}
        />
      </Pressable>

      <FlatList
        style={styles.eventList}
        data={myEvents}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <EventCard event={item} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  infoCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    marginRight: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DDD',
    marginBottom: 10,
  },
  pressableCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    ...Shadows.card,
  },
  pressableLeftCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressableText: {
    marginLeft: Spacing.md,
  },
  eventList: {
    marginTop: Spacing.lg,
  },
});
