import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { ContextService } from 'src/app/moveware/services/context.service';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CacheService } from 'src/app/moveware/services/cache.service';
import Utils from 'src/app/moveware/services/utils';
import {
    ContextMenuService,
    EditSettingsModel,
    GridComponent,
    GroupService,
    InfiniteScrollService,
    InfiniteScrollSettingsModel,
    LazyLoadGroupService,
    PageService,
    VirtualScrollService
} from '@syncfusion/ej2-angular-grids';
import { MenuEventArgs } from '@syncfusion/ej2-navigations';
import { DataManager, Query, UrlAdaptor } from '@syncfusion/ej2-data';

import { GridService } from '../../../../services/grid-service';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'groupby-grid',
    templateUrl: './groupby-grid.component.html',
    styleUrls: ['./groupby-grid.component.scss'],
    providers: [
        DialogService,
        DynamicDialogConfig,
        LazyLoadGroupService,
        VirtualScrollService,
        ContextMenuService,
        InfiniteScrollService,
        GroupService,
        PageService
    ]
})
export class GroupbyGridComponent implements OnInit, AfterViewInit {
    @Output() onRecordSelect = new EventEmitter<any>();
    @Output() onContextMenuSelect = new EventEmitter<any>();
    @Input() isEditableGrid: boolean;
    @Input() selectedRecord: any;
    @Input() gridData: any;
    @Output() onGridSearch = new EventEmitter<any>();
    @Input() gridHeaders: any;
    @Input() columnSearchFilter: any;
    @Input() selectedFilters: any;
    @Input() searchFilters: any;
    @Output() onGridSort = new EventEmitter<any>();
    @Input() gridsterCelWidth: Number;
    @Input() densityIndex: Number;
    @Input() showColumnFilter: boolean;
    @Input() currentFocusedField: any;
    @Input() currentPage: any;
    @Input() currentView: any;
    @Input() isLoading: boolean;
    @Input() groupByColumns: any;
    @Input() sortState: Array<any>;
    @Input() rowHeight: any;
    @Input() gridLines: any;
    @Input() limit: number;
    @Input() metaData: any;
    @Input() allColumns: any;
    @Input() headerVisible: boolean;
    @Input() gridRowShading: any;
    @Input() contextMenus: boolean;
    translationContext: any = {};
    groupPathData: any = {};
    selectedRows: [];
    groupByHeaderMap = {};
    query: any;
    data: any;
    columns: any;
    public initial = true;
    allColumnsCopy: any[];
    // public lazyLoadData: Object[] = lazyLoadData;
    @ViewChild('grid') gridInstance: GridComponent;
    public groupSettings: object;
    infiniteOptions: InfiniteScrollSettingsModel;
    public pageSettings: object = { pageSize: 100 };
    public editSettings: EditSettingsModel;
    public state: any = [];
    public selectedRowIndex = 0;
    constructor(
        private gridService: GridService,
        private contextService: ContextService,
        private cacheService: CacheService
    ) {}
    ngAfterViewInit(): void {
        this.gridService.setVirtualGridHeight(
            this.gridInstance,
            this.currentView._id,
            true,
            false,
            this.rowHeight,
            true
        );
    }

    public ngOnInit(): void {
        this.infiniteOptions = { initialBlocks: 2 };
        let columns = [];
        this.groupByColumns.forEach((column) => {
            columns.push(column.CodeElement);
        });
        this.groupSettings = {
            enableLazyLoading: true,
            columns: columns,
            showDropArea: false,
            showGroupedColumn: false
        };
        this.editSettings = {
            allowEditing: false,
            allowAdding: true,
            allowDeleting: true
        };
        this.setSortOrderOnLoad();
        this.buildRequestQuery();
        this.data = new DataManager({
            url:
                environment.FRAMEWORK_QUERY_CONTEXT +
                'objects/container-search?page=2&limit=135&take=135&skip=0',
            adaptor: new UrlAdaptor(),
            headers: this.gridService.getHttpWithToken(),
            requestType: 'POST',
            crossDomain: true
        });
        this.translationContext[this.currentPage._id] = 'Data Grid.' + this.currentPage.CodeCode;
        this.columns = this.gridHeaders;
        if (this.allColumns && this.allColumns.length) {
            this.allColumnsCopy = Utils.getCopy(this.allColumns);
        } else {
            this.allColumnsCopy = Utils.getCopy(this.columns);
        }
    }
    /**
     * <p> To build the request to fetch data source from the server
     *
     */
    private buildRequestQuery() {
        this.contextService.removeContextOnAdd(
            this.currentPage.contextKey +
                this.contextService.getRootViewMap(this.currentPage.contextKey),
            this.currentView
        );
        let requestObject = this.gridService.getContainerSearchReq(
            this.contextService,
            this.currentPage,
            this.sortState,
            this.metaData,
            this.currentView._id,
            this.selectedFilters,
            this.sortState,
            this.groupByColumns,
            false,
            this.currentPage.contextKey,
            null
        );
        this.query = new Query().addParams('meta', () => {
            return requestObject.meta;
        });
        this.query.addParams('userId', () => {
            return this.cacheService.getUserId();
        });
        this.query.addParams('criteria', () => {
            return requestObject.criteria;
        });
        if (this.gridInstance) {
            // this.gridInstance.query = this.query;
        }
    }
    /**
     * <p> Event is raised when any grid specific actions are performed
     * @param event : grid action  event
     */
    actionBegin(event) {
        // if (event.requestType == 'refresh') {
        //     let indexes: number[] = [];
        //     let elements = this.gridInstance.element.querySelectorAll('.e-recordplusexpand');
        //     for (let i = 0; i < elements.length; i++) {
        //         let tr = elements[i].closest('tr');
        //         indexes.push((tr as HTMLTableRowElement).rowIndex);
        //     }
        //     this.state = indexes;
        //     console.log(this.state);
        // }
    }
    /**
     * <p> Event is raised when any grid specific actions are completed
     * @param event : grid action  event
     */
    actionComplete(event) {
        // if (event.requestType == 'refresh') {
        //     if (this.state.length) {
        //         let elements = this.gridInstance.getContentTable().querySelectorAll('tr');
        //         for (let i = 0; i < elements.length; i++) {
        //             let icon = elements[i].querySelector('.e-recordpluscollapse');
        //             if (icon && this.state.filter((ele) => ele == i).length) {
        //                 (icon as any).click(); // collapse the row after refreshing
        //             }
        //         }
        //     } else {
        //         this.gridInstance.groupModule.collapseAll();
        //     }
        //     this.gridInstance.selectRow(this.selectedRowIndex);
        // }
    }

