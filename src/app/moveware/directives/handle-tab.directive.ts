import { Directive, HostListener, Input, ViewChild } from '@angular/core';
import { Dropdown } from 'primeng';
import Utils from '../services/utils';

@Directive({
    selector: '[handle-keydown]'
})
export class HandleKeydownDirective {
    @Input('handle-keydown') element: any;
    public focusableElementString: string =
        'a:not([disabled]),textarea:not([disabled]), span.ui-inputswitch, p-toggleButton:not([disabled]), p-radioButton:not([disabled]), p-checkbox:not([disabled]), input:not([disabled])';

    @HostListener('keydown.Tab', ['$event'])
    onTabEntered(event) {
        if (event.target.localName !== 'textarea' && event.target.localName !== 'div') {
            event.preventDefault();
            let focusableItemsInField = $(event.target)
                .parent()
                .closest('gridster-item')
                .find(this.focusableElementString)
                .toArray();
            let isFocusInsideField = false;
            focusableItemsInField.every(function (item) {
                if (item['className'] === $(':focus').get(0)['className']) {
                    if (
                        focusableItemsInField.length > 1 &&
                        focusableItemsInField.indexOf(item) < focusableItemsInField.length
                    ) {
                        focusableItemsInField[focusableItemsInField.indexOf(item) + 1].focus();
                        isFocusInsideField = true;
                    } else {
                        isFocusInsideField = false;
                    }
                }
            });
            if (!isFocusInsideField) {
                let gridsterItemsInForm = $(event.target)
                    .closest('.dynamic-form')
                    .find('gridster-item')
                    .toArray();
                let arrayOfRowIndexs = [];
                gridsterItemsInForm.forEach((gridsterItem) => {
                    arrayOfRowIndexs.push(parseInt(gridsterItem.getAttribute('row')));
                });
                let currentRowIndex = $(event.target).parent().closest('gridster-item').attr('row');
                arrayOfRowIndexs = arrayOfRowIndexs.sort(function (a, b) {
                    return a - b;
                });
                this.findNextGridsterItem(
                    arrayOfRowIndexs,
                    currentRowIndex,
                    gridsterItemsInForm,
                    event
                );
            }
        } else if (event.target.localName === 'textarea') {
            event.preventDefault();
            var start = event.target.selectionStart;
            var end = event.target.selectionEnd;
            let text =
                event.target.value.substring(0, start) + '\t' + event.target.value.substring(end);
            event.target.value = text;
            event.target.selectionStart = event.target.selectionEnd = start + 1;
        }
    }

    findNextGridsterItem(arrayOfRowIndexs, currentRowIndex, gridsterItemsInForm, event) {
        //  console.log(arrayOfRowIndexs, currentRowIndex, gridsterItemsInForm, event);
        let nextRowIndex = this.getNextHighestIndex(arrayOfRowIndexs, currentRowIndex);
        let nextFieldInForm = $(event.target)
            .closest('.dynamic-form')
            .find('gridster-item')
            .filter(function () {
                return parseInt($(this).attr('row')) === nextRowIndex;
            });
        let focussableElement = nextFieldInForm.find(this.focusableElementString).toArray();
        if (!Utils.isArrayEmpty(focussableElement)) {
            if (focussableElement[0]) {
                if (focussableElement[0].localName === 'p-inputswitch') {
                } else {
                    focussableElement[0].focus();
                }
            }
        } else {
            this.findNextGridsterItem(arrayOfRowIndexs, nextRowIndex, gridsterItemsInForm, event);
        }
    }

    getNextHighestIndex(arrayOfRowIndexs, currentRowIndex) {
        for (var i = 0; i < arrayOfRowIndexs.length; i++) {
            if (arrayOfRowIndexs[i] > currentRowIndex) {
                return arrayOfRowIndexs[i];
            }
        }
    }
}
