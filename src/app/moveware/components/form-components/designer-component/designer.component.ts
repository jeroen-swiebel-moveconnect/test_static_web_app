import {
    Component,
    OnInit,
    ViewChild,
    TemplateRef,
    Input,
    SimpleChange,
    SimpleChanges
} from '@angular/core';
import { CollectionsService, RequestHandler } from 'src/app/moveware/services';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { ToastService } from 'src/app/moveware/services/toast.service';
import Utils from 'src/app/moveware/services/utils';
import { ContextService } from 'src/app/moveware/services/context.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { GridType, CompactType, DisplayGrid } from 'angular-gridster2';
import { UserService } from 'src/app/moveware/services/user-service';
import { MenuItem } from 'primeng/api';
import { DesignerService } from 'src/app/moveware/services/designer.service';
import { GridService } from 'src/app/moveware/services/grid-service';

@Component({
    selector: 'app-designer',
    templateUrl: './designer.component.html',
    styleUrls: ['./designer.component.scss']
})
export class DesignerComponent implements OnInit {
    @Input() currentRecord: any;
    @Input() currentPage: any;
    @Input() parentViewID: String;
    @Input() currentContainerID: string;
    @Input() parentPage: any;
    @Input() viewList: any;
    private parentRecord: any;
    isLeftPaneCollapsed: boolean = true;
    scrollbarOptions: any;
    isDesignMode: boolean = true;
    isNested: boolean = false;
    currentView: any;
    private childUpdateEvent: any;
    private childCreateEvent: any;
    private specificOptions: any;
    viewMode: string = StandardCodes.VIEW_UPDATE_MODE;
    restrictData: boolean = true;
    selectedItem: any;
    items: MenuItem[];
    constructor(
        private messages: ToastService,
        private gridService: GridService,
        private collectionsService: CollectionsService,
        private contextService: ContextService,
        private broadcaster: Broadcaster,
        private actionService: UIActionService,
        private userService: UserService,
        private requestHandler: RequestHandler,
        private designerService: DesignerService
    ) {}
    UIElements: any;
    UIElementsMetaData: any;
    designerType: String;
    getRootParent(currentRecord) {
        if (currentRecord.parentRecord && !Utils.isObjectEmpty(currentRecord.parentRecord)) {
            return this.getRootParent(currentRecord.parentRecord);
        } else {
            return currentRecord;
        }
    }
    ngOnInit() {
        this.parentRecord = Utils.getCopy(this.currentRecord);
        let currentType = this.getRootParent(this.currentRecord)?.CodeType?.CodeCode; // this.currentRecord.parentRecord ? this.currentRecord.parentRecord.CodeType: this.currentRecord.CodeType
        if (currentType == StandardCodes.CODE_TYPE_DASHBOARD) {
            this.designerType = StandardCodes.CODE_TYPE_DASHBOARD;
            this.getDataFomrs();
            this.getCalendarsLists();
            this.getDataGrids();
            this.getDataTrees();
            this.getDataLists();
            this.getDataKanban();
            this.getDataPivot();
            this.getDataSchedule();
            this.getDataGantt();
            this.getDataCard();
            this.getTaskBars();
            this.getUIContainers();
            this.setScrollbarOptions();
            this.specificOptions = {
                margin: 8,
                minItemRows: 1,
                minItemCols: 1,
                fixedRowHeight: 30,
                maxRows: 100,
                maxCols: 9,
                fixedColWidth: 200,
                compactType: CompactType.CompactUp,
                swap: false,
                pushDirections: { north: false, east: false, south: true, west: false }
            };
        } else if (currentType == StandardCodes.CODE_TYPE_DATA_FORM) {
            this.designerType = StandardCodes.CODE_TYPE_DATA_FORM;
            this.getTasks();
            this.getTaskBars();
            this.getUIComponents();
            this.specificOptions = {
                margin: 2,
                minItemRows: 3,
                minItemCols: 1,
                fixedRowHeight: 10,
                pushDirections: { north: false, east: false, south: true, west: false },
                compactType: CompactType.CompactUp,
                maxRows: 200,
                maxCols: 15,
                swap: false
            };
        } else if (currentType == StandardCodes.DATA_GRID || StandardCodes.DATA_TREE) {
            this.designerType = StandardCodes.DATA_GRID
                ? StandardCodes.DATA_GRID
                : StandardCodes.DATA_TREE;
            // this.getButtonBars();
            this.specificOptions = {
                margin: 2,
                minItemRows: 3,
                minItemCols: 1,
                fixedRowHeight: 10,
                compactType: CompactType.CompactUpAndLeft,
                maxRows: 3,
                maxCols: 50,
                fixedColWidth: 30,
                swap: true,
                pushDirections: { north: true, east: true, south: true, west: true }
            };
        } else if (this.currentRecord.CodeType == StandardCodes.DATA_LIST) {
            this.designerType = StandardCodes.DATA_LIST;
            // this.getButtonBars();
            this.specificOptions = {
                margin: 1,
                outerMargin: false,
                minItemRows: 3,
                minItemCols: 1,
                fixedRowHeight: 10,
                maxRows: 30,
                maxCols: 10,
                fixedColWidth: 30,
                compactType: CompactType.CompactUp,
                swap: true,
                pushDirections: { north: true, east: true, south: true, west: true }
            };
        }
        this.setGridsterOptions();
        this.getComponents(this.currentPage.CodeElement);
        this.registerChildCreateEvent();
        this.registerUpdateEvent();
    }
    ngOnChanges(changes: SimpleChanges) {
        if (
            changes['viewList'] &&
            !changes['viewList'].isFirstChange() &&
            changes['viewList'] &&
            changes['viewList'].previousValue !== changes['viewList'].currentValue
        ) {
            this.components = [];
            !this.isDesignMode && this.changeMode(true);
            this.selectedItem = null;
            this.getComponents(this.currentPage.CodeElement);
        }
    }

