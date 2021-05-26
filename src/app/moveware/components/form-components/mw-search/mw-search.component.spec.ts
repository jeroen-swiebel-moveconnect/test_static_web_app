import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CollectionsService } from 'src/app/moveware/services';
import { EventsListenerService } from 'src/app/moveware/services';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { SearchComponent } from './mw-search.component';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { HttpClientModule } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { Subject, Subscription, of } from 'rxjs';
import { GridService } from 'src/app/moveware/services/grid-service';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('SearchComponent', () => {
    let component: any;
    let fixture: ComponentFixture<SearchComponent>;
    beforeEach(async () => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [SearchComponent],
            providers: [
                SearchComponent,
                CollectionsService,
                ToastService,
                EventsListenerService,
                WebBaseProvider,
                MessageService,
                testInterface,
                GridService
            ],
            imports: [TestingModule]
        });
        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    describe('Name of the group', () => {
        let collectionsService: CollectionsService, toastService;
        beforeEach(() => {
            collectionsService = TestBed.get(CollectionsService);
            toastService = TestBed.get(ToastService);
            component.subject = new Subject();
            spyOn(component.subject, 'pipe').and.returnValue(of({ data: 'sgds' }));
            spyOn(collectionsService, 'searchGlobally').and.returnValue(of({ data: 'sgds' }));
            spyOn(component, 'setScrollbarOptions').and.stub();
            component.ngOnInit();
        });

        it('should call toastService.showCustomToast,', () => {
            expect(component.setScrollbarOptions).toHaveBeenCalled();
        });
        it('should call collectionsService.searchGlobally)..', () => {
            expect(collectionsService.searchGlobally).toHaveBeenCalled();
        });
        it('should call component.subject.pipe', () => {
            expect(component.subject.pipe).toHaveBeenCalled();
        });
        it('should component.isSearchLoading to false..', () => {
            expect(component.isSearchLoading).toBeFalsy();
        });
    });
    describe('when calling markDirty', () => {
        let eventsListener;
        beforeEach(() => {
            eventsListener = TestBed.get(EventsListenerService);
            component.field = TestBed.get(testInterface);
            component.globalEventsNames = [
                'dummyTestEventNameToSatisfyIfConditionOfMarkDirtyMethod'
            ];
            component.field.name = 'dummyTestNameToSatisfyIfConditionOfMarkDirtyMethod';
            spyOn(eventsListener, 'onEventUpdate').and.stub();
            component.markDirty();
        });
        it('should have markDirty and should call eventsListener.onEventUpdate', () => {
            expect(eventsListener.onEventUpdate).toHaveBeenCalled();
        });
    });
    describe('when calling displaySearchItem ', () => {
        let requestData: any = {};
        beforeEach(() => {
            requestData = new testInterface();
            requestData._id = '&$&(%V*EY';
            requestData.CodeType = 'person';
            requestData.CodeCode = 'Account';
            requestData.collectionCode = 'entities';
            requestData.CodeModule = 'CodeCode';
            component.currentRecord = {
                _id: '&$&(%V*EY',
                CodeType: 'person',
                CodeCode: 'Account',
                isSearchResultItem: Boolean
            };
        });
        it('should have displaySearchItem and set local values', () => {
            component.displaySearchItem(requestData);
            expect(component.collectionFromRoute.CodeModule).toEqual('Entities');
        });
        it('should have displaySearchItem and set local values', () => {
            requestData.collectionCode = 'somethingElse';
            component.displaySearchItem(requestData);
            expect(component.collectionFromRoute.CodeModule).toEqual('CodeCode');
        });
        it('should behave...', () => {
            expect(component.currentRecord._id).toEqual(requestData._id);
        });
        it('should behave...', () => {
            expect(component.currentRecord.CodeType).toEqual(requestData.CodeType);
        });
        it('should behave...', () => {
            expect(component.currentRecord.CodeCode).toEqual(requestData.CodeCode);
        });
        it('should behave...', () => {
            expect(component.currentRecord.isSearchResultItem).toBeTruthy();
        });
    });

    describe('when calling closeRightSlide', () => {
        beforeEach(() => {
            component.closeRightSlide();
        });
        it('should have closeRightSlide and make isLeftVisible to true', () => {
            expect(component.isLeftVisible).toBeFalsy;
        });
    });

    describe('Name of the group', () => {
        beforeEach(() => {
            let subcribeObject: Subscription = new Subscription();
            component.subscription = subcribeObject;
            spyOn(subcribeObject, 'unsubscribe').and.stub();
            let subject: Subject<any> = new Subject();
            component.subject = subject;
            spyOn(subject, 'next').and.stub();
            component.onInputChanged('dummySearchkey');
        });
        it('should call this.subscription.unsubscribe', () => {
            expect(component.subscription.unsubscribe).toHaveBeenCalled();
        });
        it('should call this.subject.next', () => {
            expect(component.subject.next).toHaveBeenCalled();
        });
    });
    describe('Name of the group', () => {
        beforeEach(() => {
            component.clearSearchText();
        });
        it('should have onResizeEnd.', () => {
            expect(component.searchKey).toEqual('');
        });
        it('should behave...', () => {
            expect(component.options).toEqual([]);
        });
    });
    describe('Name of the group', () => {
        beforeEach(() => {
            component.overlayWidth = 250;
            component.onResizeEnd({ edges: { left: 200 } });
        });
        it('should have onResizeEnd.', () => {
            expect(component.overlayWidth).toEqual(50);
        });
    });
});
