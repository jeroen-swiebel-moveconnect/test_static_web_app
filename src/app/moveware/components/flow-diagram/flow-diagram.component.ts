import {
    AfterContentInit,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    ViewChild,
    SimpleChanges,
    EventEmitter,
    OnInit
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

/**
 * You may include a different variant of BpmnJS:
 *
 * bpmn-viewer  - displays BPMN diagrams without the ability
 *                to navigate them
 * bpmn-modeler - bootstraps a full-fledged BPMN editor
 */
import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';

import { importDiagram } from './flow-diagram-resolver';

import { throwError } from 'rxjs';
import { environment, apiContext } from 'src/environments/environment';

@Component({
    selector: 'flow-diagram',
    templateUrl: './flow-diagram.component.html',
    styleUrls: ['./flow-diagram.component.scss']
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy, OnInit {
    private bpmnJS: BpmnJS;
    fileNames = {
        'Move Process': 'Move_Process.bpmn20.xml',
        'Add a new Lead': 'Add_a_new_Lead.bpmn20.xml'
    };

    @Input() currentRecord: any;
    @ViewChild('ref', { static: true }) private el: ElementRef;
    constructor(private http: HttpClient) {}

    ngAfterContentInit(): void {
        this.bpmnJS.attachTo(this.el.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges) {
        // if (changes.diagramUrl) {
        //   this.loadUrl(changes.diagramUrl.currentValue);
        // }
    }
    ngOnInit() {
        this.bpmnJS = new BpmnJS({
            container: 'body'
        });

        this.bpmnJS.on('import.done', ({ error }) => {
            if (!error) {
                this.bpmnJS.get('canvas').zoom('fit-viewport');
            }
        });
        this.loadUrl(this.diagramUrl + this.fileNames[this.currentRecord.Name]);
    }
    ngOnDestroy(): void {
        this.bpmnJS.destroy();
    }

    /**
     * Load diagram from URL and emit completion event
     */
    loadUrl(url) {
        return this.http
            .get(url, { responseType: 'text' })
            .pipe(
                catchError((err) => throwError(err)),
                importDiagram(this.bpmnJS)
            )
            .subscribe(
                (warnings) => {
                    this.handleImported({
                        type: 'success',
                        warnings
                    });
                },
                (err) => {
                    this.handleImported({
                        type: 'error',
                        error: err
                    });
                }
            );
    }
    diagramUrl =
        environment.FRAMEWORK_QUERY_ROOT +
        '/' +
        (apiContext.CONTEXT_ROOT_REQUIRED ? apiContext.FRAMEWORK_QUERY + '/' : '') +
        'workflow/download?file_name=';
    importError?: Error;

    handleImported(event) {
        const { type, error, warnings } = event;

        if (type === 'success') {
            console.log(`Rendered diagram (%s warnings)`, warnings.length);
        }

        if (type === 'error') {
            console.log('Failed to render diagram', error);
        }

        this.importError = error;
    }
}
