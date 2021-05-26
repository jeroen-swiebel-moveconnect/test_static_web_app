import { ComponentFixture, TestBed, inject, async } from '@angular/core/testing';
import { ToggleButtonComponent } from './togglebutton.component';
import { TranslateModule } from '@ngx-translate/core';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { HttpClientModule } from '@angular/common/http';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { RouterTestingModule } from '@angular/router/testing';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
import { TestingModule } from '../../../app-testing.module';

fdescribe('ToggleButtonComponent', () => {
    let component: ToggleButtonComponent;
    let fixture: ComponentFixture<ToggleButtonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ToggleButtonComponent],
            providers: [
                testInterface,
                ContextService,
                GridService,
                Broadcaster,
                DialogService,
                DynamicDialogConfig,
                PageMappingService,
                DataFormService
            ],
            imports: [
                TranslateModule.forRoot(),
                HttpClientModule,
                RouterTestingModule,
                TestingModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToggleButtonComponent);
        component = fixture.componentInstance;
        component.field = TestBed.get(testInterface);
        component.onLabel = 'Yes';
        component.offLabel = 'No';
        fixture.detectChanges();
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('when calling setField', () => {
        let field: any = { CodeCode: 'AdustHeight', CodeValue: true };
        beforeEach(() => {
            component.setField = field;
        });
        it('should set field', () => {
            expect(component.field).toEqual(field);
        });
        it('should set value', () => {
            expect(component.value).toEqual(component.onLabel);
        });
    });
    describe('when calling setCurrentRecord', () => {
        beforeEach(() => {
            component.setCurrentRecord = { CodeCode: 'Adjust Height' };
        });
        it('should set currentRecoord value', () => {
            expect(component.currentRecord).toEqual({ CodeCode: 'Adjust Height' });
        });
    });
    describe('when calling markDirty', () => {
        let event: any = { handleEvent: () => {} };
        beforeEach(() => {
            component.field.CodeColumnFilterType = '';
            component.field.CodeCode = 'CodeValue';
            // component.markDirty();
        });
        it('should set value', () => {
            component.currentView = { CodeType: 'Data Form' };
            component.value = 'Yes';
            component.markDirty();
            expect(component.field.CodeValue).toEqual(false);
            expect(component.field.isDirty).toEqual(true);
        });
        it('should behave...', inject([Broadcaster], (broadcaster: Broadcaster) => {
            component.currentView = { CodeType: 'Data Grid' };
            spyOn(broadcaster, 'broadcast').and.stub();
            component.markDirty();
            expect(broadcaster.broadcast).toHaveBeenCalled();
        }));
        it('should behave...', inject([GridService], (gridService: GridService) => {
            component.currentRecord = {};
            component.field['isTableCell'] = true;
            component.field.CodeCode = 'AdjustHeight';
            component.field.CodeValue = false;
            component.markDirty();
            expect(component.currentRecord['AdjustHeight']).toEqual(false);
        }));
    });
});
