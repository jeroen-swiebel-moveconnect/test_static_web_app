import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FieldConfig } from '../field.interface';
import {
    RichTextEditorComponent,
    ToolbarService,
    LinkService,
    ImageService,
    HtmlEditorService,
    NodeSelection
} from '@syncfusion/ej2-angular-richtexteditor';
import Utils from 'src/app/moveware/services/utils';
import { ContextService } from 'src/app/moveware/services/context.service';
import { CollectionsService, EventsListenerService } from 'src/app/moveware/services';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { DialogComponent, OpenEventArgs } from '@syncfusion/ej2-angular-popups';

/**
 * <p> This is the rich text editor </p>
 */

/* Limitations: quick text is still using PrimeNG panel */
/* To-Dos: button for signature, button for paragraph selection */
/* To-Fix: Loading issue with Toolbar, text & signature replacement issues */

@Component({
    selector: 'app-richtexteditor',
    templateUrl: './rich-text-editor.component.html',
    styleUrls: ['./rich-text-editor.component.scss'],
    providers: [ToolbarService, LinkService, ImageService, HtmlEditorService]
})
export class RichTextEditor implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentPage: any;
    @Input() currentView: any;
    @Input() currentRecord: any;
    @ViewChild('rte') editor: RichTextEditorComponent;
    @ViewChild('ejDialog') dialogRef: DialogComponent;
    // Set Dialog position
    public position: object = { X: 'left', Y: 'top' };
    public editorSelection: NodeSelection = new NodeSelection();
    public range: Range;
    public saveSelection: NodeSelection;
    value: any;
    suggestions: any;
    currentListIndex: any = 0;
    isKeyStroke: boolean;
    isQuickText: boolean;
    lastTypedChar: string;
    selection: any;
    componentType: string = 'Rich Text Editor';
    mentionValue: string;

    private globalEventsNames: any[];
    private CodeAction: any;
    private isCached: boolean = false;
    private lookupCharacter: string;
    private event: any;
    private escapePressed: boolean = false;
    private KeyStrokeActions: any;
    private isTableHeader: boolean;
    private secureContent: any;
    private specificKeyStrokes: any;

    /* SyncFusion RTE variables */
    public toolbar: object = {
        type: 'Expand',
        items: [
            'Bold',
            'Italic',
            'Underline',
            'FontName',
            'FontSize',
            'FontColor',
            'BackgroundColor',
            '|',
            'Formats',
            'Alignments',
            'OrderedList',
            'UnorderedList',
            'Outdent',
            'Indent',
            '|',
            'CreateLink',
            'Image',
            '|',
            'ClearFormat',
            'Print',
            'SourceCode',
            'FullScreen',
            '|',
            'Undo',
            'Redo'
        ]
    };
    public inlineMode: object = { enable: true, onSelection: true };

    constructor(
        private eventsListener: EventsListenerService,
        private collectionsService: CollectionsService,
        private contextService: ContextService,
        private broadcaster: Broadcaster,
        private quickTextHandler: QuickTextHandlerService,
        private domSanitizer: DomSanitizer,
        private cacheService: CacheService,
        private uiActionService: UIActionService
    ) {}

    ngOnInit() {
        // this.field.CodeLookupEnabled = this.isLookupEnabled();
        this.field.allActions = Utils.getArrayOfProperties(this.field.CodeActions, 'CodeUIAction');
        this.getKeyStrokeActions();
        // this.insertSignatures();
        // this.setParagraphStyles();
        this.field.isOnlyLookup = Utils.getLookupType(
            this.field.CodeActions,
            StandardCodes.UI_LOOKUP_CLICK
        );

        this.getSecureHtml(this.field.CodeValue);
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            !this.field['isTableCell'] &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM;
        this.field.dataClass = !this.isTableHeader
            ? 'data' + this.currentView['_id'] + this.field._id
            : '';
        this.field.headerClass = !this.isTableHeader
            ? 'header' + this.currentView['_id'] + this.field._id
            : '';
        Utils.replaceQuickTextsIfAvailable(this);
        $('.' + this.field.CodeDescription).focus();
    }

    /**
     * <p> To handle the key up event in the editor </p>
     * @param event : contains the keyboard key up event
     */
    onKeyUp(event) {
        Utils.keyPress(this, event);
    }

    /**
     * <p> To handle the open of the list of quick text in the dialog  </p>
     * @param args : OpenEventArgs
     */
    onDialogOpen(args: OpenEventArgs) {
        args.preventFocus = true;
    }

    /**
     * <p> To handle any keyboard event in the editor </p>
     * @param event : keyboard event that's not printable
     */
    handleKeyboardEvent(event) {
        Utils.handleKeyboardEvent(this, event);
    }

    /**
     * <p> Invoked on detection of specific quick text key events </p>
     * @param event : event of the specific key action
     */
    handleSpecificKeyStroke(event) {
        this.mentionValue = '';
        this.lookupCharacter = '';
        Utils.getQuickText(
            this,
            { label: event['JSONParameter']['codecode'] },
            undefined,
            event['JSONParameter']['output']
        );
    }

    /**
     * <p> This is ran on creation of the Rich Text Editor 0</p>
     *
     * @param event : rich text editor creation event
     */
    onCreate(event) {
        if (this.field.CodeEnabled !== 'Yes') {
            this.editor.toolbarSettings.enable = false;
        } else {
            this.editor.height = 310;
        }
        this.editor.refreshUI();
    }

    /**
     * <p> Checks to see if there is a lookup UI Action set on the field </p>
     * returns true if there is a lookup UI Action set on the field
     */
    private isLookupEnabled() {
        this.field.allActions = Utils.getArrayOfProperties(this.field.CodeActions, 'CodeUIAction');
        let actions = this.field.allActions.toString();
        return actions.indexOf('Lookup') >= 0;
    }

    /**
     * <p> Creates a list of keystroke actions set as the UI Actions of the editor </p>
     */
    private getKeyStrokeActions() {
        let keystrokes = [];
        if (!Utils.isArrayEmpty(this.field.CodeActions)) {
            this.KeyStrokeActions = this.field.CodeActions.filter((action) => {
                if (action[StandardCodes.CODE_UI_ACTION] === StandardCodes.SPECIFIC_KEYSTROKE) {
                    if (action[StandardCodes.LOOKUP_CHARACTER]) {
                        if (action[StandardCodes.LOOKUP_CHARACTER].length > 1) {
                            keystrokes.push(
                                action[StandardCodes.LOOKUP_CHARACTER].replace(/\s/g, '')
                            );
                        }
                        if (action.Task && action.Task.CodeCode === 'Quick Text') {
                            this.isQuickText = true;
                        }
                    }
                    return action;
                }
            });
            this.specificKeyStrokes = keystrokes;
            this.isKeyStroke = this.KeyStrokeActions.length > 0;
        }
        if (this.field.allActions) {
            this.field.allActions = this.field.allActions.filter((action) => {
                if (action !== 'click' || action !== 'mouseleave') {
                    return action;
                }
            });
        }
    }

    /**
     * <p> On selecting suggestion value, replace the quick text and close the suggestion panel </p>
     * @param selected : selected suggestion
     */
    onValueSelect(selected: any) {
        let task = Utils.fetchTask(this.CodeAction);
        if (
            this.CodeAction &&
            this.CodeAction['JSONParameter'] &&
            this.CodeAction['JSONParameter']['output']
        ) {
            Utils.executeTasks(
                this,
                task,
                'set',
                selected,
                this.CodeAction['JSONParameter']['output']
            );
        } else if (this.CodeAction) {
            Utils.executeTasks(this, task, 'set', selected);
        }
        this.dialogRef.hide();
    }

    /**
     * <p> To show the panel of suggestions </p>
     *
     * @param panel : the panel to be shown
     */
    private showSuggestionsPanel() {
        if (!Utils.isArrayEmpty(this.suggestions) && this.dialogRef) {
            this.range = this.editorSelection.getRange(document);
            this.saveSelection = this.editorSelection.save(this.range, document);
            this.dialogRef.show();
            const position = this.range.getBoundingClientRect();
            this.dialogRef.position = { X: position.left + 5, Y: position.top + 10 };
            $('.' + this.field.CodeDescription).focus();
        } else if (this.dialogRef) {
            this.dialogRef.hide();
        }
    }

    /**
     * <p> Marks the field as dirty for saving to occur </p>
     */
    markDirty() {
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }
        this.field.isDirty = true;
        if (
            this.globalEventsNames &&
            Utils.isEventSource(this.field, this.globalEventsNames, this.quickTextHandler) &&
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.eventsListener.onEventUpdate({
                eventType: 'field_update',
                eventName: this.field.CodeCode
            });
        } else if (
            this.field.isDirty &&
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isTableCell &&
            !this.field.isRuleValue
        ) {
            let filtertype = this.field.CodeColumnFilterType
                ? this.field.CodeColumnFilterType
                : this.field.CodeFilterType;
            if (!filtertype) {
                filtertype = this.field.CodeFieldType;
            }
            let data = {
                source: 'searchColumn',
                CodeElement: this.field.CodeElement,
                CodeDescription: this.field.CodeDescription,
                CodeFilterType: filtertype,
                value: this.field.CodeValue ? this.field.CodeValue : '',
                values: this.field.options ? this.field.options : '',
                isHeaderFilter: this.field.isHeader
            };
            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
        }
    }

    /**
     * <p> Sets the field value from database </p>
     */
    set setField(field) {
        this.field = null;
        //   setTimeout(() => {
        this.field = field;
        this.setValue();
        this.getSecureHtml(this.field.CodeValue);
        Utils.replaceQuickTextsIfAvailable(this);
        // }, 100);
    }

    /**
     * <p> Set Value to 'en' if CodeValue is an object </p>
     */
    private setValue() {
        let lang = JSON.parse(this.cacheService.getSessionData('language'));
        lang = lang.CodeCode ? lang.CodeCode : 'en';
        if (
            this.field.CodeValue &&
            typeof this.field.CodeValue === 'object' &&
            this.field.CodeValue[lang]
        ) {
            this.field.CodeValue = this.field.CodeValue[lang];
        } else if (
            this.field.CodeValue &&
            typeof this.field.CodeValue === 'object' &&
            this.field.CodeValue['en']
        ) {
            this.field.CodeValue = this.field.CodeValue['en'];
        }
    }

    /**
     * <p> Bypass security and trust the given value to be safe HTML </p>
     * @param content : field.codeValue is the HTML to be trusted
     */
    private getSecureHtml(content) {
        if (content) {
            this.secureContent = this.domSanitizer.bypassSecurityTrustHtml(content);
        }
    }

    ngOnDestroy() {
        if (this.editor) {
            this.editor.destroy();
        }
        if (this.dialogRef) {
            this.dialogRef.destroy();
        }
    }
}
