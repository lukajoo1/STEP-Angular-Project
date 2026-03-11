export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type UserRole = 'default' | 'admin';

export interface EverrestUser {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  address: string;
  role: UserRole;
  zipcode: string;
  avatar: string;
  gender: Gender;
  phone: string;
  verified: boolean;
}

export interface EverrestCurrentUser extends EverrestUser {
  iat: number;
  exp: number;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  address: string;
  phone: string;
  zipcode: string;
  avatar: string;
  gender: Gender;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface VerifyEmailRequest {
  email: string;
}

export interface VerifyEmailResponse {
  status: number;
  message: string;
}

