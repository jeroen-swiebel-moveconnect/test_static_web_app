import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import {
    ColumnMenuService,
    DayMarkersService,
    EditService,
    EditSettingsModel,
    FilterService,
    GanttComponent,
    PdfExportService,
    ReorderService,
    SelectionService,
    SortService,
    ToolbarService
} from '@syncfusion/ej2-angular-gantt';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { CollectionsService } from 'src/app/moveware/services';
import { DataViewMetaData } from 'src/app/moveware/models';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { UserService } from 'src/app/moveware/services/user-service';
import Utils from 'src/app/moveware/services/utils';
import { columnSelected } from '@syncfusion/ej2-grids';

@Component({
    selector: 'app-gantt-view',
    templateUrl: './gantt-view.component.html',
    styleUrls: ['./gantt-view.component.scss'],
    providers: [
        ColumnMenuService,
        DayMarkersService,
        EditService,
        FilterService,
        PdfExportService,
        ReorderService,
        SelectionService,
        SortService,
        ToolbarService
    ]
})
export class GanttViewComponent implements OnInit {
    /**
     * <p>Constructor</p>
     * @param toastService is toast message service
     * @param collectionService is collection service for API calls
     * @param userService is user service for user information
     */
    constructor(
        private collectionService: CollectionsService,
        private toastService: ToastService,
        private userService: UserService
    ) {}

    @Output() handleAction = new EventEmitter<any>();
    @Output() onRecordSelection = new EventEmitter<any>();
    @ViewChild('gantt') public gantt: GanttComponent;

    dataSource: Array<Object>;
    metaData: DataViewMetaData;
    currentView: any;
    currentPage: any;
    selectedColumns: any[];
    groupByColumns: any[];
    currentRecord: any;
    rowHeight: Number;
    gridLines: any;
    headerVisible: boolean;
    gridRowShading: any;

    public data: object[];
    public taskSettings: object;
    public timelineSettings: object;
    public editSettings: EditSettingsModel;
    public toolbar: any;
    public columns: object[];
    public splitterSettings: object;
    public isExpanded: Boolean = true;
    public formAction: Boolean = false;

    private validUnits = ['Year', 'Month', 'Week', 'Day', 'Hour'];

    ngOnInit(): void {}

    getData() {
        this.data = this.dataSource;

        this.taskSettings = {
            id: '_id',
            number: 'FileNumber',
            name: 'FileDescription',
            startDate: 'DateFrom',
            endDate: 'DateTo',
            dependency: 'Predecessor',
            child: 'children',
            notes: 'FileNotes'
        };

        this.columns = this.setColumns(this.metaData.allColumns);
        this.rowHeight = this.metaData.rowHeight;
        this.headerVisible = this.metaData.headerVisible;
        this.gridRowShading = this.metaData.rowShading;

        this.splitterSettings = {
            columnIndex: 2
        };

        this.setTimePeriod(this.metaData.timeScale);

        this.editSettings = {
            allowAdding: true,
            allowEditing: true,
            allowDeleting: true,
            allowTaskbarEditing: true,
            showDeleteConfirmDialog: true
        };

        this.toolbar = this.setToolbarItems();

        this.gridLines = this.metaData.gridLines;
    }

    /**
     * <p> Triggered when the expand button is clicked </p>
     */
    expand() {
        if (this.isExpanded) {
            this.gantt.collapseAll();
            this.isExpanded = false;
        } else {
            this.gantt.expandAll();
            this.isExpanded = true;
        }
    }

    /**
     * <p> Action Complete event from gantt component; triggers when an action is completed </p>
     * @param $event : gantt action complete event
     */
    actionComplete($event) {
        if ($event && !this.formAction) {
            if ($event.requestType === 'delete') {
                this.deleteTask($event.data[0]);
            } else if ($event.requestType === 'add') {
                this.addTask($event.data);
            } else if ($event.requestType === 'save') {
                this.updateTask($event.data);
            }
        }
        this.formAction = false;
    }

