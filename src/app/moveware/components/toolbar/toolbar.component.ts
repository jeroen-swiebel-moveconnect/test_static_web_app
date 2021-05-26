import {
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
    ViewChild,
    SimpleChanges,
    AfterViewInit
} from '@angular/core';
import {
    MenuEventArgs,
    ToolbarComponent,
    BeforeOpenCloseMenuEventArgs
} from '@syncfusion/ej2-angular-navigations';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { FilterPane } from '../filterpane-component/filterpane.component';
import { TranslateService } from '@ngx-translate/core';
import Utils from '../../services/utils';
import { ToastService } from '../../services/toast.service';
import { closest } from '@syncfusion/ej2-base';
import { DialogConfigurationService } from 'src/app/moveware/services/dialog-configuration.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { Helpers } from 'src/app/moveware/utils/helpers';

@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss']
})
/**
 * <p> Loads ToolBar. </p>
 */
export class ToolbarComponentView implements OnInit, AfterViewInit {
    @Input() viewList: any;
    @Input() currentPage: any;
    @Input() selectedFilters: any;
    @Input() layoutSizeOptions: Array<any>;
    @Input() primaryActions: Array<any>;
    @Input() secondaryActions: Array<any>;
    @Input() selectedLayoutSize: any;
    @Output() actionEvent = new EventEmitter<any>();
    @Output() handleRightClick = new EventEmitter<any>();
    @ViewChild('toolbar', { static: true })
    public toolbarInstance: ToolbarComponent;
    @Input() isFilterBarVisible: string;
    @Input() filtersList: Array<any>;
    @Input() rowGroupOptions: Array<any>;
    @Input() colGroupOptions: Array<any>;
    @Input() displayedColumns: Array<any>;
    @Input() selectedColumns: Array<any>;
    @Input() parentPageCode: string;
    //@Input() viewSelector: string;
    @Input() isFormTaskBar: boolean;
    @Input() translationContext: any;
    @Input() isProfileView: boolean;
    @Input() currentView: any;
    @Input() currentRecord: any;
    @Input() currentType: any;
    @Input() viewTranslationContext: any;
    @Output() loadFilter: EventEmitter<any> = new EventEmitter();
    @Output() customiseView: EventEmitter<any> = new EventEmitter();
    @Output() resetDeafaultFilters: EventEmitter<any> = new EventEmitter();
    shouldDisplayLanguages: boolean = false;
    @Input() globalLanguages: Array<any>;
    @ViewChild('Dialog')
    public Dialog: DialogComponent;
    public buttonClass: string;
    public DISPLAY_ICON: string = StandardCodes.DISPLAY_ICON;
    public DISPLAY_TEXT: string = StandardCodes.DISPLAY_TEXT;
    public DISPLAY_ICONANDTEXT: string = StandardCodes.DISPLAY_ICONANDTEXT;
    public TOOLBAR_FILTER_LIST: string = StandardCodes.TOOLBAR_FILTER_LIST;
    public TOOLBAR_COLUMN_LIST: string = StandardCodes.TOOLBAR_COLUMN_LIST;
    public TOOLBAR_GROUPBY_ROW_LIST: string = StandardCodes.TOOLBAR_GROUPBY_ROW_LIST;
    public TOOLBAR_GROUPBY_COLUMN_LIST: string = StandardCodes.TOOLBAR_GROUPBY_COLUMN_LIST;
    public FIELD_TYPE_DROPDOWN_BUTTON: string = StandardCodes.FIELD_TYPE_DROPDOWN_BUTTON;
    public FIELD_TYPE_DROPDOWN_LIST: string = StandardCodes.FIELD_TYPE_DROPDOWN_LIST;
    public FIELD_TYPE_COMBO_BOX: string = StandardCodes.FIELD_TYPE_COMBO_BOX;
    public FIELD_TYPE_PICKLIST: string = StandardCodes.FIELD_TYPE_PICKLIST;
    selectedView: any;
    //toolBarDisplay: boolean = false;
    public fields: Object = { text: 'CodeDescription', value: 'CodeCode' };
    toolbarOptions: Array<any> = [];
    showFilters: boolean;
    fieldLabel: string;

