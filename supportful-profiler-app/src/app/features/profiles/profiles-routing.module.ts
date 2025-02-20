import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { ProfileDetailComponent } from './components/profile-detail/profile-detail.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileListComponent
  },
  {
    path: 'new',
    component: ProfileFormComponent
  },
  {
    path: ':id',
    component: ProfileDetailComponent
  },
  {
    path: ':id/edit',
    component: ProfileFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfilesRoutingModule { }
