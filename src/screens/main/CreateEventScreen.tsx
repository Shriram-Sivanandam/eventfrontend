import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import { Spacing } from '../../constants/layout';
import Colors from '../../constants/colors';

export default function CreateEventScreen() {
  const navigation = useNavigation<any>();

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    price: '',
    capacity: '',
  });

  const [errors, setErrors] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    price: '',
    capacity: '',
  });

  const validate = () => {
    const newErrors: any = {};

    if (!form.title) newErrors.title = 'Enter event title';
    if (!form.location) newErrors.location = 'Enter a location';
    if (!form.date) newErrors.date = 'Select a date';
    if (!form.price) newErrors.price = 'Enter price for the event';
    if (!form.capacity) newErrors.capacity = 'Enter event capacity';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const createEvent = async () => {
    if (!validate()) return;
    try {
      await api.post('/events', {
        title: form.title,
        description: form.description,
        location: form.location,
        event_start: new Date(form.date).toISOString(),
        price: Number(form.price || 0),
        capacity: Number(form.capacity || 0),
      });

      navigation.goBack();
    } catch (err: any) {
      console.log('SERVER ERROR:', err.response?.data);
    }
  };

  return (
    <Screen>
      <AppText variant="title">Create Event</AppText>

      <AppText variant="caption" style={styles.inputLabel}>
        Title
      </AppText>
      <AppInput
        placeholder="Ex: F1 Watch Party"
        value={form.title}
        onChangeText={text => setForm(prev => ({ ...prev, title: text }))}
      />
      <AppText variant="caption" color={Colors.light.danger}>
        {errors.title}
      </AppText>

      <AppText variant="caption" style={styles.inputLabel}>
        Description
      </AppText>
      <AppInput
        placeholder="Description"
        value={form.description}
        onChangeText={text => setForm(prev => ({ ...prev, description: text }))}
      />
      <AppText variant="caption" color={Colors.light.danger}>
        {errors.description}
      </AppText>

      <AppText variant="caption" style={styles.inputLabel}>
        Location
      </AppText>
      <AppInput
        placeholder="Location"
        value={form.location}
        onChangeText={text => setForm(prev => ({ ...prev, location: text }))}
      />
      <AppText variant="caption" color={Colors.light.danger}>
        {errors.location}
      </AppText>

      <AppText variant="caption" style={styles.inputLabel}>
        Date
      </AppText>
      <AppInput
        placeholder="Date (YYYY-MM-DD HH:mm)"
        value={form.date}
        onChangeText={text => setForm(prev => ({ ...prev, date: text }))}
      />
      <AppText variant="caption" color={Colors.light.danger}>
        {errors.date}
      </AppText>

      <AppText variant="caption" style={styles.inputLabel}>
        Price
      </AppText>
      <AppInput
        placeholder="Ex: 500"
        value={form.price}
        onChangeText={text => setForm(prev => ({ ...prev, price: text }))}
      />
      <AppText variant="caption" color={Colors.light.danger}>
        {errors.price}
      </AppText>

      <AppText variant="caption" style={styles.inputLabel}>
        Capacity
      </AppText>
      <AppInput
        placeholder="Ex: 10"
        value={form.capacity}
        onChangeText={text => setForm(prev => ({ ...prev, capacity: text }))}
      />
      <AppText variant="caption" color={Colors.light.danger}>
        {errors.capacity}
      </AppText>

      <AppButton
        title="Create Event"
        onPress={createEvent}
        style={styles.createBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  createBtn: {
    marginVertical: Spacing.md,
  },
});
