import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'profiles',
    pathMatch: 'full'
  },
  {
    path: 'profiles',
    loadChildren: () => import('./features/profiles/profiles.module').then(m => m.ProfilesModule)
  },
  {
    path: 'clients',
    loadChildren: () => import('./features/clients/clients.module').then(m => m.ClientsModule)
  },
  {
    path: 'assignments',
    loadChildren: () => import('./features/assignments/assignments.module').then(m => m.AssignmentsModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
