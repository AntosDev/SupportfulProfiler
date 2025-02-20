import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { ClientService } from '../../services/client.service';
import { AssignmentService } from '../../../assignments/services/assignment.service';
import { Client, ClientNote } from '../../../../shared/interfaces/client.interface';
import { Assignment } from '../../../../shared/interfaces/assignment.interface';
import { CommonModule, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
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
export class ClientDetailComponent implements OnInit {
  client?: Client;
  assignments: Assignment[] = [];
  loading = false;
  noteForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private assignmentService: AssignmentService,
    private alertController: AlertController,
    private fb: FormBuilder
  ) {
    this.noteForm = this.fb.group({
      content: ['', Validators.required],
      type: ['general', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadClient(id);
      this.loadAssignments(id);
    }
  }

  private loadClient(id: number): void {
    this.loading = true;
    this.clientService.getClient(id).subscribe({
      next: (client) => {
        this.client = client;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.loading = false;
      }
    });
  }

  private loadAssignments(clientId: number): void {
    this.assignmentService.getAssignmentsByClient(clientId).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
      },
      error: (error) => console.error('Error loading assignments:', error)
    });
  }

  async addNote(): Promise<void> {
    if (this.noteForm.valid && this.client?.id) {
      const note = this.noteForm.value;
      
      this.clientService.addNote(this.client.id, note).subscribe({
        next: (newNote) => {
          this.client?.notes.unshift(newNote);
          this.noteForm.reset({ type: 'general' });
        },
        error: (error) => console.error('Error adding note:', error)
      });
    }
  }

  async deleteNote(noteId: number): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this note?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (this.client?.id) {
              this.clientService.deleteNote(this.client.id, noteId).subscribe({
                next: () => {
                  if (this.client) {
                    this.client.notes = this.client.notes.filter(note => note.id !== noteId);
                  }
                },
                error: (error) => console.error('Error deleting note:', error)
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  editClient(): void {
    if (this.client?.id) {
      this.router.navigate(['/clients', this.client.id, 'edit']);
    }
  }

  async deleteClient(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this client? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (this.client?.id) {
              this.clientService.deleteClient(this.client.id).subscribe({
                next: () => this.router.navigate(['/clients']),
                error: (error) => console.error('Error deleting client:', error)
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  viewAssignment(id: number): void {
    this.router.navigate(['/assignments', id]);
  }

  createAssignment(): void {
    if (this.client?.id) {
      this.router.navigate(['/assignments/new'], {
        queryParams: { clientId: this.client.id }
      });
    }
  }

  getNoteBadgeColor(type: string): string {
    const colors: { [key: string]: string } = {
      general: 'primary',
      meeting: 'secondary',
      requirement: 'tertiary',
      feedback: 'success'
    };
    return colors[type] || 'medium';
  }

  getAssignmentStatusColor(status: string): string {
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
