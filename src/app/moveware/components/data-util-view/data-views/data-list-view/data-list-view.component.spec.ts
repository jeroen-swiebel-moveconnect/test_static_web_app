import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../../auth/auth.service';
import { DialogService, DynamicDialogConfig, MessageService } from 'primeng';
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
import { DataListViewComponent } from './data-list-view.component';

xdescribe('DataListViewComponent', () => {
    let component: DataListViewComponent;
    let fixture: ComponentFixture<DataListViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataListViewComponent],
            imports: [TranslateModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
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
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataListViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
