import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileDetailComponent } from './profile-detail.component';
import { ProfileService } from '../../services/profile.service';
import { Profile, ProfileNote } from '../../../../shared/interfaces/profile.interface';
import { of } from 'rxjs';

describe('ProfileDetailComponent', () => {
  let component: ProfileDetailComponent;
  let fixture: ComponentFixture<ProfileDetailComponent>;
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
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getProfile', 'addNote', 'deleteNote']);
    profileServiceSpy.getProfile.and.returnValue(of(mockProfile));
    profileServiceSpy.addNote.and.returnValue(of({
      id: 1,
      content: 'Test note',
      type: 'general',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    profileServiceSpy.deleteNote.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterModule.forRoot([]),
        ReactiveFormsModule,
        ProfileDetailComponent
      ],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileDetailComponent);
    component = fixture.componentInstance;
    component.profile = mockProfile;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    expect(profileServiceSpy.getProfile).toHaveBeenCalled();
    expect(component.profile).toEqual(mockProfile);
  });

  it('should add note', () => {
    const noteData = {
      content: 'Test note',
      type: 'general' as const
    };

    component.noteForm.patchValue(noteData);
    component.addNote();

    expect(profileServiceSpy.addNote).toHaveBeenCalledWith(1, noteData);
  });

  it('should get correct badge color for note type', () => {
    expect(component.getNoteBadgeColor('meeting')).toBe('primary');
    expect(component.getNoteBadgeColor('requirement')).toBe('warning');
    expect(component.getNoteBadgeColor('feedback')).toBe('success');
    expect(component.getNoteBadgeColor('general')).toBe('medium');
  });
});
