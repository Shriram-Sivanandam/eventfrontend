# Spotlight — Frontend

React Native mobile app for Spotlight, a community events platform that lets anyone host and discover local events. Available on Android.

---

## Tech Stack

| Technology                     | Purpose                            |
| ------------------------------ | ---------------------------------- |
| React Native 0.82              | Cross-platform mobile framework    |
| TypeScript                     | Type safety                        |
| React Navigation               | Screen navigation                  |
| Axios                          | API client                         |
| Firebase Messaging             | Push notifications                 |
| Firebase Auth                  | Sign in with custom token (chat)   |
| Firebase Realtime Database     | Real-time event chat               |
| AsyncStorage                   | Local token and preference storage |
| react-native-bootsplash        | Splash screen                      |
| react-native-safe-area-context | Safe area insets                   |
| react-native-vector-icons      | Ionicons icon set                  |

---

## Features

- **Passwordless auth** — email OTP login, no passwords
- **Events feed** — browse events by city, tags, search
- **Host events** — 3-step event creation wizard with image upload
- **Registration flow** — join events, host accepts/rejects attendees
- **Event chat** — real-time Firebase chat for accepted attendees
- **Two-way ratings** — rate hosts and attendees after events
- **Push notifications** — registration updates, reminders, chat messages
- **Onboarding** — 7-step profile setup on first login
- **Account management** — edit profile, notification preferences, delete account

---

## Project Structure

```
eventfrontend/
├── android/                     # Android native code
├── ios/                         # iOS native code
├── src/
│   ├── api/
│   │   └── client.ts            # Axios instance with auth interceptor
│   ├── components/              # Reusable UI components
│   │   ├── AppText.tsx
│   │   ├── Field.tsx
│   │   ├── Screen.tsx
│   │   ├── EventCard.tsx
│   │   ├── RatingModal.tsx
│   │   └── ...
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── layout.ts
│   │   └── firebase.ts          # Firebase Realtime DB URL
│   ├── context/
│   │   └── AuthContext.tsx      # Global auth state
│   ├── hooks/
│   │   ├── useEventChat.ts      # Firebase chat hook
│   │   ├── useNotifications.ts  # FCM notifications hook
│   │   ├── useNotificationPermission.ts
│   │   └── useBehavior.ts       # Keyboard behavior hook
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   └── EventsStack.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── EmailScreen.tsx
│   │   │   ├── OtpScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   └── events/
│   │       ├── EventsScreen.tsx
│   │       ├── EventDetailsScreen.tsx
│   │       ├── CreateEventScreen.tsx
│   │       ├── EventDashboardScreen.tsx
│   │       ├── EventChatScreen.tsx
│   │       ├── ChatListScreen.tsx
│   │       ├── RegisteredEventsScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       ├── EditProfileScreen.tsx
│   │       └── AccountScreen.tsx
│   └── utils/
│       └── notificationPreferences.ts
├── index.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)
- JDK 21

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/Shriram-Sivanandam/eventfrontend.git
cd eventfrontend
```

2. **Install dependencies**

```bash
npm install
cd ios && pod install && cd ..
```

3. **Add `google-services.json`**

Download from Firebase Console → Project Settings → Your Android app and place at:

```
android/app/google-services.json
```

4. **Update API URL**

In `src/api/client.ts`, set your local machine's IP:

```ts
const BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:8080'
  : 'https://api.spotlightinfo.in';
```

5. **Run the app**

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

---

## Environment Configuration

The app uses `__DEV__` to switch between local and production:

| Environment       | API URL                                       |
| ----------------- | --------------------------------------------- |
| Local development | `http://YOUR_LOCAL_IP:8080`                   |
| Staging           | `https://eventbackend-staging.up.railway.app` |
| Production        | `https://api.spotlightinfo.in`                |

---

## Key Design Decisions

**Auth flow:**
Email → OTP → JWT stored in AsyncStorage → attached to every API request via Axios interceptor

**Chat:**
Firebase Realtime Database with custom token auth — backend issues a Firebase custom token after verifying the user is an accepted attendee

**Notifications:**
FCM via `@react-native-firebase/messaging` — permission requested once after onboarding with a pre-permission explanation modal. Per-type preferences stored in AsyncStorage.

**Images:**
Stored on Cloudflare R2, full absolute URL returned from the API — no base URL prefix needed on the frontend.

**Safe areas:**
`react-native-safe-area-context` with dynamic insets — keyboard open/close tracked via Keyboard listeners to conditionally apply bottom padding.

---

## Distribution

- **Play Store:** Available on Google Play (closed testing)
- **Direct install:** Share `app-release.apk` for sideloading

---

## License

MIT