    public data: { [key: string]: Object }[] = [
        { text: 'Account Settings', id: 'list-01' },
        { text: 'Address Book', id: 'list-02' },
        { text: 'Delete', id: 'list-03' },
        { text: 'Forward', id: 'list-04' },
        { text: 'Reply', id: 'list-05' },
        { text: 'Reply All', id: 'list-06' },
        { text: 'Save All Attachments', id: 'list-07' },
        { text: 'Save As', id: 'list-08' },
        { text: 'Touch/Mouse Mode', id: 'list-09' },
        { text: 'Undo', id: 'list-10' }
    ];
    filterBarText: string = '';
    initialFilterValues: any;
    initialFilterBarText: any;
    filtersWithOptions: any[] = [];
    isLoading: any = true;

    constructor(
        private dialogConfig: DynamicDialogConfig,
        private dialog: DialogService,
        public translateService: TranslateService,
        private toastService: ToastService,
        private dialogConfigService: DialogConfigurationService,
        private actionsService: UIActionService
    ) {}
    /**
     * <p> Toolbar initialization</p>
     *
     *  */
    ngOnInit() {
        //   this.toolBarDisplay = this.isFormTaskBar ? true : false;

        let indexOfSelectView = Utils.getIndexByProperty(
            this.primaryActions,
            'CodeCode',
            'Select View'
        );
        if (indexOfSelectView >= 0) {
            this.primaryActions[indexOfSelectView].items = this.viewList;
        }
        let layoutIndex = Utils.getIndexByProperty(
            this.primaryActions,
            'CodeCode',
            'Grid Row Height'
        );
        if (layoutIndex >= 0) {
            this.primaryActions[layoutIndex].items = this.layoutSizeOptions;
        }
        for (let index = 0; index < this.primaryActions.length; index++) {
            let action = this.primaryActions[index];
            if (
                (action.CodeCode == this.TOOLBAR_FILTER_LIST &&
                    Utils.isArrayEmpty(this.filtersList)) ||
                (action.CodeCode == this.TOOLBAR_GROUPBY_ROW_LIST &&
                    Utils.isArrayEmpty(this.rowGroupOptions)) ||
                (action.CodeCode == this.TOOLBAR_GROUPBY_COLUMN_LIST &&
                    Utils.isArrayEmpty(this.colGroupOptions))
            ) {
                this.primaryActions.splice(index, 1);
                index--;
                continue;
            }
            if (action.items && action.CodeLookup && action.CodeLookup.length) {
                action.items.forEach((item) => {
                    item['isLookupOption'] = true;
                });
            }
            if (
                (action.items && action.CodeButtonType === StandardCodes.DISPLAY_ICONANDTEXT) ||
                action.CodeButtonType === StandardCodes.DISPLAY_TEXT
            ) {
                if (index === indexOfSelectView) {
                    this.primaryActions[indexOfSelectView]?.items.forEach((item) => {
                        item['ContainerCodeCode'] = this.currentPage['ContainerCodeCode'];
                        item['viewTranslationContext'] = this.getTranslationContext();
                    });
                    let SelectViewCodeCode = this.getTranslationContext();
                    action.value = SelectViewCodeCode;
                } else {
                    let onLoadAction;
                    if (action.CodeActions && !Utils.isArrayEmpty(action.CodeActions)) {
                        onLoadAction = Utils.getElementsByProperty(
                            action.CodeActions,
                            'CodeUIAction',
                            StandardCodes.TASK_ON_LOAD
                        );
                    }
                    if (onLoadAction && onLoadAction.length > 0) {
                        this.taskOnLoad(action, onLoadAction);
                    } else {
                        action.value = action.CodeCode;
                    }
                }
            }
            if (
                action.items &&
                action.CodeFieldType &&
                (action.CodeFieldType.CodeCode === StandardCodes.FIELD_TYPE_COMBO_BOX ||
                    action.CodeFieldType.CodeCode === StandardCodes.FIELD_TYPE_DROPDOWN_LIST)
            ) {
                action['allowFiltering'] = true;
            } else {
                action['allowFiltering'] = false;
            }
        }

        this.secondaryActions.forEach((action) => {
            if (action.items && action.CodeLookup && action.CodeLookup.length) {
                action?.items?.forEach((item) => {
                    item['isLookupOption'] = true;
                });
            }
        });
        this.toolbarOptions = [...this.primaryActions];
    }

