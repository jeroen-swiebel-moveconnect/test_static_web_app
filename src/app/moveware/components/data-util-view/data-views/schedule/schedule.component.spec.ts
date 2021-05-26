import { ScheduleComponent } from './schedule.component';
import { TestBed, ComponentFixture, inject, fakeAsync, flush, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ElementRef, Renderer2, ViewContainerRef } from '@angular/core';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import {
    TranslateLoader,
    TranslateModule,
    TranslateService,
    TranslateStore,
    TranslateCompiler,
    TranslateParser,
    MissingTranslationHandler,
    USE_DEFAULT_LANG,
    USE_STORE,
    USE_EXTEND,
    DEFAULT_LANGUAGE
} from '@ngx-translate/core';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CollectionsService, RequestHandler, LoginService } from 'src/app/moveware/services';
import { WebApiProvider, WebBaseProvider } from 'src/app/moveware/providers';
import { UserService } from 'src/app/moveware/services/user-service';
import { ScheduleComponent as Schedule } from '@syncfusion/ej2-angular-schedule';
import Utils from 'src/app/moveware/services/utils';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { of, Observable, throwError } from 'rxjs';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import { TestingModule } from '../../../../app-testing.module';
// import { I18nLoader } from 'src/app/moveware/services/localization.service';

