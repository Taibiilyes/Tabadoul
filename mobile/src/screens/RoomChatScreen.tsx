import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { getToken } from '../api/client';

const WS_URL = Constants.expoConfig?.extra?.wsUrl || 'http://localhost:3000';

export default function RoomChatScreen({ route, navigation }: any) {
  const { roomId, title } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    navigation.setOptions({ title });

    (async () => {
      const token = await getToken();
      const socket = io(WS_URL, { auth: { token } });
      socketRef.current = socket;

      socket.on('connect', () => socket.emit('room:join', { roomId }));
      socket.on('message:new', (msg) =>
        setMessages((prev) => [...prev, msg]),
      );
    })();

    return () => {
      socketRef.current?.emit('room:leave', { roomId });
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  function sendMessage() {
    if (!text.trim()) return;
    socketRef.current?.emit('message:send', { roomId, text });
    setText('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.callBar}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => navigation.navigate('Call', { roomId, video: false })}
        >
          <Text style={styles.callBtnText}>📞 مكالمة صوتية</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => navigation.navigate('Call', { roomId, video: true })}
        >
          <Text style={styles.callBtnText}>🎥 مكالمة فيديو</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>إرسال</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="اكتب رسالة..."
          placeholderTextColor="#9FB3D9"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1D3A' },
  callBar: { flexDirection: 'row', gap: 10, padding: 12 },
  callBtn: { flex: 1, backgroundColor: '#132A52', padding: 10, borderRadius: 10, alignItems: 'center' },
  callBtnText: { color: '#fff' },
  messageBubble: {
    backgroundColor: '#132A52',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  messageText: { color: '#fff', textAlign: 'right' },
  inputRow: { flexDirection: 'row-reverse', padding: 12, gap: 10 },
  input: { flex: 1, backgroundColor: '#132A52', color: '#fff', borderRadius: 12, padding: 12, textAlign: 'right' },
  sendBtn: { backgroundColor: '#FFD700', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 12 },
  sendBtnText: { color: '#0B1D3A', fontWeight: '700' },
});
