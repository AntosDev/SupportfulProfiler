import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignmentListComponent } from './components/assignment-list/assignment-list.component';
import { AssignmentDetailComponent } from './components/assignment-detail/assignment-detail.component';
import { AssignmentFormComponent } from './components/assignment-form/assignment-form.component';

const routes: Routes = [
  {
    path: '',
    component: AssignmentListComponent
  },
  {
    path: 'new',
    component: AssignmentFormComponent
  },
  {
    path: ':id',
    component: AssignmentDetailComponent
  },
  {
    path: ':id/edit',
    component: AssignmentFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignmentsRoutingModule { }
