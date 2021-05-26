import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UIActionZoominContentComponent } from './ui-action-zoomin.component';
import { of } from 'rxjs';
import { async } from 'q';
import { EventsListenerService } from 'src/app/moveware/services';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('UIActionZoominComponent', () => {
    let component: any;
    let fixture: ComponentFixture<UIActionZoominContentComponent>;
    beforeEach(() => {
        const matDialogStub = {
            open: (UIActionZoominContentComponent, dialogConfig) => ({})
        };
        const matDialogRefStub = {
            close: () => ({}),
            updateSize: (string, string1) => ({})
        };
        const eventsListenerServiceStub = {
            eventUpdateListener: { subscribe: () => ({}) }
        };
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [UIActionZoominContentComponent],
            imports: [TestingModule]
        });
        fixture = TestBed.createComponent(UIActionZoominContentComponent);
        component = fixture.componentInstance;
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    // describe("openDialog", () => {
    //   let matDialogStub: MatDialog;
    //   beforeEach(() => {
    //     matDialogStub = fixture.debugElement.injector.get(MatDialog);
    //     let overridesDialogDataStub: OverridesDialogData = {
    //       data: { key: "Values" }
    //     };
    //     component.dialogConfig = new MatDialogConfig();
    //     component.dialogConfig.disableClose = true;
    //     component.dialogConfig.height = "100vh";
    //     component.dialogConfig.width = "30%";
    //     component.dialogConfig.panelClass = "overrides";
    //     spyOn(matDialogStub, "open").and.callThrough();
    //     component.openDialog(overridesDialogDataStub);
    //   });
    //   it("makes expected calls", () => {
    //     let obj: MatDialogConfig = new MatDialogConfig();
    //     obj.role = "dialog";
    //     obj.panelClass = "overrides";
    //     obj.hasBackdrop = true;
    //     obj.backdropClass = "";
    //     obj.disableClose = true;
    //     obj.width = "30%";
    //     obj.height = "100vh";
    //     obj.maxWidth = "80vw";
    //     (obj.data = { data: { key: "Values" } }),
    //       (obj.ariaDescribedBy = null),
    //       (obj.ariaLabel = null),
    //       (obj.autoFocus = true);
    //     obj.closeOnNavigation = true;
    //     expect(matDialogStub.open).toHaveBeenCalledWith(
    //       UIActionZoominContentComponent,
    //       obj
    //     );
    //   });
    // });
});
// describe("UIActionZoominContentComponent", () => {
//   let component: any;
//   let fixture: ComponentFixture<UIActionZoominContentComponent>;
//   beforeEach(async () => {
//     const matDialogStub = {
//       open: (UIActionZoominContentComponent, dialogConfig) => ({}),
//       close: () => {}
//     };
//     const matDialogRefStub = {
//       close: () => ({}),
//       updateSize: (string, string1) => ({})
//     };

//     const data = {
//       data: {
//         data: { currentRecord: "", viewMode: "", collectionFromRoute: "" }
//       }
//     };
//     const eventsListenerServiceStub = {
//       eventUpdateListener: { subscribe: () => ({}) }
//     };
//     TestBed.configureTestingModule({
//       schemas: [NO_ERRORS_SCHEMA],
//       declarations: [UIActionZoominComponent, UIActionZoominContentComponent],
//       providers: [
//         EventsListenerService,
//         { provide: MAT_DIALOG_DATA, useValue: data },
//         { provide: MatDialog, useValue: matDialogStub },
//         { provide: MatDialogRef, useValue: matDialogRefStub },
//         { provide: EventsListenerService, useValue: eventsListenerServiceStub }
//       ]
//     }).compileComponents();
//     spyOn(Utils, "getCopy").and.stub();
//     fixture = TestBed.createComponent(UIActionZoominContentComponent);
//     component = fixture.componentInstance;
//     component.data = {
//       data: { currentRecord: "", viewMode: "", collectionFromRoute: "" }
//     };
//   });
//   it("can load instance", () => {
//     expect(component).toBeTruthy();
//   });
//   describe("when calling ngOnInit", () => {
//     beforeEach(() => {
//       spyOn(component, "onEventUpdate").and.stub();
//       component.ngOnInit();
//     });
//     it("should call this.onEventUpdate ", () => {
//       expect(component.onEventUpdate).toHaveBeenCalled();
//     });
//   });
//   describe("when calling onEventUpdate", () => {
//     let eventsListener: EventsListenerService;
//     beforeEach(inject(
//       [EventsListenerService],
//       (injectEdeventsListener: EventsListenerService) => {
//         component.eventsListener = {
//           eventUpdateListener: { subscribe: () => {} }
//         };

//         component.dialogRef = TestBed.get(MatDialogRef);
//         spyOn(component.dialogRef, "close").and.stub();
//         spyOn(
//           component.eventsListener.eventUpdateListener,
//           "subscribe"
//         ).and.returnValue(of({ somavaleu: "dhgfds" }));
//       }
//     ));
//     it("should behave...", () => {
//       component.onEventUpdate();
//       expect(
//         component.eventsListener.eventUpdateListener.subscribe
//       ).toHaveBeenCalled();
//     });
//   });
//   describe("when caling resizeOverlay  from grid content component", () => {
//     beforeEach(() => {
//       component.dialogRef = { updateSize: () => {} };
//       spyOn(component.dialogRef, "updateSize").and.stub();
//     });
//     it("should update the size of the dialogue with expected values when boolean parameter passed as true...", () => {
//       component.resizeOverlay(true);
//       expect(component.dialogRef.updateSize).toHaveBeenCalledWith(
//         "100vw",
//         "100vh"
//       );
//     });
//     it("should update the size of the dialogue with expected values when boolean parameter passed as false...", () => {
//       component.resizeOverlay(false);
//       expect(component.dialogRef.updateSize).toHaveBeenCalledWith(
//         "30%",
//         "100vh"
//       );
//     });
//   });
// });
