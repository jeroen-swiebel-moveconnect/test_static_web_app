import { Component, Input, NgZone, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { CollectionsService, EventsListenerService } from 'src/app/moveware/services';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { RuleEngineService } from 'src/app/moveware/services/rule-engine.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import Utils from 'src/app/moveware/services/utils';
import { ContextService } from '../../services/context.service';
import { Helpers } from '../../utils/helpers';

@Component({
    selector: 'app-container',
    templateUrl: './app-container.component.html',
    styleUrls: ['./app-container.component.scss']
})
export class AppContainerComponent implements OnInit, OnDestroy {
    containerMetaData = [];
    pageMapper = [];
    loadWithoutReferesh: boolean = false;
    applyTransition: boolean = true;
    private reportGridEvent: any;
    private rowChangeEvent: any;
    containerCodeCode: string;
    constructor(
        private collectionService: CollectionsService,
        private toastService: ToastService,
        private broadcaster: Broadcaster,
        private globalPageMappings: PageMappingService,

        private zone: NgZone,
        private ruleEngine: RuleEngineService,
        private contextService: ContextService,
        private cache: CacheService,
        private menuService: MenuService,
        private cacheService: CacheService
    ) {}
    private originalColWidths: Array<number> = [];
    private originalRowHeights: Array<number> = [];
    colCount: number = 2;
    rowCount: number = 1;
    @Input() isDefaultContainer: any;
    @Input() defaultViewId: any;
    @Input() containerID: any;
    @Input() isQuickMenu: any;
    @Input() pageContainerData: any;
    moduleCode: any;
    routeEventSubscriber: any;
    @Input() parentViewID: any;

    @Input() dynamicView: any;
    @Input() metaData;
    @Input() isDashboard: boolean;
    activeRowCount: number = 1;
    activeColumnCount: number = 1;
    activeDisplayMap = [];
    activePageMapper = [];
    private typechangeEvent: any;
    @Input() windowSize: number;
    containerChildren: any = [];
    @Input() currentRecord: any;
    // SUB-CONTAINER RELATED INPUTS: START
    @Input() isSubContainer: boolean = false;
    @Input() subContainerID: any;
    @Input() parentContainer: string;
    gutterSize: number = 5;
    // SUB-CONTAINER RELATED INPUTS: END
    private rowHeights: Array<number> = [];
    private columnWidths: Array<number> = [];
    private childSubscriber: any;
    // private childDeleteSubscribers: any = [];
    private childCancelSubscriber: any;
    private widthModified: boolean = false;
    private heightModified: boolean = false;

    //  private typechangeEvents: Array<any> = [];
    ngOnInit() {
        if (this.isDefaultContainer === undefined) {
            this.isDefaultContainer = true;
        }
        if (this.isSubContainer) {
            this.containerMetaData = [];
            this.containerID = this.subContainerID;
            this.loadContainer(this.subContainerID);
            if (!this.rowChangeEvent) {
                this.registerRowChangeEvent();
            }
        } else {
            if (!this.isQuickMenu && !this.isDashboard) {
                this.clearContext();
                this.unSubscribeContainerEvents();
            }
            if (this.metaData && this.metaData.currentRecord) {
                this.currentRecord = this.metaData.currentRecord;
            }
            this.loadContainer(this.containerID);
        }
        /**
         * Commenting this since we are not using stimulsoft now
        this.registerEventsToReportGrid();
         */
        /**
         * Commenting this since we are not using stimulsoft now
        // this.toggleViewEvent = this.broadcaster
        //     .on(this.containerID + 'toggleViews')
        //     .subscribe((re) => {
        //         this.columnWidths = [0.01, 99.99];
        //         this.gutterSize = 0.01;
        //     });
        */
    }
    private toggleViewEvent: any;
    hideAndBack(data) {
        this.columnWidths = [99.99, 0.01];
        this.gutterSize = 0.01;
    }
    private clearContext() {
        this.contextService.clearContext();
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes['defaultViewId'] && !changes['containerID']) {
            this.unSubscribeContainerEvents();
            this.loadContainer(this.containerID);
        }
        if (
            changes['subContainerID'] &&
            changes['subContainerID'].previousValue !== changes['subContainerID'].currentValue &&
            !changes['subContainerID'].firstChange
        ) {
            this.unSubscribeContainerEvents();
            this.containerID = this.subContainerID;
            this.loadContainer(this.subContainerID);
        }
        if (
            changes['containerID'] &&
            changes['containerID'].previousValue !== changes['containerID'].currentValue &&
            !changes['containerID'].firstChange
        ) {
            this.unSubscribeContainerEvents();
            this.containerID = changes['containerID'].currentValue;
            this.loadContainer(this.containerID);
        }
        if (changes['windowSize']) {
            this.windowSize = changes['windowSize'].currentValue;
        }

        if (this.loadWithoutReferesh) {
            this.unSubscribeContainerEvents();
            this.loadContainer(this.subContainerID);
        }
    }

    registerActiveViewEvents(viewId) {
        this.unSubscribeChildEvents();
        this.childSubscriber = this.broadcaster
            .on<string>(this.containerID + viewId)
            .subscribe((event) => {
                if (!this.isIdenticalRecords(event) || event['isDesigner']) {
                    this.parentViewID = event['parent'];
                    this.currentRecord = event['data'];
                    this.currentRecord['mode'] = event['mode'];
                    this.currentRecord['parentRecord'] = event['parentRecord'];
                    this.handleEvent(event, viewId);
                }
            });
        //this.childSubscriber.push(sub);

        this.childCancelSubscriber = this.broadcaster
            .on<string>(viewId + 'child_cancel')
            .subscribe((event) => {
                let currentPage = event['currentPage'];
                if (currentPage.row > currentPage.column) {
                    this.removeRow();
                } else {
                    this.removeColumn();
                }
            });
        // this.childCancelSubscriber.push(cancelEvent);

        this.typechangeEvent = this.broadcaster
            .on<string>(viewId + 'typeChanged')
            .subscribe((event) => {
                let view = {};
                view['CodeAlias'] = viewId;
                let contextKey = this.parentContainer || this.containerID;
                this.contextService.removeContextOnAdd(
                    contextKey + this.contextService.getRootViewMap(contextKey),
                    view
                );
                let isSelectChange = event['data'] && event['data']['source'] === 'selectChange';
                if (isSelectChange) {
                    // If select component emits event Call the optionChanged Method and set it to the current Record's Type field.
                    if (event && event['valueCode']) {
                        let rec = event['data'];
                        let type = event['valueCode'];
                        this.currentRecord = {};
                        this.currentRecord[rec['code']] = type;
                        this.currentRecord['mode'] = event['mode'];
                        this.currentRecord['_id'] = event['_id'];
                        if (event['noDefaultValue'] && event['noDefaultValue'].length) {
                            this.currentRecord['noDefaultValue'] = event['noDefaultValue'];
                        }
                        this.currentRecord['parentRecord'] = event['data']['parentRecord'];
                        this.cache.setSessionData(
                            'previousSelectedRecord',
                            JSON.stringify(this.currentRecord)
                        );
                        this.renderChildren(event['views']);
                    }
                }
            });
        /**
         * Commenting this as we are not using them
         */
        // this.updateHeights();
    }
    viewChangeEvent;
    registerViewChangeEvent() {
        if (this.viewChangeEvent) {
            this.viewChangeEvent.unsubscribe();
        }
        this.viewChangeEvent = this.broadcaster
            .on(this.containerID + 'viewChanged')
            .subscribe((viewId) => {
                this.registerActiveViewEvents(viewId);
            });
    }
    /**
     * checks weather record is already loaded or not
     * @param event current record data to be loaded
     * @returns : true if same else false
     */
    private isIdenticalRecords(event: any) {
        if (this.currentRecord && event && event['data'] && event['data']._id) {
            return (
                (this.currentRecord._id && this.currentRecord._id === event['data']._id) ||
                (this.currentRecord.parentRecord &&
                    this.currentRecord.parentRecord._id &&
                    this.currentRecord.parentRecord._id === event['data']._id)
            );
        }
    }

    private registerRowChangeEvent() {
        if (
            this.pageContainerData.containerID &&
            this.pageContainerData.CodeUIContainerDesignerParent
        ) {
            this.rowChangeEvent = this.broadcaster
                .on<string>(
                    this.pageContainerData.containerID +
                        this.pageContainerData.CodeUIContainerDesignerParent +
                        'recordChanged'
                )
                .subscribe((event) => {
                    if (
                        this.pageContainerData &&
                        this.pageContainerData.containerID &&
                        !this.isIdenticalRecords(event)
                    ) {
                        console.log('=====> loading sub container');
                        this.loadContainer(this.containerID);
                        this.currentRecord = event['data'];
                    }
                });
        }
    }
    async handleEvent(event: any, child) {
        let record = event.data;
        let views;
        if (!event.views) {
            views = await this.getViewByType(record, this.pagesMap);
        } else {
            views = event.views;
        }
        if (!Utils.isObjectEmpty(views)) {
            views = Utils.processAliases(views);
            this.renderChildren(views);
        } else {
            //To check if secondary page is already loaded
            if (!this.isSubContainer && (this.activeColumnCount > 1 || this.activeRowCount > 1)) {
                this.broadcaster.broadcast(this.containerID + child + 'recordChanged', event);
            }
        }
    }

    async getViewByType(record, views) {
        let viewsByType = [];
        viewsByType = await this.ruleEngine.processSettings(record, views, 'Forms');
        return viewsByType;
    }
    private renderChildren(viewsByType) {
        // CLEAR PREVIOUS VIEWS FROM THE DISPLAY.
        if (!viewsByType) {
            this.toastService.addErrorMessage(
                StandardCodes.EVENTS.CONFIGURATION_ERROR,
                '101 - Configuration Error'
            );
            console.error('No View Is Configured');
            return;
        }
        Object.keys(viewsByType).forEach((viewId) => {
            let obj = viewsByType[viewId];
            if (obj.row && obj.column && obj.CodeVisible) {
                obj.parentContainerId = this.parentContainer || this.containerID;
                obj.contextKey = this.parentContainer || this.containerID;
                obj.containerID = this.containerID;
                obj.parentViewID = this.parentViewID;
                obj['immediateParentContainerID'] = this.containerID;
                if (!this.activePageMapper[obj.row - 1]) {
                    this.activePageMapper[obj.row - 1] = [];
                }
                this.activePageMapper[obj.row - 1][obj.column - 1] = [];
            }
        });

        // SET NEW VIEWS BY TYPE.
        Object.keys(viewsByType).forEach((viewId) => {
            let obj = viewsByType[viewId];
            if (obj.row && obj.column && obj.CodeVisible) {
                if (this.activePageMapper[obj.row - 1][obj.column - 1]) {
                    this.activePageMapper[obj.row - 1][obj.column - 1].push(obj);
                } else {
                    this.activePageMapper[obj.row - 1][obj.column - 1] = [];
                    this.activePageMapper[obj.row - 1][obj.column - 1].push(obj);
                }
            }
            if (obj.page) {
                this.addRemoveRowsColumns(obj.row, obj.column);
            }
        });
    }
    updateGridValue(subContainerID) {
        this.subContainerID = subContainerID;
        this.loadWithoutReferesh = true;
    }

    private addRemoveRowsColumns(row: number, column: number) {
        if (this.activeRowCount < row) {
            this.addRow();
        } else if (this.activeRowCount > row) {
            this.removeRow();
        } else if (this.activeRowCount === row) {
            this.calculateHeights(this.activeRowCount);
        }
        if (this.activeColumnCount < column) {
            this.addColumn();
        } else if (this.activeColumnCount > column) {
            this.removeColumn();
        } else if (this.activeColumnCount === column) {
            this.calculateWidths(this.activeColumnCount);
        }
    }
    private rowSize: string;
    private columnSize: string;
    private isDynamicContainer: boolean;
    private pagesMap: any;

    private loadContainer(containerID: any) {
        let currentState = JSON.parse(this.cacheService.getLocalData('CurrentSate'));
        if (currentState && currentState.context) {
            containerID = currentState.context.criteria.containerId;
        }

        let isLoadedFromOverlay =
            this.metaData && this.metaData.isLoadedFromOverlay
                ? this.metaData.isLoadedFromOverlay
                : null;
        if (!containerID) {
            this.toastService.addErrorMessage(
                StandardCodes.EVENTS.CONFIGURATION_ERROR,
                '102 - Configuration Error'
            );
            console.error('container not configured properly');
        }
        this.collectionService.getContainer(containerID).subscribe(
            (response) => {
                this.contextService.setTranslationContext(
                    response,
                    this.isSubContainer,
                    this.pageContainerData
                );

                this.menuService.setOverlayLoadedContainers(isLoadedFromOverlay, response);
                this.containerCodeCode = response.CodeCode;
                this.contextService.setContiainer = {
                    CodeCode: this.containerCodeCode,
                    CodeType: response.CodeType,
                    _id: response._id
                };

                this.containerMetaData = response.Pages;
                this.rowCount = response.CodeRows;
                this.colCount = response.CodeColumns;
                this.isDynamicContainer = response.CodeCode === 'Dynamic Container';
                this.setActiveDisplaySize(response.Pages[0]);
                this.rowSize = response.CodeUIContainerRowSize;
                this.columnSize = response.CodeUIContainerColumnSize;
                this.applyTransition = response.CodeTransition;
                this.calculateHeights(this.activeRowCount);
                this.calculateWidths(this.activeColumnCount);
                this.setWindowSize(this.columnSize);
                this.containerID = response._id;
                if (!this.isSubContainer) {
                    this.parentViewID = this.containerID;
                }
                this.globalPageMappings.setContainerMetaData(response.Pages);
                //this.globalPageMappings.addTypeMappings(this.containerID, response.typeMapping);
                this.containerChildren = this.getParentChildrenMappings(
                    response._id,
                    this.parentViewID,
                    response['Pages']
                );
                this.pagesMap = this.getPagesMap(response['Pages']);
                let viewSelectors = Utils.getRuleFactKeys(this.pagesMap);
                let _viewSelectors = [...new Set(viewSelectors)];
                this.addViewSelectorsToContext(this.containerID, _viewSelectors);
                this.addDesignerViewToContext(this.containerID, this.pagesMap);
                this.mapMetaData();

                // this.subscribeToChildren();
                this.registerViewChangeEvent();
                this.removeSecondaryPage();
            },
            (errorResponse) => {
                this.toastService.showCustomToast('error', errorResponse);
            }
        );
    }
    private addDesignerViewToContext(containerId, views) {
        this.contextService.setDesignerViews(containerId, views);
    }
    private addViewSelectorsToContext(containerId, views) {
        this.contextService.setViewSelectors(containerId, views);
    }
    // private addDataToCache(cacheKey, data, subKey) {
    //     let designerViews = this.cache.getSessionData(cacheKey);
    //     let views;
    //     if (designerViews) {
    //         views = JSON.parse(designerViews);
    //     } else {
    //         views = {};
    //     }
    //     views[subKey] = data;
    //     this.cache.setSessionData(cacheKey, JSON.stringify(views));
    // }
    private getPagesMap(designerPages) {
        let _pages = {};
        if (!Utils.isArrayEmpty(designerPages)) {
            designerPages.forEach((item) => {
                item.forEach((view) => {
                    if (view.page) {
                        _pages[view.CodeElement] = view;
                    }
                });
            });
        }
        return _pages;
    }
    private setActiveDisplaySize(codeDesigner: any) {
        this.activeRowCount = 1;
        this.activeColumnCount = 1;
        if (!this.isDynamicContainer) {
            if (!Utils.isArrayEmpty(codeDesigner)) {
                codeDesigner.forEach((page) => {
                    if (page.row > this.activeRowCount) {
                        this.activeRowCount = page.row;
                    }
                    if (page.column > this.activeColumnCount) {
                        this.activeColumnCount = page.column;
                    }
                });
            }
        }
    }

    private setWindowSize(columnSize) {
        if (columnSize) {
            let sizes = columnSize.split(':');
            if (!this.isSubContainer) {
                if (sizes.length > 1 && Number(sizes[1])) {
                    this.windowSize = Number(sizes[1]);
                }
            }
        }
    }
    private getHeight(row) {
        if (row) {
            let height;
            if ((this.activeRowCount === 1 && this.activeColumnCount === 1) || !this.rowSize) {
                height = 100;
            } else {
                let rows = this.rowSize.split(':');
                if (rows && rows[row - 1]) {
                    height = rows[row - 1];
                } else {
                    height = 100;
                }
            }
            if (this.rowHeights.length >= row) {
                this.rowHeights[row - 1] = height;
            } else {
                this.rowHeights.push(height);
            }
            this.originalRowHeights = Utils.getCopy(this.rowHeights);
        }
    }

    private getWidth(column) {
        if (column) {
            let width;
            if (!this.columnSize) {
                width = 100;
            } else {
                let columns = this.columnSize.split(':');
                if (columns && columns[column - 1]) {
                    width = columns[column - 1];
                } else {
                    width = 100;
                }
            }
            if (this.columnWidths.length >= column) {
                this.columnWidths[column - 1] = width;
            } else {
                this.columnWidths.push(width);
            }
            this.originalColWidths = Utils.getCopy(this.columnWidths);
        }
    }

    private updateWindowWidthToLeft(column) {
        let colWidths = this.columnWidths;
        let prevPageWidth;
        if (this.widthModified) {
            this.widthModified = false;
            colWidths = Utils.getCopy(this.originalColWidths);
        } else {
            this.widthModified = true;
            for (let i = 1; i <= column; i++) {
                if (i === column - 1) {
                    prevPageWidth = colWidths[i - 1];
                    colWidths[i - 1] = 0.4;
                } else if (i === column) {
                    colWidths[i - 1] = Number(colWidths[i - 1]) + Number(prevPageWidth);
                    if (colWidths[i - 1] == 100) {
                        colWidths[i - 1] = 99.6;
                    }
                }
            }
        }
        this.zone.run(() => (this.columnWidths = colWidths));
        this.onViewResize({ sizes: colWidths });
    }

    private updateWindowWidthToRight(column) {
        let colWidths = this.columnWidths;
        if (this.widthModified) {
            this.widthModified = false;
            colWidths = Utils.getCopy(this.originalColWidths);
        } else {
            this.widthModified = true;
            let nextPageWidth;
            for (let i = column; i >= 1; i--) {
                if (i === column) {
                    nextPageWidth = colWidths[i - 1];
                    colWidths[i - 1] = 0.5;
                } else if (i === column - 1) {
                    colWidths[i - 1] = Number(colWidths[i - 1]) + Number(nextPageWidth);
                    if (colWidths[i - 1] == 100) {
                        colWidths[i - 1] = 99.5;
                    }
                }
            }
        }

        this.zone.run(() => (this.columnWidths = colWidths));
        this.onViewResize({ sizes: colWidths });
    }
    private updateWindowHeightToUp(row) {
        let rowHeights = this.rowHeights;
        this.heightModified = true;
        let prevPageHeight;
        for (let i = 1; i <= row; i++) {
            if (i === row - 1) {
                prevPageHeight = rowHeights[i - 1];
                rowHeights[i - 1] = 1.5;
            } else if (i === row) {
                rowHeights[i - 1] = Number(rowHeights[i - 1]) + Number(prevPageHeight);
                if (rowHeights[i - 1] == 100) {
                    rowHeights[i - 1] = 98.5;
                }
            }
        }
        this.zone.run(() => (this.rowHeights = rowHeights));
    }

    private updateWindowHeightToDown(row) {
        let rowHeights = this.rowHeights;
        if (this.heightModified) {
            this.heightModified = false;
            rowHeights = Utils.getCopy(this.originalRowHeights);
        } else {
            let nextPageHeight;
            for (let i = row; i >= 1; i--) {
                if (i === row) {
                    nextPageHeight = rowHeights[i - 1];
                    rowHeights[i - 1] = 1.5;
                } else if (i === row - 1) {
                    rowHeights[i - 1] = Number(rowHeights[i - 1]) + Number(nextPageHeight);
                    if (rowHeights[i - 1] == 100) {
                        rowHeights[i - 1] = 98.5;
                    }
                }
            }
        }
        this.zone.run(() => (this.rowHeights = rowHeights));
    }

    private trackByFn(index, item) {
        return index; // or item.id
    }
    private getParentChildrenMappings(code: string, parentViewID: string, designer: any) {
        let childrenMappings = {};
        designer = designer || [];
        designer.forEach((page) => {
            page.forEach((element) => {
                if (!element.CodeUIContainerDesignerParent) {
                    childrenMappings[code] = childrenMappings[code] ? childrenMappings[code] : [];
                    childrenMappings[code].push(element.CodeElement);
                } else {
                    if (
                        this.isSubContainer &&
                        element.CodeUIContainerDesignerParent === this.parentViewID
                    ) {
                        childrenMappings[code] = childrenMappings[
                            element.CodeUIContainerDesignerParent
                        ]
                            ? childrenMappings[element.CodeUIContainerDesignerParent]
                            : [];
                        childrenMappings[code].push(element.CodeElement);
                    } else {
                        childrenMappings[element.CodeUIContainerDesignerParent] = childrenMappings[
                            element.CodeUIContainerDesignerParent
                        ]
                            ? childrenMappings[element.CodeUIContainerDesignerParent]
                            : [];
                        childrenMappings[element.CodeUIContainerDesignerParent].push(
                            element.CodeElement
                        );
                    }
                }
            });
        });

        return childrenMappings;
    }

    private mapMetaData() {
        this.pageMapper = [];
        this.activePageMapper = [];
        for (let i = 0; i < this.rowCount; i++) {
            this.pageMapper.push(new Array());
        }
        for (let i = 0; i < this.activeRowCount; i++) {
            this.activePageMapper.push(new Array());
        }
        const ref = this;
        this.containerMetaData.forEach((page) => {
            page.forEach((obj) => {
                obj['ContainerCodeCode'] = this.containerCodeCode;
                if (obj.page === 0 && obj.row === 1 && !obj.isSubContainer) {
                    obj.isDefaultContainer = true;
                }
                obj['immediateParentContainerID'] = ref.containerID;
                if (obj.row && obj.column) {
                    if (ref.pageMapper[obj.row - 1][obj.column - 1]) {
                        ref.pageMapper[obj.row - 1][obj.column - 1].push(obj);
                    } else {
                        ref.pageMapper[obj.row - 1][obj.column - 1] = [];
                        ref.pageMapper[obj.row - 1][obj.column - 1].push(obj);
                    }
                }
            });
        });

        for (let row = 0; row < this.activeRowCount; row++) {
            for (let col = 0; col < this.activeColumnCount; col++) {
                let defaultViews = [];
                let contextKey = this.parentContainer || this.containerID;
                let view;
                if (typeof this.dynamicView === 'object') {
                    view = {
                        CodeElement: this.dynamicView['viewId'],
                        CodeType: this.dynamicView['viewType'],
                        CodeDescription: this.dynamicView['viewName'],
                        contextKey: contextKey
                    };
                } else {
                    view = {
                        CodeElement: this.dynamicView,
                        CodeDescription: 'Search',
                        contextKey: contextKey
                    };
                }
                defaultViews.push(view);
                this.activePageMapper[row][col] = this.isDynamicContainer
                    ? defaultViews
                    : this.extractPageZeros(row, col, this.pageMapper);
            }
        }
    }

    private extractPageZeros(row: any, col: any, pageMap: any) {
        let _pageZeros = [];
        for (let i = 0; i < this.activeRowCount; i++) {
            for (let j = 0; j < this.activeColumnCount; j++) {
                let _pageZeroMap = pageMap[i][j];
                if (_pageZeroMap) {
                    _pageZeroMap.forEach((page) => {
                        if (page.row - 1 === row && page.column - 1 === col && page.page === 0) {
                            if (
                                !page.CodeUIContainerDesignerParent &&
                                this.pageContainerData &&
                                this.pageContainerData.CodeUIContainerDesignerParent
                            ) {
                                page.CodeUIContainerDesignerParent = this.pageContainerData.CodeUIContainerDesignerParent;
                            }
                            page.parentContainerId = this.parentContainer;
                            page.contextKey = this.parentContainer || this.containerID;
                            page.parentViewID = this.parentViewID;
                            page.isQuickMenu = this.isQuickMenu;
                            page.containerID = this.containerID;
                            _pageZeros.push(page);
                        }
                    });
                }
            }
        }
        return _pageZeros;
    }

    // private activeRowArray: Array<Number> = [];
    // private activeColumnArray: Array<Number> = [];
    private addRow() {
        this.activeRowCount = this.activeRowCount + 1;
        //  this.activeRowArray = this.convertToArray(this.activeRowCount);
        this.calculateHeights(this.activeRowCount);
    }
    private convertToArray(count) {
        return Array(count)
            .fill(0)
            .map((x, i) => i);
    }
    private removeRow() {
        this.activeRowCount = this.activeRowCount - 1;
        //this.activeRowArray = this.convertToArray(this.activeRowCount);
        this.calculateHeights(this.activeRowCount);
    }
    private addColumn() {
        this.activeColumnCount = this.activeColumnCount + 1;
        //this.activeColumnArray = this.convertToArray(this.activeColumnCount);
        this.calculateWidths(this.activeColumnCount);
    }
    private removeColumn() {
        this.activeColumnCount = this.activeColumnCount - 1;
        //this.activeColumnArray = this.convertToArray(this.activeColumnCount);
        this.calculateWidths(this.activeColumnCount);
    }
    private calculateWidths(columns) {
        let index = 1;
        while (index <= columns) {
            this.getWidth(index);
            index++;
        }
    }
    private calculateHeights(rows) {
        let index = 1;
        while (index <= rows) {
            this.getHeight(index);
            index++;
        }
    }
    private unSubscribeContainerEvents() {
        if (this.viewChangeEvent) {
            Utils.console('viewChangeEvent event destroyed in ' + this.containerCodeCode);
            this.viewChangeEvent.unsubscribe();
        }

        if (this.routeEventSubscriber) {
            Utils.console('routeEventSubscriber event destroyed in ' + this.containerCodeCode);
            this.routeEventSubscriber.unsubscribe();
        }

        if (this.rowChangeEvent) {
            Utils.console('rowChangeEvent event destroyed in ' + this.containerCodeCode);
            this.rowChangeEvent.unsubscribe();
        }
        // if (this.reportGridEvent) {
        //     this.reportGridEvent.unsubscribe();
        // }
        if (this.removePageEvent) {
            Utils.console('removePageEvent event destroyed in ' + this.containerCodeCode);
            this.removePageEvent.unsubscribe();
        }

        this.unSubscribeChildEvents();
    }
    private unSubscribeChildEvents() {
        if (this.childSubscriber) {
            Utils.console('childSubscriber event destroyed in ' + this.containerCodeCode);
            this.childSubscriber.unsubscribe();
        }
        if (this.childCancelSubscriber) {
            Utils.console('childCancelSubscriber event destroyed in ' + this.containerCodeCode);
            this.childCancelSubscriber.unsubscribe();
        }

        if (this.typechangeEvent) {
            Utils.console('typechangeEvent event destroyed in ' + this.containerCodeCode);
            this.typechangeEvent.unsubscribe();
        }
    }
    private onViewResize(event) {
        this.windowSize = event.sizes[1];

        this.zone.run((sizes) => (this.columnWidths = event.sizes));
        Helpers.resizeWindow();
    }

    registerEventsToReportGrid() {
        if (this.reportGridEvent) {
            this.reportGridEvent.unsubscribe();
        }
        this.reportGridEvent = this.broadcaster
            .on<string>('reportsView' + this.containerID)
            .subscribe((data) => {
                if (data) {
                    this.updateWindowWidthToRight(2);
                } else {
                    this.calculateWidths(this.activeColumnCount);
                }
            });
    }
    /**
     * Commenting this code
     */
    // updateHeightsEvent: any;
    // updateHeights() {
    //     this.updateHeightsEvent = this.broadcaster
    //         .on<string>('updateHeight' + this.containerID)
    //         .subscribe((data) => {
    //             if (data['type'] === 'Up') {
    //                 this.updateWindowHeightToUp(data['row']);
    //             } else if (data['type'] === 'Down') {
    //                 this.updateWindowHeightToDown(data['row']);
    //             }
    //         });
    //     //this.updateHeightsEvent.push(heightsEvent);
    // }
    removePageEvent: any;
    removeSecondaryPage() {
        if (this.removePageEvent) {
            this.removePageEvent.unsubscribe();
        }
        this.removePageEvent = this.broadcaster
            .on<string>('removePage' + this.containerID)
            .subscribe((containerId) => {
                if (this.activeRowCount > this.activeColumnCount) {
                    this.removeRow();
                } else if (this.activeRowCount < this.activeColumnCount) {
                    this.removeColumn();
                }
            });
    }
    ngOnDestroy() {
        this.unSubscribeContainerEvents();
    }
}
