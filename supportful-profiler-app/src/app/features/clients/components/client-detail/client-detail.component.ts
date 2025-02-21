import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { ClientService } from '../../services/client.service';
import { Client } from '../../../../shared/interfaces/client.interface';
import { CommonModule, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgIf,
    NgFor
  ]
})
export class ClientDetailComponent implements OnInit {
  client?: Client;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.loadClient();
  }

  private loadClient(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (!clientId) {
      this.router.navigate(['/clients']);
      return;
    }

    this.loading = true;
    this.clientService.getClient(clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.loading = false;
        this.router.navigate(['/clients']);
      }
    });
  }

  editClient(): void {
    if (this.client?.id) {
      this.router.navigate(['/clients', this.client.id, 'edit']);
    }
  }

  async deleteClient(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this client? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (this.client?.id) {
              this.clientService.deleteClient(this.client.id).subscribe({
                next: () => this.router.navigate(['/clients']),
                error: (error) => console.error('Error deleting client:', error)
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
