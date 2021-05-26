// src/app/auth/token.interceptor.ts
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public oauthService: OAuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!request.url.startsWith(environment.AUTH_SERVER_HOST_AND_PORT)) {
            if (this.oauthService.hasValidAccessToken()) {
                request = request.clone({
                    setHeaders: { Authorization: `Bearer ${this.oauthService.getAccessToken()}` }
                });
                return next.handle(request);
            } else {
                return Observable.throw('Token Expired');
            }
        } else {
            return next.handle(request);
        }
    }
}
