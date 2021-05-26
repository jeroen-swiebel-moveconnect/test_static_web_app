import { Directive, ElementRef, Input, Renderer2, Output, EventEmitter } from '@angular/core';

import { UIActionService } from '../services/ui-action.service';
import Utils from '../services/utils';
import { StandardCodes } from '../constants/StandardCodes';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';

declare function addShortcut(key_combination, callback, opt): any;

@Directive({
    selector: '[event-manager]'
})
export class EventManagerDirective {
    private timer: any;
    @Input('event-manager') actions: any;
    @Input('data') data: string;
    @Input('column') column: string;
    @Input('field') field: any;
    @Input('contextKey') contextKey: string;
    @Output() actionEvent = new EventEmitter<any>();
    private broadcasterEvent: any;
    selectedData: any;
    constructor(
        private elementRef: ElementRef,
        private actionsService: UIActionService,
        private renderer: Renderer2,
        private broadcaster: Broadcaster,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig
    ) {}
    ngOnInit() {
        if (!Utils.isArrayEmpty(this.actions)) {
            this.attachEvents();
        } else {
            console.log('No actions found');
        }
    }

    attachEvents() {
        if (this.actions.includes(StandardCodes.UI_ACTION_CLICK)) {
            this.elementRef.nativeElement.addEventListener('click', this.onClick.bind(this, event));
        }
        if (this.actions.includes(StandardCodes.UI_ACTION_MOUSEOVER)) {
            this.elementRef.nativeElement.addEventListener(
                'mouseover',
                this.onMouseover.bind(this)
            );
            this.elementRef.nativeElement.addEventListener(
                'mouseleave',
                this.onMouseleave.bind(this)
            );
        }
        if (this.actions.includes(StandardCodes.SPECIFIC_KEYSTROKE)) {
            this.bindKeyStrokes();
        }
    }

    bindKeyStrokes() {
        if (!Utils.isArrayEmpty(this.field.CodeActions)) {
            this.field.CodeActions.forEach((codeAction) => {
                if (
                    codeAction[StandardCodes.CODE_UI_ACTION] === StandardCodes.SPECIFIC_KEYSTROKE &&
                    codeAction[StandardCodes.LOOKUP_CHARACTER] &&
                    codeAction[StandardCodes.LOOKUP_CHARACTER].length > 1
                ) {
                    addShortcut(
                        codeAction[StandardCodes.LOOKUP_CHARACTER].replace(/\s/g, ''),
                        () => {
                            this.actionEvent.emit(codeAction);
                        },
                        {}
                    );
                }
            });
        }
    }

    onClick() {
        let event = {};
        event['type'] = 'click';
        event['target'] = this.elementRef.nativeElement;
        if (this.mouseOverData) {
            this.broadcaster.broadcast(this.mouseOverData.UIContainer + 'close');
        }
        this.handleAction(StandardCodes.UI_ACTION_CLICK, event);
    }
    private mouseOverData;
    private handleAction(actionType, event) {
        this.selectedData = this.actionsService.getActionDetails(
            this.column,
            this.data,
            actionType,
            ''
        );
        // this.selectedData.selectedRecords = this.selectedList;
        if (this.selectedData.IsParentContext) {
            this.selectedData.parentContainerId = this.contextKey;
        } else {
            this.selectedData.parentContainerId = this.selectedData.UIContainer;
        }
        if (actionType === StandardCodes.UI_ACTION_MOUSEOVER) {
            this.mouseOverData = Utils.getCopy(this.selectedData);
        }
        this.actionsService.actionHandler(
            this.column,
            this.data,
            actionType,
            null,
            event,
            this.dialog,
            this.dialogConfig
        );
    }

    private timeOuts = [];
    onMouseover() {
        let timer = setInterval(() => {
            let event = {};
            event['type'] = 'click';
            event['target'] = this.elementRef.nativeElement;
            this.handleAction(StandardCodes.UI_ACTION_MOUSEOVER, event);
            this.clearIntervals();
        }, 2000);
        this.timeOuts.push(timer);
        this.broadcasterEvent = this.broadcaster.on('click-registered').subscribe(() => {
            this.clearIntervals();
        });
    }

    onMouseleave() {
        if (
            this.selectedData &&
            this.selectedData.CodeUIAction === StandardCodes.UI_ACTION_MOUSEOVER
        ) {
            this.broadcaster.broadcast('closeQuickPopup');
        }
        this.clearIntervals();
    }
    clearIntervals() {
        this.timeOuts.forEach((timer) => {
            clearInterval(timer);
        });
        this.timeOuts = [];
    }

    onkeyDown() {
        console.log('Keydown');
    }
    ngOnDestroy() {
        this.elementRef.nativeElement.removeEventListener('click', this.onClick.bind(this, event));
        if (!this.broadcasterEvent && this.broadcasterEvent !== undefined) {
            this.broadcasterEvent.unsubscribe();
        }
    }
}
