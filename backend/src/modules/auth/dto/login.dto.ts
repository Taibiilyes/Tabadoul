import { IsString, ValidateIf } from 'class-validator';

export class LoginDto {
  @ValidateIf((o) => !o.email)
  phoneNumber?: string;

  @ValidateIf((o) => !o.phoneNumber)
  email?: string;

  @IsString()
  password: string;
}
