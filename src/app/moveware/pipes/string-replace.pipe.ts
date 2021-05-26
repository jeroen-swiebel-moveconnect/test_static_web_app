import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stringReplace'
})
export class StringReplacePipe implements PipeTransform {
    transform(value: string, symbol: string): any {
        if (value) {
            return value.replace(symbol, '');
        } else {
            return '';
        }
    }
}
