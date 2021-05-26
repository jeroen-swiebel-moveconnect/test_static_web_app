import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ContextService } from 'src/app/moveware/services/context.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import Utils from 'src/app/moveware/services/utils';
import { AppContainerComponent } from '../app-container/app-container.component';
import { ListView } from '@syncfusion/ej2-angular-lists';
import { StandardCodes } from '../../constants/StandardCodes';
import { Helpers } from 'src/app/moveware/utils/helpers';
import { RuleEngineService } from 'src/app/moveware/services/rule-engine.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-page-renderer',
    templateUrl: './app-page-renderer.component.html',
    styleUrls: ['./app-page-renderer.component.scss']
})
/**
 * <p> To render different pages like data grid, data form, dashboard, kanban , Preview, containers etc. </p>
 */
export class AppPageRendererComponent implements OnInit {
    @Input() currentContainer: any;

    @Input() parentViewID: any;
    @Input() currentRecord: any;
    @Input() currentContainerID: any;
    @Input() windowSize: number;
    @Input() metaData: any;
    @Input() pageContainerData: any;

    @ViewChild(AppContainerComponent) appContainerInstance: AppContainerComponent;

    uiDataCalendarDesignerTypeCode = StandardCodes.CODE_TYPE_DATA_CALENDAR;
    uiDataWorkflow = StandardCodes.DATA_WORKFLOW;
    recordChangeEvent: any;
    hiddenItems = [];
    viewMode = StandardCodes.VIEW_UPDATE_MODE;
    currentPage: any;
    translationContext: any;

    private displayedTabsLength: number;
    pageWidth: string = '100';
    private uiContainerDesignerTypeCode: string = 'UI Container';
    private uiDataGridDesignerTypeCode: string = StandardCodes.DATA_GRID;
    private uiDataFormDesignerTypeCode: string = StandardCodes.CODE_TYPE_DATA_FORM;
    private uiDataListDesignerTypeCode: string = 'Data List';
    private uiDashboardTypeCode: string = 'Dashboard';
    private uiDesignerTypeCode: string = 'Designer';
    private DATATREE: string = 'Data Tree';
    private pageEvent: any;
    private initialWindowSize: Number;
    constructor(
        private broadcaster: Broadcaster,
        private mappingService: PageMappingService,
        private contextService: ContextService,
        private gridService: GridService,
        private ruleEngine: RuleEngineService
    ) {}
    viewsList = [];
    ngOnInit() {
        if (!this.currentRecord) {
            this.currentRecord = {};
        }
        if (this.currentContainer[0]) {
            this.loadViews(this.currentContainer[0]);
        }
        this.initialWindowSize = this.windowSize;

        this.translationContext =
            'UI Container.' +
            this.contextService.getTranslationContextKey(this.currentContainerID) +
            '.';
    }
    async getViewByType(record, views) {
        let viewsByType = [];
        viewsByType = await this.ruleEngine.processSettings(record, views, 'Forms');
        return viewsByType;
    }
    async loadViews(page) {
        //To find out to render summary view type contianer or normal container if views are more then one view its a summary type container
        let containerViews = [];
        let _views = this.currentContainer;
        _views.forEach((view) => {
            if (!view.page && !view.CodeAlias) {
                view.expanded = true;
                containerViews.push(view);
            }
        });

        if (containerViews.length > 1) {
            let typeViews = await this.getViewByType(this.currentRecord, this.currentContainer);
            let defaultViews = {}; // page 0s

            typeViews.forEach((typeView) => {
                if (!typeView.page) {
                    typeView.expanded = true;
                    defaultViews[typeView.CodeElement] = typeView;
                }
            });
            let views = Utils.processAliases(defaultViews);
            this.viewsList = _.values(views);
            Helpers.addClassToViewsContainer(this.currentContainerID);
        } else {
            this.setCurrentPage(page);
        }
    }
    /**
     * <p> To refresh dropdown list of tabs when we select tab from dropdown. </p>
     *
     * @param list : ListView Instance
     */
    refreshList(list: ListView) {
        list.refresh();
    }

