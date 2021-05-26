import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import Utils from 'src/app/moveware/services/utils';
import { Helpers } from 'src/app/moveware/utils/helpers';
import { EventsListenerService, MenuUpdateService } from 'src/app/moveware/services';
import { MenuItemModel, ContextMenu } from '@syncfusion/ej2-angular-navigations';
import { environment } from '../../../../environments/environment';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';
import { CollectionsService } from 'src/app/moveware/services';

/**
 *
 * <p>This component is used to set properties of main menu of the application</p>
 */
@Component({
    selector: '[mw-left-nav]',
    templateUrl: './app-leftnav.component.html',
    styleUrls: ['./app-leftnav.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})
export class LeftNavComponent implements OnInit, AfterViewInit {
    hasAdminRights: boolean;
    @Output() selectedMenu = new EventEmitter();
    collectionMenus: any[] = [];
    items: MenuItemModel[];
    private lockLeftNav: boolean;
    public menuBarType: string = StandardCodes.MENU_BAR_TYPE_EXPANDED;
    @ViewChild('contextmenu') contextMenu: ContextMenu;
    @ViewChild(MegaMenuComponent) megaMenu: MegaMenuComponent;
    @Input() menuLayout: string; //defaults to vertical;
    activeMenu: any;
    currentMenu: any;
    currentSubMenu: any;
    currentchildSubMenu: any;
    actions: any;
    previousMenu: string = '';
    public menuItems: MenuItemModel[] = [];
    locationURL: string;
    contextMenus: Array<any> = [];
    isContextMenuOpened: boolean;

    constructor(
        private toastService: ToastService,
        public menuUpdateService: MenuUpdateService,
        private menuSerivce: MenuService,
        private gridService: GridService,

        private actionService: UIActionService,
        private contextService: ContextService,
        private titleService: Title,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private collectionService: CollectionsService
    ) {
        menuUpdateService.menuUpdateListener.subscribe((event) => this.reloadMenus(event));
    }

    ngAfterViewInit() {
        // initialize layout: handlers, menu ...
        Helpers.initLayout();
    }

    /**
     *
     * <p> Perform opening context menu related action based on selected menu.
     * @param {Event} event - The event which is fired upon context menu click.
     * @param {*} menu - The object of the selected menu.
     * @param {*} [subMenu] - The optional menu object which is a child of menu in heirarchy.
     * @param {*} [childSubMenu] - The optional menu object which is a sub child of menu in heirarchy.
     */
    openContextmenu(event, menu, subMenu?: any, childSubMenu?: any) {
        this.setLocationURL(event, menu, subMenu, childSubMenu);
        event.preventDefault();
        this.contextMenu.onClose.subscribe(() => {
            this.isContextMenuOpened = false;
        });
        this.contextMenu.open(event.pageY, event.pageX);
    }
    public beforeCollapseMenuBar(data) {
        if (this.isContextMenuOpened) {
            data.cancel = true;
        }
    }

    setLocationURL(event, menu, subMenu?: any, childSubMenu?: any) {
        this.isContextMenuOpened = true;
        let baseURL = environment.UI_ROOT;
        if (!menu && event && event.target) {
            menu = this.menuSerivce.getMenuFromEvent(event.target.innerText, this.items);
        }
        let navigationURL = this.getNavigationURL(menu, subMenu, childSubMenu);
        let viewType = this.menuSerivce.getViewType(menu);
        this.locationURL =
            baseURL +
            '/#/' +
            navigationURL +
            '?' +
            viewType +
            '=' +
            this.activeMenu.UIContainer +
            '&menu=' +
            this.activeMenu.CodeCode;
    }

    /**
     * <p>Event Triggers while selecting menu item.</p>
     * @param $event menu item event with name, item, element, event
     */
    select($event) {
        this.handleContextMenuActions($event);
    }

    /**
     *
     * <p> Angular on initialization life cycle method, here datasource
     * for menu is retreived and formed when the component is loaded initially. </p>
     */
    ngOnInit() {
        this.menuSerivce.getMenus().then(
            (menus) => {
                let menuItems;
                if (menus && menus.MenuItems) {
                    menuItems = menus.MenuItems;
                }
                if (menus && menus.MenuBar) {
                    this.actions = menus.MenuBar.CodeActions;
                    this.menuBarType = menus.MenuBar.MenuBarType.CodeCode;
                    this.setContextMenus(menus.MenuBar.CodeActions);
                }
                this.collectionMenus = this.menuSerivce.getMenusWithActions(menuItems);
                if (this.menuBarType == StandardCodes.MENU_BAR_TYPE_EXPANDED) {
                    this.items = this.menuSerivce.getMenuItems(menuItems);
                }
                if (this.megaMenu) {
                    this.megaMenu.setBadges(menuItems);
                    this.megaMenu.setMenu = menuItems;
                    this.megaMenu.menuLayout = this.menuLayout;
                }
            },
            (errorResponse) => {
                this.toastService.showCustomToast('error', errorResponse);
            }
        );
        // this.eventListenerService.eventUpdateListener.subscribe((event) => {
        //     let _data = event['data'];
        //     if (
        //         _data &&
        //         ((_data.CodeType && _data.CodeType === 'menu') ||
        //             (_data.json && _data.json.CodeType && _data.json.CodeType === 'menu'))
        //     ) {
        //         this.updateMenu(event);
        //     }
        // });
    }

    /**
     *
     *
     * @return {Boolean} status - The result which determines whether menu is in expanded state.
     */
    isLeftNavExpanded() {
        return this.menuSerivce.getLeftMenuStatus();
    }

    /**
     *
     * <p>Performs menu load upon selecting a menu from the menu bar.
     * The nested level of selected menu is determined as well.</p>
     * @param {Event} event - The event object which contains properties of selected menu.
     */
    onMenuItemSelection(event) {
        let parentMenu = null;
        let ancestorMenu = null;
        let currentMenu = event.item.menu;
        if (currentMenu != null && event.item.parentObj.menu != null) {
            parentMenu = event.item.parentObj.menu;
            if (parentMenu != null && event.item.parentObj.parentObj.menu != null) {
                ancestorMenu = event.item.parentObj.parentObj.menu;
            }
        }
        if (currentMenu != null && parentMenu != null && ancestorMenu != null) {
            this.setSelectedMenu(ancestorMenu, parentMenu, currentMenu);
        } else if (currentMenu != null && parentMenu != null && ancestorMenu == null) {
            this.setSelectedMenu(parentMenu, currentMenu);
        } else if (
            currentMenu != null &&
            Utils.isArrayEmpty(currentMenu.items) &&
            Utils.isArrayEmpty(currentMenu.subMenus)
        ) {
            this.setSelectedMenu(currentMenu);
        }
    }

    /**
     * <p> Show/Hide context menu items based on context menu configuration.
     * This is triggered before opening the context menu options. </p>
     */
    filterContextMenu() {
        if (this.activeMenu) {
            let showItems = [];
            let hideItems = [];
            this.contextMenus.forEach((menu) => {
                if (!Utils.isArrayEmpty(menu.show)) {
                    menu.show.forEach((show) => {
                        if (!Utils.isArrayEmpty(this.activeMenu.Parents)) {
                            let found = this.activeMenu.Parents.filter(
                                (parent) => parent.CodeCode === show
                            );
                            if (!Utils.isArrayEmpty(found) && showItems.indexOf(show) < 0) {
                                showItems.push(menu.text);
                            } else if (Utils.isArrayEmpty(found) && hideItems.indexOf(show) < 0) {
                                hideItems.push(menu.text);
                            }
                        } else {
                            hideItems.push(menu.text);
                        }
                    });
                }
                if (!Utils.isArrayEmpty(menu.hide)) {
                    menu.hide.forEach((hide) => {
                        if (!Utils.isArrayEmpty(this.activeMenu.Parents)) {
                            let found = this.activeMenu.Parents.filter(
                                (parent) => parent.CodeCode === hide
                            );
                            if (!Utils.isArrayEmpty(found) && hideItems.indexOf(hide) < 0) {
                                hideItems.push(menu.text);
                            } else if (Utils.isArrayEmpty(found) && showItems.indexOf(hide) < 0) {
                                showItems.push(menu.text);
                            }
                        }
                    });
                }
            });

            if (!Utils.isArrayEmpty(showItems)) {
                this.contextMenu.showItems(showItems);
            }
            if (!Utils.isArrayEmpty(hideItems)) {
                this.contextMenu.hideItems(hideItems);
            }
        }
    }

    /**
     * <p> Generated contextMenus object from MenuBarActions </p>
     *
     * @param {*} MenuBarActions - The object containing context menu actions
     */
    setContextMenus(MenuBarActions: any) {
        this.contextMenus = [];
        if (!Utils.isArrayEmpty(MenuBarActions)) {
            MenuBarActions.forEach((action) => {
                if (action.CodeUIAction === StandardCodes.CONTEXT_MENU) {
                    this.contextMenus.push({
                        value: action.Task.CodeCode,
                        iconCss: action.JSONParameter.Icon,
                        text: action.JSONParameter.CodeDescription
                            ? action.JSONParameter.CodeDescription
                            : action.Task.CodeCode,
                        show: action.JSONParameter.Show,
                        hide: action.JSONParameter.Hide
                    });
                }
            });
        }
    }

    /**
     * <p> Loads view based on click of a context menu.
     * If there are no actions configured on that menu then a toast message is displayed.</p>
     *
     * @param {Event} event - The event object containing the properties of selected context menu
     */
    handleContextMenuActions(event: any) {
        if (this.locationURL) {
            switch (event.item.value) {
                case StandardCodes.TASK_OPEN_LINK_IN_NEW_TAB:
                    Utils.openNewTab(this.locationURL);
                    break;
                case StandardCodes.TASK_OPEN_LINK_IN_NEW_WINDOW:
                    Utils.openNewWindow(this.locationURL);
                    break;
                case StandardCodes.TASK_LOAD_UI_CONTAINER:
                    this.handleLoadContainer(event.item.value);
                    break;
                case StandardCodes.TASK_PIN_TO_FAVOURITES:
                    this.pinToFavourites(this.activeMenu);
                    break;
                case StandardCodes.TASK_UNPIN_FROM_FAVOURITES:
                    this.unpinFromFavourites(this.activeMenu);
                    break;
            }
        } else {
            this.toastService.addWarningMessage(StandardCodes.EVENTS.NO_ACTION_AVAILABLE);
        }
    }

    /**
     * <p>Executes the Load UI Container task of menu</p>
     *
     * @param {Object} data - The object containing Task data of the menu.
     */
    handleLoadContainer(data) {
        if (this.currentchildSubMenu) {
            this.currentchildSubMenu.CodeActions = [
                ...this.currentchildSubMenu.CodeActions,
                ...this.actions
            ];
        } else if (this.currentSubMenu) {
            this.currentSubMenu.CodeActions = [...this.currentSubMenu.CodeActions, ...this.actions];
        } else {
            this.currentMenu.CodeActions = [...this.currentMenu.CodeActions, ...this.actions];
        }
        this.loadMenu(
            this.currentMenu,
            this.currentSubMenu,
            this.currentchildSubMenu,
            StandardCodes.CONTEXT_MENU,
            data
        );
    }

    /**
     * <p> calls API to create a favourite setting against selecte menu </p>
     *
     * @param menu : menu task for which a favourite setting will be created
     */
    private pinToFavourites(menu) {
        let favouriteMenu = this.getFavouriteMenu().subMenus || [];
        favouriteMenu = favouriteMenu.filter((f) => f.CodeCode === menu.CodeCode);

        if (
            menu &&
            menu._id &&
            !menu.SettingId &&
            !menu.subMenus &&
            Utils.isArrayEmpty(favouriteMenu)
        ) {
            this.collectionService.pinToFavourite(menu._id).subscribe(
                (response) => {
                    this.addToFavourites(Utils.getCopy(menu), response);
                    this.toastService.addSuccessMessage(menu.CodeCode + ' added to Favourites');
                },
                (error) => {
                    if (error) {
                        this.toastService.showCustomToast('error', error);
                    } else {
                        this.toastService.addErrorMessage(
                            StandardCodes.EVENTS.CANNOT_PIN_FAVOURITE
                        );
                    }
                }
            );
        } else if (menu.SettingId || !Utils.isArrayEmpty(favouriteMenu)) {
            this.toastService.addErrorMessage(StandardCodes.EVENTS.MENU_ALREADY_EXISTS);
        } else if (menu.subMenus) {
            this.toastService.addErrorMessage(StandardCodes.EVENTS.CANNOT_PIN_PARENT_FAVOURITE);
        } else {
            this.toastService.addErrorMessage(StandardCodes.EVENTS.NO_RECORD_SELECTED);
        }
    }

    /**
     * <p> calls API to delete a favourite setting against selected menu </p>
     *
     * @param menu : menu task for which the favourite setting will be deleted
     */
    private unpinFromFavourites(menu) {
        if (menu && menu._id && menu.SettingId) {
            this.collectionService.unpinFromFavourite(menu._id, menu.SettingId).subscribe(
                (response) => {
                    this.removeFromFavourites(menu);
                    this.toastService.addSuccessMessage(menu.CodeCode + ' removed from Favourites');
                },
                (error) => {
                    if (error) {
                        this.toastService.showCustomToast('error', error);
                    } else {
                        this.toastService.addErrorMessage(
                            StandardCodes.EVENTS.CANNOT_UNPIN_FAVOURITE
                        );
                    }
                }
            );
        } else if (!menu.SettingId) {
            this.toastService.addErrorMessage(StandardCodes.EVENTS.CANNOT_UNPIN_GLOBAL_FAVOURITE);
        } else {
            this.toastService.addErrorMessage(StandardCodes.EVENTS.NO_RECORD_SELECTED);
        }
    }

    /**
     * <p> handles the context menu emitted by the mega-menu </p>
     *
     * @param event : event from mega-menu component
     */
    megaMenuSelectContextMenu(event) {
        this.openContextmenu(
            event['actionType'],
            event['menu'],
            event['subMenu'],
            event['childSubMenu']
        );
    }

    /**
     * <p> handles the menu click emitted by the mega-menu </p>
     *
     * @param event : event from mega-menu component
     */
    megaMenuSelectMenu(event) {
        this.setSelectedMenu(event['menu'], event['subMenu'], event['childSubMenu'], event);
    }

    /**
     * <p> adds a menu to the favourites menu </p>
     *
     * @param menu : the menu to be added to favourites menu
     */
    private addToFavourites(menu, response) {
        let favouriteMenu = this.getFavouriteMenu();

        if (
            favouriteMenu &&
            (!favouriteMenu.subMenus || favouriteMenu.subMenus.indexOf(menu) < 0)
        ) {
            if (response.body) {
                menu['SettingId'] = JSON.parse(response.body).id;
                menu['Parents'] = [favouriteMenu];
            }
            if (!favouriteMenu.subMenus) {
                favouriteMenu['subMenus'] = [menu];
            } else {
                favouriteMenu.subMenus.push(menu);
            }
        }
    }

    private removeFromFavourites(menu) {
        let favouriteMenu = this.getFavouriteMenu();

        if (favouriteMenu && favouriteMenu.subMenus) {
            let index = favouriteMenu.subMenus.indexOf(menu);
            if (index > -1) {
                favouriteMenu.subMenus.splice(index, 1);
            }
        }
    }

    private getFavouriteMenu() {
        let favouriteMenu;
        for (let i = 0; i < this.collectionMenus.length; i++) {
            let level1 = this.collectionMenus[i];
            if (level1.CodeCode === StandardCodes.MENU_ITEM_MY_FAVOURITES) {
                favouriteMenu = level1;
                break;
            } else if (level1.subMenus) {
                for (let j = 0; j < level1.subMenus.length; j++) {
                    let level2 = level1.subMenus[j];
                    if (level2.CodeCode === StandardCodes.MENU_ITEM_MY_FAVOURITES) {
                        favouriteMenu = level2;
                        break;
                    }
                }
            }
        }
        return favouriteMenu;
    }

    /**
     * <p>Updates the menus collection </p>
     *
     * @param {Event} event - The event object containg the menus data and the operation to be performed.
     */
    private updateMenu(event: any) {
        let data = event.data;
        let operation = event.operation;
        if (operation === 'add') {
            this.collectionMenus[data.json.MenuBar].push(data.json);
        } else if (operation === 'edit') {
            if (data.json.MenuBar === 'main') {
                for (let mainMenu of this.collectionMenus) {
                    if (mainMenu.id === data.id) {
                        for (let updated in data.json) {
                            mainMenu[updated] = data.json[updated];
                        }
                    }
                }
            }
        } else if (operation === 'delete') {
            if (data.json.MenuBar === 'main') {
                let menuToBeDeleted = this.collectionMenus.filter((menu) => {
                    return menu.id === data.id;
                });
                let index = this.collectionMenus.indexOf(menuToBeDeleted);
                this.collectionMenus.splice(index, 1);
            }
        }
    }

    /**
     *
     * <p>Sets the sub menus state to false when the context menu is hidden or closed. </p>
     */
    onContextMenuClose() {
        this.collectionMenus.forEach((menu) => {
            menu.showChild = false;
            if (menu.subMenus && menu.subMenus.length) {
                menu.subMenus.forEach((submenu) => {
                    submenu.showChild = false;
                });
            }
        });
    }

    /**
     * <p>Performs action upon selecting a menu from menu bar. It checks for any unsaved data changes in the view,
     * if there are any changes then it doesn't load menu.</p>
     *
     * @param {*} menu - The object of the selected menu.
     * @param {*} [subMenu] - The optional menu object which is a child of menu in heirarchy.
     * @param {*} [childSubMenu] - The optional menu object which is a sub child of menu in heirarchy.
     * @param {*} [event] - The event of the trigger.
     */
    public setSelectedMenu(menu, subMenu?: any, childSubMenu?: any, event?: any) {
        const dataChanged = this.contextService.isDataChanged();
        if (dataChanged) {
            dataChanged.subscribe((result) => {
                if (!result) {
                    this.menuSerivce.handleMenuSelection();
                    return;
                } else {
                    this.contextService.removeDataChangeState();
                    this.loadMenu(menu, subMenu, childSubMenu, null, null, event);
                }
            });
        } else {
            this.loadMenu(menu, subMenu, childSubMenu, null, null, event);
        }
        Helpers.removeDialog();
    }

    /**
     *
     * <p>Sets the data required for loading the view upon menu click.
     * The data such as navigation url, ui action metadata etc.</p>
     * @param {*} menu - The object of the selected menu.
     * @param {*} [subMenu] - The optional menu object which is a child of menu in heirarchy.
     * @param {*} [childSubMenu] - The optional menu object which is a sub child of menu in heirarchy.
     * @param {*} [actionType] - The object which specifies UI Action triggered.
     * @param {*} [Task] - The object containing data of the task to be performed.
     * @param {*} [event] - The event of the menu selection trigger.
     */
    private loadMenu(
        menu,
        subMenu?: any,
        childSubMenu?: any,
        actionType?: any,
        Task?: any,
        event?: any
    ) {
        this.gridService.setIsMenuClick(true);
        let navigationUrl = this.getNavigationURL(menu, subMenu, childSubMenu);
        this.contextService.clearContext();

        let selectedData = this.actionService.getActionDetails(
            this.activeMenu,
            null,
            actionType ? actionType : StandardCodes.UI_ACTION_CLICK,
            Task
        );
        if (event && event.openIn === StandardCodes.TASK_OPEN_LINK_IN_NEW_TAB) {
            selectedData['CodeUILocation'] = StandardCodes.UILOCATION.NEWTAB;
        }
        this.contextService['CurrentMenu'] = this.activeMenu;
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

    /**
     *
     *<p>Returns the navigation url from the menu heirarchy.</p>
     * @param {*} menu - The object of the selected menu.
     * @param {*} subMenu - The menu object which is a child of menu in heirarchy.
     * @param {*} childSubMenu - The menu object which is a sub child of menu in heirarchy.
     * @return {*} navigationUrl
     */
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
            this.currentMenu = menu;
            this.currentSubMenu = subMenu;
            this.currentchildSubMenu = childSubMenu;
        } else if (subMenu) {
            this.titleService.setTitle(menu.CodeDescription + '>' + subMenu.CodeDescription);
            navigationUrl = `${navigationUrl}/${menu.CodeCode}/${subMenu.CodeCode}`;
            this.activeMenu = subMenu;
            this.currentMenu = menu;
            this.currentSubMenu = subMenu;
        } else {
            this.titleService.setTitle(menu.CodeDescription);
            navigationUrl = `${navigationUrl}/${menu.CodeCode}`;
            this.activeMenu = menu;
            this.currentMenu = menu;
        }
        return navigationUrl;
    }

    /**
     *
     *
     * @param {*} [event] - The object containing menu data and operation to be performed on collection.
     */
    private reloadMenus(event?) {
        let menuObj = event.data.json;
        // json will be present in case of edit/add but not delete
        const op = event.operation;
        const OP_ADD = 'add';
        const OP_DEL = 'delete';
        const OP_EDIT = 'edit';
        if (op === OP_ADD && menuObj) {
            // for add
            let newMenuObj = {
                type: menuObj.CodeType,
                name: menuObj.label,
                collection: menuObj.CodeCollection,
                code: menuObj.CodeCode,
                subMenus: []
            };

            if (menuObj.parent) {
                this.collectionMenus.forEach(function (menuItem) {
                    if (menuObj.parent === menuItem.CodeCode) {
                        menuItem.subMenus.push(newMenuObj);
                        return;
                    }
                });
            } else {
                this.collectionMenus.push(newMenuObj);
            }
        } else if (op === OP_EDIT && menuObj) {
            //for edit
            let currentMenu = null;
            if (menuObj.parent) {
                // for nay child menus
                let parentMenu = this.findMenuMatch(menuObj.parent, this.collectionMenus);
                currentMenu = this.findMenuMatch(menuObj.CodeCode, parentMenu);
            } else {
                // top level menus where parent is null
                currentMenu = this.findMenuMatch(menuObj.CodeCode, this.collectionMenus);
            }
            if (currentMenu) {
                let newMenuObj = {
                    type: menuObj.CodeType,
                    name: menuObj.label,
                    collection: menuObj.CodeCollection,
                    code: menuObj.CodeCode,
                    subMenus: currentMenu.subMenus // retain old submenus
                };
            }
        } else if (op === OP_DEL) {
            // for delete
            //parent information is not known durng Delete .
            //therefore can't update the Menu without refresh
        }
    }

    /**
     *
     * <p> Returns a menu upon iterating the menus</p>
     * @param {*} menuToFindCode - The menu object CodeCode to find
     * @param {*} parentMenu - The array of menus
     * @return {*}  {*} - The menu object found from collection
     * @memberof LeftNavComponent
     */
    private findMenuMatch(menuToFindCode: any, parentMenu): any {
        let foundMenu = null;
        for (var i = 0; i < parentMenu.length; i++) {
            let currentMenu = parentMenu[i];
            if (menuToFindCode === currentMenu.CodeCode) {
                foundMenu = currentMenu;
                break;
            }
            return foundMenu;
        }
    }

    /**
     *
     * @return {*} - The length of menus collection.
     */
    public isLeftNavLoading() {
        return this.collectionMenus.length;
    }

    /**
     *
     *
     * @param {string} str1 - The string to be compared.
     * @param {string} str2 - The string to compare.
     * @return {boolean} - The result after comparision.
     * @memberof LeftNavComponent
     */
    private equalIgnoreCase(str1, str2) {
        if (str1 && str2) {
            return Utils.equalIgnoreCase(str1, str2);
        } else {
            return false;
        }
    }

    // private toggleChildMenus(leftmenu) {
    //   this.collectionMenus.forEach((m) => {
    //     if (m._id && m._id === leftmenu._id) {
    //       let leftNavStatus = this.isLeftNavExpanded();
    //       m.showChild = !m.showChild;
    //       if (!leftNavStatus) {
    //         this.lockLeftNav = m.showChild;
    //       } else {
    //         this.lockLeftNav = false;
    //       }
    //     } else {
    //       m.showChild = false;
    //     }
    //   })

    // }
}