    formsList: Array<any>;
    gridsList: Array<any>;
    treesList: Array<any>;
    dataLists: Array<any>;
    pivotLists: Array<any>;
    kanbanLists: Array<any>;
    scheduleLists: Array<any>;
    cardLists: Array<any>;
    ganttLists: Array<any>;
    UIContainers: Array<any>;
    calendarsList: Array<any>;
    fieldsList: Array<any>;
    taskBarsList: Array<any>;
    tasksList: Array<any>;
    uiComponentsList: Array<any>;
    private getFields(dataObject) {
        this.collectionsService.getFields(dataObject).subscribe(async (response) => {
            this.fieldsList = response.data;
        });
    }
    private getTaskBars() {
        this.collectionsService
            .loadCodes(StandardCodes.CODE_TYPE_TASK_BAR)
            .subscribe(async (response) => {
                this.taskBarsList = response;
            });
    }
    private getUIComponents() {
        this.collectionsService
            .loadCodes(StandardCodes.CODE_TYPE_UI_COMPONENT)
            .subscribe(async (response) => {
                this.uiComponentsList = response;
            });
    }
    private getTasks() {
        this.collectionsService.loadCodes(StandardCodes.TASK_CODE).subscribe(async (response) => {
            this.tasksList = response;
        });
    }
    private getDataFomrs() {
        this.collectionsService
            .loadCodes(StandardCodes.CODE_TYPE_DATA_FORM)
            .subscribe(async (response) => {
                this.formsList = response;
                // this.isFiltersAvailable = true;
            });
    }
    private setScrollbarOptions() {
        this.scrollbarOptions = {
            theme: 'dark-thick',
            autoHideScrollbar: true,
            scrollButtons: { enable: true },
            advanced: { updateOnContentResize: true }
        };
    }
    isLeftPaneLoaded() {
        return (
            (this.formsList && this.formsList.length) ||
            (this.gridsList && this.gridsList.length) ||
            (this.dataLists && this.dataLists.length) ||
            (this.calendarsList && this.calendarsList.length)
        );
    }

    private getDataGrids() {
        this.collectionsService.loadCodes(StandardCodes.DATA_GRID).subscribe(async (response) => {
            this.gridsList = response;
        });
    }
    private getDataTrees() {
        this.collectionsService.loadCodes(StandardCodes.DATA_TREE).subscribe(async (response) => {
            this.treesList = response;
        });
    }
    private getDataLists() {
        this.collectionsService.loadCodes(StandardCodes.DATA_LIST).subscribe(async (response) => {
            this.dataLists = response;
        });
    }
    private getDataKanban() {
        this.collectionsService.loadCodes(StandardCodes.DATA_KANBAN).subscribe(async (response) => {
            this.kanbanLists = response;
        });
    }
    private getDataCard() {
        this.collectionsService.loadCodes(StandardCodes.DATA_CARD).subscribe(async (response) => {
            this.cardLists = response;
        });
    }
    private getDataGantt() {
        this.collectionsService.loadCodes(StandardCodes.DATA_GANTT).subscribe(async (response) => {
            this.ganttLists = response;
        });
    }
    private getDataSchedule() {
        this.collectionsService
            .loadCodes(StandardCodes.DATA_SCHEDULE)
            .subscribe(async (response) => {
                this.scheduleLists = response;
            });
    }
    private getDataPivot() {
        this.collectionsService.loadCodes(StandardCodes.DATA_PIVOT).subscribe(async (response) => {
            this.pivotLists = response;
        });
    }

