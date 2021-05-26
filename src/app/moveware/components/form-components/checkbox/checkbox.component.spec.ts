import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EventsListenerService } from 'src/app/moveware/services';
import { CheckboxComponent } from './checkbox.component';
import { FieldConfig } from 'src/app/moveware/models';
import Utils from 'src/app/moveware/services/utils';
import { GridService } from 'src/app/moveware/services/grid-service';
import { MessageService, DialogService, DynamicDialogConfig } from 'primeng';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { TranslateModule } from '@ngx-translate/core';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

describe('CheckboxComponent', () => {
    let component: CheckboxComponent;
    let fixture: ComponentFixture<CheckboxComponent>;
    let field = {
        CodeCode: 'Test',
        CodeFilterDefault: 'Test',
        CodeEnabled: 'Yes',
        CodeType: 'Field',
        CodeFieldType: 'Check Box',
        DynamicField: true,
        allActions: true
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [CheckboxComponent],
            providers: [
                EventsListenerService,
                MessageService,
                ToastService,
                PageMappingService,
                GridService,
                DialogService,
                DynamicDialogConfig,
                Broadcaster,
                testInterface,
                DataFormService
            ],
            imports: [RouterModule, RouterTestingModule, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(CheckboxComponent);
        component = fixture.componentInstance;
        component.field = TestBed.get(testInterface);
        component.currentView = { _id: '' };
    });

    it('can load instance', () => {
        expect(component).toBeDefined();
    });

    describe('when calling set', () => {
        it('should set field', () => {
            component.field = field;
            expect(component.field).toEqual(field);
        });
    });

    describe('when calling setCurrentRecord', () => {
        it('should set currentRecord', () => {
            component.currentRecord = field;
            expect(component.currentRecord).toEqual(field);
        });
    });

    describe('when calling markDirty', () => {
        let markDirtySpy: jasmine.Spy;
        let eventsListener: EventsListenerService;
        let value = { label: 'FieldType', CodeCode: 'FileSubType' };

        beforeEach(() => {
            markDirtySpy = spyOn<any>(component, 'markDirty').and.callThrough();
            eventsListener = TestBed.get(EventsListenerService);
            spyOn(Utils, 'isEventSource').and.returnValue(true);
        });

        // expect saveDataChangeState to be called if on a Data Form
        it('should call saveDataChangeState', inject(
            [ContextService],
            (contextService: ContextService) => {
                spyOn(contextService, 'saveDataChangeState').and.stub();
                component.currentView['CodeType'] = 'Data Form';
                markDirtySpy.call(component);
                expect(contextService.saveDataChangeState).toHaveBeenCalled();
                expect(component.field['isDirty']).toBe(true);
            }
        ));

        // expect onEventUpdate to be called if event on a Data Form
        it('should call EventsListener.onEventUpdate', () => {
            spyOn(eventsListener, 'onEventUpdate').and.stub();
            component.currentView['CodeType'] = 'Data Form';
            component.globalEventsNames = ['dummyName'];
            markDirtySpy.call(component);
            expect(Utils.isEventSource).toHaveBeenCalled();
            expect(eventsListener.onEventUpdate).toHaveBeenCalled();
        });

        // expect Broadcast column filter changes if control is used on grid
        it('should call broadcast', inject([Broadcaster], (broadcaster: Broadcaster) => {
            spyOn(broadcaster, 'broadcast').and.stub();
            let data = {
                source: 'searchColumn',
                CodeElement: field['CodeCode'],
                CodeDescription: undefined,
                CodeFilterType: field['CodeFieldType'],
                value: '',
                values: ''
            };
            component.field = field;
            component.currentView['CodeType'] = 'Data Grid';
            component.currentRecord = field;
            markDirtySpy.call(component);
            expect(broadcaster.broadcast).toHaveBeenCalledWith('column_filter', data);
        }));
    });
});

// Don't think this should be here; it is also referenced by other spec files
export class testInterface implements FieldConfig {
    CodeDescription?: string;
    name?: string;
    CodeEnabled: string;
    inputType?: string;
    options?: string[];
    collections?: any;
    CodeType: string;
    CodeValue?: any;
    validations?: Validator[];
    overrides?: any;
    CodeCode: string;
    CodeFieldType: string;
    _id?: string;
    CodeRequired?: boolean;
    parameterNames?: Array<string>;
    CodePlaceholder?: string;
    DynamicField: any;
    CodeHyperlink?: boolean;
    CodeActions?: Array<any>;
    IsParentContext?: any;
    allActions: any;
    isOnlyLookup?: boolean;
    groupHeaderClass?: string;
    groupDataClass?: string;
    headerClass?: string;
    dataClass?: string;
    CodeFilterDefault: any;
    ResultComponent?: any;
    ResultLocation?: any;
    CodeCollapsible?: string;
    CodeCollapsed?: string;
    Children?: string[];
    CodeHideLabel?: boolean;
    CodeLookupEnabled?: boolean;
    CodeDisplay?: any;
    isDirty?: boolean;
    CodeTooltip?: string;
    CodeElement?: string;
    CodeParentField?: any;
    CodeDataType?: string;
    isEditableCell?: boolean;
    CodeColumnFilterType?: string;
    CodeFilterType?: string;
    CodeSubField?: string;
    isTableCell?: boolean;
    CodeHelp?: any;
    CodeRatingIconOn?: any;
    CodeRatingIconOff?: any;
}
export interface Validator {
    name: string;
    validator: any;
    message: string;
}
