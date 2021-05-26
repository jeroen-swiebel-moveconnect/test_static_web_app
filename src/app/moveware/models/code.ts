export class CodeModel {
    type: string;
    code: string;
    description: string;
    parent?: string;
    status: string;
    settings?: CodeSettings[] = [];
    sort?: string;
    collection?: string;
    id?: string;
}

export class CodeSettings {
    type: string;
    entities: string;
    setting: string;
}
export class collectionRequestObject {
    collectionCode: string;
    payload: any;
}

export class contextObj {
    id?: string;
    dataObjectCodeCode: string;
    parentDataObjectId?: string;
    parentId?: string;
    child?: contextObj;
    viewId?: string;
    containerId?: string;
    row?: number;
    column?: number;
    parentContainerId?: string;
}

export class ITypeChangeObject {
    data: ITypeChangeDataObject;
    value: string;
    valueCode: string;
}
export class ITypeChangeDataObject {
    source: string;
    code: string;
    _id: string;
    value?: string;
}

export class ILanguage {
    CodeCode: string;
}
export class IGridMetadata {
    CodeCode: string;
    CodeDataObject: string;
    CodeDescription: string;
    CodeDesigner: Array<any>;
    Languages: Array<any>;
    PaginationItemsPerPage: any;
    ButtonBars: Array<any>;
    TaskBars: Array<any>;
    _id: string;
    CodeFiltersVisible?: string;
    CodeRowReorderable?: string;
    CodeGridNavigationVisible?: string;
    CodeGridPanelVisible?: string;
    CodeGroupBy?: string;
    CodeFilters?: Array<any>;
    GridActions?: Array<any>;
    header?: Array<any>;
    CodeGridScrolling?: any;
    CodeFilterBarVisible?: string;
}

export interface IFilterObj {
    CodeElement?: string;
    CodeValue?: IFilterValue;
    CodeFilterType?: String;
    CodeDataType?: String;
    CodeSubField: String;
}
export interface IFilterValue {
    EqualsAny?: Array<string>;
    StartsWith?: Array<string>;
}
export interface ISearchCriteria {
    filters: Array<any>;
    context: any;
    chunkNumber: number;
    chunkLimit: number;
    sortBy: Array<any>;
    columnFilter: Array<any>;
    customCriteria?: any;
    isTreeView?: boolean;
}
export interface ISearchRequest {
    meta: any;
    criteria: ISearchCriteria;
}

export enum ConditionalTypes {
    Yes = 'Yes',
    No = 'No'
}

export enum ViewModeTypes {
    VIEW_UPDATE_MODE = 'VIEW_UPDATE_MODE',
    CREATE_MODE = 'CREATE_MODE'
}
export enum SelectionTypes {
    None = 'None',
    MultiRow = 'Multi Row',
    SingleRow = 'Single Row'
}

// [selectedNode] = 'selectedRow'
//
//     [metaData] = 'metaData'

export interface DataViewMetaData {
    rowExpandAction?: any;
    gridScrolling?: string;
    filterOptions?: any;
    viewType?: string;
    pageIndex?: number;
    isEditableGrid?: boolean;
    headerVisible?: boolean;
    currentPageSize?: number;
    actions?: Array<any>;
    header?: Array<any>;
    isRuleValue?: boolean;
    calculatedFields?: Array<any>;
    CodeGridEditMode?: any;
    criteria?: any;
    namedParameters?: Array<any>;
    setAddMode?: boolean;
    gridsterCelWidth?: number;
    rowHeight?: number;
    rowSelection?: SelectionTypes;
    selectedColumns?: Array<any>;
    selectedRow?: Object;
    columnSearchFilter?: Object;
    sortState?: Object;
    contextMenus?: Array<any>;
    allColumns?: Array<any>;
    filters?: Array<any>;
    isColumnFiltersVisible?: boolean;
    rowShading?: ConditionalTypes;
    gridLines?: ConditionalTypes;
    parentChildMap?: Object;
    isCodeRowReorderable?: boolean;
    viewMode?: ViewModeTypes;
    loadAction?: any;
    isCollapsed?: boolean;
    timeScale?: any;
    doubleClickAction?: any;
    layout?: any;
    timeInterval?: any;
    timeFrom?: any;
    chartType?: any;
    columnsMap?: any;
}
