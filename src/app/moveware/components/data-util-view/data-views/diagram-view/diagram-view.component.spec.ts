import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { DiagramViewComponent } from './diagram-view.component';

describe('DiagramViewComponent', () => {
    let component: DiagramViewComponent;
    let fixture: ComponentFixture<DiagramViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DiagramViewComponent],
            imports: [TranslateModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DiagramViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
