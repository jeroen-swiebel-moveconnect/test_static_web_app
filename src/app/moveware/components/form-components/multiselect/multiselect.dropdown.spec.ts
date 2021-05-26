import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import {
    CollectionsService,
    EventsListenerService,
    RequestHandler
} from 'src/app/moveware/services';
import { MultiSelectComponent } from './multiselect.dropdown';
import { GridService } from 'src/app/moveware/services/grid-service';
import { MessageService } from 'primeng/api';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { DialogService } from 'primeng';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { RouterTestingModule } from '@angular/router/testing';
import { PageMappingService } from '../../../services/page-mapping.service';
import { WebBaseProvider } from '../../../providers';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MenuService } from '../../../services/menu.service';
import { Broadcaster } from '../../../services/broadcaster';
import { StandardCodes } from '../../../constants/StandardCodes';
import { ContextService } from '../../../services/context.service';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

xdescribe('MultiSelectComponent', () => {
    let component: MultiSelectComponent;
    let fixture: ComponentFixture<MultiSelectComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [MultiSelectComponent],
            providers: [
                CollectionsService,
                DialogService,
                DynamicDialogConfig,
                GridService,
                HttpClient,
                HttpHandler,
                MessageService,
                PageMappingService,
                RequestHandler,
                ToastService,
                DataFormService,
                WebBaseProvider,
                {
                    provide: MenuService,
                    useValue: {
                        getMenus: () => {}
                    }
                }
            ],
            imports: [TestingModule]
        });

        fixture = TestBed.createComponent(MultiSelectComponent);
        component = fixture.componentInstance;
        // component.field = TestBed.get(testInterface);
    });

    xit('should initialise the component', () => {
        expect(component).toBeDefined();
    });

    xdescribe('when calling setCurrentRecord', () => {
        it('should set currentRecord', () => {
            const record = { CodeCode: 'Account', _id: 'aBcDeFg' };
            component.setCurrentRecord = record;

            expect(component.currentRecord).toEqual(record);
        });
    });

    xdescribe('when calling setField', () => {
        it('should set relevant fields', () => {
            // Invoke target method
            component.setField = {
                CodeValue: [
                    { _id: '001', label: 'first' },
                    { _id: '002', label: 'second' },
                    { _id: '003', label: 'third' }
                ]
            };

            expect(component.field.CodeValue).toEqual(['001', '002', '003']);
            expect(component.value).toBeTruthy();
        });
    });

    xdescribe('when calling onRightClick', () => {
        it('should broadcast the event', inject([Broadcaster], (broadcaster: Broadcaster) => {
            // Initialise inputs
            component.currentView = { _id: 'ViewID' };

            // set up spy
            spyOn(broadcaster, 'broadcast').and.stub();

            // Invoke target method
            component.onRightClick({ type: 'testEvent' }, { type: 'testInput' });

            expect(broadcaster.broadcast).toHaveBeenCalledWith('right-click-on-fieldViewID', {
                field: undefined,
                event: { type: 'testEvent' },
                inputElement: { type: 'testInput' }
            });
        }));
    });

    xdescribe('when calling onChange', () => {
        let contextServiceCopy;
        let eventsListenerCopy;
        let broadcasterCopy;

        beforeEach(inject(
            [ContextService, EventsListenerService, Broadcaster],
            (
                contextService: ContextService,
                eventListener: EventsListenerService,
                broadcaster: Broadcaster
            ) => {
                contextServiceCopy = contextService;
                eventsListenerCopy = eventListener;
                broadcasterCopy = broadcaster;

                // Initialise state
                component.setField = {
                    CodeCode: 'TestMultiselect',
                    CodeValue: ['001', '002', '003']
                };
                component.field['originalValue'] = [
                    { _id: '001', label: 'first' },
                    { _id: '002', label: 'second' },
                    { _id: '003', label: 'third' }
                ];
                component.field.options = [
                    { _id: '001', label: 'first' },
                    { _id: '0015', label: '1st' },
                    { _id: '002', label: 'second' },
                    { _id: '0025', label: '2nd' },
                    { _id: '003', label: 'third' },
                    { _id: '0035', label: '3rd' }
                ];

                // Set up spies
                spyOn(contextService, 'saveDataChangeState').and.stub();
                spyOn(eventListener, 'onEventUpdate').and.stub();
                spyOn(broadcaster, 'broadcast').and.stub();
            }
        ));

        describe('for multiselect not used in a grid', () => {
            it('should appropriately react to change in value', () => {
                // Set the CodeType of currentView to data form
                component.currentView = {
                    _id: 'SomeID',
                    CodeType: StandardCodes.CODE_TYPE_DATA_FORM
                };

                // Now let's suppose the current selection had changed and the onChange method is triggered
                component.onChange({ value: ['001', '003'] });

                expect(component.field.CodeValue).toEqual(
                    ['001', '003'],
                    'field.CodeValue was not updated'
                );
                expect(component.field.isDirty).toBe(true, 'field was not marked as dirty');
                expect(contextServiceCopy.saveDataChangeState).toHaveBeenCalled();
                expect(eventsListenerCopy.onEventUpdate).toHaveBeenCalledWith({
                    eventType: 'field_update',
                    eventName: 'TestMultiselect'
                });
                expect(broadcasterCopy.broadcast).not.toHaveBeenCalled();
            });
        });

        describe('for multiselect used in a grid', () => {
            it('should appropriately react to change in value', () => {
                // Set the CodeType of currentView to something other than data form
                component.currentView = {
                    _id: 'SomeID',
                    CodeType: StandardCodes.DATA_GRID
                };

                // Now let's suppose the current selection had changed and the onChange method is triggered
                component.onChange({ value: ['001', '003'] });

                expect(component.field.CodeValue).toEqual(
                    ['001', '003'],
                    'field.CodeValue was not updated'
                );
                expect(contextServiceCopy.saveDataChangeState).not.toHaveBeenCalled();
                expect(component.field.isDirty).toBe(true, 'field was not marked as dirty');
                expect(eventsListenerCopy.onEventUpdate).not.toHaveBeenCalled();
                expect(broadcasterCopy.broadcast).toHaveBeenCalledWith('SomeIDcolumn_filter', {
                    source: 'searchColumn',
                    CodeElement: 'TestMultiselect',
                    CodeDescription: undefined,
                    CodeFilterType: undefined,
                    CodeSubField: 'CodeDescription',
                    value: [
                        { _id: '001', label: 'first' },
                        { _id: '003', label: 'third' }
                    ],
                    values: component.field.options
                });
            });
        });
    });
});
