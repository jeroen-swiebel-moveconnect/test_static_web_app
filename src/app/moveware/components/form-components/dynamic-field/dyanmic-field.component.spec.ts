import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CollectionsService } from 'src/app/moveware/services';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { DynamicFieldTypeComponent } from './dyanmic-field.component';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { HttpClientModule } from '@angular/common/http';
import { of, Subscription } from 'rxjs';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('DynamicFieldTypeComponent', () => {
    let component: any;
    let fixture: ComponentFixture<DynamicFieldTypeComponent>;
    beforeEach(async () => {
        const collectionsServiceStub = {
            getField: (_id, valueId) => ({ subscribe: () => ({}) })
        };
        const broadcasterStub = { on: (arg) => ({ subscribe: () => ({}) }) };
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [DynamicFieldTypeComponent],
            providers: [
                CollectionsService,
                Broadcaster,
                WebBaseProvider,
                testInterface,
                GridService,
                ToastService,
                MessageService
            ],
            imports: [HttpClientModule, TranslateModule.forRoot(), TestingModule]
        });
        fixture = TestBed.createComponent(DynamicFieldTypeComponent);
        component = fixture.componentInstance;
        component.field = TestBed.get(testInterface);
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('method ==> ngOnInit()', () => {
        it('should have method', () => {
            expect(component.ngOnInit).toBeTruthy;
        });
        describe('when caliing ngOnInit', () => {
            beforeEach(() => {
                spyOn(component, 'subscrcibeToParentFileds').and.stub();
                component.ngOnInit();
            });
            it('should call subscrcibeToParentFileds method...', () => {
                expect(component.subscrcibeToParentFileds).toHaveBeenCalled();
            });
        });
    });

    describe('method ==> unSubscribeEventsList()', () => {
        let object: Subscription;
        beforeEach(() => {
            object = new Subscription();
            spyOn(object, 'unsubscribe').and.stub();
            component.unSubscribeEventsList([object]);
        });
        it('should have method', () => {
            expect(object.unsubscribe).toHaveBeenCalled();
        });
    });

    describe('method==> ngOnDestroy', () => {
        it('should have method...', () => {
            expect(component.ngOnDestroy).toBeTruthy;
        });
        describe('when calling method', () => {
            beforeEach(() => {
                spyOn(component, 'unSubscribeEventsList').and.stub();
                component.eventsList = { someEvent: 'click' };
                component.ngOnDestroy();
            });
            it('should call this.unSubscribeEventsList', () => {
                expect(component.unSubscribeEventsList).toHaveBeenCalledWith({
                    someEvent: 'click'
                });
            });
        });
    });
    describe('method==> subscrcibeToParentFileds', () => {
        it('should have mthod...', () => {
            expect(component.subscrcibeToParentFileds).toBeTruthy;
        });
        describe('when calling this method', () => {
            let collectionsService: CollectionsService;
            let broadcaster: Broadcaster;
            let spyObjOnBroadcasterOn;
            beforeEach(() => {
                collectionsService = TestBed.get(CollectionsService);
                broadcaster = TestBed.get(Broadcaster);

                spyOn(component.eventsList, 'push').and.stub();
                spyObjOnBroadcasterOn = spyOn(broadcaster, 'on');
            });
            it('should call collectionsService.getCode() method..', () => {
                spyObjOnBroadcasterOn.and.returnValue(of({ value: 'DummyValue' }));
                component.subscrcibeToParentFileds();
            });
            it('should call broadcaster.on() method.', () => {
                spyObjOnBroadcasterOn.and.returnValue(of({ value: 'DummyValue' }));
                component.subscrcibeToParentFileds();
                expect(broadcaster.on).toHaveBeenCalledWith('BG%&#E$IIE$^U$parentFiledChanged');
            });
            it('should push values to this.eventList.', () => {
                spyObjOnBroadcasterOn.and.returnValue(of({ value: 'DummyValue' }));
                component.subscrcibeToParentFileds();
                expect(component.field.DynamicField).toEqual({
                    CodeDescription: 'Value',
                    CodeVisible: true,
                    CodeValue: undefined
                });
            });
            it('should behave...', () => {
                spyObjOnBroadcasterOn.and.returnValue(of({ value: 'DummyValue' }));
                component.subscrcibeToParentFileds();
                expect(component.eventsList.push).toHaveBeenCalled();
            });
            it('should behave...', () => {
                spyObjOnBroadcasterOn.and.returnValue(of(undefined));
                component.subscrcibeToParentFileds();
                expect(component.field.DynamicField).toEqual(null);
            });
        });
    });
});
