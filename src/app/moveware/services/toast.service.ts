import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Toast, ToastModel } from '@syncfusion/ej2-notifications';
import Utils from './utils';

/**
 * <p> This is the SyncFusion Toast component created as a service
 *     It can be injected into components and called to create messages as any toast.
 *     There are 4 toast types: Success, Warning, Error and Information and they can be
 *     created by calling this.toastService.addWarningMessage('Contents of Toast') </p>
 */

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    element: HTMLElement;
    toastObj: Toast;
    toastModel: { toastObj: any; target: HTMLElement };
    toastPosition: any = {
        X: 'Right',
        Y: 'Bottom'
    };

    constructor(private translateService: TranslateService) {}

    /**
     * <p> This method is called to show all custom toasts based on toastType </p>
     * @param toastType : the type of toast, i.e. error, warning, success, info
     * @param messages : the message to be displayed on the toast
     */
    public showCustomToast(toastType: string, messages: any[]) {
        let messageObj;
        switch (toastType) {
            case 'success': {
                messageObj = Utils.renderHTMLElement(messages);
                this.addSuccessMessage(messageObj.content, messageObj.title);
                break;
            }
            case 'error': {
                // messages = Utils.getGroupBy(messages, 'errorCode')
                messageObj = Utils.renderHTMLElement(messages);
                this.addErrorMessage(messageObj.content, messageObj.title);
                break;
            }
            case 'warning': {
                messageObj = Utils.renderHTMLElement(messages);
                this.addWarningMessage(messageObj.content, messageObj.title);
                break;
            }
            case 'info': {
                messageObj = Utils.renderHTMLElement(messages);
                this.addInfoMessage(messageObj.content, messageObj.title);
                break;
            }
            default: {
                break;
            }
        }
    }

    /**
     * This method is called to display a Success toast
     * @param message : the message to be displayed on the toast
     * @param title : optional title to be displayed on the toast
     */
    public addSuccessMessage(message: any, title?: string) {
        this.showToast({
            title: title,
            content: message,
            cssClass: 'e-toast-success',
            position: this.toastPosition,
            showCloseButton: true,
            icon: 'e-success toast-icons',
            width: 400
        });
    }

    /**
     * This method is called to display an Error toast
     * @param message : the message to be displayed on the toast
     * @param title : optional title to be displayed on the toast
     */
    public addErrorMessage(message: any, title?: string) {
        this.showToast({
            title: title,
            content: message,
            cssClass: 'e-toast-danger',
            position: this.toastPosition,
            showCloseButton: true,
            icon: 'e-error toast-icons',
            width: 400
        });
    }

    /**
     * This method is called to display a Warning toast
     * @param message : the message to be displayed on the toast
     * @param title : optional title to be displayed on the toast
     */
    public addWarningMessage(message: any, title?: string) {
        this.showToast({
            title: title,
            content: message,
            cssClass: 'e-toast-warning',
            position: this.toastPosition,
            showCloseButton: true,
            icon: 'e-warning toast-icons',
            width: 400
        });
    }

    /**
     * This method is called to display a Information toast
     * @param message : the message to be displayed on the toast
     * @param title : optional title to be displayed on the toast
     */
    public addInfoMessage(message: any, title?: string) {
        this.showToast({
            title: title,
            content: message,
            cssClass: 'e-toast-info',
            position: this.toastPosition,
            showCloseButton: true,
            icon: 'e-info toast-icons',
            width: 400
        });
    }

    /**
     * <p> This method is used to render the toast on screen by calling it with a toastModel object </p>
     * @param {ToastModel} model : ToastModel object containing properties of the toast to be displayed
     * returns the toastModel that was displayed
     */
    private showToast(model: ToastModel) {
        if (typeof model.content === 'string') {
            this.translateService.get(model.content).subscribe((vale) => {
                model.content = vale;
                this.element = document.getElementById('toast');
                this.toastObj = new Toast(model, this.element);
                this.toastObj.show();
                this.toastModel = { toastObj: this.toastObj, target: this.element };
                return this.toastModel;
            });
        } else {
            this.element = document.getElementById('toast');
            this.toastObj = new Toast(model, this.element);
            this.toastObj.show();
            this.toastModel = { toastObj: this.toastObj, target: this.element };
            return this.toastModel;
        }
    }

    /**
     * <p> This method can be called to hide a specific toast, it is not currently used yet </p>
     * @param {toastModel} toastModel : the toastModel Object to be hidden
     */
    private hideToast(toastModel: { toastObj: any; target: HTMLElement }): void {
        if (this.toastModel.toastObj) {
            this.toastModel.toastObj.hide();
            this.toastModel.toastObj.destroy();
            document.body.removeChild(this.toastModel.target);
        }
    }

    /**
     * <p> This method can be called to hide all toasts, it is not currently used yet </p>
     * @param { Toast } toastObj : Toast object
     */
    private hideToastAll(toastObj: Toast): void {
        if (toastObj) {
            toastObj.hide('All');
        }
    }
}
