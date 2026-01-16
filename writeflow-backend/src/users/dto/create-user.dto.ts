import {AccountStatus, Role} from '@prisma/client'
export class CreateUserDto {
    email:string;
    password:string;
    firstName:string;
    lastName:string;
    phone?:string;
    role?:Role;
    // accountStatus?:AccountStatus
}
