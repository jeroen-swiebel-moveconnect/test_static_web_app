import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'PostProcessor'
})
export class PostProcessorPipe implements PipeTransform {
    constructor() {}

    transform(value, column, header) {
        let processedValue = '';
        column.highlights.forEach((highlight) => {
            const texts = highlight.texts;
            const path = highlight['path'];
            if (path.includes(header['CodeCode'])) {
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
