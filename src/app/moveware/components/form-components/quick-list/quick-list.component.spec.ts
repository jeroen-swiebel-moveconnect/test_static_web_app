// import { ComponentFixture, TestBed, inject, async, fakeAsync, tick } from '@angular/core/testing';
// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { CollectionsService } from 'src/app/moveware/services';
// import { EventsListenerService } from 'src/app/moveware/services';
// import { ToastService } from 'src/app/moveware/services/toast.service';
// import { Broadcaster } from 'src/app/moveware/services/broadcaster';
// import { QuickListComponent } from './quick-list.component';
// import { WebBaseProvider } from 'src/app/moveware/providers';
// import { HttpClientModule } from '@angular/common/http';
// import { RouterTestingModule } from '@angular/router/testing';
// import { MessageService } from 'primeng/api';
// import { testInterface } from '../checkbox/checkbox.component.spec';
// import { of, Subject, Observable, Subscription } from 'rxjs';
// import { GridService } from 'src/app/moveware/services/grid-service';
// import { TranslateModule } from '@ngx-translate/core';
// import { TestingModule } from '../../../app-testing.module';
// describe('QuickListComponent', () => {
//     let component: QuickListComponent;
//     let fixture: ComponentFixture<QuickListComponent>;
//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             schemas: [NO_ERRORS_SCHEMA],
//             declarations: [QuickListComponent],
//             providers: [
//                 GridService,
//                 CollectionsService,
//                 {
//                     provide: EventsListenerService,
//                     useValue: { eventUpdateListener: { subscribe: () => ({ data: '' }) } }
//                 },
//                 ToastService,
//                 Broadcaster,
//                 WebBaseProvider,
//                 MessageService,
//                 testInterface
//             ],
//             imports: [TestingModule]
//         });
//         fixture = TestBed.createComponent(QuickListComponent);
//         component = fixture.componentInstance;
//         component.field = TestBed.get(testInterface);
//     });
//     it('can load instance', () => {
//         expect(component).toBeTruthy();
//     });
//     it('isLeftVisible defaults to: true', () => {
//         expect(component.isLeftVisible).toEqual(true);
//     });
//     it('options defaults to: []', () => {
//         expect(component.options).toEqual([]);
//     });
//     it('viewMode defaults to: CREATE_MODE', () => {
//         expect(component.viewMode).toEqual('CREATE_MODE');
//     });

//     // **************not abled to declared  const ref = this whwn calling ngoninit()
//     describe('when callin goninti', () => {
//         let eventListenerService: EventsListenerService;
//         beforeEach(fakeAsync(() => {
//             eventListenerService = TestBed.get(EventsListenerService);
//             spyOn(JSON, 'parse').and.stub();
//             spyOn(component, 'toggleLeftVisible').and.stub();
//             spyOn(eventListenerService.eventUpdateListener, 'subscribe').and.callThrough();
//             spyOn<any>(component, 'loadAndSetViewForType').and.stub();

//             component['subject'] = new Subject();
//             spyOn(component['subject'], 'pipe').and.returnValue(of('cesvdrcv'));
//             component.field.options = [{ label: 'cesvdrcv' }];
//         }));
//         it('should call toggleLeftVisible', fakeAsync(() => {
//             component.ngOnInit();
//             tick(300);
//             expect(component['subject'].pipe).toHaveBeenCalled();
//         }));
//         it('should call toggleLeftVisible', fakeAsync(() => {
//             component.ngOnInit();
//             tick(300);
//             expect(component.options).toEqual([{ label: 'cesvdrcv' }]);
//         }));
//     });
//     describe('when calling  component.clearSearchText', () => {
//         beforeEach(() => {
//             component.field.options = ['dummyValue1', 'dummyValue2'];
//             component.clearSearchText();
//         });
//         it('should have clearSearchText', () => {
//             expect(JSON.parse(JSON.stringify(component.field.options))).toEqual(component.options);
//         });
//     });
//     describe('Name of the group', () => {
//         beforeEach(() => {
//             let subcribeObject: Subscription = new Subscription();
//             component.subscription = subcribeObject;
//             let subject: Subject<any> = new Subject();
//             component.subject = subject;
//             spyOn(subject, 'next').and.stub();
//             component.searchKey = 'dummySearchkey';
//             spyOn(subcribeObject, 'unsubscribe').and.stub();
//             component.onInputChanged();
//         });
//         it('should have onInputChanged and if already subscibed the unsubscribe and should call subject.next()', () => {
//             expect(component.subscription.unsubscribe).toHaveBeenCalled();
//             expect(component.subject.next).toHaveBeenCalled();
//         });
//     });

