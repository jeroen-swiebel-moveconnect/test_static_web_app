import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StandardCodes } from '../../constants/StandardCodes';
import { StandardCodesIds } from '../../constants/StandardCodesIds';
import { CollectionsService } from '../../services';
import { CacheService } from '../../services/cache.service';
import { I18nService } from '../../services/i18n.service';
import { ThemesService } from '../../services/themes-service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user-service';
import Utils from '../../services/utils';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'layout-wrapper',
    templateUrl: './layout.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./layout.scss']
})
export class LayoutComponent {
    // private selectedMenu:any={};
    public isThemeLoading: boolean = false;
    menuLayout: string;
    settingFields = [];

    constructor(
        private themesService: ThemesService,
        private translateService: TranslateService,
        private toastService: ToastService,
        private collectionService: CollectionsService,
        private cacheService: CacheService,
        private userService: UserService,
        private i18nService: I18nService
    ) {
        this.loadSettings();
        this.getMainContainer();

        this.isThemeLoading = true;
    }
    loadSettings() {
        this.collectionService
            .getUserSettings(this.cacheService.getUserId())
            .subscribe(async (settingsData) => {
                this.settingFields.push(settingsData);
                this.loadThemes(this.settingFields[0]);
                let regionData = Utils.getElementByProperty(settingsData, 'CodeCode', 'Region');
                let langData = Utils.getElementByProperty(settingsData, 'CodeCode', 'Language');
                let timeZone = Utils.getElementByProperty(settingsData, 'CodeCode', 'Time Zone');
                if (timeZone && timeZone['CodeValue']) {
                    this.cacheService.setSessionData(
                        'TimeZone',
                        JSON.stringify({
                            CodeCode: timeZone['CodeCode'],
                            CodeValue: timeZone['CodeValue']?.CodeCode,
                            CodeDescription: timeZone['CodeDescription']
                        })
                    );
                } else {
                    this.cacheService.setSessionData(
                        'TimeZone',
                        JSON.stringify({
                            CodeCode: 'Time Zone',
                            CodeValue: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            CodeDescription: 'Time Zone'
                        })
                    );
                }

                this.i18nService.emitRegionChangeEvent(langData, regionData, true);
                this.cacheService.setLocalData('user-settings', JSON.stringify(settingsData));
                this.setMenuBarLayout(this.settingFields[0]);
                //this.translateService.setDefaultLang('en');
            });
    }
    private getMainContainer() {
        let mainContainerId = StandardCodesIds.MAIN_CONTAINER_ID;
        this.collectionService.getContainer(mainContainerId).subscribe(
            (response) => {
                this.cacheService.setSessionData('mainContainer', JSON.stringify(response));
            },
            (errorResponse) => {
                this.toastService.showCustomToast('error', errorResponse);
            }
        );
    }
    setMenuBarLayout(fields: any) {
        for (let index = 0; index < fields.length; index++) {
            const field = fields[index];
            if (field['CodeCode'] == 'Menu Layout') {
                this.menuLayout = field['CodeValue']['CodeCode'];
                break;
            }
        }
        if (!this.menuLayout) {
            this.menuLayout = 'Vertical';
        }
    }

    private loadThemes(settingField) {
        this.themesService.getThemesList(this.getActiveThemeId(settingField)).subscribe(
            async (themes) => {
                this.isThemeLoading = false;
                this.themesService.applyTheme(themes);
            },
            (errorResponse) => {
                this.isThemeLoading = false;
                this.toastService.addErrorMessage(StandardCodes.EVENTS.SYSTEM_ERROR_OCCURRED);
            }
        );
    }

    private getActiveThemeId(settingFields) {
        let themeId;
        settingFields.forEach((element) => {
            if (element.CodeCode === 'Theme') {
                themeId = element.CodeValue._id;
            }
        });
        return themeId;
    }
    private getActiveTheme(themes) {
        return themes.filter((theme) => {
            return theme.active;
        })[0];
    }
}