    private getUIContainers() {
        this.collectionsService
            .loadCodes(StandardCodes.CODE_TYPE_UI_CONTAINER)
            .subscribe(async (response) => {
                this.UIContainers = response;
            });
    }
    private getCalendarsLists() {
        this.collectionsService
            .loadCodes(StandardCodes.CODE_TYPE_DATA_CALENDAR)
            .subscribe(async (response) => {
                this.calendarsList = response;
            });
    }
    onDrag(event, item) {
        let data = JSON.stringify(item);
        event.dataTransfer.setData('item', data);
    }
    dropToAdd(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.setupDesignerItemToAdd(ev);
    }

    dropToAddIntoNestedGridster(event, parent) {
        event.preventDefault();
        event.stopPropagation();
        this.setupDesignerItemToAdd(event, parent);
    }
    setupDesignerItemToAdd(event, parent?) {
        let item = event.dataTransfer.getData('item');
        this.contextService.removeContextOnAdd(
            this.currentPage.contextKey +
                this.contextService.getRootViewMap(this.currentPage.contextKey),
            this.currentView
        );
        let data = JSON.parse(item);
        if (!this.components) {
            this.components = [];
        }
        let index = this.designerService.getIndexByComponent(parent, this.components);

        data.x = 0;
        data.y = index;
        data.cols = this.specificOptions['minItemCols'];
        data.rows = this.specificOptions['minItemRows'];

        let payload = {
            CodeType: data.CodeType._id,
            CodeCode: data.CodeCode,
            CodeDescription: data.CodeDescription,
            CodeColumn: 0,
            CodeRow: index,
            CodeColumns: this.specificOptions['minItemCols'],
            CodeRows: this.specificOptions['minItemRows']
        };
        if (
            this.designerType === StandardCodes.CODE_TYPE_DATA_FORM ||
            this.designerType === StandardCodes.DATA_GRID ||
            this.designerType === StandardCodes.DATA_TREE ||
            this.designerType == StandardCodes.DATA_LIST
        ) {
            payload['CodeElement'] = data._id;
        } else {
            payload['CodeElement'] = data._id;
            data['CodeElement'] = data._id;
        }
        if (parent) {
            this.addItemToDesigner(data, payload, parent);
        } else {
            this.addItemToDesigner(data, payload);
        }
    }

    allowDrop(ev) {
        ev.preventDefault();
    }
    components = [];
    options: any;
    taskBarOptions: any;

    private setGridsterOptions() {
        this.options = {
            gridType: GridType.VerticalFixed,
            compactType: this.specificOptions['compactType'],
            margin: this.specificOptions['margin'],
            outerMargin: true,
            pushing: true,
            outerMarginTop: null,
            outerMarginRight: null,
            outerMarginBottom: null,
            disableWindoResize: false,
            outerMarginLeft: null,
            useTransformPositioning: true,
            mobileBreakpoint: 100,
            minCols: 1,
            maxCols: this.specificOptions['maxCols'],
            minRows: 1,
            maxRows: this.specificOptions['maxRows'],
            maxItemCols: 100,
            minItemCols: 1,
            maxItemRows: this.specificOptions['maxRows'],
            minItemRows: this.specificOptions['minItemRows'],
            maxItemArea: 500,
            minItemArea: 1,
            defaultItemCols: 1,
            defaultItemRows: 1,
            fixedColWidth: this.specificOptions['fixedColWidth'],
            fixedRowHeight: this.specificOptions['fixedRowHeight'],
            keepFixedHeightInMobile: false,
            keepFixedWidthInMobile: false,
            scrollSensitivity: 10,
            scrollSpeed: 20,
            enableEmptyCellClick: false,
            enableEmptyCellContextMenu: false,
            enableEmptyCellDrop: false,
            enableEmptyCellDrag: false,
            enableOccupiedCellDrop: false,
            emptyCellDragMaxCols: 50,
            emptyCellDragMaxRows: 50,
            ignoreMarginInRow: false,
            draggable: {
                enabled: this.isDesignMode,
                start: this.setSelectedItem.bind(this)
            },
            resizable: {
                enabled: this.isDesignMode,
                start: this.setSelectedItem.bind(this)
            },
            //itemResizeCallback: this.setSelectedItem.bind(this),
            // resizableCallback: this.setSelectedItem.bind(this),

            swap: this.specificOptions['swap'],
            pushItems: true,
            disablePushOnDrag: false,
            disablePushOnResize: false,
            pushDirections: this.specificOptions['pushDirections'],
            pushResizeItems: true,
            displayGrid: DisplayGrid.OnDragAndResize,
            disableWindowResize: false,
            disableWarnings: false,
            scrollToNewItems: false
        };
        this.taskBarOptions = Object.assign({}, this.options);
        this.taskBarOptions['fixedColWidth'] = 50;
        this.taskBarOptions['gridType'] = GridType.Fixed;
        this.taskBarOptions['compactType'] = CompactType.None;
    }

