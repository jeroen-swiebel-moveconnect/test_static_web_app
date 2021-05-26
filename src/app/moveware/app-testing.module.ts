import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OAuthLogger, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { DialogService, DynamicDialogConfig, DynamicDialogRef, MessageService } from 'primeng';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { HttpProvider, WebApiProvider, WebBaseProvider } from './providers';
import {
    CollectionsService,
    EventsListenerService,
    LoginService,
    RequestHandler
} from './services';
import { Broadcaster } from './services/broadcaster';
import { CacheService } from './services/cache.service';
import { ContextService } from './services/context.service';
import { DialogConfigurationService } from './services/dialog-configuration.service';
import { GridService } from './services/grid-service';
import { I18nService } from './services/i18n.service';
import { MenuService } from './services/menu.service';
import { PageMappingService } from './services/page-mapping.service';
import { QuickTextHandlerService } from './services/quick-text-handler.service';
import { ToastService } from './services/toast.service';
import { UserService } from './services/user-service';

@NgModule({
    providers: [
        ToastService,
        PageMappingService,
        DynamicDialogConfig,
        DialogService,
        GridService,
        UserService,
        ContextService,
        I18nService,
        QuickTextHandlerService,
        CacheService,
        CollectionsService,
        RequestHandler,
        LoginService,
        DialogConfigurationService,
        Broadcaster,
        WebApiProvider,
        WebBaseProvider,
        MenuService,
        MessageService,
        HttpProvider,

        OAuthService,
        UrlHelperService,
        DynamicDialogRef,
        EventsListenerService,
        AuthService
    ],
    imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FormsModule,
        AuthModule
    ],

    declarations: [],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],

    exports: []
})
export class TestingModule {}
