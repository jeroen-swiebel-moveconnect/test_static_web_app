import { TestBed } from '@angular/core/testing';
import { UserService } from './user-service';
import { ToastService } from './toast.service';
import { Broadcaster } from './broadcaster';
import { CacheService } from './cache.service';
import { CollectionsService } from './collections.service';
import { ContextService } from './context.service';
import { RequestHandler } from './RequestHandler';
import { LoginService } from './login-service';
import {
    DEFAULT_LANGUAGE,
    MissingTranslationHandler,
    TranslateCompiler,
    TranslateLoader,
    TranslateParser,
    TranslateService,
    TranslateStore,
    USE_DEFAULT_LANG,
    USE_EXTEND,
    USE_STORE
} from '@ngx-translate/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { WebApiProvider, WebBaseProvider } from '../providers';
import { DialogService } from 'primeng';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UserService,
                CacheService,
                CollectionsService,
                ContextService,
                LoginService,
                ToastService,
                TranslateService,
                DialogService,
                HttpClient,
                DynamicDialogConfig,
                TranslateStore,
                TranslateLoader,
                TranslateCompiler,
                TranslateParser,
                Broadcaster,
                WebApiProvider,
                WebBaseProvider,
                MissingTranslationHandler,
                RequestHandler,
                HttpHandler,
                { provide: USE_DEFAULT_LANG, useValue: undefined },
                { provide: USE_STORE, useValue: undefined },
                { provide: USE_EXTEND, useValue: undefined },
                { provide: DEFAULT_LANGUAGE, useValue: undefined }
            ]
        });

        userService = TestBed.inject(UserService);
    });

    it('can init service', () => {
        expect(userService).toBeDefined();
    });

    it('getUserId should return preferred username as userId', () => {
        localStorage.setItem(
            'user',
            JSON.stringify({
                email: 'testuser@testdomain.com',
                sub: 'test sub',
                name: 'test name',
                given_name: 'test given name',
                preferred_username: 'testuser_pn@testdomain.com'
            })
        );
        expect(userService.getUserId()).toEqual('testuser_pn@testdomain.com');
    });

    it('getUserId should return null if user not logged in', () => {
        localStorage.removeItem('user');
        expect(userService.getUserId()).toBeNull();
    });
});
