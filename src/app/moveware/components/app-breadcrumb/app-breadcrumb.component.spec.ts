import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { HttpClientModule, HttpHandler, HttpClient } from '@angular/common/http';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppBreadcrumbComponent } from './app-breadcrumb.component';
import { MenuService } from 'src/app/moveware/services/menu.service';
import {
    HeaderListenerService,
    CollectionsService,
    RequestHandler
} from 'src/app/moveware/services';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DialogModule, DialogService, DynamicDialogConfig } from 'primeng';
import { DialogConfigurationService } from '../../services/dialog-configuration.service';
import { CacheService } from '../../services/cache.service';
import { Broadcaster } from '../../services/broadcaster';

xdescribe('Breadcrumb component', () => {
    let component: AppBreadcrumbComponent;
    let fixture: ComponentFixture<AppBreadcrumbComponent>;
    let mockCurrentView: any;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppBreadcrumbComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [
                MenuService,
                WebBaseProvider,
                HeaderListenerService,
                CollectionsService,
                RequestHandler,
                HttpClient,
                HttpHandler,
                DialogService,
                DynamicDialogConfig,
                DialogConfigurationService,
                CacheService,
                Broadcaster,
                ToastService
            ]
        }).compileComponents();
    }));

    beforeEach(async () => {
        fixture = TestBed.createComponent(AppBreadcrumbComponent);
        component = fixture.componentInstance;
    });

    it('should create component', () => {
        expect(fixture).toBeDefined();
        expect(component).toBeDefined();
    });

    // it('breadcrumbitems array should be empty initially', () =>{
    //  // component.breadcrumbItems=[];
    //   //component.ngOnInit();
    //   expect(component.breadcrumbItems).toBeDefined();
    //   expect(component.breadcrumbItems.length).toBe(0, 'Initially breadcrumbitems array should contain no elements');
    // })

    // it('selectedRecord type and code should be same in view', () =>{
    //   // let element =  fixture.nativeElement.querySelector("b-item");
    //   // expect(element.innerText).toBe('','');

    // });

    // it('should display/render breadcrumb in view correctly', () =>{

    // });

    // it('should initialize', () => {
    //   let mockSelectedRecord = {type:'sample type',code:'sample code'};
    //   fixture.detectChanges();
    //   // component.setSelctedRecord(mockSelectedRecord);
    //   // component.setSampleBC();
    //   // fixture.detectChanges();
    //   // expect(component.selectedRecord.CodeType).toBeTruthy();

    // });
});
