import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CollectionsService } from 'src/app/moveware/services';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { createElement } from '@syncfusion/ej2-base';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';

/**
 * Syncfusion migration notes:
 *
 * <p>Features that we still could not port over to Syncfusion version:
 * <ul>
 *     <li> FileUploader is implemented in this component; needs to be migrated over;
 *     <li> Tooltip to be implemented along with SF tooltip
 * </ul>
 */
@Component({
    selector: 'ui-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
    @Input() button: any;
    @Input() isPrimaryBtn: boolean;
    @Input() currentView: any;
    @Input() selectedRow: any;
    @Input() translationContext: any;
    @Output() actionEvent = new EventEmitter<any>();

    public buttonClass: string;
    public DISPLAY_ICON: string = StandardCodes.DISPLAY_ICON;
    public DISPLAY_TEXT: string = StandardCodes.DISPLAY_TEXT;
    public DISPLAY_ICONANDTEXT: string = StandardCodes.DISPLAY_ICONANDTEXT;
    public currentFileUpload: any;

    customButton: any;
    isParentRequired: boolean;
    fieldLabel: string;
    public uploadEle: HTMLElement = createElement('span', {
        className: 'upload e-icons',
        innerHTML: 'Upload All'
    });
    public clearEle = createElement('span', {
        className: 'remove e-icons',
        innerHTML: 'Clear All'
    });

    constructor(
        private collectionsService: CollectionsService,
        private contextService: ContextService,
        private toastService: ToastService,
        private cacheService: CacheService
    ) {}

    ngOnInit() {
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.button.CodeCode
            : this.button.CodeCode;
    }

    /**
     * <p> called to assign </p>
     * @param {SimpleChanges} changes : any changes to the button
     */
    ngOnChanges(changes: SimpleChanges) {
        // this is required for styling for ButtonBar
        if (this.currentView && this.currentView._id && this.button && this.button._id) {
            this.buttonClass = 'button' + this.currentView._id + this.button._id;
        }
        if (this.button.CodeCode === 'Upload' || this.button.CodeCode === 'New Version') {
            this.customButton = {
                browse: this.button.CodeDescription,
                clear: this.clearEle,
                upload: this.uploadEle
            };
        }
    }

    /**
     * <p> triggered on click of a button, emits the button for ActionHandler to process </p>
     * @param button: button where the event has been detected
     */
    public handleAction(button) {
        this.actionEvent.emit(button);
    }

    onUploadNewVersion($event) {
        this.isParentRequired = true;
        this.onUpload($event);
    }
    onUpload($event) {
        let file = $event.filesData[0];
        let fileFormat = file?.name?.split('.')?.pop()?.toLocaleLowerCase();
        this.contextService.saveDataChangeState();

        if (file) {
            this.currentFileUpload = file;
            this.upload($event);
        }
    }

    /**
     * <p> called to handle the files to be uploaded </p>
     * @param $event : file upload event
     */
    private upload($event) {
        let userId = this.cacheService.getUserId();
        this.contextService.saveDataChangeState();
        this.collectionsService
            .uploadFile(
                this.currentFileUpload['rawFile'],
                true,
                this.isParentRequired ? this.selectedRow._id : ''
            )
            .subscribe(
                async (responseData) => {
                    let body = JSON.parse(responseData.body);
                    this.toastService.addSuccessMessage(
                        StandardCodes.EVENTS.FILE_UPLOADED_SUCCESSFULLY
                    );
                    let criteriaObjet = this.createRequestCriteria(body, userId);
                    this.collectionsService
                        .getContainerViewData(criteriaObjet)
                        .subscribe(async (response) => {
                            this.button.data = response;
                            this.actionEvent.emit(this.button);
                        });
                },
                (errorResponse) => {
                    this.toastService.showCustomToast('error', errorResponse);
                }
            );
    }

    /**
     * <p> called by upload method to create the request criteria for form-data request </p>
     * @param data : body of the response data
     * @param {string} userId : the Id of the user who is uploading the file
     * @returns formatted criteria for the form-data request call
     */
    private createRequestCriteria(data, userId) {
        let criteria = {
            criteria: {
                _id: data._id,
                dataObjectCodeCode: 'Files'
            },
            meta: {
                userId: userId,
                viewId: StandardCodesIds.UPLOAD_BUTTON_VIEW_ID
            },
            userId: userId
        };
        this.isParentRequired = false;
        return criteria;
    }
}
