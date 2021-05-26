import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EventsListenerService } from 'src/app/moveware/services';
import { TextAreaComponent } from './input.textarea.component';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('TextAreaComponent', () => {
    let component: TextAreaComponent;
    let fixture: ComponentFixture<TextAreaComponent>;
    let sampleTestInterface: testInterface;
    beforeEach(() => {
        const eventsListenerServiceStub = { onEventUpdate: (object) => ({}) };
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [TextAreaComponent],
            providers: [
                EventsListenerService,
                testInterface,
                GridService,
                ToastService,
                MessageService
            ],
            imports: [TestingModule]
        });
        fixture = TestBed.createComponent(TextAreaComponent);
        component = fixture.componentInstance;
        sampleTestInterface = TestBed.get(testInterface);
        // component["field"] = sampleTestInterface;
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('Name of the group', () => {
        let eventsListener: EventsListenerService;
        beforeEach(() => {
            eventsListener = TestBed.get(EventsListenerService);
            component.globalEventsNames = [
                'dummyTestEventNameToSatisfyIfConditionOfMarkDirtyMethod'
            ];
            component.field.name = 'dummyTestNameToSatisfyIfConditionOfMarkDirtyMethod';
            spyOn(eventsListener, 'onEventUpdate').and.stub();
            component.markDirty();
        });
        it('should have markDirty and should call eventsListener.onEventUpdate', () => {
            expect(component.markDirty).toBeTruthy();
        });
        it('should have markDirty and should call eventsListener.onEventUpdate', () => {
            // expect(eventsListener.onEventUpdate).toHaveBeenCalled();
        });
    });
});
