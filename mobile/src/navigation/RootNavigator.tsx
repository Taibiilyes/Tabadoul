import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import KycUploadScreen from '../screens/KycUploadScreen';
import RoomsListScreen from '../screens/RoomsListScreen';
import RoomChatScreen from '../screens/RoomChatScreen';
import CallScreen from '../screens/CallScreen';
import WalletScreen from '../screens/WalletScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null; // يمكن استبداله بشاشة تحميل (splash) مخصصة

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0B1D3A' },
          headerTintColor: '#FFD700',
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Rooms" component={RoomsListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="KycUpload" component={KycUploadScreen} options={{ title: 'توثيق الحساب' }} />
            <Stack.Screen name="RoomChat" component={RoomChatScreen} />
            <Stack.Screen name="Call" component={CallScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'المحفظة' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