    setSelectedItem(event) {
        this.contextService.saveDataChangeState();
        this.selectedItem = Utils.getCopy(event);
    }
    changeMode(mode) {
        this.isDesignMode = mode;
        this.options.draggable.enabled = mode;
        this.options.resizable.enabled = mode;
        this.options.api?.optionsChanged();
        if (mode) {
            this.broadcaster.broadcast(
                'removePage' + this.currentContainerID,
                this.currentContainerID
            );
            this.components.forEach((component) => {
                component['isSelected'] = false;
            });
        } else {
            this.editItem(this.selectedItem, false);
        }
    }
    editItem(item, isChild) {
        if (!item) {
            item = this.components.find((element) => {
                if (element.CodeColumn === 0 && element.CodeRow === 0) {
                    return element;
                }
            });
            if (!item) {
                item = this.components.find((element) => {
                    if (element.CodeRow === 0) {
                        return element;
                    }
                });
                if (!item) {
                    item = this.components[0];
                }
            }
        }
        if (this.isDesignMode) {
            return false;
        }
        if (this.isNested) {
            this.isNested = false;
            return false;
        }
        Utils.removeSelectedGridsterItemClass();
        item.mode = StandardCodes.VIEW_UPDATE_MODE;
        if (!isChild) {
            this.components.forEach((component) => {
                if (component._id === item._id) {
                    component['isSelected'] = true;
                } else {
                    component['isSelected'] = false;
                }
            });
        } else {
            item.isSelected = item.isSelected ? !item.isSelected : true;
        }
        this.broadcastEditEvent(item);
    }

    editItemInNestedGridster(item, parent) {
        if (this.isDesignMode) {
            return false;
        }
        Utils.removeSelectedGridsterItemClass();
        this.isNested = true;
        item.mode = StandardCodes.VIEW_UPDATE_MODE;
        if (
            parent.CodeType === StandardCodes.CODE_TYPE_UI_COMPONENT &&
            !Utils.isArrayEmpty(parent.Children)
        ) {
            parent.Children.forEach((child) => {
                if (child === item._id) {
                    this.UIElements[child]['isSelected'] = true;
                } else {
                    this.UIElements[child]['isSelected'] = false;
                }
            });
        } else if (
            parent.CodeCode === StandardCodes.CODE_TYPE_DATA_FORM &&
            !Utils.isArrayEmpty(parent.CodeDesigner)
        ) {
            parent.CodeDesigner.forEach((task) => {
                if (task._id === item._id) {
                    task['isSelected'] = true;
                } else {
                    task['isSelected'] = false;
                }
            });
        }
        this.broadcastEditEvent(item);
    }

    broadcastEditEvent(designerItem) {
        let eventData = {
            eventType: 'DISPLAY_CHILDREN',
            data: designerItem,
            parent: this.currentPage.CodeElement,
            mode: StandardCodes.VIEW_UPDATE_MODE,
            isDesigner: true
        };
        if (!Utils.isObjectEmpty(this.parentRecord)) {
            eventData['parentRecord'] = this.parentRecord;
        }
        this.contextService.defineContext(
            designerItem,
            this.currentView,
            this.currentPage,
            this.currentContainerID,
            this.parentPage
        );
        this.selectedItem = Utils.getCopy(designerItem);
        this.broadcaster.broadcast(
            this.currentPage.containerID + this.currentPage.CodeElement,
            eventData
        );
    }

