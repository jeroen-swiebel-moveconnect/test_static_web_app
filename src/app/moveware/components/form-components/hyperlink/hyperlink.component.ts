import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import Utils from 'src/app/moveware/services/utils';
@Component({
    selector: 'app-hyperlink',
    templateUrl: './hyperlink.component.html',
    styleUrls: ['./hyperlink.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})
export class HyperLinkComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentView: any;
    @Input() translationContext: any;
    group: FormGroup;
    showNotes: boolean;
    isTableHeader: boolean;

    constructor(
        private menuService: MenuService,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig
    ) {}
    ngOnInit() {
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field['isTableCell'];
        this.field.dataClass = !this.isTableHeader
            ? 'data' + this.currentView['_id'] + this.field._id
            : '';
        this.field.headerClass = !this.isTableHeader
            ? 'header' + this.currentView['_id'] + this.field._id
            : '';
    }
    loadDetails(field) {
        if (!field.CodeUILocation) {
            field.CodeUILocation = StandardCodes.UILOCATION.DIALOG_LEFT;
        }
        this.menuService.loadContainer(field, null, null, null, this.dialog, this.dialogConfig);
    }
}