    getTrackBy(item) {
        return item._id;
    }

    /**
     * sets the active sort state in the grid
     * @param column : contains the details of column on which sort is applied
     */
    private setSortState(column) {
        let subFiled = column.CodeSubField || 'CodeDescription';
        let undefinedIndex = -1;
        let elementIndex = -1;
        if (!(this.sortState && this.sortState.length)) {
            this.sortState = [];
        }
        this.sortState.forEach((element, i) => {
            if (element.hasOwnProperty('CodeElement') && element.CodeElement === column.CodeCode) {
                element['CodeOrder'] = column.sorted;
                if (!column.sorted) {
                    undefinedIndex = i;
                } else {
                    elementIndex = i;
                }
            }
        });
        if (undefinedIndex >= 0) {
            this.sortState.splice(undefinedIndex, 1);
        } else if (elementIndex < 0) {
            this.sortState.push({
                CodeElement: column.CodeCode,
                CodeSubField: subFiled,
                CodeOrder: column.sorted
            });
        }
    }

    /**
     * <p> To set the grid properties on load of grid data</p>
     */
    dataBound() {
        if (this.initial) {
            this.gridInstance.groupModule.collapseAll();
            this.initial = false;
        }
    }

    /**
     * <p> To load the details of selected row</p>
     * @param event : Hold the details of selected row
     */
    onRowSelection(node) {
        const dataChange = this.contextService.isDataChanged();
        if (dataChange) {
            dataChange.subscribe((result) => {
                if (result) {
                    this.contextService.removeDataChangeState();
                    this.selectedRecord = node;
                    this.onRecordSelect.emit(node);
                }
            });
        } else {
            this.selectedRecord = node;
            this.onRecordSelect.emit(node);
        }
    }

    /**
     * <p> To sord the grid data on selected column
     * @param column : Selected column to be sorted on
     */
    onSort(column) {
        if (!column.sorted) {
            column.sorted = 'ASC';
        } else if (column.sorted === 'ASC') {
            column.sorted = 'DESC';
        } else if (column.sorted === 'DESC') {
            column.sorted = undefined;
        }
        this.setSortState(column);
        this.buildRequestQuery();
    }

    /**
     * <p>To hide and show the grid columns</p>
     *
     * @see {@link GroupbyGridComponent#hideColumns}
     * @see {@link GroupbyGridComponent#showColumns}
     */
    private controlColumnVisibility() {
        if (this.gridInstance) {
            let hiddenColumns = [];
            let visibleColumns = [];
            this.allColumns.forEach((element, index) => {
                if (!this.isColumnAvailable(element) || this.isColumnGrouped(element)) {
                    hiddenColumns.push(element.CodeCode);
                } else {
                    visibleColumns.push(element.CodeCode);
                }
            });
            let _visibleColumns = [];
            let _hiddenColumns = [];
            this.gridInstance.columns.forEach((col) => {
                if (col.visible) {
                    _visibleColumns.push(col.field);
                } else {
                    _hiddenColumns.push(col.field);
                }
            });
            hiddenColumns = hiddenColumns.filter(function (fieldCode) {
                return !_hiddenColumns.includes(fieldCode);
            });
            visibleColumns = visibleColumns.filter(function (fieldCode) {
                return !_visibleColumns.includes(fieldCode);
            });
            if (hiddenColumns.length) {
                this.gridInstance.hideColumns(hiddenColumns);
            }
            if (visibleColumns.length) {
                this.gridInstance.showColumns(visibleColumns);
            }
            //  this.gridInstance.refreshColumns();
        }
    }

