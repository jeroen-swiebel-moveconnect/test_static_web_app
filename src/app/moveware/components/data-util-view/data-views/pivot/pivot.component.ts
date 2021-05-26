import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { GridService } from 'src/app/moveware/services/grid-service';
import Utils from 'src/app/moveware/services/utils';
import {
    CalculatedFieldService,
    ConditionalFormattingService,
    DisplayOption,
    EnginePopulatedEventArgs,
    FieldListService,
    IDataOptions,
    IDataSet,
    NumberFormattingService,
    PivotFieldListComponent,
    PivotViewComponent,
    ToolbarService,
    ToolbarItems,
    PivotChartService,
    VirtualScrollService
} from '@syncfusion/ej2-angular-pivotview';
import { Browser, prepend, setStyleAttribute, L10n } from '@syncfusion/ej2-base';
import { ChartSettings } from '@syncfusion/ej2-pivotview/src/pivotview/model/chartsettings';
import { GridSettings } from '@syncfusion/ej2-pivotview/src/pivotview/model/gridsettings';
import { ToastService } from 'src/app/moveware/services/toast.service';

/**
 * <p> Pivot view for grid-container to replace calendar </p>
 */

@Component({
    selector: 'pivot',
    templateUrl: './pivot.component.html',
    styleUrls: ['./pivot.component.scss'],
    providers: [
        CalculatedFieldService,
        ConditionalFormattingService,
        FieldListService,
        NumberFormattingService,
        ToolbarService,
        PivotChartService,
        VirtualScrollService
    ]
})
export class PivotComponent implements OnInit {
    public previousState: string;
    public pivotData: IDataSet[];
    public toolbarOptions: ToolbarItems[];
    public chartSettings: ChartSettings;
    public displayOption: DisplayOption;

    viewMode: string;
    dataSource: Array<Object>;
    dataSourceSettings: IDataOptions;
    selectedColumns: Array<Object>;
    selectedValues: Array<Object>;
    selectedRows: Array<Object>;
    selectedGroups: Array<Object>;
    defaultGroupBy: Array<Object>;
    groupableColumns: Array<Object>;
    metaData: any;
    currentPage: any;
    chartType: any = 'Bar';
    layout: any = 'Table';
    rowHeight: Number;
    gridSettings: GridSettings;
    headerVisible: boolean;
    gridRowShading: any;

    private layoutOptions = ['Both', 'Chart', 'Table'];
    private chartOptions = [
        'Line',
        'Column',
        'Area',
        'Bar',
        'StepArea',
        'StackingColumn',
        'StackingArea',
        'StackingBar',
        'StepLine',
        'Pareto',
        'Bubble',
        'Scatter',
        'Spline',
        'SplineArea',
        'StackingColumn100',
        'StackingBar100',
        'StackingArea100',
        'Polar',
        'Radar'
    ];
    private allExpanded = true;
    private rowExpanded = true;
    private colExpanded = true;

    @ViewChild('pivotview') pivot: PivotViewComponent;
    @ViewChild('pivotfieldlist') fieldList: PivotFieldListComponent;
    /**
     * <p>Constructor</p>
     * @param gridService is grid service
     * @param toastService is toast message service
     */
    constructor(public gridService: GridService, private toastService: ToastService) {}

    /**
     * <p>ngOnInit lifecycle method</p>
     */
    ngOnInit() {
        this.loadDataSource();
    }

