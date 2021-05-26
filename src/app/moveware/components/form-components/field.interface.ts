import { GridsterConfig, Draggable, Resizable, PushDirections } from 'angular-gridster2';

export interface Validator {
    name: string;
    validator: any;
    message: string;
}
export interface GridsterOptions extends GridsterConfig {
    draggable: Draggable;
    resizable: Resizable;
    pushDirections: PushDirections;
}
export interface FieldConfig {
    tabIndex?: any;
    CodeFormat?: string;
    isDouble?: boolean;
    isCurrency?: boolean;
    groupHeaderClass?: string;
    isHeader?: boolean;
    groupDataClass?: string;
    headerClass?: string;
    dataClass?: string;
    CodeFilterDefault: any;
    ResultComponent?: any;
    ResultLocation?: any;
    CodeDescription?: string;
    isRuleValue?: boolean;
    name?: string;
    CodeEnabled: string;
    inputType?: string;
    options?: Object[];
    collections?: any;
    CodeVisible?: string;
    CodeType: string;
    CodeValue?: any;
    CodeCollapsible?: string;
    CodeCollapsed?: string;
    Children?: string[];
    validations?: Validator[];
    overrides?: any;
    CodeCode: string;
    CodeFieldType: string;
    _id?: string;
    CodeRequired?: boolean;
    parameterNames?: Array<string>;
    CodePlaceholder?: string;
    DynamicField: any;
    CodeHyperlink?: boolean;
    CodeHideLabel?: boolean;
    CodeActions?: Array<any>;
    IsParentContext?: any;
    allActions: any;
    isOnlyLookup?: boolean;
    CodeLookupEnabled?: boolean;
    CodeDisplay?: any;
    isDirty?: boolean;
    CodeTooltip?: string;
    CodeElement?: string;
    CodeParentField?: any;
    CodeDataType?: string;
    isEditableCell?: boolean;
    CodeColumnFilterType?: string;
    CodeFilterType?: string;
    CodeSubField?: string;
    isTableCell?: boolean;
    CodeHelp?: any;
    CodeRatingIconOn?: any;
    CodeRatingIconOff?: any;
}
