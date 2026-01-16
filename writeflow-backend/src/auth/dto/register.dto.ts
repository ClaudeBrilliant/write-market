import { PartialType } from '@nestjs/mapped-types';
import {  LoginDto } from './login.dto';
import {  IsNotEmpty, IsString, IsPhoneNumber, IsOptional, IsEnum, IsEmail, isEnum, MinLength} from 'class-validator';
import { AccountStatus, Role } from '@prisma/client'

export class RegisterDto extends PartialType(LoginDto) {

    @IsEmail()
    email: string

    @IsString()
    @MinLength(8)
    password: string;

    @IsNotEmpty()
    @IsString()
    firstName:string;

    @IsNotEmpty()
    @IsString()
    lastName:string;

    @IsPhoneNumber()
    @IsOptional()
    phone: string;

    @IsOptional()
     @IsEnum(Role)
     role: Role;

   

    
}
