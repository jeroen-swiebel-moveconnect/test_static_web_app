import {
    Component,
    OnInit,
    Input,
    ViewChild,
    EventEmitter,
    Output,
    ElementRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { CollectionsService } from 'src/app/moveware/services';
import { Subscription, Subject } from 'rxjs';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { debounceTime } from 'rxjs/operators';
import { ContextService } from 'src/app/moveware/services/context.service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { GridService } from 'src/app/moveware/services/grid-service';
import { Helpers } from 'src/app/moveware/utils/helpers';
import Utils from 'src/app/moveware/services/utils';

@Component({
    selector: 'mw-search',
    templateUrl: './mw-search.component.html',
    styleUrls: ['./mw-search.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})
export class SearchComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentView: any;
    @Input() currentPage: any;
    @Input() currentContainerID: any;
    @Output() onFocusOut = new EventEmitter();
    group: FormGroup;
    typeaHeadAction: any = {};
    isProcessHighlights: Boolean = false;
    @ViewChild(OverlayPanel) overlayPanel: OverlayPanel;
    viewMode = 'VIEW_UPDATE_MODE';
    globalEventsNames: any[];
    parentViewId;

    isSearchLoading: Boolean = false;
    private overlayWidth: number = 600;
    isLeftVisible = true;

    constructor(
        private collectionsService: CollectionsService,
        private elRef: ElementRef,
        private actionService: UIActionService,
        private menuService: MenuService,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private toastService: ToastService,
        private contextService: ContextService,
        private broadcaster: Broadcaster,
        private gridService: GridService
    ) {}

    ngOnInit() {
        if (!this.gridService.parentViewID) {
            this.gridService.parentViewID = this.currentPage.parentViewID;
        }
        if (!Utils.isArrayEmpty(this.field.CodeActions)) {
            this.field.CodeActions.forEach((_action) => {
                if (_action['CodeUIAction'] == 'TypeAhead') {
                    this.typeaHeadAction = _action;
                    this.typeaHeadAction['CodeElement'] = _action['ResultComponent']['_id'];
                    this.typeaHeadAction['contextKey'] = this.currentContainerID;
                }
            });
        }
        if (this.typeaHeadAction && this.typeaHeadAction['CodeCallback']) {
            this.isProcessHighlights = this.typeaHeadAction['CodeCallback']
                .split('();')
                .includes('processHighlights');
        }
        this.subject.pipe(debounceTime(500)).subscribe((event) => {
            let events = event;
            this.isSearchLoading = false;
            let namedParameter = { suggestion: '' };
            namedParameter.suggestion = event.target.value;
            let typeaHeadActionId = '';
            if (this.typeaHeadAction && this.typeaHeadAction['_id']) {
                typeaHeadActionId = this.typeaHeadAction['_id'];
            }
            if (namedParameter.suggestion.length > 0) {
                this.collectionsService
                    .loadFieldOptions(
                        this.field.CodeElement,
                        namedParameter,
                        typeaHeadActionId,
                        this.currentPage.CodeElement
                    )
                    .subscribe(
                        (responseData) => {
                            let result = JSON.parse(responseData.body);
                            Helpers.adjustSearchOverlay(this.field._id);
                            this.options = result.options;
                            if (this.overlayPanel) {
                                this.overlayPanel.show(events);
                            }
                            this.broadcaster.broadcast(
                                this.currentContainerID + 'dataListOptions',
                                this.options
                            );
                            Helpers.setResultsListPosition(this.elRef);
                        },
                        (errorResponse) => {
                            this.toastService.showCustomToast('error', errorResponse);
                        }
                    );
            }
        });
        this.setScrollbarOptions();
    }
    onRightClick(event, input) {
        this.broadcaster.broadcast('right-click-on-field' + this.currentView._id, {
            field: this.field,
            event: event,
            inputElement: input
        });
    }

    closeRightSlide() {
        this.isLeftVisible = true;
    }

    private scrollbarOptions: any;
    private setScrollbarOptions() {
        this.scrollbarOptions = { theme: 'dark-thick', scrollButtons: { enable: true } };
    }

    private subscription: Subscription;
    private subject: Subject<any> = new Subject();
    options: any = [];
    searchKey: string = '';

    onInputChanged(event): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.options = [];
        if (event.target.value.length >= 3) {
            this.isSearchLoading = true;
            this.subject.next(event);
        } else {
            this.options = [];
            this.broadcaster.broadcast(this.currentContainerID + 'dataListOptions', this.options);
        }
    }

    private clearSearchText() {
        this.searchKey = '';
        this.options = [];
    }
    loadAction(selectedOption: any) {
        let action;
        if (this.field.CodeActions !== undefined) {
            this.field.CodeActions.forEach((_action) => {
                if (_action['CodeUIAction'] === StandardCodes.UI_ACTION_CLICK) {
                    action = _action;
                }
            });
        }
        //  isClick = Utils.arrayHasProperty(allActions, StandardCodes.UI_ACTION_CLICK);

        this.processAction(selectedOption, action);
    }
    private processAction(selectedOption: any, action) {
        if (!action) {
            return;
        }
        let actionCode = action.Task.CodeCode;
        switch (actionCode) {
            case StandardCodes.TASK_LOAD_UI_CONTAINER: {
                let selectedData = {};
                selectedData = this.actionService.getActionMetaData(
                    selectedData,
                    action,
                    selectedOption
                );
                selectedData['parentContainerId'] = selectedData['UIContainer'];

                this.overlayPanel.hide();
                this.broadcaster.broadcast(this.currentPage.CodeUIContainerDesignerParent, {
                    data: { _id: selectedData['criteria']['_id'] }
                });
                //       this.broadcaster.broadcast(this.gridService.parentViewID + "toggleViews",{data:{_id:selectedData["criteria"]["_id"]}});
                break;
            }

            default: {
                // TODO:
                console.log("Didn't match any action.... Contact the system administrator!!!");
                break;
            }
        }
    }
}