    loadDataSource() {
        L10n.load({
            en: {
                pivotview: {
                    undefined: 'Unknown',
                    null: 'Unknown'
                }
            },
            'en-US': {
                pivotview: {
                    undefined: 'Unknown',
                    null: 'Unknown'
                }
            }
        });

        // calls a method to flatten the data source - to be done in the backend
        let pivotData = Utils.flattenObject(this.dataSource);
        pivotData = this.setFieldList(pivotData);

        if (this.defaultGroupBy) {
            this.setSelectedGroups = this.defaultGroupBy;
            this.setSelectedRows = this.defaultGroupBy;
        }
        if (this.selectedColumns) {
            this.setSelectedValues = this.selectedColumns;
        }

        if (this.metaData.layout) {
            if (typeof this.metaData.layout === 'object') {
                this.layout = this.metaData.layout['CodeCode'];
            } else {
                this.layout = this.metaData.layout;
            }

            if (this.layoutOptions.indexOf(this.layout) < 0) {
                this.layout = 'Table';
            }
        }

        let rowHeight = this.metaData.rowHeight;
        this.headerVisible = this.metaData.headerVisible;
        this.gridRowShading = this.metaData.rowShading;

        this.gridSettings = {
            rowHeight: rowHeight,
            gridLines: this.metaData.gridLines
        } as GridSettings;

        this.displayOption = {
            view: 'Both',
            primary: this.layout
        } as DisplayOption;

        if (this.metaData.chartType) {
            if (typeof this.metaData.chartType === 'object') {
                this.chartType = this.metaData.chartType['CodeCode'];
            } else {
                this.chartType = this.metaData.chartType;
            }

            if (this.chartOptions.indexOf(this.chartType) < 0) {
                this.chartType = 'Bar';
            }
        }

        this.chartSettings = {
            title: this.currentPage.CodeCode,
            chartSeries: { type: this.chartType }
        } as ChartSettings;

        this.dataSourceSettings = {
            dataSource: pivotData,
            expandAll: !this.metaData.isCollapsed,
            columns: this.setPivotData(this.selectedGroups),
            values: this.setPivotData(this.selectedValues),
            rows: this.setPivotData(this.selectedRows)
        };

        if (this.dataSourceSettings.expandAll) {
            this.rowExpanded = true;
            this.colExpanded = true;
            this.allExpanded = true;
        } else {
            this.rowExpanded = false;
            this.colExpanded = false;
            this.allExpanded = false;
        }

        // no longer using built in toolbars
        this.toolbarOptions = [
            'Grid',
            'Chart',
            'Export',
            'SubTotal',
            'GrandTotal',
            'Formatting',
            'FieldList'
        ] as ToolbarItems[];
    }

    /**
     * <p> Sets the fieldList from selectedColumns in case if some are missing </p>
     * @param pivotData : the pivot grid data source
     */
    setFieldList(pivotData) {
        if (!Utils.isArrayEmpty(pivotData)) {
            this.selectedColumns.forEach((col) => {
                let key = col['CodeCode'];
                if (key && !pivotData[0].hasOwnProperty(key)) {
                    pivotData[0][key] = undefined;
                }
            });
        }

        return pivotData;
    }

    /**
     * <p> Triggered before toolbar is rendered to add separators before fieldList button </p>
     */
    beforeToolbarRender(args: any) {
        args.customToolbar.splice(6, 0, {
            prefixIcon: 'e-tool-expand e-icons',
            tooltipText: 'Expand/Collapse',
            click: this.expandAll.bind(this)
        });
    }

    /**
     * <p> Triggered when the expand button is clicked </p>
     */
    expandAll(args: any) {
        this.pivot.dataSourceSettings.drilledMembers = null;
        this.pivot.dataSourceSettings.expandAll = !this.allExpanded;
        this.allExpanded = !this.allExpanded;
        if (this.allExpanded) {
            this.rowExpanded = true;
            this.colExpanded = true;
        } else {
            this.rowExpanded = false;
            this.colExpanded = false;
        }
    }

    expandSpecific(type) {
        let drilledGroups = this.pivot.dataSourceSettings.drilledMembers;
        let objArray;
        if (type === 'Rows') {
            objArray = this.pivot.dataSourceSettings.rows;
            this.rowExpanded = !this.rowExpanded;
        } else {
            objArray = this.pivot.dataSourceSettings.columns;
            this.colExpanded = !this.colExpanded;
        }

        if (!this.rowExpanded && !this.colExpanded) {
            this.allExpanded = false;
        } else if (this.rowExpanded && this.colExpanded) {
            this.allExpanded = true;
        }

        objArray.forEach((row) => {
            let obj = drilledGroups.find((obj) => obj.name === row.name);
            if (obj) {
                drilledGroups = drilledGroups.filter((obj) => {
                    return obj.name !== row.name;
                });
            } else {
                drilledGroups.push({ name: row.name });
            }
        });

        drilledGroups.forEach((member) => {
            let itemArray = this.pivot.engineModule.fieldList[member.name].dateMember.map(function (
                obj
            ) {
                return obj.formattedText;
            });
            member['items'] = itemArray;
        });

        this.pivot.dataSourceSettings.drilledMembers = drilledGroups;

        this.pivot.refresh();
    }

    /**
     * <p> Expand/Collapse All, Rows or Columns of the pivot control </p>
     *
     * @param args : property of the pivot grid to expand/collapse
     */
    expand(args) {
        switch (args) {
            case 'All':
                this.expandAll(args);
                this.pivot.refresh();
                break;
            case 'Rows':
                this.expandSpecific('Rows');
                break;
            case 'Columns':
                this.expandSpecific('Columns');
                break;
            default:
                break;
        }
    }

