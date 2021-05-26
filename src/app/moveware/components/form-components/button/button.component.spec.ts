import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { ButtonComponent } from './button.component';
import { ContextService } from 'src/app/moveware/services/context.service';
import { CollectionsService } from 'src/app/moveware/services';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { HttpClientModule } from '@angular/common/http';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

xdescribe('ButtonComponent', () => {
    let component: any;
    let fixture: ComponentFixture<ButtonComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                CollectionsService,
                WebBaseProvider,
                DialogService,
                DynamicDialogConfig,
                ToastService
            ],
            declarations: [ButtonComponent],
            imports: [HttpClientModule, TranslateModule.forRoot()]
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
        component['currentFileUpload'] = {};
    });

    it('can load instance', () => {
        expect(component).toBeDefined();
    });

    describe('when calling handleAction', () => {
        it('should emit the actionEvent property', () => {
            component.actionEvent = new EventEmitter<string>();
            spyOn(component.actionEvent, 'emit').and.stub();
            component.handleAction({ actionEvent: 'click' });
            expect(component.actionEvent.emit).toHaveBeenCalledWith({ actionEvent: 'click' });
        });
    });

    describe('when calling onUpload', () => {
        let event = { files: ['file0', 'file1', 'file2'] };
        let event2 = { files: [] };
        let contextService: ContextService;

        beforeEach(inject([ContextService], (injectContextService: ContextService) => {
            contextService = injectContextService;
            spyOn(contextService, 'saveDataChangeState').and.stub();
            spyOn(component, 'onUpload').and.callThrough();
            spyOn(component, 'upload').and.stub();
        }));

        it('should call saveDataChangeState', () => {
            component.onUpload(event);
            expect(contextService.saveDataChangeState).toHaveBeenCalled();
        });

        it('should call upload if file', () => {
            component.onUpload(event);
            expect(component.upload).toHaveBeenCalledWith(event);
            expect(component['currentFileUpload']).toEqual(event.files[0]);
        });

        it('should not have called upload if file is null', () => {
            component.onUpload(event2);
            expect(component.upload).not.toHaveBeenCalled();
        });
    });

    describe('when calling upload', () => {
        let file = { body: '{ "_id" : "123"}' };
        let collectionsService: CollectionsService;
        let cacheService: CacheService;
        let toastService: ToastService;

        beforeEach(inject(
            [CacheService, CollectionsService, ToastService],
            (
                injectCacheService: CacheService,
                injectedCollectionsService: CollectionsService,
                injectedToastService: ToastService
            ) => {
                collectionsService = injectedCollectionsService;
                cacheService = injectCacheService;
                toastService = injectedToastService;
                spyOn(cacheService, 'getUserId').and.returnValue('userID');
                spyOn(collectionsService, 'uploadFile').and.returnValue(
                    of({ body: '{ "_id" : "123"}' })
                );
                spyOn(toastService, 'addSuccessMessage').and.stub();
                spyOn(toastService, 'showCustomToast').and.stub();
                spyOn(component, 'createRequestCriteria').and.stub();
                spyOn(collectionsService, 'getContainerViewData').and.returnValue(
                    of({ body: '{ "_id" : "123"}' })
                );
                component.upload({});
            }
        ));

        it('should call getUserId and uploadFile', () => {
            expect(cacheService.getUserId).toHaveBeenCalled();
            expect(collectionsService.uploadFile).toHaveBeenCalled();
        });

        it('should call createRequestCriteria', () => {
            expect(component.createRequestCriteria).toHaveBeenCalled();
        });

        it('should call addSuccessMessage & getContainerViewData', () => {
            expect(toastService.addSuccessMessage).toHaveBeenCalled();
            expect(collectionsService.getContainerViewData).toHaveBeenCalled();
        });
    });

    describe('when calling createRequestCriteria', () => {
        it('should return criteria', inject(
            [CollectionsService],
            (collectionsService: CollectionsService) => {
                spyOn(collectionsService, 'uploadFile').and.returnValue(
                    of({ body: '{ "_id" : "123"}' })
                );
                spyOn(component, 'createRequestCriteria').and.returnValue({
                    criteria: {
                        _id: '123',
                        dataObjectCodeCode: 'Files'
                    },
                    meta: {
                        userId: undefined,
                        viewId: 'ce447577-3700-4422-8e3c-5f6fe50f6e23'
                    },
                    userId: undefined
                });
                component.upload();

                expect(component.createRequestCriteria).toHaveBeenCalledWith(
                    { _id: '123' },
                    undefined
                );
            }
        ));
    });
});
