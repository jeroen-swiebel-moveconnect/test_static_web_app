import { Pipe, PipeTransform } from '@angular/core';
import Utils from '../services/utils';

@Pipe({
    name: 'jsonParser'
})
export class JSONParserPipe implements PipeTransform {
    transform(value: any, symbol: string): any {
        if (value && !Utils.isObjectEmpty(value)) {
            if (value instanceof Object) {
                return this.Stringify(value, 4);
            } else if (this.isJSON(value)) {
                return this.Stringify(JSON.parse(value), 4);
            } else {
                return value;
            }
        } else {
            return undefined;
        }
    }
    Stringify(value, indentationSpacing: number) {
        return JSON.stringify(value, null, indentationSpacing);
    }
    isJSON(value) {
        try {
            JSON.parse(value);
        } catch (e) {
            return false;
        }
        return true;
    }
}
