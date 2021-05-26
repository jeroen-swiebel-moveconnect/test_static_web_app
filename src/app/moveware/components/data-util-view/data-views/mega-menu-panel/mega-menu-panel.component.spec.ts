import { MegaMenuPanelComponent } from './mega-menu-panel.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import Utils from 'src/app/moveware/services/utils';

fdescribe('MegaMenuPanelComponent', () => {
    let component: any;
    let fixture: ComponentFixture<MegaMenuPanelComponent>;
    let dummyMenu: any = {
        CodeCode: 'Dummy Menu',
        CodeActions: [{ CodeUIAction: 'Dummy Action' }, { CodeUIAction: 'Mouse Left Click' }],
        subMenus: [{ CodeCode: 'Dummy Submenu 1' }, { CodeCode: 'Dummy Submenu 2' }]
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [MegaMenuPanelComponent],
            providers: [],
            imports: []
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MegaMenuPanelComponent);
        component = fixture.componentInstance;
        component['menu'] = {
            show: true,
            CodeCode: 'menu',
            subMenus: [
                {
                    CodeCode: 'Test Submenu'
                }
            ]
        };
        component['partMenu'] = {
            CodeCode: 'Part Menu',
            show: true
        };
        component['fullMenu'] = {
            CodeCode: 'Full Menu',
            show: true
        };
        component['menuLocked'] = -1;
    });
    it('should create component instance', () => {
        expect(component).toBeTruthy;
    });

    describe('when calling setSelectedMenu', () => {
        it('should emit the selectMenu property', () => {
            component.selectMenu = new EventEmitter<string>();
            spyOn(component.selectMenu, 'emit').and.stub();
            spyOn(component, 'removeModal').and.stub();

            component.setSelectedMenu(0, dummyMenu);

            expect(component.selectMenu.emit).toHaveBeenCalled();
            expect(component.menu.show).toBeFalsy();
            expect(component.removeModal).toHaveBeenCalled();
            expect(component.menuLocked).toEqual(-1);
        });
    });

    describe('when calling openInNewTab', () => {
        it('should emit the selectMenu property', () => {
            let event = jasmine.createSpyObj('event', ['stopPropagation']);
            event['target'] = {
                parentNode: {
                    parentElement: { innerText: 'Dummy Target' }
                }
            };
            component.selectMenu = new EventEmitter<string>();
            spyOn(component.selectMenu, 'emit').and.stub();
            spyOn(component, 'removeModal').and.stub();

            component.openInNewTab(event, 0, dummyMenu);

            expect(component.selectMenu.emit).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(component.removeModal).toHaveBeenCalled();
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

    describe('when calling expandMenu', () => {
        beforeEach(() => {
            spyOn(component, 'applyModal').and.stub();
        });

        it('should set menu to partMenu if already expanded and applyModal', () => {
            component.expandMenu(0, true);

            expect(component.applyModal).toHaveBeenCalled();
            expect(component.menuExpanded).toBeFalsy();
            expect(component.menu).toEqual(component.partMenu);
        });

        it('should set menu to fullMenu if not expanded and applyModal', () => {
            component.menuExpanded = false;
            component.expandMenu(0);

            expect(component.applyModal).toHaveBeenCalled();
            expect(component.menuExpanded).toBeTruthy();
            expect(component.menu).toEqual(component.fullMenu);
        });
    });

    describe('when calling applyModal', () => {
        it('should set menu show to true if not locked', () => {
            component.updateShow = new EventEmitter<string>();
            spyOn(component.updateShow, 'emit').and.stub();
            component.menuLocked = -1;
            component.applyModal();

            expect(component.menu.show).toBeTruthy();
            expect(component.updateShow.emit).toHaveBeenCalled();
        });
    });

    describe('when calling removeModal', () => {
        it('should set menu show to false if not locked and not display contextMenu', () => {
            component.updateShow = new EventEmitter<string>();
            spyOn(component.updateShow, 'emit').and.stub();
            component.menu.locked = false;
            component['displayContextMenu'] = false;
            component.removeModal();

            expect(component.menu.show).toBeFalsy();
            expect(component.updateShow.emit).toHaveBeenCalled();
        });
    });

    describe('when calling randomColor', () => {
        let spyObj: jasmine.Spy;
        let color: string;

        beforeEach(() => {
            spyObj = spyOn(component, 'randomColor').and.callThrough();
        });

        it('should return green when number is equal to or less than 10', () => {
            color = spyObj.call(component, 0);
            expect(color).toEqual('green');
        });

        it('else it should return orange when number is equal to or less than 20', () => {
            color = spyObj.call(component, 15);
            expect(color).toEqual('orange');
        });

        it('else it should return red', () => {
            color = spyObj.call(component, 30);
            expect(color).toEqual('red');
        });
    });

    describe('when calling checkAction', () => {
        beforeEach(() => {
            component.onRecordSelection = new EventEmitter<string>();
            spyOn(component, 'setSelectedMenu').and.stub();
            spyOn(component.onRecordSelection, 'emit').and.stub();
        });
        it('should emit action if it exists', () => {
            component.checkAction('Dummy Action', 0, dummyMenu);

            expect(component.onRecordSelection.emit).toHaveBeenCalled();
        });

        it('should select menu if action is Mouse Left Click', () => {
            component.checkAction('Mouse Left Click', 0, []);

            expect(component.setSelectedMenu).toHaveBeenCalled();
        });
    });

    describe('when calling configureMenu', () => {
        let spyObj: jasmine.Spy;

        beforeEach(() => {
            component['currentPage'] = {};
            spyObj = spyOn<any>(component, 'configureMenu').and.callThrough();

            spyObj.call(component, []);
        });

        it('should set menu', () => {
            expect(component.menu).toEqual({
                subMenus: [],
                isTask: true
            });
        });
    });

    describe('when setting dataSource', () => {
        it('should call configureMenu on data', () => {
            spyOn<any>(component, 'configureMenu').and.stub();

            component.setDataSource = [];

            expect(component.configureMenu).toHaveBeenCalled();
        });
    });
});
