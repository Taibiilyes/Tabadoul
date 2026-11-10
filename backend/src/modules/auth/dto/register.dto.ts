import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Gender } from '../../../entities/user.entity';

export class RegisterDto {
  // على الأقل أحد الحقلين (الهاتف أو الإيميل) إجباري - يُتحقّق منه في الخدمة (service)
  @ValidateIf((o) => !o.email)
  @IsPhoneNumber(undefined, { message: 'رقم الهاتف غير صالح' })
  phoneNumber?: string;

  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email?: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 خانات على الأقل' })
  password: string;

  @IsEnum(Gender, { message: 'يجب اختيار الجنس' })
  gender: Gender;

  // إقرار صريح من المستخدم بأنه بالغ 18 عامًا على الأقل وقت التسجيل
  // (التأكيد الفعلي والنهائي يتم لاحقًا عبر وثيقة الهوية أثناء التوثيق)
  @IsString()
  ageConfirmation: 'true';
}
