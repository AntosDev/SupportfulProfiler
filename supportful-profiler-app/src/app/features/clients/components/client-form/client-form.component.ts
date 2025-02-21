import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Client } from '../../../../shared/interfaces/client.interface';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
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
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEdit = false;
  loading = false;
  clientId?: string;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clientForm = this.fb.group({
      companyName: ['', Validators.required],
      industry: ['', Validators.required],
      website: [''],
      description: [''],
      primaryContactName: ['', Validators.required],
      primaryContactEmail: ['', [Validators.required, Validators.email]],
      primaryContactPhone: [''],
      locations: [''],
      status: ['active', Validators.required],
      requirements: [null],
      additionalInfo: [null]
    });
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.clientId) {
      this.isEdit = true;
      this.loadClient(this.clientId);
    }
  }

  private loadClient(id: string): void {
    this.loading = true;
    this.clientService.getClient(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          companyName: client.companyName,
          industry: client.industry,
          website: client.website,
          description: client.description,
          primaryContactName: client.primaryContactName,
          primaryContactEmail: client.primaryContactEmail,
          primaryContactPhone: client.primaryContactPhone,
          locations: client.locations?.join('\n'),
          status: client.status,
          requirements: client.requirements,
          additionalInfo: client.additionalInfo
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.loading = false;
        this.router.navigate(['/clients']);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      const formValue = this.clientForm.value;
      
      // Transform locations string to array
      const clientData = {
        ...formValue,
        locations: formValue.locations ? formValue.locations.split('\n').map((loc: string) => loc.trim()).filter(Boolean) : []
      };

      // Parse JSON strings if they exist
      if (typeof clientData.requirements === 'string' && clientData.requirements.trim()) {
        try {
          clientData.requirements = JSON.parse(clientData.requirements);
        } catch (e) {
          console.error('Invalid requirements JSON');
          return;
        }
      }

      if (typeof clientData.additionalInfo === 'string' && clientData.additionalInfo.trim()) {
        try {
          clientData.additionalInfo = JSON.parse(clientData.additionalInfo);
        } catch (e) {
          console.error('Invalid additional info JSON');
          return;
        }
      }
      
      this.loading = true;
      if (this.isEdit && this.clientId) {
        this.clientService.updateClient(this.clientId, clientData).subscribe({
          next: () => this.handleSuccess(),
          error: (error) => this.handleError(error)
        });
      } else {
        this.clientService.createClient(clientData).subscribe({
          next: () => this.handleSuccess(),
          error: (error) => this.handleError(error)
        });
      }
    }
  }

  private handleSuccess(): void {
    this.loading = false;
    this.router.navigate(['/clients']);
  }

  private handleError(error: any): void {
    console.error('Error saving client:', error);
    this.loading = false;
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }
}
