import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpErrorResponse } from "@angular/common/http";


@Injectable({ providedIn: 'root'})
export class ErrorHandlerService {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  manejarError(error: HttpErrorResponse): void {
    console.error('🔥 Error capturado:', error);

    switch (error.status) {
      case 401:
        this.manejarErrorAutenticacion();
        break;

      case 403:
        this.manejarErrorPermisos();
        break;

      case 404:
        this.manejarErrorNoEncontrado(error);
        break;

      case 500:
        this.manejarErrorServidor();
        break;

      case 0:
        this.manejarErrorConexion();
        break;

      default:
        this.manejarErrorGenerico(error);
    }
  }

  private manejarErrorAutenticacion(): void {
    this.snackBar.open(
      'Tu sesión ha expirado. Por favor, inicie sesión nuevamente.',
      'Cerrar',
      {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );

    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 1500);
  }

  private manejarErrorPermisos(): void {
    this.snackBar.open(
      'No tienes permisos para acceder a este recurso.',
      'Cerrar',
      {
        duration: 4000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );
  }

  private manejarErrorNoEncontrado(error: HttpErrorResponse): void {
    this.snackBar.open(
      `Recurso no encontrado: ${error.url}`,
      'Cerrar',
      {
        duration: 3000,
        panelClass: ['warning-snackbar']
      }
    );
  }

  private manejarErrorServidor(): void {
    this.snackBar.open(
      'Error del servidor. Por favor, intenta más tarde.',
      'Cerrar',
      {
        duration: 4000,
        panelClass: ['error-snackbar']
      }
    );
  }

  private manejarErrorConexion(): void {
    this.snackBar.open(
      'No se pudo conectar con el servidor. Por favor, verifica tu conexión.',
      'Cerrar',
      {
        duration: 5000,
        panelClass: ['error-snackbar']
      }
    );
  }


  private manejarErrorGenerico(error: HttpErrorResponse): void {
    const mensaje = error.error?.mensaje || error.message || 'Ha ocurrido un error inesperado.';

    this.snackBar.open(
      mensaje,
      'Cerrar',
      {
        duration: 4000,
        panelClass: ['error-snackbar']
      }
    );
  }
}
