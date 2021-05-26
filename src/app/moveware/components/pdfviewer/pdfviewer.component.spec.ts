import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PDFViewerComponent } from './pdfviewer.component';

describe('PDFViewerComponent', () => {
    let component: PDFViewerComponent;
    let fixture: ComponentFixture<PDFViewerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PDFViewerComponent],
            imports: [TranslateModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PDFViewerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
