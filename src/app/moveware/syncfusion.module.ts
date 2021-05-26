//Start of Core Modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//End of Core Modules

//Start of Form Modules
import {
    CalendarModule,
    DatePickerModule,
    DateRangePickerModule,
    DateTimePickerModule,
    TimePickerModule
} from '@syncfusion/ej2-angular-calendars';
import {
    ButtonModule,
    CheckBoxModule,
    ChipListModule,
    RadioButtonModule,
    SwitchModule
} from '@syncfusion/ej2-angular-buttons';
import {
    AutoCompleteModule,
    ComboBoxModule,
    DropDownTreeModule,
    DropDownListModule,
    ListBoxModule,
    MultiSelectModule
} from '@syncfusion/ej2-angular-dropdowns';

import {
    ColorPickerModule,
    NumericTextBoxModule,
    TextBoxModule,
    UploaderModule
} from '@syncfusion/ej2-angular-inputs';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';

//End of Form Modules

//Start of Data View modules

import { DocumentEditorModule } from '@syncfusion/ej2-angular-documenteditor';
import { DiagramModule } from '@syncfusion/ej2-angular-diagrams';
import { GanttAllModule } from '@syncfusion/ej2-angular-gantt';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { KanbanModule } from '@syncfusion/ej2-angular-kanban';
import { ListViewModule } from '@syncfusion/ej2-angular-lists';
import {
    PivotFieldListAllModule,
    PivotViewAllModule,
    PivotViewModule
} from '@syncfusion/ej2-angular-pivotview';
import { ScheduleModule } from '@syncfusion/ej2-angular-schedule';
import { TreeGridModule } from '@syncfusion/ej2-angular-treegrid';
//End of Data Views modules

//Other Modules
import {
    AccordionModule,
    ContextMenuModule,
    MenuModule,
    TabModule,
    ToolbarModule
} from '@syncfusion/ej2-angular-navigations';

import { ChartModule } from '@syncfusion/ej2-angular-charts';
import { DashboardLayoutModule, SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DynamicFieldDirective } from './directives/dynamic-field.directive';
import { enableRipple } from '@syncfusion/ej2-base';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { QueryBuilderModule } from '@syncfusion/ej2-angular-querybuilder';
import { SpreadsheetAllModule } from '@syncfusion/ej2-angular-spreadsheet';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';

enableRipple(true);
const SYNCFUSION_MODULES = [
    //Core Modules
    FormsModule,
    ReactiveFormsModule,

    //Form Modules
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    CheckBoxModule,
    ChipListModule,
    ColorPickerModule,
    ComboBoxModule,
    DatePickerModule,
    DateRangePickerModule,
    DateTimePickerModule,
    DropDownTreeModule,
    DropDownButtonModule,
    DropDownListModule,
    TextBoxModule,
    MultiSelectModule,
    NumericTextBoxModule,
    RadioButtonModule,
    RichTextEditorModule,
    SwitchModule,
    TooltipModule,
    TimePickerModule,
    UploaderModule,

    //Data View Modules
    ChartModule,
    DiagramModule,
    DashboardLayoutModule,
    GanttAllModule,
    GridModule,
    KanbanModule,
    ListBoxModule,
    ListViewModule,
    PagerModule,
    PivotViewModule,
    PivotViewAllModule,
    PivotFieldListAllModule,
    ScheduleModule,
    TreeGridModule,

    //Other Modules
    AccordionModule,
    ContextMenuModule,
    DocumentEditorModule,
    DialogModule,
    MenuModule,
    ProgressBarModule,
    QueryBuilderModule,
    SplitterModule,
    SpreadsheetAllModule,
    TabModule,
    ToastModule,
    ToolbarModule,
    TooltipModule
];

@NgModule({
    declarations: [DynamicFieldDirective],
    imports: SYNCFUSION_MODULES,
    exports: [...SYNCFUSION_MODULES, DynamicFieldDirective]
})
export class SyncfusionModule {}
