import { NgModule } from '@angular/core';

import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './auth/auth-guard.service';
export const LoginRoutes: Routes = [
    { path: '', redirectTo: 'mw', pathMatch: 'full' },
    {
        path: 'mw',
        canLoad: [AuthGuard],
        loadChildren: () => import(`./moveware/app.module`).then((m) => m.AppModule),
        data: { preload: true }
    }
];

@NgModule({
    imports: [RouterModule.forRoot(LoginRoutes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class LoginRoutingModule {}
