// src/app/caracteristicas/auth/paginas/login/login.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../../nucleo/servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Formulario reactivo
  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  // Señales para el estado
  ocultarPassword = signal(true);
  mensajeError = signal('');

  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginForm.disable();
    this.mensajeError.set('');

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username, password).subscribe({
      next: () => {
        console.log('✅ Login exitoso - Redirigiendo al perfil...');
        // ✅ NO redirigimos aquí, el AuthService lo hace automáticamente
      },
      error: (error) => {
        this.loginForm.enable();
        this.mensajeError.set(error.message || 'Error al iniciar sesión');
        console.error('❌ Error en login:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.ocultarPassword.set(!this.ocultarPassword());
  }

  // ✅ Getter para saber si está cargando
  get cargando(): boolean {
    return this.loginForm.disabled;
  }

  // Getters para validación
  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  getUsernameErrorMessage(): string {
    if (this.usernameControl?.hasError('required')) {
      return 'El usuario es requerido';
    }
    if (this.usernameControl?.hasError('minlength')) {
      return 'El usuario debe tener al menos 3 caracteres';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.passwordControl?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (this.passwordControl?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 4 caracteres';
    }
    return '';
  }
}
