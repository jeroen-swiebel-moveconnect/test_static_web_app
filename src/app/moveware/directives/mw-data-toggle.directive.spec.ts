import { MwDataToggleDirective } from './mw-data-toggle.directive';
import { QuickMenuToggleService } from '../services/quick-menu-toggle-listener.service';

describe('MwDataToggleDirective', () => {
    it('should create an instance', () => {
        const quickmenuToggleSvc = new QuickMenuToggleService();
        const directive = new MwDataToggleDirective(quickmenuToggleSvc);
        expect(directive).toBeTruthy();
    });
});
