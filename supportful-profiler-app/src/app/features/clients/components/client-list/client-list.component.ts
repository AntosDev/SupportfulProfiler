import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ClientService } from '../../services/client.service';
import { Client } from '../../../../shared/interfaces/client.interface';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgFor
  ]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filterForm: FormGroup;
  loading = false;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      industry: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.setupSearchSubscription();
  }

  private setupSearchSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadClients();
      });
  }

  private loadClients(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.clientService.getClients(filters)
      .subscribe({
        next: (clients) => {
          this.clients = clients;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          this.loading = false;
        }
      });
  }

  viewClient(id: number): void {
    this.router.navigate(['/clients', id]);
  }

  createClient(): void {
    this.router.navigate(['/clients/new']);
  }
}
