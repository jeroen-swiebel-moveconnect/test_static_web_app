import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc';
import { AuthService } from './auth.service';
import { authConfig } from '../../environments/environment';

// works only on localhost, redirect to custom github page is not allowed

@NgModule({
  imports: [OAuthModule.forRoot({
    resourceServer: {
      allowedUrls: ['localhost'],
      sendAccessToken: true
    }
  })],
  providers: [
    AuthService,
    { provide: AuthConfig, useValue: authConfig },
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.initAuth(),
      deps: [AuthService],
      multi: true
    },
  ],
})
export class AuthModule { }
