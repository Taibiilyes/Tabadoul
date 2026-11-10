import { IsEmail, IsString, MinLength } from 'class-validator';

export class ComplaintDto {
  @IsEmail({}, { message: 'يرجى إدخال بريد إلكتروني صالح للرد عليك' })
  fromEmail: string;

  @IsString()
  @MinLength(3)
  subject: string;

  @IsString()
  @MinLength(10, { message: 'يرجى كتابة تفاصيل كافية عن الشكوى أو الاقتراح' })
  message: string;
}
