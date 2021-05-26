import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Input,
    NgZone,
    OnInit,
    Output,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ContextMenuItemModel } from '@syncfusion/ej2-angular-grids';
import * as _ from 'lodash';
import { MenuItem } from 'primeng';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ContextMenuRow } from 'primeng/table';
import { Observable } from 'rxjs';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { DialogConfigurationService } from 'src/app/moveware/services/dialog-configuration.service';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { UserService } from 'src/app/moveware/services/user-service';
import { StandardCodes } from '../../constants/StandardCodes';
import { DataViewMetaData, IGridMetadata, SelectionTypes, ViewModeTypes } from '../../models';
import {
    CollectionsService,
    HeaderListenerService,
    MenuUpdateService,
    RequestHandler
} from '../../services';
import { GridService } from '../../services/grid-service';
import Utils from '../../services/utils';
import { SaveEditFilterContentComponent } from '../modals/save-edit-filters/save-edit-filter.component';
import { MWDialogContentComponent } from '../mw-dialog/mw-dialog.component';
import { ToolbarComponentView } from '../toolbar/toolbar.component';
import { CardViewComponent } from './data-views/card-view/card-view.component';
import { DataListViewComponent } from './data-views/data-list-view/data-list-view.component';
import { GalleryViewComponent } from './data-views/gallery-view/gallery-view.component';
import { GanttViewComponent } from './data-views/gantt-view/gantt-view.component';
import { GridView } from './data-views/grid-view/grid-view.component';

import { KanbanViewComponent } from './data-views/kanban-view/kanban-view.component';
import { PivotComponent } from './data-views/pivot/pivot.component';
import { ReportingGrid } from './data-views/reports-grid/reports-grid.component';
import { ScheduleComponent } from './data-views/schedule/schedule.component';
import { TreeViewGridComponent } from './data-views/tree-grid/tree-grid.component';
import { PaginationComponent } from './paginator/pagination.component';
import { GroupbyGridComponent } from './data-views/groupby-grid/groupby-grid.component';
import { MegaMenuPanelComponent } from './data-views/mega-menu-panel/mega-menu-panel.component';

import { DataFormService } from '../../services/dataform-service';
import { Helpers } from '../../utils/helpers';
export const TOASTY_ERROR: string = 'error';
export const LOOKUP_MODE: string = 'Lookup';
export const VIEW_MODE: string = 'View';
export const VIEW_UPDATE_MODE: string = 'VIEW_UPDATE_MODE';
export const CREATE_MODE: string = 'CREATE_MODE';

