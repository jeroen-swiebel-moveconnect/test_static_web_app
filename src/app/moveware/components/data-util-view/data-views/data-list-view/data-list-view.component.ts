import { Component, Input, OnInit } from '@angular/core';
import { CompactType, DisplayGrid, GridType } from 'angular-gridster2';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import {
    CollectionsService,
    HeaderListenerService,
    RequestHandler
} from 'src/app/moveware/services';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { GridService } from 'src/app/moveware/services/grid-service';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import Utils from 'src/app/moveware/services/utils';
import { GridsterOptions } from 'src/app/moveware/components/form-components/field.interface';
import { DataViewMetaData } from 'src/app/moveware/models';
@Component({
    selector: 'data-list-view',
    templateUrl: './data-list-view.component.html',
    styleUrls: ['./data-list-view.component.scss'],
    providers: [DynamicDialogRef, DialogService, DynamicDialogConfig]
})
export class DataListViewComponent implements OnInit {
    dataSource: any;
    currentContainerID: string;
    viewData;
    currentPage: any;
    parentPage: any;
    @Input() currentViewCodeUIContainerDesignerCode: any;
    @Input() overlayPanel: any;
    @Input() selectedColumns: any;
    selectedRow: any;
    @Input() isProcessHighlights: boolean;
    @Input() metaData: DataViewMetaData;
    //records: any[];
    value: any[];
    totalRecords: number;
    //private OPTION_YES_ID: String = StandardCodesIds.OPTION_YES_ID;
    private currentView: any = {};
    private currentPageSize: Number;
    pageSizeOptions: Number[];
    //private headers: any[];
    //headerIDs: any;
    quickSearchField: any;
    gridAction: any;
    rowSelectAction: any;
    eventData: any;
    translationContext: any = {};
    parentRecord: any;
    options: GridsterOptions;
    isPreview: boolean = false;
    pageIndex: Number = 0;
    ExpandInTreeAction = false;
    public isloading: boolean = false;
    subscription: Subscription;
    constructor(
        private broadcaster: Broadcaster,
        public headerListenerService: HeaderListenerService,
        public contextService: ContextService,
        public gridService: GridService,
        private collectionsService: CollectionsService,
        private cacheService: CacheService,
        private quickTextHandler: QuickTextHandlerService,
        private actionService: UIActionService,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private requesthandler: RequestHandler
    ) {
        this.subscription = this.actionService.showLoader$.subscribe((showLoading) => {
            this.isloading = showLoading;
        });
    }

