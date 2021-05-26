import {
    Component,
    OnInit,
    Input,
    Output,
    SimpleChanges,
    EventEmitter,
    ViewChild,
    ElementRef
} from '@angular/core';
import { CollectionsService, RequestHandler } from 'src/app/moveware/services';

import { ContextService } from 'src/app/moveware/services/context.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { environment } from 'src/environments/environment';

declare var require: any;
// let Boost = require('highcharts/modules/boost');
// let noData = require('highcharts/modules/no-data-to-display');
// let More = require('highcharts/highcharts-more');
// let funnel = require('highcharts/modules/funnel');
// let pyramid = require('highcharts/modules/pyramid3d');

// pyramid(Highcharts);
// funnel(Highcharts);
// Boost(Highcharts);
// noData(Highcharts);
// More(Highcharts);
// noData(Highcharts);

@Component({
    selector: 'reports-grid',
    templateUrl: './reports-grid.component.html',
    styleUrls: ['./reports-grid.component.scss']
})
export class ReportingGrid implements OnInit {
    @ViewChild('pivot') pivot: any; // FlexmonsterPivot;
    public pivotReport;
    @Input() cardsData: any;
    @Input() cardHeaders: any;
    @Output() onCardSelect = new EventEmitter<any>();
    @Input() selectedCard: any;
    @Input() isGroupable: any;
    @Output() onCardsSearch = new EventEmitter<any>();
    @Input() columnSearchFilter: any;
    @Input() searchFilters: any;
    @Output() onCardsSort = new EventEmitter<any>();
    @Input() rowGroupKey: string;
    @Input() showColumnFilter: boolean;
    @Input() currentFocusedField: any;
    @Input() currentPage: any;
    @Input() currentView: any;
    @Input() columns: any;
    hightChartData: any;
    type: string = 'line';
    title: any;
    show: boolean = false;

    constructor(
        private collectionsService: CollectionsService,
        private contextService: ContextService,
        public oauthService: OAuthService,
        private cacheService: CacheService
    ) {}

    ngOnInit() {
        //        this.getReports();
    }

    // private getParsedColumns(columns) {
    //     let reportColumns = [];
    //     columns.forEach((element) => {
    //         reportColumns.push({
    //             uniqueName: element.CodeDescription
    //         });
    //     });
    //     return reportColumns;
    // }
    // private getGroupByColumns(columns, groupdByField?: any) {
    //     let reportColumns = [];
    //     columns.forEach((element) => {
    //         let header;
    //         if (groupdByField && groupdByField._id === element._id) {
    //             reportColumns[element.CodeDescription] = {
    //                 type: 'level',
    //                 hierarchy: 'Type',
    //                 level: element.CodeDescription
    //             };
    //         } else {
    //             reportColumns[element.CodeDescription] = {
    //                 type: 'string'
    //             };
    //         }
    //     });

    //     return reportColumns;
    // }
    // private gridData: any;
    // private getReports() {
    //     let selectedLanguage = JSON.parse(this.cacheService.getSessionData('language'));
    //     if (this.currentView && this.currentView.CodeElement) {
    //         this.pivotReport = {
    //             dataSource: {
    //                 type: 'api',
    //                 url: environment.FRAMEWORK_QUERY_CONTEXT + 'objects',
    //                 index: this.currentView._id,
    //                 requestHeaders: {
    //                     'Accept-Language': selectedLanguage['CodeCode'],
    //                     Authorization: `Bearer ${this.oauthService.getAccessToken()}`
    //                 }
    //             },
    //             options: {
    //                 grid: {
    //                     showHeaders: false
    //                 }
    //             }
    //         };
    //     }
    // }

    // onPivotReady(pivot: Flexmonster.Pivot): void {
    //     console.log('[ready] FlexmonsterPivot', this.pivot);
    // }
    //private x = this.sanitized.bypassSecurityTrustHtml(' <div dynamicField  [currentPage]="currentPage"  [currentView]="currentView"  [currentRecord]="currentRecord"></div>').toString();
    // customizeCell(cell: Flexmonster.CellBuilder, data: Flexmonster.CellData): void {
    //     // console.log("[customizeCell] FlexmonsterPivot");
    //     if (data.label == 'Inactive') {
    //         cell.addClass('inactive');
    //     }
    // }
    addrecord() {
        var dataForUpdate = [
            {
                Category: 'Cars',
                Country: 'India',
                RowId: 4
            }
        ];
        //  flexmonster.updateData({data: dataForUpdate});
        this.pivot.flexmonster.updateData({ data: dataForUpdate }, { partial: true });
    }
    public addColumn(columns) {
        // let updatedColumns = this.getParsedColumns(columns);
        // this.pivot.flexmonster.runQuery({
        //     columns: updatedColumns
        // });
    }
    public groupBy(groupdByField) {
        //    let updatedColumns = this.getGroupByColumns(this.columns, groupdByField);
        // this.pivot.flexmonster.runQuery({
        //   columns: updatedColumns,
        //   rows: [
        //     { uniqueName: "CodeType" }
        //   ]
        // })
        //     this.gridData[0] = updatedColumns;
        //     this.pivot.flexmonster.updateData(
        //         {
        //             data: this.gridData
        //         },
        //         { partial: false }
        //     );
    }
    // "Type": {
    //   type: "level", hierarchy: "Geography",
    //   level: "Type"
    // }

