import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Client, ClientNote } from '../../../shared/interfaces/client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly path = 'clients';

  constructor(private api: ApiService) {}

  getClients(filters?: any): Observable<[Client[], number]> {
    return this.api.get<[Client[], number]>(this.path, filters);
  }

  getClient(id: string): Observable<Client> {
    return this.api.get<Client>(`${this.path}/${id}`);
  }

  createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Observable<Client> {
    return this.api.post<Client>(this.path, client);
  }

  updateClient(id: string, client: Partial<Client>): Observable<Client> {
    return this.api.put<Client>(`${this.path}/${id}`, client);
  }

  deleteClient(id: string): Observable<void> {
    return this.api.delete<void>(`${this.path}/${id}`);
  }

  addNote(clientId: string, note: Omit<ClientNote, 'id' | 'createdAt' | 'updatedAt'>): Observable<ClientNote> {
    return this.api.post<ClientNote>(`${this.path}/${clientId}/notes`, note);
  }

  updateNote(clientId: string, noteId: number, note: Partial<ClientNote>): Observable<ClientNote> {
    return this.api.put<ClientNote>(`${this.path}/${clientId}/notes/${noteId}`, note);
  }

  deleteNote(clientId: string, noteId: number): Observable<void> {
    return this.api.delete<void>(`${this.path}/${clientId}/notes/${noteId}`);
  }

  searchClients(query: string): Observable<Client[]> {
    return this.api.get<Client[]>(`${this.path}/search`, { query });
  }
}
