import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { ActivityProvider } from '../contexts/ActivityContext';
import { ChatProvider } from '../contexts/ChatContext';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <View style={styles.outer}>
      <View style={styles.phone}>
        <AuthProvider>
          <ActivityProvider>
            <ChatProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="activity/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="activity/create" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
                <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="activity/review/[id]" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
              </Stack>
            </ChatProvider>
          </ActivityProvider>
        </AuthProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    flex: 1,
    maxWidth: 420,
    width: '100%',
    backgroundColor: Colors.bg,
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    } as any),
  },
});