    addItemToDesigner(designerItem, payload, parentComponent?) {
        let context = this.contextService.getContextRecord(
            this.currentPage.contextKey +
                this.contextService.getRootViewMap(this.currentPage.contextKey)
        );
        let request = this.designerService.getRequestObj(payload, context, this.currentPage);
        this.collectionsService.addCollectionItem(request).subscribe((responseData) => {
            this.messages.addSuccessMessage('Record added successifully');
            if (designerItem.CodeType === StandardCodes.CODE_TYPE_UI_CONTAINER) {
                designerItem['CodeElement'] = designerItem._id;
            }
            designerItem._id = JSON.parse(responseData.body).id;
            designerItem.CodeType = designerItem.CodeType.CodeCode;
            if (
                this.designerType === StandardCodes.CODE_TYPE_DATA_FORM &&
                designerItem.CodeType !== StandardCodes.TASK_CODE &&
                designerItem.CodeType !== StandardCodes.CODE_TYPE_TASK_BAR &&
                designerItem.CodeType !== StandardCodes.CODE_TYPE_UI_COMPONENT
            ) {
                designerItem.CodeFieldType.CodeCode = designerItem.CodeFieldType.CodeCode;
            }
            if (designerItem.CodeType === StandardCodes.CODE_TYPE_UI_COMPONENT) {
                designerItem['CodeElement'] = designerItem.CodeCode;
            }
            // this.selectedItem = Utils.getCopy(designerItem);
            if (parentComponent) {
                this.addItemToNestedDesigner(parentComponent, designerItem);
            } else {
                this.components.push(designerItem);
            }
            designerItem.mode = StandardCodes.VIEW_UPDATE_MODE;
        });
    }

    private addItemToNestedDesigner(parentComponent, designerItem) {
        if (parentComponent.CodeType === StandardCodes.CODE_TYPE_UI_COMPONENT) {
            if (!Utils.isArrayEmpty(parentComponent.Children)) {
                parentComponent.Children.push(designerItem._id);
            } else {
                parentComponent.Children = [];
                parentComponent.Children.push(designerItem._id);
            }
            let childPayload = {
                Children: parentComponent.Children,
                _id: parentComponent._id
            };
            let context = this.contextService.getContextRecord(
                this.currentPage.contextKey +
                    this.contextService.getRootViewMap(this.currentPage.contextKey)
            );
            context['criteria'] = {
                dataObjectCodeCode: 'CodeDesigner',
                id: parentComponent._id
            };
            let req = {};
            req = this.designerService.getUpdateNewReqObj(req, context);
            let requestObj = this.designerService.getUpdateNestedReq(
                req,
                context,
                childPayload,
                this.currentView
            );
            let dynamicAction = {
                JSONParameter: {
                    displayModes: ['VIEW_UPDATE_MODE'],
                    requestMethod: 'PUT',
                    targetAPI: 'framework-command/objects'
                }
            };
            this.requestHandler
                .handleRequest(requestObj, dynamicAction, undefined, undefined, true)
                .subscribe((response) => {
                    let id = designerItem['_id'];
                    this.UIElements[id] = designerItem;
                });
        } else if (parentComponent.CodeType === StandardCodes.CODE_TYPE_TASK_BAR) {
            this.components.forEach((component) => {
                if (component._id === parentComponent._id) {
                    if (!Utils.isArrayEmpty(component.CodeDesigner)) {
                        component.CodeDesigner.push(designerItem);
                    }
                }
            });
        }
    }

