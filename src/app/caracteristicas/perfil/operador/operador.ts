// src/app/caracteristicas/perfil/operador/operador.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../compartido/componentes/header/header';
import { AuthService } from '../../../nucleo/servicios/auth.service';

@Component({
  selector: 'app-perfil-operador',
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
              <h1>Bienvenido, {{ nombreUsuario }}</h1>
              <p class="subtitle">{{ nombreCentro }} - Operador</p>
            </div>

            <div class="stats-grid">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon primary">person_add</mat-icon>
                    <div class="stat-info">
                      <h3>Pacientes Registrados</h3>
                      <p class="stat-number">23</p>
                      <span class="stat-label">Hoy</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon success">event_available</mat-icon>
                    <div class="stat-info">
                      <h3>Turnos Asignados</h3>
                      <p class="stat-number">45</p>
                      <span class="stat-label">Esta semana: 187</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon warning">people</mat-icon>
                    <div class="stat-info">
                      <h3>En Sala de Espera</h3>
                      <p class="stat-number">12</p>
                      <span class="stat-label">Esperando atención</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon info">schedule</mat-icon>
                    <div class="stat-info">
                      <h3>Tiempo Prom. Espera</h3>
                      <p class="stat-number">25min</p>
                      <span class="stat-label">Último promedio</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="quick-actions">
              <h2>Acciones Rápidas</h2>
              <div class="actions-grid">
                <button mat-raised-button color="primary" (click)="irAPacientes()">
                  <mat-icon>person_add</mat-icon>
                  Nuevo Paciente
                </button>
                <button mat-raised-button color="primary" (click)="irATurnos()">
                  <mat-icon>event</mat-icon>
                  Asignar Turno
                </button>
                <button mat-raised-button (click)="verListaPacientes()">
                  <mat-icon>people</mat-icon>
                  Ver Pacientes
                </button>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styleUrl: './operador.scss'
})
export class PerfilOperadorComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  hayRutaActiva = false;

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.hayRutaActiva = this.router.url !== '/operador';
    });
  }

  get nombreUsuario(): string {
    const nombreCompleto = this.authService.usuarioActual()?.informacion?.nombre_completo;
    if (nombreCompleto) {
      const partes = nombreCompleto.split(',');
      return partes.length > 1 ? partes[1].trim() : nombreCompleto;
    }
    return this.authService.usuarioActual()?.username || 'Operador';
  }

  get nombreCentro(): string {
    return this.authService.usuarioActual()?.informacion?.nombre_centro || '';
  }

  irAPacientes(): void {
    this.router.navigate(['/operador/pacientes/nuevo']);
  }

  verListaPacientes(): void {
    this.router.navigate(['/operador/pacientes']);
  }

  irATurnos(): void {
    this.router.navigate(['/operador/turno']);
  }
}
