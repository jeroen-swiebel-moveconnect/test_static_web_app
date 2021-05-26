import { FieldConfig } from '../models';
import { StandardCodes } from '../constants/StandardCodes';
import { environment } from '../../../environments/environment';
import { GridType, CompactType, DisplayGrid } from 'angular-gridster2';
import { CacheService } from './cache.service';
import * as _ from 'lodash';

export default class Utils {
    static getFormatedLangCode(lang: string) {
        let langArr = lang.split('_');
        if (langArr && langArr[0]) {
            langArr[0] = langArr[0].toLocaleLowerCase();
        } else if (langArr && langArr[1]) {
            langArr[1] = langArr[1].toLocaleLowerCase();
        }
        lang = langArr.join('-');
        return lang;
    }
    static isTranslatable(column: FieldConfig): any {
        if (column['CodeIsTranslatable'] === 'b82aed17-fd4a-4c43-afcf-469e88f59af9') {
            return true;
        }
        return false;
    }

    static getDateFormat(cacheService: CacheService) {
        let dateFormat = '';
        let languageData = JSON.parse(cacheService.getSessionData('language'));
        if (languageData['CodeValue'] && languageData['CodeValue']['CodeDateFormat']) {
            dateFormat = languageData['CodeValue']['CodeDateFormat']['CodeCode']
                ? languageData['CodeValue']['CodeDateFormat']['CodeCode']
                : languageData['CodeValue']['CodeDateFormat'];
        }
        return dateFormat;
    }

    static getValue(value, column) {
        let keys = column.CodeCode.split('.');
        if (keys.length > 1) {
            return _.get(value, column.CodeCode);
        } else {
            return value[column.CodeCode];
        }
    }

    static getDateFormatInProperCase(cacheService: CacheService) {
        let dateFormatWithProperCase = '';
        let languageData = JSON.parse(cacheService.getSessionData('language'));
        if (languageData['CodeValue'] && languageData['CodeValue']['CodeDateFormat']) {
            dateFormatWithProperCase = languageData['CodeValue']['CodeDateFormat']['CodeCode']
                ? languageData['CodeValue']['CodeDateFormat']['CodeCode']
                : languageData['CodeValue']['CodeDateFormat'];
        }
        let newFormateArrWithCaseSensitive = dateFormatWithProperCase.split('/');
        for (let index = 0; index < newFormateArrWithCaseSensitive.length; index++) {
            if (newFormateArrWithCaseSensitive[index].match('d')) {
                newFormateArrWithCaseSensitive[index] = 'dd';
            } else if (newFormateArrWithCaseSensitive[index].match('y')) {
                newFormateArrWithCaseSensitive[index] = 'yyyy';
            } else if (newFormateArrWithCaseSensitive[index].match('m')) {
                newFormateArrWithCaseSensitive[index] = 'mm';
            } else if (newFormateArrWithCaseSensitive[index].match('D')) {
                newFormateArrWithCaseSensitive[index] = 'DD';
            } else if (newFormateArrWithCaseSensitive[index].match('Y')) {
                newFormateArrWithCaseSensitive[index] = 'YYYY';
            } else if (newFormateArrWithCaseSensitive[index].match('M')) {
                newFormateArrWithCaseSensitive[index] = 'MM';
            }
        }
        return newFormateArrWithCaseSensitive.join('/');
    }
    static getTimeFormat(cacheService: CacheService) {
        let timeFormat = '';
        let languageData = JSON.parse(cacheService.getSessionData('language'));
        if (languageData['CodeValue'] && languageData['CodeValue']['CodeTimeFormat']) {
            timeFormat = languageData['CodeValue']['CodeTimeFormat']['CodeCode']
                ? languageData['CodeValue']['CodeTimeFormat']['CodeCode']
                : languageData['CodeValue']['CodeTimeFormat'];
        }
        let newFormateArr = timeFormat.split(':');
        for (let index = 0; index < newFormateArr.length; index++) {
            if (newFormateArr[index].match('s')) {
                newFormateArr[index] = 'ss';
            } else if (newFormateArr[index].match('m')) {
                newFormateArr[index] = 'mm';
            } else if (newFormateArr[index].match('h')) {
                newFormateArr[index] = 'hh';
            } else if (newFormateArr[index].match('S')) {
                newFormateArr[index] = 'SS';
            } else if (newFormateArr[index].match('M')) {
                newFormateArr[index] = 'MM';
            } else if (newFormateArr[index].match('H')) {
                newFormateArr[index] = 'HH';
            }
        }
        return newFormateArr.join(':');
    }
    static collapseAllNodes(gridData: any) {
        if (gridData && gridData.length) {
            gridData.forEach((node) => {
                node['expanded'] = false;
                if (node.children && node.children.length) {
                    this.collapseAllNodes(node.children);
                }
            });
        }
    }
    static buildAncestorMapDataForEachNode(data: any, mapObject) {
        if (data && data.length && data[0].data) {
            data.forEach((node) => {
                if (node.data && node.data._id) {
                    if (node?.data?.Ancestors?.length && node.data.Ancestors[0]?._id) {
                        let map = [];
                        if (mapObject[node.data.Ancestors[0]._id]) {
                            map = this.getCopy(mapObject[node.data.Ancestors[0]._id]);
                        }
                        mapObject[node.data._id] = [...map, ...node.data.Ancestors];
                    }
                }
                if (node.children && node.children.length) {
                    this.buildAncestorMapDataForEachNode(node.children, mapObject);
                }
            });
        }
    }
    static pasteTextOnCursorPoint(field: any, event: any) {
        window.navigator.clipboard.readText().then((data) => {
            field.CodeValue =
                field.CodeValue.slice(0, event.selectionStart) +
                data +
                field.CodeValue.slice(event.selectionEnd);
        });
    }
    static executeRedoCammandOnEvent(event: any) {
        event.select();
        document.execCommand('redo');
    }
    static executeUndoCammandOnEvent(event: any) {
        event.select();
        document.execCommand('undo');
    }
    static removeSelectedText(value: any, selectionStart: any, selectionEnd: any): any {
        return value.slice(0, selectionStart) + value.slice(selectionEnd);
    }
    static copyToClipboard(event: any, field?: any) {
        if (typeof field.CodeValue === 'string' && event.selectionStart != event.selectionEnd) {
            window.navigator.clipboard.writeText(
                field.CodeValue.slice(event.selectionStart, event.selectionEnd)
            );
        } else {
            window.navigator.clipboard.writeText(
                field.CodeValue.label ? field.CodeValue.label : field.CodeValue
            );
        }
    }
    static getCurrentUrl() {
        return window.location.href;
    }
    static removeBrowserState(cacheService) {
        cacheService.removeSessionData('direct-url-BrowserState');
        cacheService.removeSessionData('first-time-BrowserState');
        cacheService.removeSessionData('logout-BrowserState');
        cacheService.removeSessionData('refresh-BrowserState');
    }
    static navigateToPreviousState(router, cacheService) {
        if (cacheService.getSessionData('first-time-BrowserState')) {
            router.navigateByUrl(
                cacheService.getSessionData('first-time-BrowserState').split('#')[1]
            );
        } else if (cacheService.getSessionData('logout-BrowserState')) {
            router.navigateByUrl(cacheService.getSessionData('logout-BrowserState').split('#')[1]);
        } else if (cacheService.getSessionData('refersh-BrowserState')) {
            router.navigateByUrl(cacheService.getSessionData('refersh-BrowserState').split('#')[1]);
        } else if (cacheService.getSessionData('direct-url-BrowserState')) {
            router.navigateByUrl(
                cacheService.getSessionData('direct-url-BrowserState').split('#')[1]
            );
        }
    }
    static getGroupByFilters(groupByColumns: any, option) {
        if (!groupByColumns) {
            groupByColumns = [];
        }
        let index = -1;
        let subField = option.CodeSubField || 'CodeDescription';
        groupByColumns.forEach((element, i) => {
            if (element.CodeElement === option.CodeCode) {
                index = i;
            }
        });
        if (option.isChecked && index < 0) {
            let groupField = { CodeElement: option.CodeCode };
            if (option.CodeFieldType !== 'Text') {
                groupField['CodeSubField'] = subField;
            }
            groupByColumns.push(groupField);
        } else if (!option.isChecked && index > -1) {
            groupByColumns.splice(index, 1);
        }
        // });
        // let _groups = [];
        // groupByColumns.forEach(element => {
        //     _groups.push(element.CodeElement || element);
        // });
        return groupByColumns;
    }

    public static getGrouping(customisedGrouping) {
        let groupByColumns = [];

        for (let i = 0; i < customisedGrouping.length; i++) {
            if (
                customisedGrouping[i].CodeSubField &&
                customisedGrouping[i]['CodeFieldType'] !== 'Text'
            ) {
                groupByColumns.push({
                    CodeElement: customisedGrouping[i].CodeCode,
                    CodeSubField: customisedGrouping[i].CodeSubField
                });
            } else {
                groupByColumns.push({
                    CodeElement: customisedGrouping[i].CodeCode,
                    CodeSubField: 'CodeDescription'
                });
            }
        }

        return groupByColumns;
    }

