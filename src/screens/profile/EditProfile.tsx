import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AppText from '../../components/AppText';
import api from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import { Radius, Shadows, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import PageHeader from '../../components/PageHeader';
import Screen from '../../components/Screen';
import Colors from '../../constants/colors';
import Field from '../../components/ProfileField';
import GenderPicker from '../../components/GenderPicker';

const IMAGE_BASE = 'http://10.0.2.2:8080';

function getInitials(name: string, email: string): string {
  const src = name || email || '?';
  return src
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('');
}

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const saveAnim = useRef(new Animated.Value(1)).current;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarImage, setAvatarImage] = useState<any>(null);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [gender, setGender] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    age: '',
    instagram: '',
    twitter: '',
  });

  const set = (key: keyof typeof form) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    api
      .get('/auth/me')
      .then(res => {
        const u = res.data;
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          bio: u.bio || '',
          city: u.city || '',
          age: u.age != null ? String(u.age) : '',
          instagram: u.instagram || '',
          twitter: u.twitter || '',
        });
        setGender(u.gender || '');
        if (u.avatar_url) setAvatarURL(`${IMAGE_BASE}${u.avatar_url}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const pickAvatar = () => {
    Alert.alert('Profile Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: () =>
          launchCamera({ mediaType: 'photo', saveToPhotos: false }, r => {
            if (r.assets?.length) setAvatarImage(r.assets[0]);
          }),
      },
      {
        text: 'Photo Library',
        onPress: () =>
          launchImageLibrary({ mediaType: 'photo' }, r => {
            if (r.assets?.length) setAvatarImage(r.assets[0]);
          }),
      },
      {
        text: 'Remove Photo',
        style: 'destructive',
        onPress: () => {
          setAvatarImage(null);
          setAvatarURL(null);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const save = async () => {
    if (!form.name.trim()) {
      Alert.alert('Name required', 'Please enter your display name.');
      return;
    }
    if (form.age) {
      const n = parseInt(form.age, 10);
      if (isNaN(n) || n < 13 || n > 120) {
        Alert.alert(
          'Invalid age',
          'Please enter a valid age between 13 and 120.',
        );
        return;
      }
    }

    setSaving(true);
    Animated.sequence([
      Animated.timing(saveAnim, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(saveAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('phone', form.phone);
      data.append('bio', form.bio);
      data.append('city', form.city);
      data.append('instagram', form.instagram);
      data.append('twitter', form.twitter);
      if (gender) data.append('gender', gender);
      if (form.age) data.append('age', form.age);

      if (avatarImage) {
        data.append('avatar', {
          uri: avatarImage.uri,
          type: avatarImage.type || 'image/jpeg',
          name: avatarImage.fileName || 'avatar.jpg',
        } as any);
      }

      await api.patch('/auth/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigation.goBack();
    } catch (err: any) {
      console.log('SAVE PROFILE ERROR', err.response?.data);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const avatarSource = avatarImage?.uri || avatarURL;
  const initials = getInitials(form.name, form.email);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardCont}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    >
      <Screen>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

        <PageHeader
          title="Edit Profile"
          rightComponent={
            <Animated.View style={{ transform: [{ scale: saveAnim }] }}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={save}
                activeOpacity={0.85}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <AppText style={styles.saveBtnText}>Save</AppText>
                )}
              </TouchableOpacity>
            </Animated.View>
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={pickAvatar}
              activeOpacity={0.85}
            >
              {avatarSource ? (
                <Image
                  source={{ uri: avatarSource }}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <AppText style={styles.avatarInitials}>{initials}</AppText>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <AppText style={styles.avatarHint}>Tap to change photo</AppText>
          </View>

          <AppText style={styles.sectionLabel}>Personal Info</AppText>
          <Field
            label="Display Name"
            value={form.name}
            onChange={set('name')}
            placeholder="How should we call you?"
            icon="person-outline"
          />
          <Field
            label="Email"
            value={form.email}
            onChange={() => {}}
            placeholder="your@email.com"
            icon="mail-outline"
            editable={false}
          />
          <Field
            label="Phone"
            value={form.phone}
            onChange={set('phone')}
            placeholder="e.g. 98765 43210"
            icon="call-outline"
            keyboardType="phone-pad"
          />
          <Field
            label="City"
            value={form.city}
            onChange={set('city')}
            placeholder="Where are you based?"
            icon="location-outline"
          />
          <Field
            label="Age"
            value={form.age}
            onChange={v => set('age')(v.replace(/[^0-9]/g, '').slice(0, 3))}
            placeholder="e.g. 24"
            icon="calendar-number-outline"
            keyboardType="numeric"
          />
          <GenderPicker value={gender} onChange={setGender} />
          <Field
            label="Bio"
            value={form.bio}
            onChange={set('bio')}
            placeholder="Tell people a little about yourself..."
            icon="document-text-outline"
            multiline
          />

          <TouchableOpacity
            style={styles.bottomSaveBtn}
            onPress={save}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator
                color={Colors.light.tertiaryText}
                size="small"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={Colors.light.tertiaryText}
                />
                <AppText style={styles.bottomSaveBtnText}>Save Changes</AppText>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardCont: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    minWidth: 64,
    alignItems: 'center',
    ...Shadows.card,
  },
  saveBtnText: { color: Colors.light.tertiaryText, fontWeight: '800' },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.lg },
  avatarWrap: { position: 'relative', width: 96, height: 96 },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: Radius.pill,
    borderWidth: 3,
    borderColor: Colors.light.border,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light.border,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.light.tertiaryText,
    letterSpacing: 1,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryText,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Colors.light.border,
  },
  avatarHint: {
    marginTop: Spacing.md,
    fontSize: 12,
    color: Colors.light.secondaryText,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.secondaryText,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    marginLeft: Spacing.xs,
  },
  bottomSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  bottomSaveBtnText: {
    color: Colors.light.tertiaryText,
    fontSize: 15,
    fontWeight: '800',
  },
});
