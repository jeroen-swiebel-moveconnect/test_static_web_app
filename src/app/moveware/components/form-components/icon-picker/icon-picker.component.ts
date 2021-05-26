import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import Utils from 'src/app/moveware/services/utils';
import { ContextService } from 'src/app/moveware/services/context.service';
import { CollectionsService } from 'src/app/moveware/services';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DialogConfigurationService } from 'src/app/moveware/services/dialog-configuration.service';
import { IconSlidePaneComponentComponent } from './icon-slide-pane/icon-slide-pane.component';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { FieldConfig } from '../field.interface';

@Component({
    selector: 'icon-picker',
    templateUrl: './icon-picker.component.html',
    styleUrls: ['./icon-picker.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})
export class IconPickerComponent implements OnInit {
    public iconList: any;
    field: FieldConfig;
    group: FormGroup;
    @Input() currentView: any;
    @Input() translationContext: any;
    private fieldUpdateEvent: any;
    isTableHeader: boolean;
    fieldLabel: string;
    constructor(
        private contextService: ContextService,
        private collectionsService: CollectionsService,
        private cacheService: CacheService,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private dialogConfigService: DialogConfigurationService,
        private broadcaster: Broadcaster
    ) {}
    ngOnInit() {
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.field.CodeCode
            : this.field.CodeCode;
        this.getIcons();
        //this.regiterFieldUpdate();
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

    private regiterFieldUpdate() {
        this.fieldUpdateEvent = this.broadcaster
            .on<any>(this.field.CodeCode + 'field_updated')
            .subscribe(async (_field) => {
                this.field[_field.key] = _field.value;
            });
    }
    getIcons() {
        let icons = this.cacheService.getSessionData('IconsData');
        if (icons) {
            this.iconList = JSON.parse(icons);
        } else {
            this.collectionsService.getIconGroups().subscribe((response) => {
                this.cacheService.setSessionData('IconsData', JSON.stringify(response));
                this.collectionsService
                    .getIconsByGroup(response[0]['description'])
                    .subscribe((res) => {
                        response[0]['icons'] = res;
                    });
                this.iconList = response;
            });
        }
    }

    set setField(field) {
        this.field = field;
    }

    clearIcon() {
        this.field.CodeValue = null;
        this.markDirty();
    }
    private openSlidePane() {
        this.dialogConfig = this.dialogConfigService.getSaveEditFilterDialogConfig(
            this.dialogConfig
        );
        this.dialogConfig.data = {
            iconList: this.iconList,
            field: this.field,
            collectionsService: this.collectionsService
        };
        const dialogRef = this.dialog.open(IconSlidePaneComponentComponent, this.dialogConfig);
        dialogRef.onClose.subscribe((result) => {
            if (result && !Utils.isObjectsEqual(result, this.field.CodeValue)) {
                this.field.CodeValue = result;
                this.markDirty();
            }
        });
    }

    private changeIcon(jsonStr) {
        if (jsonStr) {
            var json = JSON.parse(jsonStr);
            this.field.CodeValue = json;
            this.markDirty();
        }
    }
    private markDirty() {
        this.contextService.saveDataChangeState();
        this.field['isDirty'] = true;
    }

    ngOnDestroy() {
        if (this.fieldUpdateEvent) {
            this.fieldUpdateEvent.unsubscribe();
        }
    }
}
