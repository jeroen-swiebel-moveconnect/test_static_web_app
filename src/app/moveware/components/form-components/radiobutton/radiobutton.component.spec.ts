import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EventsListenerService } from 'src/app/moveware/services';
import { RadiobuttonComponent } from './radiobutton.component';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { TranslateModule } from '@ngx-translate/core';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
xdescribe('RadiobuttonComponent', () => {
    let component: RadiobuttonComponent;
    let fixture: ComponentFixture<RadiobuttonComponent>;
    beforeEach(() => {
        const eventsListenerServiceStub = { onEventUpdate: (object) => ({}) };
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [RadiobuttonComponent],
            providers: [
                testInterface,
                DataFormService,
                { provide: EventsListenerService, useValue: eventsListenerServiceStub }
            ],
            imports: [TranslateModule.forRoot()]
        });
        fixture = TestBed.createComponent(RadiobuttonComponent);
        component = fixture.componentInstance;
        component.field = TestBed.get(testInterface);
    });
    it('should initialise the component', () => {
        expect(component).toBeDefined();
    });

    describe('when calling setCurrentRecord', () => {
        it('should set currentRecord', () => {
            const record = { CodeCode: 'Account', _id: 'aBcDeFg' };
            component.setCurrentRecord = record;

            expect(component.currentRecord).toEqual(record);
        });
    });

    describe('when calling setField', () => {
        it('should set relevant fields', () => {
            const field = { CodeValue: true };
            component.setField = field;

            expect(component.field.CodeValue).toEqual(field.CodeValue);
            expect(component.fieldValue).toBeTruthy();
        });
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('when calling markdirty', () => {
        let eventsListener: EventsListenerService;
        beforeEach(() => {
            eventsListener = TestBed.get(EventsListenerService);
            component.globalEventsNames = [
                'dummyTestEventNameToSatisfyIfConditionOfMarkDirtyMethod'
            ];
            component.field.name = 'dummyTestNameToSatisfyIfConditionOfMarkDirtyMethod';
            spyOn(eventsListener, 'onEventUpdate').and.stub();
            // scomponent.markDirty();
        });
        it('should have markDirty and should call eventsListener.onEventUpdate', () => {
            expect(eventsListener.onEventUpdate).toHaveBeenCalled();
        });
    });
});
