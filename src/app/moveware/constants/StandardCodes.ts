import { Injectable } from '@angular/core';
import { AppActionHandler } from 'src/app/moveware/components/app-action-handler/app-action-handler.component';
import { ButtonComponent } from 'src/app/moveware/components/form-components/button/button.component';
import { CheckboxComponent } from 'src/app/moveware/components/form-components/checkbox/checkbox.component';
import { ColorPickerComponent } from 'src/app/moveware/components/form-components/color-picker/color-picker.component';
import { DateComponent } from 'src/app/moveware/components/form-components/date/date.component';
import { DynamicFieldTypeComponent } from 'src/app/moveware/components/form-components/dynamic-field/dyanmic-field.component';
import { EditableComboboxComponent } from 'src/app/moveware/components/form-components/editable-combobox/editable-combobox.component';
import { FileUploadComponent } from 'src/app/moveware/components/form-components/file-upload/file-upload.component';
import { HyperLinkComponent } from 'src/app/moveware/components/form-components/hyperlink/hyperlink.component';
import { IconPickerComponent } from 'src/app/moveware/components/form-components/icon-picker/icon-picker.component';
import { InputComponent } from 'src/app/moveware/components/form-components/input/input.component';
import { TextAreaComponent } from 'src/app/moveware/components/form-components/input/input.textarea.component';
import { InputSwitchComponent } from 'src/app/moveware/components/form-components/inputswitch/inputswitch.component';
import { LookupComponent } from 'src/app/moveware/components/form-components/lookup/lookup.component';
import { MultiSelectComponent } from 'src/app/moveware/components/form-components/multiselect/multiselect.dropdown';
import { LogoutComponent } from 'src/app/moveware/components/form-components/mw-logout/mw-logout.component';
import { SearchComponent } from 'src/app/moveware/components/form-components/mw-search/mw-search.component';
import { MwThemesComponent } from 'src/app/moveware/components/form-components/mw-themes/mw-themes.component';
import { UserProfileInfoComponent } from 'src/app/moveware/components/form-components/mw-user-info/mw-user-info.component';
import { NumericTextboxComponent } from 'src/app/moveware/components/form-components/numeric-textbox/numeric-textbox.component';
import { PasswordComponent } from 'src/app/moveware/components/form-components/password/password.component';
import { QueryBuilder } from 'src/app/moveware/components/form-components/query-builder/query-builder.component';
import { QuickListComponent } from 'src/app/moveware/components/form-components/quick-list/quick-list.component';
import { RadiobuttonComponent } from 'src/app/moveware/components/form-components/radiobutton/radiobutton.component';
import { RatingComponent } from 'src/app/moveware/components/form-components/rating/rating.component';
import { RichTextEditor } from 'src/app/moveware/components/form-components/rich-text-editor/rich-text-editor.component';
import { SelectComponent } from 'src/app/moveware/components/form-components/select/select.component';
import { SelectButtonComponent } from 'src/app/moveware/components/form-components/selectbutton/selectbutton.component';
import { SliderComponent } from 'src/app/moveware/components/form-components/slider/slider.component';
import { ToggleButtonComponent } from 'src/app/moveware/components/form-components/togglebutton/togglebutton.component';
import { UIElementComponent } from 'src/app/moveware/components/form-components/UI-Element/ui-element.component';

@Injectable({
    providedIn: 'root'
})
export class StandardCodes {
    public static TASK_GANTT_VIEW_CODE = 'Gantt';
    public static TASK_DIAGRAM_VIEW_CODE = 'Diagram';
    public static TASK_SPREADSHEET_VIEW_CODE = 'Spreadsheet';
    public static TASK_TREE_VIEW_CODE = 'Tree';
    public static START_DATE = 'DateFrom';
    public static CODE_YES = 'Yes';
    public static CREATE_MODE = 'CREATE_MODE';
    public static END_DATE = 'DateTo';

