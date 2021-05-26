import { GanttViewComponent } from './gantt-view.component';
import { TestBed, ComponentFixture, async, inject, fakeAsync, flush } from '@angular/core/testing';
import { GanttComponent } from '@syncfusion/ej2-angular-gantt';
import { NO_ERRORS_SCHEMA, ElementRef, Renderer2, ViewContainerRef } from '@angular/core';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { CollectionsService, RequestHandler, LoginService } from 'src/app/moveware/services';
import { WebApiProvider, WebBaseProvider } from 'src/app/moveware/providers';
import { UserService } from 'src/app/moveware/services/user-service';
import Utils from 'src/app/moveware/services/utils';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import { of, throwError } from 'rxjs';

fdescribe('GanttViewComponent', () => {
    let component: any;
    let fixture: ComponentFixture<GanttViewComponent>;
    let data = [
        {
            expanded: false,
            data: {
                FileNumber: 'JO.000003',
                FileSearchName: 'TEST',
                FileDescription: 'DESCR',
                FileStatus: 'Active',
                DateFrom: '2021-02-17T02:16:33.200+00:00',
                DateTo: '2021-02-16T13:00:00.000Z',
                Children: 0,
                _id: '5ec106ee-66a7-4083-bd60-12042b2cf74f'
            }
        },
        {
            expanded: false,
            data: {
                FileNumber: 'PR-000001',
                FileSearchName: 'John Smith',
                FileDescription: 'Tate Modern Gallery Exhibitions',
                FileStatus: 'Active',
                DateFrom: '2021-02-14T21:00:00.000+00:00',
                DateTo: '2021-02-18T06:00:00.000Z',
                Children: 1,
                _id: '446a695f-b282-49f8-8ed4-20dbcf59ea53'
            },
            children: [
                {
                    data: {
                        FileNumber: 'PR-000005',
                        FileSearchName: 'Tate Moderns',
                        FileDescription: 'Picasso Exhibition',
                        FileStatus: 'Active',
                        DateFrom: '2021-02-11T21:00:00.000+00:00',
                        DateTo: '2021-02-18T06:00:00.000Z',
                        Parents: ['446a695f-b282-49f8-8ed4-20dbcf59ea53'],
                        FileNotes: '<p>Notes</p>',
                        Children: 0,
                        level: 0,
                        _id: 'a85fb1e8-0adf-414a-af49-05d9b2fbadb2'
                    },
                    expanded: false,
                    children: []
                }
            ]
        }
    ];
    let flattenedData = [
        {
            expanded: false,
            FileNumber: 'JO.000003',
            FileSearchName: 'TEST',
            FileDescription: 'DESCR',
            FileStatus: 'Active',
            DateFrom: '2021-02-17T02:16:33.200+00:00',
            DateTo: '2021-02-16T13:00:00.000Z',
            Children: 0,
            _id: '5ec106ee-66a7-4083-bd60-12042b2cf74f'
        },
        {
            expanded: false,
            children: [
                {
                    expanded: false,
                    children: [],
                    FileNumber: 'PR-000005',
                    FileSearchName: 'Tate Moderns',
                    FileDescription: 'Picasso Exhibition',
                    FileStatus: 'Active',
                    DateFrom: '2021-02-11T21:00:00.000+00:00',
                    DateTo: '2021-02-18T06:00:00.000Z',
                    Parents: '446a695f-b282-49f8-8ed4-20dbcf59ea53',
                    FileNotes: '<p>Notes</p>',
                    Children: 0,
                    level: 0,
                    _id: 'a85fb1e8-0adf-414a-af49-05d9b2fbadb2'
                }
            ],
            FileNumber: 'PR-000001',
            FileSearchName: 'John Smith',
            FileDescription: 'Tate Modern Gallery Exhibitions',
            FileStatus: 'Active',
            DateFrom: '2021-02-14T21:00:00.000+00:00',
            DateTo: '2021-02-18T06:00:00.000Z',
            Children: 1,
            _id: '446a695f-b282-49f8-8ed4-20dbcf59ea53'
        }
    ];
    let toolbar = [
        'Add',
        'Edit',
        'Update',
        'Delete',
        'Cancel',
        'ExpandAll',
        'CollapseAll',
        'ExcelExport',
        'CsvExport'
    ];
    let timeline: any = {
        topTier: { unit: 'Week' },
        bottomTier: { unit: 'Day' }
    };
    let timescale: any = [
        { CodeCode: 'Year' },
        { CodeCode: 'Month' },
        { CodeCode: 'Week' },
        { CodeCode: 'Day' },
        { CodeCode: 'Hour' }
    ];
    let columns = [
        {
            CodeCode: 'FileNumber',
            CodeDescription: 'Number',
            CodeCollapsed: 'No',
            CodeEnabled: 'No',
            CodeVisible: true
        },
        {
            CodeCode: 'DateFrom',
            CodeDescription: 'Date From',
            CodeCollapsed: 'No',
            CodeEnabled: 'Yes',
            CodeVisible: true
        },
        {
            CodeCode: 'DateTo',
            CodeDescription: 'Date To',
            CodeCollapsed: 'No',
            CodeEnabled: 'Yes',
            CodeVisible: true
        },
        {
            CodeCode: 'CodeStatus',
            CodeDescription: 'Status',
            CodeCollapsed: 'Yes',
            CodeEnabled: 'Yes',
            CodeVisible: true
        }
    ];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [GanttViewComponent],
            providers: [
                GridService,
                ToastService,
                DialogService,
                DynamicDialogConfig,
                PageMappingService,
                CollectionsService,
                RequestHandler,
                LoginService,
                WebBaseProvider,
                WebApiProvider,
                UserService,
                GanttComponent,
                Renderer2,
                ViewContainerRef,
                { provide: ElementRef, useClass: MockElementRef }
            ],
            imports: [RouterTestingModule, HttpClientModule, TranslateModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(inject([GanttComponent], (gantt: GanttComponent) => {
        fixture = TestBed.createComponent(GanttViewComponent);
        component = fixture.componentInstance;
        component.dataSource = data;
        component.data = null;
        component.taskSettings = null;
        component.columns = null;
        component.splitterSettings = null;
        component.timelineSettings = null;
        component.editSettings = null;
        component.toolbar = null;
        component.metaData = {
            allColumns: columns,
            timeScale: timescale,
            doubleClickAction: true
        };
        component.gantt = gantt;
        component.validUnits = ['Year', 'Month', 'Week', 'Day', 'Hour'];
        component.isExpanded = false;
        component.formAction = null;
        component.currentRecord = null;
        component.currentPage = {
            CodeElement: 'Dummy Code'
        };
    }));
    it('should create component instance', () => {
        expect(component).toBeTruthy;
    });

    describe('when calling getData', () => {
        beforeEach(() => {
            component.metaData = {
                allColumns: '',
                rowHeight: 35,
                headerVisible: false,
                timeScale: timeline,
                gridLines: 'Both',
                rowShading: true
            };
            component.dataSource = flattenedData;
            spyOn(component, 'setTimePeriod').and.stub();
            spyOn(component, 'setToolbarItems').and.returnValue(toolbar);
            spyOn(component, 'setColumns').and.returnValue([{ CodeCode: 'FileType' }]);
            component.getData();
        });

        it('should set data with flattened data', () => {
            expect(component.data).toEqual(flattenedData);
        });

        it('should set taskSettings', () => {
            expect(component.taskSettings).toEqual({
                id: '_id',
                number: 'FileNumber',
                name: 'FileDescription',
                startDate: 'DateFrom',
                endDate: 'DateTo',
                dependency: 'Predecessor',
                child: 'children',
                notes: 'FileNotes'
            });
        });

        it('should set splitterSettings', () => {
            expect(component.splitterSettings).toEqual({ columnIndex: 2 });
        });

        it('should set editSettings', () => {
            expect(component.editSettings).toEqual({
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                showDeleteConfirmDialog: true
            });
        });

        it('should set toolbar', () => {
            expect(component.toolbar).toEqual(toolbar);
        });
    });

    describe('when calling expand', () => {
        beforeEach(() => {
            spyOn(component.gantt, 'collapseAll').and.stub();
            spyOn(component.gantt, 'expandAll').and.stub();
        });

        it('should expand if collapsed', () => {
            component.isExpanded = false;
            component.expand();

            expect(component.gantt.expandAll).toHaveBeenCalled();
        });

        it('should collapse if expanded', () => {
            component.isExpanded = true;
            component.expand();

            expect(component.gantt.collapseAll).toHaveBeenCalled();
        });
    });

    describe('when calling actionComplete', () => {
        let event = { data: ['dummyData'] };
        beforeEach(() => {
            component.formAction = false;
            spyOn(component, 'deleteTask').and.stub();
            spyOn(component, 'addTask').and.stub();
            spyOn(component, 'updateTask').and.stub();
        });

        it('should call deleteTask if action is delete', () => {
            event['requestType'] = 'delete';
            component.actionComplete(event);

            expect(component.deleteTask).toHaveBeenCalledWith(event.data[0]);
            expect(component.formAction).toBeFalsy();
        });

        it('should call addTask if action is add', () => {
            event['requestType'] = 'add';
            component.actionComplete(event);

            expect(component.addTask).toHaveBeenCalledWith(event.data);
            expect(component.formAction).toBeFalsy();
        });

        it('should call updateTask if action is save', () => {
            event['requestType'] = 'save';
            component.actionComplete(event);

            expect(component.updateTask).toHaveBeenCalledWith(event.data);
            expect(component.formAction).toBeFalsy();
        });

        it('should not call any methods otherwise', () => {
            event['requestType'] = 'dummyEvent';
            component.actionComplete(event);

            expect(component.deleteTask).not.toHaveBeenCalled();
            expect(component.addTask).not.toHaveBeenCalled();
            expect(component.updateTask).not.toHaveBeenCalled();
            expect(component.formAction).toBeFalsy();
        });
    });

    describe('when calling onDoubleClick', () => {
        beforeEach(() => {
            spyOn(component.handleAction, 'emit').and.stub();
            spyOn(component.gantt, 'cancelEdit').and.stub();
        });

        it('should cancel current gantt action and emit doubleClickAction', () => {
            component.metaData.doubleClickAction = true;
            component.onDoubleClick({ rowData: 'dummyRowData' });

            expect(component.gantt.cancelEdit).toHaveBeenCalled();
            expect(component.handleAction.emit).toHaveBeenCalledWith({
                action: true,
                event: 'dummyRowData'
            });
        });

        it('should not cancel current gantt action and emit if no doubleClickAction', () => {
            component.metaData.doubleClickAction = false;
            component.onDoubleClick({ rowData: 'dummyRowData' });

            expect(component.gantt.cancelEdit).not.toHaveBeenCalled();
            expect(component.handleAction.emit).not.toHaveBeenCalled();
        });
    });

    describe('when calling toolbarClick', () => {
        beforeEach(() => {
            spyOn(component.gantt, 'excelExport').and.stub();
            spyOn(component.gantt, 'csvExport').and.stub();
            spyOn(component.gantt, 'pdfExport').and.stub();
            spyOn(component, 'setTimePeriod').and.stub();
        });

        it('should set isExpanded to true if Expand All was clicked', () => {
            component.toolbarClick({ item: { text: 'Expand All' } });

            expect(component.isExpanded).toBeTruthy();
        });

        it('should set isExpanded to false if Collapse All was clicked', () => {
            component.toolbarClick({ item: { text: 'Collapse All' } });

            expect(component.isExpanded).toBeFalsy();
        });

        it('should call excelExport if Excel export was clicked', () => {
            component.toolbarClick({ item: { text: 'Excel export' } });

            expect(component.gantt.excelExport).toHaveBeenCalled();
        });

        it('should call csvExport if CSV export was clicked', () => {
            component.toolbarClick({ item: { text: 'CSV export' } });

            expect(component.gantt.csvExport).toHaveBeenCalled();
        });

        it('should call pdfExport if PDF export was clicked', () => {
            component.toolbarClick({ item: { text: 'PDF export' } });

            expect(component.gantt.pdfExport).toHaveBeenCalled();
        });

        it('should call setTimePeriod if one of the timeline options was clicked', () => {
            component.toolbarClick({ item: { text: 'Week' } });

            expect(component.setTimePeriod).toHaveBeenCalledWith('Week');
        });
    });

    describe('when calling onRowSelect', () => {
        beforeEach(() => {
            spyOn(component, 'loadTask').and.stub();

            component.onRowSelect({ data: [] });
        });

        it('should call loadTask with event data', () => {
            expect(component.loadTask).toHaveBeenCalled();
        });
    });

    describe('when calling loadTask', () => {
        let arg = data[0];

        beforeEach(() => {
            spyOn(component.onRecordSelection, 'emit').and.stub();
            spyOn(Utils, 'isObjectsEqual').and.returnValue(false);

            component.currentRecord = arg;
            component.loadTask(arg);
        });

        it('should call emit and set currentRecord', () => {
            expect(component.onRecordSelection.emit).toHaveBeenCalled();
            expect(component.currentRecord).toEqual(arg);
        });
    });

    describe('when calling add', () => {
        beforeEach(() => {
            spyOn(component.gantt, 'addRecord').and.stub();
            component.add('dummyData');
        });

        it('should set formAction to true and add record to gantt', () => {
            expect(component.formAction).toBeTruthy();
            expect(component.gantt.addRecord).toHaveBeenCalledWith('dummyData');
        });
    });

    describe('when calling addTask', () => {
        beforeEach(inject([ToastService], (toastService: ToastService) => {
            spyOn(component.gantt, 'updateTaskId').and.stub();
            spyOn(component.gantt, 'updateRecordByID').and.stub();
            spyOn(component.gantt, 'updateRecordByIndex').and.stub();
            spyOn(component.gantt, 'deleteRecord').and.stub();
            spyOn(component.gantt, 'refresh').and.stub();
            spyOn<any>(component, 'buildReqObject').and.returnValue({
                dummyObject: 'dummy Object'
            });
            spyOn(toastService, 'addErrorMessage').and.stub();
            spyOn(toastService, 'addSuccessMessage').and.stub();
            spyOn(toastService, 'showCustomToast').and.stub();
            spyOn(component, 'selectRow').and.stub();
            jasmine.clock().uninstall();
        }));

        it('should behave this way when everything goes smoothly', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (collectionsService: CollectionsService, toastService: ToastService) => {
                    spyOn(collectionsService, 'addCollectionItem').and.returnValue(
                        of({
                            body: '{ "id" : "dummy id" }'
                        })
                    );

                    component.addTask(data[0]);
                    jasmine.clock().tick(201);

                    expect<any>(component['buildReqObject']).toHaveBeenCalledWith(
                        data[0],
                        'create'
                    );
                    expect(toastService.addSuccessMessage).toHaveBeenCalled();
                    expect(component.gantt.updateRecordByIndex).toHaveBeenCalled();
                    expect(component.selectRow).toHaveBeenCalledWith(0);
                    flush();
                }
            )
        ));

        it('should (also) behave this way when everything goes smoothly', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (collectionsService: CollectionsService, toastService: ToastService) => {
                    spyOn(collectionsService, 'addCollectionItem').and.returnValue(
                        of({ body: '{ "id" : "dummy id" }' })
                    );

                    component.addTask(flattenedData[0]);
                    jasmine.clock().tick(201);

                    expect<any>(component['buildReqObject']).toHaveBeenCalledWith(
                        flattenedData[0],
                        'create'
                    );
                    expect(toastService.addSuccessMessage).toHaveBeenCalled();
                    expect(component.gantt.updateTaskId).toHaveBeenCalled();
                    expect(component.gantt.updateRecordByID).toHaveBeenCalled();
                    expect(component.selectRow).toHaveBeenCalledWith(0);
                    flush();
                }
            )
        ));

        it('should behave this way when collection is not added', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (collectionsService: CollectionsService, toastService: ToastService) => {
                    spyOn(collectionsService, 'addCollectionItem').and.returnValue(of({}));

                    component.addTask(data[0]);

                    expect<any>(component['buildReqObject']).toHaveBeenCalledWith(
                        data[0],
                        'create'
                    );
                    expect(component.gantt.deleteRecord).toHaveBeenCalled();
                    expect(toastService.addErrorMessage).toHaveBeenCalled();
                    flush();
                }
            )
        ));

        it('should behave this way when addCollectionItem api call returns error', inject(
            [CollectionsService, ToastService],
            (collectionsService: CollectionsService, toastService: ToastService) => {
                spyOn(collectionsService, 'addCollectionItem').and.returnValue(
                    throwError({ status: '404' })
                );

                component.addTask(data[0]);

                expect<any>(component['buildReqObject']).toHaveBeenCalledWith(data[0], 'create');
                expect(component.gantt.refresh).toHaveBeenCalled();
                expect(toastService.showCustomToast).toHaveBeenCalled();
            }
        ));
    });

    describe('when calling delete', () => {
        beforeEach(() => {
            spyOn(component.gantt, 'deleteRecord').and.stub();
            spyOn(component, 'selectRow').and.stub();
        });

        it('should call delete record on gantt', fakeAsync(() => {
            jasmine.clock().uninstall();
            component.delete({ index: 0 });
            jasmine.clock().tick(201);

            expect(component.formAction).toBeTruthy();
            expect(component.gantt.deleteRecord).toHaveBeenCalled();
            expect(component.selectRow).toHaveBeenCalled();
        }));
    });

    describe('when calling deleteTask', () => {
        beforeEach(fakeAsync(
            inject([ToastService], (toastService: ToastService) => {
                spyOn(component.gantt, 'refresh').and.stub();
                spyOn<any>(component, 'buildReqObject').and.returnValue({
                    dummyObject: 'dummy Object'
                });
                spyOn(toastService, 'addSuccessMessage').and.stub();
                spyOn(toastService, 'showCustomToast').and.stub();
                spyOn(component, 'selectRow').and.stub();
                jasmine.clock().uninstall();
            })
        ));

        it('should behave this way when everything goes smoothly', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (collectionsService: CollectionsService, toastService: ToastService) => {
                    spyOn(collectionsService, 'removeCollectionItem').and.returnValue(of({}));

                    component.deleteTask(data[0]);
                    jasmine.clock().tick(201);

                    expect<any>(component['buildReqObject']).toHaveBeenCalledWith(
                        data[0],
                        'delete'
                    );
                    expect(toastService.addSuccessMessage).toHaveBeenCalled();
                    expect<any>(component.selectRow).toHaveBeenCalled();
                    jasmine.clock().uninstall();
                    flush();
                }
            )
        ));

        it('should behave this way when removeCollectionItem api call returns error', inject(
            [CollectionsService, ToastService],
            (collectionsService: CollectionsService, toastService: ToastService) => {
                spyOn(collectionsService, 'removeCollectionItem').and.returnValue(
                    throwError({ status: '404' })
                );

                component.deleteTask(data[0]);

                expect<any>(component['buildReqObject']).toHaveBeenCalledWith(data[0], 'delete');
                expect(component.gantt.refresh).toHaveBeenCalled();
                expect(toastService.showCustomToast).toHaveBeenCalled();
            }
        ));
    });

    describe('when calling updateRecord', () => {
        it('should update record on gantt', () => {
            spyOn(component.gantt, 'updateRecordByID').and.stub();

            component.updateRecord({});

            expect(component.formAction).toBeTruthy();
            expect(component.gantt.updateRecordByID).toHaveBeenCalled();
        });
    });

    describe('when calling updateTask', () => {
        beforeEach(inject([ToastService], (toastService: ToastService) => {
            spyOn(component.gantt, 'refresh').and.stub();
            spyOn<any>(component, 'buildReqObject').and.returnValue({
                dummyObject: 'dummy Object'
            });
            spyOn(toastService, 'addSuccessMessage').and.stub();
            spyOn(toastService, 'showCustomToast').and.stub();
            spyOn(component, 'loadTask').and.stub();
        }));

        it('should behave this way when everything goes smoothly', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (collectionsService: CollectionsService, toastService: ToastService) => {
                    spyOn(collectionsService, 'updateCollectionItem').and.returnValue(of({}));

                    component.updateTask(data[0]);

                    expect<any>(component['buildReqObject']).toHaveBeenCalledWith(data[0]);
                    expect(toastService.addSuccessMessage).toHaveBeenCalled();
                    expect(component.loadTask).toHaveBeenCalled();
                    flush();
                }
            )
        ));

        it('should behave this way when updateCollectionItem api call returns error', inject(
            [CollectionsService, ToastService],
            (collectionsService: CollectionsService, toastService: ToastService) => {
                spyOn(collectionsService, 'updateCollectionItem').and.returnValue(
                    throwError({ status: '404' })
                );

                component.updateTask(data[0]);

                expect<any>(component['buildReqObject']).toHaveBeenCalledWith(data[0]);
                expect(component.gantt.refresh).toHaveBeenCalled();
                expect(toastService.showCustomToast).toHaveBeenCalled();
            }
        ));
    });

    describe('when calling setTimePeriod', () => {
        let spyObj: jasmine.Spy;

        beforeEach(() => {
            component.gantt = null;
            spyObj = spyOn<any>(component, 'setTimePeriod').and.callThrough();
        });

        it('should return timelineSetting', () => {
            spyObj.call(component, 'Week');

            expect(component.timelineSettings).toEqual(timeline);
        });

        it('should only return toptier when set to Hour', () => {
            spyObj.call(component, 'Hour');

            expect(component.timelineSettings).toEqual({
                topTier: { unit: 'Hour' },
                bottomTier: { unit: 'None' }
            });
        });
    });

    describe('when calling setToolbarItems', () => {
        let spyObj: jasmine.Spy;

        beforeEach(() => {
            spyObj = spyOn<any>(component, 'setToolbarItems').and.callThrough();
        });

        it('should return toolbar', () => {
            let result = spyObj.call(component);
            let timeline = [];
            timescale.forEach((obj) => {
                timeline.push({
                    text: obj.CodeCode,
                    tooltipText: obj.CodeCode,
                    id: obj.CodeCode,
                    align: 'right'
                });
            });
            expect(result).toEqual(toolbar.concat(timeline));
        });
    });

    describe('when calling setColumns', () => {
        let spyObj: jasmine.Spy;

        beforeEach(() => {
            spyObj = spyOn<any>(component, 'setColumns').and.callThrough();
        });

        it('should return columns', () => {
            let result = spyObj.call(component, columns);

            expect(result).toEqual([
                { field: '_id', isPrimaryKey: true, visible: false },
                {
                    field: 'FileNumber',
                    headerText: 'Number',
                    visible: true,
                    allowEditing: false
                },
                {
                    field: 'DateFrom',
                    headerText: 'Date From',
                    visible: true,
                    allowEditing: true
                },
                {
                    field: 'DateTo',
                    headerText: 'Date To',
                    visible: true,
                    allowEditing: true
                },
                {
                    field: 'CodeStatus',
                    headerText: 'Status',
                    visible: false,
                    allowEditing: true
                }
            ]);
        });
    });

    describe('when calling selecteRow', () => {
        let spyObj: jasmine.Spy;

        beforeEach(() => {
            spyOn(component.gantt, 'selectRow').and.stub();

            spyObj = spyOn<any>(component, 'selectRow').and.callThrough();
        });

        it('should call selectRow on the gantt component', () => {
            spyObj.call(component, null);

            expect(component.gantt.selectRow).toHaveBeenCalled();
        });
    });

    describe('when setting dataSource', () => {
        it('should flatten the data before assigning to dataSource', () => {
            component.setDataSource = [
                {
                    expanded: false,
                    data: {
                        FileNumber: 'JO.000003',
                        FileSearchName: 'TEST',
                        FileDescription: 'DESCR',
                        FileStatus: 'Active',
                        DateFrom: '2021-02-17T02:16:33.200+00:00',
                        DateTo: '2021-02-16T13:00:00.000Z',
                        Children: 0,
                        _id: '5ec106ee-66a7-4083-bd60-12042b2cf74f'
                    }
                }
            ];

            expect(component.dataSource).toEqual([
                {
                    expanded: false,
                    FileNumber: 'JO.000003',
                    FileSearchName: 'TEST',
                    FileDescription: 'DESCR',
                    FileStatus: 'Active',
                    DateFrom: '2021-02-17T02:16:33.200+00:00',
                    DateTo: '2021-02-16T13:00:00.000Z',
                    Children: 0,
                    _id: '5ec106ee-66a7-4083-bd60-12042b2cf74f'
                }
            ]);
        });
    });

    xdescribe('when calling buildReqObject', () => {
        let spyObj: jasmine.Spy;
        let data = flattenedData;

        beforeEach(inject([UserService], (userService: UserService) => {
            spyObj = spyOn<any>(component, 'buildReqObject').and.callThrough();
            spyOn(userService, 'getUserId').and.returnValue('dummy user');
            data[0]['_id'] = 'dummy id';
        }));

        it('should return this request object when type is create', inject(
            [UserService],
            (userService: UserService) => {
                let requestObject = spyObj.call(component, data[0], 'create');

                expect<any>(userService['getUserId']).toHaveBeenCalled();
                expect(requestObject).toEqual({
                    meta: {
                        viewId: 'viewId',
                        userId: 'dummy user'
                    },
                    payload: {
                        DateFrom: data[0].DateFrom,
                        DateTo: data[0].DateTo,
                        FileDescription: data[0].FileDescription,
                        FileType: StandardCodesIds.FILE_TYPE_APPOINTMENT_ID,
                        FileStatus: StandardCodesIds.ACTIVE_STATUS_ID
                    },
                    userId: 'dummy user',
                    type: 'dummy type'
                });
            }
        ));

        it('should return this request object when type is delete', inject(
            [UserService],
            (userService: UserService) => {
                let requestObject = spyObj.call(component, data[0], 'delete');

                expect<any>(userService['getUserId']).toHaveBeenCalled();
                expect(requestObject).toEqual({
                    meta: {
                        viewId: 'viewId',
                        userId: 'dummy user'
                    },
                    type: 'dummy type',
                    _id: 'dummy id'
                });
            }
        ));

        it('should return this request object when type is neither create or delete', inject(
            [UserService],
            (userService: UserService) => {
                let requestObject = spyObj.call(component, data[0]);

                expect<any>(userService['getUserId']).toHaveBeenCalled();
                expect(requestObject).toEqual({
                    meta: {
                        viewId: 'viewId',
                        userId: 'dummy user'
                    },
                    payload: {
                        DateFrom: data[0].DateFrom,
                        DateTo: data[0].DateTo,
                        FileDescription: data[0].FileDescription
                    },
                    type: 'dummy type',
                    _id: 'dummy id'
                });
            }
        ));
    });
});

export class MockElementRef extends ElementRef {
    constructor() {
        super(null);
    }
}
