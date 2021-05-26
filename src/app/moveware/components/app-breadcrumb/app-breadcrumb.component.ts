import { Component, OnInit } from '@angular/core';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { Router } from '@angular/router';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { HeaderListenerService } from 'src/app/moveware/services';

@Component({
    selector: 'breadcrumb',
    templateUrl: './app-breadcrumb.component.html',
    styleUrls: ['./app-breadcrumb.component.scss']
})
export class AppBreadcrumbComponent implements OnInit {
    public breadcrumbItems: any[];
    public selectedRecord: any = {};

    constructor(
        private menuService: MenuService,
        public headerListenerService: HeaderListenerService,
        private toastService: ToastService,
        private router: Router,
        private mapping: PageMappingService
    ) {
        this.breadcrumbItems = [];
        this.headerListenerService.headerUpdateListener.subscribe((data) =>
            this.setSelctedRecord(data)
        );
        this.headerListenerService.headerMenuListener.subscribe((data) => {
            setTimeout(() => {
                this.setSelctedRecord(data);
                this.getBreadCrumbItems(data);
            }, 100);
        });
    }

    public setSelctedRecord(data) {
        this.selectedRecord = data;
        let selectors = this.mapping.getViewSelectors(data.containerID);
        let record = '';
        selectors &&
            selectors.forEach((selector) => {
                let value = data[selectors] || '';
                if (typeof value === 'string') {
                    record += value;
                } else if (typeof value === 'object') {
                    record += value.CodeDescription;
                }
            });
        this.selectedRecord['selectedRecordType'] = record;
    }

    ngOnInit() {
        const currentRouteUrl = this.router.routerState.snapshot.url;
        let code = currentRouteUrl.substring(
            currentRouteUrl.lastIndexOf('/') + 1,
            currentRouteUrl.indexOf('?')
        );
        if (code.includes('%20')) {
            code = code.replace('%20', ' ');
        }
        this.getBreadCrumbItems({ CodeCode: code });
    }

    getBreadcrumb(menus, code) {
        if (code.indexOf('/') < 0) {
            menus.subMenus.forEach((level2) => {
                if (level2.CodeCode === code) {
                    this.breadcrumbItems.push(level2);
                }
            });
        } else {
            menus.subMenus.forEach((level2) => {
                if (level2.CodeCode === code.substring(0, code.indexOf('/'))) {
                    this.breadcrumbItems.push(level2);
                    if (code.includes('%20')) {
                        code = code.replace('%20', ' ');
                    }
                    this.getBreadcrumb(level2, code.substring(code.indexOf('/') + 1));
                }
            });
        }
    }

    private getBreadCrumbItems(menu) {
        const currentRouteUrl = this.router.routerState.snapshot.url;
        let menuCode = currentRouteUrl.substring(
            currentRouteUrl.indexOf('mw/menu/') + 8,
            currentRouteUrl.indexOf('?')
        );
        this.breadcrumbItems = [];
        let _breadcrumb = [];
        this.menuService.getMenus().then(
            (menus) => {
                menus.MenuItems.forEach((level1) => {
                    level1.breadcrumbItem = level1.CodeDescription;
                    if (level1.CodeCode === menu.CodeCode) {
                        this.breadcrumbItems.push(level1);
                        return _breadcrumb;
                    } else if (level1.CodeCode === menuCode.substring(0, menuCode.indexOf('/'))) {
                        if (menuCode.includes('%20')) {
                            menuCode = menuCode.replace('%20', ' ');
                        }
                        this.breadcrumbItems.push(level1);
                        this.getBreadcrumb(
                            level1,
                            menuCode.substring(menuCode.indexOf('/') + 1, menuCode.length)
                        );
                    }
                });
            },
            (errorResponse) => {
                this.toastService.showCustomToast('error', errorResponse);
            }
        );
    }
}
