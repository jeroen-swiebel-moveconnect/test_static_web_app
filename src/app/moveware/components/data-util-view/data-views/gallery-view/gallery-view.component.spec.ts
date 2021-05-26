import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService, DynamicDialogConfig, MessageService } from 'primeng';
import { AuthService } from '../../../../../auth/auth.service';
import { HttpProvider, WebApiProvider, WebBaseProvider } from '../../../../providers';
import {
    CollectionsService,
    HeaderListenerService,
    LoginService,
    RequestHandler
} from '../../../../services';
import { Broadcaster } from '../../../../services/broadcaster';
import { CacheService } from '../../../../services/cache.service';
import { ContextService } from '../../../../services/context.service';
import { DialogConfigurationService } from '../../../../services/dialog-configuration.service';
import { GridService } from '../../../../services/grid-service';
import { PageMappingService } from '../../../../services/page-mapping.service';
import { QuickTextHandlerService } from '../../../../services/quick-text-handler.service';
import { ToastService } from '../../../../services/toast.service';
import { UIActionService } from '../../../../services/ui-action.service';
import { UserService } from '../../../../services/user-service';
import { GalleryViewComponent } from './gallery-view.component';

xdescribe('GalleryViewComponent', () => {
    let component: GalleryViewComponent;
    let fixture: ComponentFixture<GalleryViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GalleryViewComponent],
            providers: [
                DialogService,
                DynamicDialogConfig,
                DialogConfigurationService,
                ToastService,
                MessageService,
                CollectionsService,
                WebBaseProvider,
                HttpProvider,
                RequestHandler,
                WebApiProvider,
                ContextService,
                AuthService,
                CacheService,
                ToastService,
                UserService,
                LoginService,
                Broadcaster,
                HeaderListenerService,
                GridService,
                CollectionsService,
                QuickTextHandlerService,
                UIActionService,
                PageMappingService
            ],
            imports: [TranslateModule.forRoot(), RouterTestingModule, HttpClientTestingModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GalleryViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
