import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CollectionsService } from 'src/app/moveware/services';
import { FieldConfig } from '../field.interface';
import { FormGroup } from '@angular/forms';
import Utils from 'src/app/moveware/services/utils';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { LookupComponent } from '../lookup/lookup.component';
export const TOASTY_ERROR: string = 'error';

@Component({
    selector: 'file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentView: any;
    @Input() translationContext: any;

    group: FormGroup;
    globalEventsNames: any[];
    @ViewChild('preloadupload')
    public uploadObj: UploaderComponent;
    public selectedFiles: FileList;
    public currentFileUpload: File;
    public imgUri: string;
    public filesList: HTMLElement[] = [];
    private fileMaxSize: number = 2000000;
    @Input() currentRecord: any;
    isTableHeader: boolean;
    acceptedFormats: String = '';
    previewClass = '';
    errorClass = '';
    imageTypes = ['bmp', 'jpg', 'jpeg', 'tif', 'tiff', 'gif', 'png', 'eps'];
    fileFormat = '';
    acceptedFormatsSet = new Set();
    isLookup: boolean = true;
    fileName: any;
    preLoadFiles: any;
    @ViewChild(LookupComponent) lookupComponentInstance: LookupComponent;
    constructor(
        private collectionsService: CollectionsService,
        private contextService: ContextService,
        private toastService: ToastService,
        private gridService: GridService
    ) {}

    /**
     * this ngOnInit method apply default styles to both label and value. it will also inject values to html tags.
     * in this method we will also process accpted formats.
     * @memberof FileUploadComponent
     */
    ngOnInit() {
        this.translationContext = this.translationContext ? this.translationContext + '.' : '';
        if (this.field.CodeActions) {
            this.field.isOnlyLookup = Utils.getLookupType(
                this.field.CodeActions,
                StandardCodes.UI_LOOKUP_CLICK
            );
        }
        this.setFileObj();
        if (this.field.CodeActions) {
            let loadAction = Utils.getElementByProperty(
                this.field.CodeActions,
                'CodeUIAction',
                StandardCodes.UI_LOOKUP_CLICK
            );
            if (loadAction && loadAction.Task) {
                if (loadAction.Task.CodeCode === StandardCodes.TASK_OPEN_FILE_SYSTEM) {
                    this.isLookup = false;
                } else {
                    this.isLookup = true;
                }
            } else {
                this.isLookup = false;
            }
        }
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
        length = this.field[StandardCodes.SUPPORTED_FORMATS]?.length;
        if (this.field[StandardCodes.SUPPORTED_FORMATS] && length >= 0) {
            this.field[StandardCodes.SUPPORTED_FORMATS].forEach((element) => {
                let fileFormat = element?.CodeCode?.toLocaleLowerCase();
                this.acceptedFormats = this.acceptedFormats + '.' + fileFormat + ' , ';
                this.acceptedFormatsSet.add(fileFormat);
            });
        }
        if (length >= 0) {
            this.acceptedFormats = this.acceptedFormats.substring(
                0,
                this.acceptedFormats.length - 2
            );
        }
    }

    /**
     * in this method, based file type we will show the preview( like jpg, bmp, png).
     *
     * @private
     * @memberof FileUploadComponent
     */
    private setFileObj() {
        if (this.uploadObj) {
            this.uploadObj.clearAll();
        }
        if (this.field.CodeValue) {
            this.currentFileUpload = this.field.CodeValue?._id;
            this.imgUri = Utils.getFileFullpath(this.currentFileUpload + '');
            let fileFormat = this.field?.CodeValue?.FileSearchName?.split('.')
                ?.pop()
                ?.toUpperCase();
            this.fileName = this.field?.CodeValue?.FileSearchName?.split('.')[0];
            this.fileFormat = fileFormat;
            if (fileFormat) {
                if (this.imageTypes.indexOf(fileFormat.toLocaleLowerCase()) >= 0) {
                    this.previewClass = 'hide-preview';
                }
                this.preLoadFiles = [{ name: this.fileName, size: 500, type: fileFormat }];
            }
        }
    }

    /**
     * this method will clear the existing values and also clear the values in html objects.
     *
     * @memberof FileUploadComponent
     */
    public onClear() {
        this.imgUri = null;
        this.field.CodeValue = null;
        this.field['isDirty'] = true;
        if (this.uploadObj) {
            this.uploadObj.clearAll();
        }
        this.contextService.saveDataChangeState();
    }

    /**
     * when record changes gird we will set repective record for component.
     *
     * @memberof FileUploadComponent
     */
    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
        this.errorClass = '';
    }

    /**
     *  when ever user selects file in UI. it will validated first, accepted format or not. then it will be uploaded to blob storage on accept. it will throw error message on not acceptble formats.
     *
     * @param {*} $event event that genereted from HTML
     * @memberof FileUploadComponent
     */
    public onFileSelect($event) {
        if (this.uploadObj) {
            this.uploadObj.clearAll();
        }
        let file = $event.filesData[0];
        let fileFormat = file?.name?.split('.')?.pop()?.toLocaleLowerCase();
        if (this.acceptedFormatsSet.size > 0 && !this.acceptedFormatsSet.has(fileFormat)) {
            this.toastService.addErrorMessage(
                'ERROR-CODE : 105',
                StandardCodes.EVENTS.FILE_FORMAT_INVALID
            );
            console.error(
                fileFormat?.toUpperCase() +
                    ' is not a valid file format. Please select valid file formats like: ' +
                    this.acceptedFormats.toUpperCase()
            );
            this.errorClass = 'error';
        } else {
            this.errorClass = '';
            if (this.imageTypes.indexOf(fileFormat.toLocaleLowerCase()) >= 0) {
                this.previewClass = 'hide-preview';
            } else {
                this.previewClass = '';
            }
            this.contextService.saveDataChangeState();

            if (file && this.fileMaxSize >= file.size) {
                this.currentFileUpload = file;
                this.readFileAsUrl(this.currentFileUpload);
                this.upload($event);
            }
            if (this.field['isTableCell']) {
                if (this.field.CodeValue !== this.field['originalValue']) {
                    this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
                }
                if (this.currentRecord) {
                    this.currentRecord[this.field.CodeCode] = this.field.CodeValue['label'];
                }
            }
        }
    }

    /**
     * this method send file to backend and gets response data.
     *
     * @param {*} $event event that is generated from the HTML
     * @memberof FileUploadComponent
     */
    public upload($event) {
        this.collectionsService.uploadFile(this.currentFileUpload['rawFile'], true, '').subscribe(
            async (responseData) => {
                if (this.field) {
                    let body = JSON.parse(responseData.body);
                    this.field.CodeValue = body;
                    this.markDirty();
                    this.toastService.addSuccessMessage(
                        StandardCodes.EVENTS.FILE_UPLOADED_SUCCESSFULLY
                    );
                }
            },
            (errorResponse) => {
                this.toastService.showCustomToast('error', errorResponse);
            }
        );

        this.selectedFiles = undefined;
    }

    /**
     * on modification in value it will mark or create flag for further operations
     *
     * @private
     * @memberof FileUploadComponent
     */
    private markDirty() {
        this.contextService.saveDataChangeState();
        this.field['isDirty'] = true;
    }

    /**
     * this setter method for fields
     * @param field field to set value
     * @memberof FileUploadComponent
     */
    set setField(field) {
        this.setFileObj();
        if (this.isLookup) {
            this.lookupComponentInstance.setImageURI();
        }
    }

    /**
     *it will generate URI to show preview of file
     *
     * @private
     * @param {*} file file type parameter
     * @memberof FileUploadComponent
     */
    private readFileAsUrl(file) {
        var reader = new FileReader();
        this.field.CodeValue = file.name;
        reader.readAsDataURL(file.rawFile);
        reader.onload = (event: any) => {
            this.imgUri = event.target.result;
        };
    }
}
