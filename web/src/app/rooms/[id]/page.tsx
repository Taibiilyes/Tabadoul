'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Header from '../../../components/Header';
import { api, getToken } from '../../../lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

export default function RoomPage() {
  const { id: roomId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [inCall, setInCall] = useState(false);
  const [videoCall, setVideoCall] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const socket = io(WS_URL, { auth: { token: getToken() } });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('room:join', { roomId }));
    socket.on('message:new', (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.emit('room:leave', { roomId });
      socket.disconnect();
    };
  }, [roomId]);

  function sendMessage() {
    if (!text.trim()) return;
    socketRef.current?.emit('message:send', { roomId, text });
    setText('');
  }

  async function startCall(video: boolean) {
    setVideoCall(video);
    setInCall(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    const socket = socketRef.current!;
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('call:iceCandidate', { toUserId: roomId, candidate: e.candidate });
    };

    socket.on('call:offer', async ({ fromUserId, sdp }) => {
      await pc.setRemoteDescription(sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { toUserId: fromUserId, sdp: answer });
    });
    socket.on('call:answer', async ({ sdp }) => pc.setRemoteDescription(sdp));
    socket.on('call:iceCandidate', async ({ candidate }) => {
      if (candidate) await pc.addIceCandidate(candidate);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('call:offer', { toUserId: roomId, sdp: offer });

    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  async function endCall() {
    clearInterval(timerRef.current);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    try {
      await api.chargeCall(seconds);
    } catch {}
    setInCall(false);
    setSeconds(0);
  }

  return (
    <div>
      <Header />
      <div className="container" style={{ maxWidth: 700 }}>
        {inCall ? (
          <div className="card">
            <div style={{ display: 'flex', gap: 12 }}>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ flex: 1, display: videoCall ? 'block' : 'none' }} />
              <video ref={localVideoRef} autoPlay playsInline muted style={{ width: 120, display: videoCall ? 'block' : 'none' }} />
            </div>
            <p style={{ textAlign: 'center', marginTop: 12 }}>
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
            </p>
            <button className="btn btn-danger" style={{ width: '100%' }} onClick={endCall}>
              إنهاء المكالمة
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => startCall(false)}>
              📞 مكالمة صوتية
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => startCall(true)}>
              🎥 مكالمة فيديو
            </button>
          </div>
        )}

        <div className="card chat-box">
          {messages.map((m, i) => (
            <div key={i} className="bubble">
              {m.text}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <input
            className="input"
            style={{ marginBottom: 0 }}
            placeholder="اكتب رسالة..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="btn" onClick={sendMessage}>
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
