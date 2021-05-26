export interface DialogData {
    type: string; // type can be 'alert' or 'confirm'. In future 'form'
    title?: string;
    message?: string;
    formData?: any; // data object consisting of form fields
    selectedView?: any;
}

export interface OverridesDialogData {
    data: any; // type can be 'alert' or 'confirm'. In future 'form'
}
export interface GridDialogData {
    gridData: any;
    headers: any;
    title: string;
}
export interface IconDialogData {
    iconList: any;
    field: any;
}
export interface StyleDialogData {
    iconList: any;
    field: any;
}
