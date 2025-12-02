// src/app/caracteristicas/perfil/administrador/administrador.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../compartido/componentes/header/header';
import { AuthService } from '../../../nucleo/servicios/auth.service';

@Component({
  selector: 'app-perfil-administrador',
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
              <p class="subtitle">{{ nombreCentro }} - Panel de Administración</p>
            </div>

            <div class="stats-grid">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon primary">people</mat-icon>
                    <div class="stat-info">
                      <h3>Usuarios Activos</h3>
                      <p class="stat-number">45</p>
                      <span class="stat-label">Total: 52</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon success">medical_services</mat-icon>
                    <div class="stat-info">
                      <h3>Consultas del Día</h3>
                      <p class="stat-number">87</p>
                      <span class="stat-label">Promedio: 92</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon warning">business</mat-icon>
                    <div class="stat-info">
                      <h3>Centros de Salud</h3>
                      <p class="stat-number">8</p>
                      <span class="stat-label">En red</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon info">storage</mat-icon>
                    <div class="stat-info">
                      <h3>Uso del Sistema</h3>
                      <p class="stat-number">87%</p>
                      <span class="stat-label">Capacidad</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="quick-actions">
              <h2>Gestión del Sistema</h2>
              <div class="actions-grid">
                <button mat-raised-button color="primary" (click)="irAUsuarios()">
                  <mat-icon>manage_accounts</mat-icon>
                  Gestionar Usuarios
                </button>
                <button mat-raised-button color="primary" (click)="irACentros()">
                  <mat-icon>business</mat-icon>
                  Centros de Salud
                </button>
                <button mat-raised-button color="primary" (click)="irAReportes()">
                  <mat-icon>assessment</mat-icon>
                  Reportes
                </button>
                <button mat-raised-button (click)="irAConfiguracion()">
                  <mat-icon>settings</mat-icon>
                  Configuración
                </button>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styleUrl: './administrador.scss'
})
export class PerfilAdministradorComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  hayRutaActiva = false;

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.hayRutaActiva = this.router.url !== '/administrador';
    });
  }

  get nombreUsuario(): string {
    const nombreCompleto = this.authService.usuarioActual()?.informacion?.nombre_completo;
    if (nombreCompleto) {
      const partes = nombreCompleto.split(',');
      return partes.length > 1 ? partes[1].trim() : nombreCompleto;
    }
    return this.authService.usuarioActual()?.username || 'Administrador';
  }

  get nombreCentro(): string {
    return this.authService.usuarioActual()?.informacion?.nombre_centro || '';
  }

  irAUsuarios(): void {
    this.router.navigate(['/administrador/usuarios']);
  }

  irACentros(): void {
    this.router.navigate(['/administrador/centros']);
  }

  irAReportes(): void {
    this.router.navigate(['/administrador/reportes']);
  }

  irAConfiguracion(): void {
    this.router.navigate(['/administrador/configuracion']);
  }
}