    updateLayout(event) {
        let userId = this.userService.getUserId();
        let reqOBJ = [];
        this.components.forEach((element) => {
            if (
                (element.CodeType === StandardCodes.CODE_TYPE_DATA_FORM && !element.CodeAlias) ||
                true
            ) {
                this.designerService.getRequestObjForLayoutUpdate(
                    reqOBJ,
                    element,
                    userId,
                    this.currentRecord
                );
            }
            if (element.CodeType === StandardCodes.CODE_TYPE_UI_COMPONENT) {
                if (!Utils.isArrayEmpty(element.Children)) {
                    element.Children.forEach((child) => {
                        this.designerService.getRequestObjForLayoutUpdate(
                            reqOBJ,
                            this.UIElements[child],
                            userId,
                            this.currentRecord
                        );
                    });
                }
            }
            if (element.CodeType === StandardCodes.CODE_TYPE_TASK_BAR) {
                if (!Utils.isArrayEmpty(element.CodeDesigner)) {
                    element.CodeDesigner.forEach((task) => {
                        this.designerService.getRequestObjForLayoutUpdate(
                            reqOBJ,
                            task,
                            userId,
                            this.currentRecord
                        );
                    });
                }
            }
        });
        this.collectionsService.multiChange(reqOBJ).subscribe(() => {
            this.contextService.removeDataChangeState();
            this.messages.addSuccessMessage('Layout updated successifully');
        });
    }
    isLoading: boolean;
    private getDesignerDetails() {
        if (
            this.designerType == StandardCodes.CODE_TYPE_DATA_FORM ||
            this.designerType == StandardCodes.DATA_GRID ||
            this.designerType == StandardCodes.DATA_TREE ||
            this.designerType == StandardCodes.DATA_LIST
        ) {
            return this.collectionsService.loadContainerViewByCode(this.currentRecord._id, null);
        } else if (this.designerType == StandardCodes.CODE_TYPE_DASHBOARD) {
            return this.collectionsService.getContainer(this.currentRecord._id);
        }
    }

    private getComponents(id: any) {
        this.collectionsService.getGridMetaData(id).subscribe(async (metaData) => {
            this.components = [];
            this.currentView = metaData;
            this.currentView['communicationId'] = this.gridService.getCommunicationId(
                this.currentView
            );
            if (!this.currentPage.parentContainerId) {
                this.contextService.setRootViewMap(
                    this.currentPage.contextKey,
                    this.currentView['communicationId']
                );
            }
            this.isLoading = true;
            this.registerChildDeleteEvent();
            this.getDesignerDetails().subscribe(
                async (responseData) => {
                    this.isLoading = false;
                    this.components = [];
                    if (
                        this.designerType == StandardCodes.CODE_TYPE_DATA_FORM ||
                        this.designerType == StandardCodes.DATA_GRID ||
                        this.designerType == StandardCodes.DATA_TREE ||
                        this.designerType == StandardCodes.DATA_LIST
                    ) {
                        this.getFields(responseData.CodeDataObject);
                        this.setFieldsProps(
                            responseData.UIElementsMetaData,
                            responseData.UIElements
                        );
                    } else if (this.designerType == StandardCodes.CODE_TYPE_DASHBOARD) {
                        let pagesMap = Utils.getPagesMap(responseData.Pages);
                        let views = Utils.processAliases(pagesMap);
                        this.setDashboardElemetProps(views, responseData.TaskBars);
                    }
                },
                (errorResponse) => {
                    this.isLoading = false;
                }
            );
        });
    }

    private setFieldsProps(UIElementsMetaData, UIElements) {
        let _components = [];
        let taskComponents = [];
        this.UIElementsMetaData = UIElementsMetaData;
        this.UIElements = UIElements;
        UIElementsMetaData.forEach((element, index) => {
            let component = UIElements[element._id];
            if (
                component.CodeType === StandardCodes.CODE_TYPE_TASK_BAR &&
                (this.designerType == StandardCodes.DATA_LIST ||
                    this.designerType == StandardCodes.DATA_GRID ||
                    this.designerType == StandardCodes.DATA_TREE)
            ) {
                return;
            }
            if (component.CodeType === StandardCodes.CODE_TYPE_UI_COMPONENT) {
                if (component.CodeCode === StandardCodes.BACKGROUND_IMAGE) {
                    return;
                } else if (!Utils.isArrayEmpty(component.Children)) {
                    component.Children.forEach((child, i) => {
                        if (this.UIElements[child])
                            this.UIElements[child]['parentId'] = component._id;
                        // component.Children[i]=this.UIElements[child];
                    });
                }
            } else if (component.CodeType === StandardCodes.TASK_CODE) {
                taskComponents.push(component);
            }
            component = this.setGridsterItemSize(component, index);
            component.isDashboard = false;
            _components.push(component);
        });
        this.components = _components;
        this.addTasksToTaskbar(taskComponents);
    }

