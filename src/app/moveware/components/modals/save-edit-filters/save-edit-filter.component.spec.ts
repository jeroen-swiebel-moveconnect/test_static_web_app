import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { SaveEditFilterContentComponent } from './save-edit-filter.component';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
// describe("SaveEditFilterComponent", () => {
//   let component: SaveEditFilterContentComponent;
//   let fixture: ComponentFixture<SaveEditFilterContentComponent>;
//   beforeEach(() => {
//     const matDialogStub = {
//       open: (saveEditFilterContentComponent, dialogConfig) => ({})
//     };
//     const dialogDataStub = {};
//     const matDialogRefStub = {
//       close: object => ({}),
//       updateSize: (string, string1) => ({})
//     };
//     // const toastServiceStub = { addErrorMessage: string => ({}) };
//     // const broadcasterStub = { on: string => ({ subscribe: () => ({}) }) };
//     TestBed.configureTestingModule({
//       schemas: [NO_ERRORS_SCHEMA],
//       declarations: [SaveEditFilterContentComponent],
//       providers: [
//         ToastService,
//         Broadcaster
//         // { provide: ToastService, useValue: toastServiceStub },
//         // { provide: Broadcaster, useValue: broadcasterStub }
//       ]
//     });
//     fixture = TestBed.createComponent(SaveEditFilterContentComponent);
//     component = fixture.componentInstance;
//   });
//   it("can load instance", () => {
//     expect(component).toBeTruthy();
//   });
//   describe("openDialog", () => {
//     it("makes expected calls", () => {
//       const matDialogStub: MatDialog = fixture.debugElement.injector.get(
//         MatDialog
//       );
//       spyOn(matDialogStub, "open").and.callThrough();
//       component.openDialog({
//         type: "string",
//         title: "string",
//         message: "string",
//         formData: {},
//         selectedView: {}
//       });
//       expect(matDialogStub.open).toHaveBeenCalled();
//     });
//   });
// });
// describe("SaveEditFilterContentComponent", () => {
//   let component: any;
//   let fixture: ComponentFixture<SaveEditFilterContentComponent>;
//   beforeEach(() => {
//     const matDialogStub = {
//       open: (saveEditFilterContentComponent, dialogConfig) => ({})
//     };
//     const matDialogRefStub = {
//       close: object => ({}),
//       updateSize: (string, string1) => ({})
//     };
//     const data = {
//       data: {
//         data: { currentRecord: "", viewMode: "", collectionFromRoute: "" }
//       }
//     };
//     TestBed.configureTestingModule({
//       schemas: [NO_ERRORS_SCHEMA],
//       declarations: [SaveEditFilterComponent, SaveEditFilterContentComponent],
//       providers: [
//         { provide: MatDialog, useValue: matDialogStub },
//         { provide: MAT_DIALOG_DATA, useValue: data },
//         { provide: MatDialogRef, useValue: matDialogRefStub },
//         ToastService,
//         MessageService,
//         Broadcaster
//       ]
//     });
//     fixture = TestBed.createComponent(SaveEditFilterContentComponent);
//     component = fixture.componentInstance;
//   });
//   it("can load instance", () => {
//     expect(component).toBeTruthy();
//   });
//   it("customeViewContainerId defaults to: a6ba332f-31fb-424f-8adb-f9c436e98762", () => {
//     expect(component.customeViewContainerId).toEqual(
//       "a6ba332f-31fb-424f-8adb-f9c436e98762"
//     );
//   });
//   describe("when calling ngOnInit", () => {
//     beforeEach(() => {
//       spyOn(component, "subscribeEvents").and.stub();
//       component.ngOnInit();
//     });
//     it("makes expected calls to this.subscribeEvents", () => {
//       expect(component.subscribeEvents).toHaveBeenCalled();
//     });
//   });
//   describe("subscribeEvents method", () => {
//     let broadcasterStub: Broadcaster;
//     beforeEach(() => {
//       broadcasterStub = TestBed.get(Broadcaster);
//       spyOn(component, "saveFilter").and.stub();
//       spyOn(component, "updateFilter").and.stub();
//       spyOn(broadcasterStub, "on").and.returnValue(
//         of({ filteringData: "someValues" })
//       );
//       component.subscribeEvents();
//     });
//     it("makes expected calls to broadcasterservice.on method with parameters", () => {
//       expect(broadcasterStub.on).toHaveBeenCalledWith("save_custom_view");
//     });
//     it("makes expected calls to saveFilter method with parameters", () => {
//       expect(component.saveFilter).toHaveBeenCalledWith({
//         filteringData: "someValues"
//       });
//     });
//     it("makes expected calls to updateFilter method with parameters", () => {
//       expect(component.updateFilter).toHaveBeenCalledWith({
//         filteringData: "someValues"
//       });
//     });

