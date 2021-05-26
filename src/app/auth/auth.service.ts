import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService, TokenResponse } from 'angular-oauth2-oidc';
import { JwtHelperService } from '@auth0/angular-jwt';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { CollectionsService } from 'src/app/moveware/services';
import { environment } from '../../environments/environment';
import { CacheService } from 'src/app/moveware/services/cache.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    timerCount: any;
    timerWarning: any;
    private jwtHelper: JwtHelperService = new JwtHelperService();
    private _decodedAccessToken: any;
    private _decodedIDToken: any;

    constructor(
        private oauthService: OAuthService,
        private authConfig: AuthConfig,
        private collectionService: CollectionsService,
        private cacheService: CacheService
    ) {}

    public async initAuth(): Promise<any> {
        return new Promise((resolveFn, rejectFn) => {
            const userLang = navigator.languages ? navigator.languages[0].substring(0, 2) : 'def';
            this.cacheService.setSessionData('language', JSON.stringify({ CodeCode: userLang }));
            this.oauthService.configure(this.authConfig);
            // this.oauthService.setStorage(this.cacheService);
            this.oauthService.tokenValidationHandler = new JwksValidationHandler();
            this.oauthService.postLogoutRedirectUri = environment.UI_ROOT;
            this.oauthService.events.subscribe(this.handleOauthEvent.bind(this));
            this.oauthService
                .loadDiscoveryDocument(environment.OAUTH_DISCOVERY_ENDPOINT)
                .then(this.handleResultOfLoadingDiscoveryDocument.bind(this, resolveFn, rejectFn));
        });
    }

    public getDecodedAccessToken() {
        return this._decodedAccessToken;
    }

    public getDecodedIDToken() {
        return this._decodedIDToken;
    }

    public validatePassword(password: string): Promise<TokenResponse> {
        return this.oauthService.fetchTokenUsingPasswordFlow(
            this.cacheService.getUserId(),
            password
        );
    }

    private setTokens() {
        this._decodedAccessToken = this.jwtHelper.decodeToken(this.oauthService.getAccessToken());
        this._decodedIDToken = this.jwtHelper.decodeToken(this.oauthService.getIdToken());
        this.timerCount = 30 * 60 * 1000; // (this.oauthService.getAccessTokenExpiration() - Date.now());
        console.log(
            'token will Expire at' + new Date(this.oauthService.getAccessTokenExpiration())
        );
    }

    private handleResultOfLoadingDiscoveryDocument(resolveFn, rejectFn) {
        this.oauthService.tryLogin().then(() => {
            if (!this.oauthService.hasValidIdToken() || !this.oauthService.hasValidAccessToken()) {
                if (!this.cacheService.getSessionData('logout-BrowserState')) {
                    this.cacheService.setSessionData(
                        'first-time-BrowserState',
                        window.location.href
                    );
                }

                this.oauthService.initCodeFlow();
                rejectFn();
            } else {
                if (
                    !this.cacheService.getSessionData('first-time-BrowserState') &&
                    !this.cacheService.getSessionData('logout-BrowserState')
                ) {
                    this.cacheService.setSessionData(
                        'direct-url-BrowserState',
                        window.location.href
                    );
                }

                this.oauthService.setupAutomaticSilentRefresh();
                this.setTokens();
                this.cacheService.setSessionData('adminRole', 'true'); // TODO: Hard-coded for the time being
                localStorage.setItem('user', JSON.stringify(this.prepareUserDetailsFromIdToken()));

                // Retrieve current user details from back end
                this.collectionService.getUser(this._decodedIDToken['emails'][0]).subscribe(
                    (responseData) => {
                        localStorage.setItem('CurrentUser', JSON.stringify(responseData));
                        resolveFn();
                    },
                    (_) => {
                        this.oauthService.logOut();
                        rejectFn();
                    }
                );
            }
        });
    }

    private prepareUserDetailsFromIdToken() {
        return {
            email: this._decodedIDToken['emails'][0],
            sub: this._decodedIDToken['sub'],
            name: this._decodedIDToken['name'],
            given_name: this._decodedIDToken['given_name'],
            preferred_username: this._decodedIDToken['emails'][0]
        };
    }

    /**
     * <p>Handles events generated during oAuth flow.</p>
     * @param event : the oAuth event that needs to be handled
     */
    private handleOauthEvent(event) {
        console.log('authService event ' + event.type);
        switch (event.type) {
            case 'logout':
                this.cacheService.setSessionData('logout-BrowserState', window.location.href);
                break;
            case 'token_received':
                this.setTokens();
                break;
            case 'code_error':
                // We may reach here if, for instance, the user cancels a sign up attempt
                window.location.href = environment.UI_ROOT;
                break;
            default:
                break;
        }
    }
}
