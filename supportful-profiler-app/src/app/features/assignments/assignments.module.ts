import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AssignmentsRoutingModule } from './assignments-routing.module';
import { AssignmentListComponent } from './components/assignment-list/assignment-list.component';
import { AssignmentDetailComponent } from './components/assignment-detail/assignment-detail.component';
import { AssignmentFormComponent } from './components/assignment-form/assignment-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AssignmentsRoutingModule,
    AssignmentListComponent,
    AssignmentDetailComponent,
    AssignmentFormComponent
  ]
})
export class AssignmentsModule { }
