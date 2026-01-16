import { IsNotEmpty,IsEmail, IsString } from "@nestjs/class-validator";

export class LoginDto {
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
