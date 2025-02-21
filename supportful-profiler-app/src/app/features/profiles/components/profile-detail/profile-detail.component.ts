import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { ProfileService } from '../../services/profile.service';
import { Profile, ProfileNote } from '../../../../shared/interfaces/profile.interface';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgFor,
    DatePipe,
    HttpClientModule
  ]
})
export class ProfileDetailComponent implements OnInit {
  profile?: Profile;
  loading = false;
  noteForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private alertController: AlertController,
    private fb: FormBuilder
  ) {
    this.noteForm = this.fb.group({
      content: ['', Validators.required],
      type: ['general', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProfile(id);
    } else {
      this.router.navigate(['/profiles']);
    }
  }

  private loadProfile(id: string): void {
    this.loading = true;
    this.profileService.getProfile(id).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
        this.router.navigate(['/profiles']);
      }
    });
  }

  addNote(): void {
    if (this.noteForm.valid && this.profile?.id) {
      const note = this.noteForm.value;
      this.profileService.addNote(this.profile.id, note).subscribe({
        next: (newNote) => {
          this.profile?.notes.push(newNote);
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
            if (this.profile?.id) {
              this.profileService.deleteNote(this.profile.id, noteId).subscribe({
                next: () => {
                  if (this.profile) {
                    this.profile.notes = this.profile.notes.filter(note => note.id !== noteId);
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

  editProfile(): void {
    if (this.profile?.id) {
      this.router.navigate(['/profiles', this.profile.id, 'edit']);
    }
  }

  async deleteProfile(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this profile? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (this.profile?.id) {
              this.profileService.deleteProfile(this.profile.id).subscribe({
                next: () => this.router.navigate(['/profiles']),
                error: (error) => console.error('Error deleting profile:', error)
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getNoteBadgeColor(type: string): string {
    switch (type) {
      case 'meeting':
        return 'primary';
      case 'requirement':
        return 'warning';
      case 'feedback':
        return 'success';
      default:
        return 'medium';
    }
  }
}
