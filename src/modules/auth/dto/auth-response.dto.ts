// src/modules/auth/dto/auth-response.dto.ts
import { User } from '../../../models/mysql/user.entity';

export interface AuthResponse {
  user: Partial<User>;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
