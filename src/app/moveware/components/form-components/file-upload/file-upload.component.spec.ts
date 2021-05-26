import { ComponentFixture, TestBed, inject, fakeAsync, async } from '@angular/core/testing';

import { FileUploadComponent } from './file-upload.component';
import { CollectionsService, EventsListenerService } from 'src/app/moveware/services';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { HttpClientModule } from '@angular/common/http';
import { ThemesService } from 'src/app/moveware/services/themes-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { of } from 'rxjs';
import { GridService } from 'src/app/moveware/services/grid-service';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('FileUploadComponent', () => {
    let component: any;
    let fixture: ComponentFixture<FileUploadComponent>;
    let fileUploadFiled: any;
    let event: any;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FileUploadComponent],
            imports: [TestingModule],
            providers: [
                GridService,
                ToastService,
                CollectionsService,
                WebBaseProvider,
                ThemesService
            ]
        }).compileComponents();
    }));

    beforeEach(async () => {
        fixture = TestBed.createComponent(FileUploadComponent);
        component = fixture.componentInstance;
        fileUploadFiled = {
            code: 'Code.Field.Logo',
            collections: {},
            description: 'Logo',
            formControl: 'file-upload',
            inputType: undefined,
            isDirty: false,
            module: 'Module.Codes',
            name: 'logo',
            options: [],
            originalValue: null,
            required: undefined,
            tooltip: 'The logo for a theme.',
            type: 'file-upload',
            validations: [],
            value: null,
            visible: true,
            CodeValue: {}
        };
        component.field = fileUploadFiled;
        fixture.detectChanges();
        let createFile = (size = 44320, name = 'ecp-logo.png', type = 'image/png') =>
            new File([new ArrayBuffer(size)], name, {
                type: type
            });
        event = {
            target: {
                files: [createFile]
            }
        };
        fixture.detectChanges();
    });

    it('Fileupload component reference should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('when calling markdirty', () => {
        let eventsListener: EventsListenerService;
        beforeEach(() => {
            eventsListener = TestBed.get(EventsListenerService);
            component.globalEventsNames = [
                'dummyTestEventNameToSatisfyIfConditionOfMarkDirtyMethod'
            ];
            component.field.name = 'dummyTestNameToSatisfyIfConditionOfMarkDirtyMethod';
            spyOn(eventsListener, 'onEventUpdate').and.stub();
        });
        it('should have markDirty and should call eventsListener.onEventUpdate', () => {
            expect(eventsListener.onEventUpdate).toHaveBeenCalled();
        });
    });
    describe('when calling setField', () => {
        it('should set relevant fields', () => {
            const field = { CodeValue: { FileSearchName: 'test.jpg' } };
            component.setField = field;

            expect(component.field.CodeValue.FileSearchName).toEqual(
                field.CodeValue.FileSearchName
            );
            expect(component.fieldValue.FileSearchName).toBeTruthy();
        });
    });
    describe('when calling onClear', () => {
        beforeEach(() => {
            component.onClear();
        });
        it('should have field.isDirty to true...', () => {
            expect(component.field['isDirty']).toBeTruthy;
        });
        it('should have imgUri to null...', () => {
            expect(component.imgUri).toBeNull();
        });
        it('should have field.CodeValue to null...', () => {
            expect(component.field.CodeValue).toBeNull();
        });
    });
    describe('when calling onClear', () => {
        beforeEach(() => {
            let event: any = { files: [{ size: 100 }] };
            spyOn<any>(component, 'readFileAsUrl').and.stub();
            spyOn<any>(component, 'upload').and.stub();
            component.onFileSelect(event);
        });
        it('should call this.readFileAsUrl...', () => {
            expect(component.readFileAsUrl).toHaveBeenCalledWith({ size: 100 });
        });
        it('should call this.upload...', () => {
            expect(component.upload).toHaveBeenCalledWith({ files: [{ size: 100 }] });
        });
    });
    describe('when calling upload', () => {
        it('', fakeAsync(
            inject(
                [CollectionsService, ToastService],
                (
                    injectedCollectionsService: CollectionsService,
                    injectedToastService: ToastService
                ) => {
                    component.collectionsService = injectedCollectionsService;
                    component.injectedToastService = injectedToastService;
                    component.currentFileUpload = { name: 'sample.jpg', size: '100kb' };
                    spyOn(component.collectionsService, 'uploadFile').and.returnValue(
                        of({ body: { data: 'values', fileName: 'imgPic' } })
                    );
                    spyOn(component.injectedToastService, 'addSuccessMessage').and.stub();
                    spyOn(component, 'markDirty').and.stub();
                    spyOn(JSON, 'parse').and.returnValue({
                        body: { data: 'values', fileName: 'imgPic' }
                    });
                    component.upload();
                    expect(component.collectionsService.uploadFile).toHaveBeenCalledWith({
                        name: 'sample.jpg',
                        size: '100kb'
                    });
                    expect(component.injectedToastService.addSuccessMessage).toHaveBeenCalledWith(
                        'File uploaded successifully'
                    );
                    expect(component.markDirty).toHaveBeenCalled();
                }
            )
        ));
    });
});
