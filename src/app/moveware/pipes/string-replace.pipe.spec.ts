import { StringReplacePipe } from './string-replace.pipe';

describe('TestpipePipe', () => {
    it('create an instance', () => {
        const pipe = new StringReplacePipe();
        expect(pipe).toBeTruthy();
    });
});
