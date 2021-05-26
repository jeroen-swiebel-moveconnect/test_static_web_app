import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EventsListenerService } from 'src/app/moveware/services';
import { NumericTextboxComponent } from './numeric-textbox.component';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
describe('RadiobuttonComponent', () => {
    let component: NumericTextboxComponent;
    let fixture: ComponentFixture<NumericTextboxComponent>;
    beforeEach(() => {
        const eventsListenerServiceStub = { onEventUpdate: (object) => ({}) };
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [NumericTextboxComponent],
            providers: [
                { provide: EventsListenerService, useValue: eventsListenerServiceStub },
                DataFormService
            ],
            imports: [TestingModule]
        });
        fixture = TestBed.createComponent(NumericTextboxComponent);
        component = fixture.componentInstance;
    });
    it('should initialise the component', () => {
        expect(component).toBeDefined();
    });

    describe('when calling setField', () => {
        it('should set relevant fields', () => {
            const field = { CodeValue: true };
            component.setField = field;

            expect(component.field.CodeValue).toEqual(field.CodeValue);
            expect(component.field.CodeValue).toBeTruthy();
        });
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
});
