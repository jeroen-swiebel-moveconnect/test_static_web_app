import {
    Component,
    OnInit,
    Input,
    Output,
    SimpleChanges,
    EventEmitter,
    ViewChild,
    AfterViewInit
} from '@angular/core';
import { CollectionsService, RequestHandler } from 'src/app/moveware/services';
import { DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { ContextService } from 'src/app/moveware/services/context.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { GridService } from 'src/app/moveware/services/grid-service';
import { Subject, Observable } from 'rxjs';

import { Helpers } from 'src/app/moveware/utils/helpers';
import { CacheService } from 'src/app/moveware/services/cache.service';
import {
    FilterService,
    PageService,
    ReorderService,
    ResizeService,
    ColumnMenuService,
    ContextMenuService,
    SelectionService,
    DataStateChangeEventArgs,
    TreeGridComponent,
    EditService,
    ToolbarService
} from '@syncfusion/ej2-angular-treegrid';
import { DataService } from './data.service';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import Utils from '../../../../services/utils';

@Component({
    selector: 'tree-grid',
    templateUrl: './tree-grid.component.html',
    styleUrls: ['./tree-grid.component.scss'],
    providers: [
        ContextMenuService,
        ColumnMenuService,
        DialogService,
        DynamicDialogConfig,
        FilterService,
        ReorderService,
        DataService,
        PageService,
        ResizeService,
        SelectionService,
        EditService,
        ToolbarService
    ]
})
/**
 * To load the Grid Data in Tree view
 */
export class TreeViewGridComponent implements OnInit {
    @ViewChild('treeGridView', { static: true })
    public TreeGridInstance: TreeGridComponent;
    @Output() onRecordSelection = new EventEmitter<any>();
    @Output() onRowUnselect = new EventEmitter<any>();
    selectedRow: any;
    dataSource: any[];
    gridsterCelWidth: Number;
    actions: any[];
    parentChildMap: any;
    calculatedFields: any[];
    columns: any;
    allColumns: any[];
    columnSearchFilter: any;
    isColumnFiltersVisible: any;
    filters: any;
    sortState: any;
    @Output() onGridSort = new EventEmitter<any>();
    @Input() currentView: any;
    @Input() currentPage: any;
    isEditableGrid: boolean;
    contextMenus: any = [];
    gridRowShading;
    ancestorMapData: any = {};
    @Input() metaData: any;
    @Input() multiSelection: boolean;
    viewMode: string;
    rowHeight: Number;
    translationContext: any = {};
    headerVisible: boolean;
    layoutView = 'tree';
    allColumnsCopy: any[];
    editSettings: {
        allowEditing: boolean;
        allowAdding: boolean;
        allowDeleting: boolean;
        mode: string;
    };
    isExpandAll = false;
    firstVisibleColumnIndex: any = 0;
    gridLines: any;
    isNodeExpanding: boolean = false;
    rowToSelectOnLoad: any;
    rowsToExpandOnLoad: any;
    selectionSettings: any;
    isExpandFromServer: boolean = false;
    selectedRowIndex: number = 0;
    constructor(
        public dataService: DataService,
        private collectionService: CollectionsService,
        private contextService: ContextService,
        private actionService: UIActionService,
        private requestHandler: RequestHandler,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private cacheService: CacheService,
        private broadcaster: Broadcaster,
        private gridService: GridService
    ) {
        this.data = dataService;
    }
    public data: Observable<DataStateChangeEventArgs>;

    ngOnChanges(changes: SimpleChanges) {
        // if (
        //     changes['dataSource'] &&
        //     changes['dataSource'].currentValue &&
        //     changes['dataSource'].currentValue.length
        // ) {
        //     this.dataService.execute(changes.dataSource.currentValue);
        // }
        // if (changes['gridHeaders'] && !changes['gridHeaders'].firstChange) {
        //     this.TreeGridInstance.refreshHeader();
        //     this.gridHeaders = changes['gridHeaders'].currentValue;
        //     this.controlColumnVisibility();
        //     let orderedColumns = [];
        //     changes['gridHeaders'].currentValue.forEach((element) => {
        //         orderedColumns.push(element.CodeCode);
        //     });
        //     this.TreeGridInstance.reorderColumns(orderedColumns, this.gridHeaders[0]['CodeCode']);
        //     if (this.TreeGridInstance) {
        //         this.TreeGridInstance.treeColumnIndex = this.firstVisibleColumnIndex;
        //     }
        // }
        // if (changes['viewMode'] && !changes['viewMode'].firstChange) {
        //     if (this.viewMode === StandardCodes.CREATE_MODE) {
        //         this.TreeGridInstance.clearSelection();
        //     }
        // }
        // if (
        //     changes.rowHeight &&
        //     changes['rowHeight'].currentValue &&
        //     !changes.rowHeight.firstChange
        // ) {
        //     this.dataService.execute(this.dataSource);
        // }
    }
    /**
     * triggers when tree data sources is changed like delete, add, update
     * @param state : state of the data source
     */
    dataSourceChanged(state) {
        if (state.requestType === 'delete') {
            state.endEdit();
        }
    }
    /**
     * <p> To check if grid column is visible </p>
     * @param column :defines the column to which wants to check the availability
     * @returns true if column has to be visible on grid
     */
    private isColumnAvailable(column) {
        const index = Utils.getIndexByProperty(this.columns, 'CodeCode', column.CodeCode);
        return index >= 0;
    }
    /**
     * <p>To hide and show the grid columns</p>
     *
     * @see {@link TreeGridComponent#hideColumns}
     * @see {@link TreeGridComponent#showColumns}
     */
    private controlColumnVisibility() {
        if (this.TreeGridInstance) {
            let hiddenColumns = [];
            let showColumns = [];
            let isFirstVisibleColumn = true;
            this.allColumns.forEach((element, index) => {
                if (!this.isColumnAvailable(element)) {
                    hiddenColumns.push(element.CodeDescription);
                } else {
                    if (isFirstVisibleColumn) {
                        isFirstVisibleColumn = false;
                        this.firstVisibleColumnIndex = index + (this.multiSelection ? 1 : 0);
                    }
                    showColumns.push(element.CodeDescription);
                }
            });
            if (
                this.TreeGridInstance.columns &&
                this.TreeGridInstance.columns.length &&
                hiddenColumns.length
            ) {
                this.TreeGridInstance.hideColumns(hiddenColumns);
            }
            if (
                this.TreeGridInstance.columns &&
                this.TreeGridInstance.columns.length &&
                showColumns.length
            ) {
                this.TreeGridInstance.showColumns(showColumns);
            }
        }
    }
    /**
     * triggers when tree node is collapsed
     * @param nodeObject : node data
     */
    onNodeCollapsed(nodeObject) {
        if (nodeObject && nodeObject.data && nodeObject.data.data) {
            nodeObject.data.data['expanded'] = false;
        }
    }

    /**
     * <p>this method is being used for append child nodes</p
     * @param state :contains the event information triggered by the `Syncfusion` TreeGrid on every change on its state
     */
    public async dataStateChange(state: DataStateChangeEventArgs): Promise<void> {
        if (state.requestType === 'expand') {
            if (this.multiSelection) {
                this.onRowUnselect.emit(Utils.getCopy(state.data));
            }
            this.isNodeExpanding = true;
            if (this.currentView._id === StandardCodesIds.HELP_GRID_ID) {
                state.data['data']['expanded'] = true;
                state.data['children'].forEach((record, i) => {
                    state.data['children'][i]['ParentId'] = state.data['data']['_id'];
                    state.data['children'][i]['_id'] = record.data['_id'];
                    state.data['children'][i]['isParent'] =
                        record.children && record.children.length ? true : false;
                    state.data['children'][i]['ParentId'] = state.data['data']['_id'];
                });
                state.childData = state.data['children'];
                state.childDataBind();
            } else {
                let index = this.gridService.getChildIndex(
                    this.dataSource,
                    state.data['data']['_id'],
                    '_id'
                );
                let parentsRoot;
                if (state.data['data'].ParentRoot) {
                    parentsRoot = state.data['data'].ParentRoot;
                }
                state.data['data']['expanded'] = true;
                let object = this.onNodeExpand(state.data);
                if (object) {
                    object.subscribe(async (responseData) => {
                        let _responseBody = JSON.parse(responseData.body);
                        if (index >= 0) {
                            this.dataSource[index].children = _responseBody.result[0].children;
                        }
                        let data = await this.gridService.buildParentRootContext(
                            _responseBody.result[0].children,
                            state.data['data']['_id'],
                            parentsRoot
                        );
                        data.forEach((record, i) => {
                            data[i]['ParentId'] = state.data['data']['_id'];
                            data[i]['_id'] = record.data['_id'];
                            data[i]['isParent'] =
                                record.children && record.children.length ? true : false;
                        });
                        state.childData = data;
                        state.childDataBind();
                    });
                } else {
                    state.data['children'].forEach((child, i) => {
                        state.data['children'][i]['isParent'] =
                            child.children && child.children.length > 0 ? true : false;
                    });
                    state.childData = state.data['children'];
                    state.childDataBind();
                }
            }
            this.isNodeExpanding = false;
        }
        if (state.action && state.action.requestType === 'delete') {
            this.dataService.execute(this.TreeGridInstance.dataSource['result']);
        }
    }

    ngOnInit() {
        if (this.multiSelection) {
            this.firstVisibleColumnIndex = this.firstVisibleColumnIndex + 1;
        }
        this.setSelectionMode();
        this.rowToSelectOnLoad =
            this.selectedRow && this.selectedRow.criteria && this.selectedRow.criteria._id;
        this.translationContext[this.currentPage._id] = 'Data Grid.' + this.currentPage.CodeCode;
        this.columns = this.metaData.selectedColumns;
        this.rowHeight = this.metaData.rowHeight;
        this.allColumns = this.metaData.allColumns;
        this.gridsterCelWidth = this.metaData.gridsterCelWidth;
        this.gridRowShading = this.metaData.rowShading;
        this.parentChildMap = this.metaData.parentChildMap;
        this.calculatedFields = this.metaData.calculatedFields;
        this.viewMode = this.metaData.viewMode;
        this.sortState = this.metaData.sortState;
        this.headerVisible = this.metaData.headerVisible;
        this.isColumnFiltersVisible = this.metaData.isColumnFiltersVisible;
        this.gridLines = this.metaData.gridLines;
        this.contextMenus = this.metaData.contextMenus;
        this.translationContext[this.currentPage._id] = 'Data Tree.' + this.currentPage.CodeCode;
        if (this.allColumns && this.allColumns.length) {
            this.allColumnsCopy = Utils.getCopy(this.allColumns);
        } else {
            this.allColumnsCopy = Utils.getCopy(this.columns);
        }
        this.editSettings = {
            allowEditing: true,
            allowAdding: true,
            allowDeleting: true,
            mode: 'Normal'
        };
        if (!this.isExpandAll && this.dataSource) {
            this.dataService.execute(this.dataSource);
        }
        this.registerExpandTreeEvent();
        this.setContextMenuActions();
        Utils.buildAncestorMapDataForEachNode(this.dataSource, this.ancestorMapData);
        if (this.rowToSelectOnLoad) {
            this.rowsToExpandOnLoad = this.ancestorMapData[this.rowToSelectOnLoad]
                ? this.ancestorMapData[this.rowToSelectOnLoad]
                : [];
        }
        if (this.metaData && this.metaData.criteria && this.metaData.criteria._id) {
            this.expandTreeNode(
                this.metaData.criteria._id,
                this.dataSource,
                this.ancestorMapData[this.metaData.criteria._id]
            );
            Helpers.scrollGrid('.ui-treetable-scrollable-body', this.metaData.criteria._id);
        }
        this.controlColumnVisibility();
    }
    private setSelectionMode() {
        if (this.multiSelection) {
            this.selectionSettings = {
                persistSelection: true
            };
        } else {
            this.selectionSettings = {
                type: 'Single',
                mode: 'Row'
            };
        }
    }
    /**
     * <p> Registers the events for tree `Expand` event</p>
     */
    registerExpandTreeEvent() {
        if (this.currentView.containerID) {
            let event = this.broadcaster
                .on<any>(
                    this.currentView.CodeElement + this.currentView.containerID + 'ExpandInTree'
                )
                .subscribe((data) => {
                    let id = data._id;
                    event.unsubscribe();
                    let parentRoot;
                    if (
                        data.criteria &&
                        data.criteria.Ancestors &&
                        data.criteria.Ancestors.length
                    ) {
                        parentRoot = data.criteria.Ancestors;
                    } else {
                        parentRoot = this.ancestorMapData[id];
                    }
                    Utils.collapseAllNodes(this.dataSource);
                    parentRoot = this.expandTreeNode(id, this.dataSource, parentRoot);
                    Helpers.scrollGrid('.ui-treetable-scrollable-body', id);
                    this.registerExpandTreeEvent();
                });
        }
    }
    expanding(args) {
        if (this.isExpandFromServer) {
            var parentID = args.data._id;
            var currentData = this.TreeGridInstance.getCurrentViewRecords();
            var childData = this.TreeGridInstance.getCurrentViewRecords().filter(
                (e) => e['ParentId'] === parentID
            );
            if (childData.length) {
                for (var i = 0; i < childData.length; i++) {
                    var dataIndexToBeDeleted = this.TreeGridInstance.grid.getRowIndexByPrimaryKey(
                        childData[i]
                    );
                    delete currentData[dataIndexToBeDeleted];
                }
            }
        }
    }
    /**
     *
     * @param data :node object
     */
    expandNow(id: string) {
        this.isExpandFromServer = true;
        let index = this.TreeGridInstance.dataSource['result'].findIndex((item) => {
            return id === item.data._id;
        });
        if (index >= 0) {
            let treeData = this.TreeGridInstance.getCurrentViewRecords();
            treeData[index]['expanded'] = false;
            this.TreeGridInstance.dataSource['result'][index].isParent = true;
            this.TreeGridInstance.dataSource['result'][index].children = [1];
            this.dataService.execute(this.TreeGridInstance.dataSource['result']).then((d) => {
                this.rowsToExpandOnLoad = [{ _id: id }];
                this.rowToSelectOnLoad = id;
                this.isNodeExpanding = false;
            });
        }
    }
    actionBefore(d) {
        console.log(d);
    }
    /**
     * <p>sets the context menu actions based on `Grid Actions`</p>
     */
    setContextMenuActions() {
        this.contextMenus.forEach((element) => {
            element.command = (event) => this.handleContextMenuActions(event);
        });
    }

    /**
     * <p>To open context menus </p>
     * @param event :contains the selected menu info
     */
    handleContextMenuActions(event) {
        let actions = [];
        actions.push(event.item.action);
        let _action = { CodeActions: actions };
        this.handleGridAction(_action);
    }
    /**
     * Handles the grid action
     * <p>supports the actions like `expandRow`</p
     * @param action :contains the `Action Parameters`
     */
    private handleGridAction(action: any) {
        if (!action) {
            return;
        }
        let actionCode: any;
        actionCode = action.CodeUIAction;
        if (action.CodeActions && action.CodeActions.length) {
            actionCode = action.CodeActions[0].Task.CodeCode
                ? action.CodeActions[0].Task.CodeCode
                : action.CodeActions[0].Task;
        }
        switch (actionCode) {
            case StandardCodes.TASK_HELP_CODE: {
                //TODO:
                console.log('Help Clicked');
                break;
            }

            case 'Row Expand': {
                this.onNodeExpand({
                    node: this.selectedRow,
                    actions: action.CodeActions[0].Task.CodeCode
                });
                break;
            }

            default: {
                // TODO:
                console.log("Didn't match any action.... Contact the system administrator!!!");
                break;
            }
        }
    }
    /**
     * helps to expand expandTreeNode
     * @param id :defines record `id`
     * @param data :the child information
     * @param parentRoot :the parent parent context
     */
    expandTreeNode(id, data, parentRoot) {
        if (data && data.length) {
            data.forEach(async (eachChild) => {
                if (eachChild.data && eachChild.data._id === id) {
                    this.onNodeSelection(eachChild);
                    this.dataSource = [...this.dataSource];
                    return;
                } else if (eachChild.data && eachChild.data._id) {
                    let index;
                    if (parentRoot && parentRoot.length) {
                        index = parentRoot.findIndex((root) => {
                            return root === eachChild.data._id || root._id === eachChild.data._id;
                        });
                    }
                    if (index >= 0 && eachChild.children && eachChild.children.length) {
                        eachChild['expanded'] = false;
                        eachChild.expanded = true;
                        this.dataSource = [...this.dataSource];
                        return this.expandTreeNode(id, eachChild.children, parentRoot);
                    }
                }
            });
        }
    }
    onNodeUnSelection(node) {
        if (node.data) {
            let selectedRecords = node.data;
            this.onRowUnselect.emit(selectedRecords);
        } else {
            this.onRowUnselect.emit(this.selectedRow);
        }
    }
    /**
     * handles the on row selection event
     *<p>sets the current record information and emits the event to parent component</p
     * @param node :the record which is selected
     */
    onNodeSelection(node) {
        this.selectedRowIndex = this.TreeGridInstance.getSelectedRowIndexes()[0];
        if (this.isNodeExpanding) {
            return;
        }
        let selectedRecords;
        if (Array.isArray(node.data)) {
            selectedRecords = [];
            node.data.forEach((element) => {
                selectedRecords.push(element.data);
            });
        } else {
            selectedRecords = node.data.data;
        }
        const dataChange = this.contextService.isDataChanged();
        if (dataChange) {
            dataChange.subscribe((result) => {
                if (result) {
                    this.contextService.removeDataChangeState();
                    this.selectedRow = selectedRecords;
                    this.onRecordSelection.emit(selectedRecords);
                } else {
                    this.onRecordSelection.emit({
                        data: JSON.parse(
                            this.cacheService.getSessionData('previousSelectedRecord')
                        ),
                        isDataChanged: true
                    });
                }
            });
        } else {
            this.selectedRow = selectedRecords;
            this.onRecordSelection.emit(selectedRecords);
        }
    }
    /**
     * handles the sorting made through grid header
     * <p>check for the `Sort Direction` and emit event</p
     * @param column :the grid column on which the sort is requested
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
     * <p> To update the record in grid</p>
     * @param row :row to be updated
     */
    public updateRecord(row) {
        let selectedRows = this.TreeGridInstance.getSelectedRecords();
        row = row.payload ? row.payload : row;
        if (selectedRows.length) {
            let selectedRow = selectedRows[0];
            for (let field in row) {
                if (selectedRow['data']) {
                    if (typeof selectedRow['data'][field] === 'object') {
                        selectedRow['data'][field]['en'] = row[field];
                    } else {
                        selectedRow['data'][field] = row[field];
                    }
                }
            }
            this.TreeGridInstance.setRowData(row._id, selectedRow);
            if (this.isExpandAll) {
                this.TreeGridInstance.refresh();
            }
        }
    }

    /**
     * <p> To set the Grid properties on grid bound</p>
     */
    public dataBound(event) {
        if (this.rowsToExpandOnLoad && this.rowsToExpandOnLoad.length) {
            let treeData = this.TreeGridInstance.getCurrentViewRecords();
            if (this.rowsToExpandOnLoad.length && treeData.length) {
                treeData.forEach((row) => {
                    this.rowsToExpandOnLoad.forEach((element, index) => {
                        if (element._id === row['_id']) {
                            this.TreeGridInstance.expandRow(null, row);
                            this.rowsToExpandOnLoad.splice(index, 1);
                        }
                    });
                });
            } else if (this.rowToSelectOnLoad && this.rowsToExpandOnLoad.length === 0 && treeData) {
                let index = treeData.findIndex((row) => {
                    return row['_id'] === this.rowToSelectOnLoad;
                });
                if (index) {
                    this.TreeGridInstance.selectRow(index);
                    this.isNodeExpanding = false;
                    this.isExpandFromServer = false;
                }
            }
        } else if (!this.isNodeExpanding && this.metaData.rowSelection != StandardCodes.NONE) {
            this.TreeGridInstance.selectRow(this.selectedRowIndex ? this.selectedRowIndex : 0);
        } else {
            this.isNodeExpanding = false;
        }
    }
    /**
     * to collapse all the expanded nodes in the tree grid
     */
    collapseAll() {
        if (this.TreeGridInstance) {
            this.TreeGridInstance.collapseAll();
        }
    }
    /**
     *
     *<p>To add a row in the grid</p>
     * @param row : Row to be updated
     */
    public add(row): void {
        const rdata: object = row;
        let node = { childrens: [], data: row };
        if (this.dataSource) {
            this.dataSource.splice(0, 0, node);
            if (!this.isExpandAll) {
                this.dataService.execute(this.dataSource);
            } else {
                this.TreeGridInstance.dataSource = this.dataSource;
                this.TreeGridInstance.refresh();
            }
        }
    }
    /**
     *
     *<p>To delete selected row</p>
     *
     */
    public delete(data): void {
        if (
            this.TreeGridInstance.dataSource &&
            !Utils.isArrayEmpty(this.TreeGridInstance.dataSource['result'])
        ) {
            let index = this.TreeGridInstance.dataSource['result'].findIndex((item) => {
                return data._id === item.data._id;
            });
            if (index) {
                this.TreeGridInstance.dataSource['result'].splice(index, 1);
                this.TreeGridInstance.deleteRecord();
            }
        }
    }
    /**
     * calls when the node is requested expand
     * <p>
     * checks for the row expand event then goes for the expansion and fetches the childrens if available
     * </p>
     * @param $event :the node data
     */
    onNodeExpand($event): Observable<any> {
        let action;
        if (this.actions !== undefined && !Utils.isArrayEmpty(this.actions)) {
            this.actions.forEach((doc) => {
                const task = doc['Task'];
                if (task && task['CodeCode'] === 'Row Expand') {
                    action = task;
                }
            });
        } else {
            action = $event.actions;
        }
        return this.addChildrens($event);
    }

    /**
     * fetches the childrens for the node
     *<p>forms the appropreate request object and calls the API to get the children</p
     * @param $event :the node data
     * @param viewId :the view id of the grid
     * @param action
     * @param broadcastList
     * @returns observable of the API call
     */
    addChildrens($event): Observable<any> {
        const node = $event.data;
        if (this.currentView.parentContainerId !== StandardCodesIds.QUICK_HELP_CONTAINER_ID) {
            if ($event.actions) {
                let filterObj = Utils.createFilterObj(
                    { CodeElement: '_id', CodeFilterType: 'Text', CodeDataType: 'Text' },
                    node._id,
                    'CodeDescription'
                );
                let array = [];
                array.push(filterObj);
                let requestObject = this.gridService.createSearchRequetObj(
                    this.currentView._id,
                    array,
                    this.sortState,
                    '',
                    true,
                    '',
                    ''
                );
                requestObject['criteria']['maxDepth'] = 10;
                return this.collectionService.getGridRecords(requestObject, 0, 50);
            } else {
                let filterObj = Utils.createFilterObj(
                    { CodeElement: '_id', CodeFilterType: 'Text', CodeDataType: 'Text' },
                    node._id,
                    'CodeDescription'
                );
                let array = [];
                array.push(filterObj);
                let requestObject = this.gridService.createSearchRequetObj(
                    this.currentView._id,
                    array,
                    this.sortState,
                    '',
                    true,
                    '',
                    ''
                );
                requestObject['criteria']['maxDepth'] = 1;
                return this.collectionService.getGridRecords(requestObject, 0, 50);
            }
        } else {
            return null;
        }
    }

    /**
     * logs the error details for syncfusion
     *
     * @param data :the details of the error
     */
    actionFailure(data) {
        console.log(JSON.stringify(data));
    }
    /**
     * appends the record and makes it selected in the grid
     *
     * @param data :node data
     * @param updatedRecord :the updated record
     */
    appendRecordToGridAndSelect(data, updatedRecord) {
        data.push({
            data: updatedRecord,
            children: null
        });
        this.selectedRow = updatedRecord;
        this.onRecordSelection.emit(updatedRecord);
        this.dataSource = [...this.dataSource];
    }

    /**
     * this method is @deprecated
     * used to update record in the grid
     *
     * @param data
     * @param root
     * @param currentRootIndex
     * @param updatedRecord
     * @param properties
     * @param mode
     * @param previousNode
     * @param parents
     */
    updateTreeRecordHelper(
        data,
        root,
        currentRootIndex,
        updatedRecord,
        properties: any,
        mode: string,
        previousNode,
        parents
    ) {
        if ((root && currentRootIndex > root.length) || !data) {
            return;
        }
        if (mode == 'create' && !parents.length) {
            this.appendRecordToGridAndSelect(this.dataSource, updatedRecord);
            return;
        }
        for (let index = 0; index < data.length; index++) {
            if (data[index].data && data[index].data._id === updatedRecord._id) {
                if (mode == 'update') {
                    properties.forEach((elements) => {
                        data[index].data[elements] = updatedRecord[elements];
                    });
                } else if (mode == 'delete') {
                    data.splice(index, 1);
                    this.dataSource = [...this.dataSource];
                    if (data[index] || data[index - 1]) {
                        if (!data[index]) index--;
                        this.selectedRow = data[index];
                        this.onRecordSelection.emit(data[index]);
                    } else {
                        this.selectedRow = previousNode;
                        this.onRecordSelection.emit(previousNode);
                    }
                }
                return;
            } else if (
                mode == 'create' &&
                parents &&
                data[index].data &&
                parents.length &&
                parents.indexOf(data[index].data._id) > -1
            ) {
                this.appendRecordToGridAndSelect(data[index]['children'], updatedRecord);
            }

            if (mode === 'delete ' && root && root[currentRootIndex] === data[index].data._id) {
                previousNode = data[index].data;
                this.updateTreeRecordHelper(
                    data[index].children,
                    root,
                    currentRootIndex + 1,
                    updatedRecord,
                    properties,
                    mode,
                    previousNode,
                    parents
                );
                return;
            } else {
                this.updateTreeRecordHelper(
                    data[index].children,
                    null,
                    null,
                    updatedRecord,
                    properties,
                    mode,
                    null,
                    parents
                );
            }
        }
    }
    /**
     * fetches the header properties
     */
    getProperties() {
        let properties = [];
        for (let index = 0; index < this.columns.length; index++) {
            const element = this.columns[index];
            properties.push(element.CodeCode);
        }
        return properties;
    }
    /**
     * handles the Grid Actions
     *<p>takes the grid related actions and makes the action call by forming the action data</p
     * @param column
     * @param data
     * @param event
     */
    handleActions(column, data, event) {
        let navigationUrl = 'mw/menu';
        event.stopPropagation();
        let actionType = StandardCodes.UI_ACTION_CLICK;
        navigationUrl = `${navigationUrl}/${column.CodeCode}`;
        let selectedData = this.actionService.getActionDetails(column, data, actionType, '');
        // selectedData.selectedRecords = this.selectedList;
        if (selectedData.IsParentContext) {
            selectedData.parentContainerId = this.currentPage['contextKey'];
        } else {
            selectedData.parentContainerId = selectedData.UIContainer;
        }
        this.actionService.actionHandler(
            column,
            data,
            StandardCodes.UI_ACTION_CLICK,
            navigationUrl,
            null,
            this.dialog,
            this.dialogConfig
        );
    }
    set setRowHeight(val) {
        this.rowHeight = val;
        if (!this.isExpandAll && this.dataSource) {
            this.dataService.execute(this.dataSource);
        } else {
            if (this.dataSource && this.dataSource.length) {
                this.TreeGridInstance.refresh();
            }
        }
    }
    set setViewMode(mode) {
        this.viewMode = mode;
        if (this.viewMode === StandardCodes.CREATE_MODE) {
            this.TreeGridInstance.clearSelection();
        }
    }
    set setSelectedColumns(columns) {
        if (this.TreeGridInstance) {
            this.TreeGridInstance.refreshHeader();
            this.columns = columns;
            this.controlColumnVisibility();
            let orderedColumns = [];
            if (!Utils.isArrayEmpty(columns)) {
                columns.forEach((element) => {
                    orderedColumns.push(element.CodeCode);
                });
                this.TreeGridInstance.reorderColumns(orderedColumns, this.columns[0]['CodeCode']);
            }
            //if (this.TreeGridInstance) {
            this.TreeGridInstance.treeColumnIndex = this.firstVisibleColumnIndex;
            if (!Utils.isArrayEmpty(this.columns) && !Utils.isArrayEmpty(this.allColumnsCopy)) {
                this.columns.forEach((column) => {
                    this.allColumnsCopy.forEach((allColumn) => {
                        if (column.CodeCode === allColumn.CodeCode) {
                            allColumn.CodeValue = column.CodeValue;
                        }
                    });
                });
            }
            //  }
        }
    }
    set setDataSource(data) {
        this.dataSource = data;
        if (this.isExpandAll && this.dataSource) {
            this.TreeGridInstance.dataSource = data;
            this.TreeGridInstance.childMapping = 'children';
            this.TreeGridInstance.refresh();
        } else {
            this.selectedRowIndex = 0;
            this.dataService.execute(this.dataSource);
        }
        if (this.TreeGridInstance) {
            this.TreeGridInstance.clearSelection();
        }
    }
    /**
     * sets the grid lines of grid
     * @param data : details of data source
     */
    setGridLines(gridLines) {
        this.gridLines = gridLines;
        if (this.TreeGridInstance) {
            this.TreeGridInstance.gridLines = gridLines;
        }
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
