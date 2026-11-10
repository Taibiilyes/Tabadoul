import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      await login(identifier, password, isEmail);
      navigation.replace('Rooms');
    } catch (e: any) {
      Alert.alert('فشل تسجيل الدخول', e.response?.data?.message || 'تحقق من بياناتك');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تسجيل الدخول</Text>
      <TextInput
        style={styles.input}
        placeholder="رقم الهاتف أو البريد الإلكتروني"
        autoCapitalize="none"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <TextInput
        style={styles.input}
        placeholder="كلمة المرور"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
        <Text style={styles.primaryBtnText}>{loading ? '...' : 'دخول'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>ليس لديك حساب؟ سجّل الآن</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 120, backgroundColor: '#0B1D3A' },
  title: { fontSize: 28, fontWeight: '700', color: '#FFD700', marginBottom: 32, textAlign: 'center' },
  input: {
    backgroundColor: '#132A52',
    color: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    textAlign: 'right',
  },
  primaryBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#0B1D3A', fontWeight: '700', fontSize: 16 },
  link: { color: '#9FB3D9', textAlign: 'center', marginTop: 20 },
});