fdescribe('ScheduleComponent', () => {
    let component: ScheduleComponent;
    let fixture: ComponentFixture<ScheduleComponent>;
    let schedule: Schedule;
    let data = [
        {
            _id: '57f10619-4acf-4cfa-a10a-8b6d94d20398',
            FileType: {
                _id: 'f9c55689-3ee4-4920-9f8c-75e71c4d99c2',
                CodeCode: 'Meeting',
                CodeDescription: 'Meeting',
                CodeIsActivity: true
            },
            FileSubType: {
                _id: '53609725-632e-4b9d-bc8f-1245a0273a08',
                CodeCode: 'Staff Meeting',
                CodeDescription: 'Staff Meeting'
            },
            FileDescription: 'Staff Meeting with People',
            DateFrom: new Date(2018, 1, 1, 11, 0),
            DateTo: new Date(2018, 1, 1, 13, 0),
            Assignees: [
                {
                    _id: 'f036e6f3-02ee-4c0d-bf4d-4091a2961e83',
                    EntityNumber: 'EN-000031',
                    EntitySearchName: 'Jiang Miss Xin'
                }
            ],
            FileDetails: null,
            FilePriority: {
                _id: '389a79ec-b803-4a84-afe5-4f3b76ab1169',
                CodeCode: 'Critical',
                CodeDescription: 'Critical'
            },
            FileNumber: 'AC-00000013',
            FileStatus: {
                _id: '7769626e-e769-42a3-a03a-42e3d6967d08',
                CodeCode: 'Active',
                CodeDescription: 'Active'
            }
        }
    ];
    let event = {
        element: data,
        event: 'dummy event',
        data: data
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [ScheduleComponent],
            providers: [
                GridService,
                ToastService,
                DialogService,
                DynamicDialogConfig,
                PageMappingService,
                CollectionsService,
                WebBaseProvider,
                WebApiProvider,
                UserService,
                RequestHandler,
                LoginService,
                Schedule,
                Renderer2,
                ViewContainerRef,
                Broadcaster,
                TranslateService,
                TranslateLoader,
                TranslateStore,
                TranslateCompiler,
                TranslateParser,
                MissingTranslationHandler,
                { provide: USE_DEFAULT_LANG, useValue: undefined },
                { provide: USE_STORE, useValue: undefined },
                { provide: USE_EXTEND, useValue: undefined },
                { provide: DEFAULT_LANGUAGE, useValue: undefined },
                { provide: ElementRef, useClass: MockElementRef }
            ],
            imports: [RouterTestingModule, HttpClientModule, TestingModule]
        }).compileComponents();
    }));

    beforeEach(inject([Schedule], (injectedSchedule: Schedule) => {
        fixture = TestBed.createComponent(ScheduleComponent);
        component = fixture.componentInstance;
        schedule = injectedSchedule;
        component.dataSource = data;
        component.schedule = schedule;
        component.currentPage = {
            CodeElement: '12345'
        };
        component.currentView = {
            _id: 'viewId',
            dataObjectCodeCode: 'dummy type'
        };
        component.formAction = false;
        component.metaData = {
            layout: []
        };
    }));
    it('should create component instance', () => {
        expect(component).toBeTruthy;
    });

    describe('when calling getData', () => {
        beforeEach(fakeAsync(() => {
            spyOn<any>(component, 'selectFirstEvent').and.stub();
            spyOn(component.schedule, 'scrollTo').and.stub();
        }));

        it('should set dataSource on schedule and select an event when no currentRecord', fakeAsync(() => {
            jasmine.clock().uninstall();
            component.currentRecord = null;
            component.getData(null);
            jasmine.clock().tick(501);

            expect(component.schedule.eventSettings.dataSource).toEqual(component.dataSource);
            expect<any>(component['selectFirstEvent']).toHaveBeenCalled();
            expect(component.schedule.scrollTo).toHaveBeenCalled();
            expect(component.resetView).toBeTruthy();
            jasmine.clock().uninstall();
            flush();
        }));

        it('should set dataSource on schedule and not setting currentRecord ', () => {
            component.currentRecord = 'current record';
            component.getData(null);

            expect(component.schedule.eventSettings.dataSource).toEqual(component.dataSource);
            expect<any>(component['selectFirstEvent']).not.toHaveBeenCalled();
            expect(component.resetView).toBeTruthy();
        });
    });

    describe('when calling onClick', () => {
        beforeEach(() => {
            spyOn(component.schedule, 'getEventDetails').and.returnValue(event.element);
            spyOn(component, 'selectEvent').and.stub();
            // component.getData(null);
            component.onClick(event);
        });

        it('should set currentRecord', () => {
            expect(component.currentRecord).toEqual(data);
        });

        it('should set selectedRecord', () => {
            expect(component.selectedRecord).toEqual('dummy event');
        });

        it('should expect selectEvent to have been called', () => {
            expect(component.selectEvent).toHaveBeenCalled();
        });
    });

    describe('when calling refreshView', () => {
        beforeEach(() => {
            spyOn(component, 'setView').and.stub();
            spyOn(component, 'setTimeScale').and.stub();
            spyOn(component, 'setWorkHours').and.stub();

            component.refreshView();
        });

        it('should set the properties of schedule component', () => {
            expect(component.setView).toHaveBeenCalled();
            expect(component.setTimeScale).toHaveBeenCalled();
            expect(component.setWorkHours).toHaveBeenCalled();
        });
    });

    describe('when calling editStart', () => {
        beforeEach(() => {
            component.editStart(event);
        });

        it('should set previousState', () => {
            expect(component.previousState).toBeDefined();
        });
    });

    describe('when calling editStop', () => {
        beforeEach(() => {
            spyOn(component, 'updateEvent').and.stub();
        });

        it('should call updateEvent if state has changed', () => {
            spyOn(Utils, 'isObjectsEqual').and.returnValue(false);
            component.editStop(event);

            expect(component.updateEvent).toHaveBeenCalled();
        });

        it('should not call updateEvent if state has not changed', () => {
            spyOn(Utils, 'isObjectsEqual').and.returnValue(true);
            component.editStop(event);

            expect(component.updateEvent).not.toHaveBeenCalled();
        });
    });

    describe('when calling actionComplete', () => {
        beforeEach(() => {
            spyOn(component, 'createEvent').and.stub();
            spyOn(component, 'deleteEvent').and.stub();
        });

        it('should call createEvent if action is eventCreated', () => {
            event['requestType'] = 'eventCreated';
            component.actionComplete(event);

            expect(component.createEvent).toHaveBeenCalledWith(event.data[0]);
        });

        it('should call deleteEvent if action is eventRemoved', () => {
            event['requestType'] = 'eventRemoved';
            component.actionComplete(event);

            expect(component.deleteEvent).toHaveBeenCalledWith(event.data[0]);
        });

        it('should not call any functions otherwise', () => {
            event['requestType'] = 'dummyEvent';
            component.actionComplete(event);

            expect(component.createEvent).not.toHaveBeenCalled();
            expect(component.deleteEvent).not.toHaveBeenCalled();
        });
    });

    describe('when calling registerAddEvent', () => {
        it('should call addEvent if valid schedule', () => {
            spyOn(component.schedule, 'addEvent').and.stub();
            component.add(data);

            expect(component.schedule.addEvent).toHaveBeenCalledWith(data);
            expect(component.formAction).toBe(true);
        });
    });

    describe('when calling registerDeleteEvent', () => {
        it('should call deleteEvent if valid schedule', fakeAsync(() => {
            spyOn(component.schedule, 'deleteEvent').and.stub();
            spyOn<any>(component, 'selectFirstEvent').and.stub();
            jasmine.clock().uninstall();
            component.delete(data);
            jasmine.clock().tick(501);

            expect(component.schedule.deleteEvent).toHaveBeenCalledWith(data);
            expect(component.formAction).toBe(true);
            expect<any>(component['selectFirstEvent']).toHaveBeenCalled();
            jasmine.clock().uninstall();
            flush();
        }));
    });

    describe('when calling registerUpdateEvent', () => {
        it('should call saveEvent if valid schedule', () => {
            spyOn(component.schedule, 'saveEvent').and.stub();
            component.updateRecord(data);

            expect(component.schedule.saveEvent).toHaveBeenCalledWith(data);
            expect(component.formAction).toBe(true);
        });
    });

    describe('when calling createEvent', () => {
        beforeEach(inject([ToastService], (toastService: ToastService) => {
            spyOn(component.schedule, 'deleteEvent').and.stub();
            spyOn(component.schedule, 'refresh').and.stub();
            spyOn<any>(component, 'buildReqObject').and.returnValue({
                dummyObject: 'dummy Object'
            });
            spyOn(toastService, 'addErrorMessage').and.stub();
            spyOn(toastService, 'addSuccessMessage').and.stub();
            spyOn(toastService, 'showCustomToast').and.stub();
            spyOn(component.onRecordSelection, 'emit').and.stub();
        }));

        it('should behave this way when everything goes smoothly', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (collectionsService: CollectionsService, toastService: ToastService) => {
                    spyOn(collectionsService, 'addCollectionItem').and.returnValue(
                        of({
                            body: '{ "id" : "dummy id" }'
                        })
                    );

                    component.createEvent(data[0]);

                    expect<any>(component['buildReqObject']).toHaveBeenCalledWith(
                        data[0],
                        'create'
                    );
                    expect(toastService.addSuccessMessage).toHaveBeenCalled();
                    expect(component.onRecordSelection.emit).toHaveBeenCalled();
                    flush();
                }
            )
        ));

        it('should behave this way when collection is not added', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (collectionsService: CollectionsService, toastService: ToastService) => {
                    spyOn(collectionsService, 'addCollectionItem').and.returnValue(of({}));

                    component.createEvent(data[0]);

                    expect<any>(component['buildReqObject']).toHaveBeenCalledWith(
                        data[0],
                        'create'
                    );
                    expect(component.schedule.deleteEvent).toHaveBeenCalled();
                    expect(toastService.addErrorMessage).toHaveBeenCalled();
                    flush();
                }
            )
        ));

        it('should behave this way when addCollectionItem api call returns error', inject(
            [CollectionsService, ToastService],
            (collectionsService: CollectionsService, toastService: ToastService) => {
                spyOn(collectionsService, 'addCollectionItem').and.returnValue(
                    throwError({ status: '404' })
                );

                component.createEvent(data[0]);

                expect<any>(component['buildReqObject']).toHaveBeenCalledWith(data[0], 'create');
                expect(component.schedule.refresh).toHaveBeenCalled();
                expect(toastService.showCustomToast).toHaveBeenCalled();
            }
        ));
    });

    describe('when calling deleteEvent', () => {
        beforeEach(fakeAsync(
            inject([ToastService], (toastService: ToastService) => {
                spyOn(component.schedule, 'refresh').and.stub();
                spyOn<any>(component, 'buildReqObject').and.returnValue({
                    dummyObject: 'dummy Object'
                });
                spyOn(toastService, 'addSuccessMessage').and.stub();
                spyOn(toastService, 'showCustomToast').and.stub();
                spyOn<any>(component, 'selectFirstEvent').and.stub();
            })
        ));

        it('should behave this way when everything goes smoothly', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (collectionsService: CollectionsService, toastService: ToastService) => {
                    spyOn(collectionsService, 'removeCollectionItem').and.returnValue(of({}));

                    jasmine.clock().uninstall();
                    component.deleteEvent(data[0]);
                    jasmine.clock().tick(501);

                    expect<any>(component['buildReqObject']).toHaveBeenCalledWith(
                        data[0],
                        'delete'
                    );
                    expect(toastService.addSuccessMessage).toHaveBeenCalled();
                    expect<any>(component['selectFirstEvent']).toHaveBeenCalled();
                    jasmine.clock().uninstall();
                    flush();
                }
            )
        ));

        it('should behave this way when removeCollectionItem api call returns error', inject(
            [CollectionsService, ToastService],
            (collectionsService: CollectionsService, toastService: ToastService) => {
                spyOn(collectionsService, 'removeCollectionItem').and.returnValue(
                    throwError({ status: '404' })
                );

                component.deleteEvent(data[0]);

                expect<any>(component['buildReqObject']).toHaveBeenCalledWith(data[0], 'delete');
                expect(component.schedule.refresh).toHaveBeenCalled();
                expect(toastService.showCustomToast).toHaveBeenCalled();
            }
        ));
    });

    describe('when calling updateEvent', () => {
        beforeEach(inject([ToastService], (toastService: ToastService) => {
            spyOn(component.schedule, 'refresh').and.stub();
            spyOn<any>(component, 'buildReqObject').and.returnValue({
                dummyObject: 'dummy Object'
            });
            spyOn(toastService, 'addSuccessMessage').and.stub();
            spyOn(toastService, 'showCustomToast').and.stub();
            spyOn(component.onRecordSelection, 'emit').and.stub();
        }));

        it('should behave this way when everything goes smoothly', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (collectionsService: CollectionsService, toastService: ToastService) => {
                    spyOn(collectionsService, 'updateCollectionItem').and.returnValue(of({}));

                    component.updateEvent(data[0]);

                    expect<any>(component['buildReqObject']).toHaveBeenCalledWith(data[0]);
                    expect(toastService.addSuccessMessage).toHaveBeenCalled();
                    expect(component.onRecordSelection.emit).toHaveBeenCalled();
                    flush();
                }
            )
        ));

        it('should behave this way when updateCollectionItem api call returns error', inject(
            [CollectionsService, ToastService],
            (collectionsService: CollectionsService, toastService: ToastService) => {
                spyOn(collectionsService, 'updateCollectionItem').and.returnValue(
                    throwError({ status: '404' })
                );

                component.updateEvent(data[0]);

                expect<any>(component['buildReqObject']).toHaveBeenCalledWith(data[0]);
                expect(component.schedule.refresh).toHaveBeenCalled();
                expect(toastService.showCustomToast).toHaveBeenCalled();
            }
        ));
    });

    // TODO: Fix this test and remove the x
    xdescribe('when calling buildReqObject', () => {
        let spyObj: jasmine.Spy;

        beforeEach(inject([UserService], (userService: UserService) => {
            spyObj = spyOn<any>(component, 'buildReqObject').and.callThrough();
            spyOn(userService, 'getUserId').and.returnValue('dummy user');
            data[0]['_id'] = 'dummy id';
        }));

        it('should return this request object when type is create', inject(
            [UserService],
            (userService: UserService) => {
                let requestObject = spyObj.call(component, data[0], 'create');

                expect<any>(userService['getUserId']).toHaveBeenCalled();
                expect(requestObject).toEqual({
                    meta: {
                        viewId: 'viewId',
                        userId: 'dummy user'
                    },
                    payload: {
                        DateFrom: data[0].DateFrom,
                        DateTo: data[0].DateTo,
                        FileDescription: data[0].FileDescription,
                        FileType: StandardCodesIds.FILE_TYPE_APPOINTMENT_ID,
                        FileStatus: StandardCodesIds.ACTIVE_STATUS_ID
                    },
                    userId: 'dummy user',
                    type: 'dummy type'
                });
            }
        ));

        it('should return this request object when type is delete', inject(
            [UserService],
            (userService: UserService) => {
                let requestObject = spyObj.call(component, data[0], 'delete');

                expect<any>(userService['getUserId']).toHaveBeenCalled();
                expect(requestObject).toEqual({
                    meta: {
                        viewId: 'viewId',
                        userId: 'dummy user'
                    },
                    type: 'dummy type',
                    _id: 'dummy id'
                });
            }
        ));

        it('should return this request object when type is neither create or delete', inject(
            [UserService],
            (userService: UserService) => {
                let requestObject = spyObj.call(component, data[0]);

                expect<any>(userService['getUserId']).toHaveBeenCalled();
                expect(requestObject).toEqual({
                    meta: {
                        viewId: 'viewId',
                        userId: 'dummy user'
                    },
                    payload: {
                        DateFrom: data[0].DateFrom,
                        DateTo: data[0].DateTo,
                        FileDescription: data[0].FileDescription
                    },
                    type: 'dummy type',
                    _id: 'dummy id'
                });
            }
        ));
    });

    describe('when calling selectFirstEvent', () => {
        let spyObj: jasmine.Spy;
        beforeEach(() => {
            data[0]['Guid'] = 'dummy guid';
            spyOn(component, 'onClick').and.stub();
            spyOn(component.schedule, 'getCurrentViewEvents').and.returnValue(data);
            // spyOn<any>(component.schedule['eventBase'], 'removeSelectedAppointmentClass').and.stub();
            // spyOn<any>(component.schedule['element'], 'querySelector').and.stub();
            spyObj = spyOn<any>(component, 'selectFirstEvent').and.callThrough();
            spyObj.call(component);
        });

        it('should run below if available currentViewEvents', () => {
            expect(component.schedule.getCurrentViewEvents).toHaveBeenCalled();
        });
    });
});

export class MockElementRef extends ElementRef {
    constructor() {
        super(null);
    }
}
