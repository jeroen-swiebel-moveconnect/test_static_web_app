import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FieldConfig, Validator } from '../field.interface';
import Utils from 'src/app/moveware/services/utils';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { Helpers } from 'src/app/moveware/utils/helpers';
import { GridType, CompactType, DisplayGrid } from 'angular-gridster2';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'ui-element',
    templateUrl: './ui-element.component.html',
    styleUrls: ['./ui-element.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UIElementComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() translationContext: any;
    @Input() UIElements: any;
    @Input() parentViewFields: any;
    @Input() globalEventsNames: any;
    @Input() parentPageCode: string;
    //@Input() viewSelector: string;
    @Input() currentView: any;
    @Input() currentPage: any;
    @Input() currentRecord: any;
    @Input() currentType: any;
    @Input() codeValue: any;
    @Input() dataFields: any;
    isDesigner: boolean = false;
    fieldSetBackgroundImage: string;
    isTableHeader: boolean;
    isToggled: boolean = false;
    fieldGroupHeading: string = '';
    options = {
        gridType: GridType.VerticalFixed,
        compactType: CompactType.CompactUp,
        margin: 2,
        outerMargin: true,
        pushing: false,
        outerMarginTop: null,
        outerMarginRight: null,
        outerMarginBottom: null,
        disableWindoResize: false,
        outerMarginLeft: null,
        useTransformPositioning: true,
        mobileBreakpoint: 10,
        minCols: 1,
        maxCols: 15,
        minRows: 1,
        maxRows: 100,
        maxItemCols: 100,
        minItemCols: 1,
        maxItemRows: 100,
        minItemRows: 1,
        maxItemArea: 100000,
        minItemArea: 1,
        defaultItemCols: 1,
        defaultItemRows: 1,
        fixedColWidth: 10,
        fixedRowHeight: 10,
        keepFixedHeightInMobile: true,
        keepFixedWidthInMobile: true,
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
            enabled: false
        },
        resizable: {
            enabled: false
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
    constructor(private domSanitizer: DomSanitizer) {}
    ngOnInit() {
        if (this.field.CodeElement === 'Background Image') {
            if (this.field.Children) {
                Helpers.setBackGroundImageToForm(
                    this.getImageURL(),
                    'ui-element ' + this.field._id
                );
            } else {
                Helpers.setBackGroundImageToForm(this.getImageURL(), 'view-renderer');
            }
        } else if (this.field.CodeElement === 'Image') {
            this.field['imageUrl'] = this.getImageURL();
        }
        if (this.field.CodeElement === 'Field Group') {
            this.field.groupDataClass = !this.isTableHeader
                ? 'data' + this.currentView['_id'] + this.field._id
                : '';
            this.field.groupHeaderClass = !this.isTableHeader
                ? 'header' + this.currentView['_id'] + this.field._id
                : '';
        } else if (
            this.field.CodeElement === 'Field Group Heading' &&
            this.fieldGroupHeading !== ''
        ) {
            this.field.dataClass = 'data' + this.currentView['_id'] + this.field._id;
            this.field.headerClass = 'header' + this.currentView['_id'] + this.field._id;
            setTimeout(() => {
                $('#groupHeading').addClass(this.field.headerClass);
            }, 100);
        } else {
            this.field.groupDataClass = !this.isTableHeader
                ? 'data' + this.currentView['_id'] + this.field._id
                : '';
            this.field.groupHeaderClass = !this.isTableHeader
                ? 'header' + this.currentView['_id'] + this.field._id
                : '';
        }

        if (this.field.Children) {
            this.field.Children.forEach((element) => {
                this.UIElements[element]['x'] = this.UIElements[element].CodeColumn;
                this.UIElements[element]['y'] = this.UIElements[element].CodeRow;
                this.UIElements[element]['rows'] = this.UIElements[element].CodeRows;
                this.UIElements[element]['cols'] = this.UIElements[element].CodeColumns;
            });
            for (let i = 0; i < this.field.Children.length; i++) {
                if (this.UIElements[this.field.Children[i]].CodeCode === 'Field Group Heading') {
                    this.fieldGroupHeading = this.UIElements[
                        this.field.Children[i]
                    ].CodeDescription;
                }
                this.UIElements[this.field.Children[i]][
                    'groupDataClass'
                ] = this.field.groupDataClass;
                this.UIElements[this.field.Children[i]][
                    'groupHeaderClass'
                ] = this.field.groupHeaderClass;
            }
        }
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field['isTableCell'];
    }
    getImageURL() {
        if (this.field.CodeFilterDefault) {
            return Utils.getFileFullpath(this.field.CodeFilterDefault);
        }
    }
    parseHtmlContent(content) {
        content = content.en ? content.en : content;
        if (content) {
            return this.domSanitizer.bypassSecurityTrustHtml(content);
        } else {
            return '';
        }
    }
}
