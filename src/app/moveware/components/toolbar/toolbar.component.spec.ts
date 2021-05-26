import { TestBed, ComponentFixture, fakeAsync, inject, flush } from '@angular/core/testing';
import {
    EditService,
    GroupService,
    VirtualScrollService,
    ResizeService,
    RowDDService,
    ColumnChooserService,
    ForeignKeyService,
    SelectionService,
    SelectionSettingsModel,
    FilterService,
    ReorderService,
    SortEventArgs
} from '@syncfusion/ej2-angular-grids';
import { EventEmitter } from '@angular/core';
import Utils from 'src/app/moveware/services/utils';
import { TranslateModule } from '@ngx-translate/core';
import { ToolbarComponentView } from './toolbar.component';
import { ToolbarComponent, ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { TestingModule } from '../../app-testing.module';
import { actionEvents } from '@syncfusion/ej2-angular-spreadsheet';
fdescribe('Toolbar component', () => {
    let component: ToolbarComponentView;
    let fixture: ComponentFixture<ToolbarComponentView>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [ToolbarComponentView],
            providers: [],
            imports: [ToolbarModule, TestingModule]
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(ToolbarComponentView);
        component = fixture.componentInstance;
        component.primaryActions = [];
        component.secondaryActions = [];
        component.currentView = { CodeType: 'CodeCode' };
        spyOn(Utils, 'getIndexByProperty').and.returnValue(-1);
        fixture.detectChanges();
    });
    it('component initialization', () => {
        expect(component).toBeDefined();
    });
    // describe('when calling setSelectionMode', () => {
    // let setSelectionModeSpy;
    // let _selectionOptions;
    // beforeEach(() => {
    // component.multiSelection = 'Single';
    // setSelectionModeSpy = spyOn<any>(component, 'setSelectionMode').and.callThrough();
    // _selectionOptions = { type: 'Single', mode: 'Row' };
    // });
    // it('selectionOptions show set', () => {
    // expect(component.selectionOptions).toEqual(_selectionOptions);
    // });
    // });

    // describe('when calling onSort with no sort order', () => {
    // let column;
    // beforeEach(() => {
    // column = { CodeCode: 'CodeType', CodeDescription: 'Type' };
    // component.onSort(column);
    // });
    // it('Sort order should be ASC', () => {
    // expect(column.sorted).toEqual('ASC');
    // });
    // });
    describe('when calling onSort with no sort order', () => {
        beforeEach(() => {
            component.actionEvent = new EventEmitter<any>();
            spyOn(component.actionEvent, 'emit').and.stub();
            let event = {
                item: {
                    CodeButtonType: {
                        CodeCode: 'Text',
                        CodeDescription: { en: 'Text' },
                        _id: 'bcbbd6c5-b2b1-47e4-87d8-bc49883bcde7'
                    },

                    CodeCode: 'Add View',
                    CodeCollapsed: {
                        CodeCode: 'No',
                        CodeDescription: { en: 'No' },
                        _id: '1d6dfcac-fdcf-4a30-b31c-55f90cbdfd1c'
                    },

                    CodeDescription: 'Add View'
                }
            };
            let parent = {
                CodeButtonType: 'Icon and Text',
                CodeCode: 'Views Group',
                CodeCollapsed: 'No',
                CodeDescription: 'Views'
            };
            component.selection(event, parent);
        });
        it('getIndexByProperty method call', () => {
            expect(Utils.getIndexByProperty).toHaveBeenCalled();
        });
        it('emit method call', () => {
            expect(component.actionEvent.emit).toHaveBeenCalled();
        });
    });
    describe('when calling handleAction', () => {
        beforeEach(() => {
            spyOn(component, 'handleFiltersDialogOpen').and.stub();
            spyOn(component, 'handleColumnsDialogOpen').and.stub();
            spyOn(component, 'handleGroubyListDialogOpen').and.stub();
        });
        it('should call handleFiltersDialogOpen Method', () => {
            component.handleAction({ CodeCode: 'Filter List' }, {});
            expect(component.handleFiltersDialogOpen).toHaveBeenCalled();
        });
        it('should call handleColumnsDialogOpen Method', () => {
            component.handleAction({ CodeCode: 'Column List' }, {});
            expect(component.handleColumnsDialogOpen).toHaveBeenCalled();
        });
        it('should call handleGroubyListDialogOpen Method', () => {
            component.handleAction({ CodeCode: 'Select Row Groups' }, {});
            expect(component.handleGroubyListDialogOpen).toHaveBeenCalled();
        });
    });
    describe('when calling handleContextMenu', () => {
        beforeEach(() => {
            let event = { action: {} };
            let task = { codeCode: 'test' };
            component.handleRightClick = new EventEmitter<any>();
            spyOn(component.handleRightClick, 'emit').and.stub();
            component.handleContextMenu(event, task);
        });
        it('calling emit', () => {
            expect(component.handleRightClick.emit).toHaveBeenCalledWith({
                action: { codeCode: 'test' }
            });
        });
    });
    // describe('when calling refreshToolBar', () => {
    //     beforeEach(fakeAsync(() => {
    //         spyOn<any>(component.toolbarInstance, 'refresh').and.stub();
    //         // component.refreshToolBar();
    //     }));

    //     it('calling refresh', fakeAsync(() => {
    //         jasmine.clock().uninstall();
    //         component.refreshToolBar();
    //         jasmine.clock().tick(1000);

    //         expect<any>(component['refresh']).toHaveBeenCalled();
    //         jasmine.clock().uninstall();
    //         flush();
    //     }));
    // });
});