//     describe('when calling toggleLeftVisible', () => {
//         beforeEach(() => {
//             let event = { operation: 'cancel' };
//             component.toggleLeftVisible(event);
//         });
//         it('should have toggleLeftVisible and make property isLeftVisible to true', () => {
//             expect(component.isLeftVisible).toBeTruthy();
//         });
//     });

//     describe('when calling loadViewForQuickAdd', () => {
//         let broadcast: Broadcaster;
//         beforeEach(() => {
//             broadcast = TestBed.get(Broadcaster);
//             spyOn(broadcast, 'broadcast').and.stub();
//             component.loadViewForQuickAdd({});
//         });
//         it('should have loadViewForQuickAdd and should call broadcast', () => {
//             expect(broadcast.broadcast).toHaveBeenCalledWith(
//                 'f6cdcb3e-2061-47da-bce5-be5ca91eb5d2',
//                 Object({
//                     data: Object({ viewSelector: 'CodeType', mode: 'CREATE_MODE' })
//                 })
//             );
//         });
//     });

//     describe('when calling loadAndSetViewForType', () => {
//         var mocks = {
//             setTimeout: function () {
//                 return 0;
//             },
//             clearTimeout: function () {}
//         };
//         let collectionsService;
//         beforeEach(inject(
//             [CollectionsService],
//             (InjectedcollectionsService: CollectionsService) => {
//                 component.currentRecord = {
//                     views: [],
//                     currentView: {},
//                     CodeType: 'any',
//                     CodeCode: '',
//                     EntityCode: ''
//                 };
//                 collectionsService = InjectedcollectionsService;
//                 jasmine.clock().install();
//                 spyOn(component, 'loadAndSetView').and.stub();
//                 spyOn(collectionsService, 'loadListOfViewsByType').and.returnValue(
//                     of(['fdsdf', 'sadsa'])
//                 );
//                 let option = { EntityCode: '', CodeCode: '' };
//                 component.loadAndSetViewForType(option);
//                 jasmine.clock().tick(100);
//             }
//         ));
//         it('should have loadAndSetViewForType and checks calls to collectionsService.loadListOfViewsByType and component.loadAndSetView', () => {
//             expect(collectionsService.loadListOfViewsByType).toHaveBeenCalled();
//             expect(component.loadAndSetView).toHaveBeenCalled();
//             jasmine.clock().uninstall();
//         });
//     });

//     describe('when calling loadAndSetView', () => {
//         let collectionsService;
//         beforeEach(inject(
//             [CollectionsService],
//             (InjectedcollectionsService: CollectionsService) => {
//                 collectionsService = InjectedcollectionsService;
//                 spyOn(collectionsService, 'loadViewByCode').and.returnValue(of());
//                 component.loadAndSetView('string', ['dummyView']);
//             }
//         ));
//         it(' should call collectionsService.loadViewByCode method...', () => {
//             expect(collectionsService.loadViewByCode).toHaveBeenCalled();
//         });
//     });

//     describe('when calling closeRightSlide', () => {
//         beforeEach(() => {
//             component.closeRightSlide(true);
//         });
//         it('should  change isLeftVisible value to true...', () => {
//             expect(component.isLeftVisible).toBeTruthy();
//         });
//     });
// });
