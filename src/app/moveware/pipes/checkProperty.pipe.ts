import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'checkProperty',
    pure: false
})
export class checkPropertyPipe implements PipeTransform {
    transform(items: any, text: string, property: string): any {
        if (!text) {
            return items;
        }

        if (!Array.isArray(items)) {
            return items;
        }

        if (text && Array.isArray(items)) {
            return items.filter((item) => {
                return item[property].toLowerCase().includes(text.toLowerCase());
            });
        }
    }
}
