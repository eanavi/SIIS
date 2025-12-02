// src/app/caracteristicas/perfil/medico/medico.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../compartido/componentes/header/header';
import { AuthService } from '../../../nucleo/servicios/auth.service';

@Component({
  selector: 'app-perfil-medico',
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

        <!-- Dashboard por defecto si no hay ruta hija activa -->
        @if (!hayRutaActiva) {
          <div class="dashboard">
            <div class="welcome-section">
              <h1>Bienvenido, Dr. {{ nombreUsuario }}</h1>
              <p class="subtitle">{{ nombreCentro }}</p>
            </div>

            <div class="stats-grid">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon primary">medical_services</mat-icon>
                    <div class="stat-info">
                      <h3>Consultas de Hoy</h3>
                      <p class="stat-number">12</p>
                      <span class="stat-label">Pendientes: 5</span>
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
                      <p class="stat-number">7</p>
                      <span class="stat-label">Esta semana: 42</span>
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
                      <p class="stat-number">14:30</p>
                      <span class="stat-label">Consultorio 3</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon info">schedule</mat-icon>
                    <div class="stat-info">
                      <h3>Horas Trabajadas</h3>
                      <p class="stat-number">6.5h</p>
                      <span class="stat-label">De 8 horas</span>
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
                  <mat-icon>medical_services</mat-icon>
                  Nueva Consulta
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
  styleUrl: './medico.scss'
})
export class PerfilMedicoComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  hayRutaActiva = false;

  ngOnInit(): void {
    // ✅ Mejorar la detección de ruta activa
    this.actualizarEstadoRuta();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.actualizarEstadoRuta();
    });
  }

    private actualizarEstadoRuta(): void {
    const urlActual = this.router.url;
    this.hayRutaActiva = urlActual !== '/medico' && urlActual.startsWith('/medico');

    console.log('🗺️ Estado de ruta actualizado:', {
      url: urlActual,
      hayRutaActiva: this.hayRutaActiva
    });
  }

  get nombreUsuario(): string {
    const nombreCompleto = this.authService.usuarioActual()?.informacion?.nombre_completo;
    if (nombreCompleto) {
      // Extraer solo el nombre (después de la coma)
      const partes = nombreCompleto.split(',');
      return partes.length > 1 ? partes[1].trim() : nombreCompleto;
    }
    return this.authService.usuarioActual()?.username || 'Doctor';
  }

  get nombreCentro(): string {
    return this.authService.usuarioActual()?.informacion?.nombre_centro || '';
  }

  irAPacientes(): void {
    this.router.navigate(['/medico/pacientes']);
  }

  irAConsultas(): void {
    this.router.navigate(['/medico/consultas']);
  }

  irATurnos(): void {
    this.router.navigate(['/medico/turno']);
  }
}
