import { Component, OnInit, Input } from '@angular/core';
import { ContextService } from 'src/app/moveware/services/context.service';
import { CollectionsService } from 'src/app/moveware/services';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import Utils from 'src/app/moveware/services/utils';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';

@Component({
    selector: 'editable-cell',
    templateUrl: './table-cell.component.html',
    styleUrls: ['./table-cell.component.scss']
})
export class TableCellComponent implements OnInit {
    @Input() row: any;
    @Input() col: any;
    @Input() currentPage: any;
    @Input() currentView: any;
    @Input() layoutView: any;
    @Input() isTreeTable: boolean;
    @Input() parentChildMap: any;
    @Input() calculatedFields: any[];
    @Input() columnsMap: any;
    currentViewId: string;
    contextRecord: any;
    latestSequenceId: any;
    field: any;
    constructor(
        private contextService: ContextService,
        private collectionService: CollectionsService,
        private toastService: ToastService,
        private gridService: GridService,
        private quickTextService: QuickTextHandlerService
    ) {}

    ngOnInit() {
        this.gridService.tableCellComponentRef = this;
        this.field = Utils.getCopy(this.columnsMap[this.col._id]);
        this.field.isTableCell = true;
        this.field.isHeader = false;
        this.fetchValuesForField();
    }

    fetchValuesForField() {
        let rowCodeValue;
        if (this.field.options) {
            let options = this.field.options;
            rowCodeValue = this.row[this.field.CodeCode];
            options.forEach((element) => {
                if (element.label === rowCodeValue) {
                    rowCodeValue = element;
                }
            });
            this.field.CodeValue = rowCodeValue;
        }
    }

    getSequenceId(response) {
        if (response['relationships']) {
            for (let index = 0; index < response['relationships'].length; index++) {
                return this.getSequenceId(response['relationships'][index]);
            }
        } else {
            return response.sequenceId;
        }
    }

    public handleEvent(field, currentRecord) {
        let actions = field.allActions;
        const CodeAction =
            field.CodeActions[actions.indexOf(StandardCodes.UI_ACTION_VALUE_CHANGED)];
        if (
            CodeAction &&
            CodeAction.Task &&
            CodeAction.Task.CodeCode === 'ComputeTransactionValues'
        ) {
            this.handleComputeTransactions(field, CodeAction, currentRecord);
        } else {
            this.contextService.removeDataChangeState();
            let context = this.contextService.getContextRecord(
                this.currentPage.contextKey +
                    this.contextService.getRootViewMap(this.currentPage.contextKey)
            );
            let reqObject = this.gridService.buildReqObject(field, currentRecord, context);
            this.collectionService.updateCollectionItem(reqObject).subscribe((response) => {
                this.latestSequenceId = this.getSequenceId(response);
                this.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORD_UPDATED);
                // if (this.parentChildMap[field.CodeCode]) {
                //     let context = this.contextService.getContextRecord(
                //         this.currentView.contextKey
                //     );
                //     let reqObjectInclude = this.gridService.buildFetchContainerReqObject(
                //         field,
                //         currentRecord,
                //         context
                //     );
                //     reqObjectInclude['criteria']['includes'] = this.calculatedFields;
                //     reqObjectInclude['sequenceId'] = this.latestSequenceId;
                //     this.collectionService.refreshRecord(reqObjectInclude).subscribe((response) => {
                //         let calculatedFieldsValue = JSON.parse(response.body);
                //         this.calculatedFields.forEach((calculatedField) => {
                //             currentRecord[calculatedField] = null;
                //             setTimeout(
                //                 () =>
                //                     (currentRecord[calculatedField] =
                //                         calculatedFieldsValue[calculatedField]),
                //                 2500
                //             );
                //         });
                //     });
                // }
            });
        }
    }
    private computeTranscationValues(transaction: any) {
        let rate = transaction.Rate;
        let quantity = transaction.Quantity;
        let value = transaction.Value;
        if (rate && quantity && !value) {
            value = rate * quantity;
        } else if (value && quantity && !rate) {
            rate = value / quantity;
        } else if (value && rate && !quantity) {
            quantity = value / rate;
        }
        return {
            Rate: rate,
            Quantity: quantity,
            Value: value
        };
    }
    private handleComputeTransactions(field, CodeAction, currentRecord) {
        this.quickTextService.currentField = field;
        this.quickTextService.currentRecord = currentRecord;
        let defaultParameters = Utils.getCopy(CodeAction['JSONParameter']);
        for (var key in defaultParameters) {
            if (defaultParameters[key].includes('@@')) {
                let computedValue = this.quickTextService.getComputedValue(defaultParameters[key]);
                defaultParameters[key] = computedValue;
            }
        }

        let returnValue = this.computeTranscationValues(defaultParameters);
        if (CodeAction['CodeCallback'].split('();').includes('updateTransactionValues')) {
            this.updateTransactionValues(field, currentRecord, returnValue);
        }
    }
    private updateTransactionValues(field, currentRecord, returnValue) {
        currentRecord['TransactionRate'] = returnValue['Rate'];
        currentRecord['TransactionQuantity'] = returnValue['Quantity'];
        currentRecord['TransactionValue'] = null;
        this.contextService.removeDataChangeState();
        let context = this.contextService.getContextRecord([
            this.currentView.contextKey + this.currentView.communicationId
        ]);
        let reqObject = this.gridService.buildReqObject(field, currentRecord, context);
        this.collectionService.updateCollectionItem(reqObject).subscribe((response) => {
            currentRecord['TransactionValue'] = returnValue['Value'];
            this.latestSequenceId = this.getSequenceId(response);
            this.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORD_UPDATED);
        });
    }
}
