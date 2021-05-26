import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { HyperLinkComponent } from './hyperlink.component';
import { CollectionsService } from 'src/app/moveware/services';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('HyperLinkComponent', () => {
    let component: HyperLinkComponent;
    let fixture: ComponentFixture<HyperLinkComponent>;
    let menuservice: MenuService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [HyperLinkComponent],
            providers: [],
            imports: [TestingModule]
        });
        fixture = TestBed.createComponent(HyperLinkComponent);
        component = fixture.componentInstance;
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('Name of the group', () => {
        beforeEach(() => {
            menuservice = TestBed.get(MenuService);
            spyOn(menuservice, 'loadContainer').and.callFake;
        });
        it('should have loadDetails...', () => {
            component.loadDetails({ CodeUILocation: '' });
            expect(menuservice.loadContainer).toHaveBeenCalled();
        });
        it('should behave...', () => {
            let value: any = {};
            component.loadDetails(value);
            expect(value.CodeUILocation).toEqual('Dialog Left');
        });
    });
});
