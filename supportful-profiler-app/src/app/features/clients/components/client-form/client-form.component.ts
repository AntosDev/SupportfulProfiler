import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
  clientId?: number;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clientForm = this.fb.group({
      companyName: ['', Validators.required],
      industry: ['', Validators.required],
      primaryContact: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        title: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        isMainContact: [true]
      }),
      additionalContacts: this.fb.array([]),
      location: ['', Validators.required],
      timezone: ['', Validators.required],
      website: [''],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.clientId) {
      this.isEdit = true;
      this.loadClient(this.clientId);
    }
  }

  get additionalContacts(): FormArray {
    return this.clientForm.get('additionalContacts') as FormArray;
  }

  addContact(): void {
    const contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      title: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      isMainContact: [false]
    });

    this.additionalContacts.push(contactForm);
  }

  removeContact(index: number): void {
    this.additionalContacts.removeAt(index);
  }

  private loadClient(id: number): void {
    this.loading = true;
    this.clientService.getClient(id).subscribe({
      next: (client) => {
        // Clear existing additional contacts
        while (this.additionalContacts.length) {
          this.additionalContacts.removeAt(0);
        }

        // Add additional contacts if they exist
        client.additionalContacts?.forEach(contact => {
          this.additionalContacts.push(this.fb.group({
            firstName: [contact.firstName, Validators.required],
            lastName: [contact.lastName, Validators.required],
            title: [contact.title, Validators.required],
            email: [contact.email, [Validators.required, Validators.email]],
            phone: [contact.phone],
            isMainContact: [contact.isMainContact]
          }));
        });

        // Update form with client data
        this.clientForm.patchValue({
          companyName: client.companyName,
          industry: client.industry,
          primaryContact: client.primaryContact,
          location: client.location,
          timezone: client.timezone,
          website: client.website,
          status: client.status
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      const clientData = this.clientForm.value;

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
