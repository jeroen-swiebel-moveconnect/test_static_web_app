import { Component, Input } from '@angular/core';
import { ThemesService } from 'src/app/moveware/services/themes-service';
import { ToastService } from 'src/app/moveware/services/toast.service';

@Component({
    selector: 'mw-theme',
    templateUrl: './mw-themes.html',
    styleUrls: ['./mw-themes.component.scss']
})
export class MwThemesComponent {
    public themesList: any;
    private previousTheme: any;
    public activeTheme: any;
    showNotes: boolean;
    @Input() currentView: any;
    constructor(private themesService: ThemesService, private toastyMessageService: ToastService) {}
    ngOnInit() {
        // this.loadThemes();
    }
    // private loadThemes() {
    //   this.themesService.getThemesList().subscribe(
    //     async themes => {
    //       this.themesList = themes;
    //       let activeTheme = this.getActiveTheme(themes);
    //       this.previousTheme = activeTheme;
    //       this.activeTheme = activeTheme;
    //     }, errorResponse => {
    //       this.toastyMessageService.showCustomToast('error', errorResponse);
    //     });
    // }

    private getActiveTheme(themes) {
        return themes.filter((theme) => {
            return theme.active;
        })[0];
    }

    public onThemeChange(theme) {
        //make the theme as active and updated in DB
        theme.active = true;
        theme.viewId = this.currentView._id;
        this.themesService.applyThemeAndUpdate(theme, true);
        //make the previous theme as inactive and updated in DB
        this.previousTheme.active = false;
        this.previousTheme.viewId = this.currentView._id;
        this.themesService.applyThemeAndUpdate(this.previousTheme, false);
        //make current theme as previous theme for next time use
        this.previousTheme = JSON.parse(JSON.stringify(this.activeTheme));
    }
}