    // customizeToolbar(toolbar: Flexmonster.Toolbar): void {
    //     // Get all tabs
    //     var tabs = toolbar.getTabs();
    //     // The reference to the handler method
    //     var repositioner = this.reposition.bind(this);
    //     var newTabHandler = this.showInfo.bind(this);
    //     var submenus = this.getHighChartSubmenus();
    //     tabs[5].handler = () => this.showInfo();
    //     tabs[10].handler = () => {
    //         this.showData(true);
    //         this.pivot.flexmonster.openFieldsList();
    //     };
    //     submenus.forEach((element) => {
    //         element.handler = () => this.exportHandler(element);
    //     });
    //     toolbar.getTabs = function () {
    //         let newTab = {
    //             id: 'fm-tab-newtab',
    //             title: 'HighCharts',
    //             handler: newTabHandler,
    //             icon: toolbar.icons.charts,
    //             android: false,
    //             args: undefined,
    //             ios: false,
    //             mobile: false,
    //             menu: submenus
    //         };
    //         tabs.unshift(newTab);
    //         repositioner(tabs, 0, 8);
    //         tabs.unshift({
    //             id: 'fm-tab-expandcollapsetab',
    //             title: 'Expand',
    //             icon: toolbar.icons.fullscreen,
    //             handler: null,
    //             android: false,
    //             args: undefined,
    //             ios: false,
    //             mobile: false,
    //             // add expand and collapse all data options
    //             menu: [
    //                 {
    //                     id: 'fm-tab-expandtab',
    //                     title: 'Expand',
    //                     handler: expandAllHandler,
    //                     icon: '',
    //                     android: false,
    //                     args: undefined,
    //                     ios: false,
    //                     mobile: false,
    //                     menu: null
    //                 },
    //                 {
    //                     id: 'fm-tab-collapsetab',
    //                     title: 'Collapse',
    //                     handler: collapseAllHandler,
    //                     icon: '',
    //                     android: false,
    //                     args: undefined,
    //                     ios: false,
    //                     mobile: false,
    //                     menu: null
    //                 }
    //             ]
    //         });
    //         repositioner(tabs, 0, 9);
    //         return tabs;
    //     };

    //     var expandAllHandler = () => {
    //         this.pivot.flexmonster.expandAllData();
    //     };

    //     var collapseAllHandler = () => {
    //         this.pivot.flexmonster.collapseAllData();
    //     };
    // }

    getHighChartSubmenus() {
        let highChartsSubmenus = [
            {
                title: 'Area',
                id: 'fm-tab-charts-area',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Area Range',
                id: 'fm-tab-charts-arearange',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Area Spline',
                id: 'fm-tab-charts-areaspline',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Area Spline Range',
                id: 'fm-tab-charts-areasplinerange',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Bar',
                id: 'fm-tab-charts-bar',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Bubble',
                id: 'fm-tab-charts-bubble',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Column',
                id: 'fm-tab-charts-column',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Column Range',
                id: 'fm-tab-charts-columnrange',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Error Bar',
                id: 'fm-tab-charts-errorbar',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Funnel',
                id: 'fm-tab-charts-funnel',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Line',
                id: 'fm-tab-charts-line',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Pie',
                id: 'fm-tab-charts-pie',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Polygon',
                id: 'fm-tab-charts-polygon',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Pyramid',
                id: 'fm-tab-charts-pyramid',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Scatter',
                id: 'fm-tab-charts-scatter',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Spline',
                id: 'fm-tab-charts-spline',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            },
            {
                title: 'Waterfall',
                id: 'fm-tab-charts-waterfall',
                handler: function () {},
                icon: '',
                android: false,
                args: undefined,
                ios: false,
                mobile: false,
                menu: undefined
            }
        ];

        return highChartsSubmenus;
    }

    // exportHandler(element) {
    //     let title = element.title.replace(/ +/g, '');
    //     this.type = title.toLocaleLowerCase();
    //     this.title = element.title;
    //     this.onReportComplete();
    //     this.showData(false);
    // }

    // reposition(arr, old_index, new_index) {
    //     if (new_index >= arr.length) {
    //         var k = new_index - arr.length + 1;
    //         while (k--) {
    //             arr.push(undefined);
    //         }
    //     }
    //     arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    //     return arr;
    // }

    // showInfo(): void {
    //     this.showData(true);
    // }

    // onReportComplete(): void {
    //     this.pivot.flexmonster.off('reportcomplete');
    //     this.pivot.flexmonster.highcharts.getData(
    //         { type: this.type },
    //         this.createAndUpdateChart.bind(this),
    //         this.createAndUpdateChart.bind(this)
    //     );
    // }

    // createAndUpdateChart(data, rawData) {
    //     data.title.text = this.title + ' Chart';
    //     // Highcharts.chart('highcharts-container', data);
    //     $('#highcharts-container').css('display', 'none');
    // }

    // showData(flag) {
    //     if (flag) {
    //         $('#fm-pivot-view').css('display', 'block');
    //         $('.section_height fm-pivot > div:first-child').css('height', '100%');
    //         this.pivot.flexmonster.showGrid();
    //     } else {
    //         $('#fm-pivot-view').css('display', 'none');
    //         $('#highcharts-container').css('display', 'block');
    //         $('.section_height fm-pivot > div:first-child').css('height', 'auto');
    //     }
    // }
}