    /**
     * <p> Update the fieldlist using the dataSource from the PivotView component </p>
     */
    afterEnginePopulate(args: EnginePopulatedEventArgs): void {
        Object.keys(this.pivot.engineModule.fieldList).forEach((key, index) => {
            let field: any = this.selectedColumns.find((elem) => elem['CodeCode'] === key);
            if (field && field.CodeDescription) {
                this.pivot.engineModule.fieldList[key].caption = field.CodeDescription;
            }
        });

        if (!Browser.isDevice && this.fieldList && this.pivot) {
            this.fieldList.update(this.pivot);
        }
    }

    /**
     * <p> Sets the pivot view data source properties </p>
     *
     * @param values : array of meta data used to set the pivot view property
     */
    private setPivotData(values) {
        let pivotValues: any = [];
        if (!Utils.isArrayEmpty(values)) {
            values.forEach((value) => {
                if (value.CodeCode) {
                    let element = {
                        name: value.CodeCode,
                        caption: value.CodeDescription || value.CodeCode
                    };
                    if (value.CodeAggregate) {
                        switch (value.CodeAggregate.CodeCode) {
                            case 'Average':
                                element['type'] = 'Avg';
                                break;
                            case 'Minimum':
                                element['type'] = 'Min';
                                break;
                            case 'Maximum':
                                element['type'] = 'Max';
                                break;
                            case 'Distinct Count':
                                element['type'] = 'DistinctCount';
                                break;
                            default:
                                element['type'] = value.CodeAggregate.CodeCode.replace(
                                    '%',
                                    'Percentage'
                                )
                                    .replace('of', 'Of')
                                    .replace(' ', '');
                                break;
                        }
                    }
                    pivotValues.push(element);
                }
            });
        }

        return pivotValues;
    }

    /**
     * <p> Sets the viewMode passed from data-utils-view container </p>
     *
     * @param mode : the view mode being passed through
     */
    set setViewMode(mode) {
        this.viewMode = mode;
    }

    /**
     * <p> Sets the selectedColumns of the pivot component </p>
     *
     * @param columns : metadata for columns
     */
    set setSelectedColumns(columns) {
        this.selectedColumns = columns;
    }

    /**
     * <p> Sets the selectedValues of the pivot component (i.e. values in the pivot view) </p>
     *
     * @param columns : metadata for columns (values in the pivot view)
     */
    set setSelectedValues(columns) {
        let pivotValues: any = [];
        columns
            .filter((val) => val.CodeAggregate)
            .forEach((elem) => {
                if (
                    elem.CodeAggregate &&
                    elem.CodeAggregate.CodeCode &&
                    elem.CodeAggregate.CodeCode !== 'None'
                ) {
                    pivotValues.push(elem);
                }
            });
        this.selectedValues = pivotValues;
    }

    /**
     * <p> Set the rowHeight of the pivot grid </p>
     */
    set setRowHeight(val) {
        if (this.pivot) {
            this.pivot.gridSettings.rowHeight = val;
        }
    }

    /**
     * sets the grid lines of pivot
     * @param gridLines : gridLine setting
     */
    setGridLines(gridLines) {
        if (this.pivot) {
            this.pivot.gridSettings.gridLines = gridLines;
        }
    }

    /**
     * <p> Sets the selectedGroups of the pivot component (i.e. columns in the pivot view) </p>
     *
     * @param groups : metadata for groups (columns in the pivot view)
     */
    set setSelectedGroups(groups) {
        let pivotColumns: any = [];
        groups
            .filter((col) => col.CodeGroupBy === 'Column')
            .forEach((elem) => {
                pivotColumns.push(elem);
            });
        this.selectedGroups = pivotColumns;
    }

    /**
     * <p> Sets the selectedRows of the pivot component (i.e. rows in the pivot view) </p>
     *
     * @param rows : metadata for rows
     */
    set setSelectedRows(rows) {
        let pivotRows: any = [];
        rows.filter((col) => col.CodeGroupBy === 'Row').forEach((elem) => {
            pivotRows.push(elem);
        });
        this.selectedRows = pivotRows;
    }

    /**
     * <p> Sets the dataSource of the pivot component </p>
     *
     * @param data : data from the backend (needs to be flattened)
     */
    set setDataSource(data) {
        this.dataSource = data;
        // this.loadDataSource();
    }

    /**
     * <p> Triggered on load of the Field List </p>
     */
    onLoad(): void {
        if (Browser.isDevice) {
            this.fieldList.renderMode = 'Popup';
            this.fieldList.target = '.control-section';
            document.getElementById('PivotFieldList').removeAttribute('style');
            setStyleAttribute(document.getElementById('PivotFieldList'), {
                height: 0,
                float: 'left'
            });
        }
    }

