import {
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ComponentFactoryResolver,
    ComponentRef,
    ViewContainerRef,
    Directive,
    SimpleChanges
} from '@angular/core';

import Utils from 'src/app/moveware/services/utils';

import { RuleEngineService } from 'src/app/moveware/services/rule-engine.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { DynamicFormComponent } from '../components/form-components/dynamic-form/dynamic-form.component';
const componentMapper = {
    'Data Form': DynamicFormComponent
};

@Directive({
    selector: '[dynamicView]'
})
export class DynamicViewDirective implements OnInit, OnChanges {
    @Input() currentView: any;
    @Input() isLeftPaneVisible: boolean;
    //@Input() currentType: string;
    @Input() currentRecord: string;
    @Input() viewMode: string;

    // SUB-CONTAINER  RELATED INPUTS: START
    @Input() nPages: any;
    @Input() translationContext: any;
    @Input() nRows: any;
    @Input() nColumns: any;
    @Input() subContainerID: any;
    @Input() parentViewID: any;
    @Input() currentPage: any;
    @Input() parentPageCode: string;
    @Output() onRowSelect = new EventEmitter();
    @Output() onRowReOrder = new EventEmitter();
    @Input() dataFields;
    componentRef: any;
    eventSourcesNames: any;
    originalUIElements: any;
    settingsEvent: any;
    constructor(
        private resolver: ComponentFactoryResolver,
        private container: ViewContainerRef,
        private rulesEngines: RuleEngineService,
        private broadcaster: Broadcaster,
        private quickTextHandler: QuickTextHandlerService
    ) {}

    ngOnInit() {
        if (this.currentView) {
            this.currentView.CodeViewType = this.currentView.CodeViewType
                ? this.currentView.CodeViewType
                : 'Form';
            const factory = this.resolver.resolveComponentFactory(componentMapper['Data Form']);
            this.componentRef = this.container.createComponent(factory);
            const ref = this.componentRef.instance;
            ref.parentPageCode = this.parentPageCode;
            ref.translationContext = this.translationContext;
            ref.currentView = this.currentView;
            ref.viewMode = this.viewMode;
            ref.currentPage = this.currentPage;
            ref.dataFields = this.dataFields;
            ref.currentRecord = this.currentRecord;
            ref.UIElements = this.currentView.UIElements;
            ref.UIElementsMetaData = this.currentView.UIElementsMetaData;
            this.originalUIElements = Utils.getCopy(this.currentView.UIElements);
            ref.repeatable = this.currentView.repeatable;
            ref.globalEventsNames = Utils.getEventSourceNames(this.currentView.UIElements);
            this.eventSourcesNames = JSON.parse(JSON.stringify(ref.globalEventsNames));
            //this.quickTextHandler.currentRecord = Utils.getCopy(this.currentRecord);
            this.settingsEvent = this.broadcaster
                .on<string>(this.currentView.CodeCode + 'apply_settings')
                .subscribe((data) => {
                    const ref = this;
                    let eventType = data['eventType'];
                    let eventName = data['eventName'];
                    let eventData = data['eventData'];
                    if (eventType === 'field_reset' && eventData) {
                        ref.resetTargetFields(eventData);
                    } else if (eventType === 'field_update' && eventData) {
                        ref.resetTargetFields(eventData);
                        ref.updateFields(eventData, eventName);
                    }
                });
        }
    }

    async updateFields(eventData: any, eventName: string) {
        let settingFields = [];
        eventData.forEach((evtName) => {
            let _field = Utils.getUIElementByCode(this.originalUIElements, evtName);
            settingFields.push(_field);
        });
        let porcessedFields = await this.rulesEngines.processSettings(
            this.currentRecord,
            settingFields,
            'Field',
            this.currentView
        );
        porcessedFields.forEach((porcessedField) => {
            let _field = Utils.getUIElementByCode(
                this.currentView.UIElements,
                porcessedField.CodeCode
            );
            this.currentView.UIElements[_field['_id']] = porcessedField;
            this.componentRef.instance.UIElements[_field['_id']] = porcessedField;
        });
    }
    private resetTargetFields(eventData: any) {
        const ref = this;
        eventData.forEach((event) => {
            let uiElements = this.currentView.UIElements;
            let fieldInCurrentView;
            for (const _key in uiElements) {
                let field = uiElements[_key];
                if (field.CodeCode === event) {
                    fieldInCurrentView = _key;
                }
            }
            if (fieldInCurrentView) {
                let originalField = Utils.getUIElementByCode(this.originalUIElements, event);
                this.currentView.UIElements[fieldInCurrentView] = originalField;
                if (this.componentRef) {
                    this.componentRef.instance.UIElements = this.currentView.UIElements;
                    this.componentRef.instance.repeatable = this.currentView.repeatable;
                    this.componentRef.instance.globalEventsNames = Utils.getEventSourceNames(
                        this.currentView.UIElements
                    );
                    this.eventSourcesNames = JSON.parse(
                        JSON.stringify(this.componentRef.instance.globalEventsNames)
                    );
                }
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataFields'] && this.componentRef) {
            this.componentRef.instance.dataFields = changes['dataFields'].currentValue;
        }
        if (changes['currentRecord'] && this.componentRef) {
            this.componentRef.instance.currentRecord = changes['currentRecord'].currentValue;
        }
        if (changes['currentView']) {
            this.originalUIElements = Utils.getCopy(this.currentView.UIElements); //JSON.parse(JSON.stringify());
            if (this.componentRef) {
                // this.componentRef.instance.CodeFields = this.currentView.CodeFields;
                // this.componentRef.instance.repeatable = this.currentView.repeatable;
                if (this.currentView.UIElements) {
                    if (changes['currentView'].currentValue) {
                        this.currentView = changes['currentView'].currentValue;
                        this.componentRef.instance.UIElements =
                            changes['currentView'].currentValue.UIElements;
                        this.componentRef.instance.UIElementsMetaData =
                            changes['currentView'].currentValue.UIElementsMetaData;
                    }
                    this.componentRef.instance.globalEventsNames = Utils.getEventSourceNames(
                        this.currentView.UIElements
                    );
                    this.eventSourcesNames = JSON.parse(
                        JSON.stringify(this.componentRef.instance.globalEventsNames)
                    );
                    this.componentRef.instance.loadFormView(changes['currentView'].currentValue);
                }
            }
        }
        if (changes['viewMode']) {
            this.viewMode = changes['viewMode'].currentValue;
            if (this.componentRef && this.componentRef.instance) {
                this.componentRef.instance.viewMode = changes['viewMode'].currentValue;
            }
        }
    }
    private checkCode(object: any) {
        const codeValue = object.CodeCode.toLowerCase();
        if (codeValue.indexOf('type') > -1) {
            return object;
        }
    }

    ngOnDestroy() {
        if (this.settingsEvent) {
            this.settingsEvent.unsubscribe();
        }
    }
}
