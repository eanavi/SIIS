// src/app/caracteristicas/perfil/odontologo/odontologo.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../compartido/componentes/header/header';
import { AuthService } from '../../../nucleo/servicios/auth.service';

@Component({
  selector: 'app-perfil-odontologo',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="perfil-layout">
      <app-header></app-header>
      <main class="content">
        <router-outlet></router-outlet>

        @if (!hayRutaActiva) {
          <div class="dashboard">
            <div class="welcome-section">
              <h1>Bienvenido, Dr. {{ nombreUsuario }}</h1>
              <p class="subtitle">{{ nombreCentro }} - Odontología</p>
            </div>

            <div class="stats-grid">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon primary">medication</mat-icon>
                    <div class="stat-info">
                      <h3>Consultas Odontológicas</h3>
                      <p class="stat-number">8</p>
                      <span class="stat-label">Hoy</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon success">people</mat-icon>
                    <div class="stat-info">
                      <h3>Pacientes Atendidos</h3>
                      <p class="stat-number">5</p>
                      <span class="stat-label">Esta semana: 28</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon warning">event</mat-icon>
                    <div class="stat-info">
                      <h3>Próximo Turno</h3>
                      <p class="stat-number">15:00</p>
                      <span class="stat-label">Consultorio Dental</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon info">pending_actions</mat-icon>
                    <div class="stat-info">
                      <h3>Tratamientos Pendientes</h3>
                      <p class="stat-number">12</p>
                      <span class="stat-label">Seguimientos</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="quick-actions">
              <h2>Acciones Rápidas</h2>
              <div class="actions-grid">
                <button mat-raised-button color="primary" (click)="irAPacientes()">
                  <mat-icon>people</mat-icon>
                  Ver Pacientes
                </button>
                <button mat-raised-button color="primary" (click)="irAConsultas()">
                  <mat-icon>medication</mat-icon>
                  Nueva Consulta Dental
                </button>
                <button mat-raised-button color="primary" (click)="irATurnos()">
                  <mat-icon>event</mat-icon>
                  Gestionar Turnos
                </button>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styleUrl: './odontologo.scss'
})
export class PerfilOdontologoComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  hayRutaActiva = false;

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.hayRutaActiva = this.router.url !== '/odontologo';
    });
  }

  get nombreUsuario(): string {
    const nombreCompleto = this.authService.usuarioActual()?.informacion?.nombre_completo;
    if (nombreCompleto) {
      const partes = nombreCompleto.split(',');
      return partes.length > 1 ? partes[1].trim() : nombreCompleto;
    }
    return this.authService.usuarioActual()?.username || 'Doctor';
  }

  get nombreCentro(): string {
    return this.authService.usuarioActual()?.informacion?.nombre_centro || '';
  }

  irAPacientes(): void {
    this.router.navigate(['/odontologo/pacientes']);
  }

  irAConsultas(): void {
    this.router.navigate(['/odontologo/consultas']);
  }

  irATurnos(): void {
    this.router.navigate(['/odontologo/turno']);
  }
}
