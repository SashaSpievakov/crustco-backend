import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

import { ProviderUser } from 'src/common/types/provider-user.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): ProviderUser {
    const user = {
      email: profile.emails?.[0].value || '',
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      photo: profile.photos?.[0].value || '',
      provider: profile.provider,
    };

    return user;
  }
}
