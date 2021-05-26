import { ComponentFixture, fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA, Renderer2, ViewContainerRef } from '@angular/core';
import { EventsListenerService } from 'src/app/moveware/services';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { TestingModule } from '../../../app-testing.module';
import { QueryBuilder } from './query-builder.component';
import { ContextService } from 'src/app/moveware/services/context.service';
import { QueryBuilderComponent } from '@syncfusion/ej2-angular-querybuilder';
import { CollectionsService } from '../../../services';
import { of } from 'rxjs';
fdescribe('Query Builder', () => {
    let component: QueryBuilder;
    let fixture: ComponentFixture<QueryBuilder>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [QueryBuilder],
            providers: [
                QueryBuilderComponent,
                Renderer2,
                ViewContainerRef,
                CollectionsService,
                { provide: ElementRef, useClass: MockElementRef }
            ],
            imports: [TestingModule]
        }).compileComponents();
    });

    beforeEach(inject([QueryBuilderComponent], (qryBldrObj1: QueryBuilderComponent) => {
        fixture = TestBed.createComponent(QueryBuilder);
        component = fixture.componentInstance;
        component['field'] = new testInterface();
        component.field.options = [
            { CodeDescription: 'Account Category', _id: '4f2a23c9-ee79-431b-8a67-4e6996adf158' },
            { CodeDescription: 'Account Group', _id: '5678cbc3-b5b5-4d33-a44f-253f98fc5bc4' }
        ];
        // @ViewChild('querybuilder') qryBldrObj: QueryBuilderComponent;
        component.qryBldrObj = qryBldrObj1;
        component.currentView = { _id: '' };
    }));
    it('should initialise the query builder component', () => {
        expect(component).toBeDefined();
    });

    // describe('when calling setField', () => {
    //     beforeEach(() => {
    //         spyOn<any>(component, 'loadDynamicFields').and.stub();
    //     });
    //     it('should set rulesdata', () => {
    //         const field = {
    //             CodeValue: {
    //                 condtion: 'And',
    //                 rules: [
    //                     {
    //                         label: 'Account',
    //                         field: 'Account',
    //                         operator: 'equals',
    //                         value: '123'
    //                     }
    //                 ]
    //             }
    //         };
    //         component.setField = field;

    //         expect(component.rulesData).toEqual(field.CodeValue);
    //     });
    // });
    describe('when calling markDirty', () => {
        let markDirtySpy: jasmine.Spy;

        beforeEach(() => {
            markDirtySpy = spyOn<any>(component, 'markDirty').and.callThrough();
        });

        it('should call saveDataChangeState', inject(
            [ContextService],
            (contextService: ContextService) => {
                spyOn(contextService, 'saveDataChangeState').and.stub();
                component.currentView['CodeType'] = 'Data Form';
                markDirtySpy.call(component);
                expect(contextService.saveDataChangeState).toHaveBeenCalled();
                expect(component.field['isDirty']).toBe(true);
            }
        ));
    });

    // operatorChange
    describe('when calling operator method', () => {
        let changeSpy;
        beforeEach(() => {
            // @ViewChild('querybuilder') _qryBldrObj: QueryBuilderComponent;

            changeSpy = spyOn<any>(component, 'change').and.stub();
            changeSpy = spyOn<any>(component.qryBldrObj, 'notifyChange').and.stub();
            let e = { value: '', element: '<div></div>', isInteracted: true };
            component.operatorChange(e, {});
        });
        it('should call change method', () => {
            expect(changeSpy).toHaveBeenCalled();
        });
        it('should call change method', () => {
            expect(component.qryBldrObj.notifyChange).toHaveBeenCalled();
        });
    });

    // describe('when calling handleRuleChange method', () => {
    //     let changeSpy;
    //     beforeEach(() => {
    //         changeSpy = spyOn<any>(component.qryBldrObj, 'setRules').and.callThrough();
    //         let e = { value: '', element: '<div></div>',type:"insertRule" };
    //         component.handleRuleChange(e);
    //     });
    //     it('should call change method', () => {
    //         expect(component.qryBldrObj.setRules).toHaveBeenCalled();
    //     });
    // });

    describe('when calling loadOperators method', () => {
        let loadOperatorsSpy;
        let operators;
        beforeEach(() => {
            loadOperatorsSpy = spyOn<any>(component, 'loadOperators').and.callThrough();
            operators = [{ CodeCode: '=' }, { CodeCode: '>=' }];
        });

        // it('should behave this way when everything goes smoothly', fakeAsync(
        //     inject([CollectionsService], (collectionsService: CollectionsService) => {
        //         spyOn(collectionsService, 'loadCodes').and.returnValue(operators);

        //         //  component.loadOperators();
        //         jasmine.clock().tick(201);

        //         expect<any>(component.operators).toEqual(operators);

        //         flush();
        //     })
        // ));
    });

    describe('when calling onRemove', () => {
        let markDirtySpy: jasmine.Spy;

        beforeEach(() => {
            markDirtySpy = spyOn<any>(component, 'onRemove').and.callThrough();
        });

        it('should call saveDataChangeState', inject(
            [ContextService],
            (contextService: ContextService) => {
                spyOn(contextService, 'saveDataChangeState').and.stub();
                component.currentView['CodeType'] = 'Data Form';
                markDirtySpy.call(component);
                expect(contextService.saveDataChangeState).toHaveBeenCalled();
            }
        ));
        it('fields value ', () => {
            component.onRemove();
            expect(component.field['isDirty']).toBe(true);
            expect(component.field.CodeValue).toBe(null);
            expect(component.sqlRule).toBe('');
        });
    });
});

export class MockElementRef extends ElementRef {
    constructor() {
        super(null);
    }
}
