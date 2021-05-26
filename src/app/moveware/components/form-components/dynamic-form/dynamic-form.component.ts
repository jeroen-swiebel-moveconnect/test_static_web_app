import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    SimpleChanges,
    NgZone,
    ViewChild,
    AfterViewInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompactType, DisplayGrid, GridsterComponent, GridType } from 'angular-gridster2';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import { CollectionsService } from 'src/app/moveware/services';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { ContextService } from 'src/app/moveware/services/context.service';
import Utils from 'src/app/moveware/services/utils';
import { GridsterOptions } from '../field.interface';
export const PREVIEW_VIEW_ID = StandardCodesIds.PREVIEW_VIEW_ID;
@Component({
    selector: 'dynamic-form',
    templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnInit {
    @Input() repeatable: boolean;
    @Input() translationContext: any;
    @Input() globalEventsNames: any[];
    @Input() parentPageCode: string;
    @Input() viewSelector: string;
    @Input() currentView: any;
    @Input() currentPage: any;
    @Input() currentRecord: any;
    @Input() currentType: string;
    @Input() dataFields: any;
    @Input() CodeFields: any;
    @Input() DesignerUIElements: any;
    @Input() UIElements: any;
    @Input() UIElementsMetaData: any;
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();
    form: FormGroup;
    fieldColumns;
    options: GridsterOptions;
    @ViewChild('gridster_form') gridster: GridsterComponent;
    constructor(private fb: FormBuilder) {}
    sortByPosition(a, b) {
        if (a.y == b.y) return a.x - b.x;
        return a.y - b.y;
    }
    isPreview: boolean;

    ngOnInit() {
        this.setLayoutandGridster();
        let sortedByPosistionUIElements = this.UIElementsMetaData.sort(this.sortByPosition);
        sortedByPosistionUIElements.forEach((element, index) => {
            this.UIElements[element._id].tabIndex = '5000' + index;
        });
    }
    private defalutRowHeight: number = 10;
    private fieldsObj = {};
    formView: any;
    private setLayoutandGridster() {
        if (this.currentPage && this.currentPage.CodeElement == PREVIEW_VIEW_ID) {
            this.isPreview = true;
        }
        this.setLayoutConfig();
        this.setGridsterOptions();
        // this.formView = {
        //     CodeType: this.currentView.CodeType,
        //     _id: this.currentView._id,
        //     CodeCode: this.currentView.CodeCode,
        //     communicationId: this.currentView.communicationId,

        //     CodeElement: this.currentView.CodeElement,
        //     isDesigner: this.currentView.isDesigner,
        //     CSSStyles: this.currentView.CSSStyles
        // };
    }

    private setLayoutConfig() {
        if (this.UIElementsMetaData) {
            this.UIElementsMetaData.forEach((element, index) => {
                if (
                    this.UIElements[element._id].CodeColumn ||
                    this.UIElements[element._id].CodeColumns ||
                    this.UIElements[element._id].CodeRow ||
                    this.UIElements[element._id].CodeRows
                ) {
                    element.x = this.UIElements[element._id].CodeColumn;
                    element.y = this.UIElements[element._id].CodeRow;
                    element.cols = this.UIElements[element._id].CodeColumns
                        ? this.UIElements[element._id].CodeColumns
                        : 1;
                    element.rows = this.UIElements[element._id].CodeRows
                        ? this.UIElements[element._id].CodeRows
                        : 3;
                } else {
                    element.x = 0;
                    element.y = index * 3;
                    element.cols = 1;
                    element.rows = 3;
                }
                element.hasContent = true;
            });
        }
        // if (this.currentPage.CodeElement == PREVIEW_VIEW_ID) {
        // this.columnWidth = 100 / this.fieldColumns.length;
        //  }

        // this.subscribeResizeEvent();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setLayoutandGridster();
    }
    loadFormView(view) {
        this.currentView = view;
        this.setLayoutandGridster();
    }
    // private onDestroy$: Subject<void> = new Subject<void>();
    // private subscribeResizeEvent() {
    //     this.broadcaster
    //         .on(this.currentView._id + 'element_resize')
    //         .pipe(takeUntil(this.onDestroy$))
    //         .subscribe((fieldId) => {
    //             let index = Utils.getIndexByProperty(this.UIElementsMetaData, '_id', fieldId);
    //             //this.UIElementsMetaData[index]=
    //             let height = $('#' + fieldId).height();
    //             let rows = Math.round(height / this.defalutRowHeight);
    //             //let prevRows = this.UIElementsMetaData[index].rows
    //             // let diff = prevRows - rows;
    //             //  this.UIElementsMetaData[index].rows = rows;
    //             // this.UIElementsMetaData.forEach((element,i) => {
    //             //   if (this.UIElementsMetaData[i].cols == this.UIElementsMetaData[index].cols && ) {
    //             //     this.UIElementsMetaData[i].y = +diff;
    //             //   }
    //             // })
    //             //let prevRows = this.UIElementsMetaData[index].rows
    //             // let diff = prevRows - rows;
    //             this.UIElementsMetaData[index].rows = rows;
    //             // this.options.api.optionsChanged();
    //             // let temp = Utils.getCopy(this.UIElementsMetaData);
    //             // this.UIElementsMetaData = null;
    //             // setTimeout(() => {
    //             //   this.UIElementsMetaData = temp;
    //             // })
    //             //    let itemToPush = this.gridster.grid.find(i => i.item.config === t.config);
    //             //this.gridster.$options.
    //             if (this.options && this.options.api) {
    //                 this.options.api.optionsChanged();
    //             }
    //         });
    // }
    changedOptions() {
        if (this.options && this.options.api) {
            this.options.api.optionsChanged();
        }
    }

    private setGridsterOptions() {
        let mobileBreakpoint;
        if (this.currentPage) {
            if (this.currentPage['isDashboard']) {
                mobileBreakpoint = 100;
            } else if (this.currentPage['isWidget']) {
                mobileBreakpoint = 2000;
            } else {
                mobileBreakpoint = 100;
            }
        }
        this.options = {
            gridType: GridType.VerticalFixed,
            compactType: CompactType.CompactUp,
            margin: 2,
            outerMargin: true,
            pushing: this.isPreview,
            outerMarginTop: null,
            outerMarginRight: null,
            outerMarginBottom: null,
            disableWindoResize: false,
            outerMarginLeft: null,
            useTransformPositioning: true,
            mobileBreakpoint: mobileBreakpoint,
            minCols: 1,
            maxCols: 9,
            minRows: 1,
            maxRows: 300,
            maxItemCols: 100,
            minItemCols: 1,
            maxItemRows: 100,
            minItemRows: 3,
            maxItemArea: 10000,
            minItemArea: 1,
            defaultItemCols: 1,
            defaultItemRows: 1,
            fixedColWidth: 200,
            fixedRowHeight: this.defalutRowHeight,
            keepFixedHeightInMobile: false,
            keepFixedWidthInMobile: false,
            scrollSensitivity: 10,
            scrollSpeed: 20,
            enableEmptyCellClick: false,
            enableEmptyCellContextMenu: false,
            enableEmptyCellDrop: false,
            enableEmptyCellDrag: false,
            enableOccupiedCellDrop: false,
            emptyCellDragMaxCols: 50,
            emptyCellDragMaxRows: 50,
            ignoreMarginInRow: false,
            draggable: {
                enabled: this.isPreview
            },
            resizable: {
                enabled: this.isPreview
            },
            //   itemResizeCallback: this.itemResize.bind(this),
            swap: false,
            pushItems: true,
            disablePushOnDrag: false,
            disablePushOnResize: false,
            pushDirections: { north: true, east: false, south: true, west: true },
            pushResizeItems: true,
            displayGrid: DisplayGrid.OnDragAndResize,
            disableWindowResize: false,
            disableWarnings: false,
            scrollToNewItems: false
        };
    }
    createControl() {
        const group = this.fb.group({});
        if (this.UIElements && this.UIElements.length) {
            Object.values(this.UIElements).forEach((field) => {
                if (field['CodeType'] === 'button') return;
                const control = this.fb.control(
                    field['CodeValue'],
                    this.bindValidations(field['validations'] || [])
                );
                group.addControl(field['CodeCode'], control);
            });
        }

        return group;
    }

    bindValidations(validations: any) {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach((valid) => {
                validList.push(valid.validator);
            });
            return Validators.compose(validList);
        }
        return null;
    }

    onSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.form) {
            if (this.form.valid) {
                this.submit.emit(this.form.value);
            } else {
                this.validateAllFormFields(this.form);
            }
        }
    }

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach((field) => {
            const control = formGroup.get(field);
            control.markAsTouched({ onlySelf: true });
        });
    }

    // private updateLayout(item) {
    //   let context = this.contextService.getContextRecord(this.currentPage.contextKey);
    //   // {"type":"Codes","_id":"5f562d3d-25a6-49c7-9c84-ae592e3095ed","relationships":[{"type":"7b1d363c-0c8a-4200-994b-4805e148db3b","_id":"e8503b0b-35e2-4644-873d-decf84e429cf","meta":{"viewId":"9ede4fb4-6b65-45d8-9053-1b7d6dc3ad4c","userId":"sanga"},"payload":{"CodeStatus":"ad9b64d0-53d1-4174-9d56-e28433457189","CodeNotes":""}}],"userId":"sanga"}
    //   // { "type": "7b1d363c-0c8a-4200-994b-4805e148db3b", "_id": "e8503b0b-35e2-4644-873d-decf84e429cf", "meta": { "viewId": "9ede4fb4-6b65-45d8-9053-1b7d6dc3ad4c", "userId": "sanga" }, "payload": { "CodeStatus": "ad9b64d0-53d1-4174-9d56-e28433457189", "CodeNotes": "" } }
    //   let relationships = [];
    //   // relationObject["type"] = "7b1d363c-0c8a-4200-994b-4805e148db3b";
    //   // relationObject["_id"] = item._id;
    //   // relationObject["meta"] = { "viewId": this.currentView._id, "userId": "sanga" }

    //   let relationObject = {
    //     type: "7b1d363c-0c8a-4200-994b-4805e148db3b",
    //     _id: item._id,
    //     "meta": {
    //       viewId: this.currentView._id,
    //       userId: this.getUserId()
    //     },
    //     "payload": {
    //       "cols": item.cols,
    //       "rows": item.rows,
    //       "x": item.x,
    //       "y": item.y,
    //     }
    //   }
    //   relationships.push(relationObject);
    //   let request = {
    //     type: "Codes",
    //     _id: this.currentRecord._id,
    //     relationships: relationships,
    //   }
    //   this.updateObject(request);
    // }
    // private updateObject(request) {
    //   this.collectionService.updateCollectionItem(request).subscribe(() => {

    //   })
    // }
    // private getUserId() {
    //   if (this.cacheService.getLocalData('user')) {
    //     return JSON.parse(this.cacheService.getLocalData('user')).preferred_username;
    //   }
    // }
    public ngOnDestroy(): void {}
}
