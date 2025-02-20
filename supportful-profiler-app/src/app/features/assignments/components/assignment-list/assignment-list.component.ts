import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AssignmentService } from '../../services/assignment.service';
import { Assignment } from '../../../../shared/interfaces/assignment.interface';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-assignment-list',
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgFor
  ]
})
export class AssignmentListComponent implements OnInit {
  assignments: Assignment[] = [];
  filterForm: FormGroup;
  loading = false;

  constructor(
    private assignmentService: AssignmentService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      workType: ['']
    });
  }

  ngOnInit(): void {
    this.loadAssignments();
    this.setupSearchSubscription();
  }

  private setupSearchSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadAssignments();
      });
  }

  private loadAssignments(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.assignmentService.getAssignments(filters)
      .subscribe({
        next: (assignments) => {
          this.assignments = assignments;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading assignments:', error);
          this.loading = false;
        }
      });
  }

  viewAssignment(id: number): void {
    this.router.navigate(['/assignments', id]);
  }

  createAssignment(): void {
    this.router.navigate(['/assignments/new']);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: 'success',
      proposed: 'warning',
      interviewing: 'primary',
      offered: 'secondary',
      completed: 'medium',
      terminated: 'danger'
    };
    return colors[status] || 'medium';
  }
}