    public static removeStringInsideBracket(string) {
        if (/\(/.test(string) || /\)/.test(string)) {
            let index = string.indexOf('(');
            string = string.slice(0, index);
        }
        return string;
    }
    static parsedFormFields: FieldConfig[] = [];
    static parseAttributes(attributes, cloneObj?: any) {
        // TODO: need to update this code...
        this.parsedFormFields = [];
        if (Array.isArray(attributes)) {
            attributes.forEach((attribute) => {
                let filed = this.getFieldObj(attribute, cloneObj);
                this.parsedFormFields.push(filed);
            });
        }
        return this.parsedFormFields;
    }

    public static getCursorIndex(editor) {
        return editor.selection.get().focusOffset;
    }

    public static getMentionValue(value, cursorIndex, lookupCharacter) {
        return value.substring(value.indexOf(lookupCharacter) + 1, cursorIndex);
    }

    public static isObjectEmpty(obj) {
        return !(obj && Object.keys(obj) && Object.keys(obj).length);
    }
    public static getFieldObj(attribute, cloneObj?: any) {
        attribute.CodeDescription = attribute.CodeDescription; //string
        attribute.CodeCode = attribute.CodeCode ? attribute.CodeCode : ''; // string
        attribute.CodeFieldType = attribute.CodeFieldType; //string
        attribute.minValue = attribute.minValue;
        attribute.maxValue = attribute.maxValue;
        attribute.rows = attribute.rows ? attribute.rows : 5;
        attribute.cols = attribute.cols ? attribute.cols : 10;
        attribute.options = attribute.options ? attribute.options : [];
        attribute.CodeRequired = attribute.CodeRequired;
        attribute.CodeVisible = attribute.CodeVisible === undefined ? false : attribute.CodeVisible;
        attribute.CodeCode = attribute.CodeCode;
        if (cloneObj && cloneObj.length) {
            //edit
            cloneObj.forEach((cloneAttr) => {
                if (cloneAttr.CodeCode === attribute.CodeCode) {
                    attribute.CodeValue = cloneAttr.CodeValue;
                }
            });
        }
        //else {
        //create
        if (
            attribute.CodeCode === 'ViewActions' ||
            attribute.CodeCode === 'settings' ||
            attribute.CodeCode === 'JSONParameter'
        ) {
            // console.log('Attribute actions...');
            attribute.CodeValue = attribute.CodeValue
                ? JSON.stringify(attribute.CodeValue)
                : attribute.CodeValue;
        } else {
            attribute.CodeValue = attribute.CodeValue ? attribute.CodeValue : null; //any
        }
        //  }
        if (attribute.options) {
            //console.log(attribute.options);
        }
        attribute.collections = {}; //any
        attribute.validations = []; //Validator[]
        // if (attribute.CodeRequired) {
        //     attribute.validations.push(Validators.CodeRequired);
        // }
        return attribute;
    }
    public static verifyCalculatedField(data) {
        let field;
        if (data instanceof Array && !Utils.isArrayEmpty(data)) {
            field = data.find((record) => {
                return record.CodeIsCalculatedField === 'Yes' || record.CodeAutoAssign === 'Yes';
            });
        } else {
            return data.CodeIsCalculatedField === 'Yes' || data.CodeAutoAssign === 'Yes';
        }
        return field ? true : false;
    }
    public static isTableEditable(isEditableCell, field) {
        if (isEditableCell && field.CodeEnabled && field.CodeEnabled == 'Yes') {
            return true;
        } else {
            return false;
        }
    }
    public static findOption(options, value) {
        if (value) {
            return options.filter((option) => {
                return (
                    option._id === value ||
                    option._id === value._id ||
                    (typeof value === 'string' &&
                        option.label &&
                        Utils.trimText(option.label) === value)
                );
            })[0];
        }
    }
    public static filterQuickText(quickTexts, quickTextValue) {
        return quickTexts.filter((text) => {
            if (text.CodeDescription) {
                return text.CodeDescription.toLowerCase().includes(quickTextValue.toLowerCase());
            }
        });
    }
    public static isEventSource(_field: any, globalEventsNames: any, quickTextHandler) {
        let fields = globalEventsNames.filter((evt) => {
            if (
                evt.eventSource &&
                typeof evt.eventSource === 'string' &&
                evt.eventSource.startsWith('@@')
            ) {
                evt.eventSource = quickTextHandler.getComputedValue(evt.eventSource);
            }
            return Array.isArray(evt.eventTarget) && evt.eventSource == _field.CodeCode;
        });
        return fields.length ? true : false;
    }

