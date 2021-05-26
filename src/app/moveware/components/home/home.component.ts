import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
// TODO import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompactType, DisplayGrid, GridsterItem, GridType } from 'angular-gridster2';
import { OAuthService } from 'angular-oauth2-oidc';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { ContextService } from 'src/app/moveware/services/context.service';
import { DashboardService } from 'src/app/moveware/services/dashobard-service';
import { MenuService } from 'src/app/moveware/services/menu.service';
// TODO translation import {TranslateService} from '@ngx-translate/core';
import { ThemesService } from 'src/app/moveware/services/themes-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import Utils from 'src/app/moveware/services/utils';
import { GridsterOptions } from '../form-components/field.interface';
import { CacheService } from 'src/app/moveware/services/cache.service';

@Component({
    selector: 'moveware-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    @ViewChild('RevenueTemplate', { static: true }) RevenueTemplate: TemplateRef<any>;
    @ViewChild('OutstandingTemplate', { static: true }) OutstandingTemplate: TemplateRef<any>;
    @ViewChild('UnloggedTemplate', { static: true }) UnloggedTemplate: TemplateRef<any>;
    @ViewChild('ReviewsTemplate', { static: true }) ReviewsTemplate: TemplateRef<any>;
    @ViewChild('CommissionTemplate', { static: true }) CommissionTemplate: TemplateRef<any>;
    @ViewChild('HoursTemplate', { static: true }) HoursTemplate: TemplateRef<any>;
    @ViewChild('TasksTemplate', { static: true }) TasksTemplate: TemplateRef<any>;
    options: GridsterOptions;
    dashboard: Array<GridsterItem>;
    selectedLang: string;
    public source: any;
    public destination: any;
    routeEventSubscriber: any;
    sidebar: any;
    isLoggedIn;
    sectionHeading = 'Section Heading';
    public welcome: string;
    public data: any;
    public primaryLogo: string;
    menus: any;
    currentPage: any;
    containerID: any;
    viewType: string;
    constructor(
        private oauthService: OAuthService,
        private router: Router,
        private route: ActivatedRoute,
        private contextService: ContextService,
        public themesService: ThemesService,
        private toastService: ToastService,
        private dashboardService: DashboardService,
        private actionService: UIActionService,
        private menuService: MenuService,
        private cacheService: CacheService
    ) {
        this.selectedLang = 'en';
        this.source =
            '[{"name":"item1","id":"1"},{"name":"item3","id":"3"},{"name":"item4","id":"4"},{"name":"item6","id":"6"}]';
        this.destination = '[{"name":"item2","id":"2"},{"name":"item5","id":"5"}]';
        this.welcome = 'Welcome to Moveware';
    }

    static LTR = 'left-to-right';
    static RTL = 'right-to-left';

    static DEFAULT_FORMAT = {
        add: 'Add',
        remove: 'Remove',
        all: 'All',
        none: 'None',
        direction: 'LTR',
        draggable: true,
        locale: undefined
    };

    defaultViewId: string;
    ngOnInit() {
        this.loadApplication();
        this.routeEventSubscriber = this.route.queryParams.subscribe((params) => {
            //this.contextService.clearContext();

            if (params['containerID']) {
                this.defaultViewId = params['viewId'];
                this.containerID = params['containerID'];
                this.viewType = 'container';
            } else if (params['dashboardID']) {
                this.currentPage = {};
                this.currentPage['CodeElement'] = params['dashboardID'];
                this.viewType = 'dashboard';
            }
        });
    }

    todaysTaskGrid: any;
    todaysTaskHeader: any;
    hoursWorked: any;
    private getTodaysTask() {
        let data = this.dashboardService.getTodaysTasks();
        this.todaysTaskGrid = data.data;
        this.todaysTaskHeader = data.header;
    }
    private loadApplication() {
        let navigationItems;
        this.menuService.getMenus().then((menus) => {
            this.menus = this.menuService.getMenusWithActions(menus.MenuItems);
            const navigationUrl = this.router.routerState.snapshot.url;
            if (navigationUrl.indexOf('menu/Home') === -1) {
                return;
            }
            let loginPage = JSON.parse(this.cacheService.getLocalData('user-settings')).filter(
                (setting) => {
                    return setting.CodeCode === StandardCodes.INITIAL_LOGIN_PAGE;
                }
            );
            navigationItems = loginPage[0].CodeValue;
            if (navigationItems) {
                let menuItem = this.getMatchingMenu(this.menus, navigationItems);
                if (menuItem) {
                    this.contextService['CurrentMenu'] = menuItem;
                    let loadAction = Utils.getElementsByProperty(
                        menuItem.CodeActions,
                        'CodeUIAction',
                        StandardCodes.UI_ACTION_CLICK
                    );
                    if (!Utils.isArrayEmpty(loadAction)) {
                        let task = loadAction[0].Task.CodeCode;
                        if (task === StandardCodes.TASK_LOAD_UI_CONTAINER) {
                            this.containerID = loadAction[0].UIContainer;
                            this.viewType = 'container';
                        } else if (task === StandardCodes.TASK_LOAD_DASHBOARD) {
                            this.currentPage = {};
                            this.currentPage['CodeElement'] = loadAction[0].UIContainer;
                            this.viewType = 'dashboard';
                        }
                    }
                }
            }
        });
    }

    private getMatchingMenu(menus: any, menu) {
        let action;
        if (menu && menu.CodeCode) {
            for (let i = 0; i < menus.length; i++) {
                let level1 = menus[i];
                if (level1.CodeCode === menu.CodeCode) {
                    return level1;
                } else if (level1.subMenus) {
                    for (let j = 0; j < level1.subMenus.length; j++) {
                        let level2 = level1.subMenus[j];
                        if (level2.CodeCode === menu.CodeCode) {
                            return level2;
                        } else if (level2.subMenus) {
                            for (let k = 0; k < level2.subMenus.length; k++) {
                                let level3 = level2.subMenus[k];
                                if (level3.CodeCode === menu.CodeCode) {
                                    return level3;
                                }
                            }
                        }
                    }
                }
            }
        }
        return action;
    }

    private getUpdatedTheme() {
        this.themesService.themeUpdateListner.subscribe(
            (data) => {
                this.primaryLogo = 'themes/' + data + '/images/primary_logo.jpg';
            },
            (errorResponse) => {
                this.toastService.showCustomToast('error', errorResponse);
            }
        );
    }
    private getHoursWorkedPerMonth() {
        this.hoursWorked = this.dashboardService.getHoursWorked();
    }
    async logout() {
        this.oauthService.logOut();
    }

    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.toggle();
        }
    }
    privateReviews: any;
    corporateReviews: any;
    partnerReviews: any;
    getPrivateReviews() {
        this.privateReviews = this.dashboardService.getPrivateReviews();
    }
    getPartnerReviews() {
        this.partnerReviews = this.dashboardService.getPatnerReviews();
    }
    getCorporateReviews() {
        this.corporateReviews = this.dashboardService.getCorporateReviews();
    }
    events: any;
    getEvents() {
        this.events = this.dashboardService.getEvents();
    }
    private setDashboardItems() {
        this.dashboard = [
            // { cols: 2, rows: 2, y: 0, x: 0, hasContent: true, template: "RevenueTemplate" },
            // { cols: 2, rows: 2, y: 0, x: 2, hasContent: true, template: "OutstandingTemplate" },
            // { cols: 2, rows: 2, y: 0, x: 4, hasContent: true, template: "UnloggedTemplate" },
            // { cols: 2, rows: 2, y: 2, x: 5, hasContent: true, template: "CommissionTemplate" },
            // { cols: 1, rows: 1, y: 1, x: 0, hasContent: true, template: "HoursTemplate" },
            // { cols: 4, rows: 2, y: 4, x: 5, hasContent: true, template: "ReviewsTemplate" },
            // { cols: 4, rows: 2, y: 3, x: 5, minItemRows: 2, minItemCols: 2, label: 'Min rows & cols = 2', hasContent: true, template: "TasksTemplate" }
            { cols: 6, rows: 3, y: 0, x: 0, hasContent: true, template: 'RevenueTemplate' },
            { cols: 6, rows: 3, y: 0, x: 6, hasContent: true, template: 'OutstandingTemplate' },
            { cols: 6, rows: 3, y: 0, x: 12, hasContent: true, template: 'UnloggedTemplate' },
            { cols: 4, rows: 3, y: 0, x: 18, hasContent: true, template: 'CommissionTemplate' },
            { cols: 19, rows: 2, y: 8, x: 1, hasContent: true, template: 'HoursTemplate' },
            { cols: 10, rows: 5, y: 3, x: 0, hasContent: true, template: 'ReviewsTemplate' },
            {
                cols: 11,
                rows: 5,
                y: 3,
                x: 10,
                label: 'Min rows & cols = 2',
                hasContent: true,
                template: 'TasksTemplate'
            }
        ];
    }
    private setGridsterOptions() {
        this.options = {
            gridType: GridType.ScrollVertical,
            compactType: CompactType.CompactUp,
            margin: 10,
            outerMargin: true,
            outerMarginTop: null,
            outerMarginRight: null,
            outerMarginBottom: null,
            outerMarginLeft: null,
            useTransformPositioning: true,
            mobileBreakpoint: 640,
            minCols: 1,
            maxCols: 100,
            minRows: 1,
            maxRows: 100,
            maxItemCols: 100,
            minItemCols: 1,
            maxItemRows: 100,
            minItemRows: 1,
            maxItemArea: 2500,
            minItemArea: 1,
            defaultItemCols: 1,
            defaultItemRows: 1,
            fixedColWidth: 340,
            fixedRowHeight: 140,
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
                enabled: true
            },
            resizable: {
                enabled: true
            },
            swap: false,
            pushItems: true,
            disablePushOnDrag: false,
            disablePushOnResize: false,
            pushDirections: { north: true, east: true, south: true, west: true },
            pushResizeItems: false,
            displayGrid: DisplayGrid.Always,
            disableWindowResize: false,
            disableWarnings: false,
            scrollToNewItems: false
        };
    }
}
