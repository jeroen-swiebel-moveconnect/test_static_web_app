import { PivotComponent } from './pivot.component';
import { TestBed, ComponentFixture, inject, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ElementRef, Renderer2, ViewContainerRef } from '@angular/core';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import {
    DisplayOption,
    EnginePopulatedEventArgs,
    FieldListService,
    PivotChartService,
    PivotFieldListComponent,
    PivotViewComponent,
    ToolbarItems,
    ToolbarService
} from '@syncfusion/ej2-angular-pivotview';
import { ChartSettings } from '@syncfusion/ej2-pivotview/src/pivotview/model/chartsettings';
import Utils from 'src/app/moveware/services/utils';
import { TestingModule } from '../../../../app-testing.module';

fdescribe('PivotComponent', () => {
    let component: any;
    let fixture: ComponentFixture<PivotComponent>;
    let dummyData: any[] = [
        {
            id: '1',
            name: { CodeCode: 'data 1' },
            value: 123
        },
        {
            id: '2',
            name: { CodeCode: 'data 2' },
            value: 234
        },
        {
            id: '3',
            name: { CodeCode: 'data 3' },
            value: 345
        }
    ];
    let dummyColumns: any[] = [
        {
            CodeCode: 'Column1',
            CodeDescription: 'Column 1',
            CodeGroupBy: 'None',
            CodeAggregate: { CodeCode: 'Sum' }
        },
        {
            CodeCode: 'Column2',
            CodeDescription: 'Column 2',
            CodeGroupBy: 'Column'
        },
        {
            CodeCode: 'Column3',
            CodeDescription: 'Column 3',
            CodeGroupBy: 'Row'
        }
    ];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [PivotComponent],
            providers: [
                GridService,
                ToastService,
                DialogService,
                DynamicDialogConfig,
                PageMappingService,
                DisplayOption,
                PivotChartService,
                FieldListService,
                ChartSettings,
                PivotFieldListComponent,
                PivotViewComponent,
                Renderer2,
                ViewContainerRef,
                ToolbarService,
                { provide: ElementRef, useClass: MockElementRef }
            ],
            imports: [
                RouterTestingModule,
                HttpClientModule,
                TranslateModule.forRoot(),
                TestingModule
            ]
        }).compileComponents();
    }));
    beforeEach(inject(
        [PivotFieldListComponent, PivotViewComponent],
        (fieldList: PivotFieldListComponent, pivot: PivotViewComponent) => {
            let toolbarOptions: ToolbarItems[] = [
                'Grid',
                'Chart',
                'Export',
                'SubTotal',
                'GrandTotal',
                'Formatting',
                'FieldList'
            ];
            fixture = TestBed.createComponent(PivotComponent);
            component = fixture.componentInstance;
            component.dataSource = dummyData;
            component.selectedGroups = [];
            component.defaultGroupBy = dummyColumns;
            component.selectedColumns = dummyColumns;
            component.selectedRows = [];
            component.selectedValues = [];
            component.dataSourceSettings = null;
            component.currentPage = { CodeCode: 'Dummy Pivot View' };
            component.chartSettings = null;
            component.toolbarOptions = toolbarOptions;
            component.fieldList = fieldList;
            component.pivot = pivot;
            component.viewMode = null;
            component.allExpand = true;
            component.metaData = { isCollapsed: false };
        }
    ));
    it('should create component instance', () => {
        expect(component).toBeTruthy;
    });

    describe('when calling ngOnInit', () => {
        beforeEach(() => {
            spyOn<any>(component, 'setPivotData').and.returnValue({});
            spyOn(component, 'setFieldList').and.returnValue([{ id: 1, name: 'name' }]);
            spyOn(Utils, 'flattenObject').and.returnValue([{ id: 1, name: 'name' }]);

            component.ngOnInit();
        });

        it('should set values, columns and rows for the pivot table', () => {
            expect(component.selectedValues).toEqual([dummyColumns[0]]);
            expect(component.selectedGroups).toEqual([dummyColumns[1]]);
            expect(component.selectedRows).toEqual([dummyColumns[2]]);
        });

        it('should call setPivotData and set the dataSourceSettings', () => {
            expect<any>(component['setPivotData']).toHaveBeenCalledWith(component.selectedGroups);
            expect<any>(component['setPivotData']).toHaveBeenCalledWith(component.selectedRows);
            expect<any>(component['setPivotData']).toHaveBeenCalledWith(component.selectedValues);
            expect(component.dataSourceSettings).toEqual({
                dataSource: [{ id: 1, name: 'name' }],
                expandAll: true,
                columns: {},
                values: {},
                rows: {}
            });
        });
    });

    describe('when calling beforeToolbarRender', () => {
        it('should put add custom expand button before fieldList', () => {
            let toolbar: any = {
                customToolbar: [
                    'Grid',
                    'Chart',
                    'Export',
                    'SubTotal',
                    'GrandTotal',
                    'Formatting',
                    'FieldList'
                ]
            };
            component.beforeToolbarRender(toolbar);

            expect(toolbar).toEqual({
                customToolbar: [
                    'Grid',
                    'Chart',
                    'Export',
                    'SubTotal',
                    'GrandTotal',
                    'Formatting',
                    {
                        prefixIcon: 'e-tool-expand e-icons',
                        tooltipText: 'Expand/Collapse',
                        click: jasmine.any(Function)
                    },
                    'FieldList'
                ]
            });
        });
    });

    describe('when calling expandAll', () => {
        it('should set expandAll to true', () => {
            component.allExpanded = false;
            component.expandAll();

            expect(component.pivot.dataSourceSettings.drilledMembers).toEqual([]);
            expect(component.pivot.dataSourceSettings.expandAll).toBeTruthy();
            expect(component.allExpanded).toBeTruthy();
        });
    });

    describe('when calling expandSpecific', () => {
        beforeEach(() => {
            spyOn(component.pivot, 'refresh').and.stub();
        });

        it('should refresh pivot component', () => {
            component.expandSpecific('Rows');

            expect(component.pivot.refresh).toHaveBeenCalled();
        });
    });

    describe('when calling expand', () => {
        beforeEach(() => {
            spyOn(component.pivot, 'refresh').and.stub();
            spyOn(component, 'expandAll').and.stub();
            spyOn(component, 'expandSpecific').and.stub();
        });

        it('should call expandAll when All is passed', () => {
            component.expand('All');

            expect(component.expandAll).toHaveBeenCalledWith('All');
        });

        it('should call expandSpecific when Rows is passed', () => {
            component.expand('Rows');

            expect(component.expandSpecific).toHaveBeenCalledWith('Rows');
        });

        it('should call expandSpecific when Columns is passed', () => {
            component.expand('Columns');

            expect(component.expandSpecific).toHaveBeenCalledWith('Columns');
        });

        it('should not call anything otherwise', () => {
            component.expand('wtf');

            expect(component.expandAll).not.toHaveBeenCalled();
            expect(component.expandSpecific).not.toHaveBeenCalled();
        });
    });

    describe('when calling afterEnginePopulate', () => {
        beforeEach(() => {
            spyOn(component.fieldList, 'update').and.stub();
            component.pivot['engineModule'] = {
                fieldList: {
                    Column1: { caption: 'Column1' },
                    Column2: { caption: 'Column2' },
                    Column3: { caption: 'Column3' }
                }
            };
            component.afterEnginePopulate();
        });

        it('should call update method on fieldlist', () => {
            expect(component.fieldList.update).toHaveBeenCalled();
        });
    });

    xdescribe('when calling setPivotData', () => {
        let spyObj: jasmine.Spy;
        let values = dummyColumns;
        let result;
        beforeEach(() => {
            spyObj = spyOn<any>(component, 'setPivotData').and.callThrough();
        });
        it('should return data matching pivot view properties if not empty', () => {
            result = spyObj.call(component, dummyColumns);

            expect(result).toEqual([
                { name: 'Column1', caption: 'Column 1', type: 'Sum' },
                { name: 'Column2', caption: 'Column 2' },
                { name: 'Column3', caption: 'Column 3' }
            ]);
        });

        it('should return data value with Avg if called with Average', () => {
            values = [
                {
                    CodeCode: 'Column1',
                    CodeDescription: 'Column 1',
                    CodeAggregate: {
                        CodeCode: 'Average'
                    }
                }
            ];
            result = spyObj.call(component, values);

            expect(result).toEqual([{ name: 'Column1', caption: 'Column 1', type: 'Avg' }]);
        });

        it('should return data value with Min if called with Minimum', () => {
            values = [
                {
                    CodeCode: 'Column1',
                    CodeDescription: 'Column 1',
                    CodeAggregate: {
                        CodeCode: 'Minimum'
                    }
                }
            ];
            result = spyObj.call(component, values);

            expect(result).toEqual([{ name: 'Column1', caption: 'Column 1', type: 'Min' }]);
        });

        it('should return data value with Max if called with Maximum', () => {
            values = [
                {
                    CodeCode: 'Column1',
                    CodeDescription: 'Column 1',
                    CodeAggregate: {
                        CodeCode: 'Maximum'
                    }
                }
            ];
            result = spyObj.call(component, values);

            expect(result).toEqual([{ name: 'Column1', caption: 'Column 1', type: 'Max' }]);
        });

        it('should return data value with DistinctCount if called with Distinct Count', () => {
            values = [
                {
                    CodeCode: 'Column1',
                    CodeAggregate: {
                        CodeCode: 'Distinct Count'
                    }
                }
            ];
            result = spyObj.call(component, values);

            expect(result).toEqual([
                { name: 'Column1', caption: 'Column1', type: 'DistinctCount' }
            ]);
        });

        it('should return blank array if input is blank or null', () => {
            let result = spyObj.call(component, []);

            expect(result).toEqual([]);
        });
    });

    describe('when calling setViewMode', () => {
        beforeEach(() => {
            component.setViewMode = [];
        });
        it('should set viewMode', () => {
            expect(component.viewMode).toEqual([]);
        });
    });

    describe('when calling setSelectedColumns', () => {
        beforeEach(() => {
            component.selectedColumns = [];
            component.setSelectedColumns = dummyColumns;
        });
        it('should set selectedColumns', () => {
            expect(component.selectedColumns).toEqual(dummyColumns);
        });
    });

    describe('when calling setDataSource', () => {
        beforeEach(() => {
            component.dataSource = [];
            component.setDataSource = dummyData;
        });
        it('should set dataSource', () => {
            expect(component.dataSource).toEqual(dummyData);
        });
    });

    describe('when calling displayGrandTotals', () => {
        beforeEach(inject([ToastService], (toastService: ToastService) => {
            spyOn(toastService, 'addErrorMessage').and.stub();
            spyOn(component.pivot, 'refresh').and.stub();
        }));

        it('should set showGrandTotals to true when All is passed', () => {
            component.displayGrandTotals({
                CodeCode: 'All'
            });

            expect(component.pivot.dataSourceSettings.showGrandTotals).toBeTruthy();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should set showRowGrandTotals to be true when Rows Only is passed', () => {
            component.displayGrandTotals({
                CodeCode: 'Rows Only'
            });

            expect(component.pivot.dataSourceSettings.showGrandTotals).toBeTruthy();
            expect(component.pivot.dataSourceSettings.showColumnGrandTotals).toBeFalsy();
            expect(component.pivot.dataSourceSettings.showRowGrandTotals).toBeTruthy();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should set showGrandTotals to false when None is passed', () => {
            component.displayGrandTotals({
                CodeCode: 'None'
            });

            expect(component.pivot.dataSourceSettings.showGrandTotals).toBeFalsy();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should set showColumnGrandTotals to be true when Columns Only is passed', () => {
            component.displayGrandTotals({
                CodeCode: 'Columns Only'
            });

            expect(component.pivot.dataSourceSettings.showGrandTotals).toBeTruthy();
            expect(component.pivot.dataSourceSettings.showRowGrandTotals).toBeFalsy();
            expect(component.pivot.dataSourceSettings.showColumnGrandTotals).toBeTruthy();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should show error when anything else is passed', inject(
            [ToastService],
            (toastService: ToastService) => {
                component.displayGrandTotals({
                    CodeCode: 'wtf'
                });

                expect(toastService.addErrorMessage).toHaveBeenCalled();
            }
        ));
    });

    describe('when calling displaySubTotals', () => {
        beforeEach(inject([ToastService], (toastService: ToastService) => {
            spyOn(toastService, 'addErrorMessage').and.stub();
            spyOn(component.pivot, 'refresh').and.stub();
        }));

        it('should set showSubTotals to true when All is passed', () => {
            component.displaySubTotals({
                CodeCode: 'All'
            });

            expect(component.pivot.dataSourceSettings.showSubTotals).toBeTruthy();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should set showSubTotals to false when None is passed', () => {
            component.displaySubTotals({
                CodeCode: 'None'
            });

            expect(component.pivot.dataSourceSettings.showSubTotals).toBeFalsy();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should set showColumnSubTotals to be true when Columns Only is passed', () => {
            component.displaySubTotals({
                CodeCode: 'Columns Only'
            });

            expect(component.pivot.dataSourceSettings.showSubTotals).toBeTruthy();
            expect(component.pivot.dataSourceSettings.showRowSubTotals).toBeFalsy();
            expect(component.pivot.dataSourceSettings.showColumnSubTotals).toBeTruthy();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should set showRowSubTotals to be true when Rows Only is passed', () => {
            component.displaySubTotals({
                CodeCode: 'Rows Only'
            });

            expect(component.pivot.dataSourceSettings.showSubTotals).toBeTruthy();
            expect(component.pivot.dataSourceSettings.showColumnSubTotals).toBeFalsy();
            expect(component.pivot.dataSourceSettings.showRowSubTotals).toBeTruthy();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should show error when anything else is passed', inject(
            [ToastService],
            (toastService: ToastService) => {
                component.displaySubTotals({
                    CodeCode: 'wtf'
                });

                expect(toastService.addErrorMessage).toHaveBeenCalled();
            }
        ));
    });

    describe('when calling loadView', () => {
        beforeEach(inject([ToastService], (toastService: ToastService) => {
            spyOn(component.pivot, 'setProperties').and.stub();
            spyOn(component.pivot, 'refresh').and.stub();
            spyOn(toastService, 'addErrorMessage').and.stub();
        }));

        it('should set pivot to Table when view is Table or Grid', () => {
            component.loadView({
                CodeCode: 'Table'
            });

            expect(component.pivot.currentView).toEqual('Table');
            expect(component.pivot.setProperties).toHaveBeenCalled();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should set pivot to Chart when view is a valid chart', () => {
            component.loadView('Column');

            expect(component.pivot.currentView).toEqual('Chart');
            expect(component.pivot.setProperties).toHaveBeenCalled();
            expect(component.pivot.refresh).toHaveBeenCalled();
        });

        it('should set pivot to Chart when view is invalid', inject(
            [ToastService],
            (toastService: ToastService) => {
                component.loadView('wtf');

                expect(component.pivot.setProperties).not.toHaveBeenCalled();
                expect(toastService.addErrorMessage).toHaveBeenCalled();
            }
        ));
    });
});

export class MockElementRef extends ElementRef {
    constructor() {
        super(null);
    }
}
