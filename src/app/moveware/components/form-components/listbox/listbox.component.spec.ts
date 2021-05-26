import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TestingModule } from '../../../app-testing.module';

import { ListboxComponent } from './listbox.component';

describe('ListboxComponent', () => {
    let component: ListboxComponent;
    let fixture: ComponentFixture<ListboxComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ListboxComponent],
            imports: [TestingModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ListboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
