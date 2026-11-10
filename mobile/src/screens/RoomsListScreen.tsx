import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RoomsListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');

  const loadRooms = useCallback(() => {
    api.get('/rooms').then((res) => setRooms(res.data)).catch(() => {});
  }, []);

  useFocusEffect(loadRooms);

  async function createRoom() {
    if (!title.trim()) return;
    try {
      await api.post('/rooms', { title });
      setModalVisible(false);
      setTitle('');
      loadRooms();
    } catch (e: any) {
      Alert.alert('تعذّر إنشاء الغرفة', e.response?.data?.message || 'حدث خطأ');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الغرف النشطة</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Text style={styles.balance}>💰 {user?.coinBalance ?? 0}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomCard}
            onPress={() => navigation.navigate('RoomChat', { roomId: item.id, title: item.title })}
          >
            <Text style={styles.roomTitle}>{item.title}</Text>
            <Text style={styles.roomOwner}>بواسطة: {item.owner?.firstName || 'مستخدم'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد غرف نشطة حاليًا</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ غرفة جديدة (100 عملة)</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.label}>عنوان الغرفة</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={styles.primaryBtn} onPress={createRoom}>
                <Text style={styles.primaryBtnText}>إنشاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: '#22407A' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.primaryBtnText, { color: '#fff' }]}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1D3A' },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 56,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#FFD700' },
  balance: { color: '#fff', fontSize: 16, fontWeight: '600' },
  roomCard: { backgroundColor: '#132A52', padding: 16, borderRadius: 14, marginBottom: 12 },
  roomTitle: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'right' },
  roomOwner: { color: '#9FB3D9', marginTop: 4, textAlign: 'right' },
  empty: { color: '#9FB3D9', textAlign: 'center', marginTop: 40 },
  fab: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 30,
    margin: 20,
    alignItems: 'center',
  },
  fabText: { color: '#0B1D3A', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#132A52', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  label: { color: '#fff', marginBottom: 8, textAlign: 'right' },
  input: { backgroundColor: '#0B1D3A', color: '#fff', borderRadius: 10, padding: 12, textAlign: 'right' },
  primaryBtn: { flex: 1, backgroundColor: '#FFD700', padding: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#0B1D3A', fontWeight: '700' },
});
