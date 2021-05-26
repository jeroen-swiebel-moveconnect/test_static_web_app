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
    SimpleChanges
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
import { GridView } from '../components/data-util-view/data-views/grid-view/grid-view.component';
const componentMapper = {
    'Data Form': DataFormRendererComponent,
    'Data List': DataListViewComponent,
    Grid: GridView,
    Field: DynamicFormComponent,
    Taskbar: AppActionHandler,
    Task: ButtonComponent,
    'UI Component': DynamicFormComponent,
    'UI Container': AppContainerComponent
};
export const CREATE_MODE: string = 'CREATE_MODE';
@Directive({
    selector: '[data-view-renderer]'
})
export class DataViewRendererDirective implements OnInit {
    @Input() dataViewMetaData: any;
    @Input() currentView: any;
    @Input() currentPage: any;
    componentRef: any;
    dataView: any;
    constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) {}
    ngOnInit() {
        //   if (this.dataView) {
        let viewType = this.dataViewMetaData.viewType;
        const factory = this.resolver.resolveComponentFactory(componentMapper[viewType]);
        this.componentRef = this.container.createComponent(factory);
        const _instance = this.componentRef.instance;
        if (viewType === 'Grid') {
            _instance.metaData = this.dataViewMetaData;
            _instance.currentPage = this.currentPage;
            _instance.currentView = this.currentView;
        }
        //  }
    }
}
