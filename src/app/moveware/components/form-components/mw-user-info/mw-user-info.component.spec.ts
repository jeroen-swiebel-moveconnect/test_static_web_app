import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, inject } from '@angular/core';
import { CollectionsService, RequestHandler } from 'src/app/moveware/services';
import { LoginService } from 'src/app/moveware/services';
import { UserService } from 'src/app/moveware/services/user-service';
import { UserProfileInfoComponent } from './mw-user-info.component';
import { WebApiProvider, WebBaseProvider } from 'src/app/moveware/providers';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { MessageService } from 'primeng/api';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { GridService } from 'src/app/moveware/services/grid-service';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
describe('UserProfileInfoComponent', () => {
    let component: UserProfileInfoComponent;
    let fixture: ComponentFixture<UserProfileInfoComponent>;
    beforeEach(async () => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [UserProfileInfoComponent],
            providers: [
                LoginService,
                UserService,
                WebApiProvider,
                CollectionsService,
                WebBaseProvider,
                RequestHandler,
                ToastService,
                MessageService,
                GridService
            ],
            imports: [TestingModule]
        });
        fixture = TestBed.createComponent(UserProfileInfoComponent);
        component = fixture.componentInstance;
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('whencalling oninit', () => {
        let loginService, userService;
        beforeEach(() => {
            loginService = TestBed.get(LoginService);
            userService = TestBed.get(UserService);
            spyOn(loginService, 'getUser').and.returnValue(!null);
            spyOn(loginService, 'hasAdminRights').and.stub();
            spyOn<any>(userService, 'getLoggedInUserDetails').and.returnValue({
                image: 'DmmyValue-assets/images/admin-avatar.png'
            });
            component.ngOnInit();
        });
        it('should call loginService.hasAdminRights,', () => {
            expect(loginService.hasAdminRights).toHaveBeenCalledTimes(2);
        });
        it('should call userService.getLoggedInUserDetails,', () => {
            expect(userService.getLoggedInUserDetails).toHaveBeenCalled();
        });
    });
});
