import { PipeTransform, Pipe } from '@angular/core';
import Utils from '../services/utils';
import { DomSanitizer } from '@angular/platform-browser';
import { format } from 'date-fns';
import * as _ from 'lodash';
import { CacheService } from '../services/cache.service';
import { Internationalization } from '@syncfusion/ej2-base';

@Pipe({
    name: 'ContentProcessor'
})
export class ContentProcessorPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer, private cacheService: CacheService) {}

    getImagePath(value) {
        return Utils.getUserAvatar(value);
    }

    transform(value, column, header?) {
        try {
            value = Utils.getValue(value, column);
            if (value && value.en) {
                value = value.en;
            }
            let dataType = column.CodeFieldType;
            let proceesedData = '';
            if (column['isProcessHighlights']) {
                value = this.processHighlights(value, column, header);
            }
            if (dataType === 'File Upload') {
                value = this.getImagePath(value?.FileSearchName);
            }
            if (
                column['FileType'] &&
                (column['FileType'].CodeCode === 'Video' || column['FileType'] === 'Video')
            ) {
                proceesedData = "<img src='assets/images/vedio.png'/>";
            } else if (
                column['FileType'] &&
                (column['FileType'].CodeCode === 'Document' || column['FileType'] === 'Document')
            ) {
                let fileName = value + '';
                let fileExtension = fileName.substring(
                    (fileName + '').lastIndexOf('.') + 1,
                    fileName.length
                );
                if (fileExtension.toLowerCase() === 'xls') {
                    proceesedData = "<img src='assets/images/excel.png'/>";
                } else if (fileExtension.toLowerCase() === 'doc') {
                    proceesedData = "<img src='assets/images/document.png'/>";
                } else if (fileExtension.toLowerCase() === 'pdf') {
                    proceesedData = "<img src='assets/images/PDF.png'/>";
                }
            } else if (
                column['FileType'] &&
                (column['FileType'].CodeCode === 'Image' || column['FileType'] === 'Image')
            ) {
                proceesedData = "<img src='" + Utils.getFileFullpath(value + '') + "'/>";
            } else if (value) {
                //  {class: "fa fa-dollar", color: "#fff", fontSize: 15}
                switch (dataType) {
                    case 'File Upload':
                        proceesedData = "<img class='table-img' src='" + value + "'/>";
                        break;
                    case 'Icon Picker':
                        let color = value.color;
                        if (color === '#fff' || color === '#ffffff') {
                            color = '#000';
                        }
                        proceesedData =
                            "<i style='color: " + color + ";' class='" + value.class + "' ></i>";
                        break;
                    case 'Date Time':
                        proceesedData = this.processDate(value, column);
                        break;
                    case 'Date':
                        proceesedData = this.processDate(value, column);
                        break;
                    case 'FTSText':
                        proceesedData = value.replace('</p>', '').replace('<p>', '');
                        if (proceesedData.length > 70) {
                            for (let index = 70; index < proceesedData.length; index++) {
                                if (proceesedData.charAt(index) === ' ') {
                                    proceesedData = proceesedData.slice(0, index);
                                    break;
                                }
                            }
                        }
                        break;
                    default:
                        if (value instanceof Object && !(value instanceof Array)) {
                            if (!Utils.isObjectEmpty(value)) {
                                proceesedData = Utils.applyCodeDisplaytoField(
                                    Utils.getCodeDisplay(
                                        Utils.getCodeDisplayFromValue(column, value)
                                    ),
                                    value,
                                    false
                                );
                            } else {
                                proceesedData = '';
                            }
                        } else if (value instanceof Array) {
                            value.forEach((element) => {
                                proceesedData =
                                    (proceesedData ? proceesedData : '') +
                                    (proceesedData ? ', ' : '') +
                                    Utils.applyCodeDisplaytoField(
                                        Utils.getCodeDisplay(
                                            Utils.getCodeDisplayFromValue(column, element)
                                        ),
                                        element,
                                        false
                                    );
                            });
                        } else {
                            // if (column.isTranslatable) {
                            //     proceesedData = '<ng-container>' + value + '</ng-container>';
                            // } else {
                            //     proceesedData = '<ng-container>' + value + '</ng-container>';
                            // }
                            proceesedData = value;
                        }
                }
                if (!proceesedData) {
                    proceesedData = '';
                }
                return this.sanitized.bypassSecurityTrustHtml(proceesedData);
            }
            return this.sanitized.bypassSecurityTrustHtml(proceesedData);
        } catch (error) {
            return value;
        }
    }
    processDate(date, column?) {
        if (date) {
            date = new Date(date);
            let timeZone = sessionStorage.getItem('TimeZone')
                ? JSON.parse(sessionStorage.getItem('TimeZone'))['CodeValue']
                : Intl.DateTimeFormat().resolvedOptions().timeZone;
            date = date.toLocaleString(this.cacheService.getSessionData('Region'), {
                timeZone: timeZone
            });
            if (column && column['CodeFormat']) {
                let intl: Internationalization = new Internationalization();
                return intl.formatDate(new Date(date), {
                    type: 'dateTime',
                    skeleton: column['CodeFormat']
                });
            }
            return date;
        }
    }
    processHighlights(value, column, header) {
        let processedValue = '';
        header.highlights.forEach((highlight) => {
            const texts = highlight.texts;
            const path = highlight['path'];
            if (path.includes(column['CodeCode'])) {
                let replacements = texts
                    .map((text) => {
                        if (text.type == 'hit') {
                            return '<mark>' + text.value + '</mark>';
                        } else {
                            return text.value.replace(/(<([^>]+)>)/gi, '');
                        }
                    })
                    .join('');
                let originals = texts
                    .map((text) => {
                        return text.value;
                    })
                    .join('');
                originals = originals.replace(originals, replacements);
                processedValue = processedValue + originals;
            }
        });
        processedValue = processedValue.substring(0, 100);
        if (processedValue === '') {
            return value;
        } else {
            return processedValue;
        }
    }
}
