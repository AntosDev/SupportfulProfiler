import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AssignmentService } from '../../services/assignment.service';
import { ProfileService } from '../../../profiles/services/profile.service';
import { ClientService } from '../../../clients/services/client.service';
import { Assignment } from '../../../../shared/interfaces/assignment.interface';
import { Profile } from '../../../../shared/interfaces/profile.interface';
import { Client } from '../../../../shared/interfaces/client.interface';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-assignment-form',
  templateUrl: './assignment-form.component.html',
  styleUrls: ['./assignment-form.component.scss'],
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
export class AssignmentFormComponent implements OnInit {
  assignmentForm: FormGroup;
  isEdit = false;
  loading = false;
  assignmentId?: string;
  profiles: Profile[] = [];
  clients: Client[] = [];

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private profileService: ProfileService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    this.assignmentForm = this.fb.group({
      profileId: ['', Validators.required],
      clientId: ['', Validators.required],
      position: ['', Validators.required],
      rate: [null, [Validators.required, Validators.min(0)]],
      startDate: [dateString, Validators.required],
      endDate: [null],
      workType: ['remote', Validators.required],
      status: ['proposed', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfiles();
    this.loadClients();

    const id = this.route.snapshot.paramMap.get('id');
    this.assignmentId = id || undefined;
    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    const profileId = this.route.snapshot.queryParamMap.get('profileId');

    if (clientId) {
      this.assignmentForm.patchValue({ clientId });
    }
    if (profileId) {
      this.assignmentForm.patchValue({ profileId });
    }

    if (this.assignmentId) {
      this.isEdit = true;
      this.loadAssignment(this.assignmentId);
    }
  }

  private loadProfiles(): void {
    this.profileService.getProfiles().subscribe({
      next: (profiles) => this.profiles = profiles,
      error: (error) => console.error('Error loading profiles:', error)
    });
  }

  private loadClients(): void {
    this.clientService.getClients().subscribe({
      next: ([clients]) => this.clients = clients,
      error: (error) => console.error('Error loading clients:', error)
    });
  }

  private loadAssignment(id: string): void {
    this.loading = true;
    this.assignmentService.getAssignment(id).subscribe({
      next: (assignment) => {
        this.assignmentForm.patchValue({
          profileId: assignment.profile.id,
          clientId: assignment.client.id,
          position: assignment.additionalInfo?.position || '',
          rate: assignment.rate,
          startDate: assignment.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : null,
          endDate: assignment.endDate ? new Date(assignment.endDate).toISOString().split('T')[0] : null,
          workType: assignment.additionalInfo?.workType || 'remote',
          status: assignment.status
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assignment:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.assignmentForm.valid) {
      const formValue = this.assignmentForm.value;
      const { position, workType, ...rest } = formValue;
      
      const assignmentData = {
        ...rest,
        startDate: formValue.startDate,
        endDate: formValue.endDate || null,
        additionalInfo: {
          position,
          workType
        }
      };

      this.loading = true;
      if (this.isEdit && this.assignmentId) {
        this.assignmentService.updateAssignment(this.assignmentId, assignmentData).subscribe({
          next: () => this.handleSuccess(),
          error: (error) => this.handleError(error)
        });
      } else {
        this.assignmentService.createAssignment(assignmentData).subscribe({
          next: () => this.handleSuccess(),
          error: (error) => this.handleError(error)
        });
      }
    }
  }

  private handleSuccess(): void {
    this.loading = false;
    this.router.navigate(['/assignments']);
  }

  private handleError(error: any): void {
    console.error('Error saving assignment:', error);
    this.loading = false;
  }

  cancel(): void {
    this.router.navigate(['/assignments']);
  }
}
