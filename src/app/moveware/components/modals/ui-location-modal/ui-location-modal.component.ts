import { Component, OnInit } from '@angular/core';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Helpers } from 'src/app/moveware/utils/helpers';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { ContextService } from '../../../services/context.service';
import { CacheService } from '../../../services/cache.service';

@Component({
    selector: 'ui-location-modale-content',
    templateUrl: './ui-location-modal.component.html',
    styleUrls: ['./ui-location-modal.component.scss']
})
export class UILocationModalContentComponent implements OnInit {
    // Usage type can be alert or confirm- alert will contain only OK butoon while Confirm has two buttons Yes and No
    public menu: any;
    position: string;
    title: any = '';
    closeEvent: any;
    closeLookupEvent: any;
    metaData: any = {};
    actionType: any;
    closeQuickPopupEvent: any;
    data: any;
    overlayWidth: any;
    isQuickPaneMax: boolean;
    private mouseEnteredIntoDialog: boolean = false;
    isDataChanged: string;

    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private broadcaster: Broadcaster,
        private contextService: ContextService,
        private cacheService: CacheService
    ) {
        this.data = this.config.data;
        this.menu = this.data.menu;
        this.position = this.data.position;
        this.actionType = this.data.actionType;
        this.setTitle();
    }
    currentRecord: any = {};
    parentContainerId: string;
    ngOnInit() {
        let isDataChanged = this.cacheService.getSessionData('dataChange');
        if (isDataChanged) {
            this.isDataChanged = JSON.parse(isDataChanged);
        }
        if (this.menu.criteria) {
            this.currentRecord.criteria = this.menu.criteria;
        }
        this.metaData.onlyLookup = this.menu.isOnlyLookup;
        this.metaData.multiSelection = this.menu.multiSelection;
        this.metaData.rowSelect = this.menu.rowSelect;
        this.metaData.criteria = this.menu.criteria;
        this.metaData.selectedRecords = this.menu.isOnlyLookup ? this.menu.selectedRecords : null;
        this.metaData.currentRecord = this.menu.currentRecord;
        if (this.menu?.IsParentContext) {
            this.parentContainerId = this.menu.parentContainerId;
        }
        this.metaData.SetAddMode = this.menu.SetAddMode;
        this.metaData.parentViewId = this.menu.parentViewId;
        this.metaData.defaultLayout = this.menu.defaultLayout;
        this.metaData.settingJSON = this.menu.settingJSON;
        this.metaData.isLoadedFromOverlay = true;
        if (this.menu['CodeCacheData']) {
            this.metaData['CodeCacheData'] = this.menu['CodeCacheData'];
        }
        this.modifyDialogOverlay();
        this.registerEvents();
        if (this.position === 'popup-right' || this.position === 'popup-left') {
            Helpers.removeOverlayClass();
        }
        $('.window-dialog')?.parent()?.addClass('window-mask');
    }
    /**
     * modifies the overlay dialog based of the menu and dialog panel
     */
    modifyDialogOverlay() {
        const isHorizontalMenu = $('nav').hasClass('activatehorizontalmenu');
        if (this.position.includes('panel')) {
            $('.ui-widget-overlay').css('display', 'none');
            if (isHorizontalMenu) {
                $('.ui-dialog').css('z-index', '1000 !important');
            } else {
                $('.ui-dialog').css('z-index', '1001 !important');
            }
        }
    }
    /**
     * sets the tiyle for the dialog if exists
     */
    setTitle() {
        if (this.menu.CodeActions && this.menu.CodeActions.length) {
            this.menu.CodeActions.forEach((element) => {
                if (element.CodeUIAction == this.data.actionType && element.TitleBar) {
                    this.title = element.TitleBar;
                }
            });
        }
    }
    /**
     * resizes the dialog
     * @param isExpand : flag to determine expanded state
     */
    public resizeOverlay(isExpand) {
        if (isExpand) {
            this.config.height = '100vh';
            this.config.width = '99.99vw';
        } else {
            this.config.height = '100vh';
            this.config.width = '30%';
        }
    }
    /**
     * triggers when mouse entered into the dialog area
     */
    enteredIntoDialog() {
        this.mouseEnteredIntoDialog = true;
    }
    /**
     * triggers when mouse leaves from the dialog area
     */
    mouseLeaveFromDialog() {
        if (this.actionType == StandardCodes.UI_ACTION_MOUSEOVER) {
            this.closeDialog(null);
        }
    }
    /**
     * registers the events related to close
     */
    registerEvents() {
        this.closeQuickPopupEvent = this.broadcaster
            .on<string>('closeQuickPopup')
            .subscribe((data) => {
                setTimeout(() => {
                    if (!this.mouseEnteredIntoDialog) {
                        this.closeDialog(null);
                    }
                }, 100);
                this.closeQuickPopupEvent.unsubscribe();
            });
        this.closeLookupEvent = this.broadcaster
            .on<string>(this.menu.UIContainer + 'closeLookup')
            .subscribe((collectionObj) => {
                this.closeDialog(collectionObj);
            });
        this.closeEvent = this.broadcaster
            .on<string>(this.menu.UIContainer + 'close')
            .subscribe((collectionObj) => {
                this.dialogRef.close();
            });
        if (
            this.menu.defaultView &&
            typeof this.menu.defaultView === 'object' &&
            this.menu.defaultView.viewId
        ) {
            this.closeEvent = this.broadcaster
                .on<string>(this.menu.UIContainer + this.menu.defaultView.viewId + 'close')
                .subscribe((collectionObj) => {
                    this.dialogRef.close();
                });
        }
    }
    /**
     * checks the unsaved data and popsup the warning if any
     * @param data
     */
    checkSaveStateAndCloseDialog(data) {
        const dataChange = this.contextService.isDataChanged();
        if (dataChange) {
            dataChange.subscribe((result) => {
                if (result) {
                    this.contextService.removeDataChangeState();
                    this.closeDialog(data);
                }
            });
        } else {
            this.closeDialog(data);
        }
    }
    /**
     * sets resets the context, handles callback funtions and closes the dialog
     * @param data
     */
    closeDialog(data) {
        if (this.isDataChanged) {
            this.contextService.saveDataChangeState();
        }
        if (this.menu.IsParentContext) {
            this.contextService.removeContextByContainer(
                this.menu.parentContainerId,
                this.menu.UIContainer
            );
        } else {
            this.contextService.OverlayContainerIDs.forEach((containerID) => {
                this.contextService.setContextRecord(
                    containerID + this.contextService.getRootViewMap(containerID),
                    null
                );
            });
        }
        if (this.menu.CodeCallback) {
            let event = {
                callBack: this.menu.CodeCallback,
                data: data
            };
            this.broadcaster.broadcast(this.menu.UIContainer + 'callback', event);
        }
        this.removeAttributeOnDialogClose();
        if (this.menu.CodeUIAction === 'Row Select') {
            this.broadcaster.broadcast('dialogClose', true);
        }
        this.dialogRef.close();
    }
    /**
     * resizes the overlay dialog to right
     * @param isExpand : expanded state
     */
    public resizeOverlayToRight(isExpand) {
        if (!isExpand) {
            this.config.height = '100vh';
            this.config.width = '99.99vw';
        } else {
            this.config.height = '100vh';
            this.config.width = '30%';
        }
    }
    /**
     * removes the attributs when dialog closes
     */
    private removeAttributeOnDialogClose() {
        const appContainerElement = $('#app-container');
        const mwContainerElement = $('.mw-container');
        if (this.menu.UIContainer === mwContainerElement.attr('containerId')) {
            mwContainerElement.removeAttr('containerId');
            appContainerElement.removeAttr('style');
            mwContainerElement.removeAttr('style');
        }
    }
}
