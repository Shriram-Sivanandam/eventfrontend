import React, { useState } from 'react';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import { useNavigation } from '@react-navigation/native';

export default function CreateEventScreen() {
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const createEvent = async () => {
    try {
      await api.post('/events', {
        title,
        location,
        event_start: new Date(date).toISOString(),
      });

      navigation.goBack();
    } catch (err: any) {
      console.log('SERVER ERROR:', err.response?.data);
    }
  };

  return (
    <Screen>
      <AppText variant="title">Create Event</AppText>

      <AppInput
        placeholder="Event title"
        value={title}
        onChangeText={setTitle}
      />
      <AppInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <AppInput
        placeholder="Date (YYYY-MM-DD HH:mm)"
        value={date}
        onChangeText={setDate}
      />

      <AppButton title="Create Event" onPress={createEvent} />
    </Screen>
  );
}
