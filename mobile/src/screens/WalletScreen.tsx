import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const PACKAGES = [100, 300, 500, 1000];

export default function WalletScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.get('/wallet/history').then((res) => setHistory(res.data)).catch(() => {});
    }, []),
  );

  async function buyPackage(coins: number) {
    // ينشئ جلسة دفع لدى مزود مرخّص (Chargily/CIB/Stripe) ويحوّل المستخدم لصفحة الدفع الخاصة به
    const { data } = await api.post('/wallet/purchase/checkout', { packageCoins: coins });
    // TODO: افتح data.checkoutUrl عبر WebBrowser.openBrowserAsync بعد ربط مزود دفع حقيقي
    console.log('Checkout session:', data);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.balanceLabel}>رصيدك الحالي</Text>
      <Text style={styles.balance}>{user?.coinBalance ?? 0} 🪙</Text>

      <Text style={styles.sectionTitle}>شراء عملات ذهبية</Text>
      <View style={styles.packagesRow}>
        {PACKAGES.map((coins) => (
          <TouchableOpacity key={coins} style={styles.packageCard} onPress={() => buyPackage(coins)}>
            <Text style={styles.packageCoins}>{coins} 🪙</Text>
            <Text style={styles.packagePrice}>{((coins / 100) * 3.99).toFixed(2)}$</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>سجل الحركات</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <Text style={[styles.txAmount, { color: item.amount >= 0 ? '#4CAF50' : '#E53935' }]}>
              {item.amount >= 0 ? '+' : ''}{item.amount}
            </Text>
            <Text style={styles.txNote}>{item.note}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1D3A', padding: 20, paddingTop: 60 },
  balanceLabel: { color: '#9FB3D9', textAlign: 'center' },
  balance: { color: '#FFD700', fontSize: 42, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'right' },
  packagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  packageCard: { backgroundColor: '#132A52', padding: 16, borderRadius: 12, width: '47%', alignItems: 'center' },
  packageCoins: { color: '#FFD700', fontSize: 18, fontWeight: '700' },
  packagePrice: { color: '#9FB3D9', marginTop: 4 },
  txRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#132A52' },
  txAmount: { fontWeight: '700' },
  txNote: { color: '#9FB3D9', flex: 1, textAlign: 'right', marginRight: 10 },
});
