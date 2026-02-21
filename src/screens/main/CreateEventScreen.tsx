import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import { Spacing } from '../../constants/layout';
import Colors from '../../constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';

export default function CreateEventScreen() {
  const navigation = useNavigation<any>();
  const [showPicker, setShowPicker] = useState(false);
  const [image, setImage] = useState<any>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date(),
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

  const pickImage = async () => {
    console.log('helloouuuu ');
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets?.length) {
      setImage(result.assets[0]);
      console.log('yuooooooo ', result.assets[0]);
    }
  };

  const validate = () => {
    console.log('asdfasfasd ');
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

    const data = new FormData();

    data.append('title', form.title);
    data.append('description', form.description);
    data.append('location', form.location);
    data.append('event_start', form.date.toISOString());
    data.append('price', form.price);
    data.append('capacity', form.capacity);

    if (image) {
      data.append('image', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || 'photo.jpg',
      });
    }

    try {
      await api.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigation.goBack();
    } catch (err: any) {
      console.log('SERVER ERROR:', err.response?.data);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      return;
    }
    setShowPicker(false);
    if (selectedDate) {
      setForm(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: form.date || new Date(),
      mode: 'date',
      is24Hour: true,
      minimumDate: new Date(),
      onChange: (_event, selectedDate) => {
        if (selectedDate) {
          setForm(prev => ({
            ...prev,
            date: selectedDate,
          }));
        }
      },
    });
  };

  const openTimePicker = () => {
    DateTimePickerAndroid.open({
      value: form.date || new Date(),
      mode: 'time',
      is24Hour: true,
      onChange: (_event, selectedDate) => {
        if (selectedDate) {
          setForm(prev => ({
            ...prev,
            date: selectedDate,
          }));
        }
      },
    });
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

      <AppButton title="Add Image" onPress={pickImage} />

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

      <View style={styles.dateTimeCont}>
        <TouchableOpacity
          onPress={openDatePicker}
          style={styles.dateTimeInputs}
        >
          <AppInput
            placeholder="Select date"
            value={form.date ? form.date.toLocaleDateString('en-GB') : ''}
            editable={false}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openTimePicker}
          style={styles.dateTimeInputs}
        >
          <AppInput
            placeholder="Select time"
            value={
              form.date
                ? form.date.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''
            }
            editable={false}
          />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={form.date || new Date()}
          mode="datetime"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

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
  dateTimeCont: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dateTimeInputs: {
    flex: 1,
  },
});
