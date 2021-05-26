import {
    Component,
    Input,
    OnInit,
    Output,
    ViewChild,
    EventEmitter,
    ViewEncapsulation,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    OnDestroy,
    HostListener
} from '@angular/core';
import {
    EditService,
    EditSettingsModel,
    GridComponent,
    SortService,
    GroupService,
    VirtualScrollService,
    ResizeService,
    RowDDService,
    SelectionService,
    SelectionSettingsModel,
    FilterService,
    ReorderService,
    ContextMenuService,
    ContextMenuItemModel,
    InfiniteScrollService,
    InfiniteScrollSettingsModel,
    IEditCell,
    PageSettingsModel,
    DetailRowService
} from '@syncfusion/ej2-angular-grids';
import { MenuEventArgs } from '@syncfusion/ej2-navigations';
import { DataManager, Query, UrlAdaptor } from '@syncfusion/ej2-data';
import { Broadcaster } from '../../../../services/broadcaster';
import { DataViewMetaData } from '../../../../models';
import { ContextService } from '../../../../services/context.service';
import { GridService } from '../../../../services/grid-service';
import { StandardCodes } from '../../../../constants/StandardCodes';
import { CacheService } from '../../../../services/cache.service';
import { environment } from '../../../../../../environments/environment';
import { CollectionsService } from 'src/app/moveware/services';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { UIActionService } from '../../../../services/ui-action.service';
import Utils from '../../../../services/utils';
import { Helpers } from '../../../../utils/helpers';
export const TOASTY_ERROR: string = 'error';

