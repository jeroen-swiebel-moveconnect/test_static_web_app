import { Component, Inject, OnInit } from '@angular/core';
import Utils from 'src/app/moveware/services/utils';
import { EventsListenerService } from 'src/app/moveware/services';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { ContextService } from 'src/app/moveware/services/context.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
    selector: 'ui-action-zoomin-content',
    templateUrl: './ui-action-zoomin.component.html',
    styleUrls: ['./ui-action-zoomin.component.scss']
})
export class UIActionZoominContentComponent implements OnInit {
    title: string;
    expanded: boolean;
    field: any;
    showNotes: boolean;
    position: string;
    data: any;
    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private eventsListener: EventsListenerService,
        private contextService: ContextService
    ) {
        this.data = this.config.data;
        this.field = this.data;
        this.position = this.data.position;
    }

    ngOnInit() {}
    markDirty(event: any) {
        this.contextService.saveDataChangeState();
        this.field['isDirty'] = true;
        if (!Utils.isObjectEmpty(event)) {
            this.field.CodeValue = event;
        } else {
            this.field.CodeValue = null;
        }
    }

    onCancel() {
        this.dialogRef.close();
    }

    onSave() {
        this.dialogRef.close({ value: this.field.CodeValue });
    }

    public resizeOverlay(isExpand) {
        if (isExpand) {
            this.config.height = '100vh';
            this.config.width = '99.99vw';
        } else {
            this.config.height = '100vh';
            this.config.width = '30%';
        }
    }
    public resizeOverlayToRight(isExpand) {
        if (!isExpand) {
            this.config.height = '100vh';
            this.config.width = '99.99vw';
        } else {
            this.config.height = '100vh';
            this.config.width = '30%';
        }
    }
}
