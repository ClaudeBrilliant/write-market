// src/users/interface/user.interface.ts
import { Role, AccountStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';


export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role: Role;
  status: AccountStatus;
  isActive: boolean; 
  walletBalance?: Decimal;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}