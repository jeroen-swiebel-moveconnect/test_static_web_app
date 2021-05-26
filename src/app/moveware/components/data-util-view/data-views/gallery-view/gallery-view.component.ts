import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { HeaderListenerService, RequestHandler } from 'src/app/moveware/services';
import Utils from 'src/app/moveware/services/utils';

@Component({
    selector: 'gallery-view',
    templateUrl: './gallery-view.component.html',
    styleUrls: ['./gallery-view.component.scss']
})
export class GalleryViewComponent implements OnInit {
    @Input() viewList: any;
    @Input() dataSource: any;
    @Input() moduleCode: any;
    @Input() currentContainerID: string;
    @Input() metaData;
    @Input() currentPage: any;
    @Input() currentView: any;
    @Input() parentPage: any;
    @Output() onRecordSelection = new EventEmitter<any>();
    imgUris: any[];
    selectedRecord: any;

    constructor(
        public headerListenerService: HeaderListenerService,
        public contextService: ContextService,
        public gridService: GridService
    ) {}

    ngOnInit() {
        this.selectedRecord = this.dataSource[0];
        this.onRecordSelection.emit(this.selectedRecord);
    }
    onSelection(record) {
        this.selectedRecord = record;
        let eventData = {
            eventType: 'DISPLAY_CHILDREN',
            data: record,
            parent: this.currentPage.CodeElement,
            mode: StandardCodes.VIEW_UPDATE_MODE
        };
        this.onRecordSelection.emit(eventData);
    }
    set setDataSource(data) {
        this.dataSource = data;
    }
    /**
     * <p> To delete selected row</p>
     *
     */
    public delete(): void {
        if (this.selectedRecord) {
            let indexOfSelectedRecord = this.dataSource.indexOf(this.selectedRecord);
            this.dataSource.splice(indexOfSelectedRecord, 1);
        }
    }
    /**
     * <p> To add a row in the grid</p>
     * @param row : Row to be updated
     */
    public add(row): void {
        if (row) {
            this.selectedRecord = row;
            this.dataSource.unshift(row);
        }
    }
    /**
     * <p> To update the record in grid</p>
     * @param row : Row to be updated
     */
    public updateRecord(row) {
        if (row && this.selectedRecord) {
            let indexOfSelectedRecord = this.dataSource.indexOf(this.selectedRecord);
            this.dataSource.splice(indexOfSelectedRecord, 1);
            let updatedRecord = Utils.getRowTobeUpdated(this.selectedRecord, row);
            this.dataSource.splice(indexOfSelectedRecord, 0, updatedRecord);
        }
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
