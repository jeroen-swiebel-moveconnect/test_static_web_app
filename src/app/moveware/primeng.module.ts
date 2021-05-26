import { NgModule } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { EditorModule } from 'primeng/editor';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { GMapModule } from 'primeng/gmap';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ChipsModule } from 'primeng/chips';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
//import { TooltipModule } from 'primeng/tooltip';
import { SliderModule } from 'primeng/slider';
import { MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DataViewModule } from 'primeng/dataview';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { DialogModule } from 'primeng';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { FieldsetModule } from 'primeng/fieldset';
import { TreeTableModule } from 'primeng/treetable';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TabViewModule } from 'primeng/tabview';
import { PasswordModule } from 'primeng/password';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { MessageModule } from 'primeng/message';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng';

const PRIMENG_MODULES = [
    DropdownModule,
    InputTextModule,
    ButtonModule,
    EditorModule,
    MultiSelectModule,
    CalendarModule,
    CheckboxModule,
    AccordionModule,
    FileUploadModule,
    FieldsetModule,
    ToastModule,
    ChartModule,
    OverlayPanelModule,
    GMapModule,
    RatingModule,
    TableModule,
    TreeTableModule,
    DataViewModule,
    ChipsModule,
    SelectButtonModule,
    InputSwitchModule,
    RadioButtonModule,
    TooltipModule,
    ContextMenuModule,
    DialogModule,
    DynamicDialogModule,
    SliderModule,
    MenuModule,
    ProgressSpinnerModule,
    TabViewModule,
    TieredMenuModule,
    PasswordModule,
    OrganizationChartModule,
    MessageModule,
    MegaMenuModule,
    MenubarModule
];

@NgModule({ imports: PRIMENG_MODULES, exports: PRIMENG_MODULES })
export class PrimeNGModule {}
