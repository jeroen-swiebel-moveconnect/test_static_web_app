import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateComponent } from '../components/form-components/date/date.component';
import { StandardCodesIds } from '../constants/StandardCodesIds';
import { Broadcaster } from './broadcaster';
import { CacheService } from './cache.service';
import { CollectionsService } from './collections.service';
import { ContextService } from './context.service';
import { LoginService } from './login-service';
import { RequestHandler } from './RequestHandler';
import { ToastService } from './toast.service';

export const GROUPS_COLLECTIONS = 'entities';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    dateFormat = 'dd/mm/yy';
    timeFormat = 'HH:mm';
    userDetails: any;
    dateFormatWithProperCase: string;
    dateComponentInstance: DateComponent;
    private loggedInUser: any;

    constructor(
        private cacheService: CacheService,
        private collectionService: CollectionsService,
        private contextService: ContextService,
        private requestHandler: RequestHandler,
        private loginService: LoginService,
        private toastService: ToastService,
        private translateService: TranslateService,
        private broadcaster: Broadcaster,
        private http: HttpClient
    ) {}

    public getCurrentUserDetails() {
        return this.loggedInUser;
    }

    public fetchFilterViews(containerId: String) {
        if (!this.isObjectEmpty(this.userDetails)) {
            return this.collectionService.getFilterViews(this.userDetails._id, containerId);
        }
    }

    public getLoggedInUserDetails() {
        return this.userDetails;
    }

    public saveFilterView(view, dynamicAction, searchActionId) {
        const views = [];
        const entities = this.getGroupIdsSubArray(view.EntityGroup);

        if (!(entities && entities.length)) {
            entities.push(this.userDetails._id);
        }

        views.push(view);
        const addReqObj = {
            _id: view.SettingViewId,
            type: StandardCodesIds.DATAOBJECT_CODES_ID,
            meta: {
                userId: 'alok' // TODO: Needs review
            },
            relationships: [
                {
                    type: StandardCodesIds.DATAOBJECT_SETTINGS_ID,
                    meta: {
                        viewId: StandardCodesIds.FORM_CUSTOM_VIEW_ID
                    },
                    payload: {
                        SettingType: view.Type,
                        SettingDescription: view.SettingDescription,
                        SettingEntities: entities,
                        SettingViewId: view.SettingViewId,
                        SettingJSON: {
                            SetttingContainerId: view.SetttingContainerId,
                            SelectedFilters: view.SelectedFilters,
                            GroupBy: view.GroupBy,
                            SelectedColumns: view.SelectedColumns,
                            SelectedColumnFilters: view.SelectedColumnFilters
                        },
                        actionId: searchActionId
                    }
                }
            ]
        };

        return this.requestHandler.handleRequest(
            addReqObj,
            dynamicAction,
            undefined,
            undefined,
            true
        );
    }

    public editFilterView(fViews, filterView, source, destination, currentViewId, dynamicAction) {
        const entities = this.getGroupIdsSubArray(filterView.EntityGroup);
        if (!(entities && entities.length)) {
            entities.push(this.userDetails._id);
        }

        const updateReqObj = {
            _id: filterView.SettingViewId,
            type: StandardCodesIds.DATAOBJECT_CODES_ID,
            meta: {
                userId: 'alok' // TODO: Needs review
            },
            relationships: [
                {
                    _id: filterView.id,
                    type: StandardCodesIds.DATAOBJECT_SETTINGS_ID,
                    meta: {
                        viewId: StandardCodesIds.FORM_CUSTOM_VIEW_ID,
                        userId: this.getUserId()
                    },
                    payload: {
                        SettingDescription: filterView.SettingDescription,
                        SettingEntities: entities,
                        SettingJSON: {
                            SetttingContainerId: filterView.SettingJSON.SetttingContainerId,
                            SelectedColumnFilters: filterView.SettingJSON.SelectedColumnFilters,
                            GroupBy: filterView.SettingJSON.GroupBy,
                            SelectedColumns: filterView.SettingJSON.SelectedColumns,
                            SelectedFilters: filterView.SettingJSON.SelectedFilters
                        }
                    }
                }
            ]
        };

        return this.requestHandler.handleRequest(
            updateReqObj,
            dynamicAction,
            undefined,
            undefined,
            true
        );
    }

    /**
     * Returns the id of the logged in user or null if no user is currently logged in.
     */
    public getUserId() {
        if (localStorage.getItem('user')) {
            return JSON.parse(localStorage.getItem('user')).preferred_username;
        } else {
            return null;
        }
    }

    /**
     * Makes an api call to delete @filterView to delete.
     *
     * @param filterView
     */
    public deleteFilterView(filterView) {
        return this.collectionService.removeCollectionItem({
            _id: filterView._id,
            type: StandardCodesIds.DATAOBJECT_SETTINGS_ID,
            meta: {
                userId: 'alok' // TODO: Needs review
            }
        });
    }

    private isObjectEmpty(obj) {
        return !(obj && Object.keys(obj));
    }

    private getGroupIdsSubArray(groups) {
        const groupList = [];
        if (groups && groups.length > 0) {
            groups.forEach((element) => {
                groupList.push(element);
            });
        }

        return groupList;
    }
}
