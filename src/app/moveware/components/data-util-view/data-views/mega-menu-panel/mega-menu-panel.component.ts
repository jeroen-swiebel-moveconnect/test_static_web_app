import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import Utils from 'src/app/moveware/services/utils';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';

/**
 * <p> Mega Menu built using JavaScript & JQuery, partially built off example:
 * https://stackblitz.com/edit/responsive-megamenu?file=index.html
 * </p>
 */

@Component({
    selector: 'mega-menu-panel',
    templateUrl: './mega-menu-panel.component.html',
    styleUrls: ['./mega-menu-panel.component.scss']
})
export class MegaMenuPanelComponent implements OnInit {
    @Input() menu: any;
    @Input() partMenu: any;
    @Input() fullMenu: any;
    @Input() index: number;
    @Input() menuLayout: string;
    @Input() currentViewCodeUIContainerDesignerCode: any;
    @Output() selectMenu = new EventEmitter<any>();
    @Output() selectContextMenu = new EventEmitter<any>();
    @Output() onRecordSelection = new EventEmitter<any>();
    @Output() updateShow = new EventEmitter<any>();

    currentPage: any;
    currentView: any;
    dataSource: Array<Object>;
    menus: any[];
    fullMenus: any[];
    partMenus: any[];
    DISPLAY_ICON: string = StandardCodes.DISPLAY_ICON;
    DISPLAY_TEXT: string = StandardCodes.DISPLAY_TEXT;
    DISPLAY_ICONANDTEXT: string = StandardCodes.DISPLAY_ICONANDTEXT;
    UI_ACTION_CLICK: string = StandardCodes.UI_ACTION_CLICK;
    UI_ACTION_MOUSEOVER: string = StandardCodes.UI_ACTION_MOUSEOVER;
    displayMenu: boolean = false;
    displayContextMenu: boolean = false;
    numberOfCols: number = 6;
    showMenu: any;
    waitTimer: number = 0;
    menuLocked: number = -1;
    menuExpanded: boolean = false;

    ngOnInit() {
        this.onResize();
    }

    /**
     * <p> triggered after a menu is clicked on </p>
     *
     * @param index : the index of the megamenu panel shown
     * @param menu : the parent menu
     * @param subMenu : the sub menu
     * @param childSubMenu : the child Sub Menu
     */
    setSelectedMenu(index, menu, subMenu?: any, childSubMenu?: any) {
        let event = {
            menu: menu,
            subMenu: subMenu,
            childSubMenu: childSubMenu
        };

        this.selectMenu.emit(event);
        this.menu.show = false;

        if (menu.subMenus && menu.subMenus.length) {
            this.menuLocked = -1;
            this.menu.lock = false;
            this.removeModal();
        }
    }

    /**
     * <p> Triggers when user clicks on the open in new tab external link </p>
     *
     * @param event : event of the click
     * @param index : index of the menu clicked on
     * @param menu : parent menu that's open
     * @param subMenu : subMenu of the parent that's open
     * @param childSubMenu : childSubMenu of the parent that's open
     */
    openInNewTab(event, index, menu, subMenu?: any, childSubMenu?: any) {
        let selectedMenu = {
            menu: menu,
            subMenu: subMenu,
            childSubMenu: childSubMenu,
            openIn: StandardCodes.TASK_OPEN_LINK_IN_NEW_TAB,
            target: {
                innerText: event.target.parentNode.parentElement.innerText
            }
        };

        this.selectMenu.emit(selectedMenu);

        event.stopPropagation();
        this.removeModal();
    }

    /**
     *<p> compares equality of 2 string ignoring their cases </p>
     *
     * @param {string} str1 - The string to be compared.
     * @param {string} str2 - The string to compare.
     * @return {boolean} - The result after comparision.
     */
    equalIgnoreCase(str1, str2) {
        return Utils.equalIgnoreCase(str1, str2);
    }

