import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { InputSwitchComponent } from './inputswitch.component';
import { EventsListenerService } from '../../../services';
import { GridService } from '../../../services/grid-service';
import { Broadcaster } from '../../../services/broadcaster';
import { DialogService } from 'primeng';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DialogConfigurationService } from '../../../services/dialog-configuration.service';
import { CacheService } from '../../../services/cache.service';
import { ToastService } from '../../../services/toast.service';
import { MessageService } from 'primeng/api';
import { RouterTestingModule } from '@angular/router/testing';
import { PageMappingService } from '../../../services/page-mapping.service';
import { ContextService } from '../../../services/context.service';
import { StandardCodes } from '../../../constants/StandardCodes';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
import { FormulaService } from '@syncfusion/ej2-angular-spreadsheet';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

xdescribe('InputSwitchComponent', () => {
    let component: InputSwitchComponent;
    let fixture: ComponentFixture<InputSwitchComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [InputSwitchComponent],
            providers: [
                MessageService,
                ToastService,
                PageMappingService,
                EventsListenerService,
                DynamicDialogConfig,
                DialogService,
                GridService,
                Broadcaster,
                DialogConfigurationService,
                CacheService,
                DataFormService
            ],
            imports: [TestingModule]
        });

        fixture = TestBed.createComponent(InputSwitchComponent);
        component = fixture.componentInstance;
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
            const field = { CodeValue: true };
            component.setField = field;

            expect(component.field.CodeValue).toEqual(field.CodeValue);
            expect(component.value).toBeTruthy();
        });
    });

    xdescribe('when calling onChange', () => {
        let contextServiceCopy;
        let broadcasterCopy;

        beforeEach(inject(
            [ContextService, Broadcaster],
            (contextService: ContextService, broadcaster: Broadcaster) => {
                contextServiceCopy = contextService;
                broadcasterCopy = broadcaster;

                // Let's suppose field is initialised with CodeValue set to true
                component.setField = { CodeCode: 'FromDate', CodeValue: true };

                // Set up spies
                spyOn(contextService, 'saveDataChangeState').and.stub();
                spyOn(broadcaster, 'broadcast').and.stub();
            }
        ));

        describe('for switch not used in a grid', () => {
            it('should appropriately react to change in value', () => {
                // Now let's suppose the value had changed and the onChange method is triggered
                component.value = false;
                component.onChange(new MouseEvent(''));

                expect(component.field.CodeValue).toBe(false, 'field.CodeValue was not updated');
                expect(contextServiceCopy.saveDataChangeState).toHaveBeenCalled();
                expect(component.field['isDirty']).toBe(true, 'field was not marked as dirty');
                expect(broadcasterCopy.broadcast).not.toHaveBeenCalled();
            });
        });

        describe('for switch used in a grid', () => {
            it('should appropriately react to change in value', () => {
                // Set the CodeType of currentView to something other than data form
                component.currentView = {
                    _id: 'SomeID',
                    CodeType: StandardCodes.DATA_GRID
                };

                // Now let's suppose the value had changed and the onChange method is triggered
                component.value = false;
                component.onChange(new MouseEvent(''));

                expect(component.field.CodeValue).toBe(false, 'field.CodeValue was not updated');
                expect(contextServiceCopy.saveDataChangeState).not.toHaveBeenCalled();
                expect(component.field['isDirty']).toBe(true, 'field was not marked as dirty');
                expect(broadcasterCopy.broadcast).toHaveBeenCalledWith('SomeIDcolumn_filter', {
                    source: 'searchColumn',
                    CodeElement: 'FromDate',
                    CodeDescription: undefined,
                    CodeFilterType: undefined,
                    value: false,
                    CodeSubField: 'CodeDescription',
                    values: ''
                });
            });
        });
    });
});