    ngOnInit() {
        this.translationContext[this.currentPage._id] = 'Data List.' + this.currentPage.CodeCode;
        //this.setGridRecord();

        this.getListMetaData();
        this.setGridsterOptions();
        this.setLayoutConfig();
    }
    private setLayoutConfig() {
        if (this.selectedColumns) {
            let maxGridsterRows = 0;
            let rowsList = [];
            //this.selectedColumns = [];
            let _columns = [];
            this.selectedColumns.forEach((element, index) => {
                //   element = this.headers[element._id];
                if (element.CodeVisible) {
                    if (
                        element.CodeType != 'UI Component' &&
                        (element.CodeColumn ||
                            element.CodeColumns ||
                            element.CodeRow ||
                            element.CodeRows)
                    ) {
                        element.x = element.CodeColumn;
                        element.y = element.CodeRow;
                        element.cols = element.CodeColumns ? element.CodeColumns : 1;
                        element.rows = element.CodeRows ? element.CodeRows : 3;
                        element.hasContent = true;
                    } else if (element.CodeType === 'UI Component') {
                        element.x = 0;
                        element.y = 0;
                        element.cols = 0;
                        element.rows = 0;
                        element.hasContent = false;
                    } else {
                        element.x = 0;
                        element.y = index * 3;
                        element.cols = 1;
                        element.rows = 3;
                        element.hasContent = true;
                    }
                    if (rowsList.indexOf(element.y) >= 0) {
                        if (element.rows > maxGridsterRows) {
                            maxGridsterRows = element.rows;
                        }
                    } else {
                        rowsList.push(element.y);
                        maxGridsterRows = maxGridsterRows + element.rows;
                    }
                    if (this.isProcessHighlights) {
                        element['isProcessHighlights'] = this.isProcessHighlights;
                    }
                    _columns.push(element);
                }
            });
            this.selectedColumns = _columns;
            console.log('===>0  ' + maxGridsterRows);
            this.gridsterHeight = maxGridsterRows * (this.options.fixedRowHeight + 4);
        }
    }
    gridsterHeight: number = 10;
    private setGridsterOptions() {
        this.options = {
            gridType: GridType.VerticalFixed,
            pushing: true,
            outerMarginTop: null,
            outerMarginRight: null,
            outerMarginBottom: null,
            disableWindoResize: false,
            outerMarginLeft: null,
            useTransformPositioning: true,
            mobileBreakpoint: 100,
            minCols: 1,
            //maxCols: this.specificOptions["maxCols"],
            minRows: 1,
            //maxRows: this.specificOptions["maxRows"],
            maxItemCols: 100,
            // minItemCols: 1,
            //maxItemRows: this.specificOptions["maxRows"],
            //minItemRows: this.specificOptions["minItemRows"],
            maxItemArea: 200,
            minItemArea: 1,
            defaultItemCols: 1,
            defaultItemRows: 1,
            //fixedColWidth: this.specificOptions["fixedColWidth"],
            //fixedRowHeight: this.specificOptions["fixedRowHeight"],
            keepFixedHeightInMobile: false,
            keepFixedWidthInMobile: false,
            scrollSensitivity: 10,
            scrollSpeed: 20,
            enableEmptyCellClick: false,
            enableEmptyCellContextMenu: false,
            enableEmptyCellDrop: false,
            enableEmptyCellDrag: false,
            enableOccupiedCellDrop: false,
            emptyCellDragMaxCols: 50,
            emptyCellDragMaxRows: 50,
            ignoreMarginInRow: false,
            draggable: {
                enabled: false
                //start: this.setSelectedItem.bind(this),
            },
            resizable: {
                enabled: false
            },

            pushItems: true,
            disablePushOnDrag: false,
            disablePushOnResize: false,
            margin: 1,
            outerMargin: false,
            minItemRows: 1,
            minItemCols: 1,
            fixedRowHeight: 10,
            maxRows: 30,
            maxCols: 10,
            fixedColWidth: 30,
            compactType: CompactType.CompactUp,
            swap: true,
            pushDirections: { north: true, east: true, south: true, west: true },
            pushResizeItems: true,
            displayGrid: DisplayGrid.OnDragAndResize,
            disableWindowResize: false,
            disableWarnings: false,
            scrollToNewItems: false
        };
    }
    private getListMetaData() {
        this.broadcaster
            .on<any>(this.currentContainerID + 'dataListOptions')
            .subscribe((listOptions) => {
                this.dataSource = listOptions;
            });
    }

