import { TestBed, ComponentFixture, fakeAsync, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SelectButtonComponent } from './selectbutton.component';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { GridService } from 'src/app/moveware/services/grid-service';
import { AppModule } from 'src/app/moveware/app.module';
import Utils from 'src/app/moveware/services/utils';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ContextService } from 'src/app/moveware/services/context.service';
import { DialogConfigurationService } from 'src/app/moveware/services/dialog-configuration.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { PrimeNGModule } from 'src/app/moveware/primeng.module';
import { SharedModule } from 'src/app/moveware/shared.modules';
import { DialogService, DynamicDialogConfig, MessageService } from 'primeng';
import { TranslateModule } from '@ngx-translate/core';
import { ExpectedConditions } from 'protractor';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
import { TestingModule } from '../../../app-testing.module';
fdescribe('SelectButtonComponent', () => {
    let component: SelectButtonComponent;
    let fixture: ComponentFixture<SelectButtonComponent>;
    beforeEach(async () => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [SelectButtonComponent],
            providers: [
                testInterface,
                GridService,
                ContextService,
                DialogService,
                DynamicDialogConfig,
                MessageService,
                ToastService,
                DialogConfigurationService,
                DataFormService
            ],
            imports: [
                RouterTestingModule,
                HttpClientTestingModule,
                FormsModule,
                SharedModule,
                TranslateModule.forRoot(),
                TestingModule
            ]
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(SelectButtonComponent);
        component = fixture.componentInstance;
        component.field = TestBed.get(testInterface);
        spyOn(Utils, 'isObjectEmpty').and.stub();
        component.currentView = { _id: 'hf-fchE_HF-YFBT-6ksdi-udiftdy' };
        fixture.detectChanges();
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('when calling setField', () => {
        let field: any = { CodeCode: 'CodeNotes', CodeValue: 'some values' };
        beforeEach(() => {
            component.setField = field;
        });
        it('should set field', () => {
            expect(component.field).toEqual(field);
        });
    });
    describe('when calling setCurrentRecord', () => {
        beforeEach(() => {
            component.setCurrentRecord = { CodeCode: 'Details Accounts' };
        });
        it('should set currentRecoord value', () => {
            expect(component.currentRecord).toEqual({ CodeCode: 'Details Accounts' });
        });
    });
    describe('when calling markDirty', () => {
        let value = {
            CodeCode: 'Active',
            CodeDescription: 'Active',
            _id: '7769626e-e769-42a3-a03a-42e3d6967d08',
            isChecked: false,
            label: 'Active'
        };
        let event: any = { handleEvent: () => {} };
        beforeEach(() => {
            component.field.CodeColumnFilterType = '';
            component.field.CodeCode = 'CodeStatus';
        });
        it('should set currentRecoord value', inject([GridService], (gridService: GridService) => {
            component.currentView = { CodeType: 'Data Form' };
            spyOn<any>(component, 'setSelectedOptions').and.stub();
            component.markDirty(value);
            expect(component.field.CodeValue).toEqual(value);
            expect(component['setSelectedOptions']).toHaveBeenCalledWith(component.field);
        }));
        it('should behave...', inject([Broadcaster], (broadcaster: Broadcaster) => {
            component.currentView = { CodeType: 'Data Grid' };
            spyOn(broadcaster, 'broadcast').and.stub();
            component.markDirty(value);
            expect(broadcaster.broadcast).toHaveBeenCalled();
        }));
        it('should behave...', inject([GridService], (gridService: GridService) => {
            component.currentRecord = {};
            component.field['isTableCell'] = true;
            component.markDirty(value);
            expect(component.currentRecord['CodeStatus']).toEqual('Active');
        }));
    });
});
