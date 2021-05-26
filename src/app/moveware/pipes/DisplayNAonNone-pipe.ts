import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'displayNAOnNone'
})
export class DisplayNAOnNone implements PipeTransform {
    transform(value: string): any {
        return !value ? 'NA' : value;
    }
}
