import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig, Validator } from '../field.interface';
import { Subscription, Subject } from 'rxjs';
import { CollectionsService, EventsListenerService } from 'src/app/moveware/services';
import Utils from 'src/app/moveware/services/utils';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { debounceTime } from 'rxjs/operators';
import { ContextService } from 'src/app/moveware/services/context.service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';

@Component({
    selector: 'quicklist',
    templateUrl: './quick-list.component.html',
    styleUrls: ['./quick-list.component.scss']
})
export class QuickListComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentView: any;
    group: FormGroup;
    isLeftVisible = true;
    private isSearchLoading: Boolean = false;
    private displayedTabsLength: number;
    isTableHeader: boolean;

    constructor(
        public collectionsService: CollectionsService,

        private broadcaster: Broadcaster,
        private toastService: ToastService,
        private contextService: ContextService
    ) {}

    private subscription: Subscription;
    private subject: Subject<any> = new Subject();
    options: any = [];
    private searchKey: string = '';
    private pageType: string = 'quickadd';
    ngOnInit() {
        const ref = this;
        // this.eventListenerService.eventUpdateListener.subscribe((data) => {
        //     ref.toggleLeftVisible(data);
        //     /**
        //      * Call the optionChanged Method and set it to the current Record's Type field.
        //      */
        //     if (data['data'] && data['data']['source'] === 'selectChange') {
        //         this.currentRecord.CodeType = data['value'] ? data['value'] : null;
        //         this.loadAndSetViewForType(this.currentRecord.CodeType);
        //     }
        // });

        this.options = JSON.parse(JSON.stringify(this.field.options));

        this.subject.pipe(debounceTime(300)).subscribe((searchStr) => {
            this.isSearchLoading = false;
            this.options = this.field.options.filter((event) => {
                return event['label'].toLowerCase().indexOf(searchStr) > -1;
            });
        });
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

    private clearSearchText() {
        this.options = JSON.parse(JSON.stringify(this.field.options));
        this.searchKey = '';
    }

    onInputChanged(event): void {
        this.contextService.saveDataChangeState();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        if (this.searchKey && this.searchKey.length >= 3) {
            this.options = [];
            this.isSearchLoading = true;
            this.subject.next(this.searchKey);
        }
    }

    toggleLeftVisible(event) {
        if (event.operation === 'goBack' || event.operation === 'cancel') {
            this.isLeftVisible = true;
        }
    }

    currentRecord = {
        views: [],
        currentView: {},
        CodeType: null,
        CodeCode: '',
        EntityCode: ''
    };

    // CODES_MODULE: string = 'Module.Codes'; // Codes Module
    // collectionCode: string = 'codes'
    collectionFromRoute: any = {
        collection: 'codes'
    };
    viewMode: string = 'CREATE_MODE';

    private loadViewForQuickAdd(option: any) {
        //  this.isLeftVisible = false;
        this.collectionFromRoute.CodeCollection = option.CodeCollection;
        option.CodeType = option.label;
        option.viewSelecctor = 'EntityType';
        option.parentCode = StandardCodesIds.QUICK_ADD_FORM_ID; // Quick add data form id
        // this.loadAndSetViewForType(option);
        this.viewMode = 'CREATE_MODE';
        // let eventData = {
        //     eventType: 'DISPLAY_CHILDREN',
        //     data: option,
        //     parent: option.parentCode
        // }

        let eventData = {
            data: {
                //  viewSelector: option.viewSelecctor,
                mode: this.viewMode
            }
        };

        if (option.CodeType) {
            eventData.data[option.viewSelecctor] = option.CodeType;
        }

        this.broadcaster.broadcast(option.parentCode, eventData);
    }

    private loadAndSetViewForType(_option: any) {
        const ref = this;
        let _codeType = _option.label;
        setTimeout(function () {
            ref.collectionsService
                .loadListOfViewsByType(_option.CodeModule, _codeType, null, null, null)
                .subscribe(
                    async (responseData) => {
                        ref.currentRecord.views = JSON.parse(JSON.stringify(responseData));
                        // LOAD AND SET DEFAULT VIEW
                        ref.loadAndSetView(_codeType, ref.currentRecord.views[0]);
                    },
                    (errorResponse) => {
                        ref.toastService.showCustomToast('error', errorResponse);
                    }
                );
        }, 100);
    }

    private loadAndSetView(codeType: string, view: any) {
        if (!view) {
            return;
        }
        let typeField = view.CodeType ? 'CodeType' : 'EntityType';
        this.collectionsService.loadViewByCode(view.CodeCode, typeField, view[typeField]).subscribe(
            async (responseData) => {
                this.currentRecord.views.forEach((collectionView, index) => {
                    if (collectionView.CodeCode === view.CodeCode) {
                        collectionView = responseData;
                        let tempFields = JSON.parse(JSON.stringify(collectionView.CodeFields));
                        collectionView.CodeFields = [];
                        tempFields.forEach(function (_fields) {
                            let _originalFields = JSON.parse(JSON.stringify(_fields));
                            let _parsedFields = Utils.parseAttributes(_originalFields, _fields);
                            collectionView.CodeFields.push(_parsedFields);
                        });
                        //       collectionView.CodeViewType = collectionView.CodeViewType ? collectionView.CodeViewType : 'Form';
                        this.currentRecord.currentView = collectionView;
                    }
                });
            },
            (errorResponse) => {
                this.toastService.showCustomToast('error', errorResponse);
            }
        );
        //   }, 100);
        //setTimeout(() => { ref.reSetTabs(); }, 10);
    }

    private closeRightSlide(event) {
        this.isLeftVisible = event;
    }
}