    /**
     * <p> Double Click action on a gantt record triggered </p>
     * @param $event : gantt record double click event
     */
    onDoubleClick($event) {
        if (this.metaData.doubleClickAction) {
            this.gantt.cancelEdit();
            this.handleAction.emit({
                action: this.metaData.doubleClickAction,
                event: $event.rowData
            });
        }
    }
    /**
     * <p> Action ToolbarClick event from gantt component; triggers when the toolbar is clicked </p>
     * @param args : gantt toolbar click event
     */
    toolbarClick(args: ClickEventArgs) {
        if (args) {
            if (args.item.text === 'Expand All') {
                this.isExpanded = true;
            } else if (args.item.text === 'Collapse All') {
                this.isExpanded = false;
            } else if (args.item.text === 'Excel export') {
                this.gantt.excelExport();
            } else if (args.item.text === 'CSV export') {
                this.gantt.csvExport();
            } else if (args.item.text === 'PDF export') {
                this.gantt.pdfExport();
            } else if (this.validUnits.indexOf(args.item.text) >= 0) {
                this.setTimePeriod(args.item.text);
            }
        }
    }

    /**
     * <p> Row select event registered on a gantt chart record </p>
     * @param $event : row select event
     */
    onRowSelect($event) {
        if ($event.data) {
            this.loadTask($event.data);
        }
    }

    /**
     * <p> Load a gantt chart task in a form </p>
     *
     * @param data : the task data to be loaded in a form
     */
    loadTask(data) {
        if (!Utils.isObjectsEqual(this.currentRecord, data)) {
            let taskData = {
                eventType: 'DISPLAY_CHILDREN',
                data: data,
                parent: this.currentPage['CodeElement'],
                mode: StandardCodes.VIEW_UPDATE_MODE
            };
            this.onRecordSelection.emit(taskData);
            this.currentRecord = Utils.getCopy(data);
        }
    }

    /**
     * <p> Registering creation of an record via the data form </p>
     * @param record : the record that has been added via the data form
     */
    add(record) {
        if (this.gantt) {
            this.formAction = true;
            this.gantt.addRecord(record);
        }
    }

    /**
     * <p> Creates a record from the task that is created in the gantt component</p>
     * @param data : This is the task data that is created in the gantt component
     */
    addTask(data) {
        if (data) {
            let taskId = data['_id'];
            let index = data['index'];
            let taskObj: Object = {
                _id: StandardCodesIds.FILE_TYPE_PROJECT_ID,
                CodeCode: 'Project',
                CodeDescription: 'Project',
                CodeIsActivity: false
            };
            data['_id'] = undefined;
            let reqObject = this.buildReqObject(data, 'create');
            if (!Utils.isObjectEmpty(reqObject)) {
                this.collectionService.addCollectionItem(reqObject).subscribe(
                    (response) => {
                        if (response.body) {
                            data['_id'] = JSON.parse(response.body).id || undefined;
                        }
                        data['FileType'] = taskObj;
                        if (data['_id'] === undefined) {
                            this.gantt.deleteRecord(taskId);
                            this.toastService.addErrorMessage(
                                data['FileDescription'] + ' add failed. '
                            );
                        } else {
                            // this.gantt.updateTaskId(undefined, data['_id']);
                            // this.gantt.dataSource[0]['_id'] = data['_id'];
                            // this.gantt.ids[0] = data['_id'];

                            if (taskId) {
                                this.gantt.updateTaskId(taskId, data._id);
                                this.gantt.updateRecordByID(data);
                            } else {
                                this.gantt.updateRecordByIndex(index, data);
                            }

                            this.toastService.addSuccessMessage(
                                data['FileDescription'] + ' added successfully. '
                            );
                            setTimeout(() => {
                                this.selectRow(0);
                            }, 200);
                        }
                    },
                    (error) => {
                        this.toastService.showCustomToast('error', error);
                        if (this.gantt) {
                            this.gantt.refresh();
                        }
                    }
                );
            }
        }
    }

