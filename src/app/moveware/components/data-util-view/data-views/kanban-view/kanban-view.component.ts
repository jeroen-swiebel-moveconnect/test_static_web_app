import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CollectionsService } from 'src/app/moveware/services';
import {
    CardSettingsModel,
    ColumnsModel,
    SwimlaneSettingsModel
} from '@syncfusion/ej2-angular-kanban';
import { Kanban } from '@syncfusion/ej2-kanban';
import { ToastService } from 'src/app/moveware/services/toast.service';
import Utils from 'src/app/moveware/services/utils';
import { DataViewMetaData } from 'src/app/moveware/models';
/**
 * This is Kanban component which handles kanban board related functions.
 */
@Component({
    selector: 'kanban-view',
    templateUrl: './kanban-view.component.html',
    styleUrls: ['./kanban-view.component.scss']
})
export class KanbanViewComponent implements OnInit {
    viewMode: string;
    selectedRecord: Object;
    columns: Array<Object>;
    @Input() currentPage: Object;
    @Input() currentView: Object;
    dataSource: Array<Object>;
    metaData: DataViewMetaData;
    @Output() onRecordSelection = new EventEmitter<any>();
    @ViewChild('kanbanBoard') kanbanBoard: Kanban;
    selectedColumns: ColumnsModel[] = [];
    kanbanColumns: ColumnsModel[] = [];
    currentCard: Object;
    keyField: string = '';
    swimlaneField: string = '';
    colOptions: Array<Object> = [];
    rowOptions: Array<Object> = [];
    previousColumn: string;
    previousSwimlane: string;
    rawData: any;
    headerVisible: boolean;
    gridRowShading: any;

    public cardSettings: CardSettingsModel = {
        headerField: '_id',
        showHeader: false,
        selectionType: 'Single'
    };
    public swimlaneSettings: SwimlaneSettingsModel;

    /**
     * <p>Constructor</p>
     * @param broadcaster is broadcaster
     * @param contextService is context service
     * @param gridService is grid service
     * @param toastService is toast message service
     * @param collectionService is collection service
     */
    constructor(
        private broadcaster: Broadcaster,
        public contextService: ContextService,
        public gridService: GridService,
        private toastService: ToastService,
        private collectionService: CollectionsService
    ) {}
    /**
     * <p>ngOnInit lifecycle method</p>
     */
    ngOnInit() {}

    /**
     * <p> gets the data for Kanban Component </p>
     */
    getData() {
        this.columns = this.metaData.selectedColumns;
        this.viewMode = this.metaData.viewMode;
        this.headerVisible = this.metaData.headerVisible;
        this.gridRowShading = this.metaData.rowShading;
        this.setProperties(this.columns);
        if (Utils.isArrayEmpty(this.rowOptions)) {
            this.setGroupData();
        }
    }