declare var Stimulsoft: any;
declare var String: any;
const dataViewMap = {
    'Data List': DataListViewComponent,
    'Data Grid': GridView,
    'Data Tree': TreeViewGridComponent,
    'Data Kanban': KanbanViewComponent,
    'Data Schedule': ScheduleComponent,
    'Data Pivot': PivotComponent,
    'Data Gantt': GanttViewComponent,
    'Data Card': CardViewComponent,
    'Data Gallery': GalleryViewComponent,
    'Data Menu': MegaMenuPanelComponent
};
const ONE_TWELTH_OF_HUNDER_PERCENT = (1 / 12) * 100;

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'data-util-view',
    templateUrl: './data-util-view.component.html',
    styleUrls: ['./data-util-view.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})
export class DataUtilViewComponent implements OnInit {
    @ViewChild(TreeViewGridComponent) treeGridIntance: TreeViewGridComponent;
    @ViewChild(GridView) gridViewInstance: GridView;
    @ViewChild(ReportingGrid) reportsGridView: ReportingGrid;
    @ViewChild(PivotComponent) pivotInstance: PivotComponent;
    @ViewChild(ScheduleComponent) scheduleInstance: ScheduleComponent;
    @ViewChild(KanbanViewComponent) kanbanInstance: KanbanViewComponent;
    @ViewChild(GroupbyGridComponent) groupByInstance: GroupbyGridComponent;
    @ViewChildren(ContextMenuRow) contextMenuRows: QueryList<ContextMenuRow>;
    @ViewChild('dataView', { read: ViewContainerRef }) dataViewObj: ViewContainerRef;
    @ViewChild(ToolbarComponentView)
    public toolBarInstance: ToolbarComponentView;
    @Input() viewList: any;

    isOld = false;
    @Input() currentContainerID: string;
    @Output() refreshHeader = new EventEmitter();
    @Input() metaData;
    @Input() parentPage: any;
    @Input() currentRecord: any;
    @Input() parentViewID: any;
    gridsterCelWidth: number;
    hasAdminRights: boolean;
    // filterPaneSelected: boolean = false;
    filterPanePinned: boolean = false;
    filterPaneHidden: boolean = true;
    //// filterPaneYOffset: Number = 164; // Y position of filter pane
    //   filterPaneExpanded: boolean = false;
    private searchFilters: Array<any> = [];
    private calculatedFields: any[] = [];
    private pageSizeOptions: Number[];
    private totalRecords: number;
    private pageIndex: Number = 0;
    private viewData: any;
    private displayedColumns: any;
    private selectedRow: any;
    private selectedRowIndex: any;
    private tempSelectedRow: any = {};
    currentView: any = {};
    private currentPageSize: Number = 10;
    private filtersList: any;
    // private filtersMasterList: any;
    private selectedFilters: any;
    private callbackEvent: any;
    isLoading: boolean = false;
    private sortOrder: number = 0;

    @Input() windowSize: number;
    errorMsg: string;
    private columnSearchFilter: any = {};
    private sortState = null;
    private customViewsList: Array<any> = [];
    private childCreateEvent: any;
    private childUpdateEvent: any;
    private childDeleteEvent: any;
    private columnFilterEvent: any;
    public selectedColumns: Array<any> = [];
    private columnHeaders: Array<any> = [];
    private columnIndexMap = new Map();
    private groupableColumns: Array<any> = [];
    globalLanguages: Array<any> = [];
    private childModeEvent: any;
    primaryActions: Array<any> = [];
    secondaryActions: MenuItem[] = [];
    currentPage: any;
    isFilterPaneVisible: boolean;
    isPaginatorVisible: boolean = false;
    public isColumnFiltersVisible: boolean;
    public gridLines: any;
    isCodeRowReorderable: boolean;
    rowGroupMetadata: any;
    codeActions: any;
    public actions: any[] = [];
    rowGroupDataKey: string = null;
    groupByColumns: any = [];
    defaultGroupBy: any = [];
    private selectedLanguage: any = {};
    private selectedLayout: any;
    private layoutSize: any = 'Medium';
    private multiSelection: boolean;
    private rowSelect: boolean = true;
    private rowSelectAction: any;
    private gridRowSelect: any;
    private lookUpActions: any = [];
    private gridActions: any = [];
    private viewAlias: string;
    gridRowShading: any = 'No';
    spinnerSize: string;
    isEditableGrid: boolean;
    UIComponents: any = [];
    quickSearchField: any;
    headerVisible: boolean = true;
    isDashboard: boolean = false;
    isExpanded: boolean = false;
    private sortHeaders: Array<any> = [];
    private customisedSorting: Array<any> = [];
    private allowGridRefresh: boolean = true;
    public columnOptions: Array<any> = [];
    public rowOptions: Array<any> = [];
    public rowGroupOptions: Array<any> = [];
    public colGroupOptions: Array<any> = [];
    public summaryOptions: Array<any> = [];
    public customisedLayoutSize: Array<any> = [];
    public customisedRows: Array<any> = [];
    public customisedGrouping: Array<any> = [];
    public customisedSummary: Array<any> = [];
    public customised: boolean = false;

    public customisedGroupShowDefault = { label: 'Both With Totals', code: 'BT' };
    private customisedGroupSummary = {
        _id: 'Summary',
        CodeCode: 'Summary',
        CodeDescription: 'Summary',
        options: [
            { label: 'Show With Totals', code: 'ShowTotal' },
            { label: 'Show Without Totals', code: 'Show' },
            { label: 'Hide', code: 'Hide' }
        ],
        showGroup: { label: 'Show With Totals', code: 'ShowTotal' }
    };
    private customisedGroupDetails = {
        _id: 'Details',
        CodeCode: 'Details',
        CodeDescription: 'Details',
        options: [
            { label: 'Hide', code: 'Hide' },
            { label: 'Show', code: 'Show' }
        ],
        showGroup: { label: 'Show', code: 'Show' }
    };
    rowdoubleSelectAction: any;
    private codeGridReportFile: any;
    private codeCrossTabReportFile: any;
    private reportTemplates: Array<any> = [];
    dataViewMetaData: DataViewMetaData = {};
    private tableColumnWidth: number;
    private intialTableWidth: number;
    private alteredWindowSize: number;
    private intialWindowSize: number;
    private intialColumnWidth: number;
    private gridLoad: boolean = false;
    private dataViewInstance: any;
    translationContext: string;
    gridScrolling: any = 'Default';
    viewTranslationContext: string;
    isFilterBarVisible: boolean;
    restrictAPI: boolean = false;
    currentFocusedElement: any;
    columnsMap: any = [];
    constructor(
        private actionService: UIActionService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private collectionsService: CollectionsService,
        public menuUpdateService: MenuUpdateService,
        public headerListenerService: HeaderListenerService,

        private toastService: ToastService,
        private zone: NgZone,
        private userService: UserService,
        private menuService: MenuService,
        private broadcaster: Broadcaster,
        private contextService: ContextService,
        private gridService: GridService,
        private collectionService: CollectionsService,
        private cacheService: CacheService,
        private titleService: Title,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private dialogConfigService: DialogConfigurationService,
        private requestHandler: RequestHandler,
        private quickTextHandler: QuickTextHandlerService,
        private formService: DataFormService
    ) {}

    ngOnInit() {
        this.gridLoad = true;
        this.registerLanguageChangeEvent();
        this.groupByColumns = [];
        this.defaultGroupBy = [];
        this.displayedColumns = [];
        this.dataViewMetaData.allColumns = this.displayedColumns;
        if (this.currentPage.parentContainerId !== StandardCodesIds.QUICK_HELP_CONTAINER_ID) {
            this.selectedColumns = [];
            this.viewType = '';
        }
        this.rowOptions = [];
        this.summaryOptions = [];
        this.customisedRows = [];
        this.customisedGrouping = [];
        this.groupableColumns = [];
        this.rowGroupOptions = [];
        this.colGroupOptions = [];
        this.globalLanguages = [];
        this.columnHeaders = [];
        this.layoutSize = 'Medium';
        // set the min height and bind it to scrollHieght required for p-table
        if (this.metaData) {
            this.multiSelection = this.metaData.multiSelection;

            if (this.metaData.rowSelect === false) {
                this.rowSelect = false;
            }
        }
        // this.setFilterPaneYOffset();
        this.gridService.parentRecord = Utils.getCopy(this.currentRecord);
        if ($('.dashboard-wrapper')[0]) {
            this.isDashboard = true;
        } else {
            this.isDashboard = false;
        }
    }
    ngOnChanges(changes: SimpleChanges) {
        if (
            changes['viewList'] &&
            changes['viewList'].previousValue !== changes['viewList'].currentValue
        ) {
            this.selectedColumns = [];
            this.loadGridContainer();
        }
        if (changes['windowSize']) {
            this.onWindowResize(changes['windowSize'].currentValue);
        }
    }
    loadDataView(type) {
        if (this.dataViewObj) this.dataViewObj.clear();
        let aComponentFactory = this.componentFactoryResolver.resolveComponentFactory(
            dataViewMap[type]
        );
        let dataViewRef = this.dataViewObj?.createComponent(aComponentFactory);
        this.dataViewInstance = dataViewRef?.instance;
        this.dataViewInstance.metaData = this.dataViewMetaData;
        this.dataViewInstance.multiSelection = this.multiSelection;
        this.dataViewInstance.selectedRow = this.currentRecord;
        this.dataViewInstance.currentPage = this.currentPage;
        this.dataViewInstance.currentView = this.currentView;
        this.dataViewMetaData.filterOptions = this.selectedFilters;
        this.dataViewInstance.dataSource = this.dataSource;
        this.dataViewInstance.contextMenus = this.contextMenus;
        this.dataViewInstance.parentChildMap = this.parentChildMap;
        this.dataViewInstance.onRecordSelection?.subscribe((event) => this.onRowSelect(event));
        this.dataViewInstance.onAddRecordSelection?.subscribe((event) =>
            this.onAddRecordSelection(event)
        );
        this.dataViewInstance.onGridSort?.subscribe((event) => this.sortGrid(event));
        this.dataViewInstance.onRowUnselect?.subscribe((event) => this.onRowUnselect(event));
        this.dataViewInstance.onRowReordering?.subscribe((event) => this.dragAndSave(event));
        this.dataViewInstance.onCardsSearch?.subscribe((event) => this.searchOnGrid(event));
        this.dataViewInstance.onContextMenuSelect?.subscribe((event) =>
            this.onContextMenuSelect(event)
        );
        this.dataViewInstance.currentContainerID = this.currentContainerID;
        this.dataViewInstance.viewData = this.metaData;
        this.dataViewInstance.parentPage = this.parentPage;
        this.dataViewInstance.selectedColumns = this.selectedColumns;
        this.dataViewInstance.groupableColumns = this.groupableColumns;
        this.dataViewInstance.defaultGroupBy = this.defaultGroupBy;
        if (this.dataViewInstance.refreshView) {
            this.dataViewInstance.refreshView();
        }
        this.gridLoad = true;
        // setTimeout(() => {
        //     this.toolBarInstance?.refreshToolBar();
        // }, 100);

        this.dataViewInstance.handleAction?.subscribe((object) =>
            this.handleGridAction(object.action, object.event)
        );
    }
    loadLanguage(event) {
        this.setSelectedLanguage(event.language, event.reloadGrid);
    }
    private setSelectedLanguage(language: any, reloadGrid: boolean) {
        this.selectedLanguage = language;
        this.cacheService.setSessionData('language', JSON.stringify(this.selectedLanguage));
        if (reloadGrid) {
            this.getFilteredViewDetails(
                this.currentView,
                this.selectedFilters,
                this.sortState,
                0,
                this.currentPageSize,
                this.groupByColumns
            );
        }
    }
    /**
     * resets the currentView to its initial state includeing filters and sort state
     * @param event
     */
    resetDeafaultView() {
        this.loadView(this.currentView);
    }
    setReportingColumns(
        selectedColumns,
        customisedGrouping,
        customisedRows,
        customisedSummary,
        stiData
    ) {
        let params = stiData['Parameters'][0];
        selectedColumns.forEach((column) => {
            this.dataSource.forEach((value, i) => {
                if (
                    value[column.CodeCode] instanceof Object &&
                    !(value[column.CodeCode] instanceof Array)
                ) {
                    if (!this.isObjectEmpty(value[column.CodeCode])) {
                        this.dataSource[i][column.CodeCode] = Utils.applyCodeDisplayOfGridColumn(
                            value[column.CodeCode],
                            column,
                            true
                        );
                    }
                }
            });
        });
        let data = JSON.stringify(this.dataSource);
        selectedColumns.forEach((column, i) => {
            params['Column' + (i + 1)] = this.gridService.getStiColumnObj(column);

            if (
                !Utils.isArrayEmpty(customisedGrouping) &&
                this.viewType != StandardCodes.TASK_CROSSTAB_VIEW_CODE
            ) {
                customisedGrouping.forEach((groupColumn, gi) => {
                    if (column.CodeCode === groupColumn.CodeElement) {
                        params['Group' + (gi + 1)] = this.gridService.getStiGroupObj(
                            groupColumn,
                            column,
                            i
                        );
                    } else if (groupColumn._id === 'Details' || groupColumn._id === 'Summary') {
                        params[groupColumn._id] = {
                            Show: this.gridService.getGroupShow(groupColumn, 'GroupShow'),
                            ShowTotal: this.gridService.getGroupShow(groupColumn, 'GroupShowTotal')
                        };
                    }
                });
            } else if (
                this.viewType == StandardCodes.TASK_CROSSTAB_VIEW_CODE &&
                !Utils.isArrayEmpty(customisedSummary)
            ) {
                customisedSummary.forEach((sum, si) => {
                    if (column.CodeCode === sum.CodeCode) {
                        params['Summary' + (si + 1)] = this.gridService.getStiSummaryObj(sum, i);
                    }
                });
            }

            if (!Utils.isArrayEmpty(this.sortState)) {
                this.sortState.forEach((sortColumn, si) => {
                    if (column.CodeCode === sortColumn.CodeElement) {
                        if (this.viewType == StandardCodes.TASK_REPORT_VIEW_CODE) {
                            params['Sort' + (si + 1)] = {
                                Column: 'Column' + (i + 1),
                                Order: sortColumn.CodeOrder || 'ASC'
                            };
                        }
                    }
                });
            }

            data = Utils.replaceString(
                data,
                '"' + column.CodeCode + '":',
                '"Column' + (i + 1) + '":'
            );
        });

        if (
            !Utils.isArrayEmpty(customisedRows) &&
            this.viewType == StandardCodes.TASK_CROSSTAB_VIEW_CODE
        ) {
            customisedRows.forEach((row, i) => {
                params['Row' + (i + 1)] = this.gridService.getStiRowObj(row);

                if (
                    this.viewType == StandardCodes.TASK_CROSSTAB_VIEW_CODE &&
                    !Utils.isArrayEmpty(customisedSummary)
                ) {
                    customisedSummary.forEach((sum, si) => {
                        if (row.CodeCode === sum.CodeCode) {
                            params['Summary' + (si + 1)] = this.gridService.getStiSummaryRowObj(
                                sum,
                                si
                            );
                        }
                    });
                }
                data = Utils.replaceString(
                    data,
                    '"' + row.CodeCode + '":',
                    '"Row' + (i + 1) + '":'
                );
            });
        }

        if (!Utils.isArrayEmpty(customisedGrouping)) {
            data = Utils.replaceString(
                data,
                '"' + customisedGrouping[0].CodeCode + '":',
                '"Group1":'
            );
        } else {
            data = Utils.replaceString(data, '"}', '","Group1":""}');
            data = Utils.replaceString(data, '}}', '},"Group1":""}');
        }

        if (
            !Utils.isArrayEmpty(customisedSummary) &&
            this.viewType == StandardCodes.TASK_CROSSTAB_VIEW_CODE
        ) {
            customisedSummary.forEach((sum, si) => {
                if (!params['Summary' + (si + 1)]) {
                    params['Summary' + (si + 1)] = this.gridService.getStiTotalSummaryObj(sum);
                } else {
                    params['Summary' + (si + 1)]['Value'] = sum.CodeCode;
                }
            });
        }
        stiData['Parameters'][0] = params;
        stiData['Data'] = JSON.parse(data);
        return stiData;
    }

    private setReportingTemplate(report, stiData) {
        let i;
        let params = stiData['Parameters'][0];
        if (this.viewType == StandardCodes.TASK_CROSSTAB_VIEW_CODE) {
            for (i = 5; i > 0; i--) {
                if (!params['Column' + i]) {
                    this.gridService.removeReportComponent(report, 'CrossTab_Column' + i);
                } else {
                    this.gridService.setReportSorting(
                        report,
                        'CrossTab_Column' + i,
                        params['Column' + i]['SortOrder']
                    );
                }
            }
            for (i = 5; i > 0; i--) {
                if (!params['Row' + i]) {
                    this.gridService.removeReportComponent(report, 'CrossTab_Row' + i);
                } else {
                    this.gridService.setReportSorting(
                        report,
                        'CrossTab_Row' + i,
                        params['Row' + i]['SortOrder']
                    );
                }
            }
            for (i = 1; i < 6; i++) {
                if (params['Summary' + i]) {
                    this.gridService.setReportSummary(
                        report,
                        'CrossTab_Sum' + i,
                        params['Summary' + i]['TotalCalc'],
                        params['Summary' + i]['Value']
                    );
                } else {
                    this.gridService.removeReportComponent(report, 'CrossTab_Sum' + i);
                }
            }
        } else if (this.viewType == StandardCodes.TASK_REPORT_VIEW_CODE) {
            i = 1;
            let dataBand = report.getComponentByName('DataBand1');
            while (params['Sort' + i] && i < 6 && dataBand) {
                dataBand.sort[i * 2 - 2] = params['Sort' + i]['Order'];
                i++;
            }
        }
        return report;
    }

    loadStiReport() {
        if (this.groupByColumns.length > 0 && this.allowGridRefresh) {
            this.refreshGrid();
        }
        this.allowGridRefresh = true;
        var report = new Stimulsoft.Report.StiReport();
        var reportFile;
        if (this.reportTemplates) {
            reportFile = Utils.getReportTemplatePath(this.reportTemplates);
        }
        if (reportFile !== '' && reportFile !== undefined) {
            report.loadFile(Utils.getReportTemplatePath(this.reportTemplates));
        } else {
            this.toastService.addErrorMessage(
                StandardCodes.EVENTS.CONFIGURATION_ERROR,
                '103 - Configuration Error'
            );
            console.error('No Report Template Set For Selected Layout');
        }

        this.viewType = StandardCodes.TASK_REPORT_VIEW_CODE; // true;
        this.dataViewMetaData.viewType = StandardCodes.TASK_REPORT_VIEW_CODE;
        this.rowGroupOptions = this.getGroupOptions(this.groupableColumns, 'Row');
        this.colGroupOptions = this.getGroupOptions(this.groupableColumns, 'Column');
        setTimeout(() => {
            let user = this.cacheService.getLocalData('user');
            if (user) {
                user = JSON.parse(user).name;
            }
            let stiData = {
                Parameters: [{ Title: 'Test Report', Filters: 'By Group 1', 'Generated By': user }]
            };
            stiData = this.setReportingColumns(
                this.selectedColumns,
                this.customisedGrouping,
                this.customisedRows,
                this.customisedSummary,
                stiData
            );
            var dataSet = new Stimulsoft.System.Data.DataSet(stiData);
            var data = dataSet.tables.getByIndex(0);
            dataSet.readJson(stiData);
            report.regData(dataSet.dataSetName, dataSet.dataSetName, dataSet);
            report.dictionary.synchronize();
            report.CacheAllData = true;
            report = this.setReportingTemplate(report, stiData);
            var options = new Stimulsoft.Viewer.StiViewerOptions();
            options.exports.showExportToWord2007 = true;
            options.exports.showExportToExcel2007 = true;
            var viewer = new Stimulsoft.Viewer.StiViewer(options, 'StiViewer', false);
            viewer.report = report;
            viewer.renderHtml('reportContent');
            viewer.jsObject.postInteraction_ = viewer.jsObject.postInteraction;
            viewer.jsObject.postInteraction = function (params) {
                if (params.action == 'DrillDown') {
                    var pages = this.controls.reportPanel.pages;
                    for (var i = 0; i < pages.length; i++) {
                        var page = pages[i];
                        var pageElements = page.getElementsByTagName('*');

                        for (var k = 0; k < pageElements.length; k++) {
                            var componentIndex = pageElements[k].getAttribute('compindex');
                            var pageIndex = pageElements[k].getAttribute('pageindex');
                            if (
                                componentIndex &&
                                pageIndex &&
                                componentIndex == params.drillDownParameters.ComponentIndex &&
                                pageIndex == params.drillDownParameters.PageIndex
                            ) {
                                break;
                            }
                        }
                    }
                }
            };
        }, 100);
    }

    loadFilterPane() {
        if (this.isListNotEmpty(this.viewList)) {
            this.sortState = [];
            this.setSelectedFilters = {};
            this.rowExpandAction = null;
            this.viewType = '';
            this.removeStiReport();
            const defaultView = this.gridService.getDefaultView(
                this.viewList,
                this.currentContainerID
            );
            if (defaultView.CodeSpinnerSize) {
                this.spinnerSize = defaultView.CodeSpinnerSize;
            }
            this.currentPage = Utils.getCopy(defaultView);
            this.setActiveView(this.viewList, defaultView, 'CodeCode');
            this.groupByColumns = [];
            this.viewChanged(defaultView);
            this.getSelectedViewDetails(defaultView, null, null, null, 0, this.currentPageSize);
            this.isFilterPaneVisible = this.gridService.getIsFilterPaneVisible(this.viewAlias);
        }
    }

    // setFilterPaneStatus(e) {
    //     let we = window.event;
    //     if (we) {
    //         we.stopPropagation();
    //     }

    //     if (e) {
    //         let action = e.type;
    //         if (action === 'click') {
    //             // pin Filter Pane
    //             this.gridService.setFilterPanePinnedStatus(this.viewAlias);
    //         //    this.filterPanePinned = this.gridService.getFilterPanePinned(this.viewAlias);
    //           //  this.setFilterPaneYOffset();
    //         } else if (!this.filterPanePinned) {
    //             let fromElement = e.fromElement;
    //             let toElement = e.toElement;
    //             let toggleFilters = false;
    //             let filterBtn = fromElement.id === 'filter-btn' ? fromElement : toElement;

    //             if (action === 'mouseenter' && this.filterPaneHidden) {
    //                 // show Filter Pane
    //                 toggleFilters = true;
    //             } else if (action === 'mouseleave' && !this.filterPaneHidden) {
    //                 // hide Filter Pane
    //                 if (
    //                     (fromElement?.id === 'filter-pane' && toElement?.id !== 'filter-btn') ||
    //                     (fromElement?.id === 'filter-btn' && toElement?.id !== 'filter-pane')
    //                 ) {
    //                     toggleFilters = true;
    //                 }
    //             }

    //             if (toggleFilters) {
    //                 let targetContentPane = $(event.target)
    //                     .closest('.h-100')
    //                     .find('.content-pane--body');
    //                 var yOffset = targetContentPane.offset().top;
    //                 this.filterPaneYOffset =
    //                     !yOffset || filterBtn.getBoundingClientRect().y > 172
    //                         ? filterBtn.getBoundingClientRect().y +
    //                           (filterBtn.getBoundingClientRect().y < 172 ? 35 : 31)
    //                         : yOffset;
    //                 this.gridService.setFilterPaneHiddenStatus(this.viewAlias);
    //                 this.filterPaneHidden = this.gridService.getFilterPaneHidden(this.viewAlias);
    //                 if (this.filterPaneHidden) {
    //                     this.filterPaneExpanded = false;
    //                 }
    //             }
    //         }
    //     }
    // }

    private registerEvents() {
        //unsubscribe all the events before registring
        this.destroyAllEvents();
        //Registring all  event
        this.registerChildUpdateEvent();
        this.registerChildDeleteEvent();
        this.registerChildCreateEvent();
        this.registerModeChangedEvent();
        this.registerColumnFilterEvent();
        this.registerVersionUpdateEvent();
    }
    private versionUpdateEvent: any;
    public registerVersionUpdateEvent() {
        if (this.currentContainerID) {
            this.versionUpdateEvent = this.broadcaster
                .on<string>(this.currentContainerID + 'version_update')
                .subscribe((updatedRecord) => {
                    this.viewMode = ViewModeTypes.VIEW_UPDATE_MODE;
                    this.dataViewInstance.updateRecord(updatedRecord);
                });
        }
    }

    public registerChildUpdateEvent() {
        let eventListnerid = this.gridService.getCommunicationId(this.currentView);
        this.childUpdateEvent = this.broadcaster
            .on<string>(eventListnerid + 'child_updated')
            .subscribe((collectionObj) => {
                this.viewMode = ViewModeTypes.VIEW_UPDATE_MODE;
                this.updateRecordInGrid(collectionObj);
            });
    }

    public registerChildDeleteEvent() {
        let eventListnerid = this.gridService.getCommunicationId(this.currentView);
        if (this.currentPage && this.currentPage.containerID) {
            this.childDeleteEvent = this.broadcaster
                .on<string>(eventListnerid + this.currentPage?.containerID + 'child_deleted')
                .subscribe((data) => {
                    if (
                        this.viewType == StandardCodes.DATA_TREE ||
                        this.viewType == StandardCodes.DATA_GRID ||
                        this.viewType == StandardCodes.DATA_KANBAN ||
                        this.viewType == StandardCodes.CODE_TYPE_DATA_LIST ||
                        this.viewType == StandardCodes.TASK_SCHEDULE_VIEW_CODE ||
                        this.viewType == StandardCodes.DATA_PIVOT ||
                        this.viewType == StandardCodes.DATA_GANTT
                    ) {
                        if (this.dataViewInstance && !this.groupByInstance) {
                            this.dataViewInstance.delete(data['selectedRow']);
                        }
                        if (
                            this.dataViewInstance &&
                            Utils.isArrayEmpty(this.dataViewInstance.dataSource) &&
                            !this.groupByInstance &&
                            this.gridScrolling !== 'Infinite' &&
                            this.gridScrolling !== 'Virtual'
                        ) {
                            this.broadcaster.broadcast(
                                'removePage' + this.currentContainerID,
                                this.currentContainerID
                            );
                        }
                        if (this.groupByInstance) {
                            this.groupByInstance.deleteRecordFromGrid();
                        }
                    } else {
                        this.deleteFromSearchGrid(data['selectedRow']);
                    }
                });
        }
    }
    public registerChildCreateEvent() {
        let eventListnerid = this.gridService.getCommunicationId(this.currentView);
        this.childCreateEvent = this.broadcaster
            .on<string>(eventListnerid + 'child_created')
            .subscribe((collectionObj) => {
                if (this.dataViewInstance && !this.groupByInstance) {
                    this.dataViewInstance.add(collectionObj['payload']);
                } else if (this.groupByInstance) {
                    this.groupByInstance.addRecordToGrid(collectionObj['payload']);
                }
            });
    }
    public registerColumnFilterEvent() {
        this.columnFilterEvent = this.broadcaster
            .on<string>(this.currentView._id + 'column_filter')
            .subscribe((data: any) => {
                this.gridService.removeStateParams();
                if (!Utils.isObjectEmpty(data) && data['source'] === 'searchColumn') {
                    let field = {
                        value: data['value'] ? data['value'] : '',
                        key: data['CodeElement']
                    };
                    this.loadDependentFieldOptions(field);
                    let options = {};
                    let column;
                    column = data;
                    if (
                        (Array.isArray(column['value']) &&
                            !column['CodeFilterType'].startsWith('Date')) ||
                        column['CodeFilterType'] === 'Combo Box'
                    ) {
                        options['value'] = column['value'];
                    } else {
                        options = column['value'];
                    }
                    if (column['CodeFilterType'] === 'Text') {
                        this.columnSearchFilter[column['CodeElement']] = column['value'];
                    }
                    if (
                        column['CodeFilterType'] === 'Multi Select Combo Box' &&
                        options === '' &&
                        data['isHeaderFilter']
                    ) {
                        this.removeMultiSelect(column, -1);
                    } else {
                        if (data['isHeaderFilter']) {
                            let filters = [];
                            column['CodeValue'] = column['value'];
                            column['options'] = column['values'];
                            filters.push(column);
                            this.applyFilters(filters, true);
                        } else {
                            this.setFilterCodeValue(column);
                        }
                    }
                }
                setTimeout(() => {
                    if (data.elementRef) {
                        this.currentFocusedElement = _.clone(
                            this.formService.currentFocusedElement
                        );
                    }
                });
            });
    }

    public registerModeChangedEvent() {
        let eventListnerid = this.gridService.getCommunicationId(this.currentView);
        this.childModeEvent = this.broadcaster
            .on<string>(eventListnerid + 'mode_changed')
            .subscribe((data) => {
                if (data && data['mode'] === CREATE_MODE) {
                    this.viewMode = ViewModeTypes.CREATE_MODE;
                    this.selectedRow = {};
                    this.tempSelectedRow = {};
                    this.selectedRows = [];
                    this.contextService.removeContextOnAdd(
                        this.currentPage.contextKey +
                            this.contextService.getRootViewMap(this.currentPage.contextKey),
                        this.currentView
                    );
                } else if (data && data['mode'] === VIEW_UPDATE_MODE) {
                    let event = data['record'];
                    this.onRowSelect(event);
                    this.addToSelectedList();
                }
            });
        this.dialogCloseEvent = this.broadcaster.on<string>('dialogClose').subscribe((data) => {
            if (data) {
                this.onRowUnselect(null);
            }
        });
    }
    private dialogCloseEvent: any;
    loadFilter(event) {
        this.applyFilters(event.filters, true);
    }

    /**
     * @param filters
     * @param option
     * @param loadFlters
     */
    private applyFilters(filters, loadFlters) {
        const dataChange = this.contextService.isDataChanged();
        if (dataChange) {
            dataChange.subscribe((result) => {
                if (result) {
                    this.contextService.removeDataChangeState();
                    if (filters && filters.length) {
                        filters.forEach((filter) => {
                            this.handleApplyingFilters(filter, filter.CodeValue, loadFlters);
                            this.setFilterCodeValue(filter);
                        });
                        if (loadFlters && !this.groupByInstance) {
                            this.getFilteredViewDetails(
                                this.currentView,
                                this.selectedFilters,
                                this.sortState,
                                0,
                                this.currentPageSize,
                                this.groupByColumns
                            );
                        }
                    }
                } else {
                    // if (filter.searchText && filter.searchText !== '') {
                    //     filter.searchText = '';
                    // }
                    // if (option !== 'null') {
                    //     option.isChecked = false;
                    // }
                }
            });
        } else {
            if (filters && filters.length) {
                filters.forEach((filter) => {
                    this.handleApplyingFilters(
                        filter,
                        filter.CodeValue ? filter.CodeValue : filter.value,
                        loadFlters
                    );
                    this.setFilterCodeValue(filter);
                });
                if (loadFlters && !this.groupByInstance) {
                    this.getFilteredViewDetails(
                        this.currentView,
                        this.selectedFilters,
                        this.sortState,
                        0,
                        this.currentPageSize,
                        this.groupByColumns
                    );
                }
            }
        }
    }

    /**
     * <p> This method is used </p>
     *
     * @param filter : Selected fitler
     * @param event
     * @param type
     */
    public setDateTimeFilter(filter, event, type) {
        if (event.values && filter.values && type === 'TimeChange') {
            filter.valuesTime = [
                Utils.minToTimeString(event.values[0]),
                Utils.minToTimeString(event.values[1])
            ];
        } else if (!Utils.isArrayEmpty(filter.value) && !Utils.isArrayEmpty(filter.valuesTime)) {
            var fromTime = filter.valuesTime[0].split(/[.:]/);
            var toTime = filter.valuesTime[1].split(/[.:]/);
            filter.value[0].setHours(fromTime[0]);
            filter.value[0].setMinutes(fromTime[1]);
            filter.value[1].setHours(toTime[0]);
            filter.value[1].setMinutes(toTime[1]);
            this.handleApplyingFilters(filter, filter.value, true);
        }
    }

    /**
     * <p> Used to create a date fitler</p>
     * @param filter : Selected Filter
     * @param values
     */
    public createDateFilter(filter, values) {
        if (values[1] != null) {
            return {
                CodeElement: filter.CodeElement,
                CodeValue: { GreaterThanOrEqualTo: values[0], LessThan: values[1] },
                CodeFilterType: filter.CodeFilterType,
                CodeDataType: filter.CodeDataType
            };
        } else {
            var filterDate = values[0];
            filterDate.setHours(0, 0, 0, 0);
            return {
                CodeElement: filter.CodeElement,
                CodeValue: { Equals: filterDate },
                CodeFilterType: filter.CodeFilterType,
                CodeDataType: filter.CodeDataType
            };
        }
    }

    public createCheckBoxFilter(filter, values) {
        if (!Utils.isArrayEmpty(values)) {
            let value = [];
            values.forEach((element) => {
                if (element['isChecked']) {
                    value.push(element['CodeDescription']);
                } else if (filter.CodeValue && element._id === filter.CodeValue._id) {
                    value.push(element['CodeDescription']);
                }
            });
            if (value.length) {
                return {
                    CodeElement: filter.CodeElement,
                    CodeValue: { EqualsAny: value },
                    CodeFilterType: filter.CodeFilterType,
                    CodeDataType: filter.CodeDataType,
                    CodeSubField: filter.CodeSubField || 'CodeDescription'
                };
            }
        }
    }

    private handleApplyingFilters(filter, option, loadFlters) {
        if (!filter) {
            return;
        } else {
            if (
                filter.CodeFilterType === 'boolean' ||
                filter.CodeFilterType === 'Switch' ||
                filter.CodeFilterType === 'Toggle Button' ||
                filter.CodeFilterType === 'Radio Button' ||
                filter.CodeFilterType === 'Text' ||
                filter.CodeFilterType === 'Number'
            ) {
                this.setSelectedFilters = Utils.filterSelectedOptions(
                    filter,
                    option,
                    this.selectedFilters
                );
            } else if (filter.CodeFilterType === 'Check Box') {
                if (!this.selectedFilters) {
                    this.selectedFilters = {};
                }
                let checkBoxFilters = this.createCheckBoxFilter(filter, filter.options);
                if (checkBoxFilters) {
                    this.selectedFilters[filter.CodeElement] = checkBoxFilters;
                } else {
                    this.selectedFilters = _.omit(this.selectedFilters, filter.CodeElement);
                    if (!this.selectedFilters) {
                        this.selectedFilters = {};
                    }
                }
                this.setSelectedFilters = this.selectedFilters;
            } else if (filter.CodeFilterType === 'Multi Select Combo Box') {
                this.setSelectedFilters = Utils.filterSelectedOptions(
                    filter,
                    option,
                    this.selectedFilters
                );
            } else if (filter.CodeFilterType.startsWith('Date')) {
                if (option && option.length > 0) {
                    if (!this.selectedFilters) {
                        this.setSelectedFilters = {};
                    }
                    this.selectedFilters[filter.CodeElement] = this.createDateFilter(
                        filter,
                        option
                    );
                } else {
                    if (this.selectedFilters) {
                        this.selectedFilters = _.omit(this.selectedFilters, filter.CodeElement);
                    }
                    if (!this.selectedFilters) {
                        this.setSelectedFilters = {};
                    }
                }
                this.setSelectedFilters = this.selectedFilters;
            } else if (
                filter.CodeFilterType === 'Combo Box' ||
                filter.CodeFilterType === 'Select Button'
            ) {
                this.setSelectedFilters = Utils.filterSelectedOptions(
                    filter,
                    option,
                    this.selectedFilters
                );
            } else if (filter.CodeFilterType === 'text') {
                if (
                    this.columnSearchFilter[filter.CodeElement] &&
                    (!filter.searchText || filter.searchText === '')
                ) {
                    delete this.columnSearchFilter[filter.CodeElement];
                } else {
                    // if not already exists, then add new
                    //TODO add action for ^
                    if (filter.searchText && filter.searchText !== '') {
                        this.columnSearchFilter[filter.CodeElement] = '^' + filter.searchText;
                    }
                }
            } else if (filter.CodeFilterType === StandardCodes.FIELD_GROUP) {
                loadFlters = false;
                let filters;
                if (!this.selectedFilters) {
                    this.setSelectedFilters = {};
                }
                if (filter.value) {
                    filters = this.gridService.processGroupFitlers(filter);
                    this.selectedFilters[filter.CodeElement] = filters;
                } else {
                    delete this.selectedFilters[filter.CodeElement];
                }
                //
                this.getFilteredViewDetails(
                    this.currentView,
                    this.selectedFilters,
                    this.sortState,
                    0,
                    this.currentPageSize,
                    this.groupByColumns
                );
            }
        }
    }

    private removeMultiSelect(filter, index) {
        if (filter) {
            let option;
            if (index >= 0) {
                option = filter.value;
                option.splice(index, 1);
            } else {
                // clear all filters;
                option = { value: [] };
                filter.value = [];
            }
            this.setFilterCodeValue(filter);
            this.setSelectedFilters = Utils.filterSelectedOptions(
                filter,
                option,
                this.selectedFilters
            );
            this.getFilteredViewDetails(
                this.currentView,
                this.selectedFilters,
                this.sortState,
                0,
                this.currentPageSize,
                this.groupByColumns
            );
        }
    }

    private applyCustomisedGrouping(groupByColumns) {
        this.groupByColumns = Utils.getGrouping(groupByColumns);
        if (this.groupByInstance && !Utils.isArrayEmpty(this.groupByColumns)) {
            this.groupByInstance.applyGrouping(this.groupByColumns);
            return;
        }
        if (!Utils.isArrayEmpty(this.groupByColumns)) {
            this.isPaginatorVisible = false;
        }
        if (this.viewType !== StandardCodes.TASK_REPORT_VIEW_CODE) {
            this.getFilteredViewDetails(
                this.currentView,
                this.selectedFilters,
                this.sortState,
                0,
                this.currentPageSize,
                this.groupByColumns,
                null,
                this.groupByColumns && this.groupByColumns.length ? false : true
            );
        } else {
            this.allowGridRefresh = false;
            this.loadStiReport();
        }
    }

    private resetFilters(currentView) {
        if (this.currentView.SettingViewId) {
            this.filtersList = this.currentView.CodeFilters
                ? this.clone(this.currentView.CodeFilters)
                : this.clone(this.getBaseViewFilters(this.currentView.settingViewId));
            this.setSelectedFilters = this.clone(currentView.selectedFilters);
            this.columnSearchFilter = this.clone(currentView.selectedColumnFilters);
        } else {
            this.currentView.CodeFilters.forEach((filter) => {
                filter.values.forEach((option) => {
                    option.isChecked = false;
                });
            });
            this.filtersList = this.clone(this.currentView.CodeFilters);
        }
        this.getFilteredViewDetails(
            this.currentView,
            this.selectedFilters,
            this.sortState,
            0,
            this.currentPageSize,
            this.groupByColumns
        );
    }

    private editCustomView(dynamicAction) {
        let source, destination;
        if (this.currentView.SettingViewId) {
            this.dialogConfig = this.dialogConfigService.getSaveEditFilterDialogConfig(
                this.dialogConfig
            );
            this.dialogConfig.data = { type: 'edit', selectedView: this.currentView };
            const dialogRef = this.dialog.open(SaveEditFilterContentComponent, this.dialogConfig);
            dialogRef.onClose.subscribe(
                (result) => {
                    if (result.name) {
                        let dynamicAction = result.action;
                        this.currentView.selectedFilters = this.clone(this.selectedFilters);
                        this.currentView.selectedColumnFilters = this.clone(
                            this.columnSearchFilter
                        );
                        let view = {
                            SettingViewId: this.currentView.SettingViewId,
                            SettingDescription: result.name,
                            id: this.currentView._id,
                            EntityGroup: result.EntityGroup,
                            Codes: this.currentView.SettingViewId,
                            SettingJSON: {
                                SetttingContainerId: this.currentContainerID,
                                SelectedFilters: this.currentView.selectedFilters,
                                SelectedColumnFilters: this.currentView.selectedColumnFilters,
                                GroupBy: this.groupByColumns,
                                SelectedColumns: this.selectedColumns
                            }
                        };

                        this.currentView.CodeFilters = this.clone(this.filtersList);
                        this.userService
                            .editFilterView(
                                this.customViewsList,
                                view,
                                source,
                                destination,
                                this.currentView._id,
                                dynamicAction
                            )
                            .subscribe(
                                () => {
                                    this.currentView.Entities = result.EntityGroup;
                                    this.currentView.SettingDescription = result.name;

                                    let index = Utils.getIndexByProperty(
                                        this.customViewsList,
                                        '_id',
                                        this.currentView._id
                                    );
                                    (this.customViewsList[index].SettingDescription = result.name),
                                        (this.customViewsList[
                                            index
                                        ].SelectedFilters = this.currentView.selectedFilters),
                                        (this.customViewsList[
                                            index
                                        ].SelectedColumnFilters = this.currentView.selectedColumnFilters),
                                        (this.customViewsList[
                                            index
                                        ].CodeIsGroup = this.currentView.CodeIsGroup);
                                    this.customViewsList[
                                        index
                                    ].Entities = this.currentView.Entities;
                                    this.setActiveView(this.customViewsList, view, '_id');
                                    this.setActiveView(this.viewList, view, 'code');
                                    this.toastService.addSuccessMessage(
                                        StandardCodes.EVENTS.VIEW_UPDATED
                                    );
                                    this.contextService.removeDataChangeState();
                                },
                                (errorResponse) => {
                                    this.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                                }
                            );
                    }
                },
                (errorResponse) => {
                    this.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                }
            );
        } else {
            this.toastService.addErrorMessage(StandardCodes.EVENTS.NO_VIEW_SELECTED);
            console.warn('Please select a Filter view to edit');
        }
    }
    private removeFilterViewFromList(filterView) {
        let fViews = this.customViewsList;
        let index = Utils.getIndexByProperty(fViews, '_id', filterView._id);
        fViews.splice(index, 1);
        this.customViewsList = fViews;
    }
    public deleteCustomView() {
        if (this.currentView.SettingViewId) {
            this.dialogConfig = this.dialogConfigService.getConfirmationDialogConfig(
                this.dialogConfig
            );
            this.dialogConfig.data = {
                type: 'confirm',
                message: 'Are you sure you want to delete? ',
                title: 'Delete'
            };
            const dialogRef = this.dialog.open(MWDialogContentComponent, this.dialogConfig);
            const ref = this;
            dialogRef.onClose.subscribe((result) => {
                if (result === true) {
                    this.userService.deleteFilterView(this.currentView).subscribe(
                        () => {
                            this.toastService.addSuccessMessage(StandardCodes.EVENTS.VIEW_DELETED);
                            this.setSelectedFilters = [];
                            this.removeFilterViewFromList(this.currentView);
                            this.clearFilters();
                            this.loadView(this.viewList[0]);
                        },
                        (errorResponse) => {
                            this.toastService.showCustomToast('error', errorResponse);
                        }
                    );
                }
            });
        } else {
            this.toastService.addErrorMessage(StandardCodes.EVENTS.NO_VIEW_SELECTED);
        }
    }
    loadCustomView(customView) {
        if (customView) {
            this.groupByColumns = [];
            this.setIsLoading(true, true);
            customView.CodeType = StandardCodesIds.VIEW_TYPE_GRID;
            this.contextService.setContextRecord(
                this.currentPage.contextKey + this.currentView._id,
                null
            );
            this.collectionsService.getDetailsById('settings', customView._id).subscribe(
                async (filterViewDetails) => {
                    customView = filterViewDetails;
                    let codeIsString = typeof filterViewDetails.Codes === 'string';
                    if (codeIsString) {
                        customView.SettingViewId = filterViewDetails.Codes;
                    } else {
                        customView.SettingViewId = filterViewDetails.Codes._id;
                    }
                    if (
                        !(
                            this.isObjectEmpty(customView.SettingJSON.SelectedFilters) &&
                            customView.SettingJSON.SelectedColumnFilters &&
                            customView.SettingJSON.SelectedColumnFilters.length
                        )
                    ) {
                        let treeView =
                            this.viewType == StandardCodes.DATA_TREE ||
                            this.viewType == StandardCodes.DATA_GANTT;
                        let requestObject = this.gridService.getContainerSearchReq(
                            this.contextService,
                            this.currentPage,
                            this.sortState,
                            this.metaData,
                            customView.SettingViewId,
                            customView.SettingJSON.SelectedFilters,
                            null,
                            customView.SettingJSON.GroupBy,
                            treeView,
                            'customView',
                            customView.actionId
                        );
                        this.collectionsService
                            .getGridMetaData(customView.SettingViewId)
                            .subscribe(async (metaData) => {
                                if (metaData.CodeDisplay != null) {
                                    this.titleService.setTitle(metaData.CodeDescription);
                                    this.gridService.setTabDetails(metaData.CodeDisplay);
                                } else {
                                    this.titleService.setTitle(metaData.CodeDescription);
                                }
                                this.setGridMetaData(metaData);
                                let limit = this.currentPageSize;
                                this.groupByColumns = customView.SettingJSON.GroupBy;
                                this.gridService.appendNamedParameters(requestObject, metaData);
                                requestObject['criteria']['isTreeView'] =
                                    this.viewType == StandardCodes.DATA_TREE ||
                                    this.viewType == StandardCodes.DATA_GANTT;
                                this.getViewDetailsFromSerivce(requestObject, 0, limit).subscribe(
                                    async (responseData) => {
                                        let _responseBody = JSON.parse(responseData.body);
                                        this.viewData = _responseBody.result;
                                        this.currentView = customView;
                                        this.currentView.CodeAlias = this.currentPage.CodeAlias;
                                        this.currentView[
                                            'communicationId'
                                        ] = this.gridService.getCommunicationId(this.currentView);
                                        if (
                                            !this.currentPage.parentContainerId &&
                                            !this.isDashboard &&
                                            !this.currentView['isDesigner']
                                        ) {
                                            this.contextService.setRootViewMap(
                                                this.currentPage.contextKey,
                                                this.currentView['communicationId']
                                            );
                                        }
                                        this.currentView.dataObjectCodeCode =
                                            metaData.CodeDataObject;
                                        this.setIsLoading(false);
                                        this.currentView.active = true;
                                        let copyColumnSearchFilter = this.clone(
                                            customView.SettingJSON.SelectedColumnFilters
                                        );
                                        this.columnSearchFilter = copyColumnSearchFilter
                                            ? copyColumnSearchFilter
                                            : {};
                                        this.searchFilters = Utils.getCopy(this.columnSearchFilter);
                                        this.setActiveView(this.customViewsList, customView, '_id');
                                        this.setActiveView(this.viewList, customView, 'CodeCode');
                                        this.setGridData(_responseBody);
                                        if (!customView.SettingJSON.SelectedColumns) {
                                            customView.selectedColumns = _responseBody.header;
                                        }
                                        if (
                                            customView.SettingJSON.SelectedFilters ||
                                            customView.SettingJSON.GroupBy ||
                                            customView.SettingJSON.SelectedColumns
                                        ) {
                                            this.applyCustomViewFilters(
                                                this.clone(
                                                    this.getBaseViewFilters(
                                                        customView.SettingViewId
                                                    )
                                                ),
                                                customView
                                            );
                                            this.applyColumnGroupByFilters(customView);
                                            customView.CodeFilters = this.clone(this.filtersList);
                                        } else {
                                            this.filtersList = this.clone(
                                                this.getBaseViewFilters(customView.SettingViewId)
                                            );
                                        }
                                        this.setSelectedFilters = this.clone(
                                            customView.SettingJSON.SelectedFilters
                                        );
                                        if (responseData.headers) {
                                            this.totalRecords = responseData.headers.get(
                                                'x-total-count'
                                            );
                                        }
                                        //this.contextService.defineContext({}, this.currentView, this.currentPage.parentContainerId);
                                        this.registerEvents();
                                    },
                                    (errorResponse) => {
                                        this.errorMsg = 'Internal Error occured.';
                                        this.setIsLoading(false);
                                        this.toastService.showCustomToast(
                                            TOASTY_ERROR,
                                            errorResponse
                                        );
                                        this.dataSource = [];
                                        //this.dataViewInstance.dataSource = this.dataSource;
                                    }
                                );
                            });
                    }
                },
                (err) => {
                    this.errorMsg = 'Internal Error occured.';
                    this.setIsLoading(false);
                    this.dataSource = [];
                    //this.dataViewInstance.dataSource = this.dataSource;
                }
            );
        }
    }
    private mapColumnWithIndex(columns) {
        for (let col in columns) {
            this.columnIndexMap.set(columns[col].CodeCode, col);
            if (columns[col]['CodeCollapsed'] === 'No') {
                this.setFiltersList(columns[col], 'remove');
            }
        }
    }

    private applyColumnGroupByFilters(customView) {
        let displayColumnsList = this.displayedColumns;
        let groupBy = customView.groupBy;
        let groupableColumnsList = this.groupableColumns;

        setTimeout(() => {
            this.selectedColumns = customView.SettingJSON.SelectedColumns;
            displayColumnsList.forEach((column) => {
                column.isChecked = false;
                let obj = this.selectedColumns.find((obj) => obj.CodeCode === column.CodeCode);
                if (obj) {
                    column.isChecked = true;
                }
            });
            this.displayedColumns = displayColumnsList;
            this.dataViewMetaData.allColumns = this.displayedColumns;
            this.rowOptions = Utils.getCopy(this.displayedColumns);
            this.summaryOptions = Utils.getCopy(this.displayedColumns);
        });
        this.columnHeaders = Utils.getCopy(this.selectedColumns);
        this.mapColumnWithIndex(this.selectedColumns);

        if (customView.groupBy) {
            groupableColumnsList.forEach((column) => {
                if (column.CodeCode === groupBy) {
                    column.isChecked = true;
                } else {
                    column.isChecked = false;
                }
            });
        } else {
            groupableColumnsList.forEach((column) => {
                column.isChecked = false;
            });
        }
        setTimeout(() => {
            this.groupableColumns = groupableColumnsList;
            this.rowGroupOptions = this.getGroupOptions(this.groupableColumns, 'Row');
            this.colGroupOptions = this.getGroupOptions(this.groupableColumns, 'Column');
        });
    }
    expandTreeEvent: any;
    private handleGridAction(action: any, contextMetaData?: any) {
        if (!action) {
            return;
        }
        let task: any;
        let actionCode: any;
        let nestedCriteria: any;
        let nestedMethod: any;
        task = action.CodeUIAction;
        let _action = action.CodeActions;
        if (action.CodeActions && action.CodeActions.length) {
            if (action.CodeActions[0].Task) {
                task = action.CodeActions[0].Task.CodeCode
                    ? action.CodeActions[0].Task.CodeCode
                    : action.CodeActions[0].Task;
            }
            actionCode = action.CodeActions[0].CodeUIAction;
            if (
                action.CodeActions[0].JSONParameter &&
                action.CodeActions[0].JSONParameter.criteria
            ) {
                nestedCriteria = action.CodeActions[0].JSONParameter.criteria;
            }
            if (action.CodeActions[0].JSONParameter && action.CodeActions[0].JSONParameter.method) {
                nestedMethod = action.CodeActions[0].JSONParameter.method;
            }
        }
        if (!task) {
            task = action.CodeCode;
        }
        switch (task) {
            case StandardCodes.TASK_ADD_CODE: {
                this.createNew(null, action);
                break;
            }
            case StandardCodes.TASK_REFRESH_CODE: {
                if (this.groupByInstance) {
                    this.groupByInstance.refreshGrid();
                } else if (
                    this.gridScrolling === StandardCodes.INFINITE ||
                    this.gridScrolling === StandardCodes.VIRTUAL
                ) {
                    this.dataViewInstance.refreshGrid();
                } else {
                    this.refreshGrid();
                }
                break;
            }
            case StandardCodes.TASK_ADD_CHILD_CODE: {
                this.createNew(true, action);
                break;
            }
            case StandardCodes.TASK_RESET_FILTERS_CODE: {
                this.resetFilters(this.currentView);
                break;
            }
            case StandardCodes.TASK_ADD_VIEW_CODE: {
                this.saveCustomView();
                break;
            }
            case StandardCodes.TASK_EDIT_CUSTOM_VIEW_CODE: {
                this.editCustomView(_action);
                break;
            }
            case StandardCodes.TASK_DELETE_CUSTOM_VIEW_CODE: {
                this.deleteCustomView();
                break;
            }
            case StandardCodes.TASK_PRINT_CODE: {
                // TODO:
                Utils.printData('#grid' + this.currentView._id);
                break;
            }
            case StandardCodes.LOAD_VIEW: {
                // TODO:
                Helpers.removeDialog();
                this.loadView(action.view);
                break;
            }
            case StandardCodes.EXPORT_TO_CSV: {
                let treeView =
                    this.viewType == StandardCodes.DATA_TREE ||
                    this.viewType == StandardCodes.DATA_GANTT;
                this.exportData(
                    this.currentView,
                    this.selectedFilters,
                    this.sortState,
                    0,
                    this.totalRecords,
                    this.groupByColumns,
                    null,
                    treeView,
                    this.metaData,
                    this.columnIndexMap,
                    'csv'
                );
                break;
            }
            case StandardCodes.EXPORT_TO_CSV_SELECTED_ROWS: {
                let selectedRecords = [];
                if (!Array.isArray(this.selectedRows)) {
                    selectedRecords.push(this.selectedRows);
                } else {
                    selectedRecords = Object.assign([], this.selectedRows);
                }
                let dataSource = this.gridService.processData(
                    selectedRecords,
                    this.selectedColumns
                );

                this.gridService.exportToCSV(dataSource, this.currentView.CodeDescription);
                break;
            }
            case StandardCodes.EXPORT_TO_EXCEL_SELECTED_ROWS: {
                let selectedRecords = [];
                if (!Array.isArray(this.selectedRows)) {
                    selectedRecords.push(this.selectedRows);
                } else {
                    selectedRecords = Object.assign([], this.selectedRows);
                }
                let dataSource = this.gridService.processData(
                    selectedRecords,
                    this.selectedColumns
                );
                this.gridService.exportToExcel(dataSource, this.currentView.CodeDescription);
                break;
            }
            case StandardCodes.EXPORT_TO_EXCEL: {
                let treeView =
                    this.viewType == StandardCodes.DATA_TREE ||
                    this.viewType == StandardCodes.DATA_GANTT;
                this.exportData(
                    this.currentView,
                    this.selectedFilters,
                    this.sortState,
                    0,
                    this.totalRecords,
                    this.groupByColumns,
                    null,
                    treeView,
                    this.metaData,
                    this.columnIndexMap,
                    'excel'
                );
                break;
            }
            case StandardCodes.TASK_HELP_CODE: {
                //TODO:
                console.log('Help Clicked');
                break;
            }
            case StandardCodes.Grid_Row_Height: {
                this.updateLayoutSizeOnLoad({ CodeCode: action.CodeCode });
                break;
            }

            case StandardCodes.TASK_SELECT_CODE: {
                let data = {};
                data['selectedRecords'] = this.selectedRowsData;
                if (!this.metaData.onlyLookup) {
                    data['selectedRecords'] = this.dataSource;
                }
                data['dataObject'] = this.currentView.dataObjectCodeCode;
                data['viewId'] = this.currentView._id;
                this.broadcaster.broadcast(this.currentContainerID + 'closeLookup', data);
                break;
            }
            case StandardCodes.TASK_CARD_VIEW_CODE: {
                this.viewType = StandardCodes.TASK_CARD_VIEW_CODE;
                this.dataViewMetaData.viewType = StandardCodes.TASK_CARD_VIEW_CODE;
                break;
            }
            case StandardCodes.TASK_LIST_VIEW_CODE: {
                this.viewType = StandardCodes.TASK_LIST_VIEW_CODE;
                this.dataViewMetaData.viewType = StandardCodes.TASK_LIST_VIEW_CODE;

                break;
            }
            case StandardCodes.DATA_TREE: {
                this.viewType = StandardCodes.DATA_TREE;
                this.dataViewMetaData.viewType = StandardCodes.DATA_TREE;
                this.loadTreeView(this.currentView);
                break;
            }
            case StandardCodes.TASK_LOAD_UI_CONTAINER: {
                this.quickTextHandler.currentView = this.currentView;
                let selectedData = this.actionService.getActionDetails(
                    action,
                    this.selectedRow,
                    actionCode,
                    task
                );
                if (
                    action.IsParentContext &&
                    (Utils.isObjectEmpty(this.selectedRow) ||
                        Utils.isArrayEmpty(this.dataSource)) &&
                    (action.CodeCode === 'Update' || action.CodeCode === 'Edit')
                ) {
                    this.toastService.addErrorMessage(StandardCodes.EVENTS.NO_RECORD_SELECTED);
                    return;
                }
                if (selectedData.IsParentContext) {
                    selectedData.parentContainerId = this.currentPage['contextKey'];
                    selectedData['parentContext'] =
                        this.currentPage['contextKey'] + this.currentView._id;
                    if (
                        (nestedCriteria && !nestedCriteria['_id']) ||
                        selectedData.CodeCode === StandardCodes.TASK_ADD_CODE
                    ) {
                        this.createNew();
                    }
                }
                this.menuService.loadContainer(
                    selectedData ? selectedData : action,
                    null,
                    event,
                    null,
                    this.dialog,
                    this.dialogConfig
                );
                break;
            }
            case StandardCodes.TASK_PRINT_CODE: {
                // code to print goes here
                console.log('====> pirnt the grid');
                break;
            }
            case StandardCodes.TASK_DELETE_CODE: {
                console.log('====> delete the row');
                if (
                    Utils.isObjectEmpty(this.selectedRow) ||
                    Utils.isArrayEmpty(this.dataViewInstance.dataSource)
                ) {
                    this.toastService.addErrorMessage(StandardCodes.EVENTS.NO_RECORD_SELECTED);
                    return;
                }
                this.deleteRow(action);
                break;
            }
            case StandardCodes.TASK_SELECTALL_CODE: {
                // code to print goes here
                this.selectAll();
                break;
            }
            case StandardCodes.TASK_DESELECTALL_CODE: {
                this.deSelectAll();
                break;
            }

            case StandardCodes.TASK_LOAD_LOOKUP: {
                this.loadLookup(action);

                break;
            }
            case StandardCodes.MOUSE_RIGHT_CLICK: {
                this.mouseRightClick(contextMetaData, action);
                break;
            }
            case StandardCodes.TASK_OPEN_RECORD_IN_NEW_TAB: {
                this.openRecordInNewBrowserInstance(action, task);
                break;
            }
            case StandardCodes.TASK_OPEN_RECORD_IN_NEW_WINDOW: {
                this.openRecordInNewBrowserInstance(action, task);
                break;
            }
            case StandardCodes.TASK_EXPAND_ALL: {
                this.expandAll(action);
                break;
            }
            case StandardCodes.UI_ACTION_ROW_SELECT: {
                if (action.Task.CodeCode === StandardCodes.TASK_LOAD_UI_CONTAINER) {
                    this.quickTextHandler.currentView = this.currentView;
                    let column = {
                        CodeCode: contextMetaData._id,
                        CodeActions: this.codeActions
                    };
                    let selectedData = this.actionService.getActionDetails(
                        column,
                        contextMetaData,
                        task,
                        ''
                    );
                    if (selectedData.IsParentContext) {
                        selectedData.parentContainerId = this.currentPage['contextKey'];
                    } else {
                        selectedData.parentContainerId = selectedData.UIContainer;
                    }

                    this.menuService.loadContainer(
                        selectedData ? selectedData : action,
                        null,
                        event,
                        null,
                        this.dialog,
                        this.dialogConfig
                    );
                } else if (action.Task.CodeCode === StandardCodes.EXPAND_IN_TREE) {
                    this.expandTreeEvent = this.broadcaster.broadcast(
                        this.currentView.CodeUIContainerDesignerParent +
                            this.currentView.parentContainerId +
                            'ExpandInTree',
                        { _id: contextMetaData.data._id }
                    );
                }
                break;
            }
            case StandardCodes.UI_ACTION_DOUBLE_CLICK: {
                if (action.Task.CodeCode === StandardCodes.TASK_LOAD_UI_CONTAINER) {
                    this.quickTextHandler.currentView = this.currentView;
                    let column = {
                        CodeCode: contextMetaData._id,
                        CodeActions: this.codeActions
                    };
                    let selectedData = this.actionService.getActionDetails(
                        column,
                        contextMetaData,
                        task,
                        ''
                    );
                    if (selectedData.IsParentContext) {
                        selectedData.parentContainerId = this.currentPage['contextKey'];
                    } else {
                        selectedData.parentContainerId = selectedData.UIContainer;
                    }

                    this.menuService.loadContainer(
                        selectedData ? selectedData : action,
                        null,
                        event,
                        null,
                        this.dialog,
                        this.dialogConfig
                    );
                } else if (action.Task.CodeCode === StandardCodes.EXPAND_IN_TREE) {
                    this.expandTreeEvent = this.broadcaster.broadcast(
                        this.currentView.CodeUIContainerDesignerParent +
                            this.currentView.containerID +
                            'ExpandInTree',
                        { _id: contextMetaData.data._id }
                    );
                }
                break;
            }
            case StandardCodes.TASK_OPEN_FILE_SYSTEM: {
                let record = JSON.parse(action.data.body);
                let eventData = {
                    eventType: 'DISPLAY_CHILDREN',
                    mode: VIEW_UPDATE_MODE,
                    data: record,
                    parent: this.currentView.CodeElement
                };
                if (this.isOld) {
                    this.dataSource.unshift(record);
                    this.selectedRow = record;
                    this.addToSelectedList();
                    this.selectedRowsData = [];
                    this.selectedRowsData.push(record);
                    this.handleRowChange(eventData);
                } else if (action.CodeCode === StandardCodes.NEW_VERSION) {
                    this.handleRowChange(eventData);
                    this.contextService.removeDataChangeState();
                    this.contextService.clearContext();
                    this.dataViewInstance.updateRecord(record);
                } else {
                    this.handleRowChange(eventData);
                    this.contextService.removeDataChangeState();
                    this.contextService.clearContext();
                    this.dataViewInstance.add(record);
                }
                break;
            }
            case StandardCodes.MEDIA_PREVIEW: {
                let imgUri = Utils.getMediaPreivew(
                    this.currentRecord.parentRecord._id,
                    this.selectedRow._id
                );
                var myWindow = window.open(
                    '',
                    'Media Preview',
                    'toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400'
                );
                myWindow.document.write(
                    "  <img src='" +
                        imgUri +
                        "'  draggable='false' alt='" +
                        this.selectedRow.FileSearchName +
                        "'>"
                );
                break;
            }
            case StandardCodes.FIELD_LIST: {
                this.dataViewInstance.onFieldListClick = true;
            }
            case StandardCodes.GET_PROPERTY: {
                let dataViewProperty: any;
                if (nestedMethod['parameter']) {
                    if (
                        nestedMethod['parameter'].startsWith('?') &&
                        action[nestedMethod['parameter'].substring(1)] !== undefined
                    ) {
                        if (this.groupByInstance) {
                            dataViewProperty = this.groupByInstance[nestedMethod['name']](
                                action[nestedMethod['parameter'].substring(1)]
                            );
                        } else {
                            dataViewProperty = this.dataViewInstance[nestedMethod['name']](
                                action[nestedMethod['parameter'].substring(1)]
                            );
                        }
                    } else {
                        if (this.groupByInstance) {
                            dataViewProperty = this.groupByInstance[nestedMethod['name']](
                                nestedMethod['parameter']
                            );
                        } else {
                            dataViewProperty = this.dataViewInstance[nestedMethod['name']](
                                nestedMethod['parameter']
                            );
                        }
                    }
                } else {
                    if (this.groupByInstance) {
                        dataViewProperty = this.groupByInstance[nestedMethod['name']]();
                    } else {
                        dataViewProperty = this.dataViewInstance[nestedMethod['name']]();
                    }
                }
                action['value'] = dataViewProperty;
                this.toolBarInstance.setDataViewProperty = action;
            }
            case StandardCodes.SET_PROPERTY: {
                if (nestedMethod && nestedMethod['name']) {
                    if (nestedMethod['parameter']) {
                        if (
                            nestedMethod['parameter'].startsWith('?') &&
                            action[nestedMethod['parameter'].substring(1)] !== undefined
                        ) {
                            if (this.groupByInstance) {
                                this.groupByInstance[nestedMethod['name']](
                                    action[nestedMethod['parameter'].substring(1)]
                                );
                            } else {
                                this.dataViewInstance[nestedMethod['name']](
                                    action[nestedMethod['parameter'].substring(1)]
                                );
                            }
                        } else {
                            if (this.groupByInstance) {
                                this.groupByInstance[nestedMethod['name']](
                                    nestedMethod['parameter']
                                );
                            } else {
                                this.dataViewInstance[nestedMethod['name']](
                                    nestedMethod['parameter']
                                );
                            }
                        }
                    } else {
                        if (this.groupByInstance) {
                            this.groupByInstance[nestedMethod['name']]();
                        } else {
                            this.dataViewInstance[nestedMethod['name']]();
                        }
                    }
                }
            }
            default: {
                console.log("Didn't match any action.... Contact the system administrator!!!");
                break;
            }
        }
    }

    openRecordInNewBrowserInstance(action, task) {
        let currentActionCriteria = this.actionService.getCriteria(
            this.currentRecord,
            action.CodeActions[0]['JSONParameter']
        );
        let context = this.contextService.getContextRecord(
            this.currentPage.contextKey + this.currentView._id
        );
        let url = this.gridService.getRouteURL(
            this.currentRecord,
            this.currentPage,
            this.currentView,
            currentActionCriteria,
            context
        );
        if (task === StandardCodes.TASK_OPEN_RECORD_IN_NEW_WINDOW) {
            Utils.openNewWindow(url);
        } else if (task === StandardCodes.TASK_OPEN_RECORD_IN_NEW_TAB) {
            Utils.openNewTab(url);
        }
    }

    mouseRightClick(contextMetaData, action) {
        if (contextMetaData) {
            contextMetaData.contextMenu.show(contextMetaData.event.originalEvent);
            if (!this.multiSelection) {
                this.onRowSelect(contextMetaData.event);
            }
        } else if (action.Task) {
            if (action.Task.CodeCode === StandardCodes.TASK_REFRESH_CODE) {
                this.contextService.removeContextOnAdd(
                    this.currentPage.contextKey +
                        this.contextService.getRootViewMap(this.currentPage.contextKey),
                    this.currentView
                );
                this.getSelectedViewDetails(
                    this.currentView,
                    {},
                    null,
                    null,
                    this.pageIndex,
                    this.currentPageSize,
                    true
                );
            }
        }
    }

    expandAll(event) {
        if (this.viewType !== 'Data Tree') {
            this.dataViewInstance.expandAll();
        } else {
            this.dataViewInstance.isExpandAll = true;
            if (this.isExpanded) {
                this.dataViewInstance.collapseAll();
            } else {
                this.getFilteredViewDetails(
                    this.currentView,
                    this.selectedFilters,
                    this.sortState,
                    this.pageIndex,
                    this.currentPageSize,
                    this.groupByColumns,
                    10
                );
            }
        }

        this.isExpanded = !this.isExpanded;
    }

    public refreshGrid() {
        this.contextService.removeContextOnAdd(
            this.currentPage.contextKey +
                this.contextService.getRootViewMap(this.currentPage.contextKey),
            this.currentView
        );
        var actionId;
        if (!Utils.isArrayEmpty(this.codeActions)) {
            this.codeActions.forEach((action) => {
                if (
                    action.CodeUIAction &&
                    action.Task &&
                    action.Task.CodeCode === StandardCodes.TASK_SEARCH
                ) {
                    actionId = action['_id'];
                }
            });
        }
        let isTreeGrid =
            this.viewType == StandardCodes.DATA_TREE || this.viewType == StandardCodes.DATA_GANTT;
        let requestObject = this.gridService.getContainerSearchReq(
            this.contextService,
            this.currentPage,
            this.sortState,
            this.metaData,
            this.parentViewID,
            this.selectedFilters,
            null,
            null,
            isTreeGrid,
            this.currentPage.contextKey,
            actionId
        );
        this.getContainerSearchDetails(requestObject, 0, this.currentPageSize);
    }

    private getContainerSearchDetails(requestObject: any, page, limit) {
        if (this.currentView.restrictData) {
            this.setIsLoading(false);
            return;
        }
        let cachedData = JSON.parse(
            this.cacheService.getSessionData('gridData' + this.currentView._id)
        );
        if (this.currentView.CodeCode === 'Quick Output') {
            let gridMetaData = JSON.parse(this.cacheService.getSessionData('currentGridMetaData'));
            if (gridMetaData && gridMetaData.CodeOutputOption) {
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
        if (this.metaData && this.metaData.CodeCacheData && cachedData && cachedData.result) {
            this.totalRecords = cachedData.totalRecords;
            this.handleGridData(cachedData.result);
        } else if (
            this.currentView &&
            this.currentView.CodeCode === StandardCodes.DATA_FORM_HELP_QUICK_SEARCH &&
            this.cacheService.getSessionData('HelpData')
        ) {
            setTimeout(() => {
                this.handleGridData(this.cacheService.getSessionData('HelpData'));
            });
        } else {
            this.getViewDetailsFromSerivce(requestObject, page, limit).subscribe(
                async (responseData) => {
                    if (responseData.headers) {
                        this.totalRecords = responseData.headers.get('x-total-count');
                    }

                    if (this.metaData && this.metaData.CodeCacheData) {
                        this.cacheService.setSessionData(
                            'gridData' + this.currentView._id,
                            JSON.stringify({
                                data: responseData.body,
                                totalRecords: this.totalRecords
                            })
                        );
                    }
                    await this.handleGridData(responseData.body);
                },
                (errorResponse) => {
                    this.errorMsg = 'Internal Error occured.';
                    this.setIsLoading(false);
                    this.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                }
            );
        }
    }
    private handleGridData(data) {
        this.setIsLoading(false);
        let _responseBody = JSON.parse(data);
        this.viewData = _responseBody.result;
        this.currentView.CodeFilters = Utils.getCopy(this.filtersList);
        if (this.currentPage.CodeType === StandardCodes.DATA_PIVOT) {
            this.loadDataView(this.currentPage.CodeType);
        }
        this.setGridData(_responseBody);
        setTimeout(() => {
            this.intializeWidths();
        }, 100);
        this.errorMsg = '';
        this.registerEvents();
    }
    private loadLookup(action) {
        let selectedData = this.actionService.getActionDetails(
            action,
            this.selectedRow,
            StandardCodes.UI_ACTION_CLICK,
            ''
        );
        selectedData.parentContainerId = selectedData.UIContainer;
        selectedData.isOnlyLookup = this.gridService.getLookupType(
            action.CodeActions,
            StandardCodes.UI_ACTION_CLICK
        );
        this.menuService.loadContainer(
            selectedData ? selectedData : action,
            null,
            null,
            event,
            this.dialog,
            this.dialogConfig
        );
        this.callbackEvent = this.broadcaster
            .on<string>(selectedData[StandardCodes.UI_CONTAINER_CODE] + 'callback')
            .subscribe(async (callbackData: any) => {
                this.destroyCallBackEvent();
                let callbackMethods = callbackData.callBack.split('();');
                for (let method of callbackMethods) {
                    this.invokeCallbacks(method, callbackData.data);
                }
            });
    }

    private deleteRow(action) {
        this.dialogConfig = this.dialogConfigService.getConfirmationDialogConfig(this.dialogConfig);
        this.dialogConfig.data = {
            type: 'confirm',
            message: 'Are you sure you want to delete this item? ',
            title: 'Delete'
        };
        const dialogRef = this.dialog.open(MWDialogContentComponent, this.dialogConfig);

        dialogRef.onClose.subscribe((result) => {
            if (result === true) {
                let dynamicAction = Utils.getElementsByProperty(
                    action.CodeActions,
                    StandardCodes.CODE_UI_ACTION,
                    StandardCodes.UI_ACTION_CLICK
                );
                if (dynamicAction.length <= 0) {
                    dynamicAction = Utils.getElementsByProperty(
                        action.CodeActions,
                        StandardCodes.CODE_UI_ACTION,
                        StandardCodes.CONTEXT_MENU
                    );
                }
                let currentContext = this.contextService.getContextRecord(
                    this.currentPage.contextKey + this.currentView._id
                );
                let requestObj = this.actionService.getDeleteRequest(
                    currentContext,
                    this.currentView
                );
                setTimeout(() => {
                    this.requestHandler
                        .handleRequest(
                            requestObj,
                            dynamicAction[0].Task,
                            undefined,
                            undefined,
                            true
                        )
                        .subscribe(
                            async (responseData) => {
                                this.deleteFromSearchGrid(this.selectedRow);
                                this.toastService.addSuccessMessage(
                                    StandardCodes.EVENTS.RECORD_DELETED
                                );
                            },
                            (errorResponse) => {
                                this.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                            }
                        );
                }, 10);
            }
        });
    }
    private saveCustomView() {
        if (
            (this.selectedFilters && this.selectedFilters.length) ||
            Object.keys(this.columnSearchFilter).length ||
            this.groupByColumns
        ) {
            if (!this.currentView.SettingViewId) {
                this.dialogConfig = this.dialogConfigService.getSaveEditFilterDialogConfig(
                    this.dialogConfig
                );
                this.dialogConfig.data = {
                    type: 'save',
                    formData: { type: 'input', value: '', label: 'Name' }
                };
                const dialogRef = this.dialog.open(
                    SaveEditFilterContentComponent,
                    this.dialogConfig
                );
                dialogRef.onClose.subscribe(
                    (result) => {
                        if (result && result.name) {
                            let dynamicAction = result.action;
                            let view = {
                                SettingDescription: result.name,
                                SettingViewId: this.currentView.CodeElement,
                                SetttingContainerId: this.currentContainerID,
                                SelectedFilters: this.selectedFilters,
                                SelectedColumnFilters: this.columnSearchFilter,
                                CodeIsGroup: false,
                                ViewType: StandardCodesIds.VIEW_TYPE_GRID,
                                Type: StandardCodesIds.TYPE_FILTER_VIEW,
                                EntityGroup: result.EntityGroup,
                                GroupBy: this.groupByColumns,
                                SelectedColumns: this.selectedColumns
                            };
                            if (result.EntityGroup && result.EntityGroup.length) {
                                view.CodeIsGroup = true;
                            }

                            this.userService
                                .saveFilterView(view, dynamicAction, this.searchAction?._id)
                                .subscribe(
                                    (responseDta) => {
                                        this.toastService.addSuccessMessage(
                                            StandardCodes.EVENTS.VIEW_ADDED
                                        );
                                        this.contextService.removeDataChangeState();
                                        this.currentView = view;
                                        this.currentView[
                                            'communicationId'
                                        ] = this.gridService.getCommunicationId(this.currentView);
                                        if (
                                            !this.currentPage.parentContainerId &&
                                            !this.isDashboard &&
                                            !this.currentView['isDesigner']
                                        ) {
                                            this.contextService.setRootViewMap(
                                                this.currentPage.contextKey,
                                                this.currentView['communicationId']
                                            );
                                        }
                                        let _responseBody = JSON.parse(responseDta.body);
                                        this.currentView._id = _responseBody.id;
                                        this.currentView.CodeFilters = this.clone(this.filtersList);
                                        this.currentView.active = true;
                                        this.currentView.EntityGroup = result.EntityGroup;
                                        this.customViewsList.push(this.currentView);
                                        this.setActiveView(this.customViewsList, view, '_id');
                                        this.setActiveView(this.viewList, view, 'code');
                                    },
                                    (errorResponse) => {
                                        this.toastService.showCustomToast(
                                            TOASTY_ERROR,
                                            errorResponse
                                        );
                                        this.saveCustomView();
                                    }
                                );
                        }
                    },
                    (errorResponse) => {
                        this.toastService.addErrorMessage(
                            StandardCodes.EVENTS.SYSTEM_ERROR_OCCURRED
                        );
                    }
                );
            } else {
                this.toastService.addErrorMessage(StandardCodes.EVENTS.NO_VIEW_SELECTED);
            }
        } else {
            this.toastService.addErrorMessage(StandardCodes.EVENTS.NO_FILTER_SELECTED);
        }
    }
    private createFilterObj(field, values, type) {
        return {
            CodeElement: field,
            'CodeValue.EqualsAny': values,
            CodeType: type
        };
    }
    invokeCallbacks(method, data) {
        if (method) {
            return this[method].call(this, data);
        }
    }

    private isListNotEmpty(list) {
        return list && list.length;
    }
    updateSearchFilters(value, column) {
        this.columnSearchFilter[column] = value;
        let field = {
            key: column,
            value: value
        };
        //      this.currentFocusedField = value;
        this.triggerColumnSearch(column, true);
        if (column) {
            // this.formCurrentData[field.key] = field.value;
            this.loadDependentFieldOptions(field);
        }
    }
    private selectedHeaderValues: any = {};
    private loadDependentFieldOptions(field) {
        const child = this.parentChildMap[field.key];
        this.selectedHeaderValues[field.key] = field.value._id;
        if (child) {
            let parentFieldsData = {};
            if (!Utils.isArrayEmpty(child.parameterNames)) {
                for (const parameterName of child.parameterNames) {
                    const selectedParentFieldValue = this.selectedHeaderValues[parameterName];
                    if (selectedParentFieldValue) {
                        parentFieldsData[parameterName] = selectedParentFieldValue;
                    }
                }
                if (child.parameterNames.length == Object.keys(parentFieldsData).length) {
                    this.requestHandler
                        .loadFieldOptions(
                            child.CodeCode,
                            parentFieldsData,
                            '',
                            this.currentPage.CodeElement,
                            ''
                        )
                        .subscribe(async (option) => {
                            let index = Utils.getIndexByProperty(
                                this.selectedColumns,
                                'CodeCode',
                                child.CodeCode
                            );
                            if (index >= 0) {
                                let options = JSON.parse(option.body).options;
                                let parsedOptions = Utils.parseOptions(
                                    options,
                                    '',
                                    this.selectedColumns[index].CodeDisplay
                                );
                                this.selectedColumns[index].options = parsedOptions.options;
                                //  this.customisedColumns = this.selectedColumns;
                            }
                        });
                }
            }
        }
    }

    createNew(createChild?, action?) {
        let eventData = this.gridService.getCreateRecordObj(
            this.currentRecord,
            this.currentContainerID,
            this.selectedRow,
            createChild
        );
        eventData.parentRecord = this.gridService.parentRecord;
        if (action && action.CodeActions) {
            let json = action.CodeActions[0].JSONParameter;
            if (json && json['UI'] && !Utils.isObjectEmpty(json['UI'])) {
                eventData.data = { ...eventData.data, ...json['UI'] };
            }
        }

        this.viewMode = ViewModeTypes.CREATE_MODE;
        this.selectedRow = {};
        this.selectedRows = [];
        this.tempSelectedRow = {};
        if (this.currentPage) {
            this.contextService.removeContextOnAdd(
                this.currentPage.contextKey +
                    this.contextService.getRootViewMap(this.currentPage.contextKey),
                this.currentView
            );
            console.log('broadcasting event on' + this.currentView.CodeElement);
            let eventListnerid = this.gridService.getCommunicationId(this.currentView);
            this.broadcaster.broadcast(
                this.currentPage.containerID +
                    (eventListnerid ? eventListnerid : this.currentView.SettingViewId),
                eventData
            );
        }
    }

    /**
     * register language change event and load the translated data in view
     */
    private registerLanguageChangeEvent() {
        this.languageChangeEvent = this.broadcaster
            .on('languageChangeAfterCLDRdataLoaded')
            .subscribe((lang: string) => {
                this.gridService.reloadFormOnce = true;
                this.loadView(this.currentView);
                let pageNumber =
                    this.paginatonChild && this.paginatonChild.page ? this.paginatonChild.page : 0;
            });
    }
    languageChangeEvent: any;
    /**
     * removeing this piece of code and calling it in ngondestry
     */

    public loadGridContainer() {
        this.dataViewInstance?.destroy();
        this.dataViewInstance = undefined;
        this.selectedRow = {};
        this.viewType = '';
        this.dataSource = [];
        this.loadFilterPane();
        this.getFilterViews();
        this.columnSearchFilter = {};
        this.searchFilters = [];
    }
    private intializeWidths() {
        this.intialWindowSize = this.windowSize;
        this.alteredWindowSize = this.windowSize;
        this.intialTableWidth = $('.content-pane--table.' + this.currentView._id).width();
        let rWidth = this.intialTableWidth / this.selectedColumns.length;
        this.tableColumnWidth = (rWidth * this.windowSize) / this.intialTableWidth;
        this.intialColumnWidth = this.tableColumnWidth;
    }

    private onWindowResize(currentWidowSize: number) {
        let count = this.gridService.getColumnToBeAlteredCount(
            this.alteredWindowSize,
            currentWidowSize,
            this.tableColumnWidth,
            this.intialWindowSize,
            this.displayedColumns,
            this.intialColumnWidth
        );

        let isAdd;
        if (count > 0) {
            isAdd = false;
            this.alteredWindowSize =
                currentWidowSize > this.windowSize ? this.windowSize : currentWidowSize;
        } else if (count < 0) {
            count = count * -1;
            isAdd = true;
            this.alteredWindowSize = currentWidowSize;
        }
        let columns = [];
        let maxColumnPeriority = currentWidowSize / ONE_TWELTH_OF_HUNDER_PERCENT;
        this.displayedColumns?.forEach((column) => {
            if (column.CodeColumnPriority <= maxColumnPeriority) {
                column.isChecked = true;
                columns.push(column);
            } else {
                column.isChecked = false;
            }
        });
        if (this.dataViewInstance) {
            if (Utils.isArrayEmpty(columns)) {
                columns.push(this.displayedColumns[0]);
            }
            this.selectedColumns = Utils.getCopy(columns);
            this.dataViewInstance.setSelectedColumns = Utils.getCopy(columns);
        }
        if (this.paginatonChild) {
            this.paginatonChild.resetPageCount();
        }
    }

    private loadTreeView(view) {
        var actionId;
        if (!Utils.isArrayEmpty(this.codeActions)) {
            this.codeActions.forEach((action) => {
                if (
                    action.CodeUIAction &&
                    action.Task &&
                    action.Task.CodeCode === StandardCodes.TASK_SEARCH
                ) {
                    actionId = action['_id'];
                }
            });
        }
        let treeView =
            this.viewType == StandardCodes.DATA_TREE || this.viewType == StandardCodes.DATA_GANTT;
        let requestObject = this.gridService.getContainerSearchReq(
            this.contextService,
            this.currentPage,
            this.sortState,
            this.metaData,
            view._id,
            this.selectedFilters,
            this.sortState,
            this.groupByColumns,
            treeView,
            this.currentPage.contextKey,
            actionId
        );
        this.getViewDetailsFromSerivce(
            requestObject,
            this.pageIndex,
            this.currentPageSize
        ).subscribe(
            async (responseData) => {
                this.setIsLoading(false);
                let _responseBody = JSON.parse(responseData.body);
                this.viewData = _responseBody.result;
                this.setGridBody(_responseBody.result);
                this.errorMsg = '';
                if (this.viewData && this.viewData.length) {
                    this.selectedRow = this.viewData[0];

                    if (this.isOld) {
                        this.onRowSelect(this.selectedRow);
                    }
                }
            },
            (errorResponse) => {
                this.errorMsg = 'Internal Error occured.';
                this.setIsLoading(false);
                this.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
            }
        );
    }
    removeStiReport() {
        if (document.getElementById('reportContent')) {
            document.getElementById('reportContent').innerHTML = '';
        }
    }
    public loadView(view) {
        this.destroyAllEvents();
        this.dataViewInstance = null;
        this.removeStiReport();
        this.gridService.removeStateParams();
        this.rowExpandAction = null;
        this.setIsLoading(true, true);
        const dataChange = this.contextService.isDataChanged();
        if (dataChange) {
            dataChange.subscribe((result) => {
                if (result) {
                    this.contextService.removeDataChangeState();
                    this.handleLoadView(view);
                }
            });
        } else {
            this.handleLoadView(view);
        }
    }
    private handleLoadView(view) {
        this.currentPage = view;
        if (view && !this.isObjectEmpty(view)) {
            this.reSetView(view);
            this.contextService.setContextRecord(
                this.currentPage.contextKey +
                    this.contextService.getRootViewMap(this.currentPage.contextKey),
                null
            );
            this.clearFilters();
            this.clearSortState();

            this.getSelectedViewDetails(
                view,
                null,
                null,
                null,
                this.pageIndex,
                this.currentPageSize
            );
        }
    }
    viewChangedEvent: any;
    private viewChanged(view) {
        this.viewChangedEvent = this.broadcaster.broadcast(
            this.currentPage.containerID + 'viewChanged',
            this.gridService.getCommunicationId(view)
        );
    }
    private clone(filters) {
        if (filters) {
            return JSON.parse(JSON.stringify(filters));
        } else {
            return undefined;
        }
    }
    private clearSortState() {
        this.sortState = [];
        this.dataViewMetaData.sortState = this.sortState;
    }
    private clearFilters() {
        this.groupByColumns = [];
        this.selectedColumns = [];
        this.columnHeaders = [];
        this.columnIndexMap = new Map();
        this.columnSearchFilter = {};
        this.searchFilters = [];
        this.customisedRows = [];
        this.customisedGrouping = [];
        if (this.filtersList) {
            this.filtersList.forEach((type) => {
                if (type.values) {
                    type.values.forEach((option) => {
                        if (option.isChecked) {
                            option.isChecked = false;
                        } else if (option.value) {
                            delete option.value;
                        }
                    });
                }
            });
        }
    }
    private getBaseViewFilters(viewCode: string) {
        let baseView = this.viewList.find((view) => {
            return view.CodeElement == viewCode;
        });
        return baseView ? baseView.CodeFilters : null;
    }
    private applyCustomViewFilters(baseViewFilters, customView) {
        let customViewFilters = customView.SettingJSON.SelectedFilters
            ? customView.SettingJSON.SelectedFilters
            : [];
        let customViewFilterTypesArray = [];
        let customFiltersList = {};

        for (let i = 0; i < customViewFilters.length; i++) {
            customViewFilterTypesArray.push(customViewFilters[i].CodeElement);
            customFiltersList[customViewFilters[i].CodeElement] = customViewFilters[i].CodeValue;
        }

        if (
            baseViewFilters &&
            !(this.isObjectEmpty(baseViewFilters) && this.isObjectEmpty(customViewFilters))
        ) {
            for (let i = 0; i < baseViewFilters.length; i++) {
                let isValidType = customViewFilterTypesArray.indexOf(
                    baseViewFilters[i].CodeElement
                );
                if (isValidType >= 0) {
                    let customFilterOptions: Array<string> =
                        customFiltersList[baseViewFilters[i].CodeElement];
                    for (let j = 0; j < baseViewFilters[i].values.length; j++) {
                        let customFilterOptionIndex = customFilterOptions['EqualsAny'].indexOf(
                            baseViewFilters[i].values[j].CodeDescription
                        );
                        if (customFilterOptionIndex >= 0) {
                            baseViewFilters[i].values[j].isChecked = true;
                        } else {
                            baseViewFilters[i].values[j].isChecked = false;
                        }
                    }
                } else {
                    for (let j = 0; j < baseViewFilters[i].values.length; j++) {
                        baseViewFilters[i].values[j].isChecked = false;
                    }
                }
            }
        }
        this.filtersList = this.clone(baseViewFilters);
    }

    public setGridMetaData(metaData: IGridMetadata) {
        if (metaData['HeaderVisible']) {
            this.dataViewMetaData.headerVisible = metaData['HeaderVisible'] !== 'No';
        }
        if (metaData.CodeFilterBarVisible) {
            this.isFilterBarVisible =
                metaData.CodeFilterBarVisible && metaData.CodeFilterBarVisible === 'Yes';
        }
        if (
            metaData &&
            metaData.PaginationItemsPerPage &&
            !this.isObjectEmpty(metaData.PaginationItemsPerPage.options)
        ) {
            this.pageSizeOptions = metaData.PaginationItemsPerPage.options;
        } else {
            this.pageSizeOptions == [10, 20, 50];
        }
        if (metaData.PaginationItemsPerPage && metaData.PaginationItemsPerPage.CodeDefault) {
            let pageSize = metaData.PaginationItemsPerPage.CodeDefault;
            pageSize = pageSize ? pageSize : this.pageSizeOptions[0];

            this.currentPageSize = pageSize;

            this.pageIndex = 0;
        } else {
            this.currentPageSize = 10;
        }
        if (this.paginatonChild) {
            this.paginatonChild['pageSize'] = String(this.currentPageSize);
        }
        let gridActions = metaData['TaskBars'];

        if (metaData && gridActions && gridActions.length) {
            this.translationContext =
                gridActions[0].CodeCode === 'Blank'
                    ? 'Data Grid.' + this.currentPage.CodeCode
                    : 'Taskbar.' + gridActions[0].CodeCode;

            this.processGridActions(gridActions);
            if (this.metaData && this.metaData.onlyLookup) {
                this.loadViewActions(this.lookUpActions);
            } else {
                this.loadViewActions(this.gridActions);
            }
        } else {
            this.primaryActions = [];
            this.secondaryActions = [];
        }
        this.rowExpandAction = undefined;
        this.dataViewMetaData.rowExpandAction = undefined;
        this.setGridLevelActions(metaData.GridActions);
        this.filtersList = this.clone(metaData.CodeFilters);
        if (this.filtersList) {
            for (let i = 0; i < this.filtersList.length; i++) {
                this.filtersList[i]['isShow'] = 'Yes';
                if (this.filtersList[i].values.length > 0) {
                    this.filtersList.values[i] = Utils.parseOptions(
                        this.filtersList[i].values,
                        '',
                        ''
                    );
                } else if (
                    this.filtersList[i].CodeFilterType === 'Date Time' ||
                    this.filtersList[i].CodeFilterType === 'Time'
                ) {
                    this.filtersList[i].values = [0, 1439];
                    this.filtersList[i].valuesTime = [
                        Utils.minToTimeString(this.filtersList[i].values[0]),
                        Utils.minToTimeString(this.filtersList[i].values[1])
                    ];
                }
            }
        }
        this.globalLanguages = metaData['Languages'];
        this.dataViewMetaData.timeScale = metaData['CodeTimescale'];
        this.dataViewMetaData.timeFrom = metaData['TimeFrom'];
        this.dataViewMetaData.timeInterval = metaData['TimeInterval'];
        this.dataViewMetaData.layout = metaData['CodeLayout'];
        this.dataViewMetaData.chartType = metaData['CodeChartType'];
        let languageInContext = JSON.parse(this.cacheService.getSessionData('language'));
        this.setSelectedLanguage(languageInContext, false);
        this.isFilterPaneVisible =
            metaData.CodeGridPanelVisible === StandardCodes.CODE_YES ? true : false;
        if (this.isFilterPaneVisible) {
            if (metaData['CodeAlias']) {
                this.viewAlias = metaData['CodeAlias'];
            } else {
                this.viewAlias = metaData.CodeCode;
            }
            //  this.gridService.setFilterPaneStatus(this.viewAlias);
            // this.filterPaneHidden = this.gridService.getFilterPaneHidden(this.viewAlias);
            // this.filterPanePinned = this.gridService.getFilterPanePinned(this.viewAlias);
            // if (this.filterPaneHidden) {
            //     this.filterPaneExpanded = false;
            // }
        }
        if (metaData.CodeGridScrolling) {
            this.gridScrolling = metaData.CodeGridScrolling;
        }
        this.dataViewMetaData.gridScrolling = this.gridScrolling;
        this.isPaginatorVisible = this.gridScrolling === 'Default';

        //  this.isColumnFiltersVisible =
        //    metaData.CodeFiltersVisible === StandardCodes.CODE_YES ? true : false;
        this.dataViewMetaData.isColumnFiltersVisible = this.isColumnFiltersVisible =
            metaData.CodeFiltersVisible === StandardCodes.CODE_YES;
        this.isCodeRowReorderable =
            metaData.CodeRowReorderable === StandardCodes.CODE_YES ? true : false;
        this.dataViewMetaData.isCodeRowReorderable =
            metaData.CodeRowReorderable === StandardCodes.CODE_YES;

        this.layoutSize = metaData['CodeGridLayoutSize'];
        this.reportTemplates = metaData['CodeTemplate'];
        this.gridLines = metaData['CodeGridLines'];
        this.dataViewMetaData.gridLines = metaData['CodeGridLines'];
        this.setLayoutDefault();
        Utils.appendStyles(metaData['CSSStyles'], metaData._id);
        // this.viewSelector = this.gridService.setViewSeletor(metaData["UIElementsMetaData"], metaData["UIElements"]);
        this.setGridHeaders(metaData['UIElementsMetaData'], metaData['UIElements']);
    }

    private setLayoutDefault() {
        let defaultLayout;
        if (this.metaData && this.metaData.defaultLayout) {
            defaultLayout = this.metaData.defaultLayout;
        } else {
            defaultLayout = [{ CodeCode: 'Grid', CodeDescription: 'Grid' }];
        }
        this.updateLayoutOnLoad(defaultLayout, true);
        this.updateLayoutSizeOnLoad({ CodeCode: this.layoutSize });
    }

    private searchAction: any;
    private getSelectedViewDetails(
        view,
        filters,
        sortObj,
        groupByObj,
        page,
        limit,
        isRightRefresh?
    ) {
        this.sortOrder = 0;
        let currentState = JSON.parse(this.cacheService.getLocalData('CurrentSate'));
        if (currentState && currentState.currentView) {
            view = currentState.currentView;
            delete currentState.currentView;
            this.cacheService.setLocalData('CurrentSate', JSON.stringify(currentState));
        }
        if (
            this.currentPage.parentContainerId === StandardCodesIds.QUICK_HELP_CONTAINER_ID &&
            this.cacheService.getSessionData('HelpMetaData')
        ) {
            let metaData = JSON.parse(this.cacheService.getSessionData('HelpMetaData'));
            setTimeout(() => {
                this.processGridMetaData(
                    metaData,
                    view,
                    filters,
                    sortObj,
                    groupByObj,
                    page,
                    limit,
                    isRightRefresh
                );
            });
        } else {
            this.collectionsService
                .getGridMetaData(view.CodeElement)
                .subscribe(async (metaData) => {
                    if (!Utils.isObjectEmpty(metaData)) {
                        if (this.currentPage['ContainerCodeCode'] && this.currentPage['CodeCode']) {
                            this.viewTranslationContext =
                                this.currentPage && this.currentPage.CodeAlias
                                    ? this.currentPage['CodeCode']
                                    : (this.currentPage['isDashboardRenderer']
                                          ? 'Dashboard.'
                                          : 'UI Container.') +
                                      this.currentPage['ContainerCodeCode'] +
                                      '.' +
                                      this.currentPage['CodeCode'];
                        } else {
                            this.viewTranslationContext = metaData.CodeCode;
                        }

                        this.processGridMetaData(
                            metaData,
                            view,
                            filters,
                            sortObj,
                            groupByObj,
                            page,
                            limit,
                            isRightRefresh
                        );
                    }
                });
        }
        this.gridService.addViewId(view.CodeElement);
    }

    private processGridMetaData(
        metaData,
        view,
        filters,
        sortObj,
        groupByObj,
        page,
        limit,
        isRightRefresh?
    ) {
        if (!this.currentPage.CodeCode) {
            this.currentPage.CodeCode = metaData.CodeCode;
        }
        if (!this.currentPage.CodeType) {
            this.currentPage.CodeType = metaData.CodeType;
        }
        this.isEditableGrid = metaData.CodeEnabled === 'Yes';
        this.dataViewMetaData.isEditableGrid = metaData.CodeEnabled === 'Yes';
        this.dataViewMetaData.isCollapsed = metaData.CodeCollapsed === 'Yes';
        this.dataViewMetaData.CodeGridEditMode = metaData.CodeGridEditMode
            ? metaData.CodeGridEditMode
            : 'Normal';
        this.dataViewMetaData.namedParameters = metaData.namedParameters;
        this.dataViewMetaData.criteria = this.metaData?.criteria;
        this.dataViewMetaData.setAddMode = this.metaData?.SetAddMode;
        this.dataViewMetaData.filterOptions = this.selectedFilters;
        this.viewType = this.currentPage.CodeType;
        this.setGridMetaData(metaData);
        this.codeGridReportFile = metaData.CodeGridReportFile;
        this.codeCrossTabReportFile = metaData.CodeCrossTabReportFile;
        this.dataViewMetaData.rowSelection = metaData.RowSelection;
        this.dataViewMetaData.rowShading = this.gridRowShading = metaData.CodeRowShading
            ? metaData.CodeRowShading
            : 'No';
        if (!view.CodeSpinnerSize) {
            this.spinnerSize = metaData.CodeSpinnerSize;
        }
        this.setIsLoading(true, true);
        this.codeActions = metaData.GridActions;
        var actionId;
        if (!Utils.isArrayEmpty(this.codeActions)) {
            this.codeActions.forEach((action) => {
                if (
                    action.CodeUIAction &&
                    action.Task &&
                    action.Task.CodeCode === StandardCodes.TASK_SEARCH
                ) {
                    actionId = action['_id'];
                    // this.searchAction = action.Task;
                }
            });
        }
        limit = this.currentPageSize;
        this.setAction(this.codeActions, StandardCodes.TASK_ON_LOAD);
        this.setAction(this.codeActions, StandardCodes.UI_ACTION_DOUBLE_CLICK);
        this.currentView = view;
        this.currentView['communicationId'] = this.gridService.getCommunicationId(this.currentView);
        if (
            !this.currentPage.parentContainerId &&
            !this.isDashboard &&
            !this.currentView['isDesigner']
        ) {
            this.contextService.setRootViewMap(
                this.currentPage.contextKey,
                this.currentView['communicationId']
            );
        }
        this.cacheService.setSessionData('currentGridMetaData', JSON.stringify(metaData));
        this.currentView.dataObjectCodeCode = this.currentView.CodeDataObject =
            metaData.CodeDataObject;
        this.currentView._id = metaData._id;
        this.currentView.CodeCode = metaData.CodeCode;
        if (this.metaData === undefined && !this.currentView.parentContainerId) {
            if (!this.gridService.getIsMenuClick()) {
                if (this.currentView && !this.currentView.isDashboard) {
                    this.titleService.setTitle(this.currentPage.CodeDescription);
                }
            }
            this.gridService.setIsMenuClick(false);
            if (metaData.CodeDisplay != null) {
                this.gridService.setTabDetails(metaData.CodeDisplay);
            } else {
                if (this.currentView && !this.currentView.isDashboard) {
                    this.gridService.SetDisplayTabEmpty();
                }
            }
        }
        if (filters === null && !isRightRefresh) {
            filters = this.selectedFilters;
        } else {
            this.setSelectedFilters = {};
            filters = [];
        }
        if (this.currentPage.CodeType !== StandardCodes.DATA_PIVOT) {
            this.loadDataView(this.currentPage.CodeType);
        }
        let preloadedRecords = metaData['CodePreloadRecords'];

        if (preloadedRecords !== 'No') {
            let treeView =
                this.viewType == StandardCodes.DATA_TREE ||
                this.viewType == StandardCodes.DATA_GANTT;
            let requestObject = this.gridService.getContainerSearchReq(
                this.contextService,
                this.currentPage,
                this.sortState,
                this.metaData,
                view.CodeElement,
                filters,
                sortObj,
                groupByObj,
                treeView,
                this.currentPage.contextKey,
                actionId
            );
            this.getContainerSearchDetails(requestObject, page, limit);
        } else {
            this.setIsLoading(false);
        }
    }

    private selectedRowsData: any = [];
    private setSelectedRows(gridRows) {
        if (this.metaData && this.metaData.selectedRecords) {
            if (this.multiSelection) {
                let selectedRows = this.metaData.selectedRecords['idsList'];
                this.selectedRowsData = Utils.getCopy(this.metaData.selectedRecords['objectsList']);
                if (!Utils.isArrayEmpty(selectedRows)) {
                    for (let record of gridRows) {
                        if (selectedRows.includes(record._id)) {
                            this.selectedRows.push(record);
                        }
                    }
                }
            } else if (this.metaData && !this.multiSelection) {
                let selectedRows = this.metaData.selectedRecords['idsList'];
                this.selectedRowsData = this.metaData.selectedRecords['objectsList'];
                if (!Utils.isArrayEmpty(selectedRows)) {
                    for (let record of gridRows) {
                        if (selectedRows.includes(record._id)) {
                            this.selectedRows.push(record);
                        }
                    }
                }
            }
        }
    }
    private getFilterViews() {
        let filterViewService = this.userService.fetchFilterViews(this.currentContainerID);
        if (filterViewService) {
            filterViewService.subscribe(
                (filterViews) => {
                    if (filterViews) {
                        this.customViewsList = filterViews;
                    }
                },
                (errorResponse) => {
                    this.toastService.showCustomToast('error', errorResponse);
                }
            );
        }
    }
    private setGridData(_responseBody) {
        this.setGridBody(_responseBody.result);
    }
    /**
     * <p>context menu action on right click</p>
     * @param event mouse click event
     */
    public onContextMenuSelect(event) {
        this.handleContextMenuActions(event);
    }
    contextMenus: ContextMenuItemModel[] = [];
    private rightClickAction;
    getType(data) {
        if (data) return typeof data;
    }
    private rowExpandAction: any;
    private setGridLevelActions(data) {
        this.contextMenus = [];
        if (data != null) {
            data.forEach((action) => {
                if (action.CodeUIAction && action.CodeUIAction === StandardCodes.CONTEXT_MENU) {
                    let menu: ContextMenuItemModel = {
                        text: action.JSONParameter.CodeDescription,
                        iconCss: action.JSONParameter.Icon,
                        id: action._id
                    };
                    menu['action'] = action;
                    this.contextMenus.push(menu);
                } else if (
                    action.CodeUIAction &&
                    action.CodeUIAction === StandardCodes.MOUSE_RIGHT_CLICK
                ) {
                    this.rightClickAction = action;
                } else if (
                    action.CodeUIAction &&
                    action.CodeUIAction === StandardCodes.UI_ACTION_ROW_EXPAND &&
                    action.CodeUILocation === 'Insert Below'
                ) {
                    this.rowExpandAction = action;
                    this.dataViewMetaData.rowExpandAction = this.rowExpandAction;
                } else if (
                    action.CodeUIAction &&
                    action.CodeUIAction === StandardCodes.UI_ACTION_ROW_SELECT
                ) {
                    this.rowSelectAction = action;
                } else if (
                    action.CodeUIAction &&
                    action.CodeUIAction === StandardCodes.UI_ACTION_DOUBLE_CLICK
                ) {
                    this.rowdoubleSelectAction = action;
                }
                if (this.actions) {
                    this.actions.push(action);
                }
            });
            this.dataViewMetaData.contextMenus = this.contextMenus;
        }
        let mainContainer = this.cacheService.getSessionData('mainContainer');
        let parentContextActions = JSON.parse(mainContainer)['CodeActions'];
        if (parentContextActions && parentContextActions.length)
            parentContextActions.forEach((menu) => {
                if (menu.CodeUIAction && menu.CodeUIAction === StandardCodes.MOUSE_RIGHT_CLICK) {
                    this.rightClickAction = menu;
                }
                if (menu.CodeUIAction && menu.CodeUIAction === StandardCodes.CONTEXT_MENU) {
                    let action: ContextMenuItemModel = {
                        text: menu.JSONParameter.CodeDescription,
                        iconCss: menu.JSONParameter.Icon,
                        id: menu._id
                    };
                    action['action'] = menu;
                    this.contextMenus.push(action);
                }
            });
        this.dataViewMetaData.contextMenus = this.contextMenus;
    }

    onRightClick($event) {
        let primaryBtn = $event.action;
        if (primaryBtn) {
            $event.preventDefault();
            primaryBtn.CodeActions.forEach((action) => {
                if (action.CodeUIAction === StandardCodes.MOUSE_RIGHT_CLICK) {
                    this.handleGridAction(action);
                }
            });
        }
    }

    setRightClickAction(event, selectedRow, contextMenu) {
        if (this.rightClickAction) {
            let contextMetaData = {
                event: {
                    originalEvent: event,
                    data: selectedRow
                },
                contextMenu: contextMenu
            };
            this.handleGridAction(this.rightClickAction, contextMetaData);
            return false;
        } else {
            contextMenu.hide();
        }
    }

    selectAll() {
        this.selectedRows = [...this.dataSource];
    }
    deSelectAll() {
        this.selectedRows = [];
    }
    private setGridBody(data) {
        this.dataSource = data || [];
        this.setSelectedRows(this.dataSource);
        if (!(this.metaData && this.metaData.selectedRecords) && !this.groupByColumns.length) {
            let event = {};
            if (!Utils.isArrayEmpty(this.dataSource)) {
                if (this.dataSource[0] && this.dataSource[0]['data']) {
                    event = this.dataSource[0]['data'];
                } else {
                    event = this.dataSource[0];
                }
            }
            if (
                this.rowSelect &&
                this.gridService.rowSelect &&
                this.gridRowSelect === 'Single Row' &&
                !(
                    this.metaData &&
                    this.metaData.criteria &&
                    this.metaData.criteria._id &&
                    this.viewType == StandardCodes.DATA_TREE
                )
            ) {
                if (this.isOld) {
                    this.onRowSelect(event);
                }
            } else if (this.gridService.rowSelect === false) {
                this.gridService.rowSelect = true;
                // this.onRowSelect(event);
            }
        }
    }
    collapse;
    private parentChildMap: any = {};

    private setGridHeaders(headers, headerIDs) {
        this.UIComponents = [];
        this.quickSearchField = {};
        let gridHeaders = [];
        let columnsList = [];
        let totalColumns = 0;
        let allowedColumnPriority;
        if (this.windowSize) {
            allowedColumnPriority = this.windowSize / ONE_TWELTH_OF_HUNDER_PERCENT;
        } else if (this.currentView?.isDashboard) {
            let widthInPercent = Helpers.getDashboardItemWidth(
                this.gridService.getCommunicationId(this.currentView)
            );
            allowedColumnPriority = widthInPercent / ONE_TWELTH_OF_HUNDER_PERCENT;
        }
        for (let headerID of headerIDs) {
            if (
                headers[headerID._id].CodeFieldType === 'Notes' ||
                headers[headerID._id].CodeFieldType === 'Rich Text' ||
                headers[headerID._id].CodeType === 'UI Component'
            ) {
                headers[headerID._id].CodeFieldType = 'Text';
            }
            headers[headerID._id].isHeader = true;
            //   headers[headerID._id].CodeVisible = this.isColumnFiltersVisible;
            headers[headerID._id].isTranslatable = Utils.isTranslatable(headers[headerID._id]);
            let CodeColumns = headers[headerID._id].CodeColumns;
            if (CodeColumns) {
                totalColumns = totalColumns + CodeColumns;
            } else {
                headers[headerID._id].CodeColumns = 1;
                totalColumns = totalColumns + 1;
            }
            if (
                headers[headerID._id].CodeVisible ||
                (headers[headerID._id].CodeType === 'UI Component' &&
                    headers[headerID._id].CodeCode === 'Display Field')
            ) {
                headers[headerID._id].allActions = this.gridService.getAvailableActions(
                    headers[headerID._id]
                );
                headers[headerID._id].isClick = Utils.arrayHasProperty(
                    headers[headerID._id].allActions,
                    StandardCodes.UI_ACTION_CLICK
                );
                headers[headerID._id].actions = Utils.getCopy(headers[headerID._id].allActions);
                if (
                    !Utils.isArrayEmpty(headers[headerID._id]['CodeSettings']) &&
                    !headers[headerID._id]['OriginalColumn']
                ) {
                    let elementCopy = Utils.getCopy(headers[headerID._id]);
                    headers[headerID._id]['OriginalColumn'] = elementCopy;
                }
                //this.gridService.removeClick(Utils.getCopy(headers[headerID._id].allActions));

                if (Utils.isTableEditable(this.isEditableGrid, headers[headerID._id])) {
                    headers[headerID._id]['isEditableCell'] = true;
                }
                gridHeaders.push(headers[headerID._id]);
                this.columnsMap[headerID._id] = headers[headerID._id];
                if (
                    headers[headerID._id].CodeColumnPriority <= allowedColumnPriority &&
                    headers[headerID._id].CodeElement !== 'Search'
                ) {
                    columnsList.push(headers[headerID._id]);
                }
                if (headers[headerID._id]['CodeIsCalculatedField'] === 'Yes') {
                    this.calculatedFields.push(headers[headerID._id].CodeCode);
                }
                this.dataViewMetaData.calculatedFields = this.calculatedFields;
                if (
                    headers[headerID._id] &&
                    headers[headerID._id].options &&
                    headers[headerID._id].options.length
                ) {
                    let fieldData = Utils.parseOptions(
                        headers[headerID._id].options,
                        headers[headerID._id].CodeValue,
                        headers[headerID._id].CodeDisplay
                    );
                    headers[headerID._id].options = Utils.getCopy(fieldData.options);
                }
            }
            if (!Utils.isArrayEmpty(headers[headerID._id].parameterNames)) {
                for (const parameterName of headers[headerID._id].parameterNames) {
                    this.parentChildMap[parameterName] = headers[headerID._id];
                }
            }
            if (headers[headerID._id].CodeType === 'UI Component') {
                this.UIComponents.push(headers[headerID._id]);
                if (headers[headerID._id].CodeCode === 'Search') {
                    this.quickSearchField = headers[headerID._id];
                    this.collapse = false;
                    delete headers[headerID._id];
                    let headerIndex = headerIDs.findIndex((header) => {
                        return header._id === headerID._id;
                    });
                    if (headerIndex) {
                        headerIDs.splice(headerIndex, 1);
                    }
                    let gridIndex = gridHeaders.findIndex((header) => {
                        return header._id === headerID._id;
                    });
                    if (gridIndex) {
                        gridHeaders.splice(gridIndex, 1);
                    }
                }
            }
            this.dataViewMetaData.parentChildMap = this.parentChildMap;
        }
        this.gridsterCelWidth = 100 / totalColumns;
        this.dataViewMetaData.gridsterCelWidth = this.gridsterCelWidth;
        let headerData = Utils.getCopy(gridHeaders);
        // let totalColumns =
        headerData.forEach((col) => {
            if (col.CodeColumnPriority <= allowedColumnPriority) {
                col.isChecked = true;
            }
            col.isAllowedToUpdate = col.CodeCollapsed != 'Yes';
            if (col.sorted === 'ASC' || col.sorted === 'DESC') {
                this.onLoadSort(col);
            }

            if (col.CodeValue) {
                this.columnSearchFilter[col.CodeCode] = col.CodeValue;
                this.searchFilters[col.CodeCode] = col.CodeValue;
                this.triggerColumnSearch(col, false);
            }
            if (col.CodeFieldType) {
                col['align'] = this.gridService.getColumnAlignment(col);
            }
        });
        this.displayedColumns = headerData;
        this.dataViewMetaData.allColumns = this.displayedColumns;
        this.rowOptions = Utils.getCopy(this.displayedColumns);
        this.summaryOptions = Utils.getCopy(this.displayedColumns);
        this.groupableColumns = this.getGroupableColumns(headers, headerIDs);
        this.defaultGroupBy = this.getGroupByColumns(headers, headerIDs);
        this.rowGroupOptions = this.getGroupOptions(this.groupableColumns, 'Row');
        this.colGroupOptions = this.getGroupOptions(this.groupableColumns, 'Column');
        this.selectedColumns = Utils.getCopy(columnsList);
        this.dataViewMetaData.selectedColumns = this.selectedColumns;
        // this.customisedColumns = Utils.getCopy(this.selectedColumns);
        this.customisedGrouping = [];
        this.columnHeaders = Utils.getCopy(gridHeaders);
        this.customisedSort('sortState', true);
        this.mapColumnWithIndex(gridHeaders);
        this.dataViewMetaData.columnsMap = this.columnsMap;
        let columns = Utils.getCopy(headerData);
        columns.sort(Utils.compare);
        // this.columnsByPriority = this.displayedColumns;
    }

    private getGroupableColumns(headers: any, ids) {
        let columns = [];
        ids.filter((column) => !Utils.isArrayEmpty(headers[column._id].CodeGroupable)).forEach(
            (elem) => {
                let row = headers[elem._id];
                row['showGroup'] = this.customisedGroupShowDefault;
                columns.push(row);
            }
        );
        return Utils.getCopy(columns);
    }

    private getGroupByColumns(headers: any, ids) {
        let columns = [];
        ids.filter(
            (column) =>
                headers[column._id].CodeGroupBy === 'Yes' ||
                headers[column._id].CodeGroupBy === 'Column' ||
                headers[column._id].CodeGroupBy === 'Row'
        ).forEach((elem) => {
            let row = headers[elem._id];
            row['showGroup'] = this.customisedGroupShowDefault;
            columns.push(row);
        });
        return Utils.getCopy(columns);
    }

    private getGroupOptions(groups, type) {
        groups = groups.filter(function (obj) {
            return (
                obj._id !== 'Details' &&
                obj._id !== 'Summary' &&
                obj.CodeGroupable &&
                obj.CodeGroupable.find((o) => o === type || o === 'Yes')
            );
        });

        if (!Utils.isArrayEmpty(groups)) {
            groups.forEach((group) => {
                if (group.CodeGroupBy === type || group.CodeGroupBy === 'Yes') {
                    group['isChecked'] = true;
                }
            });
        }

        this.customisedGrouping = this.customisedGrouping.filter(function (obj) {
            return obj._id !== 'Details' && obj._id !== 'Summary';
        });
        if (this.viewType == StandardCodes.TASK_REPORT_VIEW_CODE) {
            groups.push(this.customisedGroupDetails);
            groups.push(this.customisedGroupSummary);
            this.customisedGrouping.push(this.customisedGroupDetails);
            this.customisedGrouping.push(this.customisedGroupSummary);
        }

        return groups;
    }

    private updateRowGroupMetaData() {
        this.rowGroupMetadata = {};
        if (this.dataSource) {
            for (let i = 0; i < this.dataSource.length; i++) {
                let rowData = this.dataSource[i];
                let dataKey = rowData._id;
                if (i == 0) {
                    this.rowGroupMetadata[dataKey] = { index: 0, size: 1 };
                } else {
                    let previousRowData = this.dataSource[i - 1];
                    let previousRowGroup = previousRowData._id;
                    if (dataKey === previousRowGroup) {
                        this.rowGroupMetadata[dataKey].size++;
                    } else {
                        this.rowGroupMetadata[dataKey] = { index: i, size: 1 };
                    }
                }
            }
        }
    }

    onSort() {
        this.updateRowGroupMetaData();
    }
    rowExpandCriteria;
    setActionMetaData(row) {
        let criteria = this.actionService.getCriteria(
            row,
            Utils.getCopy(this.rowExpandAction['JSONParameter'])
        );
        this.rowExpandCriteria = { criteria: criteria };
    }

    private dragAndSave($event) {
        if ($event && $event.event && $event.event['fromIndex'] !== $event.event['dropIndex']) {
            let contextRecord = this.contextService.getContextRecord(
                this.currentPage.contextKey + this.currentView._id
            );
            if (
                this.isCodeRowReorderable &&
                (!this.selectedFilters ||
                    this.selectedFilters.length == 0 ||
                    Utils.isObjectEmpty(this.selectedFilters)) &&
                (this.columnSearchFilter ||
                    this.columnSearchFilter.length == 0 ||
                    Utils.isObjectEmpty(this.columnSearchFilter)) &&
                (!this.sortState || this.sortState.length == 0) &&
                (!this.groupByColumns ||
                    this.groupByColumns === '' ||
                    this.groupByColumns.length == 0) &&
                contextRecord.criteria &&
                contextRecord.criteria.dataObjectCodeCode
            ) {
                let list = $event['reorderData'];
                let i = 0;
                let relationships = [];
                list.forEach((element) => {
                    relationships.push({
                        type: contextRecord.criteria.dataObjectCodeCode,
                        _id: element['_id'],
                        meta: {
                            viewId:
                                this.currentView.SettingType !== StandardCodesIds.TYPE_FILTER_VIEW
                                    ? this.currentView.CodeElement
                                    : this.currentView.SettingViewId,
                            userId: 'alok'
                        },
                        payload: {
                            Sort: ++i
                        }
                    });
                });

                let request = {
                    type: contextRecord.dataObjectCodeCode,
                    _id: contextRecord.id,
                    relationships: relationships
                };
                this.collectionsService
                    .updateCollectionItem(request)
                    .subscribe(async (responseData) => {
                        this.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORDS_UPDATED);
                    });
            }
        }
    }
    private getFilteredViewDetails(
        view,
        filters,
        sortObj,
        page,
        limit,
        groupBy,
        maxDepth?,
        loadGrid?
    ) {
        this.viewData = [];
        this.contextService.removeContextOnAdd(
            this.currentPage.contextKey +
                this.contextService.getRootViewMap(this.currentPage.contextKey),
            view
        );
        if (view && (view.CodeElement || view.SettingViewId)) {
            this.setIsLoading(true);
            let viewId =
                view.SettingType !== StandardCodesIds.TYPE_FILTER_VIEW
                    ? view.CodeElement
                    : view.SettingViewId;
            let isTreeview =
                this.viewType == StandardCodes.DATA_TREE ||
                this.viewType == StandardCodes.DATA_GANTT;
            let requestObject = this.gridService.getContainerSearchReq(
                this.contextService,
                this.currentPage,
                this.sortState,
                this.metaData,
                viewId,
                filters,
                sortObj,
                groupBy,
                isTreeview,
                this.currentPage.contextKey,
                this.searchAction?._id
            );
            if (maxDepth) {
                requestObject['criteria']['maxDepth'] = 10;
            }
            this.getViewDetailsFromSerivce(requestObject, page, limit).subscribe(
                async (responseData) => {
                    this.currentView = view;
                    this.currentView['communicationId'] = this.gridService.getCommunicationId(
                        this.currentView
                    );
                    if (
                        !this.currentPage.parentContainerId &&
                        !this.isDashboard &&
                        !this.currentView['isDesigner']
                    ) {
                        this.contextService.setRootViewMap(
                            this.currentPage.contextKey,
                            this.currentView['communicationId']
                        );
                    }
                    this.setIsLoading(false);
                    if (responseData.headers) {
                        this.totalRecords = responseData.headers.get('x-total-count');
                    }
                    let _responseBody = JSON.parse(responseData.body);
                    this.viewData = _responseBody.result;
                    if (Number(this.totalRecords) < Number(limit)) {
                        this.pageIndex = 0;
                    }
                    this.errorMsg = '';
                    if (loadGrid) {
                        this.loadDataView(this.currentPage.CodeType);
                    }
                    this.setGridBody(_responseBody.result);
                    if (this.viewType == StandardCodes.TASK_REPORT_VIEW_CODE) {
                        this.loadStiReport();
                    }
                },
                (errorResponse) => {
                    this.errorMsg = 'Internal Error occured.';
                    this.setIsLoading(false);
                    this.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                    this.dataSource = [];
                    //this.dataViewInstance.dataSource = this.dataSource;
                }
            );
        }
    }

    private getViewDetailsFromSerivce(requestObject, page, limit): Observable<any> {
        this.restrictAPI =
            this.gridScrolling === StandardCodes.INFINITE ||
            this.gridScrolling === StandardCodes.VIRTUAL ||
            !Utils.isArrayEmpty(this.groupByColumns);
        if (this.searchAction) {
            this.searchAction.Task['restrictAPI'] = this.restrictAPI;
            return this.requestHandler.handleRequest(requestObject, this.searchAction.Task, null, {
                page: page,
                limit: limit,
                skip: page * limit,
                take: limit
            });
        }
        return this.collectionsService.getGridRecords(requestObject, page, limit, this.restrictAPI);
    }
    /**
     * resets the current active view
     * @param view :the view to be activated
     */
    private reSetView(view) {
        this.setSelectedFilters = null;
        this.setActiveView(this.customViewsList, view, 'SettingCode');
        this.setActiveView(this.viewList, view, 'CodeCode');
        this.columnSearchFilter = [];

        this.pageIndex = 0;
        this.contextService.setContextRecord('customView', null);
    }
    private isObjectEmpty(obj) {
        return !(obj && Object.keys(obj));
    }
    private setActiveView(viewList, view, key) {
        if (viewList && viewList.length) {
            viewList.forEach((element) => {
                if (view[key] && element[key] === view[key]) {
                    element.active = true;
                } else {
                    element.active = false;
                }
            });
        }
    }

    /**
     *
     * @param event Handler onRowSelect is called when clicked on the table row
     * Handler onRowUnselect is invoked when the above row is licked again (toggled)
     * Since we don't have unselecting function for table, both the handlers perform same function
     * this method names shouldn't be renamed. It is an event handler
     *
     */
    private onRowUnselect(event) {
        if (this.multiSelection) {
            setTimeout(() => {
                if (Utils.isArrayEmpty(this.selectedRowsData)) {
                    this.createNew();
                } else {
                    let row = Object.assign({}, this.selectedRows[this.selectedRows.length - 1]);
                    this.selectedRow = row;
                    this.tempSelectedRow = row;
                    this.viewMode = ViewModeTypes.VIEW_UPDATE_MODE;
                    // this.dataViewMetaData.viewMode = ViewModeTypes.VIEW_UPDATE_MODE;
                }
                this.removeRecord(event);
            });
        } else {
            setTimeout(() => {
                this.selectedRows = Utils.getCopy(this.selectedRow);
            });
        }
    }
    private removeRecord(event) {
        let index = Utils.getIndexByProperty(this.selectedRowsData, '_id', event.data._id);
        this.selectedRowsData.splice(index, 1);
    }
    private onCardSelect(event) {
        this.onRowSelect(event);
    }

    private onImageSelect(event) {
        this.onRowSelect(event);
    }

    onNodeSelect(event) {
        this.onRowSelect(event);
    }

    public onRowDblClick(rowData) {
        if (this.rowdoubleSelectAction) {
            this.handleGridAction(this.rowdoubleSelectAction, event);
        }
    }

    /**
     * For template to load form in CREATE mode by setting type
     * @param event : contains selected record data.
     */
    public onAddRecordSelection(event) {
        this.currentRecord = event;
        this.selectedRow = event;
        this.handleGridAction({ CodeCode: StandardCodes.TASK_ADD_CODE });
    }

    public onRowSelect(event) {
        if (this.contextMenuRows) {
            this.contextMenuRows.forEach((r) => (r.selected = false));
        }
        if (!Utils.isObjectEmpty(event)) {
            this.gridService.setTabName(event, this.currentView);
            let previousSelectedRecord: any;
            if (event.data && !event.isDataChanged) {
                if (!this.currentView.parentContainerId) {
                    this.gridService.parentRecord = event.data;
                }
                previousSelectedRecord = event.data;
            } else if (event.data && event.isDataChanged) {
                previousSelectedRecord = event.data;
            } else {
                previousSelectedRecord = event;
            }
            this.cacheService.setSessionData(
                'previousSelectedRecord',
                JSON.stringify(previousSelectedRecord)
            );
            if (this.rowSelectAction) {
                this.handleGridAction(this.rowSelectAction, event);
            } else {
                let dataChange;
                if (!event.isDataChanged) {
                    dataChange = this.contextService.isDataChanged();
                }
                if (dataChange) {
                    dataChange.subscribe((result) => {
                        if (result) {
                            this.contextService.removeDataChangeState();
                            this.handleRowChange(event);
                        } else {
                            if (
                                this.selectedRow !== undefined &&
                                !Utils.isObjectEmpty(this.selectedRow)
                            ) {
                                event['data'] = this.selectedRow;
                                this.handleRowChange(event, true);
                            }
                        }
                    });
                } else {
                    if (event.data && event.isDataChanged) {
                        this.handleRowChange(event.data, true);
                    } else {
                        this.handleRowChange(event);
                    }
                }
            }
        } else {
            let eventListnerid = this.gridService.getCommunicationId(this.currentView);
            let eventData = {
                data: {
                    eventType: 'HIDE_CHILDREN'
                }
            };
            this.broadcaster.broadcast(eventListnerid, eventData);
        }
    }

    private selectedRows = [];
    private handleRowChange(event, isRowChanged?) {
        const reloadForm = event['reloadForm'];
        if (event['data']) {
            event = event['data'];
        }
        this.parentViewID = this.currentPage.CodeElement;
        const row = event;
        let preRecord = Utils.getCopy(this.selectedRow);
        this.selectedRow = Object.assign({}, row);
        //let _preSelectorObj = this.contextService.getPrevViewSelector();
        if (this.selectedRow && this.currentPage) {
            let selectorObj = this.gridService.getViewSelectorObject(
                this.selectedRow,
                this.currentPage.containerID
            );
            this.contextService.setPrevViewSelector(selectorObj);
            this.tempSelectedRow = Object.assign({}, row);
            this.viewMode = ViewModeTypes.VIEW_UPDATE_MODE;
            //this.dataViewMetaData.viewMode = ViewModeTypes.VIEW_UPDATE_MODE;
            if (Utils.getIndexByProperty(this.selectedRowsData, '_id', this.selectedRow._id) < 0) {
                if (!this.multiSelection) {
                    this.selectedRowsData = [];
                }
                if (Array.isArray(this.selectedRow)) {
                    if (this.selectedRow.length > 1) {
                        this.selectedRow.forEach((data) => {
                            let index = this.selectedRowsData.findIndex((record) => {
                                return record._id === data._id;
                            });
                            if (index < 0) {
                                this.selectedRowsData.push(Utils.getCopy(data));
                            }
                        });
                    } else {
                        this.selectedRowsData = Utils.getCopy(this.selectedRow);
                    }
                } else {
                    this.selectedRowsData = [...this.selectedRowsData, ...[this.selectedRow]];
                }
            }
        }
        this.addToSelectedList();
        this.tempSelectedRow.mode = VIEW_UPDATE_MODE;

        let eventData = {
            eventType: 'DISPLAY_CHILDREN',
            data: this.tempSelectedRow,
            parent: this.currentPage.CodeElement,
            mode: VIEW_UPDATE_MODE,
            reloadForm: reloadForm
        };

        if (
            !Utils.isObjectEmpty(this.gridService.parentRecord) &&
            this.currentView.parentContainerId
        ) {
            if (this.gridService.parentRecord.containerID === this.currentContainerID) {
                eventData['parentRecord'] = this.gridService.parentRecord.parentRecord;
                eventData.data['parentRecord'] = this.gridService.parentRecord.parentRecord;
            } else {
                eventData['parentRecord'] = this.gridService.parentRecord;
                eventData.data['parentRecord'] = this.gridService.parentRecord;
            }
        }
        this.tempSelectedRow.containerID = this.currentContainerID;
        if (!(this.metaData && this.metaData.onlyLookup) && !this.currentPage.isQuickMenu) {
            this.quickTextHandler.setPreviousRecord(this.quickTextHandler.getCurrentRecord());
            this.quickTextHandler.setCurrentRecord(eventData.data);
        }
        // this.headerListenerService.onHeaderUpdate(this.tempSelectedRow);
        this.contextService.defineContext(
            this.selectedRow,
            this.currentView,
            this.currentPage,
            this.currentContainerID,
            this.parentPage
        );
        if (isRowChanged) {
            return;
        }
        //  this.scrollToSelectionPrimeNgDataTree(this.selectedRow);
        if (this.currentView.ContainerCodeCode === StandardCodes.SETTING_TEMPLATES) {
            this.broadcaster.broadcast(this.currentPage.containerID + 'load_starting_page');
        }
        this.emitRecordChange(eventData, this.selectedRow, preRecord);
        setTimeout(() => {
            this.intializeWidths();
            this.gridService.checkFilterToFocus(this, this.currentFocusedElement);
            this.currentFocusedElement = undefined;
        }, 500);
    }
    async emitRecordChange(eventData, selectedRecord, prevRecord) {
        let communicationId;
        communicationId = this.gridService.getCommunicationId(this.currentView);
        let views = this.contextService.getDesignerViews(this.currentPage.containerID);
        if (views) {
            let reloadFomrs = await this.gridService.checkLoadForms(
                selectedRecord,
                prevRecord,
                views,
                eventData
            );
            if (reloadFomrs || this.gridService['reloadFormOnce']) {
                if (this.gridService['reloadFormOnce']) {
                    this.gridService['reloadFormOnce'] = false;
                }
                this.broadcaster.broadcast(
                    this.currentPage.containerID + communicationId,
                    eventData
                );
            } else {
                this.broadcaster.broadcast(
                    this.currentPage.containerID + communicationId + 'recordChanged',
                    eventData
                );
            }
            // if (this.gridLoad) {
            //     setTimeout(() => {
            //         this.gridLoad = false;
            //         this.toolBarInstance?.refreshToolBar();
            //     }, 100);
            // }
        }
    }
    private deleteFromSearchGrid(currentRow) {
        let currentRowTemp = currentRow;
        currentRowTemp.currentView = undefined;
        let index = Utils.getIndexByProperty(this.viewData, '_id', currentRow._id);
        this.selectedRowIndex = index ? index : 0;
        let _dataSource = Utils.getCopy(this.viewData);
        _dataSource.splice(this.selectedRowIndex, 1);
        this.dataSource = _dataSource;
        let nextRecord;
        if (this.selectedRowIndex != 0) {
            nextRecord = this.selectedRowIndex - 1;
        } else {
            nextRecord = this.selectedRowIndex;
        }
        if (this.dataSource && !this.dataSource.length) {
            // We had to push this dummy row to make headers to be displayed. Because p-table takes [value] and doesn't display header row if dataSource.data is empty.
            this.pageIndex = 0;
            this.totalRecords = 0;
        } else {
            this.totalRecords = this.totalRecords - 1;
            let event = this.dataSource[nextRecord];
            setTimeout(() => {
                this.onRowSelect(event);
            });
        }
    }

    updateRecordInGrid(collectionObj) {
        let payload = collectionObj['payload'];
        if (
            this.viewMode !== CREATE_MODE &&
            (!Utils.verifyCalculatedField(this.selectedColumns) ||
                this.viewType === StandardCodes.DATA_GANTT)
        ) {
            if (
                this.viewType == StandardCodes.DATA_GRID ||
                this.viewType == StandardCodes.DATA_TREE ||
                this.viewType == StandardCodes.DATA_KANBAN ||
                this.viewType == StandardCodes.CODE_TYPE_DATA_LIST ||
                this.viewType == StandardCodes.DATA_SCHEDULE ||
                this.viewType == StandardCodes.DATA_PIVOT ||
                this.viewType == StandardCodes.DATA_GANTT
            ) {
                if (this.dataViewInstance && !this.groupByInstance) {
                    this.dataViewInstance.updateRecord(payload);
                } else if (this.groupByInstance) {
                    this.groupByInstance.updateRecord(payload);
                }
            } else {
                this.updateSearchGrid(payload);
            }
        } else {
            this.dynamicRecordUpdate(collectionObj);
        }
    }
    private dynamicRecordUpdate(collectionObj) {
        if (this.viewMode === ViewModeTypes.CREATE_MODE) {
            collectionObj['id'] = collectionObj['payload']['_id'];
        }
        let sequenceId = this.getNestedSequenceId(collectionObj);
        if (sequenceId == 0) {
            this.contextService.defineContext(
                { _id: collectionObj.id },
                this.currentView,
                this.currentPage,
                this.currentContainerID,
                this.parentPage
            );
        }
        let contextRecord = this.contextService.getContextRecord(
            this.currentPage.contextKey +
                this.contextService.getRootViewMap(this.currentPage.contextKey)
        );
        let requestObject = this.createRequestObject(contextRecord, sequenceId);
        this.collectionsService
            .refreshRecord(requestObject)
            .subscribe((updatedCalculatedvalues) => {
                updatedCalculatedvalues = Utils.getResponseBody(updatedCalculatedvalues);
                let updatedValues = { ...updatedCalculatedvalues, ...collectionObj.payload };
                if (this.viewType !== StandardCodes.DATA_TREE) {
                    //  this.updateSearchGrid(updatedValues);
                    this.dataViewInstance.updateRecord(updatedValues);
                } else {
                    this.dataViewInstance.updateRecord(
                        {
                            payload: updatedValues,
                            updatedFields: Object.keys(updatedValues)
                        },
                        this.viewMode === ViewModeTypes.CREATE_MODE ? 'create' : 'update'
                    );
                }
            });
    }
    getNestedSequenceId(collectionObj: any): any {
        if (collectionObj.relationships) {
            return this.getNestedSequenceId(collectionObj.relationships[0]);
        } else if (collectionObj.sequenceId) {
            return collectionObj.sequenceId;
        } else {
            return 0;
        }
    }

    private createRequestObject(contextRecord, sequenceId) {
        let criteria = Utils.getCopy(contextRecord);
        let _criteria = criteria;

        let viewId;
        if (criteria) {
            if (criteria.viewId) {
                viewId = criteria.viewId;
                delete criteria.viewId;
            }
            _criteria = Utils.filterCriteria(_criteria);
        }
        _criteria['includes'] = [];
        this.columnHeaders.forEach((element) => {
            if (Utils.verifyCalculatedField(element)) {
                _criteria['includes'].push(element.CodeCode);
            }
        });
        _criteria = _criteria ? _criteria : criteria;
        return {
            meta: { viewId: this.gridService.findNestedViewId(contextRecord) },
            criteria: _criteria,
            sequenceId: sequenceId
        };
    }

    /**
     * Updates Grid of code's view
     * @param {any} row  : Grid row
     */

    private updateSearchGrid(row) {
        if (this.viewMode !== ViewModeTypes.VIEW_UPDATE_MODE) {
            const limit = Number(row.pageSize)
                ? Number(row.pageSize)
                : Number(this.currentPageSize);
            this.totalRecords = Number(this.totalRecords);
            if (this.totalRecords < limit) {
                this.totalRecords = this.totalRecords + 1;
            } else {
                this.dataSource.pop();
            }
            this.dataSource.unshift(row);

            // need this for highlighting the row
            this.selectedRowIndex = 0;
            this.tempSelectedRow = row;

            // Need to show the right pane
            this.selectedRow = row;
            this.addToSelectedList();
            //sort table to show the new/edited record in place -- compares only type field value. therefore type is must for sorting
            this.contextService.defineContext(
                this.selectedRow,
                this.currentView,
                this.currentPage,
                this.currentContainerID,
                this.parentPage
            );
        } else if (this.viewMode === VIEW_UPDATE_MODE) {
            let selectedRow = this.gridService.updateSelectedRow(
                this.selectedRow,
                row,
                this.selectedColumns
            );
            this.tempSelectedRow = Object.assign({}, selectedRow);
            this.updateCurrentRecord(this.viewData, this.tempSelectedRow);
        }
    }
    private addToSelectedList() {
        if (!this.multiSelection) {
            this.selectedRows = Utils.getCopy(this.selectedRow);
        }
    }

    private updateCurrentRecord(data, selectedRow) {
        let index = Utils.getIndexByProperty(data, '_id', selectedRow._id);
        if (index >= 0) {
            let tempRow = data[index];
            for (let field in selectedRow) {
                tempRow[field] = selectedRow[field];
            }
        } else {
            this.dataSource.push(selectedRow);
        }
    }

    private isContainerPaneLoaded() {
        return this.isLoading && this.viewData.length;
    }
    private onViewResize(event) {
        this.windowSize = event.sizes[1];
        this.zone.run((sizes) => (this.windowSize = event.sizes[1]));
    }

    private clearSearchText(column) {
        this.columnSearchFilter[column.CodeCode] = '';
        /**
         * Clearing field through button doesn't trigger the change event in UI
         * Hence explicitly call the event handlers.
         * first to clear the columnFilter and second to trigger an API call upon filter removal
         * */
        this.triggerColumnSearch(column, true);
    }
    /**
     *
     * @param event : Object holds the current selected page and number of records
     */
    private matPageEventHandler(event, menuButtonName) {
        let page: any = event.pageIndex >= 0 ? event.pageIndex : this.pageIndex;
        let limit;

        limit = event.pageSize ? event.pageSize : this.currentPageSize;
        this.currentPageSize = limit;
        this.pageIndex = page;
        if (menuButtonName) {
            if (menuButtonName === 'previous' && page > 0) {
                this.pageIndex = page--;
            } else {
                this.pageIndex = page++;
            }
        }
        this.getFilteredViewDetails(
            this.currentView,
            this.selectedFilters,
            this.sortState,
            page,
            limit,
            this.groupByColumns
        );
    }

    public getcolumnSearchFilter() {
        let columnFilters = this.columnSearchFilter;
        for (let column in columnFilters) {
            if (typeof columnFilters[column] === 'string') {
                // let containsStar = columnFilters[column].indexOf('*');
                // if (columnFilters[column] && containsStar < 0) {
                //   columnFilters[column] = "^" + columnFilters[column];
                // }
                // let values = [];
                // values.push(columnFilters[column])
                // let filter: IFilterObj = {};
                // let fieldValue: IFilterValue;
                // fieldValue.StartsWith = values
                // filter.CodeElement = column;
                // filter.CodeFilterType = "Text";
                // filter.CodeDataType = "String";
            }
        }
        this.columnSearchFilter = columnFilters;
    }

    public triggerColumnSearch(field: any, loadFlters: boolean) {
        let selectedValue = {};
        selectedValue['CodeFilterType'] = field.columnFilterType || field.CodeFieldType;
        selectedValue['CodeElement'] = field.CodeCode;
        selectedValue['value'] = this.columnSearchFilter[field.CodeCode];
        selectedValue['CodeDescription'] = field.CodeDescription;
        selectedValue['CodeSubField'] = field.CodeSubField;
        let option;
        if (field.CodeFieldType === 'Text') {
            option = this.columnSearchFilter[field.CodeCode];
        } else {
            option = {};
            option['value'] = this.columnSearchFilter[field.CodeCode];
        }
        let filters = [];
        selectedValue['CodeValue'] = selectedValue['value'];
        selectedValue['options'] = selectedValue['values'];
        filters.push(selectedValue);
        this.applyFilters(filters, loadFlters);
    }

    private onCardSort($event) {
        let column = $event.data;
        this.customSort(null, column);
    }
    sortGrid($event) {
        let column = $event.data;
        this.setColumnFilter(column);
    }
    searchOnGrid(event) {
        this.columnSearchFilter = event.data;
        this.triggerColumnSearch(event['field'], true);
    }
    @ViewChild(PaginationComponent) paginatonChild: PaginationComponent;
    private customSort(event, column) {
        column = this.gridService.getSortOrder(column);
        if (!Utils.isArrayEmpty(column.Children)) {
            column.Children.forEach((child) => {
                child = this.gridService.getSortOrder(child);
                this.paginatonChild.resetPageOnCustomSort();
                this.setSortState(child);
            });
            this.getFilteredViewDetails(
                this.currentView,
                this.selectedFilters,
                this.sortState,
                0,
                this.currentPageSize,
                this.groupByColumns
            );
        } else {
            this.paginatonChild.resetPageOnCustomSort();
            this.setColumnFilter(column);
        }
    }

    private onLoadSort(column) {
        if (!Utils.isArrayEmpty(column.Children)) {
            let children = column.Children;
            children.forEach((child) => {
                child = this.setLoadSortOrder(child);
                this.setSortState(child, true);
            });
        } else {
            column = this.setLoadSortOrder(column);
            this.setSortState(column, true);
        }
    }
    private setLoadSortOrder(column) {
        if (!column.sorted) {
            column.sorted = 'ASC';
        }
        return column;
    }
    private setColumnFilter(column: any) {
        this.setSortState(column);
        this.getFilteredViewDetails(
            this.currentView,
            this.selectedFilters,
            this.sortState,
            0,
            this.currentPageSize,
            this.groupByColumns
        );
    }
    private setSortState(column, isOnLoad?: boolean) {
        let subFiled = column.CodeSubField || 'CodeDescription';
        let undefinedIndex = -1;
        let elementIndex = -1;
        if (!(this.sortState && this.sortState.length)) {
            this.sortState = [];
            this.dataViewMetaData.sortState = this.sortState;
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
        this.dataViewMetaData.sortState = this.sortState;
        this.setSortStates(this.sortState);
        this.customisedSort('sortState', isOnLoad);
    }

    public setFiltersList(column, mode) {
        let index = Utils.getIndexByProperty(this.filtersList, 'CodeElement', column.CodeCode);
        if (index >= 0) {
            if (mode.toLowerCase() === 'add') {
                this.filtersList[index]['isShow'] = 'Yes';
            } else {
                this.filtersList[index]['isShow'] = 'No';
            }
        }
    }

    public setFilterCodeValue(filter) {
        if (this.filtersList) {
            this.filtersList.forEach((type) => {
                let value = [];
                if (filter.options && Array.isArray(filter.options)) {
                    filter.options.forEach((element) => {
                        if (element.isChecked) {
                            value.push(element);
                        }
                    });
                    if (value.length === 1) {
                        filter.CodeValue = value[0];
                    } else if (value.length > 1) {
                        filter.CodeValue = value;
                    }
                }

                if (type['CodeElement'] === filter['CodeElement']) {
                    type['value'] = filter['value'] ? filter['value'] : filter['CodeValue'];
                }
            });
        }
        if (!Utils.isArrayEmpty(this.selectedColumns)) {
            let _selectedColumns = Utils.getCopy(this.selectedColumns);
            _selectedColumns.forEach((type) => {
                if (type['CodeCode'] === filter['CodeElement']) {
                    type['CodeValue'] = filter['CodeValue'] ? filter['CodeValue'] : filter['value'];
                }
            });
            this.selectedColumns = _selectedColumns;
            this.customizedColumns = _selectedColumns;
        }
        this.displayedColumns.forEach((type) => {
            if (type['CodeCode'] === filter['CodeElement']) {
                type['CodeValue'] = filter['value'] ? filter['value'] : filter['CodeValue'];
            }
        });
    }

    private customisedSort(type, isOnload?: boolean) {
        if (!Utils.isArrayEmpty(this.displayedColumns)) {
            let result = [];
            for (let i = 0; i < this.displayedColumns.length; i++) {
                let found = false;
                if (type === 'sortState') {
                    // copy sortState to customisedColumn
                    for (let j = 0; j < this.sortState.length; j++) {
                        if (this.sortState[j].CodeElement === this.displayedColumns[i].CodeCode) {
                            this.displayedColumns[i]['sorted'] = this.sortState[j].CodeOrder;
                            found = true;
                        }
                    }
                } else {
                    // applySorting = copy displayedColumns to sortState
                    if (
                        this.displayedColumns[i].sorted !== undefined &&
                        this.displayedColumns[i].sorted !== ''
                    ) {
                        result.push({
                            CodeElement: this.displayedColumns[i].CodeCode,
                            CodeSubField:
                                this.displayedColumns[i].CodeSubField || 'CodeDescription',
                            CodeOrder: this.displayedColumns[i].sorted
                        });
                        found = true;
                    }

                    // set customisedColumns sort to the same as displayedColumns sort
                    let obj = this.selectedColumns.find(
                        (column) => column.CodeCode === this.displayedColumns[i].CodeCode
                    );
                    if (obj) {
                        obj['sorted'] = this.displayedColumns[i].sorted;
                    }
                }
                if (!found) {
                    this.displayedColumns[i]['sorted'] = undefined;
                }
            }
            if (type === 'sortState') {
                this.setSortStates(this.sortState);
                this.dataViewMetaData.sortState = result;
                if (!isOnload) {
                    this.getFilteredViewDetails(
                        this.currentView,
                        this.selectedFilters,
                        this.sortState,
                        0,
                        this.currentPageSize,
                        this.groupByColumns
                    );
                }
            } else if (type === 'applySorting' && !this.groupByInstance) {
                if (Utils.isObjectsEqual(result, this.sortState)) {
                    return;
                }
                this.sortState = result;
                this.setSortStates(result);
                this.dataViewMetaData.sortState = result;
                this.getFilteredViewDetails(
                    this.currentView,
                    this.selectedFilters,
                    this.sortState,
                    0,
                    this.currentPageSize,
                    this.groupByColumns
                );
            }
            this.dataViewMetaData.allColumns = this.displayedColumns;
        }
    }

    public applyCustomisation(event) {
        if (event.customisedColumns) {
            this.selectedColumns = event.customisedColumns;
            this.customizedColumns = event.customisedColumns;
        }
        if (event.displayedColumns) {
            this.displayedColumns = this.allColumns = this.dataViewMetaData.allColumns =
                event.displayedColumns;
            this.customisedSort('applySorting');
        }
        if (event.groupOptions) {
            this.displayedColumns.forEach((column) => {
                event.groupOptions.forEach((groupOption) => {
                    if (column.CodeCode === groupOption.CodeCode) {
                        column.sorted = groupOption.sorted;
                    }
                });
            });
            this.customisedGrouping = event.groupOptions.filter(
                (group) => group.isChecked === true
            );
            if (this.viewType === StandardCodes.DATA_KANBAN) {
                this.dataViewInstance.setRowGrouping = this.customisedGrouping;
            } else if (this.viewType === StandardCodes.DATA_GRID) {
                this.applyCustomisedGrouping(this.customisedGrouping);
            }
        }
        // else if (event.customisedGrouping) {
        //     this.customisedGrouping = event.customisedGrouping;
        //     if (this.viewType === StandardCodes.DATA_KANBAN) {
        //         this.dataViewInstance.setRowGrouping = this.customisedGrouping;
        //     } else if (this.viewType === StandardCodes.DATA_GRID) {
        //         this.applyCustomisedGrouping();
        //     }
        // }
        if (this.viewType == StandardCodes.TASK_REPORT_VIEW_CODE) {
            this.loadStiReport();
        }
    }

    /**
     * <p> This method is used to load the actions of a grid</p>
     * @param actions
     */
    private loadViewActions(actions) {
        this.primaryActions = [];
        this.secondaryActions = [];
        for (let i = 0; i < actions.length; i++) {
            if (actions[i].CodeCollapsed !== 'Yes') {
                this.primaryActions.push(actions[i]);
            } else {
                this.secondaryActions.push(actions[i]);
            }
        }
    }

    // fetchChildActions(actions) {
    //     let children = [];
    //     if (actions.childActions) {
    //         actions.childActions.forEach((childAction) => {
    //             if (childAction.childActions && !Utils.isArrayEmpty(childAction.childActions)) {
    //                 let childs = this.fetchChildActions(childAction);
    //                 children.push(childs);
    //             } else {
    //                 children.push({
    //                     label: childAction.CodeCode,
    //                     icon: childAction.CodeIcon.class

    //                     // command: (event) => {
    //                     //     this.handleGridAction(childAction);
    //                     // }
    //                 });
    //             }
    //         });
    //     }
    //     if (children && !Utils.isArrayEmpty(children)) {
    //         return {
    //             label: actions.CodeCode,
    //             icon: actions.CodeIcon.class,
    //             items: children
    //         };
    //     } else {
    //         return {
    //             label: actions.CodeCode,
    //             icon: actions.CodeIcon.class,
    //             command: (event) => {
    //                 this.handleGridAction(actions);
    //             }
    //         };
    //     }
    // }

    getButtonType(action) {
        if (StandardCodesIds.DISPLAY_ICON === action.CodeButtonType) {
            action.ButtonType = {
                icon: action.CodeIcon.class,
                label: null
            };
        } else if (StandardCodesIds.DISPLAY_TEXT === action.CodeButtonType) {
            action.ButtonType = {
                icon: null,
                label: action.CodeCode
            };
        } else if (StandardCodesIds.DISPLAY_ICONANDTEXT === action.CodeButtonType) {
            action.ButtonType = {
                icon: action.CodeIcon.class,
                label: action.CodeCode
            };
        }
    }

    private setAction(actions, actionType) {
        let setAction = Utils.getElementsByProperty(actions, 'CodeUIAction', actionType);
        if (!Utils.isArrayEmpty(setAction)) {
            switch (actionType) {
                case StandardCodes.TASK_ON_LOAD: {
                    this.searchAction = setAction[0];
                    this.dataViewMetaData.loadAction = setAction[0];
                    break;
                }
                case StandardCodes.UI_ACTION_DOUBLE_CLICK:
                    this.dataViewMetaData.doubleClickAction = setAction[0];
            }
        }
    }

    processGridActions(actions: any) {
        this.lookUpActions = [];
        this.gridActions = [];
        actions.forEach((action) => {
            action.CodeDesigner.forEach((record) => {
                if (record.CodeActions && !Utils.isArrayEmpty(record.CodeActions)) {
                    record.CodeActions.forEach((codeAction) => {
                        this.setActions(record, codeAction);
                    });
                } else if (record.childActions) {
                    if (this.gridActions.indexOf(record) === -1) {
                        this.gridActions.push(record);
                    }
                } else {
                    this.setActions(record);
                }
            });
        });
    }

    public setActions(record, codeAction?) {
        if (
            codeAction &&
            codeAction.Task &&
            codeAction.Task.JSONParameter &&
            codeAction.Task.JSONParameter.displayModes
        ) {
            if (
                this.lookUpActions.indexOf(record) === -1 &&
                codeAction.Task.JSONParameter.displayModes.indexOf(LOOKUP_MODE) >= 0
            ) {
                this.lookUpActions.push(record);
            }
            if (
                this.gridActions.indexOf(record) === -1 &&
                codeAction.Task.JSONParameter.displayModes.indexOf(VIEW_MODE) >= 0
            ) {
                this.gridActions.push(record);
            }
        } else {
            if (record.JSONParameter && record.JSONParameter.displayModes) {
                if (
                    this.lookUpActions.indexOf(record) === -1 &&
                    record.JSONParameter.displayModes.indexOf(LOOKUP_MODE) >= 0
                ) {
                    this.lookUpActions.push(record);
                }
                if (
                    this.gridActions.indexOf(record) === -1 &&
                    record.JSONParameter.displayModes.indexOf(VIEW_MODE) >= 0
                ) {
                    this.gridActions.push(record);
                }
            }
            if (this.gridActions.indexOf(record) === -1) {
                this.gridActions.push(record);
                this.lookUpActions.push(record);
            }
        }
    }

    viewType: string;
    public updateLayoutOnLoad(layout, init?, filterChange?) {
        if (!init) {
            this.contextService.setContextRecord(
                this.currentPage.contextKey + this.currentView._id,
                null
            );
        }
        let previousView = this.selectedLayout;
        if (layout !== undefined && layout) {
            this.selectedLayout = layout;
            switch (layout.CodeCode) {
                case StandardCodes.TASK_CARD_VIEW_CODE: {
                    this.viewType = StandardCodes.TASK_CARD_VIEW_CODE;
                    this.dataViewMetaData.viewType = StandardCodes.TASK_CARD_VIEW_CODE;
                    break;
                }
                // case StandardCodes.TASK_LIST_VIEW_CODE: {
                //     this.dataViewMetaData.viewType = StandardCodes.TASK_LIST_VIEW_CODE;
                //     this.viewType = StandardCodes.TASK_LIST_VIEW_CODE;

                //     break;
                // }
                // case StandardCodes.DATA_TREE: {
                //     this.viewType = StandardCodes.DATA_TREE;
                //     this.dataViewMetaData.viewType = StandardCodes.DATA_TREE;

                //     if (!init) {
                //         this.loadTreeView(this.currentView);
                //     }
                //     break;
                // }
                // case StandardCodes.TASK_CALENDAR_GRID_CODE: {
                //     this.dataViewMetaData.viewType = StandardCodes.TASK_CALENDAR_GRID_CODE;
                //     this.viewType = StandardCodes.TASK_CALENDAR_GRID_CODE;
                //     break;
                // }
                // case StandardCodes.TASK_GALLERY_VIEW_CODE: {
                //     this.viewType = StandardCodes.TASK_GALLERY_VIEW_CODE;
                //     break;
                // }
                // case StandardCodes.TASK_REPORT_VIEW_CODE: {
                //     this.viewType = StandardCodes.TASK_REPORT_VIEW_CODE;
                //     this.dataViewMetaData.viewType = StandardCodes.TASK_REPORT_VIEW_CODE;
                //     this.broadcaster.broadcast('reportsView' + this.currentContainerID, true);
                //     break;
                // }
                // case StandardCodes.TASK_CROSSTAB_VIEW_CODE: {
                //     this.viewType = StandardCodes.TASK_CROSSTAB_VIEW_CODE;
                //     this.broadcaster.broadcast('reportsView' + this.currentContainerID, true);
                //     break;
                // }
                // case StandardCodes.TASK_PIVOT_VIEW_CODE: {
                //     this.viewType = StandardCodes.TASK_PIVOT_VIEW_CODE;
                //     // this.broadcaster.broadcast('reportsView' + this.currentContainerID, true);
                //     break;
                // }
                // case StandardCodes.TASK_ORG_CHART_CODE: {
                //     this.viewType = StandardCodes.TASK_ORG_CHART_CODE;
                //     break;
                // }
                // case StandardCodes.TASK_CHART_VIEW_CODE: {
                //     this.viewType = StandardCodes.TASK_CHART_VIEW_CODE;
                //     break;
                // }
                // case StandardCodes.DATA_KANBAN: {
                //     this.viewType = StandardCodes.DATA_KANBAN;
                //     this.dataSource.forEach((element) => {
                //         if (element.FileStage) {
                //             element.FileStage = element.FileStage.CodeCode;
                //         }
                //     });
                //     break;
                // }
                // case StandardCodes.TASK_SCHEDULE_VIEW_CODE: {
                //     this.viewType = StandardCodes.TASK_SCHEDULE_VIEW_CODE;
                //     break;
                // }
                // default: {
                //     this.viewType = StandardCodes.DATA_GRID;
                //     let isPivotView = this.viewType == StandardCodes.DATA_GRID;
                //     this.broadcaster.broadcast(
                //         'reportsView' + this.currentContainerID,
                //         isPivotView
                //     );
                //     if (filterChange) {
                //         this.getFilteredViewDetails(
                //             this.currentView,
                //             null,
                //             null,
                //             0,
                //             this.currentPageSize,
                //             null
                //         );
                //     }
                //     break;
                // }
            }
            this.customised = false;
            this.rowGroupOptions = this.getGroupOptions(this.groupableColumns, 'Row');
            this.colGroupOptions = this.getGroupOptions(this.groupableColumns, 'Column');
            this.displayedColumns = this.gridService.setPropertyToDisabled(
                false,
                this.displayedColumns,
                this.displayedColumns
            );
            this.dataViewMetaData.allColumns = this.displayedColumns;
            if (this.viewType == StandardCodes.TASK_CROSSTAB_VIEW_CODE) {
                this.rowGroupOptions = this.gridService.setPropertyToDisabled(
                    true,
                    this.rowGroupOptions,
                    this.selectedColumns
                );
                this.rowOptions = this.gridService.setPropertyToDisabled(
                    true,
                    this.rowOptions,
                    this.selectedColumns
                );
            }
            if (
                this.viewType == StandardCodes.TASK_REPORT_VIEW_CODE ||
                this.viewType == StandardCodes.TASK_CROSSTAB_VIEW_CODE
            ) {
                this.loadStiReport();
                this.customisedRows = [];
            }
        }
        if (
            previousView != undefined &&
            previousView.CodeCode === StandardCodes.DATA_TREE &&
            !init &&
            layout.CodeCode !== StandardCodes.DATA_TREE
        ) {
            if (!init) {
                this.loadTreeView(this.currentView);
            }
        }
    }

    public updateLayoutSizeOnLoad(layoutSize) {
        if (layoutSize !== undefined && layoutSize) {
            this.customisedLayoutSize = layoutSize;
            this.rowHeight = this.gridService.getRowHeight(layoutSize);
        }
    }

    handleActions(column, data, event, uiAction?) {
        let navigationUrl = 'mw/menu';
        if (event) {
            event.stopPropagation();
        }
        navigationUrl = `${navigationUrl}/${column.CodeCode}`;
        let actionType = uiAction ? uiAction : StandardCodes.UI_ACTION_CLICK;
        let selectedData = this.actionService.getActionDetails(column, data, actionType, '');
        if (selectedData.IsParentContext) {
            selectedData.parentContainerId = this.currentPage['contextKey'];
        } else {
            selectedData.parentContainerId = selectedData.UIContainer;
        }
        selectedData[StandardCodes.TASK_CODE] = selectedData.Task.CodeCode
            ? selectedData.Task.CodeCode
            : selectedData.Task;
        selectedData[StandardCodes.CODE_UI_LOCATION] = selectedData.CodeUILocation;
        selectedData[StandardCodes.UI_CONTAINER_CODE] = selectedData.UIContainer;
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
    public handleClick(event) {
        Utils.adjustDropdown(event, 'p-multiSelect');
        setTimeout(() => {
            let focusedEleme = $('.dropdown-list .ui-multiselect-filter-container input');
            Utils.focus(focusedEleme);
        }, 100);
    }
    private addParent(data) {
        if (data) {
            let req = this.gridService.createBatchReq(
                data.selectedRecords,
                data.dataObject,
                this.selectedRow._id,
                data.viewId
            );
            if (req.length > 0) {
                this.collectionService.multiChange(req).subscribe((response) => {
                    this.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORD_CREATED);
                    setTimeout(() => {
                        this.dataViewInstance.expandNow(this.selectedRow._id);
                    }, 100);
                });
            }
        }
    }

    private destroyAllEvents() {
        if (this.childCreateEvent) {
            Utils.console('childCreateEvent event destroyed in ' + this.currentView.CodeCode);
            this.childCreateEvent.unsubscribe();
        }
        if (this.versionUpdateEvent) {
            Utils.console('versionUpdateEvent event destroyed in ' + this.currentView.CodeCode);
            this.versionUpdateEvent.unsubscribe();
        }

        if (this.languageChangeEvent) {
            Utils.console('languageChangeEvent event destroyed in ' + this.currentView.CodeCode);
            this.languageChangeEvent.unsubscribe();
        }

        if (this.expandTreeEvent) {
            Utils.console('expandTreeEvent event destroyed in ' + this.currentView.CodeCode);
            this.expandTreeEvent.unsubscribe();
        }

        if (this.dialogCloseEvent) {
            Utils.console('dialogCloseEvent event destroyed in ' + this.currentView.CodeCode);
            this.dialogCloseEvent.unsubscribe();
        }

        if (this.childDeleteEvent) {
            Utils.console('childDeleteEvent event destroyed in ' + this.currentView.CodeCode);
            this.childDeleteEvent.unsubscribe();
        }

        if (this.childUpdateEvent) {
            Utils.console('childUpdateEvent event destroyed in ' + this.currentView.CodeCode);
            this.childUpdateEvent.unsubscribe();
        }
        if (this.childModeEvent) {
            Utils.console('childModeEvent event destroyed in ' + this.currentView.CodeCode);
            this.childModeEvent.unsubscribe();
        }
        if (this.columnFilterEvent) {
            Utils.console('columnFilterEvent event destroyed in ' + this.currentView.CodeCode);
            this.columnFilterEvent.unsubscribe();
        }
        if (this.viewChangedEvent) {
            Utils.console('viewChangedEvent event destroyed in ' + this.currentView.CodeCode);
            this.viewChangedEvent.unsubscribe();
        }

        this.destroyCallBackEvent();
    }
    private clearObjects() {
        this.dataViewInstance = null;
        this.dataViewInstance?.destroy();
        this.dataViewObj = null;
        this.defaultGroupBy = [];
        this.displayedColumns = [];
        this.selectedFilters = [];
        this.rowOptions = [];
        this.summaryOptions = [];
        this.groupableColumns = [];
        this.globalLanguages = [];
        this.pageSizeOptions = [];
        this.toolBarInstance = null;
        this.rowGroupOptions = null;
        this.colGroupOptions = null;
        this.lookUpActions = null;
        this.gridActions = null;
        this.primaryActions = null;
        this.secondaryActions = null;
        this.customizedColumns = [];
        this.selectedColumns = [];
        this.customisedRows = null;
        this.filtersList = null;
        this.columnSearchFilter = null;
        this.contextMenuRows = null;
        this.groupByColumns = null;
        this.customisedGroupDetails = null;
        this.customisedGrouping = [];
        this.customViewsList = [];
        this.columnHeaders = [];
        this.searchFilters = [];
    }
    private destroyCallBackEvent() {
        if (this.callbackEvent) {
            this.callbackEvent.unsubscribe();
        }
    }

    isHeaderAvailable() {
        if (
            this.secondaryActions &&
            this.secondaryActions.length == 0 &&
            this.primaryActions &&
            this.primaryActions.length == 0
        ) {
            if (this.currentPage && !this.currentPage.CodeElement) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    handleContextMenuActions(event) {
        let actions = [];
        actions.push(event.item.action);
        let _action = { CodeActions: actions };
        // this.handleActions(column, this.selectedRow, null, event.item.action.CodeUIAction);
        // let action=event.item.action;

        // action.CodeCode=action.Task;
        // action.CodeRun=action
        this.handleGridAction(Utils.getCopy(_action));
    }

    exportData(
        currentView: any,
        selectedFilters: any,
        sortState: any,
        page: number,
        totalRecords: number,
        groupByColumns: any,
        conext: any,
        isTreeTable,
        metadata,
        columnsMap,
        exportType: string
    ) {
        let requestObject = this.gridService.createSearchRequetObj(
            currentView._id,
            selectedFilters,
            sortState,
            groupByColumns,
            isTreeTable,
            conext,
            metadata
        );
        this.collectionService
            .getGridRecords(requestObject, page, totalRecords)
            .subscribe(async (responseData) => {
                let _responseBody = JSON.parse(responseData.body);
                let data = _responseBody.result;
                let processedData = this.gridService.processData(data, this.selectedColumns);
                if (exportType === 'csv') {
                    this.gridService.exportToCSV(processedData, currentView.CodeDescription);
                } else if (exportType === 'excel') {
                    this.gridService.exportToExcel(processedData, currentView.CodeDescription);
                }
            });
    }
    public set rowHeight(val) {
        this.dataViewMetaData.rowHeight = val;
        if (this.dataViewInstance && !this.groupByInstance) {
            this.dataViewInstance.setRowHeight = val;
        }
        if (this.groupByInstance) {
            this.groupByInstance.setRowHeight = val;
        }
    }
    public set viewMode(val: ViewModeTypes) {
        this.dataViewMetaData.viewMode = val;

        if (this.dataViewInstance) {
            this.dataViewInstance.setViewMode = val;
        }
    }
    public get viewMode() {
        return this.dataViewMetaData.viewMode;
    }
    public get rowHeight() {
        return this.dataViewMetaData.rowHeight;
    }
    public get dataSource() {
        if (this.dataViewInstance) return this.dataViewInstance.dataSource;
    }
    public set customizedColumns(columns) {
        this.dataViewMetaData.selectedColumns = columns;
        if (this.dataViewInstance && !this.groupByInstance) {
            this.dataViewInstance.setSelectedColumns = columns;
        }
        if (this.groupByInstance) {
            this.groupByInstance.setSelectedColumns = columns;
        }
    }
    public get customizedColumns() {
        if (this.dataViewInstance) return this.dataViewInstance.selectedColumns;
    }
    public set allColumns(columns) {
        this.dataViewMetaData.allColumns = columns;
        if (this.dataViewInstance) {
            this.dataViewInstance.setAllColumns = columns;
        }
    }
    public set dataSource(data) {
        if (this.dataViewInstance) {
            this.dataViewInstance.setDataSource = data;
        }
    }
    /**
     * sets the column filters for the view
     * @param data : data containing the colum filter details
     */
    public set setSelectedFilters(data) {
        this.selectedFilters = data;
        if (this.dataViewInstance && !this.groupByInstance) {
            this.dataViewInstance.setSelectedFilters = data;
        }
        if (this.toolBarInstance) {
            data = data ? data : [];
            this.toolBarInstance.buildFilterBarText(data);
        }
        if (this.groupByInstance) {
            this.groupByInstance.setSelectedFilters = data;
        }
    }
    /**
     * sets the sort state for the view
     * @param data : data containing the sort state details
     */
    public setSortStates(data) {
        if (this.dataViewInstance) {
            this.dataViewInstance.setSortState = data;
        }
    }
    /**
     * sets the state of loading
     * @param isLoading : boolean to loading state
     * @param isGridMetaDataLoading : weather it is a grid metadata loading
     */
    setIsLoading(isLoading: boolean, isGridMetaDataLoading?: boolean) {
        this.isLoading = isLoading;
        if (this.toolBarInstance && isGridMetaDataLoading) {
            this.toolBarInstance.setIsLoading(isLoading);
        } else if (this.toolBarInstance && isLoading === false) {
            this.toolBarInstance.setIsLoading(isLoading);
        }
    }
    /**
     * <p> To add a row in the grid</p>
     * @param row : Row to be updated
     */

    ngOnDestroy() {
        this.destroyAllEvents();
        this.gridService.removeStateParams();
        // this.clearObjects();
    }
}
