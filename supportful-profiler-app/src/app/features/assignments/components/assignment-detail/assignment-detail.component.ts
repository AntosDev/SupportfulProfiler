import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { AssignmentService } from '../../services/assignment.service';
import { Assignment, AssignmentNote } from '../../../../shared/interfaces/assignment.interface';
import { CommonModule, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-assignment-detail',
  templateUrl: './assignment-detail.component.html',
  styleUrls: ['./assignment-detail.component.scss'],
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
export class AssignmentDetailComponent implements OnInit {
  assignment?: Assignment;
  loading = false;
  noteForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
      this.loadAssignment(id);
    }
  }

  private loadAssignment(id: number): void {
    this.loading = true;
    this.assignmentService.getAssignment(id).subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assignment:', error);
        this.loading = false;
      }
    });
  }

  async addNote(): Promise<void> {
    if (this.noteForm.valid && this.assignment?.id) {
      const note = this.noteForm.value;
      
      this.assignmentService.addNote(this.assignment.id, note).subscribe({
        next: (newNote) => {
          this.assignment?.notes.unshift(newNote);
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
            if (this.assignment?.id) {
              this.assignmentService.deleteNote(this.assignment.id, noteId).subscribe({
                next: () => {
                  if (this.assignment) {
                    this.assignment.notes = this.assignment.notes.filter(note => note.id !== noteId);
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

  editAssignment(): void {
    if (this.assignment?.id) {
      this.router.navigate(['/assignments', this.assignment.id, 'edit']);
    }
  }

  async deleteAssignment(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this assignment? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (this.assignment?.id) {
              this.assignmentService.deleteAssignment(this.assignment.id).subscribe({
                next: () => this.router.navigate(['/assignments']),
                error: (error) => console.error('Error deleting assignment:', error)
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  viewProfile(id: number): void {
    this.router.navigate(['/profiles', id]);
  }

  viewClient(id: number): void {
    this.router.navigate(['/clients', id]);
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

  getNoteBadgeColor(type: string): string {
    const colors: { [key: string]: string } = {
      general: 'primary',
      interview: 'secondary',
      feedback: 'tertiary',
      performance: 'success',
      issue: 'warning'
    };
    return colors[type] || 'medium';
  }
}
