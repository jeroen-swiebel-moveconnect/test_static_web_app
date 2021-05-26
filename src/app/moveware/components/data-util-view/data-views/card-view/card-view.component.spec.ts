// import { ComponentFixture, TestBed, async } from "@angular/core/testing";
// import { NO_ERRORS_SCHEMA, EventEmitter } from "@angular/core";
// import { CardViewComponent } from "./card-view.component";
// import { TableModule } from "primeng/table";
// import { StringReplacePipe } from "src/app/moveware/pipes/string-replace.pipe";
// import { NgModel, FormsModule } from "@angular/forms";
// import { DropdownModule, MessageService } from "primeng/primeng";
// import { ContentProcessorPipe } from "src/app/moveware/pipes/ContentProcessor.pipe";
// import { GridService } from "src/app/moveware/services/grid-service";
// import { ToastService } from "src/app/moveware/services/toastMessage.service";
// import {
//   BrowserAnimationsModule,
//   NoopAnimationsModule
// } from "@angular/platform-browser/animations";
// import { ContextService } from "src/app/moveware/services/context.service";
// import { CollectionsService } from "src/app/moveware/services";
// import { WebBaseProvider } from "src/app/moveware/providers";
// import { HttpClientModule } from "@angular/common/http";
// import { RouterTestingModule } from "@angular/router/testing";
// describe("CardViewComponent", () => {
//   let component: any;
//   let fixture: ComponentFixture<CardViewComponent>;
//   beforeEach(async () => {
//     TestBed.configureTestingModule({
//       schemas: [NO_ERRORS_SCHEMA],
//       declarations: [
//         StringReplacePipe,
//         CardViewComponent,
//         ContentProcessorPipe
//       ],
//       imports: [
//         TableModule,
//         FormsModule,
//         DropdownModule,
//         BrowserAnimationsModule,
//         NoopAnimationsModule,
//         HttpClientModule,
//         RouterTestingModule,
// TranslateModule.forRoot()
//       ],
//       providers: [
//         StringReplacePipe,
//         GridService,
//         ToastService,
//         MessageService,
//         ContextService,
//         CollectionsService,
//         WebBaseProvider
//       ]
//     }).compileComponents();
//     fixture = TestBed.createComponent(CardViewComponent);
//     component = fixture.componentInstance;
//   });
//   it("can load instance", () => {
//     expect(component).toBeTruthy();
//   });
//   describe("when calling onCardSelection", () => {
//     beforeEach(() => {
//       component.onCardSelect = new EventEmitter<any>();
//       let contextService: ContextService = TestBed.get(ContextService);
//       spyOn(component.onCardSelect, "emit").and.stub();
//       spyOn(contextService, "isDataChanged").and.stub();
//       component.onCardSelection({ cardsData: "SampleData" });
//     });
//     it("should this.selectedCard equals to data send as parameters", () => {
//       expect(component.selectedCard).toEqual({ cardsData: "SampleData" });
//     });
//     it("ti should emit the data to prooperty this.onCardSelect", () => {
//       expect(component.onCardSelect.emit).toHaveBeenCalledWith({
//         cardsData: "SampleData"
//       });
//     });
//   });
//   describe("when calling onRecordSearch", () => {
//     beforeEach(() => {
//       component.columnSearchFilter = {};
//       spyOn(component, "onRecordSearch").and.stub();
//       component.clearSearchText("SampleData");
//     });
//     it("should this.columnSearchFilter clear the requested data", () => {
//       expect(component.columnSearchFilter).toEqual({ SampleData: "" });
//     });
//     it("should call this.onRecordSearch()", () => {
//       expect(component.onRecordSearch).toHaveBeenCalled();
//     });
//   });
//   describe("when calling updateSearchFilters", () => {
//     beforeEach(() => {
//       component.columnSearchFilter = {};
//       spyOn(component, "onRecordSearch").and.stub();
//       component.updateSearchFilters(
//         { value: "SAmpleVAlue" },
//         { CodeCode: "entity" }
//       );
//     });

//     it("should this.columnSearchFilter clear the requested data", () => {
//       expect(component.columnSearchFilter).toEqual({ entity: "SAmpleVAlue" });
//     });
//     it("should call this.onRecordSearch()", () => {
//       expect(component.onRecordSearch).toHaveBeenCalled();
//     });
//   });
//   describe("when calling onRecordSearch", () => {
//     beforeEach(() => {
//       component.columnSearchFilter = { entity: "SAmpleVAlue" };
//       spyOn(component.onCardsSearch, "emit").and.stub();
//       component.onRecordSearch();
//     });

//     it("should this.columnSearchFilter clear the requested data", () => {
//       expect(component.onCardsSearch.emit).toHaveBeenCalledWith({
//         data: { entity: "SAmpleVAlue" },
//         field: undefined
//       });
//     });
//   });
//   describe("when calling onSort", () => {
//     beforeEach(() => {
//       spyOn(component.onCardsSort, "emit").and.stub();
//     });
//     it("should emit data when sorte is uundefined", () => {
//       component.onSort({ sorted: undefined });
//       expect(component.onCardsSort.emit).toHaveBeenCalledWith({
//         data: { sorted: "ASC" }
//       });
//     });
//     it("should emit data when sorte is defined as ASC", () => {
//       component.onSort({ sorted: "ASC" });
//       expect(component.onCardsSort.emit).toHaveBeenCalledWith({
//         data: { sorted: "DESC" }
//       });
//     });
//     it("should emit data when sorte is DESC", () => {
//       component.onSort({ sorted: "DESC" });
//       expect(component.onCardsSort.emit).toHaveBeenCalledWith({
//         data: { sorted: undefined }
//       });
//     });
//   });
// });
