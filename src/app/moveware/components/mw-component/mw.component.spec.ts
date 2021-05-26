import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OAuthLogger } from 'angular-oauth2-oidc';
import { TestingModule } from '../../app-testing.module';
import { AppComponent } from '../../../app.component';

xdescribe('App component', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent],
            providers: [OAuthLogger],
            imports: [TestingModule]
        });
        describe;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('when calling init method', () => {
        beforeEach(() => {
            component.ngOnInit();
        });
        it('should ngOnInit be true', () => {
            expect(component.ngOnInit).toBeTruthy();
        });
        it('should ngOnInit be called', () => {
            expect(component.ngOnInit).toHaveBeenCalled();
        });
    });
});