    /**
     * <p> Perform opening context menu related action based on selected menu.
     *
     * @param {Event} actionType - The event which is fired upon context menu click.
     * @param {*} menu - The object of the selected menu.
     * @param {*} [subMenu] - The optional menu object which is a child of menu in heirarchy.
     * @param {*} [childSubMenu] - The optional menu object which is a sub child of menu in heirarchy.
     */
    openContextmenu(actionType, menu, subMenu?: any, childSubMenu?: any) {
        this.displayContextMenu = true;

        let event = {
            menu: menu,
            subMenu: subMenu,
            childSubMenu: childSubMenu,
            actionType: actionType
        };

        this.selectContextMenu.emit(event);
    }

    /**
     * <p> Expands or Collapses the menu to show/hide collapsed menus </p>
     *
     * @param index : the index of the menu panel to be expanded
     * @param expanded : the current state of the menus
     */
    expandMenu(index, expanded?) {
        if (expanded === undefined) {
            expanded = this.menuExpanded;
        }

        if (expanded) {
            this.menu = this.partMenu;
            this.menuExpanded = false;
        } else {
            this.menu = this.fullMenu;
            this.menuExpanded = true;
        }
        this.applyModal();
    }

    /**
     * <p> Apply a modal affect when mega menu panel is shown </p>
     */
    applyModal() {
        if (this.menuLocked === -1) {
            this.menu.show = true;
            this.updateShow.emit({
                index: this.index,
                show: true
            });
        }
    }

    /**
     * <p> Removals the modal affect when mega menu panel is hidden </p>
     */
    removeModal() {
        if (!this.displayContextMenu && !this.menu.lock) {
            this.menu.show = false;
            this.updateShow.emit({
                index: this.index,
                show: false
            });
        }
    }

    /**
     * <p> Given a number less than 30, returns a colour </p>
     *
     * @param number : the badge number that's less than 30
     * @returns a colour for the badge background colour
     */
    randomColor(number) {
        if (number <= 10) {
            return 'green';
        } else if (number <= 20) {
            return 'orange';
        } else {
            return 'red';
        }
    }

    /**
     * <p> Check the UI Action set on the menu and emit it.
     * If there are no actions set, treat it as a normal menu </p>
     *
     * @param uiAction : the type of UI Action
     * @param index : the index of the menu
     * @param menu : the menu to check action on
     * @param subMenu : the sub menu
     * @param childSubMenu : the child Sub Menu
     */
    checkAction(uiAction, index, menu, subMenu?, childSubMenu?) {
        let actions = [];
        let selectedMenu = childSubMenu;
        if (!selectedMenu) {
            selectedMenu = subMenu || menu;
        }

        if (!Utils.isArrayEmpty(selectedMenu.CodeActions)) {
            actions = selectedMenu.CodeActions.filter((action) => action.CodeUIAction === uiAction);

            if (!Utils.isArrayEmpty(actions)) {
                this.onRecordSelection.emit(selectedMenu);
                if (uiAction === StandardCodes.UI_ACTION_CLICK) {
                    this.setSelectedMenu(index, menu, subMenu, childSubMenu);
                }
            }
        }

        if (uiAction === StandardCodes.UI_ACTION_CLICK && Utils.isArrayEmpty(actions)) {
            this.setSelectedMenu(index, menu, subMenu, childSubMenu);
        }
    }

    /**
     * <p> Sets the number of columns for the mega menu based on document width </p>
     */
    onResize() {
        if ($(document).width() <= 1280) {
            this.numberOfCols = 3;
        } else if ($(document).width() <= 1600) {
            this.numberOfCols = 4;
        } else if ($(document).width() < 1920) {
            this.numberOfCols = 5;
        } else if ($(document).width() < 2134) {
            this.numberOfCols = 6;
        } else {
            this.numberOfCols = 0;
        }
    }

    /**
     * <p>Ensures that the backend response is modified to be usable
     * as data input to mega menu panel component</p>
     *
     * @param menu : response from backend query
     */
    private configureMenu(menu) {
        let megaMenu = {};
        if (this.currentPage) {
            megaMenu = Utils.getCopy(this.currentPage);
        } else if (this.currentView) {
            megaMenu = Utils.getCopy(this.currentView);
        }

        megaMenu['subMenus'] = menu;
        megaMenu['isTask'] = true;
        this.menu = megaMenu;
    }

    set setDataSource(data) {
        this.configureMenu(data);
    }

    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
