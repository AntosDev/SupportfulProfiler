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
    this.loadProfiles();
    this.setupSearchSubscription();
  }

  private setupSearchSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadProfiles();
      });
  }

  private loadProfiles(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.profileService.getProfiles(filters)
      .subscribe({
        next: (profiles) => {
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