    /**
     * <p> EventListener when a record is changed </p>
     */
    recordChangeEventListener() {
        if (
            !this.recordChangeEvent &&
            this.currentPage.containerID &&
            this.currentPage.CodeUIContainerDesignerParent
        ) {
            this.recordChangeEvent = this.broadcaster
                .on<string>(
                    this.currentPage.containerID +
                        this.currentPage.CodeUIContainerDesignerParent +
                        'recordChanged'
                )
                .subscribe((event) => {
                    if (
                        !(
                            this.currentRecord?._id &&
                            event['data'] &&
                            this.currentRecord._id === event['data']._id
                        )
                    ) {
                        this.currentRecord = event['data'];
                        this.currentRecord['parentRecord'] = event['parentRecord'];
                    }
                });
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['currentContainer']) {
            this.currentContainer = changes['currentContainer'].currentValue;
            let pageIndex = 0;
            if (
                changes['currentRecord'] &&
                changes['currentRecord'].currentValue !== changes['currentRecord'].previousValue
            ) {
                if (
                    JSON.stringify(changes['currentContainer'].previousValue) ===
                        JSON.stringify(changes['currentContainer'].currentValue) &&
                    changes['currentContainer'].currentValue[pageIndex]['CodeType'] ==
                        this.uiContainerDesignerTypeCode
                ) {
                    this.appContainerInstance.updateGridValue(this.currentPage.CodeElement);
                } else {
                    if (changes['currentContainer']) {
                        this.setCurrentPage(changes['currentContainer'].currentValue[pageIndex]);
                    }
                }
            } else {
                let notReloadPage = pageIndex === 0;
                if (changes['currentContainer'].currentValue) {
                    this.setCurrentPage(
                        changes['currentContainer'].currentValue[pageIndex],
                        notReloadPage
                    );
                    this.loadViews(changes['currentContainer'].currentValue[pageIndex]);
                }
            }
        }
        if (changes['windowSize']) {
            this.windowSize = changes['windowSize'].currentValue;
            setTimeout(() => {
                this.reSetTabs();
            }, 20);

            this.arrengeColumns(Number(this.initialWindowSize), this.windowSize);
        }
    }

    private getLoadPageIndex(prevPage, currentPage, currentRecord) {
        if (currentRecord && !currentRecord._id) {
            if (!Utils.isArrayEmpty(currentPage) && currentPage[0].CodeType == 'Dashboard') {
                return 1;
            }
        }
        let pageIndex = 0;
        if (currentRecord && prevPage && currentPage) {
            let viewSelector = this.mappingService.getViewSelectors(this.currentPage.containerID);
            if (viewSelector) {
                let _preSelectorObj = this.contextService.getPrevViewSelector();
                let _preSelectedPage = this.contextService.getPreviouslySelectedPage();
                let _curntSelectorObj = this.gridService.getViewSelectorObject(
                    currentRecord,
                    this.currentPage.containerID
                );
                pageIndex = currentPage.findIndex((page) => {
                    return page._id && page._id === _preSelectedPage;
                });
                if (pageIndex > 0 && Utils.isObjectsEqual(_preSelectorObj, _curntSelectorObj)) {
                    return pageIndex;
                } else {
                    return 0;
                }
            }
        }
        return pageIndex;
    }

    /**
     * <p> Selection of tab from dropdown list. </p>
     *
     * @param data : selectPage details.
     * @param list : dropdown ListVIew Instance.
     */
    public tabSelectedFromList(data, list) {
        this.loadSelectedPage(data);
        this.toggleTabToTop(this.getIndex(data));
        this.refreshList(list);
    }

    /**
     * <p> Loads selected Page from given input pageDetails. </p>
     *
     * @param _page : DOM Event when tab is selected.
     */
    private loadSelectedPage(_page: any) {
        const dataChange = this.contextService.isDataChanged();
        if (dataChange) {
            this.handleDataChangeEvent(dataChange, _page);
        } else {
            this.contextService.removeContextByParentContainer(_page.contextKey, _page);
            this.contextService.setPreviouslySelectedPage(_page._id);
            this.setCurrentPage(_page, true);
        }
    }

    /**
     * <p> Event handled if any data changes are detected.</p>
     *
     * @param dataChange : holds datachanged activity.
     * @param _page : page details of current loading page.
     */
    private handleDataChangeEvent(dataChange: any, _page: any) {
        dataChange.subscribe((result) => {
            if (result) {
                this.contextService.removeContextByParentContainer(_page.contextKey, _page);
                this.contextService.setPreviouslySelectedPage(_page._id);
                this.setCurrentPage(_page, true);
                this.contextService.removeDataChangeState();
            } else {
                Utils.styleResetOfTabs(this.currentContainer, this.currentPage);
            }
        });
    }

    /**
     * <p> To set CurrentPage Details. </p>
     *
     * @param _page : detals of page to be loaded.
     * @param notReloadPage : boolean parameter to identify whether to reload page or not.
     */
    private setCurrentPage(_page: any, notReloadPage?: boolean) {
        Helpers.removeClassToViewsContainer(this.currentContainerID);
        if (this.currentPage) {
            this.currentPage = {};
            setTimeout(() => {
                this.setCurrentActivePage(_page);
            });
        } else {
            this.setCurrentActivePage(_page);
        }
    }

    /**
     * <p> Assigns page to currentPage and resets tabs. </p>
     *
     * @param _page : detals of page to be loaded.
     */
    private setCurrentActivePage(_page) {
        this.currentPage = _page;
        if (this.metaData && this.metaData.parentViewId) {
            this.currentPage['parentViewId'] = this.metaData.parentViewId;
        }
        this.currentPage.metaData = this.metaData;
        let record = Utils.getCopy(this.currentRecord);
        //  this.currentRecord = null;
        setTimeout(() => {
            this.reSetTabs();
            this.currentRecord = record;
        }, 20);
        for (const view of this.currentContainer) {
            view.active = false;
        }
        if (this.currentPage) {
            this.currentPage.active = true;
        }
        this.recordChangeEventListener();
        this.loadStartingPageEvent();
    }

