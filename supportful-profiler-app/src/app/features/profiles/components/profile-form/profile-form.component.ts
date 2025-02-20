import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ProfileService } from '../../services/profile.service';
import { Router, RouterModule } from '@angular/router';

function urlValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;  // Allow empty values
  }

  try {
    const url = new URL(control.value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? null : { invalidUrl: true };
  } catch {
    return { invalidUrl: true };
  }
}

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    RouterModule
  ]
})
export class ProfileFormComponent implements OnInit {
  profileForm!: FormGroup;
  availabilityOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'two_weeks', label: '2 Weeks' },
    { value: 'one_month', label: '1 Month' },
    { value: 'unavailable', label: 'Unavailable' }
  ];
  workTypeOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {
    // Form is already initialized in constructor
  }

  private initForm() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      title: ['', [Validators.required]],
      summary: ['', [Validators.required, Validators.minLength(100)]],
      skills: ['', [Validators.required]],
      yearsOfExperience: [null, [Validators.required, Validators.min(0)]],
      expectedRate: [null, [Validators.required, Validators.min(0)]],
      availability: ['immediate', [Validators.required]],
      location: ['', [Validators.required]],
      timezone: ['', [Validators.required]],
      linkedinUrl: ['', [urlValidator]],
      githubUrl: ['', [urlValidator]],
      portfolioUrl: ['', [urlValidator]],
      preferredWorkType: ['remote', [Validators.required]]
    });

    // Debug form state changes
    this.profileForm.valueChanges.subscribe(() => {
      console.log('Form Valid:', this.profileForm.valid);
      console.log('Form Errors:', this.getFormValidationErrors());
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Invalid email format';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['min']) return `Value must be at least ${errors['min'].min}`;
    if (errors['invalidUrl']) return 'Invalid URL format';
    
    return 'Invalid value';
  }

  private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  onSubmit() {
    console.log('Form submitted. Valid:', this.profileForm.valid);
    console.log('Form values:', this.profileForm.value);
    console.log('Form errors:', this.getFormValidationErrors());

    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      // Convert skills from comma-separated string to array
      formValue.skills = formValue.skills.split(',').map((skill: string) => skill.trim());
      
      this.profileService.createProfile(formValue).subscribe({
        next: () => {
          this.router.navigate(['/profiles']);
        },
        error: (error) => {
          console.error('Error creating profile:', error);
        }
      });
    }
  }
}
