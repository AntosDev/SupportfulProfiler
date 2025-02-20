import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Assignment, AssignmentNote } from '../../../shared/interfaces/assignment.interface';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly path = 'assignments';

  constructor(private api: ApiService) {}

  getAssignments(filters?: any): Observable<Assignment[]> {
    return this.api.get<Assignment[]>(this.path, filters);
  }

  getAssignment(id: number): Observable<Assignment> {
    return this.api.get<Assignment>(`${this.path}/${id}`);
  }

  createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Observable<Assignment> {
    return this.api.post<Assignment>(this.path, assignment);
  }

  updateAssignment(id: number, assignment: Partial<Assignment>): Observable<Assignment> {
    return this.api.put<Assignment>(`${this.path}/${id}`, assignment);
  }

  deleteAssignment(id: number): Observable<void> {
    return this.api.delete<void>(`${this.path}/${id}`);
  }

  addNote(assignmentId: number, note: Omit<AssignmentNote, 'id' | 'createdAt' | 'updatedAt'>): Observable<AssignmentNote> {
    return this.api.post<AssignmentNote>(`${this.path}/${assignmentId}/notes`, note);
  }

  updateNote(assignmentId: number, noteId: number, note: Partial<AssignmentNote>): Observable<AssignmentNote> {
    return this.api.put<AssignmentNote>(`${this.path}/${assignmentId}/notes/${noteId}`, note);
  }

  deleteNote(assignmentId: number, noteId: number): Observable<void> {
    return this.api.delete<void>(`${this.path}/${assignmentId}/notes/${noteId}`);
  }

  getAssignmentsByProfile(profileId: number): Observable<Assignment[]> {
    return this.api.get<Assignment[]>(`${this.path}/profile/${profileId}`);
  }

  getAssignmentsByClient(clientId: number): Observable<Assignment[]> {
    return this.api.get<Assignment[]>(`${this.path}/client/${clientId}`);
  }
}
