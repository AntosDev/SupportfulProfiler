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
  hasFilters = false;
  totalClients = 0;
  currentPage = 1;
  pageSize = 10;
  Math = Math; // Make Math available in template

  constructor(
    private clientService: ClientService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      industry: [''],
      status: [''],
      location: ['']
    });

    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.hasFilters = this.hasActiveFilters();
      this.currentPage = 1; // Reset to first page when filters change
      this.loadClients();
    });
  }

  ngOnInit(): void {
    this.loadAllClients();
  }

  hasActiveFilters(): boolean {
    const formValues = this.filterForm.value;
    return Object.values(formValues).some(value => value !== null && value !== undefined && String(value).length > 0);
  }

  loadAllClients(): void {
    this.loading = true;
    this.clientService.getClients().subscribe({
      next: ([clients, total]) => {
        this.clients = clients;
        this.totalClients = total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.loading = false;
      }
    });
  }

  loadClients(): void {
    this.loading = true;
    const filters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.pageSize
    };

    // Transform empty string values to undefined
    Object.keys(filters).forEach(key => {
      if (filters[key] === '') {
        filters[key] = undefined;
      }
    });

    this.clientService.getClients(filters).subscribe({
      next: ([clients, total]) => {
        this.clients = clients;
        this.totalClients = total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading filtered clients:', error);
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAllClients();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadClients();
  }

  createClient(): void {
    this.router.navigate(['/clients/new']);
  }

  viewClient(id: string): void {
    if (id) {
      this.router.navigate(['/clients', id]);
    }
  }
}
