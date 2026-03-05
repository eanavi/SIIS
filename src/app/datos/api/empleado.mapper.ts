import { EmpleadoViewModel } from "../modelos/empleado.model";
import { SaludService } from "../../nucleo/servicios/salud.service";
import { inject } from "@angular/core";


export function calcularEdad(fechaNacimiento?: string): number | null {
  if (!fechaNacimiento) return null;

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

export function mapEmpleadoToView(e: any): EmpleadoViewModel {


  const nombre_completo = `${e.paterno} ${e.materno}, ${e.nombres}`;

  const [anio, mes, dia] = e.fecha_nacimiento.split('-').map(Number);

  const fechaFormateada = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;


  const edad = calcularEdad(e.fecha_nacimiento);

  const estado: 'ACTIVO' | 'INACTIVO' = e.activo ? 'ACTIVO' : 'INACTIVO';

  const fechaNac: string = e.fecha_nacimiento ?  fechaFormateada : '';

  return {
    ci: e.ci,
    id_empleado: e.id_empleado,
    nombre_completo,
    fecha_nacimiento: fechaNac,
    edad,
    sexo: e.sexo,
    cargo: e.cargo,
    estado,

    badgeColor: estado === 'ACTIVO' ? 'primary' : 'warn',
    avatarIcon: e.sexo === 'M' ? 'man' : 'woman'
  };
}