    setGridRecord(requestObject, pageIndex) {
        let onLoadAction = this.metaData.loadAction;
        if (onLoadAction && onLoadAction.Task) {
            switch (onLoadAction.Task.CodeCode) {
                case StandardCodes.TASK_LOAD_TASK_LIST:
                    this.requesthandler
                        .handleRequest(
                            null,
                            onLoadAction,
                            null,
                            { user_name: this.cacheService.getUserId(), status: null },
                            false
                        )
                        .subscribe((data) => {
                            this.dataSource = data;
                        });
                    break;
                case StandardCodes.TASK_LOAD_PROCESS_LIST:
                    this.requesthandler
                        .handleRequest(
                            null,
                            onLoadAction,
                            null,
                            { user_name: this.cacheService.getUserId() },
                            false
                        )
                        .subscribe((data) => {
                            this.dataSource = data;
                        });
                    break;
                case StandardCodes.TASK_LOAD_COMPLETED_TASK_LIST:
                    this.requesthandler
                        .handleRequest(
                            null,
                            onLoadAction,
                            null,
                            {
                                process_instance_id: this.quickTextHandler.currentRecord
                                    .ProcessIntanceId,
                                user_name: this.cacheService.getUserId(),
                                status: 'resolved'
                            },
                            false
                        )
                        .subscribe((data) => {
                            this.dataSource = data;
                        });
                    break;
                case StandardCodes.TASK_LOAD_PENDING_TASK_LIST:
                    this.requesthandler
                        .handleRequest(
                            null,
                            onLoadAction,
                            null,
                            {
                                process_instance_id: this.quickTextHandler.currentRecord
                                    .ProcessIntanceId,
                                user_name: this.cacheService.getUserId(),
                                status: 'pending'
                            },
                            false
                        )
                        .subscribe((data) => {
                            this.dataSource = data;
                        });
                    break;

                default:
                    break;
            }
        } else {
            this.collectionsService
                .getGridRecords(requestObject, pageIndex, this.currentPageSize)
                .subscribe(async (responseData) => {
                    this.totalRecords = responseData.headers.get('x-total-count');
                    let _responseBody = JSON.parse(responseData.body);
                    this.dataSource = _responseBody.result;
                    if (this.viewData.CodeCode === 'Quick Output') {
                        let gridMetaData = JSON.parse(
                            this.cacheService.getSessionData('currentGridMetaData')
                        );
                        if (gridMetaData.CodeOutputOption) {
                            this.dataSource.push({
                                CodeDescription: 'Current View',
                                CodeIcon: {
                                    class: 'fa fa-window-maximize'
                                },
                                CodeType: 'Document',
                                CodeOutputOption: gridMetaData.CodeOutputOption
                            });
                        }
                    }
                    this.parentRecord = JSON.parse(
                        this.cacheService.getSessionData('previousSelectedRecord')
                    );
                });
        }
    }
    setUICoponentsIfAvailable(headers: any, headerIDs: any) {
        let field = headerIDs.filter((headerID) => {
            return (
                headers[headerID._id].CodeType === 'UI Component' &&
                headers[headerID._id].CodeElement === 'Search'
            );
        })[0];
        this.quickSearchField = field ? headers[field._id] : null;
    }

