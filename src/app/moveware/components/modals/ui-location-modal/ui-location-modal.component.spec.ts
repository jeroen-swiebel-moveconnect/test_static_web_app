import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UILocationModalContentComponent } from './ui-location-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('UILocantionModalComponent', () => {
    let component: any;
    let fixture: ComponentFixture<UILocationModalContentComponent>;
    beforeEach(() => {
        const matDialogStub = {
            open: (uILocationModalContentComponent, dialogConfig) => ({})
        };
        const matDialogRefStub = { updateSize: (string, string1) => ({}) };
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [UILocationModalContentComponent],
            imports: [TestingModule]
        });
        fixture = TestBed.createComponent(UILocationModalContentComponent);
        component = fixture.componentInstance;
    });
    it('can load instance', () => {
        expect(component).toBeTruthy();
    });
    //   describe("when calling openDialog method", () => {
    //     let obj: MatDialogConfig;
    //     beforeEach(() => {
    //       obj = new MatDialogConfig();
    //       obj.role = "dialog";
    //       obj.panelClass = "ui-location-dialog-center";
    //       obj.hasBackdrop = true;
    //       obj.backdropClass = "";
    //       obj.disableClose = true;
    //       obj.width = "40%";
    //       obj.height = "100vh";
    //       obj.maxWidth = "80vw";
    //       obj.data = {};
    //       obj.ariaDescribedBy = null;
    //       obj.ariaLabel = null;
    //       obj.autoFocus = true;
    //       obj.closeOnNavigation = true;
    //       spyOn(component.dialog, "open").and.stub();
    //     });
    //     it("should open dialog when position is left.", () => {
    //       obj.data = { position: "left" };
    //       obj.panelClass = "ui-location-dialog-left";
    //       component.openDialog({ position: "left" });
    //       expect(component.dialog.open).toHaveBeenCalledWith(
    //         UILocationModalContentComponent,
    //         obj
    //       );
    //     });
    //     it("should open dialog when position is right", () => {
    //       obj.data = { position: "right" };
    //       obj.panelClass = "ui-location-dialog-right";
    //       component.openDialog({ position: "right" });
    //       expect(component.dialog.open).toHaveBeenCalledWith(
    //         UILocationModalContentComponent,
    //         obj
    //       );
    //     });
    //     it("should open dialog when position is center", () => {
    //       obj.height = "90vh";
    //       obj.width = "80%";
    //       obj.data = { position: "center" };
    //       obj.panelClass = "ui-location-dialog-center";
    //       component.openDialog({ position: "center" });
    //       expect(component.dialog.open).toHaveBeenCalledWith(
    //         UILocationModalContentComponent,
    //         obj
    //       );
    //     });
    //     it("should open dialog when position is not mentioned", () => {
    //       obj.height = "90vh";
    //       obj.width = "80%";
    //       obj.data = { position: "" };
    //       obj.panelClass = "ui-location-dialog-center";
    //       component.openDialog({ position: "" });
    //       expect(component.dialog.open).toHaveBeenCalledWith(
    //         UILocationModalContentComponent,
    //         obj
    //       );
    //     });
    //   });
    // });
    // describe("UILocationModalContentComponent", () => {
    //   let component: any;
    //   let fixture: ComponentFixture<UILocationModalContentComponent>;
    //   beforeEach(() => {
    //     const data = {
    //       data: {
    //         data: { currentRecord: "", viewMode: "", collectionFromRoute: "" }
    //       }
    //     };
    //     const matDialogStub = {
    //       open: (uILocationModalContentComponent, dialogConfig) => ({})
    //     };
    //     const matDialogRefStub = { updateSize: (string, string1) => ({}) };
    //     TestBed.configureTestingModule({
    //       schemas: [NO_ERRORS_SCHEMA],
    //       declarations: [
    //         UILocantionModalComponent,
    //         UILocationModalContentComponent
    //       ],
    //       providers: [
    //         { provide: MAT_DIALOG_DATA, useValue: data },
    //         { provide: MatDialog, useValue: matDialogStub },
    //         { provide: MatDialogRef, useValue: matDialogRefStub }
    //       ]
    //     });
    //     fixture = TestBed.createComponent(UILocationModalContentComponent);
    //     component = fixture.componentInstance;
    //   });
    //   it("can load instance", () => {
    //     expect(component).toBeTruthy();
    //   });
    //   describe("when caling resizeOverlay ", () => {
    //     beforeEach(() => {
    //       component.dialogRef = { updateSize: () => {} };
    //       spyOn(component.dialogRef, "updateSize").and.stub();
    //     });
    //     it("should update the size of the dialogue with expected values when boolean parameter passed as true...", () => {
    //       component.resizeOverlay(true);
    //       expect(component.dialogRef.updateSize).toHaveBeenCalledWith(
    //         "99.99vw", //99.99vw', '100vh
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
    //   describe("when caling resizeOverlayToRight ", () => {
    //     beforeEach(() => {
    //       component.dialogRef = { updateSize: () => {} };
    //       spyOn(component.dialogRef, "updateSize").and.stub();
    //     });
    //     it("should update the size of the dialogue with expected values when boolean parameter passed as true...", () => {
    //       component.resizeOverlayToRight(true);
    //       expect(component.dialogRef.updateSize).toHaveBeenCalledWith(
    //         "30%", //99.99vw', '100vh
    //         "100vh"
    //       );
    //     });
    //     it("should update the size of the dialogue with expected values when boolean parameter passed as false...", () => {
    //       component.resizeOverlayToRight(false);
    //       expect(component.dialogRef.updateSize).toHaveBeenCalledWith(
    //         "99.99vw",
    //         "100vh"
    //       );
    //     });
    //   });
});
