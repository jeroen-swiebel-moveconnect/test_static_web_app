import { Component, Input, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import Utils from 'src/app/moveware/services/utils';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { MenuItemModel, ContextMenu } from '@syncfusion/ej2-angular-navigations';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';
@Component({
    selector: 'quick-view-loader',
    templateUrl: './quick-view-loader.component.html',
    styleUrls: ['./quick-view-loader.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})

/**
 * <p> Quick View Loader loads quick menus and handles contextmenu actions on quick menus</p>
 */
export class QuickViewLoaderComponent {
    @Input() menu: Object;
    @Input() menuBar: Object;
    @ViewChild('quickmenucontextmenu') contextMenu: ContextMenu;
    @ViewChild(MegaMenuComponent) megaMenu: MegaMenuComponent;
    contextMenus: MenuItemModel[] = [];
    quickMenus: MenuItemModel[];
    DISPLAY_ICON: string = StandardCodes.DISPLAY_ICON;
    DISPLAY_TEXT: string = StandardCodes.DISPLAY_TEXT;
    DISPLAY_ICONANDTEXT: string = StandardCodes.DISPLAY_ICONANDTEXT;
    MENU_BAR_TYPE_EXPANDED: string = StandardCodes.MENU_BAR_TYPE_EXPANDED;
    containerID: string;
    activeMenu: Object;
    menuBarType: string = StandardCodes.MENU_BAR_TYPE_EXPANDED;

    constructor(
        private menuService: MenuService,
        private broadcaster: Broadcaster,
        private actionService: UIActionService,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig
    ) {}

    ngOnInit() {
        this.quickMenus = this.menuService.getMenuItems(this.menu);
        this.setContextMenus();
        this.menuBarType = this.menuBar['MenuBarType']['CodeCode'];

        setTimeout(() => {
            if (this.megaMenu) {
                this.megaMenu.setBadges(this.menu);
                this.megaMenu.setMenu = this.menu;
                this.megaMenu.menuLayout = StandardCodes.MENU_LAYOUT_HORIZONTAL;
                console.log(this.menu);
            }
        });
    }

    /**
     * <p> set context menus </p>
     */
    setContextMenus() {
        this.contextMenus = [];
        if (!Utils.isArrayEmpty(this.menuBar['CodeActions'])) {
            this.menuBar['CodeActions'].forEach((action) => {
                if (action.CodeUIAction === StandardCodes.CONTEXT_MENU) {
                    const menu: MenuItemModel = {
                        iconCss: action.JSONParameter.Icon,
                        text: action.JSONParameter.CodeDescription
                            ? action.JSONParameter.CodeDescription
                            : action.Task.CodeCode
                    };
                    menu['value'] = action.Task.CodeCode;
                    menu['Task'] = action.Task.CodeCode;
                    this.contextMenus.push(menu);
                }
            });
        }
    }

    /**
     * <p> contextmenu action on right click</p>
     * @param menu is menu the is selected
     */
    handleContextMenuActions(menu) {
        if (!this.activeMenu['CodeActions']) {
            this.activeMenu['CodeActions'] = [];
        }
        let action;
        if (
            this.menuBar['CodeActions'] &&
            Array.isArray(this.menuBar['CodeActions']) &&
            !Utils.isArrayEmpty(this.menuBar['CodeActions'])
        ) {
            action = this.menuBar['CodeActions'].find((action) => {
                return menu === action.Task.CodeCode;
            });
            if (action) {
                let index = this.activeMenu['CodeActions'].findIndex((menuAction) => {
                    return (
                        menuAction.CodeCode === action.Task.CodeCode &&
                        menuAction.CodeUIAction === StandardCodes.CONTEXT_MENU
                    );
                });
                if (index < 0) {
                    this.activeMenu['CodeActions'].push(action);
                }
            }
        }
        this.handleAction(this.activeMenu, StandardCodes.CONTEXT_MENU);
    }

    /**
     * <p> Open context menu on right click </p>
     * @param event is mouse click event
     * @param menu  is quick menu that is selected
     */
    openContextmenu(event, menu) {
        this.activeMenu = menu;
        event.preventDefault();
        this.contextMenu.open(event.pageY, event.pageX);
    }

    /**
     * <p> Triggers while selecting menu item. </p>
     * @param $event is MenuEventArgs which has mouse click event with the menu that is selected
     */
    select($event) {
        this.handleContextMenuActions($event);
    }

    /**
     *  <p> Handle click action on any quick menu </p>
     * @param menu        is menu that is clicked
     * @param actionType  is optional parameter for action type
     */
    handleAction(menu, actionType?: any) {
        if (this.menuService.activeMenuIds.indexOf(menu._id) < 0) {
            this.menuService.activeMenuIds.push(menu._id);
            menu['isMenuSelected'] = true;
        } else {
            return;
        }
        this.broadcaster.broadcast('click-registered');
        this.containerID = menu.UIContainer;
        let navigationUrl = 'mw/menu';
        navigationUrl = `${navigationUrl}/${menu.CodeCode}`;
        actionType = actionType ? actionType : StandardCodes.UI_ACTION_CLICK;
        let selectedData = this.actionService.getActionDetails(menu, null, actionType, '');
        selectedData.parentContainerId = selectedData.UIContainer;
        this.actionService.actionHandler(
            menu,
            null,
            StandardCodes.UI_ACTION_CLICK,
            navigationUrl,
            null,
            this.dialog,
            this.dialogConfig
        );
    }

    /**
     * <p> handles the context menu emitted by the mega-menu </p>
     *
     * @param event : event from mega-menu component
     */
    megaMenuSelectContextMenu(event) {
        this.openContextmenu(event['actionType'], event['menu']);
    }

    /**
     * <p> handles the menu click emitted by the mega-menu </p>
     *
     * @param menu : menu clicked from mega-menu component
     */
    megaMenuSelectMenu(menu) {
        this.handleAction(menu, menu['actionType']);
    }
}