    private addTasksToTaskbar(taskComponents) {
        taskComponents.forEach((task, i) => {
            for (let index = 0; index < this.components.length; index++) {
                if (this.components[index].CodeType === StandardCodes.CODE_TYPE_TASK_BAR) {
                    if (!Utils.isArrayEmpty(this.components[index].CodeDesigner)) {
                        task = this.setGridsterItemSize(
                            task,
                            this.components[index].CodeDesigner.length + i
                        );
                        this.components[index].CodeDesigner.push(task);
                        break;
                    }
                }
            }
            let matches = Utils.getElementsByProperty(this.components, '_id', task._id);
            if (matches && matches.length > 0) {
                let index = this.components.indexOf(matches[0]);
                this.components.splice(index, 1);
            }
        });
    }

    private setDashboardElemetProps(views, taskBars) {
        Object.keys(views).forEach((id, index) => {
            let component = views[id];
            component = this.setGridsterItemSize(component, index);
            if (!component.CodeAlias) {
                if (component.CodeType === 'Taskbar' && taskBars && taskBars[0]?.CodeDesigner) {
                    component.CodeDesigner = taskBars[0].CodeDesigner;
                }
                component.isDashboard = true;
                this.components.push(component);
            }
        });
    }
    setGridsterItemSize(component, index) {
        if (
            component['CodeColumn'] ||
            component['CodeColumns'] ||
            component['CodeRow'] ||
            component['CodeRows']
        ) {
            component['x'] = component['CodeColumn'];
            component['y'] = component['CodeRow'];
            component['cols'] = component['CodeColumns'] ? component['CodeColumns'] : 1;
            component['rows'] = component['CodeRows'] ? component['CodeRows'] : 3;
        } else {
            component['cols'] = 1;
            component['rows'] = 3;

            if (this.designerType === StandardCodes.CODE_TYPE_DATA_FORM) {
                component['y'] = index * 3;
                component['x'] = 1;
            } else if (
                this.designerType === StandardCodes.DATA_GRID ||
                this.designerType == StandardCodes.DATA_TREE
            ) {
                component['y'] = 3;
                component['x'] = index;
            }
        }
        if (component.CodeType === StandardCodes.CODE_TYPE_TASK_BAR) {
            if (!Utils.isArrayEmpty(component.CodeDesigner)) {
                component.CodeDesigner.forEach((designerItem, i) => {
                    if (
                        designerItem['CodeColumn'] ||
                        designerItem['CodeColumns'] ||
                        designerItem['CodeRow'] ||
                        designerItem['CodeRows']
                    ) {
                        designerItem['x'] = designerItem['CodeColumn'];
                        designerItem['y'] = designerItem['CodeRow'];
                        designerItem['cols'] = designerItem['CodeColumns']
                            ? designerItem['CodeColumns']
                            : 1;
                        designerItem['rows'] = designerItem['CodeRows']
                            ? designerItem['CodeRows']
                            : 4;
                    } else {
                        designerItem['cols'] = 1;
                        designerItem['rows'] = 4;
                        designerItem['y'] = 0;
                        designerItem['x'] = i;
                    }
                });
            }
        }
        if (component.CodeType === StandardCodes.CODE_TYPE_UI_COMPONENT) {
            if (!Utils.isArrayEmpty(component.Children)) {
                component.Children.forEach((child, i) => {
                    let childField = this.UIElements[child];
                    if (childField) {
                        if (
                            childField['CodeColumn'] ||
                            childField['CodeColumns'] ||
                            childField['CodeRow'] ||
                            childField['CodeRows']
                        ) {
                            childField['x'] = childField['CodeColumn'];
                            childField['y'] = childField['CodeRow'];
                            childField['cols'] = childField['CodeColumns']
                                ? childField['CodeColumns']
                                : 1;
                            childField['rows'] = childField['CodeRows']
                                ? childField['CodeRows']
                                : 3;
                        } else {
                            childField['cols'] = 1;
                            childField['rows'] = 3;
                            childField['y'] = i * 3;
                            childField['x'] = 1;
                        }
                    }
                });
            }
        }
        return component;
    }
    removeItems(item) {
        let contextKey =
            this.currentPage.contextKey +
            this.contextService.getRootViewMap(this.currentPage.contextKey);
        this.contextService.defineContext(
            item,
            this.currentView,
            this.currentPage,
            this.currentContainerID,
            this.parentPage
        );
        let currentContext = this.contextService.getContextRecord(contextKey);
        let requestObj = this.actionService.getDeleteRequest(currentContext, this.currentView);
        this.collectionsService.removeCollectionItem(requestObj).subscribe((response) => {
            this.contextService.removeContextOnAdd(contextKey, this.currentView);
            let index = Utils.getIndexByProperty(this.components, '_id', item._id);
            this.components.splice(index, 1);
            this.messages.addSuccessMessage('Record deleted successfully');
        });
    }

