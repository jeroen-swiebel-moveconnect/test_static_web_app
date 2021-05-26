import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, forwardRef } from '@angular/core';
import { CollectionsService } from 'src/app/moveware/services';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { LookupComponent } from './lookup.component';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { MessageService } from 'primeng/api';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { FormsModule, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { GridService } from 'src/app/moveware/services/grid-service';
import { RouterTestingModule } from '@angular/router/testing';
import { ChipsModule, Chips } from 'primeng/chips';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('LookupComponent', () => {
    let component: any;
    let fixture: ComponentFixture<LookupComponent>;
    let lookupFiled: any;
    let collectionsService: CollectionsService;
    beforeEach(async () => {
        const matDialogStub = {};
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [LookupComponent],
            providers: [
                CollectionsService,
                WebBaseProvider,
                MessageService,
                testInterface,
                GridService,
                ToastService,
                MessageService,
                CollectionsService
            ],
            imports: [ChipsModule, TestingModule]
        });
        fixture = TestBed.createComponent(LookupComponent);
        component = fixture.componentInstance;
        component.field = TestBed.get(testInterface);
        lookupFiled = {};
        fixture.detectChanges();
        collectionsService = TestBed.get(CollectionsService);
    });
    it('can load instance', () => {
        //  expect(component).toBeTruthy();
    });
    //   it("selectedList defaults to: []", () => {
    //     expect(component.selectedList).toEqual([]);
    //   });
    //   it("showSuggestions defaults to: false", () => {
    //     expect(component.showSuggestions).toEqual(false);
    //   });
    //   describe("when calling ngOnInit", () => {
    //     beforeEach(() => {});
    //     it("lookuplist should be assigned to empty array", () => {
    //       component.ngOnInit();
    //       expect(component.lookupList).toEqual([]);
    //     });
    //     it("this.searchTextCtrl should initiliszed with new formcontrol..", () => {
    //       component.ngOnInit();
    //       expect(component.searchTextCtrl instanceof FormControl).toBeTruthy();
    //     });
    //     it("selectedList should be updated when field.codvalues are defined..", () => {
    //       component.field.CodeValue = ["BJDI*% E^D"];
    //       component.ngOnInit();
    //       expect(component.selectedList).toEqual(["BJDI*% E^D"]);
    //     });
    //     it("selectedList should be empty if codevalues are empty.", () => {
    //       component.field.CodeValue = undefined;
    //       component.ngOnInit();
    //       expect(component.selectedList).toEqual([]);
    //     });
    //   });
    //   describe("when calling selectOption", () => {
    //     beforeEach(() => {
    //       component.selectedList = [{ _id: "TUYT%&]C*DF$%D*^(" }];
    //       spyOn(component.selectedList, "findIndex").and.returnValue(1);
    //       component.selectOption({ _id: "TUYT%&]C*DF$%D*^(" });
    //     });
    //     it("should have selectOption...", () => {
    //       expect(component.selectedList).toContain({ _id: "TUYT%&]C*DF$%D*^(" });
    //     });
    //     it('searchedText should be ""', () => {
    //       expect(component.searchedText).toEqual("");
    //     });
    //     it("showSuggestions should be false", () => {
    //       expect(component.showSuggestions).toBeFalsy();
    //     });
    //   });
    //   describe("when caliing removeOption", () => {
    //     beforeEach(() => {
    //       component.selectedList = [
    //         { id: "TUYT%&]C*DF$%D*dgfdx" },
    //         { id: "TUYT%&]C*DF$%D*^(" }
    //       ];
    //       component.removeOption({ id: "TUYT%&]C*DF$%D*^(" });
    //     });
    //     it("selectedList should contain expected values ..", () => {
    //       expect(component.selectedList).toContain({ id: "TUYT%&]C*DF$%D*dgfdx" });
    //     });
    //     it("field codevalues should be updated", () => {
    //       expect(component.field.CodeValue).toEqual([
    //         { id: "TUYT%&]C*DF$%D*dgfdx" }
    //       ]);
    //     });
    //   });
    //   describe("when caliing loadLookupTable", () => {
    //     beforeEach(fakeAsync(() => {
    //       //collectionsService.getLookupData
    //       spyOn(collectionsService, "getLookupData").and.callThrough();
    //       component.loadLookupTable();
    //     }));
    //     it("should have loadLookupTable and on correct response from service...", () => {
    //       expect(collectionsService.getLookupData).toHaveBeenCalled();
    //     });
    //   });

    //   describe("Name of the group", () => {
    //     beforeEach(() => {
    //       component.searchedText = "sdfsf";
    //     });
    //     it("should call service (collectionsService.getLookupData)", () => {
    //       spyOn(collectionsService, "getLookupData").and.returnValue(of());
    //       component.getOptions();
    //       expect(collectionsService.getLookupData).toHaveBeenCalled();
    //     });
    //     it("service should returns empty data ie null...", () => {
    //       spyOn(collectionsService, "getLookupData").and.returnValue(of());
    //       component.getOptions();
    //       expect(component.showSuggestions).toBeFalsy();
    //     });
    //     it("should have getOptions  service returns some data...", () => {
    //       spyOn(collectionsService, "getLookupData").and.returnValue(
    //         of(["some data"])
    //       );
    //       component.getOptions();
    //       expect(component.showSuggestions).toBeTruthy();
    //     });
    //   });
});
