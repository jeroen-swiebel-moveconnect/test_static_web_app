import { Component, EventEmitter, Output, QueryList, OnInit, ViewChildren } from '@angular/core';
import Utils from 'src/app/moveware/services/utils';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { MegaMenuPanelComponent } from '../data-util-view/data-views/mega-menu-panel/mega-menu-panel.component';

/**
 * <p> Mega Menu built using JavaScript & JQuery, partially built off example:
 * https://stackblitz.com/edit/responsive-megamenu?file=index.html
 * </p>
 */

@Component({
    selector: 'mega-menu',
    templateUrl: './mega-menu.component.html',
    styleUrls: ['./mega-menu.component.scss']
})
export class MegaMenuComponent implements OnInit {
    @Output() selectMenu = new EventEmitter<any>();
    @Output() selectContextMenu = new EventEmitter<any>();
    @ViewChildren(MegaMenuPanelComponent) megaMenuPanels: QueryList<MegaMenuPanelComponent>;

    menus: any[];
    fullMenus: any[];
    partMenus: any[];
    menuLayout: string;
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

    ngOnInit() {}

    /**
     * <p> Set the badge numbers for some specific menus </p>
     */
    setBadges(menus) {
        if (menus) {
            menus.forEach((menu) => {
                if (menu.CodeCode === 'Sales' || menu.CodeCode === 'Overview') {
                    menu.subMenus.forEach((subMenu) => {
                        if (subMenu.subMenus) {
                            subMenu.subMenus.forEach((childSubMenu) => {
                                if (
                                    childSubMenu.CodeDescription === 'All Leads' ||
                                    childSubMenu.CodeDescription === 'Active Leads' ||
                                    childSubMenu.CodeDescription === 'New Leads' ||
                                    childSubMenu.CodeDescription === 'Upcoming Surveys' ||
                                    childSubMenu.CodeDescription === 'All Quotes' ||
                                    childSubMenu.CodeDescription === 'Quotes awaiting Approval' ||
                                    childSubMenu.CodeDescription === 'Pending Quotes' ||
                                    childSubMenu.CodeDescription === 'All Supplier Quotes' ||
                                    childSubMenu.CodeDescription === 'New Supplier Quotes' ||
                                    childSubMenu.CodeDescription === 'All Customers' ||
                                    childSubMenu.CodeDescription === 'Active Customers' ||
                                    childSubMenu.CodeDescription === 'New Customers' ||
                                    childSubMenu.CodeDescription === 'Suspect Customers' ||
                                    childSubMenu.CodeDescription === 'Prospect Customers'
                                ) {
                                    childSubMenu['badge'] = this.randomNumber();
                                }
                            });
                        }
                    });
                }
            });
        }
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

        this.emitSelectMenu(event);
    }

    /**
     * <p> Emits the select menu event to the parent container </p>
     *
     * @param event : select menu event emitted to the parent container
     */
    emitSelectMenu(event) {
        this.selectMenu.emit(event);
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

        this.emitSelectContextMenu(event);
    }

    /**
     * <p> Emits the select context menu event to the parent container </p>
     *
     * @param event : select context menu event emitted to the parent container
     */
    emitSelectContextMenu(event) {
        this.selectContextMenu.emit(event);
    }

    /**
     * <p> Locks the menu in place; triggered by the click of a header menu </p>
     *
     * @param event : the click event
     * @param index : the index of the menu panel to be shown
     */
    lockMenu(event, index) {
        let prevLock: number;

        if (this.menuLocked === index || index === -1) {
            prevLock = this.menuLocked;
            this.menuLocked = -1;
            this.removeModal(event, prevLock);
        } else {
            if (this.menuLocked !== -1) {
                prevLock = this.menuLocked;
                this.menuLocked = -1;
                this.removeModal(event, prevLock);
            }
            this.menuLocked = index;
            this.applyModal(event, index);
        }
    }

    /**
     * <p> Updates the show parameter for the selected menu </p>
     *
     * @param event : event containing menu to update show parameter
     */
    updateShow(event) {
        let index = event.index;
        let show = event.show;

        this.menus[index].show = show;
        this.displayMenu = show;
        if (!show) {
            this.menuLocked = -1;
        }
    }