    /**
     * <p> Finds the keyField and sets the column & row groupings </p>
     *
     * @param fields : all of the fields set in the designer
     */
    public setProperties(fields) {
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            if (field.CodeGroupBy === 'Column' && Utils.isArrayEmpty(this.kanbanColumns)) {
                this.keyField = field.CodeCode;
                this.colOptions = field['options'];
                this.colOptions.forEach((option) => {
                    this.kanbanColumns.push({
                        headerText: option['CodeDescription'],
                        keyField: option['CodeDescription'],
                        allowToggle: true
                    });
                });
            } else if (
                (field.CodeGroupBy === 'Row' && this.swimlaneField === '') ||
                field.CodeCode === this.swimlaneField
            ) {
                if (!this.swimlaneField) {
                    this.swimlaneField = field.CodeCode;
                }
                if (field['options']) {
                    this.rowOptions = field['options'];
                }
                this.swimlaneSettings = {
                    keyField: field.CodeCode,
                    allowDragAndDrop: true
                };
            }
        }
    }

    /**
     * <p>Drag start event from kanban component. Triggers when the card drag actions starts.</p>
     * @param $event is Kanban drag event.
     */
    dragStart($event) {
        this.previousColumn = $event.data[0][this.keyField];
        if (this.swimlaneField) {
            this.previousSwimlane = $event.data[0][this.swimlaneField];
        }
    }

    /**
     * <p>Drag stop event from kanban component. Triggers when the card drag actions stops.</p>
     * @param $event is Kanban drag event.
     */
    dragStop($event) {
        this.updateBoard($event);
    }

    /**
     * <p>Card click event from kanban component. Triggers on single-clicking the Kanban cards.</p>
     * @param $event is mouse click event.
     */
    cardClick($event) {
        this.currentCard = this.kanbanBoard.getCardDetails($event.element);
        this.selectedRecord = $event.data;
        let eventData = {
            eventType: 'DISPLAY_CHILDREN',
            data: $event.data,
            parent: this.currentPage['CodeElement'],
            mode: StandardCodes.VIEW_UPDATE_MODE
        };
        this.onRecordSelection.emit(eventData);
    }

    /**
     * <p>Broadcaster event for updating the card when changes are made on data form.</p>
     */
    updateRecord(card) {
        if (this.kanbanBoard) {
            //   this.kanbanBoard.updateCard(card);
            const selectedRows = this.kanbanBoard.getSelectedCards();
            const selectedRow = {};
            if (selectedRows.length) {
                const selectedRow = selectedRows[0];
                for (let field in card) {
                    selectedRow['data'][field] = card[field];
                }
            }

            this.kanbanBoard.updateCard(selectedRow);
        }
    }

    /**
     * <p>Update kanban board when dragging cards from one column to another column.</p>
     * @param data is an array of type object which has the details of card from the event.
     */
    updateBoard(event: object) {
        if (!Utils.isArrayEmpty(event['data'])) {
            let ref = this;
            let codeValue = event['data'][0][this.keyField];
            let option = this.colOptions.find((obj) => obj['CodeDescription'] === codeValue);
            let field = Utils.getCopy(option);
            field['CodeCode'] = this.keyField;
            field['CodeValue'] = option;
            field['options'] = this.colOptions;
            let payload: any = [];
            if (this.swimlaneField) {
                payload.push(field);
                codeValue = event['data'][0][this.swimlaneField];
                if (!Utils.isArrayEmpty(this.rowOptions)) {
                    option = this.rowOptions.find((obj) => obj['CodeDescription'] === codeValue);
                    field = Utils.getCopy(option);
                    field['CodeCode'] = this.swimlaneField;
                    field['CodeValue'] = option;
                    field['options'] = this.rowOptions;
                } else {
                    field = {
                        CodeCode: this.swimlaneField,
                        CodeValue: codeValue
                    };
                }
                payload.push(field);
            } else {
                payload = field;
            }

            // let context = this.contextService.getContextRecord([
            //     this.currentView['contextKey'] + this.currentView['communicationId']
            // ]);
            let context = {
                dataObjectCodeCode: this.currentView['dataObjectCodeCode'],
                viewId: this.currentView['_id'],
                _id: event['data'][0]['_id']
            };
            let reqObject = this.gridService.buildReqObject(payload, event['data'][0], context);
            this.collectionService.updateCollectionItem(reqObject).subscribe(
                (response) => {
                    let eventData = {
                        eventType: 'DISPLAY_CHILDREN',
                        data: event['data'][0],
                        parent: this.currentPage['CodeElement'],
                        mode: StandardCodes.VIEW_UPDATE_MODE
                    };
                    this.onRecordSelection.emit(eventData);
                    this.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORDS_UPDATED);
                },
                (error) => {
                    let currentCard = ref.kanbanBoard.getCardDetails(event['element']);
                    currentCard[this.keyField] = ref.previousColumn;
                    if (this.swimlaneField) {
                        currentCard[this.swimlaneField] = ref.previousSwimlane;
                    }
                    this.kanbanBoard.updateCard(currentCard);
                    ref.toastService.showCustomToast('error', error);
                }
            );
        }
    }

    set setDataSource(data) {
        // data = Utils.flattenObject(data);
        let flattenedData = Utils.getCopy(data);
        this.dataSource = Utils.flattenObject(flattenedData);
        this.rawData = data;
    }

    set setRowGrouping(data) {
        if (data) {
            if (data.length > 0) {
                this.swimlaneField = data[0]['CodeCode'];
                if (data[0]['options']) {
                    this.rowOptions = data[0]['options'];
                }
            } else {
                this.swimlaneField = null;
            }

            this.swimlaneSettings = {
                keyField: this.swimlaneField,
                allowDragAndDrop: true,
                showEmptyRow: true,
                showItemCount: true
            };
            // this.kanbanBoard.swimlaneSettings.keyField = this.swimlaneField;
            this.kanbanBoard.refresh();
        }
    }

    private setGroupData() {
        this.rawData.forEach((element) => {
            if (element[this.swimlaneField]) {
                if (this.rowOptions.indexOf(element[this.swimlaneField]) < 0) {
                    this.rowOptions.push(element[this.swimlaneField]);
                }
            }
        });
    }

    /**
     * <p> To add a row in the grid</p>
     * @param row : Row to be updated
     */
    public add(row): void {
        //Add card goes here
    }
    /**
     * <p> To delete selected row</p>
     *
     */
    public delete(): void {
        //Delete card goes here
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