    /**
     * To fetch views translation context based on page loaded eg.dashboard,container etc
     */
    getTranslationContext() {
        return this.currentPage['isDashboardRenderer'] && this.viewTranslationContext
            ? this.viewTranslationContext
            : this.currentPage && this.currentPage.CodeAlias
            ? this.currentPage['CodeCode']
            : this.currentPage['ContainerCodeCode']
            ? (this.currentPage['isDashboardRenderer'] ? 'Dashboard.' : 'UI Container.') +
              this.currentPage['ContainerCodeCode'] +
              '.' +
              this.currentPage['CodeCode']
            : this.currentPage['CodeCode'];
    }
    /**
     * resets the view to default state of filters and sort
     */
    resetFilters() {
        if (this.initialFilterBarText !== this.filterBarText) {
            if (
                this.initialFilterValues &&
                this.filtersList &&
                !Utils.isArrayEmpty(this.filtersList)
            ) {
                this.filtersList.forEach((element, index) => {
                    if (element.values && !element.options) {
                        element.options = element.values;
                    }
                    this.unCheckAll(this.filtersList[index]);
                    if (this.initialFilterValues[element.CodeElement]) {
                        this.filtersList[index].CodeValue = this.initialFilterValues[
                            element.CodeElement
                        ];
                        this.filtersList[index].value = this.initialFilterValues[
                            element.CodeElement
                        ];
                    } else {
                        delete this.filtersList[index].CodeValue;
                        delete this.filtersList[index].value;
                    }
                });
                this.applyFilters();
            } else {
                this.clearAllFilters();
            }
        } else {
            this.toastService.addWarningMessage('Filters already resetted');
        }
    }
    unCheckAll(filter: any) {
        if (filter.options && !Utils.isArrayEmpty(filter.options)) {
            filter.options.forEach((element) => {
                if (element.isChecked) {
                    delete element.isChecked;
                }
            });
        }
    }

