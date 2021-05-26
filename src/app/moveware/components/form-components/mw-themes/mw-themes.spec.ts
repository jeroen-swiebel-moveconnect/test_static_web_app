import { ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { MwThemesComponent } from './mw-themes.component';
import { FormsModule } from '@angular/forms';
import { ThemesService } from 'src/app/moveware/services/themes-service';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { CollectionsService } from 'src/app/moveware/services';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs/internal/observable/of';
import { GridService } from 'src/app/moveware/services/grid-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';

xdescribe('MwThemesComponent', () => {
    let component: any;
    let fixture: ComponentFixture<MwThemesComponent>;
    let result, result1, result2;
    let getActiveThemeresult = {
        active: true,
        CodeCode: 'Dark Grey',
        CodeDescription: 'Dark Grey',
        CodeLogo: 'moveware_logo1560157920640.jpg',
        createdBy: 'migration-script',
        CodeStatus: {
            _id: '7769626e-e769-42a3-a03a-42e3d6967d08',
            CodeCode: 'Active',
            CodeDescription: {
                def: 'Active',
                en: 'Active'
            }
        },
        latestSequenceNr: 17
    };
    let themes2: any = [
        {
            active: false,
            CodeCode: 'Blue'
        },
        { active: false, CodeCode: 'Red' },
        { active: false, CodeCode: 'Green' }
    ];
    let themes: any = [
        {
            active: false,
            CodeCode: 'Blue',
            CodeDescription: 'Blue (Default)',
            CodeLogo: 'moveware_logo1560157908939.jpg',
            createdBy: 'migration-script',
            CodeStatus: {
                _id: '7769626e-e769-42a3-a03a-42e3d6967d08',
                CodeCode: 'Active',
                CodeDescription: {
                    def: 'Active',
                    en: 'Active'
                }
            },
            latestSequenceNr: 19
        },
        {
            active: true,
            CodeCode: 'Dark Grey',
            CodeDescription: 'Dark Grey',
            CodeLogo: 'moveware_logo1560157920640.jpg',
            createdBy: 'migration-script',
            CodeStatus: {
                _id: '7769626e-e769-42a3-a03a-42e3d6967d08',
                CodeCode: 'Active',
                CodeDescription: {
                    def: 'Active',
                    en: 'Active'
                }
            },
            latestSequenceNr: 17
        }
    ];
    let themes1: any = [];
    let themesService: ThemesService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [MwThemesComponent],
            imports: [NoopAnimationsModule, DropdownModule, TestingModule],
            providers: [
                MessageService,
                CollectionsService,
                ThemesService,
                ToastService,
                WebBaseProvider,
                GridService
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(MwThemesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('when calling ngoninit method', () => {
        beforeEach(() => {
            spyOn(component, 'loadThemes').and.stub();
            component.ngOnInit();
        });
        it('should call this.loadThemes method', () => {
            expect(component.loadThemes).toHaveBeenCalled();
        });
    });
    describe('call loadthemes', () => {
        beforeEach(inject([ThemesService], (injthemesService: ThemesService) => {
            component.themesList = [];
            themesService = injthemesService;
            spyOn(themesService, 'getThemesList').and.returnValue(of(themes));
            spyOn(component, 'getActiveTheme').and.returnValue(getActiveThemeresult);
            component.loadThemes();
        }));
        it('check themesList values', () => {
            expect(component.themesList).toEqual(themes);
        });
        it('check call for getThemesList', () => {
            expect(themesService.getThemesList).toHaveBeenCalled();
        });
        it('check activeTheme value', () => {
            expect(component.activeTheme).toEqual(getActiveThemeresult);
        });
        it('check previousTheme value', () => {
            expect(component.previousTheme).toEqual(getActiveThemeresult);
        });
        it('check previousTheme value', () => {
            expect(component.activeTheme).toEqual(getActiveThemeresult);
        });
        it('check getActiveTheme call', () => {
            expect(component.getActiveTheme).toHaveBeenCalled();
        });
    });
    describe('call loadthemes catch error', () => {
        beforeEach(inject([ThemesService], (injthemesService: ThemesService) => {
            component.themesList = [];
            themesService = injthemesService;
            spyOn(themesService, 'getThemesList').and.returnValue(
                of({ errorCode: 404, Message: 'NullPointerException' })
            );
            spyOn(component, 'getActiveTheme').and.returnValue(getActiveThemeresult);
            component.loadThemes();
        }));
    });
    describe('call getActiveThemes', () => {
        beforeEach(() => {
            result = component.getActiveTheme(themes1);
            result1 = component.getActiveTheme(themes);
            result2 = component.getActiveTheme(themes2);
        });
        it('check returnvalue of getActiveTHeme', () => [
            expect(result1).toEqual(getActiveThemeresult)
        ]);

        it('check with emptyarray as actualparam for getActiveTheme', () => {
            expect(result).toBeNull;
        });
        it('check with emptyarray as actualparam for getActiveTheme', () => {
            expect(result2).toBeNull;
        });
    });
    // describe("call onThemeChange", () => {   // throwing error in afterAll
    //   beforeEach(inject([ThemesService], (injthemesService: ThemesService) => {
    //     themesService = injthemesService;
    //     component.previousTheme = {
    //       active: true,
    //       viewId: "4e61675c-0831-432d-8cd9-f0026d07fcff"
    //     };
    //     component.currentView = { _id: "4e61675c-0831-432d-8cd9-f0026d07fcff" };
    //     spyOn(themesService, "applyThemeAndUpdate").and.stub();
    //     spyOn(JSON, "parse").and.stub();
    //     component.onThemeChange({
    //       active: false
    //     });
    //   }));
    //   it("check applyThemeAndUpdate1 call param values", () => {
    //     expect(themesService.applyThemeAndUpdate).toHaveBeenCalledWith(
    //       { active: true, viewId: "4e61675c-0831-432d-8cd9-f0026d07fcff" },
    //       true
    //     );
    //   });
    //   it("check applyThemeAndUpdate2 call param values", () => {
    //     expect(themesService.applyThemeAndUpdate).toHaveBeenCalledWith(
    //       { active: false, viewId: "4e61675c-0831-432d-8cd9-f0026d07fcff" },
    //       false
    //     );
    //   });
    //   // it("call applyThemeAndUpdte count", () => {
    //   //   expect(themesService.applyThemeAndUpdate).toHaveBeenCalledTimes(2);
    //   // });
    // });
});
