import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { MenuUpdateService } from './menu-update.service';

describe('MenuUpdateService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            declarations: [],
            providers: [MenuUpdateService],
            imports: [TranslateModule.forRoot()]
        })
    );

    it('should be created', () => {
        const service: MenuUpdateService = TestBed.get(MenuUpdateService);
        expect(service).toBeTruthy();
    });
});