    public static START_TIME = 'TimeFrom';
    public static SELECT_TIME_PERIOD = 'Select Time Period';
    public static SELECT_TIME_ZONE = 'Select Time Zone';
    public static CODE_DESCRIPTION = 'CodeDescription';
    public static END_TIME = 'TimeTo';
    public static FILE_DESCRIPTION = 'FileDescription';
    public static FILE_TYPE = 'FileType';
    public static SETTING_CODE = 'SettingCode';
    public static TASK_ADD_CODE = 'Add';
    public static TASK_REFRESH_CODE = 'Refresh';
    public static UI_ACTION_ROW_EXPAND = 'Row Expand';
    public static TASK_ADD_CHILD_CODE = 'Add Child';
    public static TASK_TEMPLATE = 'Templates';
    public static TASK_RESET_FILTERS_CODE = 'Reset Filters';
    public static TASK_ADD_VIEW_CODE = 'Add View';
    public static TASK_OPEN_FILE_SYSTEM = 'Open File System';
    public static SAVE_TEMPLATE = 'Save Template';
    public static UPDATE_TEMPLATE = 'Update Template';
    public static DELETE_TEMPLATE = 'Delete Template';
    public static BACKGROUND_IMAGE = 'BackgroundImage';
    public static TASK_SEARCH = 'Search';
    public static TASK_GET_RECORD = 'Get Record';
    public static TASK_GET_OPTIONS = 'Get Options';
    public static TASK_SELECT_CODE = 'Select';
    public static TASK_EDIT_CUSTOM_VIEW_CODE = 'Edit Custom View';
    public static TASK_DELETE_CUSTOM_VIEW_CODE = 'Delete Custom View';
    public static TASK_LOAD_UI_CONTAINER = 'Load UI Container';
    public static TASK_LOAD_DASHBOARD = 'Load Dashboard';
    public static TASK_LOAD_LOOKUP = 'Load Lookup';
    public static UI_ACTION_LOOKUP = 'Lookup';
    public static UI_ACTION_VALUE_CHANGED = 'Value Changed';
    public static UI_ACTION_CLICK = 'Mouse Left Click';
    public static UI_LOOKUP_CLICK = 'Lookup Left Click';
    public static UI_ACTION_MOUSEOVER = 'Mouseover';
    public static UI_ACTION_ROW_SELECT = 'Row Select';
    public static UI_ACTION_DOUBLE_CLICK = 'Mouse Left Double Click';
    public static TASK_ZOOM_IN = 'Zoom In';
    public static TASK_COPY = 'Copy';
    public static TASK_PASTE = 'Paste';
    public static TASK_CUT = 'Cut';
    public static TASK_LOAD_TASK_DETAILS = 'Load Task Details';
    public static LOAD_TEMPLATE = 'Load Template';
    public static TASK_LOADd_PROCESS_DETAILS = 'Load Process Details';
    public static TASK_LOAD_DYNAMIC_DETAILS = 'Load Dynamic Details';
    public static TASK_LOAD_TRANSLATION_DETAILS = 'Load Translation Details';
    public static TASK_LOAD_QUICK_TEXT = 'Quick Text';
    public static TASK_LOAD_TASK_LIST = 'Load Task List';
    public static TASK_LOAD_PROCESS_LIST = 'Load Process List';
    public static TASK_LOAD_COMPLETED_TASK_LIST = 'Load Completed Task List';
    public static TASK_LOAD_PENDING_TASK_LIST = 'Load Pending Task List';
    public static TASK_ON_LOAD = 'On Load';
    public static TASK_UNDO = 'Undo';
    public static TASK_REDO = 'Redo';
    public static TASK_PRINT_CODE = 'Print';
    public static TASK_EXPORTTOEXCEL_CODE = 'Export to Excel';
    public static TASK_DELETE_CODE = 'Delete';
    public static TASK_HELP_CODE = 'help';
    public static VIEW_UPDATE_MODE = 'VIEW_UPDATE_MODE';
    public static TASK_SELECTALL_CODE = 'Select All';
    public static TASK_DESELECTALL_CODE = 'Deselect All';
    public static TASK_DENSITY_CODE = 'Density';
    public static TASK_CARD_VIEW_CODE = 'Card';
    public static TASK_LIST_VIEW_CODE = 'List';
    public static TASK_GALLERY_VIEW_CODE = 'Gallery';
    public static TASK_REPORT_VIEW_CODE = 'Report';
    public static TASK_PIVOT_VIEW_CODE = 'Pivot';
    public static DATA_KANBAN = 'Data Kanban';
    public static DATA_CARD = 'Data Card';
    public static DATA_SCHEDULE = 'Data Schedule';
    public static DATA_PIVOT = 'Data Pivot';
    public static DATA_GANTT = 'Data Gantt';
    public static TASK_SCHEDULE_VIEW_CODE = 'Schedule';
    public static TASK_CROSSTAB_VIEW_CODE = 'Cross Tab';
    public static TASK_CHART_VIEW_CODE = 'Chart';
    public static TASK_ORG_CHART_CODE = 'Org Chart';
    public static DATA_TREE = 'Data Tree';
    public static TASK_OPEN_LINK_IN_NEW_TAB = 'Open Link In New Tab';
    public static TASK_OPEN_LINK_IN_NEW_WINDOW = 'Open Link In New Window';
    public static TASK_OPEN_RECORD_IN_NEW_TAB = 'Open Record In New Tab';
    public static TASK_OPEN_RECORD_IN_NEW_WINDOW = 'Open Record In New Window';
    public static TASK_EXPAND_ALL = 'Expand All';
    public static TASK_OPEN_FILTERS = 'Open Filter Dialog';
    public static TASK_CALENDAR_GRID_CODE = 'Calendar';
    public static TASK_GRID_SIZE_VERY_SMALL = 'Very Small';
    public static TASK_GRID_SIZE_SMALL = 'Small';
    public static TASK_GRID_SIZE_MEDIUM = 'Medium';
    public static TASK_GRID_SIZE_LARGE = 'Large';
    public static TASK_CODE = 'Task';
    public static JSON_PARAMETER_CODE = 'JSONParameter';
    public static UI_CONTAINER_CODE = 'UIContainer';
    public static CODE_UI_LOCATION = 'CodeUILocation';
    public static CODE_UI_ACTION = 'CodeUIAction';
    public static SPECIFIC_KEYSTROKE = 'Specific Keystroke';
    public static QUICK_TEXT = 'Quick Text';
    public static MOUSE_RIGHT_CLICK = 'Mouse Right Click';
    public static CONTEXT_MENU = 'Context Menu';
    public static DATA_GRID = 'Data Grid';
    public static CODE_TYPE_DATA_FORM = 'Data Form';
    public static CODE_TYPE_UI_COMPONENT = 'UI Component';
    public static CODE_TYPE_TASK_BAR = 'Taskbar';
    public static CODE_TYPE_FIELD = 'Field';
    public static FIELD_GROUP = 'Field Group';
    public static FIELD_TYPE_COMBO_BOX = 'Combo Box';
    public static FIELD_TYPE_PICKLIST = 'Picklist';
    public static FIELD_TYPE_DROPDOWN_BUTTON = 'Dropdown Button';
    public static FIELD_TYPE_DROPDOWN_LIST = 'Dropdown List';
    public static CODE_TYPE_DASHBOARD = 'Dashboard';
    public static CODE_TYPE_REPORT = 'Report';
    public static CODE_TYPE_UI_CONTAINER = 'UI Container';
    public static CODE_TYPE_DATA_CALENDAR = 'Data Calendar';
    public static CODE_TYPE_DATA_LIST = 'Data List';
    public static CODE_FILE_UPLOAD = 'File Upload';
    public static EXPORT_TO_CSV = 'Export to CSV';
    public static EXPORT_TO_CSV_SELECTED_ROWS = 'Export to CSV Selected Rows';
    public static EXPORT_TO_EXCEL = 'Export to Excel';
    public static EXPORT_TO_EXCEL_SELECTED_ROWS = 'Export to Excel Selected Rows';
    public static LOOKUP_CHARACTER = 'LookupCharacter';
    public static MENU_BAR_TYPE_EXPANDED = 'Expanded';
    public static MENU_BAR_TYPE_STANDARD = 'Standard';
    public static DATA_LIST = 'Data List';
    public static EXPAND_IN_TREE = 'ExpandInTree';
    public static SUPPORTED_FORMATS = 'SupportedFormats';
    public static DATA_FORM_HELP_QUICK_SEARCH = 'Help Quick Search';
    public static DISPLAY_ICON: string = 'Icon';
    public static DISPLAY_TEXT: string = 'Text';
    public static DISPLAY_ICONANDTEXT: string = 'Icon and Text';
    public static MEDIA_PREVIEW: string = 'Media Preview';
    public static NEW_VERSION: string = 'New Version';
    public static DATA_WORKFLOW: string = 'Data Workflow';
    public static LOAD_VIEW: string = 'Load View';
    public static UPDATE_LAYOUT: string = 'Update Layout';
    public static Grid_Row_Height: string = 'Grid Row Height';
    public static FIELD_LIST: string = 'FieldList';
    public static SET_PROPERTY: string = 'Set Property';
    public static GET_PROPERTY: string = 'Get Property';
    public static LANGUAGE: string = 'Language';
    public static REGION: string = 'Region';
    public static DECIMAL: string = 'Decimal';
    public static DOUBLE: string = 'Double';
    public static TOOLBAR_FILTER_LIST: string = 'Filter List';
    public static TOOLBAR_COLUMN_LIST: string = 'Column List';
    public static TOOLBAR_GROUPBY_ROW_LIST: string = 'Select Row Groups';
    public static TOOLBAR_GROUPBY_COLUMN_LIST: string = 'Select Column Groups';
    public static TIMEZONE: string = 'Time Zone';
    public static EQUAL: string = '=';
    public static NOTEQUAL: string = '!=';
    public static LESSTHAN: string = '<';
    public static GREATERTHAN: string = '>';
    public static LESSTHANOREQUAL: string = '<=';
    public static GREATERTHANOREQUAL: string = '>=';
    public static ISINLIST: string = 'Is In';
    public static BETWEEN: string = 'between';
    public static NOTBETWEEN: string = 'not between';
    public static CONTAINS: string = 'contains';
    public static IN: string = 'in';
    public static NOTIN: string = 'not in';
    public static STARTSWITH: string = 'starts with';
    public static ENDSWITH: string = 'ends with';
    public static ISEMPTY: string = 'is empty';
    public static ISNOTEMPTY: string = 'is not empty';
    public static ISNULL: string = 'is null';
    public static ISNOTNULL: string = 'is not null';
    public static VIRTUAL: string = 'Virtual';
    public static INFINITE: string = 'Infinite';
    public static FIELD_TYPE_QUERYBUILDER: string = 'Query Builder';
    public static MULTI_SELECT_TREE_COMBO_BOX = 'Multi Select Tree Combo Box';
    public static DROPDOWN_TREE = 'Dropdown Tree';
    public static DATATYPE_STRING = 'String';
    public static NONE = 'None';
    public static INITIAL_LOGIN_PAGE = 'Initial Login Page';
    public static TASK_PIN_TO_FAVOURITES = 'Pin to Favourites';
    public static TASK_UNPIN_FROM_FAVOURITES = 'Unpin from Favourites';
    public static MENU_ITEM_MY_FAVOURITES = 'My Favourites';
    public static MENU_LAYOUT_HORIZONTAL = 'Horizontal';
    public static DYNAMIC_FORM = 'Dynamic Form';
    public static EDIT_MODE_NORMAL = 'Normal';
    public static EDIT_MODE_DIALOG = 'Dialog';
    public static SETTING_TEMPLATES = 'Setting Templates';

