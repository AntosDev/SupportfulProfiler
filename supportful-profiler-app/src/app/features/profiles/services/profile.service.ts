import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Profile, ProfileNote } from '../../../shared/interfaces/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly path = 'profiles';

  constructor(private api: ApiService) {}

  getProfiles(filters?: any): Observable<Profile[]> {
    return this.api.get<Profile[]>(this.path, filters);
  }

  getProfile(id: number): Observable<Profile> {
    return this.api.get<Profile>(`${this.path}/${id}`);
  }

  createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Observable<Profile> {
    return this.api.post<Profile>(this.path, profile);
  }

  updateProfile(id: number, profile: Partial<Profile>): Observable<Profile> {
    return this.api.put<Profile>(`${this.path}/${id}`, profile);
  }

  deleteProfile(id: number): Observable<void> {
    return this.api.delete<void>(`${this.path}/${id}`);
  }

  addNote(profileId: number, note: Omit<ProfileNote, 'id' | 'createdAt' | 'updatedAt'>): Observable<ProfileNote> {
    return this.api.post<ProfileNote>(`${this.path}/${profileId}/notes`, note);
  }

  updateNote(profileId: number, noteId: number, note: Partial<ProfileNote>): Observable<ProfileNote> {
    return this.api.put<ProfileNote>(`${this.path}/${profileId}/notes/${noteId}`, note);
  }

  deleteNote(profileId: number, noteId: number): Observable<void> {
    return this.api.delete<void>(`${this.path}/${profileId}/notes/${noteId}`);
  }

  searchProfiles(query: string): Observable<Profile[]> {
    return this.api.get<Profile[]>(`${this.path}/search`, { query });
  }
}
