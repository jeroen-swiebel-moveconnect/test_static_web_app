import { Component, Inject, OnInit, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import Utils from 'src/app/moveware/services/utils';
import { CollectionsService } from 'src/app/moveware/services';

@Component({
    selector: 'icon-slide-pane-content',
    templateUrl: './icon-slide-pane.component.html',
    styleUrls: ['./icon-slide-pane.component.scss']
})
export class IconSlidePaneComponentComponent implements OnInit {
    public iconList: any;
    public index: number = 0;
    public searchedIcons: Array<any>;
    private selectedTab: FormControl;
    public iconClass: string;
    iconColor: string = '';
    public iconFontSize: string = '15';
    field: any;
    expanded: boolean;
    searchText: string;
    title: any;
    data: any;
    collectionsService: CollectionsService;
    scrollbarOptions: any;
    constructor(public dialogRef: DynamicDialogRef, public config: DynamicDialogConfig) {
        this.data = this.config.data;
        this.collectionsService = this.data.collectionsService;
        this.iconList = this.data.iconList;
        this.field = this.data.field;
        this.searchedIcons = [];
    }

    ngOnInit() {
        if (Utils.isArrayEmpty(this.iconList[0]['icons'])) {
            this.collectionsService
                .getIconsByGroup(this.iconList[0]['description'])
                .subscribe((res) => {
                    this.iconList[0]['icons'] = res;
                });
        }
        this.intializeIconDetails();
        this.getSelectedTab();
    }
    openNext() {
        this.index = this.index === this.iconList.length - 1 ? this.index : this.index + 1;
        if (Utils.isArrayEmpty(this.iconList[this.index]['icons'])) {
            this.collectionsService
                .getIconsByGroup(this.iconList[this.index]['description'])
                .subscribe((res) => {
                    if (res) {
                        this.iconList[this.index]['icons'] = res;
                    }
                });
        }
        if (this.index > 2) {
            let element = document.querySelector('.icons').querySelector('.ui-state-active');
            element.scrollIntoView(true);
            document
                .querySelector('.icons')
                .querySelector('.ui-widget-header')
                .scrollBy(element.scrollWidth, 0);
        }
    }

    openPrev() {
        this.index = this.index === 0 ? 0 : this.index - 1;
        if (Utils.isArrayEmpty(this.iconList[this.index]['icons'])) {
            this.collectionsService
                .getIconsByGroup(this.iconList[this.index]['description'])
                .subscribe((res) => {
                    this.iconList[this.index]['icons'] = res;
                });
        }
        if (this.index < this.iconList.length - 3) {
            let element = document.querySelector('.icons').querySelector('.ui-state-active');
            element.scrollIntoView(true);
            document
                .querySelector('.icons')
                .querySelector('.ui-widget-header')
                .scrollBy(-element.scrollWidth, 0);
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }
    private intializeIconDetails() {
        if (!this.field.CodeValue) {
            this.field.CodeValue = {};
        } else {
            this.iconClass = this.field.CodeValue.class;
            this.iconColor = this.field.CodeValue.color;
            this.iconFontSize = this.field.CodeValue.fontSize;
        }
    }
    getSelectedTabData(event) {
        this.index = event.index;
        this.iconList[event.index];
        if (
            Utils.isArrayEmpty(this.iconList[event.index]['icons']) &&
            this.iconList[event.index]['description'] !== 'All'
        ) {
            this.collectionsService
                .getIconsByGroup(this.iconList[event.index]['description'])
                .subscribe((res) => {
                    this.iconList[event.index]['icons'] = res;
                });
        } else if (Utils.isArrayEmpty(this.iconList[event.index]['icons'])) {
            this.collectionsService.getIconsByGroup('').subscribe((res) => {
                this.iconList[event.index]['icons'] = res;
            });
        }
    }
    private getSelectedTab() {
        if (!Utils.isArrayEmpty(this.iconList)) {
            let iconIndex = -1;
            let selected = this.iconList.findIndex((icons, index) => {
                iconIndex = icons.icons.findIndex((icon) => {
                    return this.iconClass === icon.class;
                });
                if (iconIndex >= 0) {
                    return index + 1;
                }
            });

            this.selectedTab = new FormControl(this.iconList.legnth);
            setTimeout(() => {
                this.selectedTab.setValue(selected + 1);
            });
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
    searchedIconsData = {};
    filterIcons(event) {
        this.searchedIcons = [];
        this.collectionsService.getIconsByText(event).subscribe((res) => {
            this.searchedIconsData[event] = res;
            if (this.searchText === '') {
                this.searchedIcons = [];
            } else {
                this.searchedIcons = this.searchedIconsData[this.searchText];
            }
        });
    }
    private selectOption(icon) {
        this.iconClass = icon.class;
        // this.selectedTab.setValue(categoryIndex);
    }
    selectIcon() {
        let result;
        // setTimeout(() => {
        result = { class: this.iconClass, color: this.iconColor, fontSize: this.iconFontSize };
        //  });
        this.dialogRef.close(result);
    }
    private onOutSideClick($event) {
        if (
            !(
                $event.classList.contains('mat-input-element') ||
                $event.classList.contains('dont-close') ||
                $event.closest('.CodeIcon-picker')
            )
        ) {
            this.dialogRef.close();
        }
    }
}