//     it("makes expected calls to broadcasterservice.on method with parameter", () => {
//       expect(broadcasterStub.on).toHaveBeenCalledWith("edit_custom_view");
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
//   describe("when calling getDescription", () => {
//     let result;
//     beforeEach(() => {
//       result = component.getDescription(
//         [
//           { id: "V^R*CVF^RCVBGVB", CodeCode: "person" },
//           { id: "V^R*CVF^dsfdsffRCVBGVB", CodeCode: "animal" },
//           { id: "V^R*CVFsxfdsdsf^RCVBGVB", CodeCode: "entity" }
//         ],
//         "animal"
//       );
//     });
//     it("should return expected values...", () => {
//       expect(result).toEqual([
//         { id: "V^R*CVF^dsfdsffRCVBGVB", CodeCode: "animal" }
//       ]);
//     });
//   });
//   describe("when calling saveFilter", () => {
//     let CodeDescriptionSpyObj;
//     let toastService;
//     beforeEach(() => {
//       toastService = TestBed.get(ToastService);
//       CodeDescriptionSpyObj = spyOn(component, "getDescription");
//       spyOn(component.dialogRef, "close").and.stub();
//       spyOn(toastService, "addErrorMessage");
//       CodeDescriptionSpyObj.and.returnValue([{ CodeValue: "CodeDescription" }]);
//       component.saveFilter({ fileds: [{ value: "data" }] });
//     });
//     it("should call component.getDescription with expected parameter when code is SettingDescription...", () => {
//       expect(component.getDescription).toHaveBeenCalledWith(
//         { value: "data" },
//         "SettingDescription"
//       );
//     });
//     it("should call component.getDescription with expected parameter when code is Entities...", () => {
//       expect(component.getDescription).toHaveBeenCalledWith(
//         { value: "data" },
//         "Entities"
//       );
//     });
//     it("should equal this.value to expected values..", () => {
//       expect(component.value).toEqual("CodeDescription");
//     });
//     it("should equal this.selectedData to expected values..", () => {
//       expect(component.selectedData).toEqual("CodeDescription");
//     });
//     it("should call or close the dialogue box ", () => {
//       expect(component.dialogRef.close).toHaveBeenCalled();
//     });
//     it("should call toastService.addErrorMessage method...", () => {
//       CodeDescriptionSpyObj.and.returnValue([{ CodeValue: undefined }]);
//       component.saveFilter({ fileds: [{ value: "data" }] });
//       expect(toastService.addErrorMessage).toHaveBeenCalled();
//     });
//   });
//   describe("when calling updateFilter", () => {
//     let CodeDescriptionSpyObj;
//     let toastService;
//     beforeEach(() => {
//       toastService = TestBed.get(ToastService);
//       CodeDescriptionSpyObj = spyOn(component, "getDescription");
//       spyOn(component.dialogRef, "close").and.stub();
//       spyOn(toastService, "addErrorMessage");
//       CodeDescriptionSpyObj.and.returnValue([{ CodeValue: "CodeDescription" }]);
//       component.updateFilter({ fileds: [{ value: "data" }] });
//     });
//     it("should call component.getDescription with expected parameter when code is SettingDescription...", () => {
//       expect(component.getDescription).toHaveBeenCalledWith(
//         { value: "data" },
//         "SettingDescription"
//       );
//     });
//     it("should call component.getDescription with expected parameter when code is Entities...", () => {
//       expect(component.getDescription).toHaveBeenCalledWith(
//         { value: "data" },
//         "Entities"
//       );
//     });
//     it("should equal this.value to expected values..", () => {
//       expect(component.value).toEqual("CodeDescription");
//     });
//     it("should equal this.selectedData to expected values..", () => {
//       expect(component.selectedData).toEqual("CodeDescription");
//     });
//     it("should call or close the dialogue box ", () => {
//       expect(component.dialogRef.close).toHaveBeenCalled();
//     });
//     it("should call toastService.addErrorMessage method...", () => {
//       CodeDescriptionSpyObj.and.returnValue([{ CodeValue: undefined }]);
//       component.updateFilter({ fileds: [{ value: "data" }] });
//       expect(toastService.addErrorMessage).toHaveBeenCalled();
//     });
//   });
// });
