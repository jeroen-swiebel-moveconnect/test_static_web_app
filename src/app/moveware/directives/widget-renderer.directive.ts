import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ComponentFactoryResolver,
    ComponentRef,
    ViewContainerRef,
    Directive,
    SimpleChanges,
    ElementRef
} from '@angular/core';
import { AppActionHandler } from '../components/app-action-handler/app-action-handler.component';
import { AppContainerComponent } from '../components/app-container/app-container.component';
import { DataFormRendererComponent } from '../components/data-form-renderer/data-form-renderer.component';
import { DataListViewComponent } from '../components/data-util-view/data-views/data-list-view/data-list-view.component';
import { DataUtilViewComponent } from '../components/data-util-view/data-util-view.component';
import { ButtonComponent } from '../components/form-components/button/button.component';
import { DynamicFormComponent } from '../components/form-components/dynamic-form/dynamic-form.component';
import { StandardCodes } from '../constants/StandardCodes';
import Utils from '../services/utils';
const componentMapper = {
    'Data Form': DataFormRendererComponent,
    'Data List': DataUtilViewComponent,
    'Data Tree': DataUtilViewComponent,
    'Data Grid': DataUtilViewComponent,
    'Data Kanban': DataUtilViewComponent,
    'Data Schedule': DataUtilViewComponent,
    'Data Pivot': DataUtilViewComponent,
    'Data Gantt': DataUtilViewComponent,
    'Data Card': DataUtilViewComponent,
    Field: DynamicFormComponent,
    Taskbar: AppActionHandler,
    Task: ButtonComponent,
    'UI Component': DynamicFormComponent,
    'UI Container': AppContainerComponent
};
export const CREATE_MODE: string = 'CREATE_MODE';
@Directive({
    selector: '[widget-renderer]'
})
export class WidgetRendererDirective implements OnInit {
    @Input() component: any;
    @Input() viewMode: string;
    @Input() parentPage: any;
    @Input() currentRecord: any;
    @Input() currentPage: any;
    @Input() isDashboardRenderer: boolean;
    @Input() isDesigner: boolean;
    @Input() restrictData: boolean;
    @Input() UIElements: any;
    @Input() UIElementsMetaData: any;
    @Input() windowSize: number;
    componentRef: any;
    constructor(
        private elementRef: ElementRef,
        private resolver: ComponentFactoryResolver,
        private container: ViewContainerRef
    ) {}
    ngOnInit() {
        if (this.component) {
            let componentType = this.component.CodeType;
            const factory = this.resolver.resolveComponentFactory(componentMapper[componentType]);
            this.componentRef = this.container.createComponent(factory);
            const ref = this.componentRef.instance;
            ref.currentView = this.component;
            ref.currentView['restrictData'] = this.restrictData;
            ref.currentView['isDashboard'] = this.isDashboardRenderer;
            ref.currentView['isDesigner'] = this.isDesigner;
            let componentsList = [];
            componentsList.push(this.component);
            if (
                componentType === StandardCodes.DATA_GRID ||
                componentType === StandardCodes.CODE_TYPE_DATA_LIST ||
                componentType === StandardCodes.DATA_TREE ||
                componentType === StandardCodes.DATA_GANTT ||
                componentType === StandardCodes.DATA_KANBAN ||
                componentType === StandardCodes.DATA_PIVOT ||
                componentType === StandardCodes.DATA_SCHEDULE
            ) {
                ref.currentPage = this.currentPage;
                ref.parentPage = this.parentPage;
                ref.viewTranslationContext =
                    this.currentPage && this.currentPage.CodeAlias
                        ? this.currentPage['CodeCode']
                        : 'Dashboard.' +
                          this.currentPage['ContainerCodeCode'] +
                          '.' +
                          this.currentPage['CodeCode'];
                componentsList[0].contextKey = this.currentPage.contextKey;
                componentsList[0].containerID = this.component.containerID;
                ref.windowSize = this.windowSize;
                ref.viewList = Utils.getCopy(componentsList);
                this.componentRef.instance.loadGridContainer();
            } else if (componentType === StandardCodes.CODE_TYPE_DATA_FORM) {
                let eventData = {
                    data: {
                        mode: CREATE_MODE,
                        createChild: false
                    }
                };
                ref.currentPage = this.component;
                if (this.isDashboardRenderer) {
                    ref.currentPage.contextKey = this.currentPage.contextKey;
                    ref.currentRecord = this.currentRecord;
                } else {
                    ref.currentRecord = eventData;
                }
                ref.currentPage['isWidget'] = true;
            } else if (componentType === StandardCodes.CODE_TYPE_DATA_CALENDAR) {
                ref.currentPage = componentsList;
                ref.currentRecord = this.currentRecord;
            } else if (componentType === StandardCodes.CODE_TYPE_FIELD) {
                let UIElements = {};
                ref.currentView = { CodeType: 'Data Form' };
                let UIElementsMetaData = [];
                this.component.CodeVisible = true;
                this.component.CodeHideLabel = false;
                UIElementsMetaData.push({ _id: this.component._id });
                UIElements[this.component._id] = this.component;
                ref.UIElements = UIElements;
                ref.UIElementsMetaData = UIElementsMetaData;
            } else if (componentType === StandardCodes.CODE_TYPE_TASK_BAR) {
                let ButtonBars = [];
                ref.viewList = [];
                let view = {
                    CodeType: this.currentPage.CodeType,
                    CodeCode: this.currentPage.CodeCode,
                    CodeDescription: this.currentPage.CodeDescription
                };
                ref.viewList[0] = this.currentPage;
                ref.translationContext =
                    this.component.CodeCode === 'Blank'
                        ? 'Data Grid.' + this.currentPage.CodeCode
                        : 'Taskbar.' + this.component.CodeCode;
                ref.viewTranslationContext = this.currentPage['CodeCode'];
                if (this.isDashboardRenderer && this.component?.TaskBars) {
                    ButtonBars.push(this.component.TaskBars);
                } else {
                    ButtonBars.push(this.component);
                }
                ref.currentView = { TaskBars: ButtonBars };
                this.currentPage.isDashboardRenderer = true;
                ref.currentPage = this.currentPage;
                ref.viewMode = StandardCodes.CREATE_MODE;
                ref.taskBar = ButtonBars[0];
                // } else if (componentType === StandardCodes.CODE_TYPE_DATA_LIST) {
                //     ref.currentPage = this.component;
                //     ref.viewList = Utils.getCopy(componentsList);
                // }
            } else if (componentType === StandardCodes.TASK_CODE) {
                ref.button = this.component;
            } else if (componentType === StandardCodes.CODE_TYPE_UI_COMPONENT) {
                this.UIElements[this.component._id] = this.component;
                ref.UIElements = this.UIElements;
                ref.isUIComponent = true;
                let UIElementsMetaData = [];
                ref.currentView = { CodeType: 'Data Form', isDesigner: true };
                this.component.CodeVisible = true;
                UIElementsMetaData.push({ _id: this.component._id });
                ref.UIElementsMetaData = UIElementsMetaData;
            } else if (componentType === StandardCodes.CODE_TYPE_UI_CONTAINER) {
                ref.containerID = this.component['CodeElement'];
                ref.isDashboard = true;
            }
        }
    }
}
