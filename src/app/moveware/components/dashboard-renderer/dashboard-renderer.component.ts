import { Component, OnInit, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { CollectionsService } from 'src/app/moveware/services';
import Utils from 'src/app/moveware/services/utils';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { RuleEngineService } from 'src/app/moveware/services/rule-engine.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { Helpers } from 'src/app/moveware/utils/helpers';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';

@Component({
    selector: 'dashboard-renderer',
    templateUrl: './dashboard-renderer.component.html',
    styleUrls: ['./dashboard-renderer.component.scss']
})
export class DashboardRendererComponent implements OnInit {
    @Input() currentRecord: any;
    @Input() parentPage: any;
    @Input() currentPage: any;
    @Input() parentViewID: string;
    @Input() windowSize: any;
    @Input() parentContainer: any;
    dashboardURL: string;
    dashboard = [];
    options: any;
    dashboardRenderer = true;
    constructor(
        public collectionsService: CollectionsService,
        private messages: ToastService,
        private ruleEngine: RuleEngineService,
        private broadcaster: Broadcaster,
        private gridService: GridService,
        private contextService: ContextService
    ) {}

    ngOnInit() {
        this.loadDashboard();
    }
    loadDashboard() {
        this.options = Utils.setGridsterOptions();
        const id = this.currentPage.CodeElement;
        this.renderView(id);
        this.registerRowChange();
    }
    ngOnChanges(changes: SimpleChanges) {
        if (
            changes['currentPage'] &&
            changes['currentPage'].currentValue &&
            changes['currentPage'].previousValue &&
            changes['currentPage'].previousValue !== changes['currentPage'].currentValue
        ) {
            this.currentPage = {};
            this.currentPage = changes['currentPage'].currentValue;
            this.loadDashboard();
        }
    }
    private registerRowChange() {
        if (this.currentPage.containerID && this.currentPage.CodeUIContainerDesignerParent) {
            this.rowChangeEvent = this.broadcaster
                .on<string>(
                    this.currentPage.containerID +
                        this.currentPage.CodeUIContainerDesignerParent +
                        'recordChanged'
                )
                .subscribe((event) => {
                    this.dashboard = [];
                    this.currentRecord = event['data'];
                    var id = this.currentPage.CodeElement;
                    if (!id) {
                        if (event['views']) {
                            id = event['views'][this.currentPage._id]?.CodeElement;
                        }
                    }
                    this.renderView(id);
                });
        }
    }
    rowChangeEvent: any;
    private renderView(id: any) {
        this.collectionsService.getContainer(id).subscribe(
            async (responseData) => {
                this.currentPage = { ...this.currentPage, ...responseData };
                this.dashboard = [];
                let pagesMap = Utils.getPagesMap(responseData.Pages);
                let views = await this.getViewByType(this.currentRecord, pagesMap);
                views = Utils.processAliases(views);
                let index = 0;
                for (let view in views) {
                    if (!views[view].CodeAlias) {
                        views[view]['ContainerCodeCode'] = responseData.CodeCode;
                    }
                    views[view]['isDashboardRenderer'] = true;
                    if (
                        views[view] &&
                        views[view].CodeType === StandardCodes.CODE_TYPE_TASK_BAR &&
                        responseData.TaskBars &&
                        responseData.TaskBars.length
                    ) {
                        views[view]['TaskBars'] = responseData.TaskBars[0];
                    }
                    if (this.currentRecord) {
                        views[view]['parentContainerId'] = this.parentContainer || id;
                        views[view]['contextKey'] = this.parentContainer || id;
                        views[view]['containerID'] = id;
                        views[view]['parentViewID'] = this.parentViewID;
                    }
                    let value = views[view];
                    if (value['CodeVisible']) {
                        value = this.setGridsterItemSize(value, index);
                        this.dashboard.push(value);
                        if (value['CodeAdjustHeight']) {
                            setTimeout(() => {
                                this.adjustHeight(value);
                            }, 1000);
                        }
                    }
                    index++;
                }
            },
            (errorResponse) => {
                this.messages.showCustomToast('error', errorResponse);
            }
        );
    }

    adjustHeight(value) {
        let height = Helpers.getscrollHeight(
            this.currentRecord._id + '_dashbaord',
            value.CodeElement,
            'form-gridster'
        );
        if (height) {
            let viewRows = value.CodeRows;
            let gridsterItems = Helpers.getGridsterItemsCount(
                this.currentRecord._id + '_dashbaord',
                value.CodeElement,
                'form-gridster'
            );
            let noOfRows = Math.ceil(height / (30 + gridsterItems * 2));
            noOfRows = noOfRows - viewRows;
            this.dashboard.forEach((element) => {
                if (element.CodeRow > value.CodeRow) {
                    element.y += noOfRows;
                }
            });
            let index = this.dashboard.indexOf(value);
            this.dashboard.splice(index, 1);
            value.rows += noOfRows;
            let dashboardRender = this.dashboard;
            this.dashboard = [];
            this.dashboard.push(value);
            dashboardRender.forEach((element) => {
                this.dashboard.push(element);
            });
            this.options.api.optionsChanged();
        }
        //$(".form-view-wraper").height("1100px")
    }
    setGridsterItemSize(component, index) {
        if (
            component['CodeColumn'] ||
            component['CodeColumns'] ||
            component['CodeRow'] ||
            component['CodeRows']
        ) {
            component['x'] = component['CodeColumn'];
            component['y'] = component['CodeRow'];
            component['cols'] = component['CodeColumns'] ? component['CodeColumns'] : 1;
            component['rows'] = component['CodeRows'] ? component['CodeRows'] : 3;
        } else {
            component['x'] = 0;
            component['y'] = index * 3;
            component['cols'] = 1;
            component['rows'] = 3;
        }
        return component;
    }
    async getViewByType(record, views) {
        let viewsByType = [];
        let tempRecord = Object.assign({}, record);
        this.gridService.getProcessedObject(tempRecord);
        viewsByType = await this.ruleEngine.processSettings(tempRecord, views, 'Forms');
        return viewsByType;
    }
    ngOnDestroy() {
        if (this.rowChangeEvent) {
            this.rowChangeEvent.unsubscribe();
        }
    }
}
