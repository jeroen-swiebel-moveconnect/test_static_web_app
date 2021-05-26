import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    SimpleChange,
    ViewChild
} from '@angular/core';
import {
    EditSettingsModel,
    GridComponent,
    IEditCell,
    ReorderService
} from '@syncfusion/ej2-angular-grids';
import { Button } from '@syncfusion/ej2-buttons';
import { Query } from '@syncfusion/ej2-data';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { GridService } from 'src/app/moveware/services/grid-service';
import Utils from 'src/app/moveware/services/utils';

@Component({
    selector: 'filterpane',
    templateUrl: './filterpane.component.html',
    providers: [ReorderService],
    styleUrls: ['./filterpane.component.scss']
})
export class FilterPane implements OnInit {
    @Output() loadFilter: EventEmitter<any> = new EventEmitter();
    @Output() updateView: EventEmitter<boolean> = new EventEmitter();
    public displayedColumns: Array<any>;
    public groupOptions: Array<any>;
    public currentView: any;
    public currentPage: any;
    public currentRecord: any;
    public currentType: any;

    customisedColumns: Array<any> = [];
    private customisedGrouping: Array<any> = [];
    private rowOptions: Array<any> = [];
    private customisedRows: Array<any> = [];
    private customisedSummary: Array<any> = [];
    @ViewChild('groupbygrid')
    public customisedGroupByGridInstance: GridComponent;
    public filtersList: any;
    public editSettings: EditSettingsModel;
    private customisedSummaryOptions = [
        { label: 'Count', code: 'Count' },
        { label: 'Sum', code: 'Sum' },
        { label: 'Average', code: 'Average' }
    ];
    allColumns: Array<any> = [];
    taskCode: string;
    public checkBoxFields: Object = { text: 'CodeDescription', id: '_id' };
    @ViewChild('columnsgrid') columnsGrid: GridComponent;
    @ViewChild('groupbygrid') groupbyGrid: GridComponent;
    public filtersCopy: any;
    public showResetButton: boolean = false;
    constructor(
        private gridService: GridService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {}
    /**
     * <p> Filterpane initialization</p>
     *
     *  */
    ngOnInit() {
        let data = this.config.data.data;
        this.currentView = data.currentView;
        this.currentPage = data.currentPage;
        this.currentRecord = data.currentRecord;
        this.currentType = data.currentType;
        this.filtersList = data.filtersList;
        this.displayedColumns = data.displayedColumns;
        this.allColumns = Utils.getCopy(data.displayedColumns);
        this.customisedColumns = Utils.getCopy(data.selectedColumns);
        this.groupOptions = Utils.getCopy(data.groupOptions);
        this.taskCode = data.task;
        this.editSettings = {
            allowEditing: true,
            mode: 'Normal'
        };
        this.setFieldProrerties();
        if (!Utils.isArrayEmpty(this.filtersList)) {
            this.filtersCopy = Utils.getCopy(this.filtersList);
        }
        $('.ui-widget-overlay').css('background-color', 'transparent');
        $('.window-dialog')?.parent()?.addClass('window-mask');
    }
    handleClick(rowData) {
        let sortValue;
        if (!rowData.sorted) {
            rowData.sorted = 'ASC';
            sortValue = 'ASC';
        } else if (rowData.sorted === 'ASC') {
            rowData.sorted = 'DESC';
            sortValue = 'DESC';
        } else if (rowData.sorted === 'DESC') {
            rowData.sorted = undefined;
            sortValue = undefined;
        }
        if (this.groupbyGrid) {
            let groupIndex = this.groupOptions.findIndex((option) => {
                return option.CodeCode === rowData.CodeCode;
            });
            this.groupOptions[groupIndex]['sorted'] = sortValue;
        } else if (this.columnsGrid) {
            let columnIndex = this.allColumns.findIndex((option) => {
                return option.CodeCode === rowData.CodeCode;
            });
            this.allColumns[columnIndex]['sorted'] = sortValue;
        }
    }
    ngOnChanges(changes: SimpleChange) {
        if (
            changes['selectedColumns'] &&
            changes['selectedColumns'].currentValue &&
            changes['selectedColumns'].currentValue != changes['selectedColumns'].previousValue
        ) {
            this.customisedColumns = Utils.getCopy(changes['selectedColumns'].currentValue);
        }
    }

    /**
     * <p> This method is used for setting DateTime Filters.</p>
     *
     * @param filter : Selected fitler
     * @param event
     * @param type
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
            this.applyFilters(filter, filter.value, true);
        }
    }

    loadDynamicFilter(event) {
        this.applyFilters(event['field'], event['filterValue'], true);
    }

    /**
     * <p> To load the data in selected view type</p>
     * @param event : Selected view type
     */
    public updateLayout(event) {
        this.updateView.emit(event);
    }

    /**
     * <p> To perform action upon closing the dailog</p>
     */
    public onDialogCloseAndApply() {
        if (this.taskCode === StandardCodes.TOOLBAR_FILTER_LIST) {
            this.dialogRef.close(this.filtersList);
        } else if (this.taskCode === StandardCodes.TOOLBAR_COLUMN_LIST) {
            let event = {
                displayedColumns: this.allColumns,
                customisedColumns: this.customisedColumns
            };
            this.dialogRef.close(event);
        } else if (this.taskCode === StandardCodes.TOOLBAR_GROUPBY_ROW_LIST) {
            let event = {
                groupOptions: this.groupOptions,
                customisedGrouping: this.customisedGrouping
            };
            this.dialogRef.close(event);
        }
    }

    public onFiltersReset() {
        if (!Utils.isArrayEmpty(this.filtersList) && !Utils.isArrayEmpty(this.filtersCopy)) {
            this.filtersList = Utils.getCopy(this.filtersCopy);
            this.showResetButton = false;
        }
    }
    public onDialogCloseAndCancel() {
        this.dialogRef.close();
    }

    onCheckBoxSelect(event) {
        event.data['isChecked'] = event['isChecked'];
        this.showResetButton = true;
    }
    /**
     * <p> To filterpane's customise the layout  </p>
     * @param type : Specifies the type of the customization
     * @param option : Specifies Customization option
     */

    public customiseLayout(type, option, indexOfData?) {
        if (option) {
            if (type.startsWith('Group')) {
                if (!Utils.isArrayEmpty(this.customisedGrouping)) {
                    this.customisedGrouping = this.gridService.reorderObjectBasedOnAnother(
                        this.customisedGrouping,
                        this.groupOptions
                    );
                }
                if (option && (type === 'GroupSelect' || type === 'GroupUnselect')) {
                    this.displayedColumns = this.gridService.setPropertyToDisabled(
                        type === 'GroupSelect',
                        this.displayedColumns,
                        option
                    );
                    this.rowOptions = this.gridService.setPropertyToDisabled(
                        type === 'GroupSelect',
                        this.rowOptions,
                        option
                    );
                }
            } else if (type.startsWith('Sort')) {
                if (type.startsWith('SortCol')) {
                    let column = this.displayedColumns.find(
                        (obj) => obj.CodeCode === option.CodeCode
                    );
                    if (column) {
                        column = this.gridService.getSortOrder(column);
                    }
                    indexOfData = this.allColumns.findIndex(
                        (field) => field.CodeCode === column.CodeCode
                    );
                    option.sorted = column.sorted;
                    this.allColumns[indexOfData] = column;
                } else {
                    let row = this.rowOptions.find((obj) => obj.CodeCode === option.CodeCode);
                    if (row) {
                        row = this.gridService.getSortOrder(row);
                    }
                }
            } else if (type.startsWith('Col')) {
                if (!Utils.isArrayEmpty(this.customisedColumns)) {
                    this.customisedColumns = this.gridService.reorderObjectBasedOnAnother(
                        this.customisedColumns,
                        this.displayedColumns
                    );
                }
                if (option && (type === 'ColSelect' || type === 'ColUnselect')) {
                    let column = this.displayedColumns.find(
                        (obj) => obj.CodeCode === option.CodeCode
                    );
                    if (column) {
                        column['selected'] = type === 'ColSelect';
                    }
                }
            } else if (type.startsWith('Row')) {
                if (!Utils.isArrayEmpty(this.customisedRows)) {
                    this.customisedRows = this.gridService.reorderObjectBasedOnAnother(
                        this.customisedRows,
                        this.rowOptions
                    );
                }
                if (option && (type === 'RowSelect' || type === 'RowUnselect')) {
                    let row = this.rowOptions.find((obj) => obj.CodeCode === option.CodeCode);
                    if (row) {
                        row['selected'] = type === 'RowSelect';
                    }
                }
            } else if (type.startsWith('Summary')) {
                this.customisedSummary.forEach((s) => {
                    if (!s['totalCalc']) {
                        s['totalCalc'] = this.customisedSummaryOptions[0];
                    }
                });
            }
        }
    }

    public updateCheckedValues(filterType, event, rowData) {
        let type, indexOfData;
        if (filterType.startsWith('Col')) {
            type = event.checked ? 'ColSelect' : 'ColUnselect';
            indexOfData = this.customisedColumns.findIndex(
                (field) => field.CodeCode === rowData.CodeCode
            );
            event.checked
                ? this.customisedColumns.push(rowData)
                : this.customisedColumns.splice(indexOfData, 1);
            indexOfData = this.displayedColumns.findIndex(
                (field) => field.CodeCode === rowData.CodeCode
            );
            this.allColumns[indexOfData]['CodeColumnPriority'] = event.checked ? 0 : 12;
        } else if (filterType.startsWith('Group')) {
            type = event.checked ? 'GroupSelect' : 'GroupUnselect';
            indexOfData = this.customisedGrouping.findIndex(
                (field) => field.CodeCode === rowData.CodeCode
            );
            event.checked
                ? this.customisedGrouping.push(rowData)
                : this.customisedGrouping.splice(indexOfData, 1);
            indexOfData = this.groupOptions.findIndex(
                (field) => field.CodeCode === rowData.CodeCode
            );
            this.groupOptions[indexOfData]['isChecked'] = event.checked;
            if (event.checked && this.groupbyGrid) {
                this.groupOptions[indexOfData]['sorted'] = 'ASC';
                this.groupbyGrid.refresh();
            } else {
                this.groupOptions[indexOfData]['sorted'] = undefined;
                this.groupbyGrid?.refresh();
            }
        } else if (filterType.startsWith('Row')) {
            type = event.checked ? 'RowSelect' : 'RowUnselect';
            indexOfData = this.customisedRows.findIndex(
                (field) => field.CodeCode === rowData.CodeCode
            );
            event.checked
                ? this.customisedRows.push(rowData)
                : this.customisedRows.splice(indexOfData, 1);
        }
        this.customiseLayout(type, rowData, indexOfData);
    }

    /**
     * <p> To reorder the columns in Grid view
     * @param e: Event generated on Column reordering
     */
    public updateColumnOrder(e, type) {
        setTimeout(() => {
            if (e) {
                let from = e.fromIndex;
                let to = e.dropIndex;
                if (from !== to) {
                    if (type === 'col') {
                        let temp = this.allColumns[to];
                        this.allColumns[to] = this.allColumns[from];
                        this.allColumns[from] = temp;
                    } else {
                        let columns = this.gridService.reorderObjectBasedOnAnother(
                            this.customisedColumns,
                            this.allColumns
                        );
                        this.customisedColumns = Utils.getCopy(columns);
                    }
                }
            }
        });
    }

    /**
     *
     * @param filter : Selected filter
     * @param option : Selected fitler's option
     * @param loadFilters : Boolean param to manke api call
     */
    applyFilters(filter, option, loadFilters) {
        let event = {
            filters: filter,
            option: option,
            loadFilters: loadFilters
        };
        this.showResetButton = true;
        this.loadFilter.emit(event);
    }

    trackByFilterCodeCode(index: number, filter: any) {
        return filter.CodeCode;
    }

    private setFieldProrerties() {
        this.filtersList?.forEach((field) => {
            field.CodeHideLabel = true;
            field.CodeVisible = true;
            if (
                field.values &&
                field.CodeFilterType !== 'Date' &&
                field.CodeFilterType !== 'Date Time' &&
                field.CodeFilterType !== 'Time'
            ) {
                field['options'] = field.values;
            }
            field.isTableCell = false;
            field.headerClass = '';
            field.groupHeaderClass = '';
            field.isFilter = true;
            field.isRange = true;
        });
    }
}