    /**
     *builds the actives filter in text format
     * @param data :filters to build the text
     */
    buildFilterBarText(data, isOnLoad?) {
        if (this.isFilterBarVisible) {
            this.filterBarText = '';
            Object.keys(data).forEach((filter) => {
                let filterValue = this.getFilterValue(data[filter]['CodeValue']);
                let field = this.selectedColumns.find((fieldData) => {
                    return filter === fieldData.CodeElement;
                });
                if (filterValue && field && field['CodeDescription']) {
                    this.filterBarText =
                        this.filterBarText + field['CodeDescription'] + ': ' + filterValue + ', ';

                    this.addFilterIfNotAvailable(filter, filterValue);
                }
            });
            if (this.filterBarText.length > 2) {
                this.filterBarText = this.filterBarText.slice(0, this.filterBarText.length - 2);
            }
            if (isOnLoad) {
                this.initialFilterBarText = this.filterBarText
                    ? Utils.getCopy(this.filterBarText)
                    : '';
            }
        }
    }
    /**
     * adds the filter if its not existing
     * @param filter : filter to be added
     * @param filterValue : value of the filter
     */
    private addFilterIfNotAvailable(filter: string, filterValue: string) {
        let index;
        if (!this.filtersList) {
            this.filtersList = [];
            index = -1;
        } else {
            index = this.filtersList.findIndex((item) => {
                return item.CodeElement === filter;
            });
        }
        if (index === -1) {
            let newfilter = this.selectedColumns.find((data) => {
                return filter === data.CodeCode;
            });
            let fieldValue = filterValue;
            if (newfilter.options) {
                fieldValue = Utils.parseOptions(newfilter.options, filterValue, null).value;
            }
            this.filtersList.push({
                CodeDescription: newfilter.CodeDescription,
                CodeElement: newfilter.CodeCode,
                CodeDataType: newfilter.CodeDataType ? newfilter.CodeDataType : 'String',
                CodeFilterType: newfilter.CodeFilterType ? newfilter.CodeFilterType : 'Text',
                CodeSubField: newfilter.CodeSubField ? newfilter.CodeSubField : 'CodeDescription',
                CodeValue: fieldValue,
                children: null,
                isHeaderFilter: true,
                options: newfilter.options,
                source: 'searchColumn',
                value: fieldValue,
                values: newfilter.options
            });
        }
    }
    /**
     * gets the filter value based on its type
     * @param data : filter
     * @returns : value of the filter
     */
    getFilterValue(data: any) {
        let value = '';
        if (typeof data === 'object' && Array.isArray(data)) {
        } else if (typeof data === 'string') {
            value = data;
        } else if (typeof data === 'object') {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    if (typeof element === 'object' && Array.isArray(element)) {
                        let arrayData = [...new Set(element)];
                        if (arrayData.length > 1) {
                            value = value + '[';
                        }
                        for (let index = 0; index < arrayData.length; index++) {
                            const elementValue = arrayData[index];
                            value = value + elementValue + ', ';
                            if (index === 5) {
                                break;
                            }
                        }
                        value = value.slice(0, value.length - 2);
                        if (arrayData.length > 5) {
                            value = value + ',...]';
                        } else if (arrayData.length > 1) {
                            value = value + ']';
                        }
                        break;
                    } else {
                        if (typeof element === 'object') {
                            value =
                                value + element.CodeDescription
                                    ? element.CodeDescription
                                    : element.CodeCode;
                        } else {
                            value = value + element;
                        }
                        break;
                    }
                }
            }
        }
        return value;
    }
    /**
     * clears all the filters
     * @returns
     */
    clearAllFilters() {
        if (this.filterBarText) {
            let selectFilters = [];
            if (this.selectedFilters) {
                Object.keys(this.selectedFilters).forEach((key) => {
                    selectFilters.push(key);
                });
            }
            if (this.filtersList && !Utils.isArrayEmpty(this.filtersList)) {
                this.filtersList.forEach((data, index) => {
                    if (data.values && !data.options) {
                        data.options = data.values;
                    }
                    this.unCheckAll(this.filtersList[index]);
                    if (selectFilters.includes(data.CodeElement)) {
                        if (this.filtersWithOptions.includes(data.CodeElement)) {
                            this.filtersList[index].CodeValue = null;
                            this.filtersList[index].value = null;
                        } else {
                            this.filtersList[index].CodeValue = '';
                            this.filtersList[index].value = '';
                        }
                    }
                });
                let event = {
                    filters: this.filtersList
                };
                this.loadFilter.emit(event);
            }
        } else {
            this.toastService.addWarningMessage('Filters already cleared');
        }

        return false;
    }
    ngOnChanges(changes: SimpleChanges) {
        if (
            changes['primaryActions']?.previousValue &&
            changes['secondaryActions']?.previousValue &&
            changes['secondaryActions']?.currentValue &&
            changes['primaryActions'].currentValue &&
            (JSON.stringify(changes['primaryActions'].previousValue) !==
                JSON.stringify(changes['primaryActions'].currentValue) ||
                JSON.stringify(changes['secondaryActions'].previousValue) !==
                    JSON.stringify(changes['secondaryActions'].currentValue)) &&
            !(changes['secondaryActions']?.firstChange || changes['primaryActions']?.firstChange)
        ) {
            let indexOfSelectView = Utils.getIndexByProperty(
                this.primaryActions,
                'CodeCode',
                'Select View'
            );
            this.primaryActions.forEach((action, index) => {
                if (action.items && action.CodeLookup && action.CodeLookup) {
                    action.items.forEach((item) => {
                        item['isLookupOption'] = true;
                    });
                }
            });
            this.toolbarOptions = [...this.primaryActions];
        }
    }
    tackbyFn(item) {
        return item._id;
    }

    /**
     * <p> Triggers while rendering each Popup item of DropDownButton. </p>
     *
     * @param args : MenuEventArgs Event
     */
    public itemBeforeEvent(args: MenuEventArgs, item, tooltip?) {
        this.closeToolTip(tooltip);
        let itemCodeCode = args.item['CodeCode'];
        let ContainerCodeCode = args.item['ContainerCodeCode'];
        if (args.item['label']) {
            args.element.innerHTML = '<span>' + args.item['label'] + '</span>';
        } else if (args.item['isLookupOption'] && args.item['CodeDescription']) {
            args.element.innerHTML = '<span>' + args.item['CodeDescription'] + '</span>';
        } else if (itemCodeCode && !(item.CodeCode === 'Select View')) {
            this.translateService
                .get(this.translationContext + '.' + itemCodeCode)
                .subscribe((data) => {
                    args.element.innerHTML = '<span>' + data + '</span>';
                });
        } else if (itemCodeCode && item.CodeCode === 'Select View') {
            if (args.item['CodeAlias']) {
                this.translateService.get(itemCodeCode).subscribe((data) => {
                    args.element.innerHTML = '<span>' + data + '</span>';
                });
            } else if (args.item['isDashboardRenderer']) {
                this.translateService.get(args.item['viewTranslationContext']).subscribe((data) => {
                    args.element.innerHTML = '<span>' + data + '</span>';
                });
            } else {
                let translationContext = args.item['isDashboardRenderer']
                    ? 'Dashboard.'
                    : 'UI Container.';
                this.translateService
                    .get(translationContext + ContainerCodeCode + '.' + itemCodeCode)
                    .subscribe((data) => {
                        args.element.innerHTML = '<span>' + data + '</span>';
                    });
            }
        } else if (itemCodeCode) {
            args.element.innerHTML = '<span>' + itemCodeCode + '</span>';
        } else {
            args.element.innerHTML = '<span>' + JSON.stringify(args.item) + '</span>';
        }
    }

    /**
     * to close the tooltip if its open
     * @param tooltip : tooltip instance
     */
    private closeToolTip(tooltip: any) {
        if (tooltip) {
            tooltip.close();
        }
    }

    ngAfterViewInit(): void {
        if (this.isProfileView) {
            this.toolbarInstance.changeOrientation();
        }
        if (this.selectedFilters) {
            this.buildFilterBarText(this.selectedFilters, true);
        }
        if (this.displayedColumns) {
            this.filtersWithOptions = [];
            this.initialFilterValues = {};
            this.displayedColumns.forEach((element) => {
                if (element.options && element.options.length && element.CodeElement) {
                    this.filtersWithOptions.push(element.CodeElement);
                }
                if (element.CodeValue && element.CodeElement) {
                    this.initialFilterValues[element.CodeElement] = element.CodeValue;
                }
            });
        }
    }

    /**
     * <p> Triggers while selecting action item in DropDownButton popup.</p>
     *
     * @param event : DOM Event
     * @param item : selected options from dropdown Options.
     */
    selection(event, parent, tooltip?) {
        this.closeToolTip(tooltip);
        let item = event?.itemData || event?.item;
        if (
            parent.CodeFieldType &&
            parent.CodeFieldType.CodeCode === StandardCodes.FIELD_TYPE_COMBO_BOX
        ) {
            let index = Utils.getIndexByProperty(this.toolbarOptions, 'CodeCode', parent.CodeCode);
            if (index >= 0) {
                this.toolbarOptions[index].value = item.CodeDescription;
            }
        }

        this.actionEvent.emit({
            CodeActions:
                item.CodeActions && item.CodeActions.length > 0
                    ? item.CodeActions
                    : parent.CodeActions,
            CodeCode:
                item.CodeActions && item.CodeActions.length > 0 ? item.CodeCode : parent.CodeCode,
            CodeDescription: item.CodeDescription,
            CodeValue: item.CodeCode,
            view: item
        });
    }

    /**
     * <p> Triggered by the On Load action of a task </p>
     *
     * @param action : On Load Action
     */
    taskOnLoad(item, action) {
        setTimeout(() => {
            this.actionEvent.emit({
                CodeActions: action,
                CodeCode: item.CodeCode,
                CodeDescription: item.CodeDescription,
                CodeValue: item.CodeValue,
                view: item
            });
        });
    }

    set setDataViewProperty(action) {
        if (action && this.toolbarOptions) {
            let option = this.toolbarOptions.filter((item) => item.CodeCode === action.CodeCode);

            if (option) {
                option[0]['value'] = action.value;
            }
        }
    }

    /**
     * <p> Triggers when click on button . action Events on buttons are handled.
     * </p>
     *
     * @param task : clicked button details from toolBarOptions.
     * @param event : DOM Event
     */
    handleAction(task, event?, tooltip?) {
        this.closeToolTip(tooltip);
        if (!task?.CodeActions && task?.parentObj?.CodeActions) {
            task.CodeActions = task.parentObj.CodeActions;
        }
        if (task && task.CodeCode === this.TOOLBAR_FILTER_LIST) {
            this.handleFiltersDialogOpen(task);
        }
        if (task && task.CodeCode === this.TOOLBAR_COLUMN_LIST) {
            this.handleColumnsDialogOpen(task);
        } else if (
            task &&
            (task.CodeCode === this.TOOLBAR_GROUPBY_ROW_LIST ||
                task.CodeCode === this.TOOLBAR_GROUPBY_COLUMN_LIST)
        ) {
            this.handleGroubyListDialogOpen(task, task.CodeCode);
        } else if (task) {
            this.actionEvent.emit(task);
        }
    }

    /**
     * <p> Returns true if task have Open Filter Action Configured else returns false.</p>
     *
     * @param task : selected task details from toolBarOptions.
     */
    private isFilterPanelTask(task) {
        task.allActions = Utils.getArrayOfProperties(task.CodeActions, 'CodeUIAction');
        let actions = task.allActions.toString();
        return actions.indexOf(StandardCodes.TASK_OPEN_FILTERS) >= 0;
    }

    /**
     * <p> Handles ContextMenu actions.</p>
     *
     * @param event : DOM Event
     * @param task : selected task details from toolBarOptions.
     */
    handleContextMenu(event, task) {
        event.action = task;
        this.handleRightClick.emit(event);
    }

    /**
     * <p> For Dispalying Toolbar and refresh toolBar for adjust centre buttons positioning for grid.</p>
     */
    public refreshToolBar() {
        //this.toolBarDisplay = true;
        // setTimeout(() => {
        //     this.toolbarInstance?.refresh();
        // });
    }
    /**
     * <p>Maps the appropriate column to fields property.</p>
     *
     * @param index : index of column filter from filterList.
     * @param filter : filter from filterList.
     */
    trackByFilterCodeCode(index: number, filter: any) {
        return filter.CodeCode;
    }

    /**
     * <p> For loading Dynamicfilters.</p>
     *
     * @param event : DOM Event
     */
    loadDynamicFilter(event) {
        // this.applyFilters(event['field'], event['filterValue'], true);
    }

    /**
     * <p> For applying filters.</p>
     *
     */
    applyFilters() {
        // let event = {
        //     filter: filter,
        //     option: option,
        //     loadFilters: loadFilters
        // };
        // this.loadFilter.emit(event);

        let event = {
            filters: this.filtersList
        };
        this.loadFilter.emit(event);
    }

    public applyCustomisation(event, type?) {
        if (event.customisedColumns) {
            this.selectedColumns = event.customisedColumns;
        }
        if (event.displayedColumns) {
            this.displayedColumns = event.displayedColumns;
        }
        if (event.groupOptions) {
            if (type === this.TOOLBAR_GROUPBY_COLUMN_LIST) {
                this.colGroupOptions = event.groupOptions;
            } else {
                this.rowGroupOptions = event.groupOptions;
            }
        }
        this.customiseView.emit(event);
    }

    /**
     * <p> This method is used for setting DateTime Filters.</p>
     *
     * @param filter : Selected fitler
     * @param event : DOM Event
     * @param type : type of filter to apply.
     */
    public setDateTimeFilter(filter, event, type) {
        if (event.values && filter.values && type === 'TimeChange') {
            filter.valuesTime = [
                Utils.minToTimeString(event.values[0]),
                Utils.minToTimeString(event.values[1])
            ];
        } else if (!Utils.isArrayEmpty(filter.value) && !Utils.isArrayEmpty(filter.valuesTime)) {
            var fromTime = filter.valuesTime[0].split(/[.:]/);
            var toTime = filter.valuesTime[1].split(/[.:]/);
            filter.value[0].setHours(fromTime[0]);
            filter.value[0].setMinutes(fromTime[1]);
            filter.value[1].setHours(toTime[0]);
            filter.value[1].setMinutes(toTime[1]);
            // this.applyFilters(filter, filter.value, true);
        }
    }
    /**
     * <p> To handle dialogOpen if openFilter action is configured.</p>
     *
     * @param task :  Button task
     * @param event : DOM Event
     */
    handleFiltersDialogOpen(task) {
        this.dialogConfig.styleClass = 'filter-dialog';
        this.dialogConfig.header = task.CodeDescription;
        if (!Utils.isArrayEmpty(this.displayedColumns) && !Utils.isArrayEmpty(this.filtersList)) {
            this.displayedColumns.forEach((column) => {
                this.filtersList.forEach((filter) => {
                    if (column.CodeCode === filter.CodeElement) {
                        filter.CodeValue = column.CodeValue;
                    }
                });
            });
        }
        this.dialogConfig.data = {
            filtersList: this.filtersList,
            currentView: this.currentView,
            currentPage: this.currentPage,
            currentRecord: this.currentRecord,
            currentType: this.currentType,
            task: task.CodeCode
        };

        this.dialogConfig.closable = true;
        let taskData = this.actionsService.getActionDetails(
            task,
            this.dialogConfig.data,
            StandardCodes.UI_ACTION_CLICK,
            ''
        );
        if (taskData) {
            const dialogRef = this.dialog.open(
                FilterPane,
                this.dialogConfigService.getDialogConfiguration(
                    {
                        menu: taskData,
                        position: taskData.CodeUILocation,
                        data: this.dialogConfig.data
                    },
                    this.dialogConfig
                )
            );
            dialogRef.onClose.subscribe((result) => {
                if (result) {
                    this.filtersList = result;
                    this.applyFilters();
                }
            });
        }
    }

    handleColumnsDialogOpen(task) {
        this.dialogConfig.styleClass = 'filter-dialog';
        this.dialogConfig.header = task.CodeDescription;
        this.dialogConfig.data = {
            displayedColumns: this.displayedColumns,
            currentView: this.currentView,
            currentPage: this.currentPage,
            currentRecord: this.currentRecord,
            currentType: this.currentType,
            selectedColumns: this.selectedColumns,
            task: task.CodeCode
        };
        this.dialogConfig.closable = true;
        let taskData = this.actionsService.getActionDetails(
            task,
            this.dialogConfig.data,
            StandardCodes.UI_ACTION_CLICK,
            ''
        );
        if (taskData) {
            const dialogRef = this.dialog.open(
                FilterPane,
                this.dialogConfigService.getDialogConfiguration(
                    {
                        menu: taskData,
                        position: taskData.CodeUILocation,
                        data: this.dialogConfig.data
                    },
                    this.dialogConfig
                )
            );
            dialogRef.onClose.subscribe((result) => {
                if (result) {
                    this.applyCustomisation(result);
                }
            });
        }
    }
    handleGroubyListDialogOpen(task, type) {
        this.dialogConfig.styleClass = 'filter-dialog';
        this.dialogConfig.header = task.CodeDescription;
        this.dialogConfig.data = {
            groupOptions:
                type === this.TOOLBAR_GROUPBY_COLUMN_LIST
                    ? this.colGroupOptions
                    : this.rowGroupOptions,
            currentView: this.currentView,
            currentPage: this.currentPage,
            currentRecord: this.currentRecord,
            currentType: this.currentType,
            task: task.CodeCode
        };
        this.dialogConfig.closable = true;
        let taskData = this.actionsService.getActionDetails(
            task,
            this.dialogConfig.data,
            StandardCodes.UI_ACTION_CLICK,
            ''
        );
        if (taskData) {
            const dialogRef = this.dialog.open(
                FilterPane,
                this.dialogConfigService.getDialogConfiguration(
                    {
                        menu: taskData,
                        position: taskData.CodeUILocation,
                        data: this.dialogConfig.data
                    },
                    this.dialogConfig
                )
            );
            dialogRef.onClose.subscribe((result) => {
                if (result) {
                    this.applyCustomisation(result, type);
                }
            });
        }
    }
    /**
     * sets the state of loading
     * @param isloading : is loading
     */
    setIsLoading(isloading) {
        this.isLoading = isloading;
    }

    public onBeforeOpen(args: BeforeOpenCloseMenuEventArgs): void {
        if (args.items.length > 20) {
            (closest(args.element, '.e-menu-wrapper') as HTMLElement).style.height = '480px';
        }
    }
    public showActions() {
        Helpers.showSecondaryMenus();
    }
}
