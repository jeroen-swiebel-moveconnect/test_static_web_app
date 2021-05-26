import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { DynamicFormComponent } from './dynamic-form.component';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('DynamicFormComponent', () => {
    let component: any;
    let fixture: ComponentFixture<DynamicFormComponent>;
    beforeEach(async () => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [DynamicFormComponent],
            providers: [FormBuilder],
            imports: [FormsModule, TranslateModule.forRoot(), TestingModule]
        });
        fixture = TestBed.createComponent(DynamicFormComponent);
        component = fixture.componentInstance;
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    it('CodeFields defaults to: []', () => {
        expect(component.CodeFields).toEqual([]);
    });

    describe('when calling createControl method', () => {
        let someObject;
        beforeEach(() => {
            component.fb = TestBed.get(FormBuilder);
            someObject = { addControl: () => {} };
            spyOn(component, 'bindValidations').and.stub();
            spyOn(component.fb, 'group').and.returnValue(someObject);
            spyOn(someObject, 'addControl').and.stub();
            component.CodeFields = [new testInterface()];
        });
        it('should call this.bindValidations', () => {
            component.CodeFields[0].CodeType = 'button';
            component.createControl();
            expect(component.bindValidations).not.toHaveBeenCalled();
        });
        it('should call this.fb.group', () => {
            component.CodeFields[0].CodeType = 'button';
            component.createControl();
            expect(someObject.addControl).not.toHaveBeenCalled();
        });
        it('should call this.fb.group', () => {
            component.CodeFields[0].CodeType = 'button';
            component.createControl();
            expect(component.fb.group).toHaveBeenCalled();
        });
        it('should call bindValidations method ...', () => {
            component.CodeFields[0].CodeType = '';
            component.createControl();
            expect(component.bindValidations).toHaveBeenCalled();
        });
        it('should call addControl..', () => {
            component.CodeFields[0].CodeType = '';
            component.createControl();
            expect(someObject.addControl).toHaveBeenCalled();
        });
    });

    describe('method==> onSubmit()', () => {
        it('should have method', () => {
            expect(component.createControl).toBeTruthy;
        });
        describe('when calling method', () => {
            let event;
            beforeEach(() => {
                let controls: any = {
                    controls: {
                        setParent: () => {},
                        _registerOnCollectionChange: () => {},
                        markAsTouched: () => {},
                        valid: Boolean
                    }
                };
                event = {
                    preventDefault: () => {},
                    stopPropagation: () => {}
                };
                let form: FormGroup = new FormGroup(controls);
                component.form = form;
                component.submit = new EventEmitter<any>();
                spyOn(component, 'validateAllFormFields').and.stub();
                spyOn(component.submit, 'emit').and.stub();
            });

            it('should emit output data(submit)', () => {
                component.form = component.form = { valid: true, value: { someVlaues: 'value' } };
                component.onSubmit(event);
                expect(component.submit.emit).toHaveBeenCalledWith({ someVlaues: 'value' });
            });
            it('should emit output data(submit)', () => {
                component.form = { valid: false };
                component.onSubmit(event);
                expect(component.validateAllFormFields).toHaveBeenCalledWith({ valid: false });
            });
        });
    });

    describe('when calling validateAllFormFields() method', () => {
        let responseObject;
        let parametersFormGRoup;
        beforeEach(() => {
            parametersFormGRoup = {
                controls: { key: 'values' },
                get: (fields: any) => {}
            };
            responseObject = {
                markAsTouched: (data) => {}
            };
            spyOn(Object, 'keys').and.returnValue(['keyvalues']);
            spyOn(parametersFormGRoup, 'get').and.returnValue(responseObject);
            spyOn(responseObject, 'markAsTouched').and.stub();
            component.validateAllFormFields(parametersFormGRoup);
        });
        it('should behave...', () => {
            expect(Object.keys).toHaveBeenCalled();
        });
        it('should behave...', () => {
            expect(parametersFormGRoup.get).toHaveBeenCalled();
        });
        it('should behave...', () => {
            expect(responseObject.markAsTouched).toHaveBeenCalled();
        });
    });
});
