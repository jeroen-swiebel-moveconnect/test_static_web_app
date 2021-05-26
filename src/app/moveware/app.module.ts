// Core Modules
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CalendarModule, DateAdapter } from 'angular-calendar';
// Form Components
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { GridsterModule } from 'angular-gridster2';
import { MalihuScrollbarModule, MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginatorModule } from 'primeng/paginator';
// Other Components
import { AppActionHandler } from './components/app-action-handler/app-action-handler.component';
import { AppBreadcrumbComponent } from './components/app-breadcrumb/app-breadcrumb.component';
import { AppContainerComponent } from './components/app-container/app-container.component';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { LeftNavComponent } from './components/app-leftnav/app-leftnav.component';
import { AppPageRendererComponent } from './components/app-page-renderer/app-page-renderer.component';
import { DashboardRendererComponent } from './components/dashboard-renderer/dashboard-renderer.component';
import { DataFormRendererComponent } from './components/data-form-renderer/data-form-renderer.component';
import { DataUtilViewComponent } from './components/data-util-view/data-util-view.component';
// DataView Components
import { CardViewComponent } from './components/data-util-view/data-views/card-view/card-view.component';
import { DataListViewComponent } from './components/data-util-view/data-views/data-list-view/data-list-view.component';
import { DiagramViewComponent } from './components/data-util-view/data-views/diagram-view/diagram-view.component';
import { GalleryViewComponent } from './components/data-util-view/data-views/gallery-view/gallery-view.component';
import { GanttViewComponent } from './components/data-util-view/data-views/gantt-view/gantt-view.component';
import { GridView } from './components/data-util-view/data-views/grid-view/grid-view.component';
import { GroupbyGridComponent } from './components/data-util-view/data-views/groupby-grid/groupby-grid.component';
import { KanbanViewComponent } from './components/data-util-view/data-views/kanban-view/kanban-view.component';
import { PivotComponent } from './components/data-util-view/data-views/pivot/pivot.component';
import { ReportingGrid } from './components/data-util-view/data-views/reports-grid/reports-grid.component';
import { ScheduleComponent } from './components/data-util-view/data-views/schedule/schedule.component';
import { SpreadsheetViewComponent } from './components/data-util-view/data-views/spreadsheet-view/spreadsheet-view.component';
import { DataService } from './components/data-util-view/data-views/tree-grid/data.service';
import { TreeViewGridComponent } from './components/data-util-view/data-views/tree-grid/tree-grid.component';
import { TableCellComponent } from './components/data-util-view/table-cell/table-cell.component';
import { FilterPane } from './components/filterpane-component/filterpane.component';
import { DiagramComponent } from './components/flow-diagram/flow-diagram.component';
import { ColorPickerComponent } from './components/form-components/color-picker/color-picker.component';
import { DesignerComponent } from './components/form-components/designer-component/designer.component';
import { DynamicFieldTypeComponent } from './components/form-components/dynamic-field/dyanmic-field.component';
import { DynamicFormComponent } from './components/form-components/dynamic-form/dynamic-form.component';
import { SearchComponent } from './components/form-components/mw-search/mw-search.component';
import { PasswordComponent } from './components/form-components/password/password.component';
import { QuickListComponent } from './components/form-components/quick-list/quick-list.component';
import { UIElementComponent } from './components/form-components/UI-Element/ui-element.component';
import { HomeComponent } from './components/home/home.component';
import { LayoutComponent } from './components/layouts/layout.component';
import { MegaMenuComponent } from './components/mega-menu/mega-menu.component';
import { MegaMenuPanelComponent } from './components/data-util-view/data-views/mega-menu-panel/mega-menu-panel.component';
import { SaveEditFilterContentComponent } from './components/modals/save-edit-filters/save-edit-filter.component';
import { UIActionZoominContentComponent } from './components/modals/ui-action-zoomin/ui-action-zoomin.component';
import { UILocationModalContentComponent } from './components/modals/ui-location-modal/ui-location-modal.component';
import { MWComponent } from './components/mw-component/mw.component';
import { MWDialogContentComponent } from './components/mw-dialog/mw-dialog.component';
import { PDFViewerComponent } from './components/pdfviewer/pdfviewer.component';
import { QuickViewLoaderComponent } from './components/quick-view-loader/quick-view-loader.component';
import { SlidePanelComponent } from './components/slide-panel/slide-panel.component';
import { UserDetailsFormComponent } from './components/user-details-form/user-details-form.component';
// Directives and Pipes
import { AutofocusDirective } from './directives/autofocus.directive';
import { DataViewRendererDirective } from './directives/data-view-renderer.directive';
import { DraggableDialogDirective } from './directives/draggable-Dialog.directive';
import { DynamicViewDirective } from './directives/dynamic-view.directive';
import { MwDataToggleDirective } from './directives/mw-data-toggle.directive';
import { ProcessSettingsDirective } from './directives/process-settings.directive';
import { WidgetRendererDirective } from './directives/widget-renderer.directive';
import { MWRoutingModule } from './app-routing.module';
import { checkPropertyPipe } from './pipes/checkProperty.pipe';
import { DisplayNAOnNone } from './pipes/DisplayNAonNone-pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { StringReplacePipe } from './pipes/string-replace.pipe';
import { TimesPipe } from './pipes/times.pipe';
import { ContextService } from './services/context.service';
import { DashboardService } from './services/dashobard-service';
import { GridService } from './services/grid-service';
import { LazyLoadingService } from './services/lazy-loading.searvice';
import { HttpLoaderFactory } from './services/localization.service';
import { ThemesService } from './services/themes-service';
import { ToastService } from './services/toast.service';
import { UIActionService } from './services/ui-action.service';
import { UserService } from './services/user-service';
import { SharedModule } from './shared.modules';
import {
    AggregateService,
    GroupService,
    LazyLoadGroupService,
    ReorderService
} from '@syncfusion/ej2-angular-grids';

