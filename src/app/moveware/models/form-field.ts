export interface Validator {
    name: string;
    validator: any;
    message: string;
}
export interface FieldConfig {
    CodeDescription?: string;
    name?: string;
    inputType?: string;
    options?: string[];
    collections?: any;
    CodeType: string;
    CodeValue?: any;
    validations?: Validator[];
    CodeVisible?: boolean;
}
