// ============================================================
// Auth Types - Shared between client and server
// ============================================================

export interface ILoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IAuthResponse {
  user: import('./user.types').IUser;
  tokens: IAuthTokens;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}
