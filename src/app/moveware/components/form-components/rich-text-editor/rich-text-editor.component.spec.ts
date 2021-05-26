import { TestBed, ComponentFixture, fakeAsync, inject } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {
    EventsListenerService,
    CollectionsService,
    RequestHandler
} from 'src/app/moveware/services';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import Utils from 'src/app/moveware/services/utils';
import { of } from 'rxjs';
import { testInterface } from '../checkbox/checkbox.component.spec';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { WebBaseProvider } from 'src/app/moveware/providers';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { RuleEngineService } from 'src/app/moveware/services/rule-engine.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ContextService } from 'src/app/moveware/services/context.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RichTextEditor } from './rich-text-editor.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OAuthLogger, OAuthModule, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { ElementRef, Renderer2, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { RichTextEditorComponent, NodeSelection } from '@syncfusion/ej2-angular-richtexteditor';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

xdescribe('RichTextEditor', () => {
    let component: RichTextEditor;
    let fixture: ComponentFixture<RichTextEditor>;
    let eventsListener: any;
    let dialogRef: DialogComponent;
    let richTextEditor: RichTextEditorComponent;
    let saveSelection: NodeSelection;
    let event = {
        which: 27,
        key: 'Escape',
        stopImmediatePropagation: () => {},
        preventDefault: () => {}
    };
    let dummyCodeAction = [
        {
            CodeUIAction: 'Specific Keystroke',
            LookupCharacter: '!',
            JSONParameter: {
                output: 'value'
            }
        }
    ];
    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [RichTextEditor],
            providers: [
                ToastService,
                PageMappingService,
                RuleEngineService,
                DynamicDialogConfig,
                DialogService,
                TranslateService,
                GridService,
                RequestHandler,
                OAuthService,
                ContextService,
                { provide: ElementRef, useClass: MockElementRef },
                { provide: testInterface, useClass: testInterface },
                {
                    provide: MenuService,
                    useValue: {
                        getMenus: () => {}
                    }
                },
                testInterface,
                Broadcaster,
                CollectionsService,
                WebBaseProvider,
                UrlHelperService,
                OAuthLogger,
                DialogComponent,
                Renderer2,
                ChangeDetectorRef,
                RichTextEditorComponent,
                NodeSelection,
                ViewContainerRef,
                UIActionService,
                QuickTextHandlerService,
                Range
            ],
            imports: [
                FormsModule,
                RouterTestingModule,
                HttpClientTestingModule,
                OAuthModule,
                TranslateModule.forRoot()
            ]
        }).compileComponents();
    });
    beforeEach(inject(
        [DialogComponent, RichTextEditorComponent, NodeSelection, Range],
        (
            injectedOverlayPanel: DialogComponent,
            injectedRichTextEditor: RichTextEditorComponent,
            injectedNodeSelection: NodeSelection,
            injectedRange: Range
        ) => {
            dialogRef = injectedOverlayPanel;
            richTextEditor = injectedRichTextEditor;
            saveSelection = injectedNodeSelection;
            fixture = TestBed.createComponent(RichTextEditor);
            component = fixture.componentInstance;
            component.field = new testInterface();
            component.isKeyStroke = true;
            component.dialogRef = dialogRef;
            component.lastTypedChar = '';
            eventsListener = TestBed.get(EventsListenerService);
            component.currentView = { _id: '' };
            component.editor = richTextEditor;
            component.selection = 0;
            component.suggestions = null;
            component.saveSelection = saveSelection;
            component.editorSelection = saveSelection;
            component.range = injectedRange;
            component['specificKeyStrokes'] = '';
            component['KeyStrokeActions'] = null;
            component['mentionValue'] = null;
            component['lookupCharacter'] = null;
            component['CodeAction'] = '';
            component['isCached'] = null;
            // fixture.detectChanges();
        }
    ));
    it('component initialization', () => {
        expect(component).toBeDefined();
    });

    xdescribe('when calling onKeyUp...', () => {
        let contextService: ContextService;
        beforeEach(inject([ContextService], (injectContextService: ContextService) => {
            contextService = injectContextService;
            spyOn(contextService, 'saveDataChangeState').and.stub();
            spyOn(eventsListener, 'onEventUpdate').and.stub();
            spyOn(component, 'handleKeyboardEvent').and.stub();
            spyOn(richTextEditor, 'getCharCount').and.stub();
            spyOn(dialogRef, 'hide').and.stub();
            component.isKeyStroke = true;
        }));

        it('should behave this way on printable key ', () => {
            component.onKeyUp({ which: 65, key: 'a' });
            expect(component.dialogRef.hide).toHaveBeenCalled();
            expect(component.field.isDirty).toBeTruthy();
            expect(contextService.saveDataChangeState).toHaveBeenCalled();
        });

        it('should behave this way on a non-printable key', () => {
            component.isKeyStroke = false;
            component.onKeyUp({ which: 3 });
            expect(component.handleKeyboardEvent).toHaveBeenCalled;
        });
    });

    xdescribe('when calling handleKeyboardEvent', () => {
        let contextService: ContextService;
        beforeEach(inject([ContextService], (injectContextService: ContextService) => {
            contextService = injectContextService;
            component.suggestions = [];
            spyOn(component, 'onValueSelect').and.stub();
            spyOn(contextService, 'saveDataChangeState').and.stub();
            spyOn(dialogRef, 'hide').and.stub();
        }));

        xit('should behave this way when escape key is pressed', () => {
            component.handleKeyboardEvent(event);

            expect(component['escapePressed']).toBeTruthy();
            expect(component.dialogRef.hide).toHaveBeenCalled();
        });

        it('should set the currentListIndex to 1 when down arrow key is pressed and there are suggestions', () => {
            event['which'] = 40;
            event['key'] = 'ArrowDown';
            component.currentListIndex = 0;
            component.suggestions = ['dummySuggestion'];
            component.handleKeyboardEvent(event);

            expect(component.currentListIndex).toBe(1);
        });

        it('should set currentListIndex to 0 when down arrow key is pressed and there are no suggestions', () => {
            event['which'] = 40;
            event['key'] = 'ArrowDown';
            component.suggestions = false;
            component.handleKeyboardEvent(event);

            expect(component.currentListIndex).toBe(0);
        });

        it('should set currentListIndex to 0 when up arrow key is pressed and currentListIndex is > 0', () => {
            event['which'] = 38;
            event['key'] = 'ArrowUp';
            component.currentListIndex = 1;
            component.handleKeyboardEvent(event);

            expect(component.currentListIndex).toBe(0);
        });

        it('should behave this way when enter key is pressed', () => {
            event['which'] = 13;
            event['key'] = 'Enter';
            component.suggestions = ['dummySuggestion'];
            component.handleKeyboardEvent(event);

            expect(component.field.isDirty).toBeTruthy();
            expect(contextService.saveDataChangeState).toHaveBeenCalled();
            expect(component.onValueSelect).toHaveBeenCalled();
        });

        it('should mark as dirty when enter key is pressed and the suggestion panel is not visible', () => {
            component.dialogRef['visible'] = false;
            event['which'] = 13;
            event['key'] = 'Enter';
            component.handleKeyboardEvent(event);

            expect(component.field.isDirty).toBeTruthy();
        });
    });

    xdescribe('when calling handleSpecificKeyStroke', () => {
        beforeEach(() => {
            event['JSONParameter'] = {
                codecode: 'DummyCodeCode',
                output: 'DummyOutput'
            };
            component.field.CodeValue = 'Hi';
            spyOn<any>(component, 'getQuickText').and.stub();
            component.handleSpecificKeyStroke(event);
        });

        it('should call getQuickText', () => {
            expect<any>(component['getQuickText']).toHaveBeenCalled();
        });
    });

    describe('when calling isLookupEnabled', () => {
        let spyObj: jasmine.Spy;
        beforeEach(() => {
            spyObj = spyOn<any>(component, 'isLookupEnabled').and.callThrough();
        });

        it('should return false when UI Action does not contain lookup', () => {
            component.field.CodeActions = [
                {
                    CodeUIAction: 'TestUIAction'
                }
            ];
            spyOn(Utils, 'getArrayOfProperties').and.returnValue(['TestUIAction']);
            let result = spyObj.call(component);

            expect(result).toBe(false);
        });

        it('should return true when UI Action contains lookup', () => {
            component.field.CodeActions = [
                {
                    CodeUIAction: 'TestLookup'
                }
            ];
            spyOn(Utils, 'getArrayOfProperties').and.returnValue(['TestLookup']);
            let result = spyObj.call(component);

            expect(result).toBe(true);
        });
    });

    xdescribe('when calling isKeyStrokeEnabled', () => {
        let spyObj: jasmine.Spy;
        beforeEach(() => {
            spyObj = spyOn<any>(component, 'isKeyStrokeEnabled').and.callThrough();
        });

        it('should return false when UI Action does not contain Specific Keystroke', () => {
            component.field.CodeActions = [
                {
                    CodeUIAction: 'TestUIAction'
                }
            ];
            spyOn(Utils, 'getArrayOfProperties').and.returnValue(['TestUIAction']);
            let result = spyObj.call(component);

            expect(result).toBe(false);
        });

        it('should return true when UI Action contains Specific Keystroke', () => {
            component.field.CodeActions = [
                {
                    CodeUIAction: 'Specific Keystroke'
                }
            ];
            spyOn(Utils, 'getArrayOfProperties').and.returnValue(['Specific Keystroke']);
            let result = spyObj.call(component);

            expect(result).toBe(true);
        });
    });

    describe('when calling getKeyStrokeActions', () => {
        let spyObj: jasmine.Spy;
        beforeEach(() => {
            spyObj = spyOn<any>(component, 'getKeyStrokeActions').and.callThrough();
        });

        it('should return the LookupCharacter when UI Action is Specific Keystroke', () => {
            component.field.CodeActions = dummyCodeAction;
            component.field.allActions = component.field.CodeActions;
            spyObj.call(component);

            expect(component['KeyStrokeActions']).toEqual(dummyCodeAction);
            expect(component['specificKeyStrokes']).toEqual([]);
            expect(component.field.allActions).toEqual(dummyCodeAction);
        });

        xit('should return the LookupCharacter when UI Action is Specific Keystroke', () => {
            dummyCodeAction[0]['LookupCharacter'] = '!!';
            component.field.CodeActions = dummyCodeAction;
            component.field.allActions = component.field.CodeActions;
            spyObj.call(component);

            expect(component['KeyStrokeActions']).toEqual(dummyCodeAction);
            expect(component['specificKeyStrokes']).toEqual(['!!']);
            expect(component.field.allActions).toEqual(dummyCodeAction);
        });
    });

    /**
     * This method cannot yet be unit tested as it is using jQuery
     * need to be able to test jQuery which might include installing a new package
     */
    //     describe('when calling onValueSelect', () => {
    //       // let divObj = document.createElement('div');

    //       beforeEach(() => {
    //         component['CodeAction'] = dummyCodeAction;
    //         component.panel = null;
    //         component.field.CodeDescription = 'Code';
    //         // divObj.setAttribute('class', 'Code');
    //         var dummyElement = document.createElement('div').setAttribute('class', 'Code');
    // document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);

    //   // expect(node.val()).toEqual('bar');
    //         spyOn(Utils, 'fetchTask').and.returnValue('dummyTask');
    //         spyOn<any>(component, 'executeTasks').and.stub();
    //       });

    //       it('should behave this way there is output parameter on CodeActions', () => {
    //         component.onValueSelect({}, panel);

    //         expect(component.panel).toEqual(panel);
    //         expect<any>(component['executeTasks']).toHaveBeenCalledWith('dummyTask', 'set', {}, 'value');
    //       });
    //     });

    xdescribe('when calling executeTasks', () => {
        let spyObj: jasmine.Spy;
        beforeEach(() => {
            component['mentionValue'] = 'dummyValue';
            spyObj = spyOn<any>(component, 'executeTasks').and.callThrough();
            spyOn<any>(component, 'getQuickText').and.stub();
            spyOn<any>(component, 'getSignature').and.stub();
            spyOn<any>(component, 'getQuickEmailLookup').and.stub();
        });

        it('should call getQuickText when task is Quick Text and operation is fetch', () => {
            spyObj.call(component, 'Quick Text', 'fetch');

            expect<any>(component['getQuickText']).toHaveBeenCalledWith(
                undefined,
                'dummyValue',
                undefined
            );
        });

        it('should call getQuickText when task is Quick Text and operation is set', () => {
            spyObj.call(component, 'Quick Text', 'set', {}, []);

            expect<any>(component['getQuickText']).toHaveBeenCalledWith({}, undefined, []);
        });

        it('should call getSignature when task is Signature and operation is fetch', () => {
            spyObj.call(component, 'Signature', 'fetch');

            expect<any>(component['getSignature']).toHaveBeenCalledWith(
                undefined,
                'dummyValue',
                undefined
            );
        });

        it('should call getSignature when task is Quick Text and operation is set', () => {
            spyObj.call(component, 'Signature', 'set', {}, []);

            expect<any>(component['getSignature']).toHaveBeenCalledWith({}, undefined, []);
        });

        it('should call getQuickEmailLookup when task is QuickEmailLookup and operation is fetch', () => {
            spyObj.call(component, 'QuickEmailLookup', 'fetch');

            expect<any>(component['getQuickEmailLookup']).toHaveBeenCalledWith(
                undefined,
                'dummyValue'
            );
        });

        it('should call getQuickEmailLookup when task is QuickEmailLookup and operation is set', () => {
            spyObj.call(component, 'QuickEmailLookup', 'set', {}, []);

            expect<any>(component['getQuickEmailLookup']).toHaveBeenCalledWith({}, undefined);
        });
    });

    xdescribe('when calling getSignature', () => {
        let spyObj: jasmine.Spy;
        let signature = {
            label: 'testSignatureLabel',
            SignatureName: 'testSignatureName'
        };

        beforeEach(() => {
            let store = {
                CurrentUser:
                    '{ "Signatures": [{ "SignatureName" : "sig1"}, { "SignatureName" : "sig2"}]}'
            };
            spyObj = spyOn<any>(component, 'getSignature').and.callThrough();
            spyOn<any>(component, 'replaceSignatureWithValue').and.stub();
            spyOn<any>(component, 'fetchKeyStrokeSuggestions').and.stub();
            spyOn<any>(component, 'showSuggestionsPanel').and.stub();
            spyOn(localStorage, 'getItem').and.callFake(function (key) {
                return store[key];
            });
        });

        it('should call replaceSignatureWithValue when output is value', () => {
            spyObj.call(component, signature, ['a', 'b', 'c'], 'value');

            expect<any>(component['replaceSignatureWithValue']).toHaveBeenCalledWith(
                'testSignatureLabel'
            );
        });

        it('should behave like this if output is undefined and CodeAction has Signature', () => {
            component['CodeAction'] = {
                Task: {
                    CodeCode: 'Signature'
                },
                CodeCacheData: true
            };
            spyObj.call(component, signature, ['a', 'b', 'c']);

            expect(component['isCached']).toBe(true);
            expect<any>(component['showSuggestionsPanel']).toHaveBeenCalled();
            expect(component['suggestions']).toEqual([{ label: 'sig1' }, { label: 'sig2' }]);
        });

        it('should behave like this if output is undefined and CodeAction does not have Signature ', () => {
            component['CodeAction'] = {};
            spyObj.call(component, signature, ['a', 'b', 'c']);

            expect(component['isCached']).toBe(false);
            expect<any>(component['fetchKeyStrokeSuggestions']).toHaveBeenCalledWith({
                suggestion: ['a', 'b', 'c']
            });
        });
    });

    xdescribe('when calling getQuickEmailLookup', () => {
        let spyObj: jasmine.Spy;
        let email = {
            label: 'testEmail'
        };

        beforeEach(() => {
            spyObj = spyOn<any>(component, 'getQuickEmailLookup').and.callThrough();
            spyOn<any>(component, 'replaceQuickTextWithValue').and.stub();
            spyOn<any>(component, 'fetchKeyStrokeSuggestions').and.stub();
        });

        it('should call replaceQuickTextWithValue when selectedEmail is not undefined', () => {
            spyObj.call(component, email, ['a', 'b', 'c']);

            expect<any>(component['replaceQuickTextWithValue']).toHaveBeenCalledWith('testEmail');
        });

        it('should call fetchKeyStrokeSuggestions when selectedEmail is undefined', () => {
            spyObj.call(component, undefined, ['a', 'b', 'c']);

            expect<any>(component['fetchKeyStrokeSuggestions']).toHaveBeenCalledWith({
                suggestion: ['a', 'b', 'c']
            });
        });
    });

    xdescribe('when calling replaceQuickTextsIfAvailable', () => {
        let spyObj: jasmine.Spy;
        let uiActionService: UIActionService;

        beforeEach(inject([UIActionService], (injectUIActionService: UIActionService) => {
            uiActionService = injectUIActionService;
            component['lookupCharacter'] = '!';
            spyObj = spyOn<any>(component, 'replaceQuickTextsIfAvailable').and.callThrough();
            spyOn<any>(component, 'getQuickText').and.stub();
            spyOn(uiActionService, 'getLookupCharacterIfReplaceQuickTextAction').and.stub();
            spyObj.call(component);
        }));

        it('should call getLookupCharacterIfReplaceQuickTextAction', () => {
            expect(uiActionService.getLookupCharacterIfReplaceQuickTextAction).toHaveBeenCalled();
            expect<any>(component['getQuickText']).toHaveBeenCalled;
        });
    });

    xdescribe('when calling getQuickText', () => {
        let spyObj: jasmine.Spy;
        let inputText = {
            label: 'testInput',
            text: 'testInputText'
        };
        let quickTextHandler: QuickTextHandlerService;

        beforeEach(inject(
            [QuickTextHandlerService],
            (injectQuickTextHandlerService: QuickTextHandlerService) => {
                quickTextHandler = injectQuickTextHandlerService;
                component['lookupCharacter'] = '!';
                spyObj = spyOn<any>(component, 'getQuickText').and.callThrough();
                spyOn<any>(component, 'replaceQuickTextWithTag').and.stub();
                spyOn<any>(component, 'replaceQuickTextWithValue').and.stub();
                spyOn<any>(component, 'fetchKeyStrokeSuggestions').and.stub();
                spyOn(quickTextHandler, 'implementQuickText').and.stub();
                spyOn(quickTextHandler, 'getComputedValue').and.stub();
            }
        ));

        it('should call replaceQuickTextWithTag when output is tag', () => {
            spyObj.call(component, inputText, ['a', 'b', 'c'], 'tag');

            expect<any>(component['replaceQuickTextWithTag']).toHaveBeenCalledWith('!testInput! ');
        });

        it('should call replaceQuickTextWithValue when output is value', () => {
            spyObj.call(component, inputText, ['a', 'b', 'c'], 'value');

            expect(quickTextHandler.implementQuickText).toHaveBeenCalled();
            expect<any>(component['replaceQuickTextWithValue']).toHaveBeenCalled();
        });

        it('should call replaceQuickTextWithValue when output is replace', () => {
            component.field.CodeValue = '!Value!';
            spyObj.call(component, inputText, ['a', 'b', 'c'], 'replace');

            expect(quickTextHandler.getComputedValue).toHaveBeenCalled();
        });

        it('should call replaceQuickTextWithValue when output is undefined', () => {
            component.field.CodeValue = 'Value';
            component['CodeAction'] = null;
            spyObj.call(component, inputText, ['a', 'b', 'c']);

            expect(component['isCached']).toBe(false);
            expect<any>(component['fetchKeyStrokeSuggestions']).toHaveBeenCalled();
        });
    });

    xdescribe('when calling replaceQuickTextWithTag', () => {
        let spyObj: jasmine.Spy;

        beforeEach(() => {
            component['lookupCharacter'] = '';
            component['mentionValue'] = '';
            spyOn(component.editor, 'executeCommand').and.stub();
            spyOn(component.saveSelection, 'restore').and.stub();
            spyObj = spyOn<any>(component, 'replaceQuickTextWithTag').and.callThrough();
        });

        it('should set editor valueTemplate with input', () => {
            spyObj.call(component, 'DummyText');

            expect(component.editor['executeCommand']).toHaveBeenCalled();
            expect(component.saveSelection['restore']).toHaveBeenCalled();
        });
    });

    xdescribe('when calling replaceSignatureWithValue', () => {
        let spyObj: jasmine.Spy;

        beforeEach(() => {
            component['lookupCharacter'] = '';
            component['mentionValue'] = '';
            spyOn(component.editor, 'executeCommand').and.stub();
            spyOn(component.saveSelection, 'restore').and.stub();
            spyOn(Utils, 'getSignatureContent').and.returnValue('DummyText');
            spyObj = spyOn<any>(component, 'replaceSignatureWithValue').and.callThrough();
        });

        it('should set editor valueTemplate with input', () => {
            spyObj.call(component, 'DummyText');

            expect(component.saveSelection['restore']).toHaveBeenCalled();
            expect(component.editor['executeCommand']).toHaveBeenCalled();
        });
    });

    xdescribe('when calling replaceQuickTextWithValue', () => {
        let spyObj: jasmine.Spy;

        beforeEach(() => {
            component['lookupCharacter'] = '';
            component['mentionValue'] = '';
            spyObj = spyOn<any>(component, 'replaceQuickTextWithValue').and.callThrough();
            spyOn(component.editor, 'executeCommand').and.stub();
            spyOn(component.saveSelection, 'restore').and.stub();
        });

        it('should set editor valueTemplate with input', () => {
            spyObj.call(component, 'DummyText');

            expect(component.saveSelection['restore']).toHaveBeenCalled();
            expect(component.editor['executeCommand']).toHaveBeenCalled();
        });
    });

    xdescribe('when calling fetchKeyStrokeSuggestions', () => {
        let spyObj: jasmine.Spy;
        beforeEach(() => {
            spyObj = spyOn<any>(component, 'fetchKeyStrokeSuggestions').and.callThrough();
            component['currentPage'] = { CodeElement: '' };
            component.dialogRef.visible = true;
            let dat: DOMRect = {
                height: 0,
                width: 0,
                x: 0,
                y: 0,
                bottom: 0,
                left: 0,
                right: 0,
                top: 0,

                toJSON: () => {}
            };
            spyOn(component.range, 'getBoundingClientRect').and.returnValue(dat);
            spyOn(component.editorSelection, 'getRange').and.returnValue(component.range);
            spyOn(component.editorSelection, 'save').and.returnValue(component.saveSelection);
            spyOn(component.dialogRef, 'show').and.stub();
            spyOn(component.dialogRef, 'hide').and.stub();
        });
        it('should set options', fakeAsync(
            inject([CollectionsService], (collectionsService: CollectionsService) => {
                spyOn(collectionsService, 'loadFieldOptions').and.returnValue(
                    of({ body: '{"options":{}}' })
                );
                spyOn(Utils, 'parseOptions').and.returnValue({
                    options: [{ _id: 'vdhutersdf-9s98-s577-r6t9y.08' }],
                    value: {}
                });
                let data: any = [{ _id: 'vdhutersdf-9s98-s577-r6t9y.08' }];
                spyObj.call(component, '');
                expect(component.field.options).toEqual(data);
            })
        ));
        it('should not set options', fakeAsync(
            inject([CollectionsService], (collectionsService: CollectionsService) => {
                spyOn(collectionsService, 'loadFieldOptions').and.returnValue(
                    of({ body: '{"options":null}' })
                );
                spyObj.call(component, '');
                expect(component.field.options).toBeNull();
            })
        ));
    });

    describe('when calling showSuggestionsPanel', () => {
        let spyObj: jasmine.Spy;
        beforeEach(() => {
            spyObj = spyOn<any>(component, 'showSuggestionsPanel').and.callThrough();
            spyOn(component.editorSelection, 'getRange').and.returnValue(component.range);
            spyOn(component.editorSelection, 'save').and.returnValue(component.saveSelection);
            let dat: DOMRect = {
                height: 0,
                width: 0,
                x: 0,
                y: 0,
                bottom: 0,
                left: 0,
                right: 0,
                top: 0,

                toJSON: () => {}
            };
            spyOn(component.range, 'getBoundingClientRect').and.returnValue(dat);
            spyOn(component.dialogRef, 'show').and.stub();
            spyOn(component.dialogRef, 'hide').and.stub();
        });

        it('should show the panel if there are suggestions', () => {
            component['suggestions'] = ['a', 'b', 'c'];
            spyObj.call(component, '');

            expect(component.dialogRef['show']).toHaveBeenCalled();
            expect(component.dialogRef['hide']).not.toHaveBeenCalled();
        });

        it('should hide the panel if there are no suggestions', () => {
            component['suggestions'] = [];
            spyObj.call(component, '');

            expect(component.dialogRef['show']).not.toHaveBeenCalled();
            expect(component.dialogRef['hide']).toHaveBeenCalled();
        });
    });

    /**
     * Cannot cover this method yet due to jQuery being used in the method
     */

    // describe('when calling onValueSelectOfSuggestion', () => {
    //   let spyObj: jasmine.Spy;
    //   beforeEach(() => {
    //     component['CodeAction'] = dummyCodeAction;
    //     spyObj = spyOn<any>(component, 'showOverlayPanel').and.callThrough();
    //     spyOn(Utils, 'adjustOverlayPanel').and.returnValue('task');
    //     spyOn<any>(component, 'executeTasks').and.stub();
    //   });

    //   it('should behave this way when called', () => {

    //   });

    // });
});

export class MockElementRef extends ElementRef {
    constructor() {
        super(null);
    }
}
