import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [useEmail, setUseEmail] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!identifier || !password) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }
    if (!gender) {
      Alert.alert('خطأ', 'يجب اختيار الجنس');
      return;
    }
    if (!ageConfirmed) {
      Alert.alert('خطأ', 'يجب تأكيد أنك بالغ 18 عامًا على الأقل');
      return;
    }
    setLoading(true);
    try {
      await register({
        [useEmail ? 'email' : 'phoneNumber']: identifier,
        password,
        gender,
        ageConfirmation: 'true',
      });
      navigation.replace('KycUpload');
    } catch (e: any) {
      Alert.alert('فشل التسجيل', e.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>إنشاء حساب</Text>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchBtn, !useEmail && styles.switchBtnActive]}
          onPress={() => setUseEmail(false)}
        >
          <Text style={!useEmail ? styles.switchTextActive : styles.switchText}>
            رقم الهاتف
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchBtn, useEmail && styles.switchBtnActive]}
          onPress={() => setUseEmail(true)}
        >
          <Text style={useEmail ? styles.switchTextActive : styles.switchText}>
            البريد الإلكتروني
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={useEmail ? 'البريد الإلكتروني' : 'رقم الهاتف'}
        keyboardType={useEmail ? 'email-address' : 'phone-pad'}
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

      <Text style={styles.label}>الجنس</Text>
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchBtn, gender === 'male' && styles.switchBtnActive]}
          onPress={() => setGender('male')}
        >
          <Text style={gender === 'male' ? styles.switchTextActive : styles.switchText}>
            ذكر
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchBtn, gender === 'female' && styles.switchBtnActive]}
          onPress={() => setGender('female')}
        >
          <Text style={gender === 'female' ? styles.switchTextActive : styles.switchText}>
            أنثى
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAgeConfirmed(!ageConfirmed)}
      >
        <View style={[styles.checkbox, ageConfirmed && styles.checkboxChecked]} />
        <Text style={styles.checkboxLabel}>
          أؤكد أنني بالغ/ة 18 عامًا على الأقل
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.primaryBtnText}>
          {loading ? 'جارٍ التسجيل...' : 'تسجيل'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>لديك حساب بالفعل؟ سجّل الدخول</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 80, backgroundColor: '#0B1D3A', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFD700', marginBottom: 32, textAlign: 'center' },
  label: { color: '#fff', marginBottom: 8, fontSize: 15 },
  input: {
    backgroundColor: '#132A52',
    color: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    textAlign: 'right',
  },
  switchRow: { flexDirection: 'row', marginBottom: 16, gap: 10 },
  switchBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#132A52',
    alignItems: 'center',
  },
  switchBtnActive: { backgroundColor: '#FFD700' },
  switchText: { color: '#fff' },
  switchTextActive: { color: '#0B1D3A', fontWeight: '700' },
  checkboxRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 24, gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#FFD700' },
  checkboxChecked: { backgroundColor: '#FFD700' },
  checkboxLabel: { color: '#fff', flex: 1, textAlign: 'right' },
  primaryBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 14, alignItems: 'center' },
  primaryBtnText: { color: '#0B1D3A', fontWeight: '700', fontSize: 16 },
  link: { color: '#9FB3D9', textAlign: 'center', marginTop: 20 },
});
