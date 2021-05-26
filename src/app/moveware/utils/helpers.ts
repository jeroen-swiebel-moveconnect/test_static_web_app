import { closest } from '@syncfusion/ej2-base';

declare var jQuery: any;
declare var $: any;
export class Helpers {
    static getDashboardItemWidth(id) {
        let width = $('#' + id + '_dashbaord-item').width();
        let bodyWidth = $('body').width();
        if (width && bodyWidth) {
            return (width / bodyWidth) * 100;
        }
    }
    static getRowIndex(ExpandRowCell: Element) {
        return parseInt(ExpandRowCell.parentElement.getAttribute('aria-rowindex'), 10);
    }
    static getExapndCell(event: any) {
        return Helpers.getCellContainingClass(event, 'e-detailrowexpand');
    }
    static getCollapseCell(event: any) {
        return Helpers.getCellContainingClass(event, 'e-detailrowcollapse');
    }
    private static getCellContainingClass(event: any, className: string) {
        let cell = closest(event['target'], 'td');
        let isClassContains = cell.classList.contains(className);
        return isClassContains ? cell : undefined;
    }
    static getSpaceAvailableInPaginator(viewId) {
        let width = parseInt($('.data-view--' + viewId + ' ejs-pager').css('width'));
        let child: any = $('.data-view--' + viewId + ' ejs-pager').children();
        let size: any = 0;
        for (let element of child) {
            size = size + parseInt($('.' + element.className.replaceAll(' ', '.')).css('width'));
        }
        return width - size;
    }
    static setOpacityToPopup(className: string, value: number) {
        $(className).css('opacity', value);
    }
    static getscrollHeight(conatiner: string, viewId: string, className: string) {
        let elems = $('#' + conatiner + ' .' + viewId + ' .' + className + ' gridster-item');
        let height = 0;
        // elems.forEach(item => {
        //   height = +$(item).height()
        // });
        for (let i = 0; i < elems.length; i++) {
            height = height + $(elems[i]).height();
        }
        // return $("." + viewId + " ." + className).prop("scrollHeight")
        return height;
    }
    static getGridsterItemsCount(conatiner: string, viewId: string, className: string) {
        return $('.' + conatiner + ' .' + viewId + ' .' + className + ' gridster-item').length;
    }
    static setBackGroundImageToForm(imageUrl: string, className) {
        $('.' + className).css('background-image', "url('" + imageUrl + "')");
        $('.' + className).css('background-repeat', 'no-repeat');
        $('.' + className).css('background-size', 'cover');
    }
    static removeOverlayClass() {
        $('.ui-widget-overlay').removeClass('ui-widget-overlay');
    }
    static setLoading(loading) {
        const body = $('body');
        if (loading) {
            $('.preloader-backdrop').fadeIn(200);
        } else {
            $('.preloader-backdrop').fadeOut(200);
        }
    }
    static adjustSearchOverlay(elem) {
        $('.' + elem).hide();
        setTimeout(() => {
            let top = $('#' + elem).offset().top + 35;
            let width = $('#' + elem + ' .ui-inputtext').innerWidth();
            $('.' + elem)
                .animate({ top: top })
                .show();
            // $("." + elem + " .ui-overlaypanel-content").css({ 'width': width });
        }, 100);
    }
    static removeLazyLoadElement() {
        $('.data_row').removeClass('lazy_loader-element');
    }
    static fixRowToHeader(entry, gridUIContainer) {
        if ($(gridUIContainer) && $(gridUIContainer).offset()) {
            let top = $(gridUIContainer).offset().top;
            if ($(entry.target).hasClass('expanded')) {
                $('.groupby_row').removeClass('fixed_row');
                $(gridUIContainer).css({ 'margin-top': '28px' });
                $(entry.target).addClass('fixed_row');
                $(entry.target).css({ top: top });
            } else {
                if (this.isLastGroupElement(entry)) {
                    this.removeFixedRowHeader(gridUIContainer);
                }
            }
        }
    }
    static isLastGroupElement(entry) {
        return $(entry.target).hasClass('lastElement');
    }
    static removeFixedRowHeader(gridUIContainer) {
        $('.groupby_row').removeClass('fixed_row');
        $(gridUIContainer).css({ 'margin-top': '0' });
    }

    static bodyClass(Class) {
        $('body').attr('class', Class);
    }

