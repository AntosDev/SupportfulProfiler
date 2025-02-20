import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileListComponent } from './profile-list.component';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../../../shared/interfaces/profile.interface';
import { of } from 'rxjs';

describe('ProfileListComponent', () => {
  let component: ProfileListComponent;
  let fixture: ComponentFixture<ProfileListComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  const mockProfiles: Profile[] = [
    {
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
    }
  ];

  beforeEach(waitForAsync(() => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getProfiles']);
    profileServiceSpy.getProfiles.and.returnValue(of(mockProfiles));

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterModule.forRoot([]),
        ReactiveFormsModule,
        ProfileListComponent
      ],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profiles on init', () => {
    expect(profileServiceSpy.getProfiles).toHaveBeenCalled();
    expect(component.profiles).toEqual(mockProfiles);
  });

  it('should update profiles when filter changes', () => {
    const filters = {
      search: 'John',
      skills: 'JavaScript',
      availability: 'immediate',
      experience: '5+',
      workType: 'remote'
    };

    component.filterForm.patchValue(filters);
    fixture.detectChanges();

    expect(profileServiceSpy.getProfiles).toHaveBeenCalledWith(filters);
  });
});
