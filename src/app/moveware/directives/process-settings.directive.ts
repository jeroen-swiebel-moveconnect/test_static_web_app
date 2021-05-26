import {
    Directive,
    ElementRef,
    Input,
    Renderer2,
    HostBinding,
    Output,
    EventEmitter,
    SimpleChanges
} from '@angular/core';
//import { Engine } from 'json-rules-engine'

import Utils from '../services/utils';
import { RuleEngineService } from '../services/rule-engine.service';

@Directive({
    selector: '[process-settings]'
})
export class ProcessSettingsDirective {
    @Input('record') row: any;
    @Input('column') column: any;
    @Input('value') value: any;
    @Output() columnChange = new EventEmitter<any>();
    constructor(private elementRef: ElementRef, private ruleEngineService: RuleEngineService) {}
    ngOnInit() {
        this.appendClasses(this.elementRef);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.value && !changes.value.firstChange) {
            console.log(this.column);
            this.appendClasses(this.elementRef);
        }
    }

    private appendClasses(elementRef) {
        let _column = Utils.getCopy(this.column);
        if (!Utils.isArrayEmpty(this.column.CodeSettings)) {
            this.getDynamicStyles(_column, this.row, this.column.CodeSettings, elementRef);
        }
    }
    private getDynamicStyles(field, row, settings, elementRef) {
        let classes = [];
        settings.forEach(async (setting) => {
            let targetField =
                setting && setting['SettingField'] ? setting['SettingField'].CodeCode : null;
            let targetValue =
                setting && setting['SettingValue'] ? setting['SettingValue'].CodeCode : null;
            if (setting.SettingRule) {
                let facts = {};
                let ruleConditions = Utils.getRuleFactKeys(setting.SettingRule);
                if (!Utils.isArrayEmpty(ruleConditions)) {
                    ruleConditions.forEach((condition) => {
                        let actualValue = row[condition];
                        facts[condition] = actualValue ? actualValue : '';
                        let rule = this.ruleEngineService.runRule(setting.SettingRule, facts);
                        rule.then((results) => {
                            if (results && results.events.length) {
                                field[targetField] = targetValue;
                                let styleClass = 'data' + field._id + setting._id;
                                elementRef.nativeElement.classList.add(styleClass);
                            } else {
                                if (this.column.OriginalColumn) {
                                    field[targetField] = this.column.OriginalColumn[targetField];
                                }
                                let styleClass = 'data' + field._id + setting._id;
                                elementRef.nativeElement.classList.remove(styleClass);
                            }
                        });
                        this.columnChange.emit(field);
                    });
                }
            }
        });
        // return classes;
    }
}
