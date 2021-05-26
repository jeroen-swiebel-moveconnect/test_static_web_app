import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loadCldr } from '@syncfusion/ej2-base';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { MWDialogContentComponent } from '../components/mw-dialog/mw-dialog.component';
import { contextObj, ILanguage } from '../models';
import { CacheService } from './cache.service';
import { DialogConfigurationService } from './dialog-configuration.service';
import Utils from './utils';

@Injectable({
    providedIn: 'root'
})
export class ContextService {
    public contextRecord: any;
    private _prevViewSelector: string;
    private _previouslySelectedPage: string;
    currentContextField: any;
    private userLang: any;
    private selectedLanguage = {} as ILanguage;
    private rootViewMap: any = {};
    private designerViews: any = {};
    private viewSelectors: any = {};
    OverlayContainerIDs = [];
    private containerIDtoCodeCodeMapper: any = {};
    private containerCodeCodeToIDMapper: any = {};
    private containerParentMapper: any = {};
    private containers: any = {};
    // For now taking first 2 char of language for using en instead of en-US or en-UK
    constructor(
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private dialogConfigService: DialogConfigurationService,
        private cacheService: CacheService,

        private http: HttpClient
    ) {}
    /**
     * register language change event and load related cldr data
     */

    public setContextRecord(key, record) {
        if (!this.contextRecord) {
            this.contextRecord = {};
        }
        this.contextRecord[key] = record;
    }
    public clearContext() {
        this.contextRecord = {};
    }
    public getContextRecord(key) {
        if (this.contextRecord) {
            return this.contextRecord[key];
        } else {
            return null;
        }
    }
    public getViewSelectors(containerId) {
        return this.viewSelectors[containerId];
    }
    public setViewSelectors(containerId, selectors) {
        this.viewSelectors[containerId] = selectors;
    }
    public getDesignerViews(containerId) {
        return this.designerViews[containerId];
    }
    public setDesignerViews(containerId, views) {
        this.designerViews[containerId] = views;
    }
    /**
     * sets the context which helps to build translation context
     *
     * @param response : container data
     * @param isSubContainer : weather its a sub container or not
     * @param pageContainerData : detailed info of container including its parent
     */
    setTranslationContext(response, isSubContainer, pageContainerData) {
        this.containerIDtoCodeCodeMapper[response._id] =
            response['CodeCode'] + ' - ' + response._id;
        this.containerCodeCodeToIDMapper[response['CodeCode'] + ' - ' + response._id] =
            response.CodeCode;
        if (isSubContainer) {
            this.containerParentMapper[response.CodeCode + ' - ' + response._id] = {
                parentId: this.containerIDtoCodeCodeMapper[pageContainerData['containerID']]
            };
        } else {
            this.containerParentMapper[response.CodeCode + ' - ' + response._id] = {};
        }
        if (response['CodeDesigner'] && Utils.isArrayEmpty(response['CodeDesigner'])) {
            response['CodeDesigner'].forEach((element) => {
                if (element.CodeType === 'UI Container') {
                    this.containerParentMapper[response.CodeCode + ' - ' + response._id][
                        element.CodeCode + ' - ' + element.CodeElement
                    ] = { code: element.CodeCode, id: element.CodeElement };
                }
            });
        }
    }

    /**
     * gets the context key for translation
     *
     * @param currentContainerID : to which container context has to be build
     */
    getTranslationContextKey(currentContainerID) {
        let key;
        return this.buildTranslationContextKey(
            this.containerParentMapper[this.containerIDtoCodeCodeMapper[currentContainerID]],
            this.containerIDtoCodeCodeMapper[currentContainerID],
            this.containerParentMapper,
            key
        );
    }

    private getLanguageJsonsAndLoad(filesNames: any, path: string, isProduction: boolean) {
        return new Promise((resolve) => {
            filesNames.forEach((fileName) => {
                if (isProduction) {
                    this.http.get(path + fileName).subscribe((data) => {
                        loadCldr(data);
                        resolve('loaded');
                    });
                }
            });
        });
    }

    /**
     * Builds the context for translation which
     *
     * @param context : context to build for container
     * @param key : container key
     * @param conData : parent mapper for container
     * @param code : Translation ContextKey
     */
    buildTranslationContextKey(context: any, key, containerParentMapper, code) {
        if (code) {
            code = this.containerCodeCodeToIDMapper[key] + '.' + code;
        } else {
            code = this.containerCodeCodeToIDMapper[key];
        }
        if (context['parentId'] && containerParentMapper[context['parentId']]) {
            containerParentMapper[context['parentId']][key] = context;
        }
        return code;
    }

    public getParentContextDetails(key) {
        return this.getParentContext(this.getContextRecord(key));
    }
    private getParentContext(context) {
        let parentData;

        if (context) {
            if (context['child']) {
                parentData = this.getParentContext(context['child']);
            } else {
                parentData = {
                    parentId: context.parentId ? context.parentId : null,
                    parentDataObjectId: context.parentDataObjectId
                        ? context.parentDataObjectId
                        : null
                };
            }
        }
        return parentData;
    }
    public getPrevViewSelector(): any {
        return this._prevViewSelector;
    }
    public setPrevViewSelector(value: any) {
        this._prevViewSelector = value;
    }

