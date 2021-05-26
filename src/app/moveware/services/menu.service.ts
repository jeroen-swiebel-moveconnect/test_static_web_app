import { CollectionsService } from './collections.service';
import { Router } from '@angular/router';
import { HeaderListenerService } from './header-listener.service';
import { Injectable } from '@angular/core';

export const UILOCATION = {
    NEWTAB: 'New Tab',
    MAIN: 'Main',
    DIALOG_CENTER: 'Dialog Center',
    DIALOG_LEFT: 'Dialog Left',
    DIALOG_RIGHT: 'Dialog Right',
    NEW_WINDOW: 'New Window'
};
import { StandardCodes } from '../constants/StandardCodes';
import { ContextService } from './context.service';
import Utils from './utils';
import { MenuItem, MegaMenuItem } from 'primeng/api';
import { DialogConfigurationService } from './dialog-configuration.service';
import { CacheService } from './cache.service';
import { UILocationModalContentComponent } from '../components/modals/ui-location-modal/ui-location-modal.component';
import { Broadcaster } from './broadcaster';
import { MenuItemModel } from '@syncfusion/ej2-angular-navigations';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    queryParam: any;
    viewType: string;

    setOverlayLoadedContainers(isLoadedFromLookUp, response) {
        if (isLoadedFromLookUp) {
            if (this.contextService.OverlayContainerIDs.indexOf(response._id) < 0) {
                this.contextService.OverlayContainerIDs.push(response._id);
            }
            if (response.CodeDesigner) {
                response.CodeDesigner.forEach((element) => {
                    if (
                        element.CodeType === StandardCodes.CODE_TYPE_UI_CONTAINER &&
                        this.contextService.OverlayContainerIDs.indexOf(element.CodeElement) < 0
                    ) {
                        this.contextService.OverlayContainerIDs.push(
                            element.CodeElement + element._id
                        );
                    }
                });
            }
        } else if (
            this.contextService.OverlayContainerIDs.length &&
            this.contextService.OverlayContainerIDs.indexOf(response._id) > -1 &&
            response.CodeDesigner
        ) {
            response.CodeDesigner.forEach((element) => {
                if (
                    element.CodeType === StandardCodes.CODE_TYPE_UI_CONTAINER &&
                    this.contextService.OverlayContainerIDs.indexOf(element.CodeElement) < 0
                ) {
                    this.contextService.OverlayContainerIDs.push(element.CodeElement + element._id);
                }
            });
        }
    }
    private mainMenus: any;
    private isLeftMenuExpanded: boolean = false;
    activeMenuIds: any = [];

    constructor(
        private collectionsService: CollectionsService,
        private router: Router,
        private contextService: ContextService,
        private headerListenerService: HeaderListenerService,
        private broadcaster: Broadcaster,
        private dialogConfigService: DialogConfigurationService,
        private cacheService: CacheService
    ) {
        this.getMenus();
    }
    public loadMenus() {
        return this.collectionsService.getActiveMenus('Main');
    }

    public getMenusWithActions(menus) {
        for (let menu of menus) {
            if (!Utils.isArrayEmpty(menu.subMenus)) {
                menu.subMenus = Utils.getCopy(this.getMenusWithActions(menu.subMenus));
            } else {
                menu['allActions'] = Utils.getArrayOfProperties(menu.CodeActions, 'CodeUIAction');
                menu.isClick = Utils.arrayHasProperty(
                    menu.allActions,
                    StandardCodes.UI_ACTION_CLICK
                );
                menu.actions = Utils.removeElement(menu.allActions, StandardCodes.UI_ACTION_CLICK);
            }
        }
        return menus;
    }

    public getSubMenu(parentMenu, menus) {
        let menuItems: MenuItemModel[] = [];

        for (let menu of menus) {
            let item: MenuItemModel = {};

            if (!Utils.isArrayEmpty(menu.subMenus)) {
                item['items'] = this.getSubMenu(parentMenu, menu.subMenus);
            }
            if (menu.MenuType != 'Icon') {
                item['text'] = menu.CodeDescription.en
                    ? menu.CodeDescription.en
                    : menu.CodeDescription;
            }
            if (menu.MenuType != 'Text') {
                item['iconCss'] = menu.CodeIcon.class ? menu.CodeIcon.class : '';
            }
            item['menu'] = menu;

            menuItems.push(item);
        }
        return menuItems;
    }

    public getMenuItems(menus) {
        let menuItems: { [key: string]: Object }[] = [];
        for (let menu of menus) {
            let item: { [key: string]: Object } = {};

            if (!Utils.isArrayEmpty(menu.subMenus)) {
                item['items'] = this.getSubMenu(menu, menu.subMenus);
            }
            if (menu.MenuType != 'Icon') {
                item['text'] = menu.CodeDescription.en
                    ? menu.CodeDescription.en
                    : menu.CodeDescription;
            }
            if (menu.MenuType != 'Text') {
                item['iconCss'] = menu.CodeIcon.class ? menu.CodeIcon.class : '';
            }
            item['menu'] = menu;
            menuItems.push(item);
        }

        return menuItems;
    }

    public setMegaMenuCommand(setMenu, menus, parent?, ancester?) {
        menus.forEach((menu) => {
            if (!Utils.isArrayEmpty(menu.items)) {
                if (menu.level === 0) {
                    menu['styleClass'] = 'parent-menu-item ' + menu['label'];
                }
                menu = Utils.getCopy(
                    this.setMegaMenuCommand(setMenu, menu.items, menu.menu, parent)
                );
            } else if (!Utils.isArrayEmpty(menu) && !menu.label) {
                menu = Utils.getCopy(this.setMegaMenuCommand(setMenu, menu, parent, ancester));
            } else {
                menu['command'] = (event) => {
                    if (event.item.menu) {
                        if (!ancester && !parent) {
                            setMenu(event.item.menu, null, null);
                        } else {
                            if (ancester) {
                                setMenu(ancester, parent, event.item.menu);
                            } else {
                                setMenu(null, parent, event.item.menu);
                            }
                        }
                    } else {
                        setMenu(event);
                    }
                };
            }
        });
        return menus;
    }

    public handleMenuSelection() {
        const activeMenuList = document.querySelectorAll('.side-menu li.active');
        if (activeMenuList.length) {
            activeMenuList[0].classList.remove('active');
        }
        const currentRouteUrl = this.router.routerState.snapshot.url;
        let CodeCode = currentRouteUrl.substring(
            currentRouteUrl.lastIndexOf('/') + 1,
            currentRouteUrl.indexOf('?')
        );
        if (CodeCode.includes('%20')) {
            CodeCode = CodeCode.replace('%20', ' ');
        }
        let activeElement = document.querySelector('[CodeCode="' + CodeCode + '"]');
        if (activeElement) {
            activeElement.classList.add('active');
        }
    }

    public getMenus() {
        if (!this.mainMenus) {
            this.mainMenus = this.collectionsService.getActiveMenus('Main').toPromise();
            return this.mainMenus;
        } else {
            return this.mainMenus;
        }
    }

    public getMenuFromEvent(desc, items) {
        let selectedMenu: MenuItem[];
        if (desc !== '' && !Utils.isArrayEmpty(items)) {
            for (let menu of items) {
                if (menu.length) {
                    selectedMenu = this.getMenuFromEvent(desc, menu);
                } else if (
                    (menu.text && menu.text === desc) ||
                    (menu.iconCss && menu.iconCss === desc)
                ) {
                    selectedMenu = menu.menu;
                } else if (!Utils.isArrayEmpty(menu.items)) {
                    selectedMenu = this.getMenuFromEvent(desc, menu.items);
                }

                if (selectedMenu) {
                    return selectedMenu;
                }
            }
        }
        return selectedMenu;
    }
    public getRouteMenu(mainMenus, activeMenu) {
        let _menuForCollection = '';
        if (mainMenus) {
            mainMenus.forEach((l1) => {
                if (l1.CodeCode === activeMenu) {
                    _menuForCollection = l1;
                } else if (l1.subMenus) {
                    l1.subMenus.forEach((l2) => {
                        if (l2.CodeCode === activeMenu) {
                            _menuForCollection = l2;
                        } else if (l2.subMenus) {
                            l2.subMenus.forEach((l3) => {
                                if (l3.CodeCode === l1) {
                                    _menuForCollection = l3;
                                }
                            });
                        }
                    });
                }
            });
        }
        return _menuForCollection;
    }

    public getRouteMenuCode(params) {
        let routeMenu = params['subSubmenu'];
        if (!routeMenu) {
            routeMenu = params['subMenu'];
        } else if (!routeMenu) {
            routeMenu = params['subMenu'];
        }
        return routeMenu;
    }
    public setLeftMenuStatus(status) {
        this.isLeftMenuExpanded = status;
    }
    public getLeftMenuStatus() {
        return this.isLeftMenuExpanded;
    }
    private getNavigationUrl(navigationUrl, activeMenu) {
        if (!navigationUrl) {
            navigationUrl = 'mw/menu';
            navigationUrl = `${navigationUrl}/${activeMenu.CodeCode}`;
        }
        return navigationUrl;
    }
    public loadContainer(
        activeMenu,
        navigationUrl,
        actionType,
        event?: any,
        dialog?: any,
        dialogConfig?: any
    ) {
        switch (activeMenu.CodeUILocation) {
            case StandardCodes.UILOCATION.NEWTAB:
                navigationUrl = this.getNavigationUrl(navigationUrl, activeMenu);
                this.loadMenuInNewTab(actionType, navigationUrl, activeMenu);
                break;
            case StandardCodes.UILOCATION.DIALOG_CENTER:
                this.loadMenuInDialog(actionType, activeMenu, 'center', dialog, dialogConfig);
                break;
            case StandardCodes.UILOCATION.DIALOG_LEFT:
                this.loadMenuInDialog(actionType, activeMenu, 'left', dialog, dialogConfig);
                break;
            case StandardCodes.UILOCATION.DIALOG_RIGHT:
                this.loadMenuInDialog(actionType, activeMenu, 'right', dialog, dialogConfig);
                break;
            case StandardCodes.UILOCATION.WINDOW_RIGHT:
                this.loadMenuInDialog(
                    actionType,
                    activeMenu,
                    StandardCodes.UILOCATION.WINDOW_RIGHT,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.WINDOW_LEFT:
                this.loadMenuInDialog(
                    actionType,
                    activeMenu,
                    StandardCodes.UILOCATION.WINDOW_LEFT,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.WINDOW_BOTTOM:
                this.loadMenuInDialog(
                    actionType,
                    activeMenu,
                    StandardCodes.UILOCATION.WINDOW_BOTTOM,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.WINDOW_TOP:
                this.loadMenuInDialog(
                    actionType,
                    activeMenu,
                    StandardCodes.UILOCATION.WINDOW_TOP,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.WINDOW_CENTER:
                this.loadMenuInDialog(
                    actionType,
                    activeMenu,
                    StandardCodes.UILOCATION.WINDOW_CENTER,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.MAIN:
                navigationUrl = this.getNavigationUrl(navigationUrl, activeMenu);
                this.loadMenuInMain(actionType, activeMenu, navigationUrl);
                break;
            case StandardCodes.UILOCATION.NEW_WINDOW:
                navigationUrl = this.getNavigationUrl(navigationUrl, activeMenu);
                this.loadMenuInNewWindow(actionType, navigationUrl, activeMenu);
                break;
            case StandardCodes.UILOCATION.PANEL_RIGHT:
                this.loadPanelOverlay(
                    activeMenu,
                    'panel-right',
                    event,
                    actionType,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.PANEL_LEFT:
                this.loadPanelOverlay(
                    activeMenu,
                    'panel-left',
                    event,
                    actionType,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.PANEL_TOP:
                this.loadPanelOverlay(
                    activeMenu,
                    'panel-top',
                    event,
                    actionType,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.PANEL_BOTTOM:
                this.loadPanelOverlay(
                    activeMenu,
                    'panel-bottom',
                    event,
                    actionType,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.POPUP_LEFT:
                this.loadPanelOverlay(
                    activeMenu,
                    'popup-left',
                    event,
                    actionType,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.UILOCATION.POPUP_RIGHT:
                this.loadPanelOverlay(
                    activeMenu,
                    'popup-right',
                    event,
                    actionType,
                    dialog,
                    dialogConfig
                );
                break;
            default:
                navigationUrl = this.getNavigationUrl(navigationUrl, activeMenu);
                this.loadMenuInMain(actionType, activeMenu, navigationUrl);
        }
    }

    private loadMenuInMain(actionType, activeMenu, navigationUrl) {
        // if (activeMenu.defaultView) {
        //   this.cacheService.setSessionData(activeMenu.UIContainer, activeMenu.defaultView);
        // }
        this.viewType = this.getViewType(activeMenu);
        this.queryParam = {
            queryParams: { [this.viewType]: activeMenu.UIContainer, viewId: activeMenu.defaultView }
        };
        this.router.navigate([navigationUrl], this.queryParam);
        // this.headerListenerService.onHeaderMenuUpdate(activeMenu);
    }

    getViewType(activeMenu) {
        if (activeMenu && activeMenu.CodeActions) {
            let loadAction = Utils.getElementsByProperty(
                activeMenu.CodeActions,
                'CodeUIAction',
                StandardCodes.UI_ACTION_CLICK
            );
            if (!Utils.isArrayEmpty(loadAction)) {
                let task = loadAction[0].Task.CodeCode;
                if (task === StandardCodes.TASK_LOAD_UI_CONTAINER) {
                    return 'containerID';
                } else if (task === StandardCodes.TASK_LOAD_DASHBOARD) {
                    return 'dashboardID';
                }
            }
        }
        return 'containerID';
    }

    private loadMenuInNewTab(actionType, navigationUrl, activeMenu) {
        if (activeMenu.defaultView) {
            this.cacheService.setSessionData(activeMenu.UIContainer, activeMenu.defaultView);
        }
        this.viewType = this.getViewType(activeMenu);
        window.open(`#/${navigationUrl}?${this.viewType}=${activeMenu.UIContainer}`);
    }
    private loadMenuInNewWindow(actionType, navigationUrl, activeMenu) {
        if (activeMenu.defaultView) {
            this.cacheService.setSessionData(activeMenu.UIContainer, activeMenu.defaultView);
        }
        this.viewType = this.getViewType(activeMenu);
        window.open(
            `#/${navigationUrl}?${this.viewType}=${activeMenu.UIContainer}`,
            '_blank',
            'toolbar=yes,scrollbars=yes,resizable=yes,width=900,height=900'
        );
    }

    private loadMenuInDialog(actionType, activeMenu, location, dialog, dialogConfig) {
        if (!activeMenu.IsParentContext) {
            // parentContainer
            this.contextService.setContextRecord(activeMenu.parentContainerId, null);
        }
        const dialogRef = dialog.open(
            UILocationModalContentComponent,
            this.dialogConfigService.getDialogConfiguration(
                { menu: activeMenu, position: location, actionType: actionType },
                dialogConfig
            )
        );
        dialogRef.onClose.subscribe((result) => {
            if (this.activeMenuIds.indexOf(activeMenu._id) > -1) {
                activeMenu.isMenuSelected = false;
                this.activeMenuIds.splice(this.activeMenuIds.indexOf(activeMenu._id), 1);
            }
            console.log(result);
        });
        // const dialogRef = dialogObj.openDialog({ menu: activeMenu, position: location, actionType : actionType});
        //dialogRef.close().subscribe(result => {

        //});
    }
    // private rootViewContainer: any
    // setRootViewContainerRef(viewContainerRef) {
    //   this.rootViewContainer = viewContainerRef
    // }
    private loadPanelOverlay(activeMenu, location, event, actionType, dialog, dialogConfig) {
        let appContainerElement = $('#app-container');
        let mwContainerElement: any = $('.mw-container');
        let isHorizontalMenu: any = $('nav').hasClass('activatehorizontalmenu');
        if (activeMenu.UIContainer === mwContainerElement.attr('containerId')) {
            return;
        }
        let data = {
            menu: activeMenu,
            event: event,
            position: location,
            actionType: actionType
        };
        if (!activeMenu.IsParentContext) {
            // parentContainer
            this.contextService.setContextRecord(
                activeMenu.parentContainerId +
                    this.contextService.getRootViewMap(activeMenu.parentContainerId),
                null
            );
        }

        this.broadcaster.broadcast('closeLookup', activeMenu);
        this.updateCurrentViewOnPanelOpen(
            activeMenu,
            appContainerElement,
            mwContainerElement,
            isHorizontalMenu
        );
        mwContainerElement.attr('containerId', activeMenu.UIContainer);
        const dialogRef = dialog.open(
            UILocationModalContentComponent,
            this.dialogConfigService.getDialogConfiguration(data, dialogConfig)
        );
        dialogRef.onClose.subscribe((result) => {
            if (this.activeMenuIds.indexOf(activeMenu._id) > -1) {
                activeMenu.isMenuSelected = false;
                this.activeMenuIds.splice(this.activeMenuIds.indexOf(activeMenu._id), 1);
            }
            console.log(result);
        });
    }
    updateCurrentViewOnPanelOpen(
        activeMenu,
        appContainerElement,
        mwContainerElement,
        isHorizontalMenu
    ) {
        let height = '';
        let width = '';
        let calcWidth;
        let calcHeight;
        let popupHeight;
        const dialogSize = activeMenu.CodeSize;
        if (dialogSize) {
            const dialogSizeValues = dialogSize.split(':');
            if (dialogSizeValues.length === 2) {
                height = dialogSizeValues[0] + 'vh';
                width = dialogSizeValues[1] + '%';
            }
        }
        switch (activeMenu.CodeUILocation) {
            case StandardCodes.UILOCATION.PANEL_RIGHT:
                calcWidth = width !== '' ? width : '40%';
                appContainerElement.css('margin-right', calcWidth);
                break;
            case StandardCodes.UILOCATION.PANEL_LEFT:
                calcWidth = width !== '' ? width : '40%';
                if (isHorizontalMenu) {
                    appContainerElement.css('margin-left', calcWidth);
                } else {
                    mwContainerElement.css('margin-left', calcWidth);
                }
                break;
            case StandardCodes.UILOCATION.PANEL_TOP:
                calcHeight = height !== '' ? height : '30vh';
                if (isHorizontalMenu) {
                    popupHeight =
                        'calc(100vh - (' +
                        calcHeight +
                        ' + ' +
                        (this.dialogConfigService.breadcrumHeight +
                            this.dialogConfigService.headerHeight +
                            this.dialogConfigService.horizontalMenuHeight) +
                        'px))';
                } else {
                    popupHeight =
                        'calc(100vh - (' +
                        calcHeight +
                        ' + ' +
                        (this.dialogConfigService.breadcrumHeight +
                            this.dialogConfigService.headerHeight +
                            this.dialogConfigService.paginationHeight) +
                        'px))';
                }
                appContainerElement.css({
                    'margin-top':
                        'calc(' +
                        calcHeight +
                        ' + ' +
                        this.dialogConfigService.breadcrumHeight +
                        'px)',
                    height: popupHeight
                });
                break;
            case StandardCodes.UILOCATION.PANEL_BOTTOM:
                calcHeight = height !== '' ? height : '30vh';
                if (isHorizontalMenu) {
                    popupHeight =
                        'calc(100vh - (' +
                        calcHeight +
                        ' + ' +
                        (this.dialogConfigService.breadcrumHeight +
                            this.dialogConfigService.headerHeight +
                            this.dialogConfigService.horizontalMenuHeight) +
                        'px))';
                } else {
                    popupHeight =
                        'calc(100vh - (' +
                        calcHeight +
                        ' + ' +
                        (this.dialogConfigService.breadcrumHeight +
                            this.dialogConfigService.headerHeight) +
                        'px))';
                    appContainerElement.css({
                        'margin-bottom': calcHeight,
                        height: popupHeight
                    });
                    break;
                }
        }
    }
}
