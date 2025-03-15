import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Profile } from 'passport-github2';

import { AuthProvider, ProviderUser } from 'src/common/types/provider-user.type';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || '',
      scope: ['user:email'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): ProviderUser {
    const user = {
      email: profile.emails?.[0].value || '',
      firstName: profile.displayName.split(' ')[0] || '',
      lastName: profile.displayName.split(' ')[1] || '',
      photo: profile.photos?.[0]?.value || '',
      provider: profile.provider as AuthProvider,
    };

    return user;
  }
}