    /**
     * <p> Registering deletion of a record via the data form </p>
     * @param record : the record that has been deleted via the data form
     */
    delete(record) {
        if (this.gantt) {
            this.formAction = true;
            this.gantt.editSettings.showDeleteConfirmDialog = false;
            this.gantt.deleteRecord(record);
            setTimeout(() => {
                this.selectRow(record['index']);
            }, 200);
            this.gantt.editSettings.showDeleteConfirmDialog = true;
        }
    }

    /**
     * <p> Deletes a record from the task that is deleted in the gantt component</p>
     * @param data : This is the task data that is deleted in the gantt
     */
    deleteTask(data) {
        if (data) {
            let reqObject = this.buildReqObject(data, 'delete');
            if (!Utils.isObjectEmpty(reqObject)) {
                this.collectionService.removeCollectionItem(reqObject).subscribe(
                    (response) => {
                        this.toastService.addSuccessMessage(
                            data['FileDescription'] + ' deleted successfully. '
                        );
                        setTimeout(() => {
                            this.selectRow(data['index']);
                        }, 200);
                    },
                    (error) => {
                        this.toastService.showCustomToast('error', error);
                        if (this.gantt) {
                            this.gantt.refresh();
                        }
                    }
                );
            }
        }
    }

    /**
     * <p> Registering update of a record via the data form </p>
     * @param record : the record that has been updated via the data form
     */
    updateRecord(record) {
        if (this.gantt) {
            this.formAction = true;
            this.gantt.updateRecordByID(record);
            // this.gantt.refresh();
        }
    }

    /**
     * <p> Update Task when modified from the Gantt Component </p>
     * @param data : an object representing the record that has been updated from the scheduler
     */
    updateTask(data: object) {
        let reqObject = this.buildReqObject(data);
        if (!Utils.isObjectEmpty(reqObject)) {
            this.collectionService.updateCollectionItem(reqObject).subscribe(
                (response) => {
                    this.loadTask(data);
                    this.toastService.addSuccessMessage(
                        data['FileDescription'] + ' updated successfully. '
                    );
                },
                (error) => {
                    this.toastService.showCustomToast('error', error);
                    if (this.gantt) {
                        this.gantt.refresh();
                    }
                }
            );
        }
    }

    /**
     * sets the grid lines of gantt
     * @param gridLines : gridLine setting
     */
    setGridLines(gridLines) {
        this.gridLines = gridLines;
        if (this.gantt) {
            this.gantt.gridLines = gridLines;
        }
    }

    /**
     * <p> Sets the zoom property of the gantt chart </p>
     * @param zoom : zoom property
     */
    setZoomProperty(zoom) {
        if (this.gantt) {
            switch (zoom) {
                case 'Zoom Out':
                    this.gantt.zoomOut();
                    break;
                case 'Zoom In':
                    this.gantt.zoomIn();
                    break;
                case 'Zoom to Fit':
                    this.gantt.fitToProject();
                    break;
            }
        }
    }

    /**
     * <p> Sets the timelineSetting of the gantt view </p>
     *
     * @param metaData : metaData containing the timescale settings
     */
    private setTimePeriod(timeScale) {
        let topUnit = timeScale?.CodeCode || timeScale;
        let bottomUnit = '';

        if (this.validUnits.indexOf(topUnit) < 0) {
            topUnit = 'Week';
        }

        if (this.validUnits.indexOf(topUnit) >= 0 && topUnit !== 'Hour') {
            bottomUnit = this.validUnits[this.validUnits.indexOf(topUnit) + 1];
        }

        if (bottomUnit === '') {
            bottomUnit = 'None';
        }

        this.timelineSettings = {
            topTier: { unit: topUnit },
            bottomTier: { unit: bottomUnit }
        };
        if (this.gantt) {
            this.gantt.refresh();
        }
    }

    /**
     * <p> Sets the toolbar items based on the gantt metaData </p>
     */
    private setToolbarItems() {
        let toolbarItems: any[] = [
            'Add',
            'Edit',
            'Update',
            'Delete',
            'Cancel',
            'ExpandAll',
            'CollapseAll',
            'ExcelExport',
            'CsvExport'
        ];

        if (this.metaData.timeScale) {
            this.validUnits.forEach((unit) => {
                this.metaData.timeScale.forEach((obj) => {
                    if (obj['CodeCode'] && obj['CodeCode'] === unit) {
                        toolbarItems.push({
                            text: unit,
                            tooltipText: unit,
                            id: unit,
                            align: 'right'
                        });
                    }
                });
            });
        }
        return toolbarItems;
    }

