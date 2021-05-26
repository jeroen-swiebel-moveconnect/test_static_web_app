import { Component, Input, OnInit } from '@angular/core';
import { StandardCodes } from '../../constants/StandardCodes';
import { StandardCodesIds } from '../../constants/StandardCodesIds';
import { CollectionsService } from '../../services';
import { Broadcaster } from '../../services/broadcaster';
import { CacheService } from '../../services/cache.service';
import { ContextService } from '../../services/context.service';
import { I18nService } from '../../services/i18n.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user-service';

export const SETTING_DETAILS_VIEW_ID = StandardCodesIds.SETTING_DETAILS_VIEW_ID;
export const SETTING_TYPE = StandardCodesIds.SETTING_TYPE; //  fieldoverride id
export const SETTING_FIELD = StandardCodesIds.SETTING_FIELD; //  Codevalue field id
export const ACTIVE_STATUS_ID = StandardCodesIds.ACTIVE_STATUS_ID;
export const SETTING_ID = 'SettingId';
@Component({
    selector: 'user-details-form',
    templateUrl: './user-details-form.component.html',
    styleUrls: ['./user-details-form.component.scss']
})
export class UserDetailsFormComponent implements OnInit {
    settingFields = [];
    currentSettingView: any;
    @Input() currentView;
    dataFields: any = {};

    constructor(
        private collectionService: CollectionsService,
        private cacheService: CacheService,
        private toastService: ToastService,
        private contextService: ContextService,
        private i18nService: I18nService,
        private broadcaster: Broadcaster,
        private userService: UserService
    ) {}

    ngOnInit() {
        this.getUserSettings();
    }

    //profile-update

    OnChanges() {}
    ApplySettings() {
        let requestObjectForBulkUpdate = [];
        let langSetting, regionSetting;
        for (let index = 0; index < this.settingFields.length; index++) {
            const element = this.settingFields[index];
            if (element && element['isDirty'] && element.CodeCode == StandardCodes.LANGUAGE) {
                langSetting = element;
            }
            if (element && element['isDirty'] && element.CodeCode == StandardCodes.REGION) {
                regionSetting = element;
            }
            if (element && element['isDirty'] && element.CodeCode == StandardCodes.TIMEZONE) {
                if (element.CodeValue && element.CodeValue.CodeCode) {
                    this.cacheService.setSessionData(
                        'TimeZone',
                        JSON.stringify({
                            CodeCode: 'Time Zone',
                            CodeValue: element.CodeValue.CodeCode
                        })
                    );
                } else {
                    this.cacheService.setSessionData(
                        'TimeZone',
                        JSON.stringify({
                            CodeCode: 'Time Zone',
                            CodeValue: Intl.DateTimeFormat().resolvedOptions().timeZone
                        })
                    );
                }
            }
            if (element['isDirty']) {
                if (element['SettingId']) {
                    requestObjectForBulkUpdate.push(this.buildUpdateReqObj(element));
                } else {
                    requestObjectForBulkUpdate.push(this.buildCreateReqObj(element));
                }
            }
        }
        if (langSetting || regionSetting) {
            this.i18nService.emitRegionChangeEvent(langSetting, regionSetting);
            this.contextService.removeDataChangeState();
        }
        if (requestObjectForBulkUpdate.length) {
            this.collectionService.multiChange(requestObjectForBulkUpdate).subscribe((response) => {
                this.toastService.addSuccessMessage('successfully updated');
            });
        } else {
            this.toastService.addWarningMessage('No changes made');
        }
        //after saving user-settings api is being called
        // this.getUserSettings();
    }

    buildCreateReqObj(field) {
        return {
            _id: field._id,
            type: 'Codes',
            meta: {
                userId: this.cacheService.getUserId()
            },
            relationships: [
                {
                    type: 'Settings',
                    meta: {
                        viewId: SETTING_DETAILS_VIEW_ID,
                        userId: this.cacheService.getUserId()
                    },
                    payload: {
                        SettingType: SETTING_TYPE,
                        AppliedTo: null,
                        SettingField: SETTING_FIELD,
                        SettingValue: field.CodeValue._id,
                        SettingRule: null,
                        SettingJSON: null,
                        SettingGroups: null,
                        SettingEntities: [this.cacheService.getCurrentUserId()],
                        SettingDescription: null,
                        SettingStatus: ACTIVE_STATUS_ID,
                        SettingNotes: null
                    }
                }
            ],
            userId: this.cacheService.getUserId()
        };
    }

    getUserSettings() {
        this.collectionService
            .getUserSettings(this.cacheService.getUserId())
            .subscribe(async (settingsData) => {
                this.settingFields = settingsData;
                for (const key in this.settingFields) {
                    this.dataFields[key['CodeCode']] = key['CodeValue'];
                }
            });
    }
    buildUpdateReqObj(field) {
        let settingId = field[SETTING_ID];
        return {
            type: 'Settings',
            _id: settingId,
            meta: {
                userId: this.cacheService.getUserId(),
                viewId: SETTING_DETAILS_VIEW_ID
            },
            payload: {
                SettingValue: field.CodeValue._id ? field.CodeValue._id : field.CodeValue
            }
        };
    }
}
