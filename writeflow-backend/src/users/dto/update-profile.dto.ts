import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName?: string;

  @IsPhoneNumber()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Location must not exceed 100 characters' })
  location?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  website?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid LinkedIn URL' })
  linkedIn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Education must not exceed 100 characters' })
  education?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Skills must not exceed 1000 characters' })
  skills?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Timezone must not exceed 50 characters' })
  timezone?: string;
}