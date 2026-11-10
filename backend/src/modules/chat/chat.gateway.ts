import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * دردشة نصية فورية داخل الغرف، بالإضافة إلى إشارات WebRTC (signaling)
 * لبدء مكالمات صوتية/مرئية مباشرة بين شخصين.
 *
 * ملاحظة: لتوسيع هذا لعدد كبير من المستخدمين، الوسائط الفعلية (الصوت/الفيديو)
 * يجب أن تمر عبر خادم SFU مخصص (مثل LiveKit) وليس عبر هذا الـ Gateway،
 * الذي يُستخدم فقط لتبادل رسائل الإشارة (signaling messages) القصيرة.
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // يمكن هنا تحديث حالة "غير متصل" للمستخدم إذا لزم
  }

  @SubscribeMessage('room:join')
  onJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(data.roomId);
    client.to(data.roomId).emit('room:userJoined', {
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('room:leave')
  onLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    client.to(data.roomId).emit('room:userLeft', {
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('message:send')
  onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; text: string },
  ) {
    // TODO: قبل البث، مرّر data.text عبر خدمة فحص محتوى (moderation)
    // لرصد خطاب الكراهية قبل وصول الرسالة لبقية المستخدمين
    this.server.to(data.roomId).emit('message:new', {
      userId: client.data.userId,
      text: data.text,
      at: new Date().toISOString(),
    });
  }

  // === إشارات WebRTC لبدء مكالمة صوتية/مرئية مباشرة بين شخصين ===

  @SubscribeMessage('call:offer')
  onCallOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { toUserId: string; sdp: any },
  ) {
    this.server.to(data.toUserId).emit('call:offer', {
      fromUserId: client.data.userId,
      sdp: data.sdp,
    });
  }

  @SubscribeMessage('call:answer')
  onCallAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { toUserId: string; sdp: any },
  ) {
    this.server.to(data.toUserId).emit('call:answer', {
      fromUserId: client.data.userId,
      sdp: data.sdp,
    });
  }

  @SubscribeMessage('call:iceCandidate')
  onIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { toUserId: string; candidate: any },
  ) {
    this.server.to(data.toUserId).emit('call:iceCandidate', {
      fromUserId: client.data.userId,
      candidate: data.candidate,
    });
  }
}