@Component({
    selector: 'grid-view',
    templateUrl: './grid-view.component.html',
    providers: [
        RowDDService,
        SelectionService,
        EditService,
        ResizeService,
        FilterService,
        DetailRowService,
        ReorderService,
        SortService,
        GroupService,
        VirtualScrollService,
        ContextMenuService,
        InfiniteScrollService
    ],
    styleUrls: ['./grid-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
/**
 * To load the data in Grid view
 *
 */
export class GridView implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    columns: any;
    metaData: DataViewMetaData;
    rowHeight: number;
    isCodeRowReorderable: boolean;
    allColumns: any;
    gridsterCelWidth: any;
    gridRowShading: any;
    @Output() onGridSort = new EventEmitter<any>();
    @Output() onRecordSelection = new EventEmitter<any>();
    @Output() onAddRecordSelection = new EventEmitter<any>();
    @ViewChild('gridView', { static: true })
    public gridInstance: GridComponent;
    @Input() dataSource: any;
    parentChildMap: any;
    @Input() currentView: any;
    @Input() currentPage: any;
    calculatedFields: any;
    @Input() multiSelection: string;
    @Output() onRowUnselect = new EventEmitter<any>();
    @Output() onRowReordering = new EventEmitter<any>();
    public editSettings: EditSettingsModel;
    public selectionOptions: SelectionSettingsModel;
    viewMode: string;
    sortState: any;
    dropState: { fIdx: any; dIdx: any; idxs: any[]; data: any };
    selectOptions: { type: string };
    reorderedData: any;
    headerVisible: boolean;
    isColumnFiltersVisible: boolean;
    gridLines: any;
    @Input() contextMenus: ContextMenuItemModel[];
    @Output() onContextMenuSelect = new EventEmitter<any>();
    public CODE_YES: string = StandardCodes.CODE_YES;
    selectedRowIndex: number = 0;
    filterOptions: any;
    allColumnsCopy: Array<any> = [];
    translationContext: any = {};
    query: Query;
    data: any;
    scrollMode: string = 'Virtual';
    infiniteOptions: InfiniteScrollSettingsModel;
    public pageSettings: object = { pageSize: 50 };
    selectFirst: boolean = true;
    splitterResizeEvent: any;
    gridEditMode: any;
    rowExpandAction: any;
    columnsMap: any;
    onRowExpandClick: (event: any) => void;
    constructor(
        private actionService: UIActionService,
        private contextService: ContextService,
        private gridService: GridService,
        private cacheService: CacheService,
        private collectionService: CollectionsService,
        private toastService: ToastService
    ) {}
    ngOnChanges(changes: SimpleChanges): void {}

    ngAfterViewInit(): void {
        if (this.gridInstance) {
            switch (this.scrollMode) {
                case StandardCodes.VIRTUAL:
                    this.gridInstance.dataSource = this.data;
                    this.gridInstance.enableVirtualization = true;
                    this.gridService.setVirtualGridHeight(
                        this.gridInstance,
                        this.currentView._id,
                        this.metaData.headerVisible,
                        this.metaData.isColumnFiltersVisible,
                        this.metaData.rowHeight,
                        null
                    );
                    break;
                case StandardCodes.INFINITE:
                    this.gridInstance.dataSource = this.data;
                    this.gridInstance.enableInfiniteScrolling = true;
                    this.gridInstance.infiniteScrollSettings = this.infiniteOptions;
                    break;
                default:
                    this.gridInstance.dataSource = this.dataSource;
                    break;
            }
        }
        this.registerOnDetailsRowExpandOrCollapse();
    }
    rowExpandCriteria;
    getActionMetaData(row) {
        //criteria
        if (this.rowExpandAction) {
            let criteria = this.actionService.getCriteria(
                row,
                Utils.getCopy(this.rowExpandAction['JSONParameter'])
            );
            this.rowExpandCriteria = { criteria: criteria };
        }
    }

    /**
     * registers he event which will get trigerred when expanding or collapsing a details row
     */
    registerOnDetailsRowExpandOrCollapse() {
        this.onRowExpandClick = (event: any) => {
            const ref = this;
            setTimeout(() => {
                let ExpandRowCell = Helpers.getExapndCell(event);
                if (ExpandRowCell) {
                    const rowIndex = ref.setDetailsExpanded(ExpandRowCell, true);
                    ref.gridInstance.selectRow(rowIndex);
                } else {
                    let collapseRowCell = Helpers.getCollapseCell(event);
                    if (collapseRowCell) {
                        ref.setDetailsExpanded(collapseRowCell, false);
                    }
                }
            }, 200);
        };
        if (this.rowExpandAction && this.gridInstance) {
            this.gridInstance.element.addEventListener('click', this.onRowExpandClick);
        }
    }
    /**
     * sets the detailsExapnded flag to the selected record
     * @param rowCell : row cell element eighter exoanded cell or collapsed cell
     * @returns : modified row index
     */
    private setDetailsExpanded(rowCell: Element, expanded) {
        const rowIndex = Helpers.getRowIndex(rowCell);
        let dataSource = this.gridInstance.getCurrentViewRecords();
        dataSource[rowIndex]['detailsExpanded'] = expanded;
        return rowIndex;
    }

    ngOnInit(): void {
        this.rowExpandAction = this.metaData.rowExpandAction;
        this.infiniteOptions = { initialBlocks: 2 };
        this.columns = this.metaData.selectedColumns;
        this.rowHeight = this.metaData.rowHeight;
        this.isCodeRowReorderable = this.metaData.isCodeRowReorderable;
        this.allColumns = this.metaData.allColumns;
        this.gridsterCelWidth = this.metaData.gridsterCelWidth;
        this.gridRowShading = this.metaData.rowShading;
        this.parentChildMap = this.metaData.parentChildMap;
        this.calculatedFields = this.metaData.calculatedFields;
        this.viewMode = this.metaData.viewMode;
        this.sortState = this.metaData.sortState;
        this.scrollMode = this.metaData.gridScrolling;
        this.filterOptions = this.metaData.filterOptions;
        this.headerVisible = this.metaData.headerVisible;
        this.isColumnFiltersVisible = this.metaData.isColumnFiltersVisible;
        this.gridEditMode = this.metaData.CodeGridEditMode;
        this.gridLines = this.metaData.gridLines;
        this.columnsMap = this.metaData.columnsMap;
        this.editSettings = {
            allowEditing: this.metaData.isEditableGrid,
            allowAdding: true,
            allowDeleting: true,
            mode: this.gridEditMode
        };
        if (this.scrollMode !== 'Default') {
            this.buildRequestQuery();
            this.data = new DataManager({
                url:
                    environment.FRAMEWORK_QUERY_CONTEXT +
                    'objects/container-search?page=0&limit=50&take=50&skip=0',
                adaptor: new UrlAdaptor(),
                headers: this.gridService.getHttpWithToken(),
                requestType: 'POST',
                crossDomain: true
            });
            // this.gridInstance.query = this.query;
        }

        this.setSelectionMode();
        this.allColumnsCopy = Utils.getCopy(this.allColumns);
        this.translationContext[this.currentPage._id] = 'Data Grid.' + this.currentPage.CodeCode;
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

    private setReorder() {
        let codes = this.gridService.getColumnCodes(this.columns);
        this.gridInstance.reorderColumns(codes, codes[0]);
    }

    actionComplete(event) {
        if (
            event.action === 'edit' &&
            event.requestType === 'save' &&
            this.gridEditMode === StandardCodes.EDIT_MODE_DIALOG
        ) {
            let gridEditPayload = this.gridService.getGridEditData();
            this.processGridEdit(gridEditPayload);
        }
        if (
            event.requestType === 'beginEdit' &&
            event.dialog &&
            this.gridEditMode === StandardCodes.EDIT_MODE_DIALOG
        ) {
            event.dialog.header = '';
        }
    }
    /**
     * <p> To show/hide the columns based on Selected columns on Filterpane</p>
     */
    private controlColumnVisibility() {
        let hiddenColumns = [];
        let showColumns = [];
        this.allColumns.forEach((element) => {
            if (!this.isColumnAvailable(element)) {
                hiddenColumns.push(element.CodeCode);
            } else {
                showColumns.push(element.CodeCode);
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
        showColumns = showColumns.filter(function (fieldCode) {
            return !_visibleColumns.includes(fieldCode);
        });
        if (hiddenColumns.length) {
            this.gridInstance.hideColumns(hiddenColumns);
        }
        if (showColumns.length) {
            this.gridInstance.showColumns(showColumns);
        }
        // this.gridInstance.refreshColumns();
    }

    /**
     * <p> To set the grid column visiblity after creation.
     */
    onGridCreate(event) {
        this.controlColumnVisibility();
    }

    /**
     * <p> To set the grid selection mode can be Single or Multiple
     */
    private setSelectionMode() {
        if (this.multiSelection) {
            this.selectionOptions = {
                persistSelection: true
            };
        } else {
            this.selectionOptions = {
                type: 'Single',
                mode: 'Row'
            };
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
        let event = { data: column };
        this.onGridSort.emit(event);
    }
    /**
     * <p> To reorder the Grid data on drop of a row</p>
     * @param e : Event holds drag row and drop row details
     */
    rowDrop(e) {
        setTimeout(() => {
            this.dataSource = this.gridInstance.dataSource;
            this.onRowReordering.emit(this.getRowReorderObj(e, this.dataSource));
            this.gridInstance.selectRow(e.dropIndex);
        });
    }

    /**
     * <p> returns row reorder object </p>
     * @param e : Event holds drag row and drop row details
     * @param reorderedData : griddata after row reordered
     */
    public getRowReorderObj(e, reorderedData) {
        return { event: e, reorderData: reorderedData };
    }

    /**
     * <p> To set the Grid properties on grid bound</p>
     */
    public dataBound(event) {
        if (this.metaData?.setAddMode) {
            let record;
            if (this.scrollMode === 'Virtual' || this.scrollMode === 'Infinite') {
                record = this.gridInstance.getCurrentViewRecords()[0];
            } else {
                record = this.gridInstance.dataSource[0];
            }
            this.onAddRecordSelection.emit(record);
        } else {
            if (
                !(this.scrollMode === 'Virtual' || this.scrollMode === 'Infinite') &&
                this.metaData?.rowSelection != StandardCodes.NONE
            ) {
                this.gridInstance.selectRow(this.selectedRowIndex ? this.selectedRowIndex : 0);
            } else if (this.selectFirst && this.metaData?.rowSelection != StandardCodes.NONE) {
                this.gridInstance.selectRow(this.selectedRowIndex ? this.selectedRowIndex : 0);
                setTimeout(() => {
                    this.selectFirst = false;
                }, 1000);
            } else if (
                this.scrollMode !== 'Default' &&
                this.selectFirst &&
                this.metaData?.rowSelection != StandardCodes.NONE
            ) {
                this.gridInstance.selectRow(this.selectedRowIndex);
            }
        }
    }

    /**
     * <p> To load the details of selected row</p>
     * @param event : Hold the details of selected row
     */
    onRowSelection(event) {
        this.selectedRowIndex = this.gridInstance.getSelectedRowIndexes()[0];
        if (event.data && Array.isArray(event.data) && !Utils.isArrayEmpty(event.data)) {
            event.data = event.data[0];
        }
        this.onRecordSelection.emit(event);
    }

    /**
     * <p> To track the for loop(angular internally uses trackby methods to keep track of modified records and updates only them)</p>
     * @param item :
     */
    getTrackBy(item) {
        return item._id;
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
     * <p> To update the record in grid</p>
     * @param row : Row to be updated
     */
    public updateRecord(row) {
        const selectedRows = this.gridInstance.getSelectedRowIndexes();
        if (selectedRows.length) {
            this.selectedRowIndex = selectedRows[0];
            let selectedRow;
            if (this.scrollMode !== 'Default') {
                let scrollRows = this.gridInstance.getCurrentViewRecords();
                selectedRow = scrollRows[this.selectedRowIndex];
            } else {
                selectedRow = this.dataSource[this.selectedRowIndex];
            }
            let updatedRow = Utils.getRowTobeUpdated(selectedRow, row);
            this.gridInstance.setRowData(selectedRow._id, updatedRow);
            // this.gridInstance.refresh();
        }
    }

    /**
     * <p> To add a row in the grid</p>
     * @param row : Row to be updated
     */
    public add(row): void {
        const rdata: object = row;
        this.selectedRowIndex = 0;
        if (this.scrollMode === 'Default') {
            (this.gridInstance.dataSource as object[]).unshift(rdata);
        }
        this.gridInstance.refresh();
    }
    /**
     * <p> To delete selected row</p>
     *
     */
    public delete(): void {
        if (this.gridInstance.getSelectedRowIndexes().length && this.scrollMode === 'Default') {
            const selectedRow: number = this.gridInstance.getSelectedRowIndexes()[0];
            (this.gridInstance.dataSource as object[]).splice(selectedRow, 1);
            var dataSource = this.gridInstance.getDataModule();
            if (dataSource.dataManager.dataSource.json.length === selectedRow) {
                this.selectedRowIndex = this.selectedRowIndex - 1;
            }
            if (this.selectedRowIndex) {
                this.gridInstance.selectRow(this.selectedRowIndex);
            }
        }
        if (this.scrollMode !== 'Default') {
            this.gridInstance.deleteRecord();
        }
    }
    /**
     * builds the query for the grid which will be sent as request params by SF Grid while fetching the data
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
            this.filterOptions,
            this.sortState,
            null,
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
            this.gridInstance.pageSettings.currentPage = 1;
            this.gridInstance.query = this.query;
        }
    }

    set setRowHeight(val) {
        this.rowHeight = val;
    }
    set setViewMode(mode) {
        this.viewMode = mode;
        if (this.viewMode === StandardCodes.CREATE_MODE) {
            this.gridInstance.clearRowSelection();
        }
    }
    set setSelectedColumns(columns) {
        this.columns = columns;
        this.columns.forEach((column) => {
            this.allColumnsCopy.forEach((allColumn) => {
                if (column.CodeCode === allColumn.CodeCode) {
                    allColumn.CodeValue = column.CodeValue;
                }
            });
        });
        //   this.setReorder();
        this.controlColumnVisibility();
    }
    set setAllColumns(columns) {
        this.allColumns = columns;
        this.allColumns.forEach((column) => {
            this.allColumnsCopy.forEach((allColumn) => {
                if (column.CodeCode === allColumn.CodeCode) {
                    allColumn.sorted = column.sorted;
                }
            });
        });
    }
    /**
     * sets the active data source in the grid
     * @param data : details of data source
     */
    set setDataSource(data) {
        this.dataSource = data;
        if (this.scrollMode === 'Default') {
            this.gridInstance.dataSource = data;
        }
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
        if (this.scrollMode !== 'Default') {
            this.filterOptions = data;
            this.buildRequestQuery();
            this.selectFirst = true;
        }
    }
    /**
     * sets the active sort state in the grid
     * @param data : contains the details of sort state
     */
    set setSortState(data) {
        this.sortState = data;
        this.buildRequestQuery();
        this.selectFirst = true;
    }
    /**
     * <p> Refreshes the grid upon button click </p>
     *
     */
    public refreshGrid() {
        if (this.gridInstance) {
            this.gridInstance.refresh();
        }
        this.selectFirst = true;
        this.selectedRowIndex = 0;
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy(): void {
        if (this.gridInstance?.element && this.onRowExpandClick) {
            this.gridInstance.element.removeEventListener('click', this.onRowExpandClick);
        }
        if (this.splitterResizeEvent) {
            this.splitterResizeEvent.unsubscribe();
        }
    }

    @HostListener('window:keyup.escape', ['$event'])
    handleEscapeEvent(event) {
        let gridEditPayload = this.gridService.getGridEditData();
        if (!Utils.isObjectEmpty(gridEditPayload)) {
            this.gridService.clearGridEditData();
        }
        if (
            this.gridInstance &&
            this.gridInstance.isEdit &&
            this.gridEditMode === StandardCodes.EDIT_MODE_NORMAL
        ) {
            this.gridInstance.endEdit();
        }
    }

    @HostListener('document:click', ['$event']) onClick(e) {
        if (
            this.gridInstance &&
            this.gridInstance.isEdit &&
            this.gridEditMode === StandardCodes.EDIT_MODE_NORMAL
        ) {
            let gridEditPayload = this.gridService.getGridEditData();
            this.processGridEdit(gridEditPayload);
        }
    }

    processGridEdit(gridEditPayload: any) {
        if (!Utils.isObjectEmpty(gridEditPayload)) {
            this.contextService.removeDataChangeState();
            let selectedRow = this.dataSource[this.selectedRowIndex];
            let context = this.contextService.getContextRecord(
                this.currentPage.contextKey +
                    this.contextService.getRootViewMap(this.currentPage.contextKey)
            );
            let req = {
                payload: gridEditPayload
            };
            req.payload['_id'] = selectedRow['_id'];
            let parsedReq = Utils.getCopy(req);
            let reqObject = this.gridService.buildUpdateRequestObject(
                context,
                req,
                this.currentView,
                this
            );
            const ref = this;
            this.collectionService.updateCollectionItem(reqObject).subscribe(
                (response) => {
                    ref.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORD_UPDATED);
                    ref.gridInstance.endEdit();
                    ref.gridInstance.selectRow(ref.selectedRowIndex);
                    ref.gridService.clearGridEditData();
                    ref.updateRecord(parsedReq.payload);
                    let rowData = {
                        data: selectedRow,
                        reloadForm: true
                    };
                    ref.onRecordSelection.emit(rowData);
                },
                (error) => {
                    ref.toastService.showCustomToast(TOASTY_ERROR, error);
                    ref.gridInstance.endEdit();
                    ref.gridService.clearGridEditData();
                }
            );
        }
    }
}
