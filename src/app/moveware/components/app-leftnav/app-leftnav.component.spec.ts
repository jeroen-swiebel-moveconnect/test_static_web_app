import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { ComponentFixture, inject, TestBed, async } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { of } from 'rxjs/observable/of';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { WebBaseProvider } from 'src/app/moveware/providers';
import {
    CollectionsService,
    EventsListenerService,
    MenuUpdateService
} from 'src/app/moveware/services';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import Utils from 'src/app/moveware/services/utils';
import { LeftNavComponent } from './app-leftnav.component';
import { TranslateModule } from '@ngx-translate/core';

xdescribe('LeftNavComponent', () => {
    let component: LeftNavComponent;
    let fixture: ComponentFixture<LeftNavComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [LeftNavComponent],
            providers: [
                ToastService,
                MenuUpdateService,
                MenuService,
                GridService,
                EventsListenerService,
                UIActionService,
                ContextService,
                Title,
                DialogService,
                DynamicDialogConfig,
                CollectionsService,
                WebBaseProvider,
                PageMappingService
            ],
            imports: [RouterTestingModule, HttpClientTestingModule, TranslateModule.forRoot()]
        });
        fixture = TestBed.createComponent(LeftNavComponent);
        component = fixture.componentInstance;
    }));

    it('should initialise the component', inject([MenuService], (menuService: MenuService) => {
        spyOn<any>(menuService, 'getMenus').and.stub();
        expect(component).toBeDefined();
    }));

    describe('when calling onMenuItemSelection', () => {
        let event;
        let currentMenu;
        let parentMenu;
        let ancestorMenu;
        beforeEach(() => {
            event = {
                item: {
                    label: 'Configuration',
                    menu: {
                        CodeCode: 'Configuration'
                    },
                    parentObj: {
                        label: 'General',
                        menu: {
                            CodeCode: 'General'
                        },
                        parentObj: {
                            label: 'System',
                            menu: {
                                CodeCode: 'System'
                            }
                        }
                    }
                }
            };
            currentMenu = event.item.menu;
            parentMenu = event.item.parentObj.menu;
            ancestorMenu = event.item.parentObj.parentObj.menu;
        });
        it('should call setSelectedMenu with ancestor, parent and current menus', () => {
            spyOn(component, 'setSelectedMenu').and.stub();
            component.onMenuItemSelection(event);
            expect<any>(component.setSelectedMenu).toHaveBeenCalledWith(
                ancestorMenu,
                parentMenu,
                currentMenu
            );
        });
        it('should call setSelectedMenu with parent and current menus', () => {
            delete event.item.parentObj.parentObj.menu;
            spyOn(component, 'setSelectedMenu').and.stub();
            component.onMenuItemSelection(event);
            expect<any>(component.setSelectedMenu).toHaveBeenCalledWith(parentMenu, currentMenu);
        });
        it('should call setSelectedMenu with current menu', () => {
            delete event.item.parentObj.menu;
            spyOn(component, 'setSelectedMenu').and.stub();
            component.onMenuItemSelection(event);
            expect<any>(component.setSelectedMenu).toHaveBeenCalledWith(currentMenu);
        });
    });

    describe('when calling handleContextMenuActions', () => {
        let event = { item: {} };
        let locationURL = 'mw/menu/home';
        beforeEach(() => {
            component.locationURL = locationURL;
        });
        it('should call openNewTab of Utils', () => {
            event.item['value'] = StandardCodes.TASK_OPEN_LINK_IN_NEW_TAB;
            spyOn(Utils, 'openNewTab').and.stub();
            component.handleContextMenuActions(event);
            expect<any>(Utils['openNewTab']).toHaveBeenCalledWith(locationURL);
        });
        it('should call openNewWindow of Utils', () => {
            event.item['value'] = StandardCodes.TASK_OPEN_LINK_IN_NEW_WINDOW;
            spyOn(Utils, 'openNewWindow').and.stub();
            component.handleContextMenuActions(event);
            expect<any>(Utils['openNewWindow']).toHaveBeenCalledWith(locationURL);
        });
        it('should call handleLoadContainer', () => {
            event.item['value'] = StandardCodes.TASK_LOAD_UI_CONTAINER;
            spyOn(component, 'handleLoadContainer').and.stub();
            component.handleContextMenuActions(event);
            expect<any>(component['handleLoadContainer']).toHaveBeenCalledWith(event.item['value']);
        });
        it('should call addWarningMessage', inject([ToastService], (toastService: ToastService) => {
            component.locationURL = null;
            spyOn(toastService, 'addWarningMessage').and.stub();
            component.handleContextMenuActions(event);
            expect<any>(toastService['addWarningMessage']).toHaveBeenCalledWith(
                'No Actions on that menu'
            );
        }));
    });

    describe('when calling setSelectedMenu', () => {
        let dataChanged;
        it('should call handleMenuSelection', inject(
            [MenuService, ContextService],
            (menuService: MenuService, contextService: ContextService) => {
                dataChanged = spyOn(contextService, 'isDataChanged').and.returnValue(of(false));
                spyOn(menuService, 'handleMenuSelection').and.stub();
                component.setSelectedMenu({}, {}, {});
                expect<any>(menuService['handleMenuSelection']).toHaveBeenCalledWith();
            }
        ));
        it('should call loadMenu and removeDataChangeState', inject(
            [ContextService],
            (contextService: ContextService) => {
                spyOn(contextService, 'isDataChanged').and.returnValue(of(true));
                //spyOn(component, ;loadMenu").and.stub();
                spyOn(contextService, 'removeDataChangeState').and.stub();
                spyOn<any>(component, 'loadMenu').and.stub();
                component.setSelectedMenu({}, {}, {});
                expect<any>(contextService['removeDataChangeState']).toHaveBeenCalled();
                expect<any>(component['loadMenu']).toHaveBeenCalledWith({}, {}, {});
            }
        ));
    });
    describe('when calling getNavigationURL', () => {
        it('should return navigation url with childSubMenu', inject(
            [Title],
            (titleService: Title) => {
                spyOn(titleService, 'setTitle').and.stub();
                let navigationUrl = component.getNavigationURL(
                    { CodeCode: 'System' },
                    { CodeCode: 'General' },
                    { CodeCode: 'Configuration' }
                );
                expect<any>(navigationUrl).toEqual('mw/menu/System/General/Configuration');
            }
        ));
        it('should return navigation url with subMenu', inject([Title], (titleService: Title) => {
            spyOn(titleService, 'setTitle').and.stub();
            let navigationUrl = component.getNavigationURL(
                { CodeCode: 'System' },
                { CodeCode: 'General' },
                null
            );
            expect<any>(navigationUrl).toEqual('mw/menu/System/General');
        }));
        it('should return navigation url with menu', inject([Title], (titleService: Title) => {
            spyOn(titleService, 'setTitle').and.stub();
            let navigationUrl = component.getNavigationURL({ CodeCode: 'System' }, null, null);
            expect<any>(navigationUrl).toEqual('mw/menu/System');
        }));
    });
});
