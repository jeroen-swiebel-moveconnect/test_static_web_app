import { MegaMenuComponent } from './mega-menu.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import Utils from 'src/app/moveware/services/utils';

fdescribe('MegaMenuComponent', () => {
    let component: any;
    let fixture: ComponentFixture<MegaMenuComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [MegaMenuComponent],
            providers: [],
            imports: []
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MegaMenuComponent);
        component = fixture.componentInstance;
        component['menus'] = [{ showChild: true }];
    });
    it('should create component instance', () => {
        expect(component).toBeTruthy;
    });

    describe('when calling setSelectedMenu', () => {
        it('should emit the selectMenu property', () => {
            component.selectMenu = new EventEmitter<string>();
            spyOn(component.selectMenu, 'emit').and.stub();

            component.setSelectedMenu(0, {});

            expect(component.selectMenu.emit).toHaveBeenCalled();
        });
    });

    describe('when calling openContextmenu', () => {
        it('should emit the selectContextMenu property', () => {
            component.selectContextMenu = new EventEmitter<string>();
            spyOn(component.selectContextMenu, 'emit').and.stub();

            component.openContextmenu(0, {});

            expect(component.selectContextMenu.emit).toHaveBeenCalled();
        });
    });
});
