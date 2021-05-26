import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';

import { PasswordComponent } from './password.component';

xdescribe('PasswordComponent', () => {
    let component: PasswordComponent;
    let fixture: ComponentFixture<PasswordComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PasswordComponent],
            imports: [TestingModule]
        });
        describe;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
