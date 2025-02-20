import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage
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
