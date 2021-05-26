// Core Modules
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QueryBuilder } from './components/form-components/query-builder/query-builder.component';

// Form Modules
import { AngularSplitModule } from 'angular-split';
import { DataViewModule } from 'primeng/dataview';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { PaginationComponent } from './components/data-util-view/paginator/pagination.component';
import { ButtonComponent } from './components/form-components/button/button.component';
import { CheckboxComponent } from './components/form-components/checkbox/checkbox.component';
import { DateComponent } from './components/form-components/date/date.component';
import { EditableComboboxComponent } from './components/form-components/editable-combobox/editable-combobox.component';
import { FileUploadComponent } from './components/form-components/file-upload/file-upload.component';
import { HyperLinkComponent } from './components/form-components/hyperlink/hyperlink.component';
import { IconPickerComponent } from './components/form-components/icon-picker/icon-picker.component';
import { IconSlidePaneComponentComponent } from './components/form-components/icon-picker/icon-slide-pane/icon-slide-pane.component';
import { InputComponent } from './components/form-components/input/input.component';
import { InputSwitchComponent } from './components/form-components/inputswitch/inputswitch.component';
import { ListboxComponent } from './components/form-components/listbox/listbox.component';
import { LogoutComponent } from './components/form-components/mw-logout/mw-logout.component';
import { LookupComponent } from './components/form-components/lookup/lookup.component';
import { MultiSelectComponent } from './components/form-components/multiselect/multiselect.dropdown';
import { MwThemesComponent } from './components/form-components/mw-themes/mw-themes.component';
import { TextAreaComponent } from './components/form-components/input/input.textarea.component';
import { UserProfileInfoComponent } from './components/form-components/mw-user-info/mw-user-info.component';
import { NumericTextboxComponent } from './components/form-components/numeric-textbox/numeric-textbox.component';
import { RadiobuttonComponent } from './components/form-components/radiobutton/radiobutton.component';
import { RatingComponent } from './components/form-components/rating/rating.component';
import { RichTextEditor } from './components/form-components/rich-text-editor/rich-text-editor.component';
import { SelectComponent } from './components/form-components/select/select.component';
import { SelectButtonComponent } from './components/form-components/selectbutton/selectbutton.component';
import { SliderComponent } from './components/form-components/slider/slider.component';
import { ToggleButtonComponent } from './components/form-components/togglebutton/togglebutton.component';
import { UIActionZoominContentComponent } from './components/modals/ui-action-zoomin/ui-action-zoomin.component';
import { ToolbarComponentView } from './components/toolbar/toolbar.component';
import { StandardCodes } from './constants/StandardCodes';
import { EventManagerDirective } from './directives/event-manager.directive';
import { FocusedDirective } from './directives/focus-list-item.directive';
import { HandleKeydownDirective } from './directives/handle-tab.directive';
import { outSideClickDirective } from './directives/outside-click';
import { ContentProcessorPipe } from './pipes/ContentProcessor.pipe';
import { DateTimeProcessorPipe } from './pipes/date-time.pipe';
// Directives and Pipes
import { JSONParserPipe } from './pipes/json-parser.pipe';
// Other Modules
import { PrimeNGModule } from './primeng.module';
import { CacheService } from './services/cache.service';
// Services
import { DataFormService } from './services/dataform-service';
import { MenuService } from './services/menu.service';
import { PageMappingService } from './services/page-mapping.service';
import { RuleEngineService } from './services/rule-engine.service';
import { SyncfusionModule } from './syncfusion.module';

//Others

@NgModule({
    providers: [
        DataFormService,
        MenuService,
        RuleEngineService,
        PageMappingService,
        StandardCodes,
        CacheService
    ],
    imports: [
        // Core Modules
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        // DataView Modules
        AngularSplitModule,
        DataViewModule,

        // Other Modules
        PrimeNGModule,
        SyncfusionModule,
        TranslateModule,

        // Form Modules
        OverlayPanelModule,
        TreeTableModule,
        TableModule
    ],
    entryComponents: [
        // Form Components
        ButtonComponent,
        CheckboxComponent,
        DateComponent,
        EditableComboboxComponent,
        FileUploadComponent,
        HyperLinkComponent,
        IconPickerComponent,
        IconSlidePaneComponentComponent,
        InputComponent,
        InputSwitchComponent,
        ListboxComponent,
        LogoutComponent,
        LookupComponent,
        MultiSelectComponent,
        MwThemesComponent,
        NumericTextboxComponent,
        QueryBuilder,
        RadiobuttonComponent,
        RatingComponent,
        RichTextEditor,
        SelectButtonComponent,
        SelectComponent,
        SliderComponent,
        TextAreaComponent,
        ToggleButtonComponent,
        UserProfileInfoComponent,

        //Other Components

        ToolbarComponentView
    ],
    declarations: [
        // Form Components
        ButtonComponent,
        CheckboxComponent,
        DateComponent,
        EditableComboboxComponent,
        FileUploadComponent,
        HyperLinkComponent,
        IconPickerComponent,
        IconSlidePaneComponentComponent,
        InputComponent,
        InputSwitchComponent,
        ListboxComponent,
        LogoutComponent,
        LookupComponent,
        MultiSelectComponent,
        MwThemesComponent,
        NumericTextboxComponent,
        PaginationComponent,
        QueryBuilder,
        RadiobuttonComponent,
        RatingComponent,
        RichTextEditor,
        SelectButtonComponent,
        SelectComponent,
        SliderComponent,
        TextAreaComponent,
        ToggleButtonComponent,
        UIActionZoominContentComponent,
        UserProfileInfoComponent,

        // Directives and Pipes
        ContentProcessorPipe,
        DateTimeProcessorPipe,
        EventManagerDirective,
        FocusedDirective,
        HandleKeydownDirective,
        JSONParserPipe,
        outSideClickDirective,
        //Others

        ToolbarComponentView
    ],
    exports: [
        // Core Modules
        FormsModule,
        ReactiveFormsModule,

        // Form Components
        AngularSplitModule,
        ButtonComponent,
        IconPickerComponent,
        PaginationComponent,
        TableModule,
        TreeTableModule,

        //Other components

        ToolbarComponentView,

        // Directives and Pipes
        ContentProcessorPipe,
        DateTimeProcessorPipe,
        EventManagerDirective,
        FocusedDirective,
        HandleKeydownDirective,

        // Other Modules
        PrimeNGModule,
        SyncfusionModule
    ]
})
export class SharedModule {}
