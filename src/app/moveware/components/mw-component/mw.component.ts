import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { UserService } from 'src/app/moveware/services/user-service';
import Utils from 'src/app/moveware/services/utils';

@Component({
    selector: 'moveware-root',
    templateUrl: './mw.component.html',
    styleUrls: ['./mw.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})
export class MWComponent implements OnInit {
    subject: Subject<any> = new Subject();
    isTimedOut: boolean;
    timer: any;
    timerEvent: any;
    constructor(
        private contextService: ContextService,
        private userService: UserService,
        private router: Router,
        private cacheService: CacheService
    ) {}
    ngOnInit() {
        if (this.cacheService.getLocalData('CurrentUser')) {
            this.userService.userDetails = JSON.parse(
                this.cacheService.getLocalData('CurrentUser')
            );
        }

        this.isTimedOut = false;
        Utils.navigateToPreviousState(this.router, this.cacheService);
        Utils.removeBrowserState(this.cacheService);
        // this.previousActiveStateTime = Date.now();
        //  this.registerTimer();
        // this.registerTimerForExpiry();
    }
    // checkSessionState() {
    //     if (this.cacheService.getSessionData('sessionExpired')) {
    //         this.cacheService.removeSessionData('sessionExpired');
    //         this.oauthService.logOut();
    //     } else if (this.cacheService.getSessionData('sessionLocked')) {
    //         this.cacheService.removeSessionData('sessionLocked');
    //         this.askForUserCredentials(
    //             'Session Locked',
    //             StandardCodes.MESSAGES.SESSION_INACTIVITY,
    //             false,
    //             '250px',
    //             '270px'
    //         );
    //     }
    // }
    // registerTimerForExpiry() {
    //     this.timerForExpiry = timer(this.timeoutTime, this.timeoutTime);
    //     this.timerEventForExpiry = this.timerForExpiry.subscribe(() => {
    //         this.dialog.dialogComponentRef.destroy();
    //         this.isTimedOut = true;
    //         this.cacheService.setSessionData('sessionExpired', true);
    //         this.handleIdleState(
    //             'alert',
    //             'Session Expired',
    //             StandardCodes.MESSAGES.SESSION_EXPIRY,
    //             true,
    //             '200px',
    //             '300px',
    //             { noButtonDescription: 'Continue' }
    //         ).onClose.subscribe((data) => {
    //             this.cacheService.removeSessionData('sessionExpired');
    //             this.cacheService.removeSessionData('sessionLocked');
    //             this.cacheService.preventDefault = true;
    //             this.oauthService.logOut();
    //         });
    //     });
    // }

    // registerTimer() {
    //     this.timer = timer(this.authService.timerCount, this.authService.timerCount);
    //     this.timerEvent = this.timer.subscribe(() => {
    //         this.timerEvent.unsubscribe();
    //         this.isTimedOut = true;
    //         this.askForUserCredentials(
    //             'Session Locked',
    //             StandardCodes.MESSAGES.SESSION_INACTIVITY,
    //             false,
    //             '250px',
    //             '270px'
    //         );
    //     });
    // }
    @HostListener('window:beforeunload', ['$event'])
    refreshHandlers(event) {
        this.contextService.removeDataChangeState();

        if (!this.cacheService.preventDefault) {
            return false;
        }
    }

    @HostListener('window:keydown', ['$event'])
    // @HostListener('window:beforeunload', ['$event'])
    keydownHandler(event: KeyboardEvent) {
        if (!this.cacheService.getSessionData('logout-BrowserState')) {
            this.cacheService.setSessionData('refresh-BrowserState', window.location.href);
            this.cacheService.removeSessionData('direct-url--BrowserState');
            this.cacheService.removeSessionData('first-time-BrowserState');
        }
        if (
            (event.ctrlKey && event.keyCode === 116) ||
            (event.ctrlKey && event.shiftKey && event.keyCode == 82)
        ) {
            window.sessionStorage.clear();
        }
        event.returnValue = true;
    }
    // handleIdleState(type, title, message, closeOpenedDialog, height, width, buttonDescriptions) {
    //     this.dialogConfig = this.dialogConfigService.getConfirmationDialogConfig(this.dialogConfig);
    //     this.dialogConfig.height = height;
    //     this.dialogConfig.width = width;
    //     this.dialogConfig.styleClass = 'session-dialog';
    //     this.dialogConfig.data = {
    //         type: type,
    //         message: message,
    //         title: title
    //     };
    //     if (buttonDescriptions['noButtonDescription']) {
    //         this.dialogConfig.data['noButtonDescription'] =
    //             buttonDescriptions['noButtonDescription'];
    //     }
    //     if (buttonDescriptions['yesButtonDescription']) {
    //         this.dialogConfig.data['yesButtonDescription'] =
    //             buttonDescriptions['yesButtonDescription'];
    //     }
    //     this.dialogConfig['closeOpenedDialog'] = closeOpenedDialog;
    //     return this.dialog.open(MWDialogContentComponent, this.dialogConfig);
    // }
    // timeoutTime = 2 * 60 * 60 * 1000; // 3 hours
    // timerForExpiry: any;
    // timerEventForExpiry: any;
    //previousActiveStateTime;
}
