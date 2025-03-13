export type AuthProvider = 'google' | 'github';

export interface ProviderUser {
  email: string;
  firstName: string;
  lastName: string;
  photo: string;
  provider: AuthProvider;
}
