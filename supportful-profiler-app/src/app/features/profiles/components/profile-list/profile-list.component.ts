import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../../../shared/interfaces/profile.interface';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgFor,
    HttpClientModule
  ]
})
export class ProfileListComponent implements OnInit {
  profiles: Profile[] = [];
  filterForm: FormGroup;
  loading = false;
  hasFilters = false;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      skills: [''],
      availability: [''],
      experience: [''],
      workType: ['']
    });
  }

  ngOnInit(): void {
    this.loadAllProfiles();
    this.setupSearchSubscription();
  }

  private setupSearchSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.hasFilters = this.hasActiveFilters();
        this.loadProfiles();
      });
  }

  private hasActiveFilters(): boolean {
    const values = this.filterForm.value;
    return !!(
      values.search?.trim() ||
      values.skills?.trim() ||
      values.availability ||
      values.experience ||
      values.workType
    );
  }

  private loadAllProfiles(): void {
    console.log('Loading all profiles...');
    this.loading = true;
    this.profileService.getProfiles({})
      .subscribe({
        next: (profiles) => {
          console.log('Received all profiles:', profiles);
          this.profiles = profiles;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading all profiles:', error);
          this.loading = false;
        }
      });
  }

  private loadProfiles(): void {
    if (!this.hasFilters) {
      this.loadAllProfiles();
      return;
    }

    this.loading = true;
    const formValues = this.filterForm.value;
    
    // Transform filters to match backend expectations
    const filters: any = {};

    // Only add defined values
    if (formValues.search?.trim()) {
      filters.searchTerm = formValues.search.trim();
    }

    if (formValues.availability && formValues.availability !== '') {
      filters.availability = formValues.availability;
    }

    if (formValues.experience && formValues.experience !== '') {
      switch (formValues.experience) {
        case '0-2':
          filters.maxExperience = 2;
          break;
        case '3-5':
          filters.minExperience = 3;
          filters.maxExperience = 5;
          break;
        case '5-8':
          filters.minExperience = 5;
          filters.maxExperience = 8;
          break;
        case '8+':
          filters.minExperience = 8;
          break;
      }
      console.log('Experience filter:', { original: formValues.experience, transformed: filters });
    }

    if (formValues.skills?.trim()) {
      filters.skills = formValues.skills.trim().split(',').map((s: string) => s.trim());
    }

    if (formValues.workType && formValues.workType !== '') {
      filters.preferredWorkType = formValues.workType;
    }

    console.log('Sending filters to backend:', filters);
    
    this.profileService.getProfiles(filters)
      .subscribe({
        next: (profiles) => {
          console.log('Received profiles:', profiles);
          this.profiles = profiles;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading profiles:', error);
          this.loading = false;
        }
      });
  }

  viewProfile(id: number): void {
    this.router.navigate(['/profiles', id]);
  }

  createProfile(): void {
    this.router.navigate(['/profiles/new']);
  }
}
