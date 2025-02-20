import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileFormComponent } from './profile-form.component';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../../../shared/interfaces/profile.interface';
import { of } from 'rxjs';

describe('ProfileFormComponent', () => {
  let component: ProfileFormComponent;
  let fixture: ComponentFixture<ProfileFormComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  const mockProfile: Profile = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    title: 'Software Engineer',
    skills: ['JavaScript', 'TypeScript'],
    experience: 5,
    rate: 100,
    availability: 'immediate',
    location: 'New York',
    timezone: 'EST',
    preferredWorkType: 'remote',
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(waitForAsync(() => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['createProfile', 'updateProfile']);
    profileServiceSpy.createProfile.and.returnValue(of(mockProfile));
    profileServiceSpy.updateProfile.and.returnValue(of(mockProfile));

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterModule.forRoot([]),
        ReactiveFormsModule,
        ProfileFormComponent
      ],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.profileForm.get('firstName')?.value).toBe('');
    expect(component.profileForm.get('lastName')?.value).toBe('');
    expect(component.profileForm.get('email')?.value).toBe('');
    expect(component.profileForm.get('availability')?.value).toBe('immediate');
    expect(component.profileForm.get('preferredWorkType')?.value).toBe('remote');
  });

  it('should validate required fields', () => {
    const form = component.profileForm;
    expect(form.valid).toBeFalsy();

    form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      title: 'Software Engineer',
      skills: 'JavaScript, TypeScript',
      experience: 5,
      rate: 100,
      availability: 'immediate',
      location: 'New York',
      timezone: 'EST',
      preferredWorkType: 'remote'
    });

    expect(form.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.profileForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should submit form when valid', () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      title: 'Software Engineer',
      skills: 'JavaScript, TypeScript',
      experience: 5,
      rate: 100,
      availability: 'immediate' as const,
      location: 'New York',
      timezone: 'EST',
      preferredWorkType: 'remote' as const,
      notes: []
    };

    component.profileForm.patchValue(formData);
    component.onSubmit();

    expect(profileServiceSpy.createProfile).toHaveBeenCalledWith({
      ...formData,
      skills: ['JavaScript', 'TypeScript']
    });
  });
});
