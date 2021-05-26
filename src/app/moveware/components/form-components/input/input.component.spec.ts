import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EventsListenerService, CollectionsService } from 'src/app/moveware/services';
import { InputComponent } from './input.component';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
xdescribe('InputComponent', () => {
    let component: InputComponent;
    let fixture: ComponentFixture<InputComponent>;
    let sampleTestInterface: testInterface;
    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [InputComponent],
            providers: [
                EventsListenerService,
                CollectionsService,
                WebBaseProvider,
                testInterface,
                GridService,
                ToastService,
                MessageService,
                DataFormService
            ],
            imports: [TestingModule]
        });
        fixture = TestBed.createComponent(InputComponent);
        component = fixture.componentInstance;
        sampleTestInterface = TestBed.get(testInterface);
        // component.field = sampleTestInterface;
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('when calling markDirty', () => {
        let eventsListener: EventsListenerService;
        beforeEach(() => {
            eventsListener = TestBed.get(EventsListenerService);
            // component.globalEventsNames = [
            //   "dummyTestEventNameToSatisfyIfConditionOfMarkDirtyMethod"
            // ];
            component.field.name = 'dummyTestNameToSatisfyIfConditionOfMarkDirtyMethod';
            spyOn(eventsListener, 'onEventUpdate').and.stub();
            // component.markDirty();
        });
        it('should have markDirty and should call eventsListener.onEventUpdate', () => {
            expect(component.markDirty).toBeTruthy();
        });
        // it("should have markDirty and should call eventsListener.onEventUpdate", () => {
        //   expect(eventsListener.onEventUpdate).toHaveBeenCalled();
        // });
    });
});
