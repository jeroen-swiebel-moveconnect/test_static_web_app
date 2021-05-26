import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { SpreadsheetViewComponent } from './spreadsheet-view.component';

describe('SpreadsheetViewComponent', () => {
    let component: SpreadsheetViewComponent;
    let fixture: ComponentFixture<SpreadsheetViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SpreadsheetViewComponent],
            imports: [TranslateModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SpreadsheetViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
