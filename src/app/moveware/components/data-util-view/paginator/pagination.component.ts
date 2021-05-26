import { Component, EventEmitter, Input, Output, SimpleChange, ViewChild } from '@angular/core';
import { PagerComponent } from '@syncfusion/ej2-angular-grids';
import Utils from 'src/app/moveware/services/utils';
import { Helpers } from '../../../utils/helpers';

@Component({
    selector: 'pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss']
})

/**
 * to load paginator.
 */
export class PaginationComponent {
    @Input() page: number;
    @Input() viewId: number;
    @Input() count: number;
    @Input() perPage: number;
    @Input() loading: boolean;
    @Input() pagesToShow: number;
    @Input() pageSizeOptions: any[];
    @Input() density: number;
    @Output() goPage = new EventEmitter<any>();
    @ViewChild('pager') pager: PagerComponent;
    public pageSize: string;
    private pageOptions: any[];
    pageNumber: number;
    itemsCanFit: number = 1;
    constructor() {}

    /**
     * triggers when pager components is created
     * @param data : event details
     */
    created(data) {
        setTimeout(() => {
            this.setPageCount(1);
        }, 1000);
    }
    /**
     *  sets the pager count
     * @param defaultCount : default value of pager count
     */
    setPageCount(defaultCount) {
        let diff = Helpers.getSpaceAvailableInPaginator(this.viewId);
        if (diff > 32) {
            this.itemsCanFit = defaultCount + Math.floor(diff / 32);
        } else {
            this.itemsCanFit = 1;
            setTimeout(() => {
                let diff = Helpers.getSpaceAvailableInPaginator(this.viewId);
                if (diff > 32) {
                    this.itemsCanFit = this.itemsCanFit + Math.floor(diff / 32);
                }
            }, 100);
        }
    }
    /**
     * resets the pager count
     */
    resetPageCount() {
        this.setPageCount(this.itemsCanFit);
    }
    ngOnChanges(simpleChanges: SimpleChange) {
        this.pageNumber = 0;
        if (simpleChanges['pageSizeOptions'] && simpleChanges['pageSizeOptions'].currentValue) {
            this.pageOptions = simpleChanges['pageSizeOptions'].currentValue;
            this.pageSizeOptions.splice(this.pageSizeOptions.indexOf('Auto'), 1);
        }
        if (
            simpleChanges['perPage'] &&
            simpleChanges['perPage'].currentValue &&
            simpleChanges['perPage'].firstChange
        ) {
            this.pageSize = simpleChanges['perPage'].currentValue;
        }
        if (
            simpleChanges['density'] &&
            simpleChanges['density'].currentValue >= 0 &&
            !simpleChanges['density'].firstChange
        ) {
            this.updateAutoRecords();
        }
    }

    /**
     * <p> to update Auto Records </p>
     */
    updateAutoRecords() {
        let array = this.pageSizeOptions ? this.pageSizeOptions : [];
        let limit;
        for (let n of array) {
            let isString = typeof n.label === 'string';
            if (isString && Utils.toLowerCase(n.label) === 'auto') {
                n.value = Utils.getRowCount(this.density);
                limit = n.value;
            }
        }
        let size = this.perPage + '';
        if (this.perPage && this.pageOptions && this.pageOptions.indexOf(size) < 0) {
            this.perPage = limit;
            this.page = 0;
            this.goPage.emit(this.getPaginatorObj(this.page, limit, true));
        }
    }

    /**
     * <p> changes of pageSizes are identified </p>
     *
     * @param size : DOM Event on change of pageSizes.
     */
    onPageSizeChange(size) {
        size = size?.pageSize.toString();
        this.perPage = Number(size);
        this.goPage.emit(this.getPaginatorObj(this.pageNumber, this.perPage));
    }

    /**
     * <p> To jump and load the selected page number </p>
     *
     * @param page : DOM Event
     */
    onPageChange(page) {
        if (page?.newProp?.currentPage) {
            this.pageNumber = page?.currentPage - 1;
            this.onPage(page.currentPage - 1);
        } else if (page?.newProp?.pageSize) {
            this.onPageSizeChange(page?.newProp);
        }
    }
    /**
     * <p> pageEvent handling </p>
     *
     * @param n : page number
     */
    onPage(n: number): void {
        this.goPage.emit(this.getPaginatorObj(n, this.perPage));
    }

    /**
     * <p> returns paginator Object </p>
     *
     * @param page : pageNumber
     * @param perPage : records perPage
     * @param isAuto : isAuto
     */
    getPaginatorObj(page, perPage, isAuto?: boolean) {
        return { pageIndex: page, pageSize: perPage, auto: isAuto };
    }

    /**
     * <p> resets Page on Custom Sorting </p>
     */
    public resetPageOnCustomSort() {
        this.page = 0;
    }
}
