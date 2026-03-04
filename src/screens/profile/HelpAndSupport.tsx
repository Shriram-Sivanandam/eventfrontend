import React from 'react';
import { View, StyleSheet, ScrollView, Linking, StatusBar } from 'react-native';
import AppText from '../../components/AppText';
import { Radius, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FAQRow from '../../components/FAQRow';
import Colors from '../../constants/colors';
import InfoRow from '../../components/InfoRow';

function SectionLabel({ label }: { label: string }) {
  return <AppText style={sh.sectionLabel}>{label}</AppText>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={sh.card}>{children}</View>;
}

function Divider() {
  return <View style={sh.divider} />;
}

const sh = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C4BAB0',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    marginLeft: 4,
    marginTop: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1A0A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EBE3',
    marginLeft: Spacing.md,
  },
});

const FAQ_ITEMS = [
  {
    q: 'How do I create an event?',
    a: 'Tap the "+" button at the bottom right corner on the home screen. Fill in your event details across three steps basics, location, and timing then tap "Create Event".',
  },
  {
    q: 'Can I edit my event after publishing?',
    a: 'Yes. Go to Profile → My Events, tap the event, and select Edit. Changes are reflected immediately for all registered attendees.',
  },
  {
    q: 'How do attendees pay for paid events?',
    a: 'Payment is currently handled offline between the host and attendees. In-app payments are coming soon.',
  },
  {
    q: 'How do I cancel my registration?',
    a: 'Open the event from Profile → Registered Events and tap "Cancel Registration". The host will be notified.',
  },
  {
    q: 'What is the capacity limit for events?',
    a: 'There is no platform-imposed limit. Hosts set their own capacity when creating an event, and registrations close once the limit is reached.',
  },
  {
    q: 'Is my location shared with other users?',
    a: 'Your location is never shared automatically. Hosts choose how much address detail to display on their events.',
  },
];

export default function HelpSupportScreen() {
  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Help & Support"
          subtitle="FAQs and ways to reach us."
        />

        <View style={styles.bannerWrap}>
          <View style={styles.banner}>
            <Ionicons name="sparkles" size={20} color={Colors.light.primary} />
            <View>
              <AppText style={styles.bannerTitle}>
                Need something specific?
              </AppText>
              <AppText style={styles.bannerSub}>
                Email us and we'll get back within 24 hours.
              </AppText>
            </View>
          </View>
        </View>

        <SectionLabel label="Frequently Asked Questions" />
        <Card>
          {FAQ_ITEMS.map((item, i) => (
            <React.Fragment key={i}>
              <FAQRow question={item.q} answer={item.a} />
              {i < FAQ_ITEMS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card>

        <SectionLabel label="Contact Us" />
        <Card>
          <InfoRow
            icon="mail-outline"
            accent="#FF6B35"
            onPress={() => Linking.openURL('mailto:support@yourapp.com')}
          >
            <AppText variant="body" fontWeight="bold" style={styles.label}>
              Email Support
            </AppText>
            <AppText variant="caption" style={styles.value}>
              support@yourapp.com
            </AppText>
          </InfoRow>
          <Divider />
          <InfoRow
            icon="logo-instagram"
            accent="#E63946"
            onPress={() => Linking.openURL('https://instagram.com/yourapp')}
          >
            <AppText variant="body" fontWeight="bold" style={styles.label}>
              Instagram
            </AppText>
            <AppText variant="caption" style={styles.value}>
              @yourapp
            </AppText>
          </InfoRow>
          <Divider />
          <InfoRow
            icon="logo-whatsapp"
            accent="#2EC4B6"
            onPress={() => Linking.openURL('https://wa.me/yourlink')}
          >
            <AppText variant="body" fontWeight="bold" style={styles.label}>
              WhatsApp
            </AppText>
            <AppText variant="caption" style={styles.value}>
              Text us on WhatsApp
            </AppText>
          </InfoRow>
        </Card>

        <SectionLabel label="Legal" />

        <Card>
          <InfoRow
            icon="document-text-outline"
            accent="#8338EC"
            onPress={() => Linking.openURL('https://yourapp.com/terms')}
          >
            <AppText variant="body" fontWeight="bold" style={styles.label}>
              Terms of Service
            </AppText>
            <AppText variant="caption" style={styles.value}>
              Last updated Jan 2025
            </AppText>
          </InfoRow>
          <Divider />
          <InfoRow
            icon="shield-outline"
            accent="#8338EC"
            onPress={() => Linking.openURL('https://yourapp.com/privacy')}
          >
            <AppText variant="body" fontWeight="bold" style={styles.label}>
              Privacy Policy
            </AppText>
            <AppText variant="caption" style={styles.value}>
              How we handle your data
            </AppText>
          </InfoRow>
        </Card>

        <View style={styles.appInfoWrap}>
          <View style={styles.appLogoCircle}>
            <Ionicons name="calendar" size={26} color={Colors.light.primary} />
          </View>
          <AppText style={styles.appName}>YourApp</AppText>
          <AppText style={styles.appVersion}>Version 1.0.0</AppText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerWrap: {
    marginBottom: Spacing.xs,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FF6B3512',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FF6B3530',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    marginTop: Spacing.xs,
  },
  appInfoWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  appLogoCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: '#FF6B3515',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: 16,
    fontWeight: '900',
  },
  appVersion: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: 14,
    color: Colors.light.primaryText,
  },
  value: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    marginTop: Spacing.xs,
  },
});