    private childDeleteEvent: any;
    public registerChildDeleteEvent() {
        if (!this.childDeleteEvent && this.currentPage.containerID) {
            this.childDeleteEvent = this.broadcaster
                .on<string>(this.currentView._id + this.currentPage.containerID + 'child_deleted')
                .subscribe((data) => {
                    this.deleteComponent(data['selectedRow']);
                });
        }
    }
    private deleteComponent(record) {
        if (record.parentId) {
            let parentId = record.parentId;
            let children = this.UIElements[parentId]['Children'];
            children = children.filter((child) => {
                return child !== record._id;
            });
            this.UIElements[parentId]['Children'] = children;
            delete this.UIElements[record._id];
            this.UIElementsMetaData = this.UIElementsMetaData.filter((element) => {
                return element !== record._id;
            });
            this.changeMode(true);
        } else {
            let matches = Utils.getElementsByProperty(this.components, '_id', record._id);
            if (matches && matches.length > 0) {
                let index = this.components.indexOf(matches[0]);
                this.components.splice(index, 1);
                this.changeMode(true);
            }
        }
    }

    addRecod(action) {
        let eventData = this.gridService.getCreateRecordObj(
            this.currentRecord,
            this.currentContainerID,
            null
        );
        eventData.parentRecord = this.gridService.parentRecord;
        if (action && action.CodeActions) {
            let json = action.CodeActions[0].JSONParameter;
            if (json && json['UI'] && !Utils.isObjectEmpty(json['UI'])) {
                eventData.data = { ...eventData.data, ...json['UI'] };
            }
        }
        this.contextService.removeContextOnAdd(
            this.currentPage.contextKey +
                this.contextService.getRootViewMap(this.currentPage.contextKey),
            this.currentView
        );
        this.broadcaster.broadcast(
            this.currentPage.containerID + this.currentPage.CodeElement,
            eventData
        );
    }

    public registerChildCreateEvent() {
        this.childCreateEvent = this.broadcaster
            .on<string>(this.currentPage.CodeElement + 'child_created')
            .subscribe((record) => {
                let _component = record['payload'];
                _component.rows = _component.CodeRows || 3;
                _component.cols = _component.CodeColumns || 1;
                _component.y = 1;
                _component.x = 10;
                if (_component.CodeType === StandardCodes.CODE_TYPE_UI_COMPONENT) {
                    let childs = _component['Children'];
                    if (childs) {
                        childs.forEach((child, i) => {
                            let index = Utils.getIndexByProperty(
                                this.components,
                                'CodeDescription',
                                child
                            );
                            if (index >= 0) {
                                childs[i] = this.components[index]._id;
                                this.components.splice(index, 1);
                            }
                        });
                    }
                    _component['Children'] = Utils.getCopy(childs);
                }
                this.components.push(_component);
            });
    }

    getTrackBy(index: number, filter: any) {
        return filter._id;
    }

    public registerUpdateEvent() {
        this.childUpdateEvent = this.broadcaster
            .on<string>(this.currentPage.CodeElement + 'child_updated')
            .subscribe((data: any) => {
                let record = data['payload'];
                let _components = Utils.getCopy(this.components);
                _components.some((component, i) => {
                    if (component._id === record['_id']) {
                        for (let field in record) {
                            this.components[i][field] = record[field];
                        }
                        return true;
                    }
                    if (component.Children) {
                        component.Children.some((childItem, j) => {
                            if (childItem === record['_id']) {
                                for (let field in record) {
                                    this.UIElements[childItem][field] = record[field];
                                }
                                return true;
                            }
                        });
                    }
                });
            });
    }

    ngOnDestroy() {
        this.contextService.removeContextOnAdd(
            this.currentPage.contextKey +
                this.contextService.getRootViewMap(this.currentPage.contextKey),
            this.currentView
        );
        if (this.childDeleteEvent) {
            this.childDeleteEvent.unsubscribe();
        }
        if (this.childCreateEvent) {
            this.childCreateEvent.unsubscribe();
        }
        if (this.childUpdateEvent) {
            this.childUpdateEvent.unsubscribe();
        }
    }
}
