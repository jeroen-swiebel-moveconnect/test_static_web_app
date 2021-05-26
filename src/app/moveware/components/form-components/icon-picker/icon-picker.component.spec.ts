import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconPickerComponent } from './icon-picker.component';
import { CollectionsService } from 'src/app/moveware/services';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { JSONParserPipe } from 'src/app/moveware/pipes/json-parser.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { TestingModule } from '../../../app-testing.module';
xdescribe('IconPickerComponent', () => {
    let component: IconPickerComponent;
    let fixture: ComponentFixture<IconPickerComponent>;
    let iconFiled: any;
    let iconList = [
        {
            description: 'Web app',
            iconClass: 'fa fa-truck',
            icons: [
                { description: 'filter', class: 'fa fa-filter' },
                { description: 'search', class: 'fa fa-search' },
                { description: 'plus', class: 'fa fa-plus' },
                { description: 'save', class: 'fa fa-save' },
                { description: 'info', class: 'fa fa-info' },
                { description: 'info-circle', class: 'fa fa-info-circle' },
                { description: 'remove', class: 'fa fa-remove' },
                { description: 'history', class: 'fa fa-history' }
            ]
        },
        {
            description: 'Transportation',
            iconClass: 'fa fa-truck',
            icons: [
                { description: 'ambulance', class: 'fa fa-ambulance' },
                { description: 'automobile', class: 'fa fa-automobile' },
                { description: 'bicycle', class: 'fa fa-bicycle' },
                { description: 'bus', class: 'fa fa-bus' },
                { description: 'cab', class: 'fa fa-cab' },
                { description: 'car', class: 'fa fa-car' },
                { description: 'fighter-jet', class: 'fa fa-fighter-jet' },
                { description: 'motorcycle', class: 'fa fa-motorcycle' },
                { description: 'plane', class: 'fa fa-plane' },
                { description: 'rocket', class: 'fa fa-rocket' },
                { description: 'ship', class: 'fa fa-ship' },
                { description: 'space-shuttle', class: 'fa fa-space-shuttle' },
                { description: 'subway', class: 'fa fa-subway' },
                { description: 'taxi', class: 'fa fa-taxi' },
                { description: 'train', class: 'fa fa-train' },
                { description: 'truck', class: 'fa fa-truck' },
                { description: 'wheelchair', class: 'fa fa-wheelchair' },
                { description: 'wheelchair-alt', class: 'fa fa-wheelchair-alt' }
            ]
        },
        {
            description: 'Form Control',
            iconClass: 'fa fa-truck',
            icons: [
                { description: 'check-square', class: 'fa fa-check-square' },
                { description: 'check-square-o', class: 'fa fa-check-square-o' },
                { description: 'circle', class: 'fa fa-circle' },
                { description: 'circle-o', class: 'fa fa-circle-o' },
                { description: 'dot-circle-o', class: 'fa fa-dot-circle-o' },
                { description: '-minus-square', class: 'fa fa-minus-square' },
                { description: '-minus-square-o', class: 'fa fa-minus-square-o' },
                { description: 'plus-square', class: 'fa fa-plus-square' },
                { description: 'plus-square-o', class: 'fa fa-plus-square-o' },
                { description: 'square', class: 'fa fa-square' },
                { description: 'square-o', class: 'fa fa-square-o' }
            ]
        },
        {
            description: 'Directional',
            iconClass: 'fa fa-truck',
            icons: [
                { description: 'angle-double-down', class: 'fa fa-angle-double-down' },
                { description: 'angle-double-left', class: 'fa fa-angle-double-left' },
                { description: 'angle-double-right', class: 'fa fa-angle-double-right' },
                { description: 'fa-angle-double-up', class: 'fa fa-angle-double-up' },
                { description: 'angle-down', class: 'fa fa-angle-down' },
                { description: 'angle-left', class: 'fa fa-angle-left' },
                { description: '', class: 'fa fa-angle-right' },
                { description: '', class: 'fa fa-angle-up' },
                { description: 'arrow-circle-down', class: 'fa fa-arrow-circle-down' },
                { description: 'arrow-circle-left', class: 'fa fa-arrow-circle-left' },
                { description: 'arrow-circle-o-down', class: 'fa fa-arrow-circle-o-down' },
                { description: 'arrow-circle-o-left', class: 'fa fa-arrow-circle-o-left' },
                { description: 'rrow-circle-o-right', class: 'fa fa-arrow-circle-o-right' },
                { description: 'arrow-circle-o-up', class: 'fa fa-arrow-circle-o-up' },
                { description: 'arrow-circle-right', class: 'fa fa-arrow-circle-right' },
                { description: 'arrow-circle-up', class: 'fa fa-arrow-circle-up' },
                { description: 'arrow-down', class: 'fa fa-arrow-down' },
                { description: 'arrow-left', class: 'fa fa-arrow-left' },
                { description: 'arrow-right', class: 'fa fa-arrow-right' },
                { description: 'arrow-up', class: 'fa fa-arrow-up' },
                { description: 'arrows', class: 'fa fa-arrows' },
                { description: 'arrows-alt', class: 'fa fa-arrows-alt' },
                { description: 'arrows-h', class: 'fa fa-arrows-h' },
                { description: 'arrows-v', class: 'fa fa-arrows-v' },
                { description: 'caret-down', class: 'fa fa-caret-down' },
                { description: 'caret-left', class: 'fa fa-caret-left' },
                { description: 'caret-right', class: 'fa fa-caret-right' },
                { description: 'caret-square-o-down', class: 'fa fa-caret-square-o-down' },
                { description: 'caret-square-o-left', class: 'fa fa-caret-square-o-left' },
                { description: 'caret-square-o-right', class: 'fa fa-caret-square-o-right' },
                { description: 'caret-square-o-up', class: 'fa fa-caret-square-o-up' },
                { description: 'caret-up', class: 'fa fa-caret-up' },
                { description: 'chevron-circle-down', class: 'fa fa-chevron-circle-down' },
                { description: 'chevron-circle-left', class: 'fa fa-chevron-circle-left' },
                { description: 'chevron-circle-right', class: 'fa fa-chevron-circle-right' },
                { description: 'chevron-circle-up', class: 'fa fa-chevron-circle-up' },
                { description: 'chevron-down', class: 'fa fa-chevron-down' },
                { description: 'chevron-left', class: 'fa fa-chevron-left' },
                { description: 'chevron-right', class: 'fa fa-chevron-right' },
                { description: 'chevron-up', class: 'fa fa-chevron-up' },
                { description: 'exchange', class: 'fa fa-exchange' },
                { description: 'hand-o-down', class: 'fa fa-hand-o-down' },
                { description: 'hand-o-left', class: 'fa fa-hand-o-left' },
                { description: 'hand-o-right', class: 'fa fa-hand-o-right' },
                { description: 'hand-o-up', class: 'fa fa-hand-o-up' },
                { description: 'long-arrow-down', class: 'fa fa-long-arrow-down' },
                { description: 'long-arrow-left', class: 'fa fa-long-arrow-left' },
                { description: 'long-arrow-right', class: 'fa fa-long-arrow-right' },
                { description: 'long-arrow-up', class: 'fa fa-long-arrow-up' },
                { description: 'toggle-down', class: 'fa fa-toggle-down' },
                { description: 'toggle-left', class: 'fa fa-toggle-left' },
                { description: 'toggle-right', class: 'fa fa-toggle-right' },
                { description: 'toggle-up', class: 'fa fa-toggle-up' }
            ]
        },

        {
            description: 'Currency',
            iconClass: 'fa fa-truck',
            icons: [
                { description: 'bitcoin', class: 'fa fa-bitcoin' },
                { description: 'btc', class: 'fa fa-btc' },
                { description: 'cny', class: 'fa fa-cny' },
                { description: 'dollar', class: 'fa fa-dollar' },
                { description: 'eur', class: 'fa fa-eur' },
                { description: 'euro', class: 'fa fa-euro' },
                { description: 'gbp', class: 'fa fa-gbp' },
                { description: 'gg', class: 'fa fa-gg' },
                { description: 'gg-circle', class: 'fa fa-gg-circle' },
                { description: 'ils', class: 'fa fa-ils' },
                { description: 'inr', class: 'fa fa-inr' },
                { description: 'jpy', class: 'fa fa-jpy' },
                { description: 'krw', class: 'fa fa-krw' },
                { description: 'money', class: 'fa fa-money' },
                { description: 'rmb', class: 'fa fa-rmb' },
                { description: 'rouble', class: 'fa fa-rouble' },
                { description: 'rub', class: 'fa fa-rub' },
                { description: 'ruble', class: 'fa fa-ruble' },
                { description: 'rupee', class: 'fa fa-rupee' },
                { description: 'shekel', class: 'fa fa-shekel' },
                { description: 'sheqel', class: 'fa fa-sheqel' },
                { description: 'try', class: 'fa fa-try' },
                { description: 'turkish-lira', class: 'fa fa-turkish-lira' },
                { description: 'usd', class: 'fa fa-usd' },
                { description: 'viacoin', class: 'fa fa-viacoin' },
                { description: 'won', class: 'fa fa-won' },
                { description: 'yen', class: 'fa fa-yen' }
            ]
        }
    ];
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [IconPickerComponent, JSONParserPipe],
            providers: [CollectionsService],
            imports: [NoopAnimationsModule, OverlayModule, TestingModule]
        });
        describe;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IconPickerComponent);
        component = fixture.componentInstance;
        iconFiled = {
            code: 'Code.Icon',
            collections: {},
            description: 'Icon',
            formControl: 'icon-picklist',
            inputType: undefined,
            isDirty: false,
            module: 'Module.Codes',
            name: 'icon',
            options: [],
            originalValue: null,
            overrides: [],
            required: false,
            tooltip:
                "The icon field let's one select an icon, it's size and font color for the menus",
            type: 'icon-picklist',
            validations: [],
            value: {},
            visible: false
        };
        // component.field = iconFiled;
        component.iconList = iconList;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