    public getPreviouslySelectedPage(): string {
        return this._previouslySelectedPage;
    }
    public setPreviouslySelectedPage(value: string) {
        this._previouslySelectedPage = value;
    }
    public setRootViewMap(key, value) {
        this.rootViewMap[key] = value;
    }
    public getRootViewMap(key) {
        return this.rootViewMap[key];
    }
    removeContextByContainer(key, contanerID) {
        let context = this.getContextRecord(key + this.getRootViewMap(key));
        context = this.removeContext(context, contanerID, 'containerId');
        this.setContextRecord(key + this.getRootViewMap(key), context);
    }
    removeContextByParentContainer(key, page) {
        let context = this.getContextRecord(key + this.getRootViewMap(key));
        context = this.removeContextByLevel(context, page);
        this.setContextRecord(key + this.getRootViewMap(key), context);
    }
    removeContextByLevel(context, page) {
        if (
            context &&
            context.row === page.row &&
            context.column == page.column &&
            context.parentContainerId === page.immediateParentContainerID
        ) {
            context = null;
        } else if (context && context['criteria']) {
            context['criteria'] = this.removeContextByLevel(context['criteria'], page);
        }
        return context;
    }
    public saveDataChangeState() {
        this.cacheService.setSessionData('dataChange', 'true');
    }
    public removeDataChangeState() {
        this.cacheService.removeSessionData('dataChange');
    }
    public isDataChanged() {
        const dataChanged = this.cacheService.getSessionData('dataChange');
        if (dataChanged && dataChanged === 'true') {
            this.dialogConfig = this.dialogConfigService.getConfirmationDialogConfig(
                this.dialogConfig
            );
            this.dialogConfig.data = {
                type: 'confirm',
                message: StandardCodes.MESSAGES.UNSAVED_DATA_WARNING,
                title: 'Warning'
            };
            const dialogRef = this.dialog.open(MWDialogContentComponent, this.dialogConfig);
            return dialogRef.onClose;
        }
    }
    removeContextOnAdd(key, view) {
        let context = this.getContextRecord(key);
        context = this.removeContext(context, this.getCommunicationId(view), 'viewId');
        this.setContextRecord(key, context);
    }
    private removeContext(context, parentContanerID, property) {
        if (context && context[property] === parentContanerID) {
            context = null;
        } else if (context && context['criteria']) {
            context['criteria'] = this.removeContext(
                context['criteria'],
                parentContanerID,
                property
            );
        }
        return context;
    }

    defineContext(selectedRecord, view, page, containerId, parentPage) {
        let parentContainerId = page.parentContainerId;
        let contextKey = page.contextKey + view.communicationId;
        let currentContext = this.getContextRecord(
            page.contextKey + this.getRootViewMap(page.contextKey)
        );
        if (Utils.isObjectEmpty(currentContext)) {
            currentContext = this.createContext(
                selectedRecord,
                view,
                parentContainerId,
                page,
                parentPage
            );
        } else {
            currentContext = this.updateCurrentContext(
                currentContext,
                view,
                selectedRecord,
                parentContainerId,
                page,
                parentPage
            );
        }
        this.setContextRecord(contextKey, currentContext);
    }

    updateCurrentContext(context, view, record, parentContainerId, page, parentPage) {
        if (context && view) {
            if (
                view.baseViewCode === context['viewId'] ||
                this.getCommunicationId(view) === context['viewId'] ||
                page.containerID === context.containerId
            ) {
                context = this.createContext(record, view, parentContainerId, page, parentPage);
            } else if (context['criteria']) {
                context['criteria'] = this.updateCurrentContext(
                    context['criteria'],
                    view,
                    record,
                    parentContainerId,
                    page,
                    parentPage
                );
            } else {
                context['criteria'] = this.createContext(
                    record,
                    view,
                    parentContainerId,
                    page,
                    parentPage
                );
            }
            return context;
        }
    }

    public getCommunicationId(currentView) {
        if (currentView.CodeElement) {
            return currentView.CodeAlias ? currentView.CodeAlias : currentView.CodeElement;
        } else if (currentView.SettingViewId) {
            return currentView.SettingViewId;
        }
    }

    createContext(record, view, parentContainerId, currentPage, parentPage) {
        let contextObj: contextObj;
        let viewId = view.baseViewCode ? view.baseViewCode : this.getCommunicationId(view);
        if (view.CodeType != 'Data Form' || view.createContext) {
            contextObj = {
                id: record._id,
                dataObjectCodeCode: view.dataObjectCodeCode
                    ? view.dataObjectCodeCode
                    : view.CodeDataObject,
                viewId: viewId,
                containerId: currentPage.containerID,
                parentContainerId: currentPage.parentContainerId
            };
            if (parentPage) {
                contextObj['row'] = parentPage.row;
                contextObj['column'] = parentPage.column;
            } else {
                contextObj['row'] = 1;
                contextObj['column'] = 1;
            }
            return contextObj;
        }
    }
    getContiainer(id) {
        return this.containers[id];
    }
    set setContiainer(containerData) {
        this.containers[containerData._id] = containerData;
    }
}