    /**
     * <p> On selection of tab from dropdown list ,we toggle selected tab to tab </p>
     *
     * @param index : index of tab to be re-ordered from currentContainer
     */
    private toggleTabToTop(index) {
        let lastVisibleTab = this.displayedTabsLength - 1;
        let activeElems = document.querySelectorAll('.-primary>li:not(.-more) a.active');
        if (activeElems.length) {
            activeElems[0].classList.remove('active');
        }
        this.currentContainer = this.swapArrayElements(
            this.currentContainer,
            index,
            lastVisibleTab
        );
        setTimeout(() => {
            this.reArrengeTabs();
            let primaryTabsList = document.querySelectorAll('.-primary>li:not(.-more) a');
            primaryTabsList[lastVisibleTab].classList.add('active');
        });
    }

    /**
     * <p> Exchange/swap array elements with respect to corresponding from,to indexes. </p>
     *
     * @param array : currentContainer array for swaping.
     * @param fromIndex : fromIndex to swap.
     * @param toIndex : toIndex for swaping.
     */
    private swapArrayElements(array, fromIndex, toIndex) {
        let a = array[fromIndex];
        array[fromIndex] = array[toIndex];
        array[toIndex] = a;
        return array;
    }

    /**
     * <p> To reset tabs on change of width. </p>
     */
    private reSetTabs() {
        const container = document.querySelector('.tabs');
        if (container) {
            const primary = container.querySelector('.-primary');
            container.classList.add('--jsfied');
            this.reArrengeTabs();
        }
    }

    getIndex(data) {
        return this.currentContainer.indexOf(data);
    }

    /**
     * <p> To re-Arrange Tabs positions based on width. </p>
     */
    private reArrengeTabs() {
        const container = document.querySelector('.right-views .tabs');
        const secondary = container.querySelector('.-secondary');
        const secondaryItems = secondary.querySelectorAll('li');
        const primary = container.querySelector('.-primary');
        const moreLi = container.querySelector('.-more');
        const dropdownContainer = document.querySelector('.e-list-template');
        const ulSecondary = dropdownContainer?.querySelector('.e-ul');
        const liSecondaryItems = ulSecondary?.querySelectorAll('.e-list-item');
        let stopWidth = 35;

        const primaryWidth = primary.clientWidth;
        const itemWidh = 100;
        const hideClass = '--hidden';
        const primaryItems = container.querySelectorAll('.-primary > li:not(.-more)');
        this.hiddenItems = [];

        if (primaryWidth) {
            Array.from(primaryItems).forEach((item, i) => {
                if (primaryWidth >= stopWidth + itemWidh) {
                    stopWidth += itemWidh;
                    item.classList.remove(hideClass);
                } else {
                    if (item.querySelector('a').classList.contains('active')) {
                        let lastDisplayedTabIndex = this.displayedTabsLength - 1;
                        this.currentContainer = this.swapArrayElements(
                            this.currentContainer,
                            i,
                            lastDisplayedTabIndex
                        );
                        setTimeout(() => {
                            this.reArrengeTabs();
                        });
                    } else {
                        item.classList.add(hideClass);
                        this.hiddenItems.push(i);
                    }
                }
            });
        }
        if (!this.hiddenItems.length) {
            moreLi.classList.add(hideClass);
            container.classList.remove('--show-secondary');
        } else {
            moreLi.classList.remove(hideClass);
            if (liSecondaryItems) {
                Array.from(liSecondaryItems).forEach((item, i) => {
                    if (!this.hiddenItems.includes(i)) {
                        item.classList.add(hideClass);
                    } else {
                        item.classList.remove(hideClass);
                    }
                });
            }
        }
        this.displayedTabsLength = primaryItems.length - this.hiddenItems.length;
    }
    private broadcasterEvent: any;
    private overlayData: any;
    onPopoverHide() {
        console.log('Hiding popover');
        this.overlayData = null;
    }
    private loadStartingPageEvent(): void {
        if (!this.currentPage.isDefaultContainer && !this.pageEvent) {
            this.pageEvent = this.broadcaster
                .on(this.currentContainerID + 'load_starting_page')
                .subscribe((data) => {
                    if (this.currentPage.CodeCode === StandardCodes.DYNAMIC_FORM) {
                        this.setCurrentPage(this.currentContainer[0]);
                    }
                });
        }
    }
    private arrengeColumns(intialWindowSize, windowSize) {
        //To arrenge summary pages

        if (intialWindowSize - windowSize > 10) {
            Helpers.makeViewsOneColumn(this.currentContainerID);
            this.viewsList.forEach((view, i) => {
                if (view.CodeColumns > 1) {
                    this.viewsList[i].expanded = false;
                }
            });
        } else if (intialWindowSize - windowSize < 10) {
            Helpers.makeViewsMultiColumn(this.currentContainerID);
            this.viewsList.forEach((view, i) => {
                this.viewsList[i].expanded = true;
            });
        }
    }
    ngOnDestroy() {
        if (this.pageEvent) {
            this.pageEvent.unsubscribe();
        }
        if (this.recordChangeEvent) {
            this.recordChangeEvent.unsubscribe();
        }
    }
}
