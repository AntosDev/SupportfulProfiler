import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
    <ion-content class="ion-padding">
      <div class="register-container">
        <h1>Register</h1>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <ion-item>
            <ion-label position="floating">First Name</ion-label>
            <ion-input type="text" formControlName="firstName"></ion-input>
          </ion-item>
          <div class="validation-error" *ngIf="registerForm.get('firstName')?.touched && registerForm.get('firstName')?.invalid">
            First name is required
          </div>

          <ion-item>
            <ion-label position="floating">Last Name</ion-label>
            <ion-input type="text" formControlName="lastName"></ion-input>
          </ion-item>
          <div class="validation-error" *ngIf="registerForm.get('lastName')?.touched && registerForm.get('lastName')?.invalid">
            Last name is required
          </div>

          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input type="email" formControlName="email"></ion-input>
          </ion-item>
          <div class="validation-error" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
            Please enter a valid email address
          </div>

          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input type="password" formControlName="password"></ion-input>
          </ion-item>
          <div class="validation-error" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
            Password must be at least 6 characters long
          </div>

          <ion-button expand="block" type="submit" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Registering...' : 'Register' }}
          </ion-button>

          <div class="error-message" *ngIf="error">{{ error }}</div>
        </form>

        <p class="login-link">
          Already have an account? <a routerLink="/login">Login here</a>
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    .register-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
    }
    .validation-error {
      color: var(--ion-color-danger);
      font-size: 0.8em;
      margin: 5px 0 15px 0;
    }
    .error-message {
      color: var(--ion-color-danger);
      text-align: center;
      margin: 15px 0;
    }
    .login-link {
      text-align: center;
      margin-top: 20px;
    }
    ion-button {
      margin-top: 20px;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        // After successful registration, log the user in
        const { email, password } = this.registerForm.value;
        this.authService.login(email, password).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.error = error.error?.message || 'An error occurred during login';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        this.error = error.error?.message || 'An error occurred during registration';
        this.isLoading = false;
      }
    });
  }
} 