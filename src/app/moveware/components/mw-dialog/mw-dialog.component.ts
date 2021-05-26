import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from 'src/app/auth/auth.service';
import { Helpers } from 'src/app/moveware/utils/helpers';

@Component({
    selector: 'mw-dialog-content',
    templateUrl: './mw-dialog.component.html',
    styleUrls: ['./mw-dialog.component.scss']
})
export class MWDialogContentComponent implements OnInit {
    // Usage type can be alert or confirm- alert will contain only OK butoon while Confirm has two buttons Yes and No
    public type;
    public title;
    public message;
    noButtonDescription;
    yesButtonDescription;
    iconClass = 'fa fa-exclamation-triangle';
    data: any;
    value: string;
    errorMesage: string;
    warningMesage: string;
    isSessionLocked: boolean;
    isSessionExpired: boolean;
    isLogoutDialog: boolean;
    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private authService: AuthService,
        private translateService: TranslateService
    ) {
        this.data = this.config.data;
        this.title = this.data.title;
        if (this.data.message) {
            this.translateService.get(this.data.message).subscribe((data) => {
                this.message = data;
            });
        }
        this.type = this.data.type;
        if (this.data['noButtonDescription']) {
            this.noButtonDescription = this.data['noButtonDescription'];
        }
        if (this.data['yesButtonDescription']) {
            this.yesButtonDescription = this.data['yesButtonDescription'];
        }
        if (this.data['closeOpenedDialog']) {
            this.dialogRef.close();
        }
        if (this.title.match(/Logout/)) {
            this.isLogoutDialog = true;
            this.iconClass = 'fa fa-sign-out';
        } else if (this.title.match(/Session Expired/)) {
            Helpers.setOpacityToPopup('body .ui-widget-overlay', 0.98);
            this.isSessionExpired = true;
            this.iconClass = 'fa fa-clock-o';
        } else if (this.title.match(/Locked/)) {
            Helpers.setOpacityToPopup('body .ui-widget-overlay', 0.98);
            this.isSessionLocked = true;
            this.iconClass = 'fa fa-lock';
        }
    }
    @HostListener('window:keydown', ['$event'])
    keydownHandler(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            if (this.isSessionLocked) {
                this.tryLogin();
            } else if (this.isSessionExpired) {
                this.onYesClick();
            } else if (this.isLogoutDialog) {
                this.onYesClick();
            }
        }
    }
    ngOnInit() {
        // TODO if type === 'form' then build the dynamic form on the UI here.
    }

    public onNoClick(): void {
        this.dialogRef.close(false);
        let dialogElement = document.getElementsByTagName('mw-dialog-content');
        if (dialogElement && dialogElement.length && dialogElement[0].parentElement) {
            let parentElementClasses = dialogElement[0].parentElement.classList;
            let dialogId = parentElementClasses[parentElementClasses.length - 1];
            $('.' + dialogId + ' .ui-widget-overlay').remove();
        }
    }

    public onYesClick(): any {
        this.data['inputValue'] = this.value;
        this.dialogRef.close(true);
        $('.ui-widget-overlay').remove();
    }
    onInputChange() {
        this.errorMesage = '';
        this.warningMesage = '';
    }
    public tryLogin() {
        if (!this.title.match(/Logout/)) {
            if (this.value) {
                this.authService
                    .validatePassword(this.value)
                    .then((token) => {
                        this.dialogRef.close(true);
                    })
                    .catch((error) => {
                        this.errorMesage = 'Wrong password';
                        this.warningMesage = '';
                    });
            } else {
                this.errorMesage = '';
                this.warningMesage = 'Enter password';
            }
        } else {
            this.dialogRef.close(true);
        }
    }

    public onAccept(): void {
        this.dialogRef.close(true);
    }
}
