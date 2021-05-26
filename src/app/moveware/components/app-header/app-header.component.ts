import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemesService } from 'src/app/moveware/services/themes-service';
import Utils from 'src/app/moveware/services/utils';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { UserService } from 'src/app/moveware/services/user-service';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { MegaMenuItem } from 'primeng/api';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Title } from '@angular/platform-browser';
import {
    CollectionsService,
    EventsListenerService,
    HeaderListenerService,
    MenuUpdateService
} from 'src/app/moveware/services';
import { MenuItemModel, SidebarComponent } from '@syncfusion/ej2-angular-navigations';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { Helpers } from 'src/app/moveware/utils/helpers';

@Component({
    selector: '[mw-header]',
    templateUrl: './app-header.component.html',
    styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
    @Output() selectedMenu = new EventEmitter();
    @Input() menuLayout;
    leftNavExpanded: boolean;
    isSearchResultItem: boolean = false;
    private menusIdList: Array<string> = [];
    public primaryLogo: any;
    public menuBarType: string = StandardCodes.MENU_BAR_TYPE_EXPANDED;
    items: MenuItemModel[];
    activeMenu: any;
    collectionMenus: any = {
        mainMenus: [],
        quickMenus: []
    };
    quickMenuBar: any = {};

    constructor(
        private oauthService: OAuthService,
        private router: Router,
        public collectionsService: CollectionsService,
        public menuUpdateService: MenuUpdateService,
        public headerListenerService: HeaderListenerService,

        private route: ActivatedRoute,
        public themesService: ThemesService,
        private messageService: ToastService,
        private menuService: MenuService,
        private userService: UserService,
        private cacheService: CacheService,
        private contextService: ContextService,
        private gridService: GridService,
        private actionService: UIActionService,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private titleService: Title
    ) {
        this.leftNavExpanded = this.menuService.getLeftMenuStatus();
    }

    ngOnInit() {
        // this.eventListenerService.eventUpdateListener.subscribe((event) => {
        //     let _data = event['data'];
        //     if (_data && this.collectionMenus.quickMenus.indexOf(_data.id)) {
        //         this.updateMenu(event);
        //     }
        // });
        // this.userService.getUserDetails();
        this.getUpdatedTheme();
        this.displayHideMenu();
        this.loadActiveMenus('Quick');
        this.getQuickText();
        this.getHelpDetails();
    }
    private getQuickText() {
        this.collectionsService.loadCodes(StandardCodes.QUICK_TEXT).subscribe(async (response) => {
            response.forEach((text) => {
                text.label = text.CodeDescription;
            });
            this.cacheService.setSessionData(StandardCodes.QUICK_TEXT, JSON.stringify(response));
        });
    }
    private getUpdatedTheme() {
        this.themesService.themeUpdateListner.subscribe(
            (data) => {
                this.primaryLogo = data;
            },
            (errorResponse) => {
                this.messageService.showCustomToast('error', errorResponse);
            }
        );
    }

    private openContextmenu() {}

    private displayHideMenu() {
        if (this.route.snapshot.queryParamMap.get('isSearchItem')) {
            this.isSearchResultItem = true;
        }
    }

    private loadActiveMenus(menuBar: String) {
        setTimeout(() => {
            this.collectionsService.getActiveMenus(menuBar).subscribe(
                async (responseData) => {
                    this.quickMenuBar = responseData.MenuBar ? responseData.MenuBar : {};
                    this.menuBarType =
                        this.quickMenuBar !== {}
                            ? this.quickMenuBar.MenuBarType.CodeCode
                            : StandardCodes.MENU_BAR_TYPE_STANDARD;
                    if (!Utils.isArrayEmpty(responseData.MenuItems)) {
                        if (this.menuBarType === StandardCodes.MENU_BAR_TYPE_EXPANDED) {
                            this.collectionMenus.quickMenus = responseData.MenuItems;
                        } else {
                            this.collectionMenus.quickMenus = this.menuService.getMenusWithActions(
                                responseData.MenuItems
                            );
                        }
                        this.getMenusIdList();
                        this.menuBarType = this.quickMenuBar.MenuBarType.CodeCode;
                    } else {
                        this.messageService.addErrorMessage(
                            StandardCodes.EVENTS.CONFIGURATION_ERROR,
                            '106 - Configuration Error'
                        );
                        console.error(
                            'At least profile menu should be there in Quick menu to load themes'
                        );
                    }
                },
                (errorResponse) => {
                    this.messageService.showCustomToast('error', errorResponse);
                }
            );
        }, 10);
    }
    public setSelectedMenu(menu, subMenu?: any, childSubMenu?: any) {
        const dataChanged = this.contextService.isDataChanged();
        if (dataChanged) {
            dataChanged.subscribe((result) => {
                if (!result) {
                    this.menuService.handleMenuSelection();
                    return;
                } else {
                    this.contextService.removeDataChangeState();
                    this.loadMenu(menu, subMenu, childSubMenu);
                }
            });
        } else {
            this.loadMenu(menu, subMenu, childSubMenu);
        }
        Helpers.removeDialog();
    }

    private loadMenu(menu, subMenu?: any, childSubMenu?: any, actionType?: any) {
        this.gridService.setIsMenuClick(true);
        let navigationUrl = this.getNavigationURL(menu, subMenu, childSubMenu);
        this.clearContext();
        let selectedData = this.actionService.getActionDetails(
            this.activeMenu,
            null,
            actionType ? actionType : StandardCodes.UI_ACTION_CLICK,
            null
        );
        this.actionService.actionHandler(
            selectedData,
            null,
            actionType ? actionType : StandardCodes.UI_ACTION_CLICK,
            navigationUrl,
            null,
            this.dialog,
            this.dialogConfig
        );
    }

    getNavigationURL(menu, subMenu, childSubMenu) {
        let navigationUrl = 'mw/menu';
        if (childSubMenu) {
            this.titleService.setTitle(
                menu.CodeDescription +
                    '>' +
                    subMenu.CodeDescription +
                    '>' +
                    childSubMenu.CodeDescription
            );
            navigationUrl = `${navigationUrl}/${menu.CodeCode}/${subMenu.CodeCode}/${childSubMenu.CodeCode}`;
            this.activeMenu = childSubMenu;
        } else if (subMenu) {
            this.titleService.setTitle(menu.CodeDescription + '>' + subMenu.CodeDescription);
            navigationUrl = `${navigationUrl}/${menu.CodeCode}/${subMenu.CodeCode}`;
            this.activeMenu = subMenu;
        } else {
            this.titleService.setTitle(menu.CodeDescription);
            navigationUrl = `${navigationUrl}/${menu.CodeCode}`;
            this.activeMenu = menu;
        }
        return navigationUrl;
    }

    private getMenusIdList() {
        if (!Utils.isArrayEmpty(this.collectionMenus.quickMenus))
            for (let menu of this.collectionMenus.quickMenus) {
                this.menusIdList.push(menu['id']);
            }
    }
    private updateMenu(event: any) {
        let data = event.data;
        let operation = event.operation;
        if (operation === 'add') {
            this.collectionMenus[data.payload.MenuBar].push(data.payload);
        } else if (operation === 'edit') {
            for (let quickMenu of this.collectionMenus.quickMenus) {
                if (quickMenu.id === data.id) {
                    for (let updated in data.payload) {
                        quickMenu[updated] = data.payload[updated];
                    }
                }
            }
        } else if (operation === 'delete') {
            let menuToBeDeleted = this.collectionMenus.quickMenus.filter((menu) => {
                return menu.id === data.id;
            });
            let index = this.collectionMenus.quickMenus.indexOf(menuToBeDeleted);
            this.collectionMenus.splice(index, 1);
        }
    }

    private clearContext() {
        this.contextService.clearContext();
    }

    async logout() {
        this.oauthService.logOut();
    }

    private print() {
        window.print();
    }
    public updateLeftNavStatus(status) {
        this.leftNavExpanded = status;
        this.menuService.setLeftMenuStatus(this.leftNavExpanded);
    }

    private equalIgnoreCase(str1, str2) {
        return Utils.equalIgnoreCase(str1, str2);
    }

    private getHelpDetails() {
        let helpMetaData = this.cacheService.getSessionData('HelpMetaData');
        if (!helpMetaData) {
            let viewId = StandardCodesIds.HELP_GRID_ID;
            this.collectionsService.getGridMetaData(viewId).subscribe(async (response) => {
                this.cacheService.setSessionData('HelpMetaData', JSON.stringify(response));
                let helpData = this.cacheService.getSessionData('HelpData');
                if (!helpData) {
                    let userId = this.userService.getUserId();
                    const requestObj = {
                        meta: {
                            viewId: response._id,
                            actionId: StandardCodesIds.ACTION_ID,
                            userId: userId
                        },
                        criteria: {
                            filters: [],
                            isTreeView: true
                        },
                        userId: userId
                    };
                    this.collectionsService
                        .getGridRecords(
                            requestObj,
                            0,
                            response['PaginationItemsPerPage']['CodeDefault']
                        )
                        .subscribe(async (responseData) => {
                            this.cacheService.setSessionData('HelpData', responseData.body);
                        });
                }
            });
        }
    }
}
