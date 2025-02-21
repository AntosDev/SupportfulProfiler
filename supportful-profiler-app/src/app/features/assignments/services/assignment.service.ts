import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Assignment, AssignmentNote, AssignmentStatus } from '../../../shared/interfaces/assignment.interface';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly path = 'assignments';

  constructor(private api: ApiService) {}

  getAssignments(filters?: any): Observable<Assignment[]> {
    return this.api.get<Assignment[]>(this.path, filters);
  }

  getAssignment(id: string): Observable<Assignment> {
    return this.api.get<Assignment>(`${this.path}/${id}`);
  }

  createAssignment(assignment: {
    profileId: string;
    clientId: string;
    position: string;
    rate: number;
    startDate: string;
    endDate?: string | null;
    workType: 'remote' | 'onsite' | 'hybrid';
    status: AssignmentStatus;
  }): Observable<Assignment> {
    return this.api.post<Assignment>(this.path, assignment);
  }

  updateAssignment(id: string, assignment: Partial<Assignment>): Observable<Assignment> {
    return this.api.patch<Assignment>(`${this.path}/${id}`, assignment);
  }

  deleteAssignment(id: string): Observable<void> {
    return this.api.delete<void>(`${this.path}/${id}`);
  }

  addNote(assignmentId: string, note: Omit<AssignmentNote, 'id' | 'createdAt' | 'updatedAt'>): Observable<AssignmentNote> {
    return this.api.post<AssignmentNote>(`${this.path}/${assignmentId}/notes`, note);
  }

  updateNote(assignmentId: string, noteId: string, note: Partial<AssignmentNote>): Observable<AssignmentNote> {
    return this.api.patch<AssignmentNote>(`${this.path}/${assignmentId}/notes/${noteId}`, note);
  }

  deleteNote(assignmentId: string, noteId: string): Observable<void> {
    return this.api.delete<void>(`${this.path}/${assignmentId}/notes/${noteId}`);
  }

  getAssignmentsByProfile(profileId: string): Observable<Assignment[]> {
    return this.api.get<Assignment[]>(`${this.path}/profile/${profileId}`);
  }

  getAssignmentsByClient(clientId: string): Observable<Assignment[]> {
    return this.api.get<Assignment[]>(`${this.path}/client/${clientId}`);
  }
}
