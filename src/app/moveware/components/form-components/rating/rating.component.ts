import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FieldConfig } from '../field.interface';
import { ContextService } from 'src/app/moveware/services/context.service';
import Utils from 'src/app/moveware/services/utils';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';

@Component({
    selector: 'rating',
    templateUrl: './rating.component.html',
    styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentView: any;
    @Input() translationContext: any;
    isTableHeader: boolean;

    constructor(private contextService: ContextService) {}
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
    set setField(field) {
        this.field = field;
    }

    addRating($event) {
        this.markDirty();
    }
    cancelRating($event) {
        this.markDirty();
    }
    public markDirty() {
        this.contextService.saveDataChangeState();
        this.field['isDirty'] = true;
    }
}