    public static ERROR_CODES = {
        '101': 'No view is configured',
        '102': 'Container not configured properly',
        '103': 'No Report Template Set For Selected Layout',
        '104': 'No UI Container configured',
        '105': 'Not a valid file format',
        '106': 'Atleast profile menu should be there in Quick menu to load themes'
    };
    public static EVENTS = {
        RECORD_CREATED: 'Record Created',
        CONFIGURATION_ERROR: 'Configuration Error',
        NO_RECORD_SELECTED: 'No Record Selected',
        RECORD_DELETED: 'Record Deleted',
        SYSTEM_ERROR_OCCURRED: 'System Error Occurred',
        FILE_UPLOADED_SUCCESSFULLY: 'File Uploaded Successfully',
        FILE_FORMAT_INVALID: 'File Format Invalid',
        SYSTEM_ERROR: 'System Error',
        RECORD_UPDATED: 'Record Updated',
        RECORDS_UPDATED: 'Records Updated',
        LOGIN_SUCCESSFUL: 'Login Successful',
        DATA_ENTRY_ERROR: 'Data Entry Error',
        NO_ACTION_AVAILABLE: 'No Action Available',
        NO_CHANGES_MADE: 'No Changes Made',
        VIEW_UPDATED: 'View Updated',
        VIEW_ADDED: 'View Added',
        VIEW_DELETED: 'View Deleted',
        NO_VIEW_SELECTED: 'No View Selected',
        NO_FILTER_SELECTED: 'No Filter Selected',
        LAYOUT_UPDATED: 'Layout Updated',
        NO_SUBTYPE_SELECTED: 'Please select sub type to save Template',
        CANNOT_UNPIN_FAVOURITE: 'Cannot unpin menu from Favourites',
        CANNOT_UNPIN_GLOBAL_FAVOURITE: 'Cannot unpin Global Favourites',
        CANNOT_PIN_FAVOURITE: 'Cannot pin menu to Favourites',
        MENU_ALREADY_EXISTS: 'Menu already exists in Favourites',
        CANNOT_PIN_PARENT_FAVOURITE: 'Cannot pin parent menu to Favourites'
    };

