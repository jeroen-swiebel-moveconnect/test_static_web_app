import { TestBed, ComponentFixture, fakeAsync, inject } from '@angular/core/testing';
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
import { GridView } from './grid-view.component';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import Utils from 'src/app/moveware/services/utils';
import { TranslateModule } from '@ngx-translate/core';
xdescribe('Grid View component', () => {
    let component: GridView;
    let fixture: ComponentFixture<GridView>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [GridView],
            providers: [
                RowDDService,
                SelectionService,
                EditService,
                ResizeService,
                FilterService,
                ReorderService,
                GroupService,
                VirtualScrollService
            ],
            imports: [GridModule, TranslateModule.forRoot()]
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(GridView);
        component = fixture.componentInstance;
        component.currentView = { _id: '' };
        fixture.detectChanges();
    });
    it('component initialization', () => {
        expect(component).toBeDefined();
    });
    describe('when calling setSelectionMode', () => {
        let setSelectionModeSpy;
        let _selectionOptions;
        beforeEach(() => {
            component.multiSelection = 'Single';
            setSelectionModeSpy = spyOn<any>(component, 'setSelectionMode').and.callThrough();
            _selectionOptions = { type: 'Single', mode: 'Row' };
        });
        it('selectionOptions show set', () => {
            expect(component.selectionOptions).toEqual(_selectionOptions);
        });
    });

    describe('when calling onSort with no sort order', () => {
        let column;
        beforeEach(() => {
            column = { CodeCode: 'CodeType', CodeDescription: 'Type' };
            component.onSort(column);
        });
        it('Sort order should be ASC', () => {
            expect(column.sorted).toEqual('ASC');
        });
    });
    describe('when calling onSort with sort order as ASC', () => {
        let column;
        beforeEach(() => {
            column = { CodeCode: 'CodeType', CodeDescription: 'Type', sorted: 'ASC' };
            component.onSort(column);
        });
        it('when sort order is ASC, should set  sort orader as DESC', () => {
            expect(column.sorted).toEqual('DESC');
        });
    });
    describe('when calling onSort with sort order DESC', () => {
        let column;
        beforeEach(() => {
            column = { CodeCode: 'CodeType', CodeDescription: 'Type', sorted: 'DESC' };
            component.onSort(column);
        });
        it('when sort order is DESC, should set sort orader be undefined', () => {
            expect(column.sorted).toBeUndefined();
        });
    });
    describe('when calling onSort', () => {
        let column;
        beforeEach(() => {
            column = { CodeCode: 'CodeType', CodeDescription: 'Type', sorted: 'DESC' };
            spyOn(component.onGridSort, 'emit');
            component.onSort(column);
        });
        it('Should emit an event', () => {
            let event = { data: column };
            expect(component.onGridSort.emit).toHaveBeenCalledWith(event);
        });
    });

    describe('when calling dataBound', () => {
        beforeEach(() => {
            // column = { CodeCode: "CodeType", CodeDescription: "Type", sorted: 'DESC' }
            spyOn(component.gridInstance, 'selectRow');
            component.dataBound({});
        });
        it('Should set selected row', () => {
            // let event = { data: column };
            expect(component.gridInstance.selectRow).toHaveBeenCalledWith(0);
        });
    });

    describe('when calling rowSelected', () => {
        let event;
        beforeEach(() => {
            event = { CodeCode: 'CodeType', CodeDescription: 'Type', sorted: 'DESC' };
            spyOn(component.onRecordSelection, 'emit');
            component.onRowSelection(event);
        });
        it('Should emit an event', () => {
            //let event = { data: column };
            expect(component.onRecordSelection.emit).toHaveBeenCalledWith(event);
        });
    });

    describe('when calling getTrackBy', () => {
        let id;
        let item;
        beforeEach(() => {
            item = { _id: '1234' };
            id = component.getTrackBy(item._id);
        });
        it('Should return id', () => {
            expect(id).toEqual(id);
        });
    });
    describe('when calling isColumnAvailable', () => {
        let index;
        let isColumnAvailableSpy;
        beforeEach(() => {
            isColumnAvailableSpy = spyOn<any>(component, 'isColumnAvailable').and.callThrough();
            spyOn(Utils, 'getIndexByProperty').and.stub();
            component.columns = [{ CodeCode: 'code' }];
            index = isColumnAvailableSpy({ CodeCode: 'Description' });
        });
        it('should return index', () => {
            expect(index).toBeFalsy();
        });
    });

    // public add(row): void {
    //   const rdata: object = row;
    //   (this.gridInstance.dataSource as object[]).unshift(rdata);
    //   this.gridInstance.refresh();
    // }
    describe('when calling add', () => {
        let gridInstance;
        let row = { CodeCode: 'Code', CodeDescription: 'Description' };
        beforeEach(() => {
            component.gridInstance.dataSource = [];
            spyOn<any>(gridInstance, 'dataSource').and.stub();
            spyOn<any>(gridInstance.dataSource, 'unShift').and.stub();
            // spyOn(component.gridInstance, "refresh").and.stub();
            // component.add(row)
        });
        it('should call refresh', () => {
            expect(gridInstance.refresh).toHaveBeenCalled();
        });
    });
    describe('when calling updateRecord', () => {
        let row = { CodeCode: 'Code' };
        // let isColumnAvailableSpy;
        let selectedRows = 1;
        beforeEach(() => {
            //  isColumnAvailableSpy = spyOn<any>(component, "isColumnAvailable").and.callThrough();
            spyOn(component.gridInstance, 'getSelectedRowIndexes').and.returnValue([0]);
            spyOn(component.gridInstance, 'refresh').and.stub();
            component.updateRecord(row);
        });
        it('should call setRowData', () => {
            expect(component.gridInstance.setRowData).toHaveBeenCalled();
        });
        it('should call setRowData', () => {
            expect(component.gridInstance.refresh).toHaveBeenCalled();
        });
    });
});
