import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../../../shared/interfaces/profile.interface';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    HttpClientModule
  ]
})
export class ProfileFormComponent implements OnInit {
  profileForm: FormGroup;
  isEdit = false;
  loading = false;
  profileId?: number;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      title: ['', Validators.required],
      skills: ['', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      availability: ['immediate', Validators.required],
      location: ['', Validators.required],
      timezone: ['', Validators.required],
      linkedinUrl: [''],
      githubUrl: [''],
      portfolioUrl: [''],
      preferredWorkType: ['remote', Validators.required]
    });
  }

  ngOnInit(): void {
    this.profileId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.profileId) {
      this.isEdit = true;
      this.loadProfile(this.profileId);
    }
  }

  private loadProfile(id: number): void {
    this.loading = true;
    this.profileService.getProfile(id).subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          ...profile,
          skills: profile.skills.join(', ')
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      const profileData = {
        ...formValue,
        skills: formValue.skills.split(',').map((skill: string) => skill.trim())
      };

      this.loading = true;
      if (this.isEdit && this.profileId) {
        this.profileService.updateProfile(this.profileId, profileData).subscribe({
          next: () => this.handleSuccess(),
          error: (error) => this.handleError(error)
        });
      } else {
        this.profileService.createProfile(profileData).subscribe({
          next: () => this.handleSuccess(),
          error: (error) => this.handleError(error)
        });
      }
    }
  }

  private handleSuccess(): void {
    this.loading = false;
    this.router.navigate(['/profiles']);
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.loading = false;
  }

  cancel(): void {
    this.router.navigate(['/profiles']);
  }
}