    /**
     * <p> Apply a modal affect when mega menu panel is shown </p>
     *
     * @param event : the mouseover event
     * @param index : the index of the mega menu panel shown
     */
    applyModal(event, index) {
        if (this.menuLocked === index || this.menuLocked === -1) {
            if (
                event &&
                this.menuLocked === -1 &&
                !(
                    (!event.fromElement &&
                        event.toElement &&
                        event.toElement.className.startsWith('menu-sub')) ||
                    (event.fromElement &&
                        event.toElement &&
                        event.fromElement.className.startsWith('header-menu') &&
                        event.toElement.className.startsWith('menu-sub')) ||
                    (event.fromElement &&
                        event.toElement &&
                        event.toElement.className.startsWith('header-menu') &&
                        (event.fromElement.className.startsWith('menu-sub') ||
                            (event.fromElement.className.startsWith('header-menu') &&
                                this.waitTimer > 0) ||
                            event.fromElement.className.startsWith('modal-overlay')))
                )
            ) {
                this.showMenu = setTimeout(() => {
                    this.setDisplayMenu(index, true);
                }, 500);
            } else {
                this.setDisplayMenu(index, true);
            }
        }
    }

    /**
     * <p> Removals the modal affect when mega menu panel is hidden </p>
     *
     * @param event: the mouseleave event
     * @param index : the index of the mega menu panel hidden
     */
    removeModal(event, index) {
        if (!this.displayContextMenu && this.menuLocked === -1) {
            this.setDisplayMenu(index, false);
        }
    }

    /**
     * <p> Check the UI Action set on the menu and emit it.
     * If there are no actions set, treat it as a normal menu </p>
     *
     * @param menu : the menu to check action on
     * @param index : the index of the menu
     * @param uiAction : the type of UI Action
     */
    checkAction(menu, index, uiAction) {
        let actions = [];
        if (!Utils.isArrayEmpty(menu.CodeActions)) {
            actions = menu.CodeActions.filter((action) => action.CodeUIAction === uiAction);

            if (!Utils.isArrayEmpty(actions)) {
                menu['actionType'] = uiAction;
                this.selectMenu.emit(menu);
            }
        }

        if (uiAction === StandardCodes.UI_ACTION_CLICK && Utils.isArrayEmpty(actions)) {
            this.setSelectedMenu(index, menu);
        }
    }

    /**
     * <p> sets the show flag on the menu being hovered over on </p>
     *
     * @param index : the index of the menu hovered over on
     * @param show: show or not show the menu
     */
    private setDisplayMenu(index, show) {
        this.megaMenuPanels.forEach((panel, i) => {
            if (i === index) {
                panel.menu.show = show;
                this.menus[i].show = show;
                this.displayMenu = show;
                if (show === true) {
                    if (this.menuLocked === index) {
                        panel.menu.lock = true;
                    }
                    this.displayContextMenu = false;
                    setTimeout(() => {
                        this.waitTimer = 1;
                    }, 5);
                } else {
                    panel.menu.lock = false;
                    clearTimeout(this.showMenu);
                    setTimeout(() => {
                        this.waitTimer = 0;
                    }, 5);
                }
            } else {
                panel.menu.show = false;
                panel.menu.lock = false;
                this.menus[i].show = false;
            }
        });
    }

    /**
     * <p> Generates a number less than 30 </p>
     *
     * @returns number less than 30
     */
    private randomNumber() {
        let max: number = 30;
        let number: number = Math.floor(Math.random() * (max + 1));
        if (number < 1) {
            number = 1;
        }

        return number;
    }

    /**
     * <p> Sets the menu to full, partial sets </p>
     *
     * @param menus: the menu to be broken into the 2 sets
     */
    set setMenu(menus) {
        this.fullMenus = Utils.getCopy(menus);
        menus.forEach((menu) => {
            if (menu.subMenus) {
                menu.subMenus.forEach((subMenu) => {
                    if (subMenu.subMenus) {
                        let temp = subMenu.subMenus.filter((childSubMenu) => {
                            return childSubMenu.CodeCollapsed !== 'Yes';
                        });
                        subMenu.subMenus = temp;
                    }
                });
            }
        });

        this.menus = menus;
        this.partMenus = Utils.getCopy(menus);
    }
}
