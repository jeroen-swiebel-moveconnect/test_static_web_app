import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { HomeComponent } from './components/home/home.component';
import { MWComponent } from './components/mw-component/mw.component';
export const AppRoutes: Routes = [
    {
        path: '',
        component: MWComponent,
        canLoad: [AuthGuard],
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'menu/Home', pathMatch: 'full' },
            { path: 'menu/Home', component: HomeComponent },
            { path: 'menu', redirectTo: 'menu/Home', pathMatch: 'full' },
            { path: 'menu/:menu/:subMenu/:subSubmenu', component: HomeComponent },
            { path: 'menu/:menu/:subMenu', component: HomeComponent },
            { path: 'menu/:menu', component: HomeComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(AppRoutes)],
    exports: [RouterModule]
})
export class MWRoutingModule {}
