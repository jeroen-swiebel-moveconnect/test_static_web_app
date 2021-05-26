import { Component } from '@angular/core';
import { ThemesService } from 'src/app/moveware/services/themes-service';
import { ToastService } from 'src/app/moveware/services/toast.service';

@Component({
    selector: '[app-footer]',
    templateUrl: './app-footer.component.html',
    styleUrls: ['./app-footer.component.scss']
})
export class AppFooterComponent {
    footerLogo: any;
    year: number;
    constructor(public themesService: ThemesService, private toastyMessageService: ToastService) {}
    ngOnInit() {
        this.getUpdatedTheme();
        this.year = new Date().getFullYear();
    }
    private getUpdatedTheme() {
        this.themesService.themeUpdateListner.subscribe(
            (data) => {
                this.footerLogo = data;
            },
            (errorResponse) => {
                this.toastyMessageService.showCustomToast('error', errorResponse);
            }
        );
    }
}
