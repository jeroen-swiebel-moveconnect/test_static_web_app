import { TestBed, ComponentFixture, fakeAsync, inject } from '@angular/core/testing';
import { SelectComponent } from './select.component';
import { FormsModule } from '@angular/forms';
import {
    EventsListenerService,
    CollectionsService,
    RequestHandler,
    LoginService
} from 'src/app/moveware/services';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import Utils from 'src/app/moveware/services/utils';
import { of, Subject } from 'rxjs';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { WebApiProvider, WebBaseProvider } from 'src/app/moveware/providers';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MessageService, DropdownModule, DialogService, DynamicDialogConfig } from 'primeng';
import { RuleEngineService } from 'src/app/moveware/services/rule-engine.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ContextService } from 'src/app/moveware/services/context.service';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { SelectEventArgs, DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
    TranslateLoader,
    TranslateModule,
    TranslateService,
    TranslateStore
} from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/moveware/services/localization.service';
import { UserService } from 'src/app/moveware/services/user-service';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

xdescribe('SelectComponent', () => {
    let interfaceInstacne: testInterface;
    let component: SelectComponent;
    let fixture: ComponentFixture<SelectComponent>;
    let eventsListener: any;
    let menuService: MenuService;
    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [SelectComponent],
            providers: [
                MessageService,
                ToastService,
                PageMappingService,
                RuleEngineService,
                DynamicDialogConfig,
                DialogService,
                TranslateService,
                GridService,
                UserService,
                RequestHandler,
                LoginService,
                WebApiProvider,
                DataFormService,
                { provide: testInterface, useClass: testInterface },
                {
                    provide: MenuService,
                    useValue: {
                        getMenus: () => {}
                    }
                },
                testInterface,
                Broadcaster,
                CollectionsService,
                WebBaseProvider
            ],
            imports: [
                DropdownModule,
                HttpClientModule,
                FormsModule,
                RouterTestingModule,
                TranslateModule.forRoot()
            ]
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(SelectComponent);
        component = fixture.componentInstance;
        component['field'] = new testInterface();
        eventsListener = TestBed.get(EventsListenerService);
        component.currentView = { _id: '' };
        // fixture.detectChanges();
    });
    it('component initialization', () => {
        expect(component).toBeDefined();
    });
    describe('when calling onRightClick', () => {
        let field: any = { CodeCode: 'CodeType', _id: 'rvdu6-v5*9n7t0-86drncf9b-rc' };
        beforeEach(inject([Broadcaster], (broadcaster: Broadcaster) => {
            spyOn(broadcaster, 'broadcast').and.stub();
            component.currentView = { _id: 'BR&^*(y(un(&f-r%&em(t(&' };
            component.field = field;
            component.onRightClick({ eventData: {} }, 'inputValues');
        }));
        it('should broadcast event', inject([Broadcaster], (broadcaster: Broadcaster) => {
            expect(broadcaster.broadcast).toHaveBeenCalledWith(
                'right-click-on-field' + 'BR&^*(y(un(&f-r%&em(t(&',
                { field: field, event: { eventData: {} }, inputElement: 'inputValues' }
            );
        }));
    });
    describe('when calling setCurrentRecord', () => {
        let record = { CodeCode: 'Account', _id: 'TDVUV^$E*T' };
        beforeEach(() => {
            component.setCurrentRecord = record;
        });
        it('should set currentrecord', () => {
            expect(component.currentRecord).toEqual(record);
        });
    });
    describe('when calling setField', () => {
        let field;
        beforeEach(() => {
            spyOn<any>(component, 'applySettings').and.stub();
            spyOn<any>(component, 'regiterFieldUpdate').and.stub();
            spyOn<any>(component, 'subscrcibeToParentFileds').and.stub();
            field = { CodeValue: { CodeCode: 'Notes', label: 'notes' } };
            component.setField = field;
        });
        it('should set value', () => {
            expect(component.value).toEqual(field.CodeValue);
        });
        it('should set label', () => {
            expect(component.label).toEqual('notes');
        });
        it('should update field with rules', () => {
            expect(component['applySettings']).toHaveBeenCalledWith('field_update', true);
        });
        it('should subscribe to field update event', () => {
            expect(component['regiterFieldUpdate']).toHaveBeenCalled();
        });
        it('should subscribe to parent fields', () => {
            expect(component['subscrcibeToParentFileds']).toHaveBeenCalled();
        });
    });
    describe('when calling markDirty', () => {
        let markDirtySpy: jasmine.Spy;
        beforeEach(inject([ContextService], (contextService: ContextService) => {
            markDirtySpy = spyOn<any>(component, 'markDirty').and.callThrough();
            spyOn(contextService, 'saveDataChangeState').and.stub();
            spyOn<any>(component, 'applySettings').and.stub();
        }));
        it('should call savechangestate', inject(
            [ContextService],
            (contextService: ContextService) => {
                component.currentView['CodeType'] = 'Data Form';
                markDirtySpy.call(component);
                expect(contextService.saveDataChangeState).toHaveBeenCalled();
                expect<any>(component['applySettings']).toHaveBeenCalled();
            }
        ));
        it('should call applysettings', () => {
            markDirtySpy.call(component);
            expect<any>(component['applySettings']).toHaveBeenCalledWith('field_update');
        });
    });
    describe('when calling unSelect', () => {
        let unSelectSpy: jasmine.Spy;
        beforeEach(() => {
            unSelectSpy = spyOn<any>(component, 'unSelect').and.callThrough();
            spyOn<any>(component, 'applySettings').and.stub();
            unSelectSpy.call(component);
        });
        it('CodeValue should null', () => {
            expect(component.field['CodeValue']).toBeNull();
        });
        it('isDirty should true', () => {
            expect(component.field['isDirty']).toBeTruthy();
        });
        it('should call applysettings', () => {
            expect<any>(component['applySettings']).toHaveBeenCalledWith('field_reset');
        });
    });

    describe('when having isEmptyObject', () => {
        it('should return true', () => {
            let value = component.isEmptyObject({});
            expect<any>(value).toBeTruthy();
        });
        it('should have true', () => {
            let value = component.isEmptyObject(null);
            expect<any>(value).toBeTruthy();
        });
        it('should have false', () => {
            let value = component.isEmptyObject({ name: 'some' });
            expect<any>(value).toBeFalsy();
        });
    });
    describe('when calling applySettings', () => {
        let applySettingsSpy: jasmine.Spy;
        beforeEach(inject([Broadcaster], (broadcaster: Broadcaster) => {
            applySettingsSpy = spyOn<any>(component, 'applySettings').and.callThrough();
            component.currentView['CodeCode'] = 'Data Form';
            spyOn(broadcaster, 'broadcast').and.stub();
        }));
        it('hould broadcast events', inject([Broadcaster], (broadcaster: Broadcaster) => {
            component.globalEventsNames = [{ data: {} }];
            spyOn(Utils, 'isEventSource').and.returnValue(true);
            spyOn(Utils, 'getEventTargetData').and.returnValue([{}]);
            component.field.CodeCode = 'Notes';
            applySettingsSpy.call(component, 'Type');
            expect<any>(broadcaster.broadcast).toHaveBeenCalledWith('Data Formapply_settings', {
                eventType: 'Type',
                eventName: 'Notes',
                eventData: {}
            });
        }));
        it('should broadcast on load events ', inject([Broadcaster], (broadcaster: Broadcaster) => {
            component.field['CodeSettings'] = [{ data: '' }];
            component.field.CodeCode = 'field_reset';
            applySettingsSpy.call(component, 'Type', true);
            expect<any>(broadcaster.broadcast).toHaveBeenCalledWith('Data Formapply_settings', {
                eventType: 'Type',
                eventName: 'field_reset',
                eventData: ['field_reset']
            });
        }));
    });
    describe('when calling getViewsByType', () => {
        beforeEach(fakeAsync(
            inject(
                [CacheService, RuleEngineService],
                (cacheService: CacheService, ruleEngine: RuleEngineService) => {
                    spyOn(cacheService, 'getSessionData').and.returnValue(
                        '{"675dfygdfd6s5rf5d-kjdhfd":{"data":{}}}'
                    );
                    spyOn(ruleEngine, 'processSettings').and.stub();
                    component['currentPage'] = { containerID: '675dfygdfd6s5rf5d-kjdhfd' };
                    component.getViewsByType({ data: {} });
                }
            )
        ));
        it('should should get session data ', inject(
            [ContextService],
            (cacheService: ContextService) => {
                expect(cacheService.getDesignerViews).toHaveBeenCalled();
            }
        ));
        it('should should processSettings', inject(
            [RuleEngineService],
            (ruleEngine: RuleEngineService) => {
                expect(ruleEngine.processSettings).toHaveBeenCalledWith('', { data: {} }, 'Form');
            }
        ));
    });
    describe('when calling onParentFiledChange', () => {
        beforeEach(inject([Broadcaster], (broadcaster: Broadcaster) => {
            const onParentFiledChangeSpy = spyOn<any>(
                component,
                'onParentFiledChange'
            ).and.callThrough();
            component.field.CodeCode = 'CodeCode';
            component.value = { data: {} };
            spyOn(broadcaster, 'broadcast').and.stub();
            onParentFiledChangeSpy.call(component);
        }));
        it('should broadcast event...', inject([Broadcaster], (broadcaster: Broadcaster) => {
            expect(broadcaster.broadcast).toHaveBeenCalledWith('CodeCodeparentFiledChanged', {
                data: {}
            });
        }));
    });

    describe('when calling subscrcibeToParentFileds', () => {
        let subscrcibeToParentFiledsSpy: jasmine.Spy;
        beforeEach(inject(
            [Broadcaster, UIActionService],
            (broadcaster: Broadcaster, actionService: UIActionService) => {
                subscrcibeToParentFiledsSpy = spyOn<any>(
                    component,
                    'subscrcibeToParentFileds'
                ).and.callThrough();
                component.field['parameterNames'] = ['CodeType'];
                component.field['CodeElement'] = 'CodeType';
                spyOn(actionService, 'loadAction').and.returnValue({
                    CodeUIAction: {},
                    CodeCode: 'Code Actions'
                });
                spyOn(broadcaster, 'on').and.returnValue(
                    of({ _id: 'rted4v-figfugfyd-fgfm d9gudf8.hgh' })
                );
                spyOn<any>(component, 'loadFieldOptions').and.stub();
                component.value = { data: {} };
                spyOn<any>(component, 'onParentFiledChange').and.stub();
            }
        ));
        it('should adjust dropdown...', inject([Broadcaster], (broadcaster: Broadcaster) => {
            subscrcibeToParentFiledsSpy.call(component);
            expect(component['parentFieldsData']['CodeType']).toEqual(
                'rted4v-figfugfyd-fgfm d9gudf8.hgh'
            );
        }));
        it('should call loadFieldOptions', () => {
            subscrcibeToParentFiledsSpy.call(component);
            expect(component['loadFieldOptions']).toHaveBeenCalledWith(
                'CodeType',
                { CodeType: 'rted4v-figfugfyd-fgfm d9gudf8.hgh' },
                { CodeUIAction: {}, CodeCode: 'Code Actions' }
            );
        });
        it('should call onParentFiledChange', fakeAsync(() => {
            subscrcibeToParentFiledsSpy.call(component);
            jasmine.clock().tick(101);
            expect(component['onParentFiledChange']).toHaveBeenCalled();
            jasmine.clock().uninstall();
        }));
    });
    describe('when calling loadFieldOptions', () => {
        let subscrcibeToParentFiledsSpy: jasmine.Spy;
        beforeEach(() => {
            subscrcibeToParentFiledsSpy = spyOn<any>(
                component,
                'loadFieldOptions'
            ).and.callThrough();
            component['currentPage'] = { CodeElement: '' };
        });
        it('should set options', fakeAsync(
            inject([RequestHandler], (requestHandler: RequestHandler) => {
                spyOn(requestHandler, 'loadFieldOptions').and.returnValue(
                    of({ body: '{"options":{}}' })
                );
                spyOn(Utils, 'parseOptions').and.returnValue({
                    options: [{ _id: 'vdhutersdf-9s98-s577-r6t9y.08' }],
                    value: {}
                });
                let data: any = [{ _id: 'vdhutersdf-9s98-s577-r6t9y.08' }];
                subscrcibeToParentFiledsSpy.call(component, '', {}, {});
                jasmine.clock().tick(101);
                expect(component.field.options).toEqual(data);
                jasmine.clock().uninstall();
            })
        ));
        it('should not set options', fakeAsync(
            inject([RequestHandler], (requestHandler: RequestHandler) => {
                spyOn(requestHandler, 'loadFieldOptions').and.returnValue(
                    of({ body: '{"options":null}' })
                );
                subscrcibeToParentFiledsSpy.call(component, '', {}, {});
                expect(component.field.options).toBeNull();
            })
        ));
    });
    describe('when calling regiterFieldUpdate', () => {
        let regiterFieldUpdateSpy: jasmine.Spy;
        beforeEach(fakeAsync(
            inject(
                [Broadcaster, UIActionService],
                (broadcaster: Broadcaster, actionService: UIActionService) => {
                    spyOn(broadcaster, 'on').and.returnValue(
                        of({ key: 'CodeType', value: 'CodeNotes' })
                    );
                    regiterFieldUpdateSpy = spyOn<any>(
                        component,
                        'regiterFieldUpdate'
                    ).and.callThrough();
                    regiterFieldUpdateSpy.call(component);
                }
            )
        ));
        it('should update field value', () => {
            expect(component.field['CodeType']).toEqual('CodeNotes');
        });
    });
    describe('when calling unSubscribeEventsList', () => {
        let unSubscribeEventsListSpy: jasmine.Spy;
        let observable: Subject<any> = new Subject();
        beforeEach(fakeAsync(
            inject(
                [Broadcaster, UIActionService],
                (broadcaster: Broadcaster, actionService: UIActionService) => {
                    unSubscribeEventsListSpy = spyOn<any>(
                        component,
                        'unSubscribeEventsList'
                    ).and.callThrough();
                    spyOn(observable, 'unsubscribe').and.stub();
                    unSubscribeEventsListSpy.call(component, [observable]);
                }
            )
        ));
        it('should update field value', () => {
            expect(observable.unsubscribe).toHaveBeenCalled();
        });
    });
    describe('when calling ngOnDestroy', () => {
        let fieldUpdateEvent: Subject<any> = new Subject();
        beforeEach(() => {
            component['fieldUpdateEvent'] = fieldUpdateEvent;
            component['eventsList'] = [fieldUpdateEvent];
        });
        it('should unsubscribe fieldUpdateEvent', () => {
            spyOn<any>(fieldUpdateEvent, 'unsubscribe').and.stub();
            component.ngOnDestroy();
            expect(fieldUpdateEvent.unsubscribe).toHaveBeenCalled();
        });
        it('should call unSubscribeEventsList', () => {
            spyOn<any>(component, 'unSubscribeEventsList').and.stub();
            component.ngOnDestroy();
            expect(component['unSubscribeEventsList']).toHaveBeenCalledWith([fieldUpdateEvent]);
        });
    });
    // describe('when calling optionchanged', () => {
    //     let selectEventArgs: SelectEventArgs = {
    //         itemData: { text: 'test', value: 'test' },
    //         isInteracted: true,
    //         item: new HTMLLIElement(),
    //         e: new MouseEvent('')
    //     };
    //     beforeEach(() => {
    //         component.currentPage = { containerID: 'buyf-8768vr-%^D-75fy' };
    //     });
    //     it('', () => {
    //         component.currentView['CodeType'] = 'Data Form';
    //         component.optionChanged(selectEventArgs);
    //     });
    //     it('should behave...', () => {
    //         component.value = undefined;
    //         component.optionChanged(selectEventArgs);
    //     });
    //     it('should behave...', fakeAsync(
    //         inject([PageMappingService], (PageMappingService: PageMappingService) => {
    //             spyOn(PageMappingService, 'getViewSelectors').and.returnValue('CodeType');
    //             component.optionChanged(selectEventArgs);
    //         })
    //     ));
    // });
});