    /**
     * <p> Set columns based on designer setup </p>
     */
    private setColumns(columns) {
        let ganttColumns: any[] = [{ field: '_id', isPrimaryKey: true, visible: false }];

        columns.forEach((col) => {
            if (col['CodeCode'] !== '_id' && col['CodeVisible'] === true) {
                ganttColumns.push({
                    field: col['CodeCode'],
                    headerText: col['CodeDescription'],
                    visible: col['CodeCollapsed'] === 'No',
                    allowEditing: col['CodeEnabled'] === 'Yes'
                });
            }
        });

        return ganttColumns;
    }

    /**
     * <p>Sets the first row as the selected task</p>
     */
    private selectRow(index) {
        if (this.gantt) {
            let dataSource: any = this.gantt.dataSource;
            if (!index || index > dataSource.length) {
                index = 0;
            }
            // let task = this.gantt.getRowByIndex(index);
            this.gantt.selectRow(index);
        }
    }

    /**
     * <p> Sets the dataSource of the gantt component </p>
     *
     * @param data : data from the backend
     */
    set setDataSource(data) {
        data = this.flattenData(data);
        this.dataSource = data;
    }

    /**
     * <p> Set the rowHeight of the gantt chart </p>
     */
    set setRowHeight(val) {
        this.rowHeight = val;
    }

    /**
     * <p> Set the columns of the gantt chart </p>
     */
    set setSelectedColumns(columns) {
        this.gantt.columns.forEach((col) => {
            if (columns.find((obj) => obj['CodeCode'] === col['field'])) {
                if (!col['visible']) {
                    col['visible'] = true;
                }
            } else {
                if (col['visible']) {
                    col['visible'] = false;
                }
            }
        });
        this.gantt.refresh();
    }

    /**
     * <p> Modifies the dataSource to be usable for the gantt view </p>
     *
     * @param data : data from the backend
     */
    private flattenData(data) {
        return data.reduce((acc, obj, idx) => {
            for (const property in obj) {
                if (property === 'data') {
                    for (const p in obj[property]) {
                        if (p === 'Parents' && !Utils.isArrayEmpty(obj[property][p])) {
                            obj[p] = obj[property][p][0];
                        } else {
                            obj[p] = obj[property][p];
                        }
                    }
                    delete obj[property];
                } else if (property === 'children') {
                    obj[property] = this.flattenData(obj[property]);
                }
            }
            acc.push(obj);
            return acc;
        }, []);
    }

    /**
     * <p> Builds the request Object to update a task</p>
     * @param data : The record data to be updated
     */
    private buildReqObject(data, type?) {
        let reqObject = {};
        if (data) {
            let userId = this.userService.getUserId();
            reqObject['meta'] = {
                viewId: this.currentView['_id'],
                userId: userId
            };
            reqObject['type'] = this.currentView['dataObjectCodeCode'];
            if (type && type === 'create') {
                reqObject['payload'] = {
                    DateFrom: data.DateFrom,
                    DateTo: data.DateTo,
                    FileNotes: data.FileNotes,
                    FileSearchName: data.FileSearchName,
                    FileDescription: data.FileDescription,
                    FileType: StandardCodesIds.FILE_TYPE_PROJECT_ID,
                    FileStatus: StandardCodesIds.ACTIVE_STATUS_ID
                };
                reqObject['userId'] = userId;
            } else if (type && type === 'delete') {
                reqObject['_id'] = data['_id'];
            } else {
                reqObject['payload'] = {
                    DateFrom: data.DateFrom,
                    DateTo: data.DateTo,
                    FileSearchName: data.FileSearchName,
                    FileDescription: data.FileDescription,
                    FileNotes: data.FileNotes
                };
                reqObject['_id'] = data['_id'];
            }
        }

        return reqObject;
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
