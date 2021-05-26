import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ContextService } from 'src/app/moveware/services/context.service';
import { CollectionsService } from 'src/app/moveware/services';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { FieldConfig } from '../field.interface';
import Utils from 'src/app/moveware/services/utils';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
    @Input() field: FieldConfig;
    group: FormGroup;
    showNotes: boolean;
    @Input() translationContext: any;
    CodeLookupEnabled: boolean;
    isTypeAhead: boolean;
    isIdExist: boolean = false;
    valueSelected: boolean = true;
    selectedList: any = [];
    suggestions: any;
    quickTexts: any;
    confirmValue: any;
    newValue: any;
    private mentionValue: string;
    @Input() currentRecord: any;
    @Input() currentView: any;
    @Input() currentPage: any;
    tooltipMessage: any;
    showMessage: boolean;
    isTableHeader: boolean;

    constructor(
        private contextService: ContextService,
        private collectionsService: CollectionsService,
        private broadcaster: Broadcaster,
        private cacheService: CacheService,
        private gridService: GridService
    ) {}
    ngOnInit() {
        this.translationContext = this.translationContext ? this.translationContext + '.' : '';
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

    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    public markDirty() {
        if (this.newValue === this.confirmValue) {
            this.field.CodeValue = this.newValue;
            if (this.newValue.length < 9) {
                this.showMessage = true;
                this.tooltipMessage = 'password length must be more than 8';
                this.field['isDirty'] = false;
            } else {
                this.showMessage = false;
                this.tooltipMessage = '';
                this.field['isDirty'] = true;
            }
        } else {
            if (this.newValue.length < 9) {
                this.tooltipMessage = 'password missmatch and length must be more than 8';
            } else {
                this.tooltipMessage = 'password missmatch';
            }
            this.field.CodeValue = '';
            this.showMessage = true;
            this.field['isDirty'] = false;
        }
    }
}
