import { TestBed, ComponentFixture, fakeAsync, inject, flush } from '@angular/core/testing';
import {
    EditService,
    GroupService,
    VirtualScrollService,
    ResizeService,
    RowDDService,
    ColumnChooserService,
    ForeignKeyService,
    SelectionService,
    SelectionSettingsModel,
    FilterService,
    ReorderService,
    SortEventArgs
} from '@syncfusion/ej2-angular-grids';
import { EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ToolbarComponent, ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { TestingModule } from '../../app-testing.module';
import { actionEvents } from '@syncfusion/ej2-angular-spreadsheet';
import { FilterPane } from './filterpane.component';
import { GridService } from 'src/app/moveware/services/grid-service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
fdescribe('FilterPane component', () => {
    let component: FilterPane;
    let fixture: ComponentFixture<FilterPane>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [FilterPane],
            providers: [GridService, DynamicDialogRef, DynamicDialogConfig],
            imports: [TestingModule]
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(FilterPane);
        component = fixture.componentInstance;
        component.config.data = {
            data: {
                currentview: {},
                currentPage: {},
                currentRecord: {},
                currentType: '',
                filterList: [],
                displayedColumns: [],
                selectedColumns: [],
                groupOptions: [],
                task: ''
            }
        };

        spyOn<any>(component, 'setFieldProrerties').and.returnValue(-1);
        fixture.detectChanges();
    });
    it('component initialization', () => {
        expect(component).toBeDefined();
    });

    describe('when calling onDialogCloseAndApply', () => {
        let dialogRef: DynamicDialogRef;

        beforeEach(inject([DynamicDialogRef], (injectDialogRef: DynamicDialogRef) => {
            dialogRef = injectDialogRef;
            spyOn(dialogRef, 'close').and.stub();
        }));
        it('should dialog close Method', () => {
            component.taskCode = 'Filter List';
            component.onDialogCloseAndApply();
            expect(dialogRef.close).toHaveBeenCalled();
        });
        it('should dialog close with event Method', () => {
            component.taskCode = 'Column List';
            component.onDialogCloseAndApply();
            expect(dialogRef.close).toHaveBeenCalled();
        });
        it('should dialog close with event Method', () => {
            component.taskCode = 'Select Row Groups';
            component.onDialogCloseAndApply();
            expect(dialogRef.close).toHaveBeenCalled();
        });
    });
});
