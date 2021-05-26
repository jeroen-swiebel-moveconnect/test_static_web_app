import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EventsListenerService } from 'src/app/moveware/services';
import { LoginService } from 'src/app/moveware/services';
import { Router } from '@angular/router';
import { LogoutComponent } from './mw-logout.component';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
describe('LogoutComponent', () => {
    let component: any;
    let fixture: ComponentFixture<LogoutComponent>;
    beforeEach(async () => {
        const eventsListenerServiceStub = {};
        const loginServiceStub = {};
        const routerStub = { navigate: (array) => ({}) };
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [LogoutComponent],
            providers: [
                { provide: EventsListenerService, useValue: eventsListenerServiceStub },
                { provide: LoginService, useValue: loginServiceStub },
                { provide: Router, useValue: routerStub }
            ],
            imports: [TestingModule]
        });
        fixture = TestBed.createComponent(LogoutComponent);
        component = fixture.componentInstance;
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('when calling logout', () => {
        beforeEach(() => {
            component.logout();
        });
        it('should have logout', () => {});
    });
});