    public static getEventTargetData(_field: any, globalEventsNames: any, quickTextHandler) {
        let _response = [];
        if (!this.isArrayEmpty(globalEventsNames)) {
            globalEventsNames.forEach((evt) => {
                let dynamicVal = false;
                if (
                    evt.eventSource &&
                    typeof evt.eventSource === 'string' &&
                    evt.eventSource.startsWith('@@')
                ) {
                    evt.eventSource = quickTextHandler.getComputedValue(evt.eventSource);
                    dynamicVal = true;
                }
                if (
                    (Array.isArray(evt.eventTarget) && evt.eventSource === _field.CodeCode) ||
                    dynamicVal ||
                    evt.eventSource == 'Mode'
                ) {
                    _response = _response.concat(evt.eventTarget);
                }
            });
        }
        return Array.from(new Set(_response));
    }
    public static getRuleFactKeys(str) {
        // str.match(/(?<=fact\s+).*?(?=\s+,)/gs);
        if (typeof str !== 'string') {
            str = JSON.stringify(str);
        }
        str = str.replace(/\n/g, ' ');
        str = str.replace(/\s/g, '');
        let matches = [];
        matches = str.match(/"(fact)":"((\\"|[^"])*)"/gi);
        //  return matches.toString().replace(/"fact":/g, '')
        let response;
        if (matches && matches.length) {
            response = matches.toString().replace(/"/g, '').replace(/fact:/g, '').split(',');
        }
        return response;
    }

    public static getEventSourceNames(fields: any) {
        let _response = [];
        if (!fields) {
            return;
        }

        for (let property in fields) {
            let field = fields[property];
            if (field.CodeSettings && field.CodeSettings.length) {
                let _overrides: any[] = field.CodeSettings;
                _overrides.forEach((override) => {
                    if (override.SettingRule) {
                        let eventSources = this.getRuleFactKeys(override.SettingRule);
                        if (eventSources) {
                            eventSources.forEach((source) => {
                                var itemInMap = _response.find(
                                    (item) => item.eventSource === source
                                );
                                if (itemInMap) {
                                    _response.forEach((eventObj) => {
                                        if (eventObj.eventSource === source) {
                                            eventObj.eventTarget.push(field.CodeCode);
                                            eventObj.eventTarget = Array.from(
                                                new Set(eventObj.eventTarget)
                                            );
                                        }
                                    });
                                } else {
                                    let _eventTarget = [];
                                    _eventTarget.push(field.CodeCode);
                                    _response.push({
                                        eventSource: source,
                                        eventTarget: _eventTarget
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
        // }
        return _response;
    }

    public static isArrayEmpty(array: Array<any>) {
        return !(array && array.length);
    }
    public static arrayDiff(array1: Array<any>, array2: Array<any>, property?: any) {
        let diffArray = [];
        if (this.isArrayEmpty(array1)) {
            return diffArray;
        }
        if (this.isArrayEmpty(array2)) {
            return array1;
        }
        for (let e1 of array1) {
            let isExistsInArray2 = false;
            for (let e2 of array2) {
                if (e1[property] === e2[property]) {
                    isExistsInArray2 = true;
                }
            }
            if (!isExistsInArray2) {
                diffArray.push(e1);
            }
        }
        return diffArray;
    }
    public static getCopy(data) {
        if (data) {
            return JSON.parse(JSON.stringify(data));
        }
    }
    public static isObjectsEqual(obj1, obj2) {
        return _.isEqual(obj1, obj2);
    }
    public static getIndexByProperty(array, property, value) {
        if (!this.isArrayEmpty(array)) {
            return array.findIndex((elem) => {
                return elem[property] === value;
            });
        } else {
            return -1;
        }
    }

    public static equalIgnoreCase(str1, str2) {
        if (str1 && str2) {
            return str1.toLowerCase() === str2.toLowerCase();
        } else {
            return false;
        }
    }

    public static toLowerCase(str1) {
        if (str1) {
            return str1.toLowerCase();
        } else {
            return null;
        }
    }

    public static getRowCount(density) {
        let contaierHeight: number = $('.content-pane--table').height() - 65 - 2; //actulaHeight - 65(table header) - 2 for having an space of 10px
        let rowHeight = this.getRowHeight(density);
        if (contaierHeight && rowHeight) {
            return Math.ceil(contaierHeight / rowHeight);
        } else {
            return 10;
        }
    }
    public static getRowHeight(density) {
        let height = 50;
        switch (density) {
            case 0:
                height = 50;
                break;
            case 1:
                height = 36;
                break;
            case 2:
                height = 26;
                break;
        }
        return height;
    }
    public static compare(a, b, propery) {
        if (a['propery'] < b['propery']) {
            return -1;
        }
        if (a.last_nom > b['propery']) {
            return 1;
        }
        return 0;
    }
    public static getFileFullpath(name: string) {
        return environment.FRAMEWORK_QUERY_CONTEXT + 'download/file?file_name=' + name;
    }
    public static getReportTemplatePath(templates) {
        if (!this.isArrayEmpty(templates)) {
            for (let i = 0; i < templates.length; i++) {
                if (templates[i].CodeFilename) {
                    return (
                        environment.FRAMEWORK_QUERY_CONTEXT +
                        'download/file?file_name=' +
                        templates[i].CodeFilename
                    );
                }
            }
        }
        return '';
    }
    public static getMediaPreivew(id, version) {
        return (
            environment.FRAMEWORK_QUERY_CONTEXT +
            'download/version-preview?file_name=' +
            id +
            '&version_id=' +
            version
        );
    }
    public static getUserAvatar(name: String) {
        if (name) {
            return environment.FRAMEWORK_QUERY_CONTEXT + 'objects/download/file?file_name=' + name;
        } else {
            return 'assets/images/admin-avatar.png';
        }
    }
    // public static getTypeField(record, viewSelector) {
    //     return record[viewSelector] ? record[viewSelector] : "default pages";
    // }
    public static adjustDropdown(event, closest, dontSetWidth?: boolean) {
        if (event.target) {
            let left = $(event.target).closest(closest).offset().left;
            let width = $(event.target).closest(closest).innerWidth();
            setTimeout(() => {
                $('.dropdown-list')
                    .delay(100)
                    .css('left', left + 'px');
                if (!dontSetWidth) {
                    $('.dropdown-list').css('width', width);
                }
                $('.dropdown-list').show();
                $('.ui-dropdown-filter').focus();
            }, 100);
        }
    }

    public static isDialogOpened() {
        return document.getElementsByClassName('mat-dialog-container').length;
    }

    public static focus(element) {
        if (element) {
            element.focus();
        }
    }
    public static filterSelectedOptions(filter, option, selectedFilters) {
        let isFilterTypeAvailable = false;
        let sFilters = selectedFilters;
        let sFilterValue: any[];
        let subFiled = filter.CodeSubField || 'CodeDescription';
        if (!this.isObjectEmpty(sFilters)) {
            Object.keys(sFilters).forEach((element) => {
                if (sFilters[element].CodeValue) {
                    sFilterValue =
                        sFilters[element].CodeValue.EqualsAny ||
                        sFilters[element].CodeValue.Contains;
                }
                if (filter.CodeElement.toLowerCase() === element.toLowerCase()) {
                    let elemIndex;
                    let values = [];
                    if (
                        !['Text', 'Combo Box', 'Radio Button', 'Multi Select Combo Box'].includes(
                            filter.CodeFilterType
                        ) &&
                        filter.CodeFilterType
                    ) {
                        elemIndex = sFilterValue.indexOf(option[subFiled]);
                    }
                    //if previous selected boxes are unchecked now, remove from selectedFitlers
                    if (
                        ['Combo Box', 'Radio Button', 'Select Button'].includes(
                            filter.CodeFilterType
                        ) &&
                        filter.CodeElement === sFilters[element].CodeElement
                    ) {
                        if (option) {
                            let values = [];
                            values.push(option[subFiled]);
                            sFilters[element].CodeValue.EqualsAny = values;
                        } else {
                            //  sFilters.splice(element, 1);
                            delete sFilters[element];
                        }
                    } else if (
                        ['Switch'].includes(filter.CodeFilterType) &&
                        filter.CodeElement === sFilters[element].CodeElement
                    ) {
                        let values = [];
                        values.push(option);
                        sFilters[element].CodeValue.EqualsAny = values;
                    } else if (option && !option.isChecked && elemIndex >= 0) {
                        sFilters[element].CodeValue.EqualsAny.splice(elemIndex, 1);
                        if (sFilterValue.length === 0) {
                            // sFilters.splice(element, 1);
                            delete sFilters[element];
                        }
                    } else {
                        //add newly selected boxes to selectedFitlers
                        if (option && (option.length || option._id || typeof option === 'number')) {
                            if (filter.CodeFilterType === 'Multi Select Combo Box') {
                                let tempOption = [];
                                option.forEach((val) => {
                                    let element = Utils.findOption(filter.options, val);
                                    if (element) {
                                        tempOption.push(element);
                                    }
                                });
                                filter['CodeValue'] = tempOption;
                                values = this.assignFilterValues(tempOption, subFiled);
                                sFilters[element].CodeValue.EqualsAny = [];
                                for (let j = 0; j < values.length; j++)
                                    sFilters[element].CodeValue.EqualsAny.push(values[j]);
                            } else if (filter.CodeFilterType === 'Text') {
                                //let value = []
                                //  value.push(filter.value)
                                sFilters[element].CodeValue.Contains = filter.value;
                                // sFilters.push(this.createContainsTextFilter(filter, filter.value));
                            } else if (filter.CodeFilterType === 'Number') {
                                sFilters[element].CodeValue.EqualsAny = [filter.value];
                            } else {
                                values.push(option[subFiled]);
                                for (let j = 0; j < values.length; j++)
                                    sFilters[element].CodeValue.EqualsAny.push(values[j]);
                            }
                        } else {
                            // sFilters.splice(element, 1);
                            delete sFilters[element];
                        }
                    }
                    isFilterTypeAvailable = true;
                }
            });
            if (!isFilterTypeAvailable) {
                if (option instanceof Array && option.length) {
                    let tempOption = [];
                    option.forEach((val) => {
                        let element = Utils.findOption(filter.options, val);
                        if (element) {
                            tempOption.push(element);
                        }
                    });
                    filter['CodeValue'] = tempOption;
                    option = tempOption;
                }
                let values = this.assignFilterValues(option, subFiled);
                if (filter.CodeFilterType === 'Switch') {
                    values = [];
                    values.push(option.value);
                    sFilters[filter.CodeElement] = this.createFilterObj(filter, values, subFiled);
                }
                if (values && values.length) {
                    if (filter.CodeFilterType === 'Text') {
                        sFilters[filter.CodeElement] = this.createContainsTextFilter(
                            filter,
                            values[0],
                            subFiled
                        );
                    } else {
                        sFilters[filter.CodeElement] = this.createFilterObj(
                            filter,
                            values,
                            subFiled
                        );
                    }
                }
            }
        } else {
            sFilters = {};
            if (filter.CodeFilterType === 'Text') {
                if (filter.value || filter.CodeValue) {
                    sFilters[filter.CodeElement] = this.createContainsTextFilter(
                        filter,
                        option,
                        subFiled
                    );
                }
            } else if (filter.CodeFilterType === 'Combo Box') {
                let values = [];
                if (filter.value || filter.CodeValue) {
                    if (!filter.value) {
                        filter.value = filter.CodeValue;
                    }
                    values.push(filter.value[subFiled]);
                    sFilters[filter.CodeElement] = this.createFilterObj(filter, values, subFiled);
                }
            } else if (filter.CodeFilterType === 'Switch') {
                let values = [];
                values.push(filter.value);
                sFilters[filter.CodeElement] = this.createFilterObj(filter, values, subFiled);
            } else {
                if (filter.CodeFilterType === 'Multi Select Combo Box') {
                    let tempOption = [];
                    option.forEach((val) => {
                        let element = Utils.findOption(filter.options, val);
                        if (element) {
                            tempOption.push(element);
                        }
                    });
                    filter['CodeValue'] = tempOption;
                    option = tempOption;
                }
                let values = this.assignFilterValues(option, subFiled);
                if (values && values.length) {
                    if (filter.CodeFilterType == 'Text') {
                        sFilters[filter.CodeElement] = this.createContainsTextFilter(
                            filter,
                            values,
                            subFiled
                        );
                    } else {
                        sFilters[filter.CodeElement] = this.createFilterObj(
                            filter,
                            values,
                            subFiled
                        );
                    }
                }
            }
        }
        return sFilters;
    }
    public static isListNotEmpty(list) {
        return list && list.length;
    }
    public static createFilterObj(filter, values, subField: string) {
        return {
            CodeElement: filter.CodeElement ? filter.CodeElement : filter.CodeCode,
            CodeValue: { EqualsAny: values },
            CodeFilterType: filter.CodeFilterType,
            CodeDataType: filter.CodeDataType,
            CodeSubField: subField
        };
    }
    public static createContainsTextFilter(filter, value, subField: string) {
        return {
            CodeElement: filter.CodeElement ? filter.CodeElement : filter.CodeCode,
            CodeValue: { Contains: value },
            CodeFilterType: filter.CodeFilterType,
            CodeDataType: filter.CodeDataType,
            CodeSubField: subField
        };
    }
    public static assignFilterValues(option, subField) {
        let values = [];
        if (option && option[subField]) {
            values.push(option[subField]);
        } else if (typeof option === 'string' || typeof option === 'number') {
            values.push(option);
        } else if (option && option.length > 0) {
            for (let j = 0; j < option.length; j++) {
                values.push(option[j][subField]);
            }
        }
        return values;
    }
    public static getOnlyIds(arrayOfObjects) {
        for (let element in arrayOfObjects) {
            if (arrayOfObjects[element] && typeof arrayOfObjects[element] == 'object') {
                arrayOfObjects[element] = '^' + arrayOfObjects[element]['_id'];
            }
        }
        return arrayOfObjects;
    }
    public static getArrayOfProperties(arrayOfObjects, property) {
        let objectsList = arrayOfObjects || [];
        let properyArray = [];
        if (!this.isArrayEmpty(arrayOfObjects)) {
            for (let element of arrayOfObjects) {
                if (element[property]) {
                    properyArray.push(element[property]);
                }
            }
        }
        return properyArray;
    }
    public static styleResetOfTabs(currentContainer, currentPage) {
        let activeElems = document.querySelectorAll('.-primary>li:not(.-more) a.active');
        if (activeElems.length) {
            activeElems[0].classList.remove('active');
        }
        let primaryTabsList = document.querySelectorAll('.-primary>li:not(.-more) a');
        primaryTabsList[currentContainer.indexOf(currentPage)].classList.add('active');
    }
    public static arrayHasProperty(list, property) {
        if (!this.isArrayEmpty(list)) {
            return list.indexOf(property) >= 0 ? true : false;
        } else {
            return null;
        }
    }
    public static removeSelectedGridsterItemClass() {
        var activeItems = document.querySelectorAll('gridster-item.selected-item');
        if (activeItems.length) {
            for (var i = 0; i < activeItems.length; i++) {
                if (activeItems[i].classList.contains('selected-item')) {
                    activeItems[i].classList.remove('selected-item');
                }
            }
        }
    }
    public static getIndex(list, element) {
        return list.indexOf(element);
    }
    public static removeElement(list, element) {
        let index = this.getIndex(list, element);
        list.splice(index, 1);
        return list;
    }
    public static getResponseBody(response: any) {
        if (response) {
            return JSON.parse(response.body);
        } else {
            return null;
        }
    }
    public static appendStyles(styles, viewId) {
        let isStylesExist = document.getElementById('styles' + viewId) ? true : false;
        if (!isStylesExist) {
            var css = document.createElement('style');
            css.setAttribute('id', 'styles' + viewId);
            css.type = 'text/css';
            if (css['styleSheet']) css['styleSheet'].cssText = styles;
            else css.appendChild(document.createTextNode(styles));
            document.getElementsByTagName('head')[0].appendChild(css);
        }
    }
    public static getStyles(field, type) {
        let classes = {};
        let styles = '';
        if (field && field.CodeFieldType == 'Rich Text' && field.options && field.options.length) {
            field.options.forEach((style) => {
                classes['option' + style._id] = style.CodeDescription.en
                    ? style.CodeDescription.en
                    : style.CodeDescription;
                styles += (styles == '' ? '.option' : ' .option') + style._id + '{';
                let uistyles = {};
                style.CodeUIStyles.forEach((uistyle) => {
                    styles +=
                        uistyle.CodeUIAttribute.CodeCSSStyles +
                        ': ' +
                        uistyle.CodeUIValue +
                        ' !important; ';
                });
                styles += '}';
            });
        }
        return type == 'classes' ? classes : styles;
    }
    public static getElementsByProperty(list, property, value) {
        if (!this.isArrayEmpty(list))
            return list.filter((ele) => {
                return ele[property] === value;
            });
    }
    public static getElementByProperty(list, property, value) {
        if (!this.isArrayEmpty(list))
            return list.find((ele) => {
                return ele[property] === value;
            });
    }
    public static filterCriteria(copyOfCriteria) {
        let key;
        let criteria = '';
        if (copyOfCriteria instanceof Object) {
            for (key in copyOfCriteria) {
                if (key === 'criteria') {
                    this.filterCriteria(copyOfCriteria[key]);
                } else {
                    if (key !== 'id' && key !== 'dataObjectCodeCode') {
                        delete copyOfCriteria[key];
                    }
                }
            }
            criteria = JSON.stringify(copyOfCriteria);
        }
        if (criteria) {
            return JSON.parse(criteria.replace(/id/g, '_id'));
        }
    }
    public static getContainerViewReq(context, _viewId, _currentRecordId, includes?) {
        let criteria = Utils.getCopy(context);
        let copyOfCriteria = criteria;
        let viewId = _viewId;
        if (criteria) {
            delete criteria.viewId;
            copyOfCriteria = Utils.filterCriteria(copyOfCriteria);
        } else {
            criteria = {};
            if (_currentRecordId && _currentRecordId.criteria) {
                criteria = _currentRecordId.criteria;
            } else {
                criteria = _currentRecordId;
            }
        }
        let req = {
            meta: { viewId: viewId },
            criteria: copyOfCriteria ? copyOfCriteria : criteria
        };
        if (includes) {
            req['criteria']['includes'] = includes;
        }
        return req;
    }
    public static trimText(str) {
        return str.trim();
    }
    public static getLookupType(actions, action) {
        let lookupAction = Utils.getElementsByProperty(actions, 'CodeUIAction', action);
        return (
            lookupAction &&
            lookupAction.length &&
            lookupAction[0].Task.CodeCode === StandardCodes.TASK_LOAD_LOOKUP
        );
    }
    public static parseOptions(options, value, displayFields) {
        let selectedOption;
        let items = [];
        displayFields = this.getCodeDisplay(displayFields);
        if (displayFields && displayFields.length) {
            options.forEach((option) => {
                this.getOptionLabel(displayFields, option);

                if (
                    !Array.isArray(value) &&
                    value &&
                    (option._id === value || option._id === value._id)
                ) {
                    selectedOption = option;
                } else if (Array.isArray(value)) {
                    value.forEach((optionValue) => {
                        if (
                            optionValue &&
                            (option._id === optionValue || option._id === optionValue._id)
                        ) {
                            items.push(option);
                        }
                    });
                }
            });
        } else {
            if (options instanceof Array) {
                options.forEach((option) => {
                    this.getOptionLabel(displayFields, option);
                    if (
                        !Array.isArray(value) &&
                        value &&
                        (option._id === value || option._id === value._id)
                    ) {
                        selectedOption = option;
                    } else if (Array.isArray(value)) {
                        value.forEach((optionValue) => {
                            if (
                                optionValue &&
                                (option._id === optionValue || option._id === optionValue._id)
                            ) {
                                items.push(option);
                            }
                        });
                    }
                });
            } else if (options instanceof Object) {
                this.getOptionLabel(displayFields, options);
            }
        }
        if (Array.isArray(value)) {
            return { options: options, value: items };
        } else {
            return { options: options, value: selectedOption };
        }
    }
    public static getOptionLabel(displayFields, option) {
        let label = '';
        displayFields = Object.keys(option);
        let index = displayFields.indexOf('_id');
        let labelIndex = displayFields.indexOf('label');
        if (labelIndex > 0) {
            displayFields.splice(labelIndex, 1);
        }
        if (index > -1 && displayFields.length > 1) {
            displayFields.splice(index, 1);
        }
        displayFields.forEach((display) => {
            let nestedValue = this.getNestedObject(option, display.split('.'), 0);
            if (typeof nestedValue === 'string') {
                label = label + nestedValue + ' ';
            }
        });
        label = label.trim();
        if (typeof option !== 'string') {
            option['label'] = label;
        }
    }
    public static applyCodeDisplaytoField(displayFields, value, parseIcon?) {
        let processedValue = '';
        if (!this.isArrayEmpty(displayFields)) {
            displayFields.forEach((display) => {
                let nestedValue = '';
                if (display.startsWith('CodeIcon')) {
                    if (value['CodeIcon'] && !parseIcon) {
                        nestedValue =
                            "<i style='color: " +
                            value['CodeIcon']['color'] +
                            '; font-size: ' +
                            value['CodeIcon']['fontSize'] +
                            "px;' class='" +
                            value['CodeIcon']['class'] +
                            "' ></i>";
                    } else {
                        nestedValue = '';
                    }
                } else {
                    nestedValue = this.getNestedObject(value, display.split('.'), 0);
                }
                if (nestedValue && typeof nestedValue !== 'object') {
                    processedValue = processedValue + nestedValue + ' ';
                }
            });
        }
        processedValue = processedValue.trim();
        return processedValue;
    }
    public static getCodeDisplayFromValue(column, value) {
        let codeDisplay = column.CodeDisplay;
        codeDisplay = codeDisplay ? codeDisplay : value.CodeDisplay;
        codeDisplay = codeDisplay ? codeDisplay : 'CodeDescription.en';
        return codeDisplay;
    }
    public static getCodeDisplay(codeDisplay) {
        if (typeof codeDisplay === 'string' && codeDisplay !== '') {
            const display = codeDisplay.split(',').map(function (item) {
                return item.trim();
            });
            return display;
        } else {
            return codeDisplay;
        }
    }
    public static getAction(actions, standardAction) {
        if (!Utils.isArrayEmpty(actions)) {
            return actions.filter((action) => {
                return action.CodeUIAction === standardAction;
            })[0];
        }
    }
    public static getActions(actions, standardAction) {
        let matchedActions = [];
        if (!Utils.isArrayEmpty(actions)) {
            actions.forEach((action) => {
                if (action.CodeUIAction === standardAction) {
                    matchedActions.push(action);
                }
            });
        }
        return matchedActions;
    }
    public static timeStringToMin(time) {
        var hoursMinutes = time.split(/[.:]/);
        var hours = parseInt(hoursMinutes[0]);
        var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1]) : 0;
        // var seconds = hoursMinutes[2] ? parseInt(hoursMinutes[2]) : 0;
        var minutesInt = minutes + hours * 60;
        return minutesInt;
    }
    public static minToTimeString(min) {
        if (min === 1440) {
            min = 1439;
        }
        var hours = Math.floor(min / 60);
        var minutes = Math.floor(min - hours * 60);
        //var seconds = sec - (hours * 3600) - (minutes * 60);
        // if (seconds > 30) {minutes = minutes + 1;}
        var hoursStr = hours.toString();
        var minutesStr = minutes.toString();
        //var secondsStr = seconds.toString();
        if (hours < 10) {
            hoursStr = '0' + hours;
        }
        if (minutes < 10) {
            minutesStr = '0' + minutes;
        }
        //if (seconds < 10) { secondsStr = "0"+seconds;}
        return hoursStr + ':' + minutesStr; //+':'+secondsStr;
    }
    public static getNestedObject(jsonObject, keys, startIndex) {
        if (keys.length) {
            let nestedObjectValue = jsonObject;
            if (nestedObjectValue) {
                for (var index = startIndex; index < keys.length; index++) {
                    if (
                        keys[index] &&
                        nestedObjectValue[keys[index]] &&
                        nestedObjectValue[keys[index]] instanceof Array
                    ) {
                        nestedObjectValue[keys[index]] = nestedObjectValue[keys[index]].filter(
                            function (el) {
                                return el != null;
                            }
                        );
                        if (typeof nestedObjectValue[keys[index]][0] === 'string') {
                            nestedObjectValue = nestedObjectValue[keys[index]];
                        } else {
                            nestedObjectValue = nestedObjectValue[keys[index]].map(
                                (op) => op[keys[index + 1]]
                            );
                        }
                    } else if (keys[index] && nestedObjectValue[keys[index]]) {
                        // if (typeof nestedObjectValue[keys[index]] === 'string') {
                        nestedObjectValue = nestedObjectValue[keys[index]];
                        // } else if (nestedObjectValue[keys[index]]['CodeCode']) {
                        //     nestedObjectValue = nestedObjectValue[keys[index]]['CodeCode'];
                        // }
                    }
                }
            }
            return nestedObjectValue;
        }
    }

    public static openNewTab(url: string) {
        window.open(url, '_blank');
    }
    public static openNewWindow(url: string) {
        window.open(url, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,width=900,height=900');
    }
    public static printData(selector) {
        var newWin = window.open('');
        newWin.document.write(
            '<link rel="stylesheet" href="https://drive.google.com/uc?export=view&id=1n60Dtki09mZ4Xx6HAzOro2C7e7BEyfYx" />'
        );
        var divToPrint = document.querySelector(selector);
        var tableHeader = divToPrint.querySelector(
            '.ui-table-scrollable-header-box>table>thead>tr:nth-child(1)'
        );
        var tableBody = divToPrint.querySelector('.ui-table-scrollable-body>table>tbody');
        setTimeout(() => {
            newWin.document.write(
                '<table id="' +
                    selector +
                    'print" border="1" style="border-collapse: collapse"><thead>' +
                    tableHeader.outerHTML +
                    '</thead>' +
                    tableBody.outerHTML +
                    '</table>'
            );
            if (
                $(newWin.document)
                    .find('thead')
                    .children('tr:first')
                    .children('th:first')
                    .is(':empty')
            ) {
                $(newWin.document).find('thead').children('tr:first').children('th:first').hide();
            }
            $(newWin.document.getElementsByClassName('row-expand-handler')).parent().hide();
            setTimeout(() => {
                newWin.print();
            }, 1000);
        }, 3500);
    }
    public static splitString(str, token) {
        let strArray = [];
        strArray = str.split(token);
        if (str.endsWith(token)) {
            strArray = strArray.splice(strArray.length - 1, 1);
        }
        return strArray;
    }
    public static getGroupBy(objectArray, property) {
        if (Array.isArray(objectArray) && property) {
            return objectArray.reduce((acc, obj) => {
                const key = obj[property];
                if (!acc[key]) {
                    acc[key] = [];
                }
                // Add object to list for given key's value
                acc[key].push(obj);
                return acc;
            }, {});
        }
    }

    /**
     * <p>  This method is called by the Toast service to render a list of messages in an array as
     *      a string value representing a HTML unordered list </p>
     * @param message : either an array of messages or a single message
     * returns an object containing content of the toast to be displayed and a title if it exists
     */
    public static renderHTMLElement(messages) {
        if (Array.isArray(messages) && messages.length > 0) {
            let messageContents = '<ul>';
            messages.forEach((m) => {
                if (m.details) {
                    messageContents += '<li>' + m['details'] + '</li>';
                } else {
                    messageContents += '<li>' + m + '</li>';
                }
            });
            messageContents += '</ul>';
            return { content: messageContents, title: messages[0]['errorCode'] };
        } else if (typeof messages != 'object') {
            return { content: messages, title: null };
        } else if (messages) {
            if (messages.message && messages.message !== '') {
                return { content: messages.message, title: messages.error || null };
            } else if (messages.error && messages.error !== '') {
                if (messages.path && messages.path !== '') {
                    return { content: messages.path, title: messages.error };
                } else {
                    return { content: messages.error, title: null };
                }
            }
        }
    }

    public static fetchValues(parsedOptions) {
        let finalValue = '';
        if (parsedOptions.options instanceof Array) {
            parsedOptions.options.forEach((element) => {
                finalValue = finalValue + element.label + ', ';
            });
        } else {
            finalValue = finalValue + parsedOptions.options.label + ' ';
        }
        finalValue = finalValue.trim();
        return finalValue.replace(/,\s*$/, '');
    }
    public static getCoordinatesForDialog(
        event: any,
        closest,
        selectionIndex,
        isCached,
        defaultCoordinates?
    ) {
        if (event.target) {
            let left, top;
            if (closest == '.fr-wrapper') {
                left = defaultCoordinates.left;
                top = defaultCoordinates.top;
            } else {
                let coordinates = this.getCursorCoordinates(event.target, selectionIndex);
                left = $(event.target).closest(closest).offset().left + coordinates.left;
                top = $(event.target).closest(closest).offset().top + coordinates.top;
            }
            return {
                left: left,
                top: top
            };
        }
    }
    public static getCaretOffset(element: any) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection != 'undefined') {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ((sel = doc.selection) && sel.type != 'Control') {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint('EndToEnd', textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    }
    public static getCursorCoordinates(element, position) {
        var mirrorDiv, computed, style;
        mirrorDiv = document.getElementById(element.nodeName + '--mirror-div');
        if (!mirrorDiv) {
            mirrorDiv = document.createElement('div');
            mirrorDiv.id = element.nodeName + '--mirror-div';
            document.body.appendChild(mirrorDiv);
        }
        style = mirrorDiv.style;
        computed = getComputedStyle(element);
        // default textarea styles
        style.whiteSpace = 'pre-wrap';
        if (element.nodeName !== 'INPUT') style.wordWrap = 'break-word'; // only for textarea-s
        // position off-screen
        style.position = 'absolute'; // required to return coordinates properly
        style.top = element.offsetTop + parseInt(computed.borderTopWidth) + 'px';
        style.left = '400px';
        style.width = parseInt(computed.width) - 2 + 'px';
        if (element.scrollHeight > parseInt(computed.height)) style.overflowY = 'scroll';
        mirrorDiv.textContent = element.value
            ? element.value.substring(0, position)
            : element.innerText.substring(0, this.getCaretOffset(event.target));
        if (element.nodeName === 'INPUT')
            mirrorDiv.textContent = mirrorDiv.textContent.replace(/\s/g, '\u00a0');
        var span = document.createElement('span');
        span.textContent =
            (element.value
                ? element.value.substring(position)
                : element.innerText.substring(this.getCaretOffset(event.target))) || '.'; // || because a completely empty faux span doesn't render at all
        span.style.backgroundColor = 'lightgrey';
        mirrorDiv.appendChild(span);
        var coordinates = {
            top: span.offsetTop + parseInt(computed['borderTopWidth']) + 11,
            left: span.offsetLeft + parseInt(computed['borderLeftWidth']) + 14
        };
        mirrorDiv.remove();
        return coordinates;
    }
    public static getSignatureContent(signatureName: string, cacheService) {
        var signatures = JSON.parse(cacheService.getLocalData('CurrentUser'))['Signatures'];
        var signatureContent = '';
        if (!this.isArrayEmpty(signatures)) {
            signatures.forEach((element) => {
                if (element['SignatureName'] === signatureName) {
                    signatureContent = element['SignatureContent'];
                }
            });
        }
        return signatureContent;
    }
    public static processAliases(views) {
        let formViews = Object.keys(views).filter((viewId) => {
            let view = views[viewId];

            return view.CodeType === StandardCodes.CODE_TYPE_DATA_FORM && view.CodeVisible;
        });
        if (formViews && formViews.length > 1) {
            formViews.forEach((viewId) => {
                let view = views[viewId];
                let aliasView = views[view['CodeAlias']];
                if (aliasView) {
                    view['CodeAdjustHeight'] = aliasView['CodeAdjustHeight'];
                    views[view['CodeAlias']].CodeVisible = false;
                    view['rows'] = aliasView['CodeRows'];
                    view['cols'] = aliasView['CodeColumns'];
                    view['x'] = aliasView['CodeColumn'];
                    view['y'] = aliasView['CodeRow'];
                    view['CodeColumn'] = aliasView['CodeColumn'];
                    view['CodeRow'] = aliasView['CodeRow'];
                }
            });
        }
        return views;
    }

    public static fetchTask(CodeAction: any) {
        if (CodeAction && CodeAction.Task)
            return CodeAction.Task.CodeCode ? CodeAction.Task.CodeCode : CodeAction.Task;
    }
    public static getSelectorObject(selectedRecord, viewSelectors) {
        let record = {};
        if (!Utils.isArrayEmpty(viewSelectors)) {
            viewSelectors.forEach((selector) => {
                record[selector] = selectedRecord[selector];
            });
        }
        return record;
    }
    public static getUIElementByCode(mapData, code) {
        return Object.values(mapData).find((obj) => obj['CodeCode'] === code);
    }

    public static setGridsterOptions() {
        return {
            gridType: GridType.VerticalFixed,
            compactType: CompactType.CompactUp,
            margin: 6,
            outerMargin: true,
            useTransformPositioning: true,
            mobileBreakpoint: 640,
            minCols: 1,
            maxCols: 100,
            minRows: 1,
            maxRows: 100,
            maxItemCols: 100,
            minItemCols: 1,
            maxItemRows: 100,
            minItemRows: 1,
            maxItemArea: 2500,
            minItemArea: 1,
            defaultItemCols: 1,
            defaultItemRows: 1,
            fixedColWidth: 240,
            fixedRowHeight: 30,
            keepFixedHeightInMobile: false,
            keepFixedWidthInMobile: false,
            scrollSensitivity: 10,
            scrollSpeed: 20,
            enableEmptyCellClick: false,
            enableEmptyCellContextMenu: false,
            enableEmptyCellDrop: false,
            enableEmptyCellDrag: false,
            enableOccupiedCellDrop: false,
            emptyCellDragMaxCols: 50,
            emptyCellDragMaxRows: 50,
            ignoreMarginInRow: false,
            draggable: {
                enabled: false
            },
            resizable: {
                enabled: false
            },
            swap: false,
            pushItems: true,
            disablePushOnDrag: false,
            disablePushOnResize: false,
            pushDirections: { north: true, east: true, south: true, west: true },
            pushResizeItems: false,
            displayGrid: DisplayGrid.OnDragAndResize,
            disableWindowResize: false,
            disableWarnings: false,
            scrollToNewItems: false
        };
    }
    public static getPagesMap(designerPages) {
        let _pages = {};
        if (!Utils.isArrayEmpty(designerPages)) {
            designerPages.forEach((views) => {
                views.forEach((view) => {
                    _pages[view.CodeElement] = view;
                });
            });
        }
        return _pages;
    }
    public static listToMatrix(list, noOfArrays) {
        let matrix = [],
            i,
            k;

        if (noOfArrays > 0) {
            for (i = 0, k = -1; i < list[0].length; i++) {
                if (i < noOfArrays) {
                    matrix[i] = [];
                }
                matrix[i % noOfArrays].push(list[0][i]);

                // matrix[k].push(list[i]);
            }
        }

        return matrix;
    }
    static replaceString(str, replaceWhat, replaceTo) {
        // function name(str,replaceWhat,replaceTo){
        let re = new RegExp(replaceWhat, 'g');
        return str.replace(re, replaceTo);
        //  }
    }
    public static applyCodeDisplayOfGridColumn(value, column, parseIcon?) {
        let proceesedData;
        if (value instanceof Object && !(value instanceof Array)) {
            if (!this.isObjectEmpty(value)) {
                proceesedData = this.applyCodeDisplaytoField(
                    this.getCodeDisplay(this.getCodeDisplayFromValue(column, value)),
                    value,
                    parseIcon
                );
            } else {
                proceesedData = '';
            }
        } else if (value instanceof Array) {
            value.forEach((element) => {
                proceesedData =
                    (proceesedData ? proceesedData : '') +
                    (proceesedData ? ', ' : '') +
                    this.applyCodeDisplaytoField(
                        this.getCodeDisplay(this.getCodeDisplayFromValue(column, element)),
                        element,
                        parseIcon
                    );
            });
        } else {
            proceesedData = value;
        }
        return proceesedData;
    }
    public static flattenObject(objectArray) {
        let flattenedArray = [];

        if (objectArray) {
            objectArray.forEach((object) => {
                let record = {};
                for (const property in object) {
                    if (typeof object[property] === 'object' && object[property]) {
                        if (object[property]['CodeCode']) {
                            record[property] = object[property]['CodeCode'];
                        } else {
                            for (const p in object[property]) {
                                if (p !== '_id' && typeof object[property][p] === 'string') {
                                    record[property] = object[property][p];
                                    break;
                                }
                            }
                        }
                    } else {
                        record[property] = object[property];
                    }
                }
                flattenedArray.push(record);
            });
        }

        return flattenedArray;
    }
    public static getRowTobeUpdated(selectedRow, updatedData) {
        for (let field in updatedData) {
            selectedRow[field] = updatedData[field];
        }
        return selectedRow;
    }
    public static setOperator(rulesData) {
        if (rulesData.rules) {
            rulesData.rules.forEach((rule) => {
                this.setOperator(rule);
            });
        } else {
            rulesData.operator = Utils.getOperatorValue(rulesData.operator);
        }
    }
    public static getOperatorText(operator) {
        let oprtrValue;
        let _oprtr = operator.toLowerCase();
        switch (_oprtr) {
            case StandardCodes.STARTSWITH: {
                oprtrValue = 'startswith';
                break;
            }
            case StandardCodes.ENDSWITH: {
                oprtrValue = 'endswith';
                break;
            }
            case StandardCodes.CONTAINS: {
                oprtrValue = 'contains';
                break;
            }
            case StandardCodes.EQUAL: {
                oprtrValue = 'equal';
                break;
            }

            case StandardCodes.NOTEQUAL: {
                oprtrValue = 'notequal';
                break;
            }
            case StandardCodes.GREATERTHAN: {
                oprtrValue = 'greaterthan';
                break;
            }
            case StandardCodes.GREATERTHANOREQUAL: {
                oprtrValue = 'greaterthanorequal';
                break;
            }
            case StandardCodes.LESSTHAN: {
                oprtrValue = 'lessthan';
                break;
            }
            case StandardCodes.LESSTHANOREQUAL: {
                oprtrValue = 'lessthanorequal';
                break;
            }
            case StandardCodes.BETWEEN: {
                oprtrValue = 'between';
                break;
            }
            case StandardCodes.NOTBETWEEN: {
                oprtrValue = 'notbetween';
                break;
            }
            case StandardCodes.NOTIN: {
                oprtrValue = 'notin';
                break;
            }
            case StandardCodes.IN: {
                oprtrValue = 'in';
                break;
            }
            case StandardCodes.ISEMPTY: {
                oprtrValue = 'isempty';
                break;
            }
            case StandardCodes.ISNOTEMPTY: {
                oprtrValue = 'isnotempty';
                break;
            }
            case StandardCodes.ISNULL: {
                oprtrValue = 'isnull';
                break;
            }
            case StandardCodes.ISNOTNULL: {
                oprtrValue = 'isnotnull';
                break;
            }
        }
        return oprtrValue;
    }
    public static getOperatorValue(operator) {
        let oprtrValue = operator;
        switch (operator) {
            case 'startswith': {
                oprtrValue = StandardCodes.STARTSWITH;
                break;
            }
            case 'endswith': {
                oprtrValue = StandardCodes.ENDSWITH;
                break;
            }
            case 'contains': {
                oprtrValue = StandardCodes.CONTAINS;
                break;
            }
            case 'equal': {
                oprtrValue = StandardCodes.EQUAL;
                break;
            }

            case 'notequal': {
                oprtrValue = StandardCodes.NOTEQUAL;
                break;
            }
            case 'greaterthan': {
                oprtrValue = StandardCodes.GREATERTHAN;
                break;
            }
            case 'greaterthanorequal': {
                oprtrValue = StandardCodes.GREATERTHANOREQUAL;
                break;
            }
            case 'lessthan': {
                oprtrValue = StandardCodes.LESSTHAN;
                break;
            }
            case 'lessthanorequal': {
                oprtrValue = StandardCodes.LESSTHANOREQUAL;
                break;
            }
            case 'between': {
                oprtrValue = StandardCodes.BETWEEN;
                break;
            }
            case 'notbetween': {
                oprtrValue = StandardCodes.NOTBETWEEN;
                break;
            }
            case 'notin': {
                oprtrValue = StandardCodes.NOTIN;
                break;
            }
            case 'in': {
                oprtrValue = StandardCodes.IN;
                break;
            }
            case 'isempty': {
                oprtrValue = StandardCodes.ISEMPTY;
                break;
            }
            case 'isnotempty': {
                oprtrValue = StandardCodes.ISNOTEMPTY;
                break;
            }
            case 'isnull': {
                oprtrValue = StandardCodes.ISNULL;
                break;
            }
            case 'isnotnull': {
                oprtrValue = StandardCodes.ISNOTNULL;
                break;
            }
        }
        return oprtrValue;
    }

    /**
     * <p>Called on Key Press.</p>
     * @param component Form component the event relates
     * @param event KeyBoard Event
     */
    public static keyPress(component: any, event) {
        if (
            event.which <= 9 ||
            event.which >= 47 ||
            (event.which == 32 && component && component.dialogRef && component.dialogRef.visible)
        ) {
            component.event = event;
            let value = '';
            if (component.componentType === 'Rich Text Editor') {
                value = component.editorSelection.getRange(document).startContainer.textContent;
                component.selection = component.editorSelection.getRange(document).startOffset;
            } else {
                value = (<HTMLInputElement>event.target).value;
                component.selection = (<HTMLInputElement>event.target).selectionEnd;
            }

            let currentValue = value.substring(
                value.substring(0, component.selection).lastIndexOf(' ') + 1,
                component.selection
            );

            if (
                component &&
                component.dialogRef &&
                component.dialogRef.visible &&
                component.mentionValue
            ) {
                currentValue = value.substring(
                    value
                        .substring(0, component.selection - component.mentionValue.length)
                        .lastIndexOf(' ') + 1,
                    component.selection
                );
            }
            if (
                currentValue &&
                !this.isArrayEmpty(currentValue.match(/\r|\n/)) &&
                currentValue.match(/\r|\n/)[0]
            ) {
                currentValue.replace(currentValue.match(/\r|\n/)[0], '');
            }
            this.fetchCodeAction(component, event, currentValue);
            let task = this.fetchTask(component.CodeAction);
            if (task) {
                if (!component.escapePressed) {
                    component.currentListIndex = 0;
                    this.executeTasks(component, task, 'fetch');
                } else {
                    component.escapePressed = false;
                }
            } else {
                if (component.dialogRef && component.dialogRef.visible) {
                    component.dialogRef.hide();
                }
                component.escapePressed = false;
            }
        } else {
            if (component.componentType === 'Rich Text Editor') {
                component.handleKeyboardEvent(event);
            } else {
                component.selection = (<HTMLInputElement>event.target).selectionEnd;
            }
        }
    }
    /**
     * <p>Fetches the CodeActions with respect to keys.</p>
     * @param component Form component from which to fetch the action
     * @param event event trigger ,event which triggered the call to this method
     * @param value currentValue ,that is subString of eventtargetvalue to selectionEnd
     */
    public static fetchCodeAction(component: any, event: any, value: any) {
        if (!Utils.isArrayEmpty(component.KeyStrokeActions)) {
            const codeActionWithLookup = component.KeyStrokeActions.find((action) => {
                if (
                    value.startsWith(action[StandardCodes.LOOKUP_CHARACTER]) &&
                    !(
                        action['JSONParameter'] &&
                        action['JSONParameter']['output'] &&
                        action['JSONParameter']['output'] === 'replace'
                    )
                ) {
                    return action;
                }
            });
            if (codeActionWithLookup) {
                component.lookupCharacter = codeActionWithLookup[StandardCodes.LOOKUP_CHARACTER];
                if (value.startsWith(component.lookupCharacter)) {
                    component.mentionValue = value.substring(
                        value.lastIndexOf(component.lookupCharacter) + 1,
                        (<HTMLInputElement>event.target).selectionEnd
                    );
                    component.CodeAction = codeActionWithLookup;
                } else {
                    component.CodeAction = null;
                }
            } else {
                this.fetchCodeActionWithoutLookup(component, value);
            }
        }
    }

    /**
     * <p>Executes Task based on value selected from filteredTexts.</p>
     * @param component : form component for which the task relates
     * @param task : specifies what kind of task to be done like Quick Text,Signature,QuickEmailLookup.
     * @param operation : specifies what operation need to be done like fetch,set.
     * @param selected : selectedOption from filteredTexts.
     * @param output : specifies what output should be like tag,replace,value.
     */
    public static executeTasks(
        component: any,
        task: any,
        operation: string,
        selected?: any,
        output?: any
    ) {
        switch (task) {
            case 'Quick Text':
                if (operation === 'fetch') {
                    this.getQuickText(component, undefined, component.mentionValue, undefined);
                } else if (operation == 'set') {
                    this.getQuickText(component, selected, undefined, output);
                }
                break;
            case 'QuickEmailLookup':
                if (operation === 'fetch') {
                    this.getQuickEmailLookup(component, undefined, component.mentionValue);
                } else if (operation === 'set') {
                    this.getQuickEmailLookup(component, selected, undefined);
                }
                break;
        }
    }
    /**
     * <p>Used to get Quicktext.</p>
     * @param component : form component which the quick text relates
     * @param inputText : entered or selected input text value.
     * @param suggestion :mentionValue which is substring from lookup character to selectionEnd.
     * @param output : specifies what output should be like tag,replace,value.
     */
    public static getQuickText(component: any, inputText: any, suggestion: any, output: string) {
        let text = '';
        if (inputText) {
            if (inputText.label) {
                text = inputText.label;
            } else {
                text = inputText;
            }
        }

        if (output === 'tag') {
            if (component.componentType === 'Rich Text Editor') {
                this.replaceQuickTextRTE(component, text, output);
            } else {
                component.field.CodeValue = this.replaceQuickText(component, text, output);
            }
        } else if (output === 'value') {
            let replaceText = component.quickTextHandler.implementQuickText('@@' + text, false);
            if (replaceText === '@@' + text) {
                const data = component.quickTextHandler.collectionService.resolveQuickText(
                    component.currentRecord._id,
                    component.currentView.CodeDataObject,
                    text
                );
                data.subscribe(async (_response) => {
                    if (component.componentType === 'Rich Text Editor') {
                        this.replaceQuickTextRTE(component, _response.body, output);
                    } else {
                        component.field.CodeValue = this.replaceQuickText(
                            component,
                            _response.body,
                            output
                        );
                    }
                });
            } else {
                if (component.componentType === 'Rich Text Editor') {
                    this.replaceQuickTextRTE(component, replaceText, output);
                } else {
                    component.field.CodeValue = this.replaceQuickText(
                        component,
                        replaceText,
                        output
                    );
                }
            }
        } else if (output === 'replace') {
            var regex = new RegExp(
                '(\\' + component.lookupCharacter + ')(\\S)+(\\' + component.lookupCharacter + ')',
                'g'
            );
            let quickTextsArray = component.field.CodeValue.match(regex);
            if (!Utils.isArrayEmpty(quickTextsArray)) {
                quickTextsArray.forEach((quicktext) => {
                    let extractQuicktext = quicktext.substring(1, quicktext.length - 1);
                    let processedText = component.quickTextHandler.getComputedValue(
                        '@@' + extractQuicktext
                    );
                    component.field.CodeValue = component.field.CodeValue.replace(
                        quicktext,
                        processedText
                    );
                });
            }
        } else if (output === undefined) {
            if (
                component.CodeAction &&
                component.CodeAction.Task &&
                component.CodeAction.Task.CodeCode === 'Quick Text'
            ) {
                if (component.CodeAction.CodeCacheData === true) {
                    component.quickTexts = JSON.parse(
                        component.cacheService.getSessionData(StandardCodes.QUICK_TEXT)
                    );

                    if (!Utils.isArrayEmpty(component.quickTexts)) {
                        component.filteredTexts = Utils.filterQuickText(
                            component.quickTexts,
                            suggestion
                        );

                        this.showFilteredQuickText(component);
                    } else {
                        component.isCached = false;
                        this.fetchKeyStrokeSuggestions(component, { suggestion: suggestion });
                    }
                } else {
                    const data = component.quickTextHandler.loadQuickText(suggestion);
                    data.subscribe(async (_response) => {
                        let _responseBody = _response;
                        if (!Utils.isArrayEmpty(_responseBody)) {
                            component.filteredTexts = _responseBody;
                            this.showFilteredQuickText(component);
                        } else {
                            component.isCached = false;
                            if (component.dialogRef && component.dialogRef.visible) {
                                component.dialogRef.hide();
                            }
                        }
                    });
                }
            } else {
                this.fetchKeyStrokeSuggestions(component, { suggestion: suggestion });
            }
        }
    }

    /**
     * <p>Displays the filtered quick text dialog</p>
     * @param component Form component to which the filtered text applies
     */
    private static showFilteredQuickText(component: any) {
        if (!Utils.isArrayEmpty(component.filteredTexts)) {
            component.isCached = true;

            if (component.componentType === 'Rich Text Editor') {
                if (component.dialogRef) {
                    component.range = component.editorSelection.getRange(document);
                    component.saveSelection = component.editorSelection.save(
                        component.range,
                        document
                    );
                    component.dialogRef.show();
                    const position = component.range.getBoundingClientRect();
                    component.dialogRef.position = {
                        X: position.left + 5,
                        Y: position.top + 10
                    };
                    $('.' + component.field.CodeDescription).focus();
                }
            } else {
                component.dialogRef.show();
                const position = Utils.getCoordinatesForDialog(
                    component.event,
                    component.componentType,
                    component.selection,
                    component.isCached
                );
                component.dialogRef.position = { X: position.left, Y: position.top };
                //component.selectionEnd = component.selection;
            }
        } else {
            if (component.dialogRef && component.dialogRef.visible) {
                component.dialogRef.hide();
            }
        }
    }
    /**
     * <p>Used to get QuickEmail Lookupt.</p>
     * @param component Form component to which the lookup applies
     * @param selectedEmail : selectedEmail.
     * @param suggestion : mentionValue.
     */
    public static getQuickEmailLookup(component: any, selectedEmail, suggestion) {
        if (selectedEmail) {
            this.replaceQuickText(component, selectedEmail.label, 'value');
        }
        if (suggestion !== undefined) {
            this.fetchKeyStrokeSuggestions(component, { suggestion: suggestion });
        }
    }
    /**
     * <p> To replace the quick text with signature </p>
     * @param component Form component to which the signature applies
     * @param selectedSignature : the selected Signature to replace the quick text
     * @param suggestion: the list of suggestions
     * @param output: what should be replaced
     */
    public static getSignature(component: any, selectedSignature: any, suggestion: any, output) {
        if (output === 'value') {
            this.replaceSignatureWithValue(component, selectedSignature.label);
        } else if (output === undefined) {
            if (
                component.CodeAction &&
                component.CodeAction.Task &&
                component.CodeAction.Task.CodeCode === 'Signature' &&
                component.CodeAction.CodeCacheData === true
            ) {
                var signatures = JSON.parse(localStorage.getItem('CurrentUser'))['Signatures'];
                component.suggestions = [];
                signatures.forEach((ele) => {
                    component.suggestions.push({ label: ele.SignatureName });
                });
                component.isCached = true;
                component.showSuggestionsPanel();
            } else {
                component.isCached = false;
                Utils.fetchKeyStrokeSuggestions(component, { suggestion: suggestion });
            }
        }
    }

    /**
     * <p> To replace signature tag with selected signature </p>
     * @param component Form component to which the signature applies
     * @param text : the replacement signature
     */
    private static replaceSignatureWithValue(component: any, text) {
        let processedSignature = Utils.getSignatureContent(text, component.cacheService);
        component.saveSelection.restore();
        component.editor.executeCommand('insertHTML', processedSignature);
    }

    /**
     * <p>To replace quickText if avaliable.</p>
     * @param component Form component to which the quick text applies
     */
    public static replaceQuickTextsIfAvailable(component: any) {
        component.lookupCharacter = component.uiActionService.getLookupCharacterIfReplaceQuickTextAction(
            component.currentRecord,
            component.field,
            component.lookupCharacter
        );
        if (component.lookupCharacter) {
            this.getQuickText(component, undefined, undefined, 'replace');
        }
    }

    /**
     * <p>To replace quickText.</p>
     * @param component Form component to which the quick text applies
     * @param text Text to replace into the component
     * @param output Variable to determine what to replace
     */
    private static replaceQuickText(component: any, text: any, output: string) {
        if (output === 'tag' || output === 'value') {
            if (output === 'tag' && !text.startsWith(component.lookupCharacter)) {
                let closeCharacter = component.lookupCharacter;
                if (component.lookupCharacter === '[') {
                    closeCharacter = ']';
                }
                text = component.lookupCharacter + text + closeCharacter;
            }

            if (!text) {
                text = '';
            } else if (typeof text != 'string') {
                text = text.toString();
            }

            let selection = component.selection;
            component.selection =
                selection -
                component.mentionValue.length -
                component.lookupCharacter.length +
                text.length;
            return (
                component.field.CodeValue.substring(
                    0,
                    selection - component.mentionValue.length - component.lookupCharacter.length
                ) +
                (text ? text : '') +
                component.field.CodeValue.substring(selection)
            );
        }
    }

    /**
     * <p>To replace quickText.</p>
     * @param component Form component to which the quick text applies
     * @param text Text to replace into the component
     * @param output Variable to determine what to replace
     */
    private static replaceQuickTextRTE(component: any, text: any, output: string) {
        if (!text) {
            text = '';
        }

        let closeCharacter = component.lookupCharacter;
        let insertText = text;
        if (output === 'tag') {
            if (component.lookupCharacter === '[') {
                closeCharacter = ']';
            }
            insertText = component.lookupCharacter + text + closeCharacter;
        }

        let preText = '';
        if (component.range && component.range.startContainer) {
            preText = component.range.startContainer.textContent;
            if (preText) {
                preText = preText.substring(
                    0,
                    component.selection - component.mentionValue.length - 1
                );
            }
        }

        let range = component.saveSelection.range;
        if (range) {
            range.setStart(range.startContainer, 0);
            range.deleteContents();
            if (insertText && insertText != '') {
                range.insertNode(document.createTextNode(insertText));
            }
            if (preText && preText != '') {
                range.insertNode(document.createTextNode(preText));
            }
            range.setStart(range.endContainer, range.endOffset);
            component.editor.selectRange(range);
        }
    }

    /**
     * <p>Used to load suggetions based on keystroke.</p>
     * @param component Form component to which the keystroke applies
     * @param namedParameters : input named parameters
     */
    private static fetchKeyStrokeSuggestions(component: any, namedParameters: any) {
        component.DynamicField = null;
        const data = component.collectionsService.loadFieldOptions(
            component.field.CodeElement,
            namedParameters,
            component.CodeAction ? component.CodeAction['_id'] : '',
            component.currentPage.CodeElement
        );
        data.subscribe(async (_response) => {
            let options = JSON.parse(_response.body).options;
            let parsedOptions = Utils.parseOptions(options, '', component.field.CodeDisplay);
            component.field.options = parsedOptions.options;
            component.filteredTexts = component.field.options;
            if (component.field.options.length) {
                component.dialogRef.show();
                if (component.componentType === 'Rich Text Editor') {
                    const positionRt = component.range.getBoundingClientRect();
                    component.dialogRef.position = { X: positionRt.left, Y: positionRt.top };
                } else {
                    const position = Utils.getCoordinatesForDialog(
                        component.event,
                        component.componentType,
                        component.selection,
                        component.isCached
                    );

                    component.dialogRef.position = { X: position.left, Y: position.top };
                }
            } else {
                if (component.dialogRef && component.dialogRef.visible) {
                    component.dialogRef.hide();
                }
            }
        });
    }
    /**
     * <p>Fetches the CodeActions without lookup.</p>
     * @param component Form component to which the action applies
     * @param value currentValue ,that is subString of eventtargetvalue to selectionEnd.
     */
    private static fetchCodeActionWithoutLookup(component: any, value: any) {
        const codeActionWithoutLookup = component.KeyStrokeActions.find((action) => {
            if (!action[StandardCodes.LOOKUP_CHARACTER]) {
                return action;
            }
        });
        if (codeActionWithoutLookup && value.length > 0) {
            component.lookupCharacter = '';
            component.mentionValue = value;
            component.CodeAction = codeActionWithoutLookup;
        } else {
            component.CodeAction = null;
        }
    }

    /**
     * <p>Handles Keyboard events.</p>
     * @param component Form component to which the event applies
     * @param event KeyBoard Event
     */
    public static handleKeyboardEvent(component: any, event: any) {
        if (component.dialogRef && component.dialogRef.visible) {
            if (event.which === 27) {
                component.escapePressed = true;
                component.dialogRef.hide();
            } else if (event.which === 40) {
                if (
                    component.filteredTexts &&
                    component.currentListIndex < component.filteredTexts.length
                ) {
                    component.currentListIndex = component.currentListIndex + 1;
                } else {
                    component.currentListIndex = 0;
                }
            } else if (event.which === 38) {
                if (component.currentListIndex > 0) {
                    component.currentListIndex = component.currentListIndex - 1;
                }
            } else if (event.which === 13) {
                if (component.componentType === 'Rich Text Editor') {
                    component.contextService.saveDataChangeState();
                }
                component.onValueSelect(component.filteredTexts[component.currentListIndex]);
                event.preventDefault();
            }
        }
        if (event.which === 27 || event.which === 40 || event.which === 38 || event.which === 13) {
            if (component.dialogRef && component.dialogRef.visible) {
                return false;
            } else {
                return true;
            }
        }
    }

    public static console(str) {
        //console.log(str);
    }
}
