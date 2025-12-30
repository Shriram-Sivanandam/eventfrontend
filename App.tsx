import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Screen from './src/components/Screen';
import AppText from './src/components/AppText';
import AppInput from './src/components/AppInput';
import AppButton from './src/components/AppButton';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  return (
    <Screen>
      <AppText variant="title">Welcome</AppText>
      <AppText variant="caption">Build something awesome.</AppText>

      <AppInput placeholder="Email" />
      <AppButton title="Continue" onPress={() => {}} />
    </Screen>
  );
}

export default App;
