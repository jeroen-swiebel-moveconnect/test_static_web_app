import { Injectable } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StandardCodes } from '../constants/StandardCodes';

@Injectable({
    providedIn: 'root'
})
export class DialogConfigurationService {
    headerHeight = 50;
    horizontalMenuHeight = 0;
    breadcrumHeight = 28;
    paginationHeight = 29;
    isHorizontalMenu: any;
    constructor() {}

    getDialogConfiguration(data, dialogConfig): DynamicDialogConfig {
        let height = '';
        let width = '';
        if (data && data.menu) {
            const dialogSize = data.menu.CodeSize;
            if (dialogSize) {
                const dialogSizeValues = dialogSize.split(':');
                if (dialogSizeValues.length === 2) {
                    height = dialogSizeValues[0] + 'vh';
                    width = dialogSizeValues[1] + '%';
                }
            }
        }
        dialogConfig.data = data;
        let dialogConfigObj: any = {};
        this.isHorizontalMenu = $('nav').hasClass('activatehorizontalmenu');
        if (this.isHorizontalMenu) {
            this.horizontalMenuHeight = 72;
        }
        switch (data.position) {
            case 'center':
                this.setupDialogCenter(dialogConfigObj, height, width, dialogConfig);
                break;
            case 'left':
                this.setupDialogLeft(dialogConfigObj, height, width, dialogConfig);
                break;
            case 'right':
                this.setupDialogRight(dialogConfigObj, height, width, dialogConfig);
                break;
            case 'panel-right':
                this.setupPanelRight(dialogConfigObj, height, width, data, dialogConfig);
                break;
            case 'panel-left':
                this.setupPanelLeft(dialogConfigObj, height, width, data, dialogConfig);
                break;
            case 'panel-top':
                this.setupPanelTop(dialogConfigObj, height, width, data, dialogConfig);
                break;
            case 'panel-bottom':
                this.setupPanelBottom(dialogConfigObj, height, width, data, dialogConfig);
                break;
            case StandardCodes.UILOCATION.WINDOW_RIGHT:
                this.setupWindowRight(dialogConfigObj, height, width, dialogConfig);
                break;
            case StandardCodes.UILOCATION.WINDOW_LEFT:
                this.setupWindowLeft(dialogConfigObj, height, width, dialogConfig);
                break;
            case StandardCodes.UILOCATION.WINDOW_TOP:
                this.setupWindowTop(dialogConfigObj, height, width, dialogConfig);
                break;
            case StandardCodes.UILOCATION.WINDOW_BOTTOM:
                this.setupWindowBottom(dialogConfigObj, height, width, dialogConfig);
                break;
            case StandardCodes.UILOCATION.WINDOW_CENTER:
                this.setupWindowCenter(dialogConfigObj, height, width, dialogConfig);
                break;
            case 'popup-right':
                this.setupPopupRight(dialogConfigObj, height, width, data, dialogConfig);
                break;
            case 'popup-left':
                this.setupPopupLeft(dialogConfigObj, height, width, data, dialogConfig);
                break;
            default:
                dialogConfigObj = {
                    height: height,
                    defaultHeight: '90vh',
                    width: width,
                    defaultWidth: '80%',
                    styleClass: 'ui-dialog-center'
                };
                this.setDialogConfig(dialogConfigObj, dialogConfig);
                break;
        }
        dialogConfig.data = data;
        return dialogConfig;
    }
    private setDialogConfig(dialogConfigObj: any, dialogConfig) {
        dialogConfig.height =
            dialogConfigObj.height !== '' ? dialogConfigObj.height : dialogConfigObj.defaultHeight;
        dialogConfig.width =
            dialogConfigObj.width !== '' ? dialogConfigObj.width : dialogConfigObj.defaultWidth;
        dialogConfig.styleClass = dialogConfigObj.styleClass;
        dialogConfig.style = dialogConfigObj.style;
        dialogConfig.closable = dialogConfigObj.closable ? dialogConfigObj.closable : false;
        dialogConfig.showHeader = dialogConfigObj.showHeader ? dialogConfigObj.showHeader : false;
    }
    private setupDialogCenter(dialogConfigObj: any, height: string, width: string, dialogConfig) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '90vh',
            width: width,
            defaultWidth: '80%',
            styleClass: 'ui-dialog-center'
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupDialogRight(dialogConfigObj: any, height: string, width: string, dialogConfig) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '100vh',
            width: width,
            defaultWidth: '40%',
            styleClass: 'ui-dialog-right'
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupDialogLeft(dialogConfigObj: any, height: string, width: string, dialogConfig) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '100vh',
            width: width,
            defaultWidth: '40%',
            styleClass: 'ui-dialog-left'
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupPanelTop(
        dialogConfigObj: any,
        height: string,
        width: string,
        data: any,
        dialogConfig
    ) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '30vh',
            width: width,
            defaultWidth: '100%',
            styleClass: 'panel-top'
        };
        const calcHeight = height !== '' ? height : '30vh';
        let popupHeight;
        if (this.isHorizontalMenu) {
            dialogConfigObj.style = {
                'margin-left': '0px',
                top: this.headerHeight + this.horizontalMenuHeight + this.breadcrumHeight + 'px'
            };
        } else {
            if ($('.sidebar-mini').length > 0) {
                dialogConfigObj.style = {
                    'margin-left': '48px',
                    width: 'calc(100% - 48px)',
                    top: this.headerHeight + this.breadcrumHeight + 'px'
                };
            } else {
                dialogConfigObj.style = {
                    'margin-left': '220px',
                    width: 'calc(100% - 220px)',
                    top: this.headerHeight + this.breadcrumHeight + 'px'
                };
            }
        }
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupPanelBottom(
        dialogConfigObj: any,
        height: string,
        width: string,
        data: any,
        dialogConfig
    ) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '30vh',
            width: width,
            defaultWidth: '100%',
            styleClass: 'panel-bottom'
        };
        if (this.isHorizontalMenu) {
            dialogConfigObj.style = { 'margin-left': '0px' };
        } else {
            if ($('.sidebar-mini').length > 0) {
                dialogConfigObj.style = {
                    'margin-left': '48px',
                    width: 'calc(100% - 48px)'
                };
            } else {
                dialogConfigObj.style = {
                    'margin-left': '220px',
                    width: 'calc(100% - 220px)'
                };
            }
        }
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupPanelRight(
        dialogConfigObj: any,
        height: string,
        width: string,
        data: any,
        dialogConfig
    ) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '100vh',
            width: width,
            defaultWidth: '40%',
            styleClass: 'panel-right',
            style: {
                top: this.headerHeight + this.horizontalMenuHeight + this.breadcrumHeight + 'px'
            },
            closable: false
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupPanelLeft(
        dialogConfigObj: any,
        height: string,
        width: string,
        data: any,
        dialogConfig
    ) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '100vh',
            width: width,
            defaultWidth: '40%',
            styleClass: 'panel-left',
            style: {
                top: this.headerHeight + this.horizontalMenuHeight + this.breadcrumHeight + 'px'
            },
            closable: false
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupPopupLeft(
        dialogConfigObj: any,
        height: string,
        width: string,
        data: any,
        dialogConfig
    ) {
        let positions,
            elemWidth,
            adjustSize = 50,
            defaultWidth = 500,
            defaultLeftPosition;
        elemWidth = data.event.target.offsetWidth;
        positions = data.event.target.getBoundingClientRect();
        if (positions.left > defaultWidth + elemWidth) {
            defaultLeftPosition = positions.left - (elemWidth + defaultWidth - adjustSize);
        } else {
            defaultLeftPosition = 50;
        }
        // this.dialogConfig.position = { top: positions.top + "px", left: defaultLeftPosition + "px" }
        if (defaultLeftPosition == 50 && positions.left < defaultWidth + elemWidth) {
            defaultWidth = positions.left - data.event.target.offsetWidth;
            if (defaultWidth < 0) {
                defaultWidth = -defaultWidth;
            }
        }
        dialogConfigObj = {
            height: height,
            defaultHeight: '30%',
            width: width,
            defaultWidth: defaultWidth + 'px',
            styleClass: 'panel',
            style: { top: positions.top + 'px', left: defaultLeftPosition + 'px' },
            closable: false
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupPopupRight(
        dialogConfigObj: any,
        height: string,
        width: string,
        data: any,
        dialogConfig
    ) {
        let positions,
            elemWidth,
            adjustSize = 50,
            defaultWidth = 500,
            defaultLeftPosition;
        elemWidth = data.event.target.offsetWidth + 20;
        positions = data.event.target.getBoundingClientRect();
        if (positions.right < defaultWidth && positions.right + positions.left > 1000) {
            defaultWidth = defaultWidth - positions.right;
        }
        // this.dialogConfig.position = { top: positions.top + "px", left: positions.left + elemWidth + "px" }
        dialogConfigObj = {
            height: height,
            defaultHeight: '30%',
            width: width,
            defaultWidth: defaultWidth + 'px',
            styleClass: 'panel',
            style: { top: positions.top + 'px', left: positions.left + elemWidth + 'px' },
            closable: false
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    getConfirmationDialogConfig(dialogConfig: any) {
        dialogConfig.closable = false;
        dialogConfig.showHeader = false;
        dialogConfig.height = '200px';
        dialogConfig.width = '300px';
        delete dialogConfig.styleClass;
        return dialogConfig;
    }
    getSaveEditFilterDialogConfig(dialogConfig: any) {
        dialogConfig.closable = false;
        dialogConfig.showHeader = false;
        dialogConfig.height = '100vh';
        dialogConfig.width = '30%';
        dialogConfig.styleClass = 'slide-pane';
        return dialogConfig;
    }
    private setupWindowRight(dialogConfigObj: any, height: string, width: string, dialogConfig) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '90vh',
            width: width,
            defaultWidth: '80%',
            style: {
                top: '0px',
                right: '0px'
            },
            styleClass: 'window-dialog window-right',
            closable: true,
            showHeader: true
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupWindowLeft(dialogConfigObj: any, height: string, width: string, dialogConfig) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '90vh',
            width: width,
            defaultWidth: '80%',
            style: {
                top: '0px',
                left: '0px'
            },
            styleClass: 'window-dialog window-left',
            closable: true,
            showHeader: true
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupWindowTop(dialogConfigObj: any, height: string, width: string, dialogConfig) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '70vh',
            width: width,
            defaultWidth: '100%',
            style: {
                top: '0px',
                left: '0px'
            },
            styleClass: 'window-dialog window-top',
            closable: true,
            showHeader: true
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupWindowBottom(dialogConfigObj: any, height: string, width: string, dialogConfig) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '70vh',
            width: width,
            defaultWidth: '100%',
            style: {
                bottom: '0px',
                left: '0px'
            },
            styleClass: 'window-dialog window-bottom',
            closable: true,
            showHeader: true
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
    private setupWindowCenter(dialogConfigObj: any, height: string, width: string, dialogConfig) {
        dialogConfigObj = {
            height: height,
            defaultHeight: '60vh',
            width: width,
            defaultWidth: '60%',
            styleClass: 'window-dialog',
            closable: true,
            showHeader: true
        };
        this.setDialogConfig(dialogConfigObj, dialogConfig);
    }
}
