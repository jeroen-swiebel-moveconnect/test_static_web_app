import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { L10n, loadCldr, setCulture } from '@syncfusion/ej2-base';
import { environment, i18nFiles } from '../../../environments/environment';
import { Broadcaster } from './broadcaster';
import { CacheService } from './cache.service';
import Utils from './utils';

@Injectable()
export class I18nService {
    constructor(
        private translateService: TranslateService,
        private http: HttpClient,
        private cacheService: CacheService,
        private broadcaster: Broadcaster
    ) {}

    /**
     * to process the language based translations and  region based formatting and represtation of date, nu,bers, currency etc.
     * @param langSetting : language setting
     * @param regionSetting : region setting
     * @param isOnLoad : flag to determine weathers its onload call or not
     */
    public emitRegionChangeEvent(langSetting, regionSetting, isOnLoad?: boolean) {
        const lang = this.extractLangIfNotGetDefault(langSetting);
        const region = this.extractLangIfNotGetDefault(regionSetting);
        this.updateLangCache(langSetting, lang);
        this.translateService.use(lang.replace('-', '_'));
        const langCopy = Utils.getCopy(lang);
        this.loadData(lang, langCopy, region, isOnLoad);
    }
    /**
     * to load the translations , setting the culture and loading cldr data
     * @param lang : language code
     * @param langCopy : o=copy of language code
     * @param region : region code
     * @param isOnload : boolean to determine weather its onload call or not
     */
    loadData(lang: string, langCopy, region, isOnload: boolean) {
        this.setAndLoadCulture(lang, region)
            .then((_) => {
                this.cacheService.setSessionData('Region', region);
                this.loadCLDR(region, isOnload);
            })
            .catch((_) => {
                if (lang.match(/-/)) {
                    this.loadData(lang.split('-')[0], langCopy, region, isOnload);
                } else {
                    if (lang !== 'en' && lang !== 'en-US') {
                        this.loadData('en-US', langCopy, region, isOnload);
                    } else {
                        this.cacheService.setSessionData('Region', region);
                        this.loadCLDR(region, isOnload);
                    }
                }
            });
    }

    /**
     * to load the syncfusion internal component's translation and setting the culture
     * @param lang : language code
     * @param region : region to be set
     * @returns : observable promise
     */
    private setAndLoadCulture(lang: string, region) {
        return new Promise((resolve, reject) => {
            if (environment.production) {
                this.http.get(environment.I18N_ROOT + '/' + lang + '.json').subscribe(
                    (data) => {
                        data[region] = Utils.getCopy(data[lang]);
                        delete data[lang];
                        data[region]['pivotview']['undefined'] = 'Unknown';
                        data[region]['pivotview']['null'] = 'Unknown';
                        L10n.load(data);
                        setCulture(region);
                        resolve('loaded successfully');
                    },
                    (_) => {
                        reject();
                    }
                );
            } else {
                // let data = require('@syncfusion/ej2-locale/src/' + lang + '.json');
                // data[region] = Utils.getCopy(data[lang]);
                // delete data[lang];
                // data[region]['pivotview']['undefined'] = 'Unknown';
                // data[region]['pivotview']['null'] = 'Unknown';
                // L10n.load(data);
                setCulture(region);
                resolve('loaded successfully');
            }
        });
    }

    /**
     * to update the language related cache in the browser
     * @param element : data to store
     * @param lang : changed language code
     */
    private updateLangCache(element: any, lang: any) {
        let langData = {};
        if (element) {
            langData = Utils.getCopy(element);
        }

        langData['CodeCode'] = lang;
        this.cacheService.setSessionData('language', JSON.stringify(langData));
    }

    private extractLangIfNotGetDefault(element: any) {
        let lang = 'en';
        if (element && element['CodeValue'] && element['CodeValue']['CodeCode']) {
            lang = Utils.getFormatedLangCode(element['CodeValue']['CodeCode']);
        }

        return lang;
    }

    /**
     *
     * @param lang : language code
     * @param isOnLoad : is onLoad call
     */
    loadCLDR(lang: string, isOnLoad: boolean) {
        this.loadCLDRData(lang)
            .then((data) => {
                if (!isOnLoad) {
                    this.broadcaster.broadcast('languageChangeAfterCLDRdataLoaded', lang);
                }
            })
            .catch((data) => {
                if (lang.match(/-/)) {
                    this.loadCLDR(lang.split('-')[0], isOnLoad);
                } else {
                    if (lang !== 'en') {
                        this.loadCLDR('en', isOnLoad);
                    }
                }
            });
    }
    /**
     * load related cldr data for locale language
     * @param languageCode : locale language code
     */
    private loadCLDRData(languageCode) {
        return new Promise((resolve, reject) => {
            if (environment.production) {
                i18nFiles.common.forEach((fileName) => {
                    this.http.get(environment.I18N_ROOT + '/' + fileName).subscribe(
                        (data) => {
                            loadCldr(data);
                        },
                        (error) => {
                            reject();
                        }
                    );
                });
                i18nFiles.LangBased.forEach((fileName) => {
                    this.http
                        .get(environment.I18N_ROOT + '/' + languageCode + '/' + fileName)
                        .subscribe(
                            (data) => {
                                loadCldr(data);
                                resolve('loaded succesfully');
                            },
                            (error) => {
                                reject();
                            }
                        );
                });
            } else {
                // loadCldr(require('cldr-data/supplemental/' + i18nFiles.common[0]));
                // loadCldr(require('cldr-data/supplemental/' + i18nFiles.common[1]));
                // loadCldr(require('cldr-data/supplemental/' + i18nFiles.common[2]));
                // loadCldr(require('cldr-data/main/' + languageCode + '/' + i18nFiles.LangBased[0]));
                // loadCldr(require('cldr-data/main/' + languageCode + '/' + i18nFiles.LangBased[1]));
                // loadCldr(require('cldr-data/main/' + languageCode + '/' + i18nFiles.LangBased[2]));
                // loadCldr(require('cldr-data/main/' + languageCode + '/' + i18nFiles.LangBased[3]));
                resolve('loaded succesfully');
            }
        });
    }
}
