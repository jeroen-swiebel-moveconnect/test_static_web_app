// Core Modules
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
    BrowserAnimationsModule,
    NoopAnimationsModule
} from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { LoginRoutingModule } from './login-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth-guard.service';
import { AuthModule } from './auth/auth.module';
import { CacheInterceptor } from './interceptors/cache.Interceptor';
import { HttpErrorInterceptor } from './interceptors/httpErrorInterceptor';
import { TokenInterceptor } from './interceptors/httpInterceptor';
import { HttpProvider, WebApiProvider, WebBaseProvider } from './moveware/providers';
import { CollectionsService, LoginService, RequestHandler } from './moveware/services';
import { CacheService } from './moveware/services/cache.service';
import { I18nService } from './moveware/services/i18n.service';
import { HttpLoaderFactory } from './moveware/services/localization.service';
import { LoggingService } from './moveware/services/logging.service';
import { ErrorHandlerService } from './moveware/services/error-handler.service';
// Services

const providers = [HttpProvider, WebApiProvider, WebBaseProvider, MessageService, AuthGuard];

const services = [
    CollectionsService,
    DialogService,
    DynamicDialogConfig,
    RequestHandler,
    I18nService,
    CacheService,
    LoginService
];

@NgModule({
    entryComponents: [],
    declarations: [AppComponent],
    imports: [
        LoginRoutingModule,
        AuthModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],

    providers: [
        ...services,
        ...providers,
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
        { provide: ErrorHandler, useClass: ErrorHandlerService }
    ],
    bootstrap: [AppComponent]
})
export class LoginModule {
    constructor(private myMonitoringService: LoggingService) {}
}
