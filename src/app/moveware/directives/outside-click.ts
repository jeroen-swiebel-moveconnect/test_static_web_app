import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[outSideClick]'
})
export class outSideClickDirective {
    @Output() outSideClick = new EventEmitter();
    constructor() {}
    @HostListener('document:click', ['$event.target'])
    clickEvent(targetElement) {
        this.outSideClick.emit(targetElement);
    }
}
