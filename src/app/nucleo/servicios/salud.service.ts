import { Injectable, inject } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class SaludService{

  edad(fecha_nacimiento: string | Date): string {
    if (!fecha_nacimiento) return '';

    const hoy = new Date();

    const nacimiento = new Date(fecha_nacimiento);
    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
      dias += mesAnterior;
    }

    if (meses < 0) {
      anios--;
      meses += 12;
    }

    if (anios < 1) {
      return `${meses} meses, ${dias} días`;
    }

    return `${anios} años, ${meses} meses`;
  }

  formatearFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaFormateada = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    return fechaFormateada;
  }


}
