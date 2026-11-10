import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, VerificationStatus } from '../../entities/user.entity';
import {
  WalletTransaction,
  TransactionType,
} from '../../entities/wallet-transaction.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

const SIGNUP_BONUS = parseInt(process.env.SIGNUP_BONUS_COINS || '10', 10);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private dataSource: DataSource,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.phoneNumber && !dto.email) {
      throw new BadRequestException(
        'يجب إدخال رقم الهاتف أو البريد الإلكتروني',
      );
    }

    if (dto.ageConfirmation !== 'true') {
      throw new BadRequestException(
        'يجب تأكيد أنك بالغ 18 عامًا على الأقل للتسجيل',
      );
    }

    const existing = await this.usersRepo.findOne({
      where: dto.phoneNumber
        ? { phoneNumber: dto.phoneNumber }
        : { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('هذا الحساب مسجّل مسبقًا');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // التسجيل + منح المكافأة الأولية يتمّان ضمن معاملة قاعدة بيانات واحدة (DB transaction)
    // لضمان عدم وجود حالة يُنشأ فيها مستخدم بدون رصيد ابتدائي صحيح، أو العكس
    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        passwordHash,
        gender: dto.gender,
        verificationStatus: VerificationStatus.UNVERIFIED,
        coinBalance: SIGNUP_BONUS,
      });
      const saved = await manager.save(user);

      const tx = manager.create(WalletTransaction, {
        userId: saved.id,
        type: TransactionType.SIGNUP_BONUS,
        amount: SIGNUP_BONUS,
        balanceAfter: SIGNUP_BONUS,
        note: 'مكافأة التسجيل الأولى',
      });
      await manager.save(tx);

      const token = this.signToken(saved);

      // إرسال بريد ترحيبي فقط إذا سجّل المستخدم بالإيميل (لا يوجد بريد لإرساله عند التسجيل بالهاتف)
      if (saved.email) {
        this.mailService.sendWelcomeEmail(saved.email).catch(() => {});
      }

      return { user: this.sanitize(saved), token };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where(
        dto.phoneNumber
          ? 'user.phoneNumber = :identifier'
          : 'user.email = :identifier',
        { identifier: dto.phoneNumber || dto.email },
      )
      .getOne();

    if (!user) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

    if (user.isBanned) {
      throw new UnauthorizedException('هذا الحساب محظور');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

    const token = this.signToken(user);
    return { user: this.sanitize(user), token };
  }

  private signToken(user: User) {
    return this.jwtService.sign({
      sub: user.id,
      role: user.role,
      verificationStatus: user.verificationStatus,
    });
  }

  private sanitize(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
