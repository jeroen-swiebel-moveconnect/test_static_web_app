import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';
import { CollectionsService } from 'src/app/moveware/services';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownModule } from 'primeng/dropdown';
import { PagerModule } from '@syncfusion/ej2-angular-grids';
import { TranslateModule } from '@ngx-translate/core';
xdescribe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PaginationComponent],
            providers: [CollectionsService],
            imports: [DropdownModule, FormsModule, PagerModule, TranslateModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create PaginationComponent object', () => {
        expect(component).toBeTruthy();
    });

    describe('When we are calling onPage method', () => {
        beforeEach(() => {
            spyOn(component.goPage, 'emit');
            spyOn<any>(component, 'getPaginatorObj').and.stub();
            component.page = 1;
            component.perPage = 30;
            component.onPage(1);
        });
        it('then getPanginatorObj method should have been called', () => {
            expect(component['getPaginatorObj']).toHaveBeenCalledWith(
                component.page,
                component.perPage
            );
        });
        it('then getPanginatorObj method should have been called', () => {
            expect(component['getPaginatorObj']).toHaveBeenCalledTimes(1);
        });
        it('then goPage method should have been called', () => {
            expect(component.goPage.emit).toHaveBeenCalledTimes(1);
        });
    });
    describe('When we are calling onPageSizeChange method', () => {
        beforeEach(() => {
            spyOn(component.goPage, 'emit');
            spyOn<any>(component, 'getPaginatorObj').and.stub();
            component.page = 1;
            component.perPage = 30;
            let size = { pageSize: '40' };
            component.onPageSizeChange(size);
        });
        it('should set perPage value', () => {
            expect(component.perPage).toEqual(40);
        });
        it('then getPanginatorObj method should have been called', () => {
            expect(component['getPaginatorObj']).toHaveBeenCalledWith(1, 40);
        });
        it('then getPanginatorObj method should have been called', () => {
            expect(component['getPaginatorObj']).toHaveBeenCalledTimes(1);
        });
        it('then goPage method should have been called', () => {
            expect(component.goPage.emit).toHaveBeenCalledTimes(1);
        });
    });
    describe('When we are calling getPaginatorObj method', () => {
        beforeEach(() => {
            component.page = 2;
            component.perPage = 50;
        });
        it('should set getPaginatorObj', () => {
            expect(component.getPaginatorObj(component.page, component.perPage, false)).toEqual({
                pageIndex: 2,
                pageSize: 50,
                auto: false
            });
        });
    });
    describe('When we are calling onPageChange method', () => {
        beforeEach(() => {
            spyOn<any>(component, 'onPage').and.stub();
            let page = { currentPage: 5 };
            component.onPageChange(page);
        });
        it('then onPage method should have been called With', () => {
            expect(component['onPage']).toHaveBeenCalledWith(4);
        });
        it('then onPage method should have been called', () => {
            expect(component['onPage']).toHaveBeenCalledTimes(1);
        });
    });
});