const services = [
    AggregateService,

    DashboardService,
    DataService,
    DialogService,
    GridService,
    GroupService,
    LazyLoadingService,
    LazyLoadGroupService,
    MalihuScrollbarService,
    ReorderService,
    ThemesService,
    ToastService,
    UIActionService,
    UserService
];
const directives = [
    DataViewRendererDirective,
    DraggableDialogDirective,
    DynamicViewDirective,
    MwDataToggleDirective,
    ProcessSettingsDirective,
    WidgetRendererDirective
];
const pipes = [AutofocusDirective, checkPropertyPipe, SafeUrlPipe, StringReplacePipe, TimesPipe];
@NgModule({
    entryComponents: [
        // Form Components
        DynamicFieldTypeComponent,
        DynamicFormComponent,
        PasswordComponent,
        SearchComponent,

        // DataView Components

        CardViewComponent,
        DataListViewComponent,
        DataUtilViewComponent,
        DiagramComponent,
        DiagramViewComponent,
        GanttViewComponent,
        GridView,
        KanbanViewComponent,
        MegaMenuComponent,
        MegaMenuPanelComponent,
        PDFViewerComponent,
        QuickListComponent,
        QuickViewLoaderComponent,
        ReportingGrid,
        SaveEditFilterContentComponent,
        SpreadsheetViewComponent,
        UIActionZoominContentComponent,
        UILocationModalContentComponent,
        FilterPane,

        // Other Components
        AppActionHandler,
        DataFormRendererComponent
    ],
    declarations: [
        //Data View Components
        CardViewComponent,
        DataListViewComponent,
        DataUtilViewComponent,
        DiagramComponent,
        DiagramViewComponent,
        GalleryViewComponent,
        GanttViewComponent,
        GridView,
        GroupbyGridComponent,
        KanbanViewComponent,
        PivotComponent,
        QuickListComponent,
        ScheduleComponent,
        SpreadsheetViewComponent,

        TreeViewGridComponent,
        ReportingGrid,

        // Form Components
        ColorPickerComponent,
        MWDialogContentComponent,
        SearchComponent,
        TableCellComponent,
        UIElementComponent,

        //Other Components
        MWComponent,
        AppActionHandler,
        AppBreadcrumbComponent,
        AppContainerComponent,
        AppFooterComponent,
        AppHeaderComponent,
        AppPageRendererComponent,
        DataFormRendererComponent,
        DashboardRendererComponent,
        DesignerComponent,
        DisplayNAOnNone,
        DynamicFieldTypeComponent,
        DynamicFormComponent,
        FilterPane,
        HomeComponent,
        LayoutComponent,
        LeftNavComponent,
        MegaMenuComponent,
        MegaMenuPanelComponent,
        PivotComponent,
        QuickViewLoaderComponent,
        PasswordComponent,
        SaveEditFilterContentComponent,
        SlidePanelComponent,
        ScheduleComponent,
        UILocationModalContentComponent,
        UserDetailsFormComponent,
        PDFViewerComponent,
        ...directives,
        ...pipes
    ],
    imports: [
        ReactiveFormsModule,
        FormsModule,
        MWRoutingModule,
        CommonModule,
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        CheckboxModule,
        GridsterModule,
        MalihuScrollbarModule.forRoot(),
        PaginatorModule,
        SharedModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],

    exports: [DataListViewComponent, MWDialogContentComponent, TreeViewGridComponent],
    providers: [...services],
    bootstrap: [MWComponent]
})
export class AppModule {}