    onSelection(record) {
        if (this.ExpandInTreeAction) {
            this.broadcaster.broadcast(
                this.currentView.CodeUIContainerDesignerParent +
                    this.currentView.parentContainerId +
                    'ExpandInTree',
                { _id: record._id }
            );
        }
        if (!Utils.isArrayEmpty(record.CodeActions)) {
            if (record.CodeActions[0].Task.CodeCode === 'Run Workflow') {
                let uiaction = record.CodeActions[0];
                let workflowName = uiaction[StandardCodes.JSON_PARAMETER_CODE].workflowname;
                this.actionService.currentPage = this.currentPage;
                this.actionService.dialog = this.dialog;
                this.actionService.dialogConfig = this.dialogConfig;
                this.actionService.runWorkFlow(workflowName, uiaction);
            } else {
                let navigationUrl = 'mw/menu';
                navigationUrl = `${navigationUrl}/${record.CodeDescription}`;
                let selectedData = {
                    Task: record.CodeActions[0].Task.CodeCode,
                    CodeUIAction: record.CodeActions[0].CodeUIAction.CodeCode,
                    CodeUILocation: record.CodeActions[0].CodeUILocation.CodeCode || null,
                    CodeCode: record.CodeCode ? record.CodeCode : record.CodeDescription,
                    CodeActions: record.CodeActions || null,
                    UIContainer: record.CodeActions[0].UIContainer._id || null,
                    defaultView: record.CodeActions[0].CodeView
                        ? record.CodeActions[0].CodeView._id
                        : null
                };
                if (
                    this.currentView &&
                    selectedData.Task === StandardCodes.TASK_LOAD_UI_CONTAINER
                ) {
                    this.broadcaster.broadcast(this.currentView.containerID + 'close');
                }
                this.actionService.actionHandler(
                    selectedData,
                    null,
                    StandardCodes.UI_ACTION_CLICK,
                    navigationUrl,
                    null,
                    this.dialog,
                    this.dialogConfig
                );
            }
        } else {
            this.selectedRow = record;
            if (this.rowSelectAction) {
                if (
                    this.rowSelectAction &&
                    this.rowSelectAction.Task &&
                    this.rowSelectAction.Task.CodeCode === StandardCodes.TASK_ADD_CODE
                ) {
                    this.eventData = this.gridService.getCreateRecordObj(
                        null,
                        this.currentContainerID,
                        record,
                        false
                    );
                }
                this.eventData.data = record;
                if (record.CodeDescription === 'Current View') {
                    this.eventData.data.isCurrentView = true;
                }
                this.eventData.data.parent = this.parentRecord;
            } else {
                record.parent = this.parentRecord;
                this.eventData = {
                    eventType: 'DISPLAY_CHILDREN',
                    data: record,
                    parent: this.currentPage.CodeElement,
                    mode: StandardCodes.VIEW_UPDATE_MODE
                };
            }
            this.quickTextHandler.currentRecord = record;
            if (record.Ancestors) {
                record['criteria'] = {};
                record['criteria']['Ancestors'] = record.Ancestors;
                this.broadcaster.broadcast(
                    this.currentViewCodeUIContainerDesignerCode +
                        this.currentContainerID +
                        'ExpandInTree',
                    record
                );
            }
            // this.headerListenerService.onHeaderUpdate(record);
            this.contextService.defineContext(
                record,
                this.currentView,
                this.currentPage,
                this.currentContainerID,
                this.parentPage
            );

            if (this.currentView.SettingViewId) {
                this.broadcaster.broadcast(this.currentView.SettingViewId, this.eventData);
            } else {
                let eventListnerid = this.gridService.getCommunicationId(this.currentView);
                this.broadcaster.broadcast(
                    this.currentContainerID + eventListnerid,
                    this.eventData
                );
                if (this.overlayPanel) {
                    this.overlayPanel.hide();
                }
            }
            // this.broadcaster.broadcast(this.gridService.parentViewID + "toggleViews",{});
        }
    }
    /**
     * <p> To delete selected row</p>
     *
     */
    public delete(): void {
        let index = Utils.getIndexByProperty(this.dataSource, '_id', this.selectedRow._id);
        let selectedRowIndex = index ? index : 0;
        //  let _dataSource = Utils.getCopy(this.dataSource);
        this.dataSource.splice(selectedRowIndex, 1);
        //   this.dataSource = _dataSource;
        let nextRecord;
        if (selectedRowIndex != 0) {
            nextRecord = selectedRowIndex - 1;
        } else {
            nextRecord = selectedRowIndex;
        }
        if (!this.dataSource.length) {
            // We had to push this dummy row to make headers to be displayed. Because p-table takes [value] and doesn't display header row if dataSource.data is empty.
            this.pageIndex = 0;
            this.totalRecords = 0;
        } else {
            this.totalRecords = this.totalRecords - 1;
            let event = this.dataSource[nextRecord];
            setTimeout(() => {
                this.onSelection(event);
            });
        }
    }
    /**
     * <p> To update the record in grid</p>
     * @param row : Row to be updated
     */
    public updateRecord(row) {
        let index = Utils.getIndexByProperty(this.dataSource, '_id', this.selectedRow._id);
        if (index >= 0) {
            let tempRow = this.dataSource[index];
            for (let field in this.selectedRow) {
                tempRow[field] = this.selectedRow[field];
            }
        } else {
            this.dataSource.push(this.selectedRow);
        }
        //this.dataViewInstance.dataSource = this.dataSource;
    }
    public add(row): void {
        const limit = Number(row.pageSize) ? Number(row.pageSize) : Number(this.currentPageSize);
        this.totalRecords = Number(this.totalRecords);
        if (this.totalRecords < limit) {
            this.totalRecords = this.totalRecords + 1;
        } else {
            this.dataSource.pop();
        }
        this.dataSource.unshift(row);
        // Need to show the right pane
        this.selectedRow = row;
    }
    set setDataSource(data) {
        this.dataSource = data;
    }
    set setViewMode(mode) {
        if (mode === StandardCodes.CREATE_MODE) {
            this.selectedRow = null;
        }
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
