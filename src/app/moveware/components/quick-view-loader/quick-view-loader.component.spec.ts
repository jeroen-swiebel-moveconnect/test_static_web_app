import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CollectionsService } from 'src/app/moveware/services';
import { QuickMenuToggleService } from 'src/app/moveware/services/quick-menu-toggle-listener.service';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { QuickViewLoaderComponent } from './quick-view-loader.component';
import { ContextService } from 'src/app/moveware/services/context.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/moveware/services/localization.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';

describe('QuickViewLoaderComponent', () => {
    let component: QuickViewLoaderComponent;
    let fixture: ComponentFixture<QuickViewLoaderComponent>;
    let contextServiceStub: ContextService;
    let menuServiceStub: MenuService;
    let menu;

    beforeEach(() => {
        menu = {
            UIContainer: '8fb25b15-4cb9-46ed-99ec-33da51a1fc6c',
            CodeCode: 'Quick Event Viewer'
        };
        const collectionsServiceStub = {};
        const menuServiceStub = {
            getMenuItems: (menu) => ({})
        };
        const toastServiceStub = {};

        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [QuickViewLoaderComponent],
            providers: [
                QuickMenuToggleService,
                { provide: CollectionsService, useValue: collectionsServiceStub },
                { provide: MenuService, useValue: menuServiceStub },
                { provide: ContextService, useValue: contextServiceStub },
                { provide: ToastService, useValue: toastServiceStub },
                HttpClient,
                HttpHandler
            ],
            imports: [TranslateModule.forRoot()]
        }).compileComponents;
        fixture = TestBed.createComponent(QuickViewLoaderComponent);
        component = fixture.componentInstance;
        component.menu = { CodeUIActions: '', CodeUIMethod: '' };
        spyOn(component, 'setContextMenus');
        fixture.detectChanges();
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });

    describe('handleContextMenuActions', () => {
        beforeEach(() => {
            component.menuBar = {
                CodeActions: [
                    {
                        CodeUIAction: 'Context Menu',
                        Task: {
                            _id: 'cc829219-19a5-44d8-87a6-82d72f59af02',
                            CodeCode: 'Load UI Container',
                            CodeDescription: {
                                en: 'Load UI Container'
                            }
                        }
                    }
                ]
            };

            component.activeMenu = {
                CodeActions: [
                    {
                        CodeUIAction: 'Mouse Left Click',
                        Task: {
                            _id: 'cc829219-19a5-44d8-87a6-82d72f59af02',
                            CodeCode: 'Load UI Container',
                            CodeDescription: {
                                en: 'Load UI Container'
                            }
                        }
                    }
                ]
            };
        });
        it('check for codeActions length in active menu', () => {
            const length = 1;
            spyOn(component, 'handleAction').and.stub();
            component.handleContextMenuActions('Load UI Container');
            expect(component.activeMenu['CodeActions'].length).toBeGreaterThan(length);
        });
    });

    describe('call handleAction', () => {
        beforeEach(inject(
            [Broadcaster, UIActionService, MenuService],
            (
                broadcaster: Broadcaster,
                actionService: UIActionService,
                menuService: MenuService
            ) => {
                spyOn(broadcaster, 'broadcast').and.stub();
                spyOn(actionService, 'actionHandler').and.stub();
                menuService.activeMenuIds = [];
            }
        ));

        it('set containerId', inject([UIActionService], (actionService: UIActionService) => {
            let menu = {
                CodeActions: [
                    {
                        Task: {
                            _id: 'cc829219-19a5-44d8-87a6-82d72f59af02',
                            CodeCode: 'Load UI Container'
                        },
                        UIContainer: '0fe076fa-322e-4ecc-a271-58008dbe6663'
                    }
                ]
            };
            let updatedMenu = {
                UIContainer: '0fe076fa-322e-4ecc-a271-58008dbe6663',
                _id: '89814386-e4eb-4cc7-9c79-9b5f26a5ca77'
            };
            spyOn(actionService, 'getActionDetails').and.returnValue(updatedMenu);
            component.handleAction(menu);
            expect('0fe076fa-322e-4ecc-a271-58008dbe6663').toEqual(updatedMenu.UIContainer);
        }));

        it('should broadcast event...', inject(
            [Broadcaster, UIActionService],
            (broadcaster: Broadcaster, actionService: UIActionService) => {
                let menu = {
                    CodeActions: [
                        {
                            Task: {
                                _id: 'cc829219-19a5-44d8-87a6-82d72f59af02',
                                CodeCode: 'Load UI Container'
                            },
                            UIContainer: '0fe076fa-322e-4ecc-a271-58008dbe6663'
                        }
                    ]
                };

                let selectedData = {
                    UIContainer: '0fe076fa-322e-4ecc-a271-58008dbe6663'
                };
                spyOn(actionService, 'getActionDetails').and.returnValue(selectedData);
                component.handleAction(menu);
                expect(broadcaster.broadcast).toHaveBeenCalledWith('click-registered');
            }
        ));
    });
});
