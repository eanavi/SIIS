// src/app/caracteristicas/perfil/enfermera/enfermera.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../compartido/componentes/header/header';
import { AuthService } from '../../../nucleo/servicios/auth.service';

@Component({
  selector: 'app-perfil-enfermera',
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
              <h1>Bienvenida, {{ nombreUsuario }}</h1>
              <p class="subtitle">{{ nombreCentro }} - Enfermería</p>
            </div>

            <div class="stats-grid">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon primary">monitor_heart</mat-icon>
                    <div class="stat-info">
                      <h3>Triajes Realizados</h3>
                      <p class="stat-number">15</p>
                      <span class="stat-label">Hoy</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon warning">people</mat-icon>
                    <div class="stat-info">
                      <h3>Pacientes en Espera</h3>
                      <p class="stat-number">8</p>
                      <span class="stat-label">Para triaje</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon success">check_circle</mat-icon>
                    <div class="stat-info">
                      <h3>Listos para Consulta</h3>
                      <p class="stat-number">12</p>
                      <span class="stat-label">Con signos vitales</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon info">vaccines</mat-icon>
                    <div class="stat-info">
                      <h3>Vacunas Aplicadas</h3>
                      <p class="stat-number">7</p>
                      <span class="stat-label">Esta semana: 35</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="quick-actions">
              <h2>Acciones Rápidas</h2>
              <div class="actions-grid">
                <button mat-raised-button color="primary" (click)="irAPacientes()">
                  <mat-icon>monitor_heart</mat-icon>
                  Tomar Signos Vitales
                </button>
                <button mat-raised-button color="primary" (click)="irATurnos()">
                  <mat-icon>event</mat-icon>
                  Ver Turnos
                </button>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styleUrl: './enfermera.scss'
})
export class PerfilEnfermeraComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  hayRutaActiva = false;

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.hayRutaActiva = this.router.url !== '/enfermera';
    });
  }

  get nombreUsuario(): string {
    const nombreCompleto = this.authService.usuarioActual()?.informacion?.nombre_completo;
    if (nombreCompleto) {
      const partes = nombreCompleto.split(',');
      return partes.length > 1 ? partes[1].trim() : nombreCompleto;
    }
    return this.authService.usuarioActual()?.username || 'Enfermera';
  }

  get nombreCentro(): string {
    return this.authService.usuarioActual()?.informacion?.nombre_centro || '';
  }

  irAPacientes(): void {
    this.router.navigate(['/enfermera/pacientes']);
  }

  irATurnos(): void {
    this.router.navigate(['/enfermera/turno']);
  }
}
