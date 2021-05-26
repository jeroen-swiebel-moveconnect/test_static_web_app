import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { DateComponent } from './date.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { GridService } from '../../../services/grid-service';
import { ToastService } from '../../../services/toast.service';
import { PageMappingService } from '../../../services/page-mapping.service';
import { StandardCodes } from '../../../constants/StandardCodes';
import { Broadcaster } from '../../../services/broadcaster';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../services/user-service';
import { ContextService } from '../../../services/context.service';
import { QuickTextHandlerService } from '../../../services/quick-text-handler.service';
import { CacheService } from '../../../services/cache.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CollectionsService, LoginService, RequestHandler } from '../../../services';
import { DialogConfigurationService } from '../../../services/dialog-configuration.service';
import { HttpProvider, WebApiProvider, WebBaseProvider } from '../../../providers';
import { TestingModule } from '../../../app-testing.module';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

xdescribe('DateComponent', () => {
    let component: any;
    let fixture: ComponentFixture<DateComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DateComponent],
            providers: [
                ToastService,
                PageMappingService,
                DynamicDialogConfig,
                DialogService,
                GridService,
                UserService,
                ContextService,
                QuickTextHandlerService,
                CacheService,
                CollectionsService,
                RequestHandler,
                LoginService,
                DialogConfigurationService,
                CacheService,
                Broadcaster,
                WebApiProvider,
                WebBaseProvider,
                RequestHandler,
                HttpProvider,
                DataFormService
            ],
            imports: [RouterTestingModule, TranslateModule.forRoot(), TestingModule],
            schemas: [NO_ERRORS_SCHEMA]
        });

        fixture = TestBed.createComponent(DateComponent);
        component = fixture.componentInstance;
    });

    it('should initialise the component', () => {
        expect(component).toBeDefined();
    });

    describe('when calling ngOnInit', () => {
        it('should appropriately init the component', () => {
            // Initialise inputs
            const currentDate = new Date().toString();
            component.field = { _id: 'FieldID', isTableCell: false, CodeValue: currentDate };
            component.currentView = { _id: 'ViewID', CodeType: StandardCodes.DATA_GRID };
            component.currentRecord = { _id: 'RecordID' };

            // Invoke target method
            component.ngOnInit();

            expect(component.date.toString()).toEqual(currentDate);
            expect(component.isRange).toEqual(false);
            expect(component.field.dataClass).toEqual('');
        });
    });

    describe('when calling onRightClick', () => {
        it('should broadcast appropriate event', inject(
            [Broadcaster],
            (broadcaster: Broadcaster) => {
                // Initialise inputs
                component.field = { _id: 'FieldID' };
                component.currentView = { _id: 'ViewID' };

                // Set up spy
                spyOn(broadcaster, 'broadcast').and.stub();

                // Invoke target method
                component.onRightClick({ _id: 'EventID' }, { _id: 'InputID' });

                expect(broadcaster.broadcast).toHaveBeenCalledWith('right-click-on-fieldViewID', {
                    field: { _id: 'FieldID' },
                    event: { _id: 'EventID' },
                    inputElement: { _id: 'InputID' }
                });
            }
        ));
    });

    describe('when calling onInput', () => {
        beforeEach(() => {
            // Initialise input field
            component.field = { _id: 'FieldID', isEditableCell: false };
        });

        describe('and when field is not an editable cell', () => {
            it('should appropriately set the isDateField flag', () => {
                // Invoke target method
                component.onInput({ target: { value: 'some date value' } });

                expect(component.isDateField).toBe(true);
                expect(component.field.CodeValue).toBeFalsy();

                // Invoke target method
                component.onInput({ target: { value: '@@test' } });

                expect(component.isDateField).toBe(false);
                expect(component.field.CodeValue).toBe('@@');
            });
        });

        describe('and when field is an editable cell', () => {
            it('should appropriately set the isDateField flag', () => {
                // Invoke target method
                component.onInput({ target: { value: 'some date value' } });

                expect(component.isDateField).toBe(true);

                // Invoke target method
                component.onInput({ target: { value: '@@test' } });

                expect(component.isDateField).toBe(false);
            });
        });
    });

    describe('when calling onChange', () => {
        const currentDate = new Date();

        beforeEach(() => {
            // Initialise inputs
            component.field = {
                _id: 'FieldID',
                isTableCell: false,
                CodeCode: 'Date',
                CodeDataType: 'Date',
                CodeDescription: 'Date',
                CodeFilterType: undefined,
                CodeValue: currentDate
            };
            component.currentView = { _id: 'ViewID', CodeType: StandardCodes.DATA_GRID };
            component.currentRecord = { _id: 'RecordID' };
        });

        describe('for date', () => {
            it('should appropriately update the state', () => {
                // Invoke target method
                component.onChange({ value: currentDate });

                expect(component.field.CodeValue.toString()).toEqual(currentDate.toString());
                expect(component.field.isDirty).toBe(true);
            });
        });

        describe('for date range', () => {
            it('should appropriately update the state and broadcast event', inject(
                [Broadcaster],
                (broadcaster: Broadcaster) => {
                    component.isRange = true;

                    // Set up spy
                    spyOn(broadcaster, 'broadcast').and.stub();

                    // Invoke target method
                    component.onChange({ startDate: currentDate, endDate: currentDate });

                    expect(broadcaster.broadcast).toHaveBeenCalledWith('ViewIDcolumn_filter', {
                        source: 'searchColumn',
                        CodeElement: 'Date',
                        CodeDataType: 'Date',
                        CodeDescription: 'Date',
                        CodeFilterType: undefined,
                        value: [currentDate, currentDate],
                        values: ''
                    });
                }
            ));
        });
    });

    describe('when calling onValueSelect', () => {
        it('should appropriately update the state', () => {
            // Initialise
            const currentDate = new Date().toString();
            component.field = { _id: 'FieldID', isTableCell: false, CodeValue: currentDate };

            // Invoke target method
            component.onValueSelect({});

            expect(component.field.CodeValue).not.toBe('hello world'); // TODO: Need to finalise this test
            expect(component.valueSelected).toBe(false);
        });
    });

    describe('when calling onFocusOut', () => {
        it('should appropriately update the state', () => {
            // Initialise
            const currentDate = new Date();
            component.field = {
                _id: 'FieldID',
                isTableCell: false,
                CodeValue: new Date('01-01-2000'),
                CodeDataType: 'Date Time'
            };
            component.currentRecord = { _id: 'RecordID' };

            // Invoke target method
            component.onFocusOut({ model: { value: currentDate } });

            expect(component.field.CodeValue).toEqual(currentDate);
        });
    });

    describe('when calling getQuickTexts', () => {
        it('TODO', () => {
            pending(); // TODO: Should complete this test case
        });
    });

    describe('when calling clearAll', () => {
        it('should appropriately update the state', inject(
            [Broadcaster],
            (broadcaster: Broadcaster) => {
                // Initialise
                const currentDate = new Date();
                component.field = {
                    _id: 'FieldID',
                    isTableCell: false,
                    isEditableCell: false,
                    CodeCode: 'Date',
                    CodeDataType: 'Date',
                    CodeDescription: 'Date',
                    CodeFilterType: undefined,
                    CodeValue: currentDate
                };
                component.currentView = {
                    _id: 'ViewID',
                    CodeType: StandardCodes.DATA_GRID
                };
                component.currentRecord = { _id: 'RecordID' };
                component.date = currentDate;

                // Set up spy
                spyOn(broadcaster, 'broadcast').and.stub();

                // Invoke target method
                component.clearAll();

                expect(component.date).toBeNull();
                expect(component.field.isDirty).toBe(true);
                expect(component.field.CodeValue).toBeNull();
                expect(broadcaster.broadcast).toHaveBeenCalledWith('ViewIDcolumn_filter', {
                    source: 'searchColumn',
                    CodeElement: 'Date',
                    CodeDataType: 'Date',
                    CodeDescription: 'Date',
                    CodeFilterType: undefined,
                    value: '',
                    values: ''
                });
            }
        ));
    });
});
