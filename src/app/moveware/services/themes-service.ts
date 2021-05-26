import { Injectable } from '@angular/core';
import { CollectionsService } from './collections.service';
import { Subject } from 'rxjs';
import { ToastService } from './toast.service';
import Utils from './utils';

@Injectable()
export class ThemesService {
    constructor(
        private collectionService: CollectionsService,
        private toastService: ToastService
    ) {}

    public applyTheme(theme) {
        if (theme) {
            let primaryColor = theme['Primary Color'];
            if (primaryColor) {
                document.documentElement.style.setProperty('--primary-color', primaryColor);
            }
            let secondaryColor = theme['Secondary Color'];
            if (secondaryColor) {
                document.documentElement.style.setProperty('--secondary-color', secondaryColor);
            }
            let headingFontColor = theme['Heading Font Color'];
            if (headingFontColor) {
                document.documentElement.style.setProperty(
                    '--primary-font-color',
                    headingFontColor
                );
            }
            let defaultFontColor = theme['Default Font Color'];
            if (defaultFontColor) {
                document.documentElement.style.setProperty('--font-color', defaultFontColor);
            }
            let menuBackground = theme['Menu Background Color'];
            if (menuBackground) {
                document.documentElement.style.setProperty('--menu-bg-color', menuBackground);
            }
            this.onThemeUpdate(theme['CodeLogo']);
        }
    }
    public applyThemeAndUpdate(theme, applyTheme) {
        var request = {
            type: '',
            _id: theme['_id'],
            meta: {
                collectionCode: 'codes',
                viewId: theme['viewId']
            },
            payload: {
                _id: theme['_id'],
                active: theme.active
            }
        };
        this.collectionService.updateCollectionItem(request).subscribe(
            async (response) => {
                if (applyTheme) {
                    this.applyTheme(theme);
                }
            },
            (errorResponse) => {
                this.toastService.showCustomToast('error', errorResponse);
            }
        );
    }

    public getThemesList(themeId) {
        return this.collectionService.getFullDetailsByModuleAndCollectionTypes(themeId);
    }

    protected themesSource = new Subject();
    public themeUpdateListner = this.themesSource.asObservable();
    private onThemeUpdate(data: any) {
        this.themesSource.next(Utils.getFileFullpath(data?._id));
    }
}