    public static UILOCATION = {
        NEWTAB: 'New Tab',
        MAIN: 'Main',
        DIALOG_CENTER: 'Dialog Center',
        DIALOG_LEFT: 'Dialog Left',
        DIALOG_RIGHT: 'Dialog Right',
        NEW_WINDOW: 'New Window',
        PANEL_RIGHT: 'Panel Right',
        PANEL_LEFT: 'Panel Left',
        PANEL_TOP: 'Panel Top',
        PANEL_BOTTOM: 'Panel Bottom',
        POPUP_LEFT: 'Popup Left',
        POPUP_RIGHT: 'Popup Right',
        WINDOW_RIGHT: 'Window Right',
        WINDOW_LEFT: 'Window Left',
        WINDOW_TOP: 'Window Top',
        WINDOW_BOTTOM: 'Window Bottom',
        WINDOW_CENTER: 'Window Center'
    };
    public static MESSAGES = {
        SESSION_INACTIVITY: 'Session Inactivity',
        CONFIGURATION_ERROR: 'Configuration Error',
        FILE_UPLOADED_SUCCESSFULLY: 'File Uploaded Successfully',
        INVALID_FILE_FORMAT: 'Invalid File Format',
        LOGIN_FAILED: 'Login Failed',
        LOGIN_SUCCESSFUL: 'Login Successful',
        LOGOUT_WARNING: 'Logout Warning',
        NO_ACTION_AVAILABLE: 'No Action Available',
        NO_CHANGES_MADE: 'No Changes Made',
        NO_RECORD_SELECTED: 'No Record Selected',
        PASSWORD_UPDATED: 'Password Updated',
        RECORD_CREATED: 'Record Created',
        RECORD_DELETED: 'Record Deleted',
        RECORD_DELETION_WARNING: 'Record Deletion Warning',
        RECORD_UPDATED: 'Record Updated',
        SESSION_EXPIRY: 'Session Expiry',
        SYSTEM_ERROR: 'System Error',
        UNSAVED_DATA_WARNING: 'Unsaved Data Warning',
        VALIDATION_FAILED: 'Validation Failed'
    };
    public static componentMapper = {
        Text: InputComponent,
        'Rich Text': RichTextEditor,
        Search: SearchComponent,
        Notes: TextAreaComponent,
        button: ButtonComponent,
        'Combo Box': SelectComponent,
        'Color Picker': ColorPickerComponent,
        Quicklist: QuickListComponent,
        Date: DateComponent,
        'Date Time': DateComponent,
        Time: DateComponent,
        'Radio Button': RadiobuttonComponent,
        'Check Box': CheckboxComponent,
        'Multi Select Combo Box': MultiSelectComponent,
        'Dropdown Tree': MultiSelectComponent,
        'Editable Combo Box': EditableComboboxComponent,
        'File Upload': FileUploadComponent,
        'Icon Picker': IconPickerComponent,
        Logout: LogoutComponent,
        'Query Builder': QueryBuilder,
        'User Info': UserProfileInfoComponent,
        Theme: MwThemesComponent,
        Lookup: LookupComponent,
        'Dynamic Type': DynamicFieldTypeComponent,
        Hyperlink: HyperLinkComponent,
        Rating: RatingComponent,
        'Toggle Button': ToggleButtonComponent,
        'Select Button': SelectButtonComponent,
        Switch: InputSwitchComponent,
        Slider: SliderComponent,
        Password: PasswordComponent,
        'UI Component': UIElementComponent,
        Taskbar: AppActionHandler,
        'Numeric Text': NumericTextboxComponent
    };
}
