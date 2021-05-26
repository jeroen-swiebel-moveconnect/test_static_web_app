import { Directive, HostListener, Input, EventEmitter } from '@angular/core';
import { QuickMenuToggleService } from '../services/quick-menu-toggle-listener.service';
declare var jQuery: any;
declare var $: any;
@Directive({
    selector: '[mwDataToggle]'
})
export class MwDataToggleDirective {
    @Input() mwDataToggle: string;
    constructor(private quickmenuToggle: QuickMenuToggleService) {}
    @HostListener('click', ['$event'])
    clickEvent(event) {
        if (!$(event.target).closest('li.dropdown').hasClass('show')) {
            this.quickmenuToggle.onQuickMenuToggle(
                $('.navbar-toolbar li.show .dropdown-toggle').attr('id')
            );
            $('.navbar-toolbar li').removeClass('show');
            $(event.target).closest('li.dropdown').addClass('show');
        } else {
            $(event.target).closest('li.dropdown').removeClass('show');
        }
    }
}