    /**
     * <p> To check if column is a display column
     * @param column : selected column
     */
    private isColumnAvailable(column) {
        let index = Utils.getIndexByProperty(this.columns, 'CodeCode', column.CodeCode);
        return index >= 0;
    }

    /**
     * <p> To check if column is a display column
     * @param column : selected column
     */
    private isColumnGrouped(column) {
        let index = Utils.getIndexByProperty(this.groupByColumns, 'CodeElement', column.CodeCode);
        return index >= 0;
    }

    /**
     * <p> Sets the selectedColumns of the component </p>
     *
     * @param columns : metadata for columns
     */
    set setSelectedColumns(columns) {
        this.columns = columns;
        this.columns.forEach((column) => {
            this.allColumnsCopy.forEach((allColumn) => {
                if (column.CodeCode === allColumn.CodeCode) {
                    allColumn.CodeValue = column.CodeValue;
                }
            });
        });
        this.setReorder();
        this.controlColumnVisibility();
    }

    /**
     * <p> Sets the order of the columns in the grid </p>
     *
     * @param columns : metadata for columns
     */
    private setReorder() {
        let codes = this.gridService.getColumnCodes(this.columns);
        this.gridInstance.reorderColumns(codes, codes[0]);
    }

    /**
     * <p> To set the grid column visiblity after creation.
     */
    onGridCreate(event) {
        this.setReorder();
        this.controlColumnVisibility();
    }

    /**
     * sets the grid lines of grid
     * @param gridLines : gridline setting
     */
    setGridLines(gridLines) {
        this.gridLines = gridLines;
        if (this.gridInstance) {
            this.gridInstance.gridLines = gridLines;
        }
    }

    /**
     * sets the active colums filter state in the grid
     * @param data : contains the details of filter state
     */
    set setSelectedFilters(data) {
        this.selectedFilters = data;
        this.buildRequestQuery();
    }
    /**
     * sets the row height of grid
     * @param rowHeight : rowHeight setting
     */
    set setRowHeight(rowHeight) {
        this.rowHeight = rowHeight;
        if (this.gridInstance) {
            this.gridInstance.rowHeight = rowHeight;
        }
    }
    /**
     * <p> Adds the record to grid </p>
     * @param record : data of the row to be added
     */
    addRecordToGrid(record) {
        let indexes = this.gridInstance.getSelectedRowIndexes();
        if (indexes != null) {
            this.gridInstance.addRecord(record);
        }
    }

    /**
     * <p> Deletes the record from grid </p>
     *
     */
    deleteRecordFromGrid() {
        let indexes = this.gridInstance.getSelectedRowIndexes();
        if (indexes != null) {
            this.gridInstance.deleteRecord();
        }
    }
    /**
     * <p> Refreshes the grid upon button click </p>
     *
     */
    refreshGrid() {
        if (this.gridInstance) {
            this.gridInstance.refresh();
        }
    }
    /**
     * Updates the data of row in the grid
     * @param record : the data of record to be updated
     */
    updateRecord(record) {
        const selectedRows = this.gridInstance.getSelectedRowIndexes();
        if (selectedRows.length) {
            this.selectedRowIndex = selectedRows[0];
            let rows = this.gridInstance.getCurrentViewRecords();
            if (!Utils.isArrayEmpty(rows)) {
                let selectedRow = rows[this.selectedRowIndex];
                let updatedRow = Utils.getRowTobeUpdated(selectedRow, record);
                this.gridInstance.setRowData(selectedRow['_id'], updatedRow);
                this.gridInstance.refresh();
            }
        }
    }

    /**
     * Applies the groupby on updated columns
     * @param groupByColumns : the columns data to grouped
     */
    applyGrouping(groupByColumns) {
        this.groupByColumns = groupByColumns;
        let columns = [];
        this.groupByColumns.forEach((column) => {
            columns.push(column.CodeElement);
        });
        this.groupSettings = {
            enableLazyLoading: true,
            columns: columns,
            showDropArea: false,
            showGroupedColumn: false
        };
        this.gridInstance.groupModule.collapseAll();
        this.setSortOrderOnLoad();
        this.buildRequestQuery();
    }

    setSortOrderOnLoad() {
        let result = [];
        for (let i = 0; i < this.allColumns.length; i++) {
            if (this.allColumns[i].sorted !== undefined && this.allColumns[i].sorted !== '') {
                result.push({
                    CodeElement: this.allColumns[i].CodeCode,
                    CodeSubField: this.allColumns[i].CodeSubField || 'CodeDescription',
                    CodeOrder: this.allColumns[i].sorted
                });
            }
        }
        this.sortState = result;
    }

    /**
     * <p>Triggers when click on context menu.</p>
     * @param args mouse event
     */
    contextMenuClick(args: MenuEventArgs): void {
        if (
            args.item['action'] &&
            args.item['action'].Task?.CodeCode === StandardCodes.TASK_PRINT_CODE
        ) {
            this.gridInstance.print();
        } else {
            this.onContextMenuSelect.emit(args);
        }
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
