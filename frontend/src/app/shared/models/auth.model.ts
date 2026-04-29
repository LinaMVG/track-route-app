export type UserRole = 'ADMIN' | 'OPERADOR';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface LoginResponse  {
  success: boolean;
  data:{
    accessToken: string;
    expiresIn: string;
    user: AuthUser;
  };
}

export interface ApiError{
  success: false;
  error:{
    code:string;
    message:string;
    details?: unknown;
  };
  correlationId: string;
}