    /**
     * <p> Show the field list dialog </p>
     */
    showFieldListDialog() {
        this.fieldList.dialogRenderer.fieldListDialog.show();
    }

    /**
     * <p> Show the number formatting dialog </p>
     */
    showNumberFormattingDialog() {
        this.pivot.showNumberFormattingDialog();
    }

    /**
     * <p> Show the conditional formatting dialog </p>
     */
    showConditionalFormattingDialog() {
        this.pivot.showConditionalFormattingDialog();
    }

    /**
     * <p> Show the calculated field dialog </p>
     */
    showCalculatedFieldDialog() {
        this.pivot.createCalculatedFieldDialog();
    }

    /**
     * <p> Change Grand Totals Setting </p>
     *
     * @param view : view that's being passed from the action
     */
    displayGrandTotals(view) {
        if (view && view.CodeCode) {
            switch (view.CodeCode) {
                case 'All':
                    this.pivot.dataSourceSettings.showGrandTotals = true;
                    this.pivot.dataSourceSettings.showRowGrandTotals = true;
                    this.pivot.dataSourceSettings.showColumnGrandTotals = true;
                    break;
                case 'Columns Only':
                    this.pivot.dataSourceSettings.showGrandTotals = true;
                    this.pivot.dataSourceSettings.showRowGrandTotals = false;
                    this.pivot.dataSourceSettings.showColumnGrandTotals = true;
                    break;
                case 'Rows Only':
                    this.pivot.dataSourceSettings.showGrandTotals = true;
                    this.pivot.dataSourceSettings.showColumnGrandTotals = false;
                    this.pivot.dataSourceSettings.showRowGrandTotals = true;
                    break;
                case 'None':
                    this.pivot.dataSourceSettings.showGrandTotals = false;
                    break;
                default:
                    this.toastService.addErrorMessage('Invalid Selection: ' + view.CodeCode);
                    break;
            }
            this.pivot.refresh();
        }
    }

    /**
     * <p> Change Sub Totals Setting </p>
     *
     * @param view : view that's being passed from the action
     */
    displaySubTotals(view) {
        if (view && view.CodeCode) {
            switch (view.CodeCode) {
                case 'All':
                    this.pivot.dataSourceSettings.showSubTotals = true;
                    this.pivot.dataSourceSettings.showRowSubTotals = true;
                    this.pivot.dataSourceSettings.showColumnSubTotals = true;
                    break;
                case 'Columns Only':
                    this.pivot.dataSourceSettings.showSubTotals = true;
                    this.pivot.dataSourceSettings.showRowSubTotals = false;
                    this.pivot.dataSourceSettings.showColumnSubTotals = true;
                    break;
                case 'Rows Only':
                    this.pivot.dataSourceSettings.showSubTotals = true;
                    this.pivot.dataSourceSettings.showRowSubTotals = true;
                    this.pivot.dataSourceSettings.showColumnSubTotals = false;
                    break;
                case 'None':
                    this.pivot.dataSourceSettings.showSubTotals = false;
                    break;
                default:
                    this.toastService.addErrorMessage('Invalid Selection: ' + view.CodeCode);
                    break;
            }
            this.pivot.refresh();
        }
    }

    /**
     * <p> Load a specific view/layout </p>
     *
     * @param view : the type view to load (can be object or string)
     */
    loadView(view) {
        if (view && typeof view === 'object' && view.CodeCode) {
            view = view.CodeCode.replace(' ', '');
        }

        if (view === 'Table' || view === 'Grid' || view === undefined) {
            this.pivot.currentView = 'Table';
            this.pivot.setProperties(
                {
                    displayOption: { primary: 'Table' }
                },
                true
            );
            this.pivot.refresh();
        } else if (this.chartOptions.indexOf(view) >= 0) {
            this.pivot.currentView = 'Chart';
            this.pivot.setProperties(
                {
                    displayOption: { primary: 'Chart' },
                    chartSettings: { chartSeries: { type: view as any } }
                },
                true
            );
            this.pivot.refresh();
        } else {
            this.toastService.addErrorMessage('Invalid Selection: ' + view);
        }
    }

    /**
     * <p> Triggered after data is bound to the pivot component </p>
     */
    ondataBound(): void {
        if (Browser.isDevice) {
            prepend(
                [document.getElementById('PivotFieldList')],
                document.getElementById('PivotView')
            );
        }
    }

    /**
     * <p> Triggered after populate of the pivot to populate the field list </p>
     */
    afterPopulate(arge: EnginePopulatedEventArgs): void {
        if (this.fieldList && this.pivot) {
            this.fieldList.updateView(this.pivot);
        }
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
