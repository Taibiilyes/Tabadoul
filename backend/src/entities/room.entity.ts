import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum RoomStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  BANNED = 'banned', // أغلقها المسير بسبب مخالفة
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.ownedRooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.ACTIVE })
  status: RoomStatus;

  // تكلفة إنشاء الغرفة (100 عملة)، تُسجَّل هنا للمرجعية
  @Column({ default: 100 })
  creationCost: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  closedAt: Date;
}
