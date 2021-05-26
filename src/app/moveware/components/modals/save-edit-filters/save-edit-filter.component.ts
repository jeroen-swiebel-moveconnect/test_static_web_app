import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { ContextService } from 'src/app/moveware/services/context.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';

@Component({
    selector: 'save-edit-filter-content',
    templateUrl: './save-edit-filter.component.html',
    styleUrls: ['./save-edit-filter.component.scss']
})
export class SaveEditFilterContentComponent implements OnInit {
    // Usage type can be alert or confirm- alert will contain only OK butoon while Confirm has two buttons Yes and No
    public type: string;
    public title: string;
    // public label: string;
    public value: string;
    // private EntityGroup: any;
    public expanded: boolean;
    public selectedData: any;
    public selectedView: any;
    customeViewContainerId: string = StandardCodesIds.CUSTOM_VIEW_CONTAINER_ID;
    text: string;
    data: any;
    saveEvent: any;
    updateEvent: any;
    constructor(
        private broadcaster: Broadcaster,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private contextService: ContextService,
        private toastService: ToastService
    ) {
        this.data = this.config.data;
        this.type = this.data.type;
        // this.label = data.formData.label;
        // this.value = data.formData.value;
        // this.selectedData = data.formData.EntityGroup;
        if (this.data.type) {
            if (this.data.type === 'edit') {
                this.data.mode = 'VIEW_UPDATE_MODE';
            } else if (this.data.type === 'save') {
                this.data.mode = 'CREATE_MODE';
            }
        }
        if (this.data && this.data.selectedView) {
            this.selectedView = {
                _id: this.data.selectedView._id,
                dataObjectCodeCode: this.data.selectedView.dataObjectCodeCode,
                mode: this.data.mode
            };
        }
    }

    ngOnInit() {
        this.subscribeEvents();
        this.contextService.setContextRecord('customView', null);
    }

    public saveFilter(view): void {
        this.value = this.getDescription(view.fileds, 'SettingDescription')[0]['CodeValue'];
        let groupField = this.getDescription(view.fileds, 'SettingEntities')[0];
        this.selectedData = groupField['CodeValue'];

        if (this.value) {
            this.dialogRef.close({
                name: this.value,
                EntityGroup: this.selectedData,
                action: view.action
            });
        } else {
            this.toastService.addErrorMessage("Name field cann't be empty");
        }
    }

    public subscribeEvents() {
        this.saveEvent = this.broadcaster.on<string>('save_custom_view').subscribe((view) => {
            this.saveFilter(view);
        });
        this.updateEvent = this.broadcaster.on<string>('edit_custom_view').subscribe((view) => {
            this.updateFilter(view);
        });
    }
    getDescription(fields, code) {
        return Object.values(fields).filter((field) => {
            return field['CodeCode'] === code;
        });
    }
    public updateFilter(view): void {
        this.value = this.getDescription(view.fileds, 'SettingDescription')[0]['CodeValue'];
        let groupField = this.getDescription(view.fileds, 'SettingEntities')[0];
        this.selectedData = groupField['CodeValue'];
        if (this.value) {
            this.dialogRef.close({
                name: this.value,
                EntityGroup: this.selectedData,
                action: view.action
            });
        } else {
            this.toastService.addErrorMessage("Name field cann't be empty");
        }
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
    public closeDialog() {
        this.dialogRef.close();
    }
    ngOnDestroy() {
        if (this.saveEvent) {
            this.saveEvent.unsubscribe();
        }
        if (this.updateEvent) {
            this.updateEvent.unsubscribe();
        }
    }
}
