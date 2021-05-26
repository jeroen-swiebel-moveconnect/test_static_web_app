import { PipeTransform, Pipe } from '@angular/core';
import Utils from '../services/utils';
import { DomSanitizer } from '@angular/platform-browser';
import { format } from 'date-fns';
import { Internationalization } from '@syncfusion/ej2-base';

@Pipe({
    name: 'DateTimeProcessor'
})
export class DateTimeProcessorPipe implements PipeTransform {
    constructor() {}
    transform(value, format?) {
        if (value) {
            let intl: Internationalization = new Internationalization();
            return intl.formatDate(new Date(value), {
                type: 'dateTime',
                skeleton: format
            });
        } else {
            return '';
        }
    }
}
