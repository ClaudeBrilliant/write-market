import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';

enum NotificationPreference {
  ALL = 'ALL',
  IMPORTANT = 'IMPORTANT',
  NONE = 'NONE',
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsEnum(NotificationPreference)
  notificationLevel?: NotificationPreference;

  @IsOptional()
  @IsBoolean()
  bidNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  taskNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;
}