    static initLayout() {
        //SIDEBAR TOGGLE ACTION
        setTimeout(() => {
            $('.js-sidebar-toggler').click(function () {
                $('body').toggleClass('sidebar-mini');
                $('.side-menu li ul').removeClass('show');
                $('.side-menu li').removeClass('showChild');
                $('.side-menu li a').attr('aria-expanded', false);
            });
        }, 300);
        setTimeout(() => {
            $('.activeMenu').click(function () {
                $(this).closest('.metismenu').find('li').removeClass('active');
                $(this).closest('li').addClass('active');
            });
        }, 100);
        // $(function () {
        //   $('#mainmenu').metisMenu();
        // });
    }
    static resizeWindow() {
        window.dispatchEvent(new Event('resize'));
    }
    static initPage() {
        // Activate Tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // Activate Popovers
        $('[data-toggle="popover"]').popover();

        // Activate slimscroll
        $('.scroller').each(function () {
            $(this).slimScroll({
                height: $(this).attr('data-height'),
                color: $(this).attr('data-color'),
                railOpacity: '0.9'
            });
        });

        $('.slimScrollBar').hide();

        // PANEL ACTIONS
        // ======================

        $('.ibox-collapse').click(function () {
            const ibox = $(this).closest('div.ibox');
            ibox.toggleClass('collapsed-mode').children('.ibox-body').slideToggle(200);
        });
        $('.ibox-remove').click(function () {
            $(this).closest('div.ibox').remove();
        });
        $('.fullscreen-link').click(function () {
            if ($('body').hasClass('fullscreen-mode')) {
                $('body').removeClass('fullscreen-mode');
                $(this).closest('div.ibox').removeClass('ibox-fullscreen');
                $(window).off('keydown', toggleFullscreen);
            } else {
                $('body').addClass('fullscreen-mode');
                $(this).closest('div.ibox').addClass('ibox-fullscreen');
                $(window).on('keydown', toggleFullscreen);
            }
        });
        function toggleFullscreen(e) {
            // pressing the ESC key - KEY_ESC = 27
            if (e.which === 27) {
                $('body').removeClass('fullscreen-mode');
                $('.ibox-fullscreen').removeClass('ibox-fullscreen');
                $(window).off('keydown', toggleFullscreen);
            }
        }
    }

    static scrollGrid(elementClass, element) {
        if ($('#' + element).offset()) {
            setTimeout(() => {
                $(elementClass).animate(
                    {
                        scrollTop: $('#' + element).offset().top
                    },
                    2000
                );
            }, 30);
        }
    }

    static setResultsListPosition(elRef) {
        setTimeout(() => {
            if ($('p-treetable').closest('.treegrid').length > 1) {
                var activeElement = elRef.nativeElement.ownerDocument.activeElement;
                var overlayPanner = $('.ui-overlaypanel').get(0);
                var height = activeElement.offsetHeight;
                var offsetTop = activeElement.offsetTop;
                var styleTop = parseFloat(overlayPanner.style.top);
                $('.ui-overlaypanel').css({ top: styleTop - (height + offsetTop + 4) + 'px' });
                $('.ui-overlaypanel').find('div').first().css({ width: activeElement.offsetWidth });
            }
        }, 1000);
    }
    static addErrors(errors, view) {
        errors.forEach((error) => {
            $('.' + view._id + ' .' + error.errorLocation).addClass('error');
            $('.' + view._id + ' .' + error.errorLocation + ' .error-info-icon').attr(
                'title',
                error.message
            );
        });
    }
    static removeErrors(view, key) {
        if (key) {
            $('.' + view._id + ' .' + key[0]).removeClass('error');
        } else {
            $('.' + view._id)
                .find('.error')
                .removeClass('error');
        }
    }
    static removeDialog() {
        $('.window-dialog').parent()?.parent()?.remove();
    }
    static showSecondaryMenus() {
        $("div[id ^= 'secondaryTasks']").show();
    }
    static changeToEditMode(id) {
        $('#' + id).removeClass('editable-field');
    }
    static changeToAddMode(id) {
        $('#' + id).addClass('editable-field');
    }
    static addClass(_selector: string, _class: string) {
        $(_selector).addClass(_class);
    }
    static removeClass(_selector: string, _class: string) {
        $(_selector).removeClass(_class);
    }
    static addClassToViewsContainer(id) {
        $('.' + id)
            .closest('.child-content-wraper')
            .addClass('summary-views');
    }
    static removeClassToViewsContainer(id) {
        $('.' + id)
            .closest('.child-content-wraper')
            .removeClass('summary-views');
    }
    static makeViewsOneColumn(id) {
        $('.' + id)
            .closest('#app-container')
            .addClass('single-column');
    }
    static makeViewsMultiColumn(id) {
        $('.' + id)
            .closest('#app-container')
            .removeClass('single-column');
    }
}
