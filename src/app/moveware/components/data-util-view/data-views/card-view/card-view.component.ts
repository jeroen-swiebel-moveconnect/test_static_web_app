import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Utils from 'src/app/moveware/services/utils';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';

@Component({
    selector: 'cards-view',
    templateUrl: './card-view.component.html',
    styleUrls: ['./card-view.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})
export class CardViewComponent implements OnInit {
    @Input() dataSource: any;
    @Input() selectedColumns: any;
    @Output() onRecordSelection = new EventEmitter<any>();
    @Input() selectedCard: any;
    @Input() isGroupable: any;
    @Output() onCardsSearch = new EventEmitter<any>();
    @Input() columnSearchFilter: any;
    @Input() searchFilters: any;
    @Output() onGridSort = new EventEmitter<any>();
    @Input() rowGroupKey: string;
    @Input() currentFocusedField: any;
    @Input() currentPage: any;
    @Input() currentView: any;
    @Input() calculatedFields: any[];
    @Input() parentChildMap: any;
    @Input() metaData: any;

    layoutView = 'card';
    headerVisible: boolean;
    isEditableGrid: boolean;
    showColumnFilter: boolean;

    constructor(
        private gridService: GridService,
        private contextService: ContextService,
        private actionService: UIActionService,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig
    ) {}

    ngOnInit() {
        this.selectedCard = this.dataSource[0];
        this.isEditableGrid = this.metaData.isEditableGrid;
        this.headerVisible = this.metaData.headerVisible;
        this.showColumnFilter = this.metaData.isColumnFiltersVisible;
        this.onRecordSelection.emit(this.selectedCard);
    }

    private onCardSelection(card) {
        const dataChange = this.contextService.isDataChanged();
        if (dataChange) {
            dataChange.subscribe((result) => {
                if (result) {
                    this.contextService.removeDataChangeState();
                    this.selectedCard = card;
                    let event = card;
                    this.onRecordSelection.emit(event);
                }
            });
        } else {
            this.selectedCard = card;
            let event = card;
            this.onRecordSelection.emit(event);
        }
    }
    private clearSearchText(column) {
        this.columnSearchFilter[column.CodeCode] = '';
        this.onRecordSearch();
    }
    handleActions(column, data, event) {
        let navigationUrl = 'mw/menu';
        navigationUrl = `${navigationUrl}/${column.CodeCode}`;
        let actionType = StandardCodes.UI_ACTION_CLICK;
        event.stopPropagation();
        let selectedData = this.actionService.getActionDetails(column, data, actionType, '');
        // selectedData.selectedRecords = this.selectedList;
        if (selectedData.IsParentContext) {
            selectedData.parentContainerId = this.currentPage['contextKey'];
        } else {
            selectedData.parentContainerId = selectedData.UIContainer;
        }
        this.actionService.actionHandler(
            column,
            data,
            StandardCodes.UI_ACTION_CLICK,
            navigationUrl,
            null,
            this.dialog,
            this.dialogConfig
        );
    }
    updateSearchFilters(event, column) {
        this.columnSearchFilter[column.CodeCode] = event.value;
        let field = {
            key: column.CodeCode,
            value: event.value
        };
        this.onRecordSearch(field);
    }
    onRecordSearch(field?: any) {
        let event = {
            data: this.columnSearchFilter,
            field: field
        };
        this.onCardsSearch.emit(event);
    }

    onSort(column) {
        if (!column.sorted) {
            column.sorted = 'ASC';
        } else if (column.sorted === 'ASC') {
            column.sorted = 'DESC';
        } else if (column.sorted === 'DESC') {
            column.sorted = undefined;
        }
        let event = { data: column };
        this.onGridSort.emit(event);
    }
    set setDataSource(data) {
        this.dataSource = data;
    }
    /**
     * <p> To delete selected row</p>
     *
     */
    public delete(): void {
        if (this.selectedCard) {
            let indexOfSelectedRecord = this.dataSource.indexOf(this.selectedCard);
            this.dataSource.splice(indexOfSelectedRecord, 1);
        }
    }
    /**
     * <p> To add a row in the grid</p>
     * @param row : Row to be updated
     */
    public add(row): void {
        if (row) {
            this.selectedCard = row;
            this.dataSource.unshift(row);
        }
    }
    /**
     * <p> To update the record in grid</p>
     * @param row : Row to be updated
     */
    public updateRecord(row) {
        if (row && this.selectedCard) {
            let indexOfSelectedRecord = this.dataSource.indexOf(this.selectedCard);
            this.dataSource.splice(indexOfSelectedRecord, 1);
            let updatedRecord = Utils.getRowTobeUpdated(this.selectedCard, row);
            this.dataSource.splice(indexOfSelectedRecord, 0, updatedRecord);
        }
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
