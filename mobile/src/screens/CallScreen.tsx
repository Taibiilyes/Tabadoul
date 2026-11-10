import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RTCPeerConnection, RTCView, mediaDevices } from 'react-native-webrtc';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { getToken, api } from '../api/client';

const WS_URL = Constants.expoConfig?.extra?.wsUrl || 'http://localhost:3000';

/**
 * إشارات WebRTC (signaling) تمر عبر ChatGateway في الـ backend.
 * الوسائط نفسها (الصوت/الفيديو) تنتقل مباشرة (P2P) بين الطرفين.
 * لعدد كبير من المستخدمين متزامنين، استبدل هذا بخادم SFU (مثل LiveKit).
 */
export default function CallScreen({ route, navigation }: any) {
  const { roomId, video } = route.params;
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [seconds, setSeconds] = useState(0);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: video ? { facingMode: 'user' } : false,
      });
      if (!mounted) return;
      setLocalStream(stream);

      const token = await getToken();
      const socket = io(WS_URL, { auth: { token } });
      socketRef.current = socket;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

      pc.ontrack = (event: any) => setRemoteStream(event.streams[0]);

      socket.on('call:offer', async ({ fromUserId, sdp }) => {
        await pc.setRemoteDescription(sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('call:answer', { toUserId: fromUserId, sdp: answer });
      });

      socket.on('call:answer', async ({ sdp }) => {
        await pc.setRemoteDescription(sdp);
      });

      socket.on('call:iceCandidate', async ({ candidate }) => {
        if (candidate) await pc.addIceCandidate(candidate);
      });

      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    })();

    return () => {
      mounted = false;
      clearInterval(timerRef.current);
      localStream?.getTracks().forEach((t: any) => t.stop());
      pcRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, []);

  async function endCall() {
    clearInterval(timerRef.current);
    try {
      // خصم التكلفة الفعلية بناءً على مدة المكالمة الحقيقية (تُحتسب في الخادم)
      await api.post('/wallet/charge-call', { durationSeconds: seconds });
    } catch {}
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      {remoteStream ? (
        <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} objectFit="cover" />
      ) : (
        <View style={styles.waiting}>
          <Text style={styles.waitingText}>بانتظار الطرف الآخر...</Text>
        </View>
      )}

      {video && localStream && (
        <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" zOrder={1} />
      )}

      <View style={styles.controls}>
        <Text style={styles.timer}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</Text>
        <TouchableOpacity style={styles.endBtn} onPress={endCall}>
          <Text style={styles.endBtnText}>إنهاء المكالمة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  remoteVideo: { flex: 1 },
  localVideo: { width: 110, height: 150, position: 'absolute', top: 60, left: 16, borderRadius: 12 },
  waiting: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  waitingText: { color: '#fff', fontSize: 16 },
  controls: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  timer: { color: '#fff', fontSize: 18, marginBottom: 16 },
  endBtn: { backgroundColor: '#E53935', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
  endBtnText: { color: '#fff', fontWeight: '700' },
});
