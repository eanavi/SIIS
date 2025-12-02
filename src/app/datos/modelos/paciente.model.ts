export interface PacienteAsignado {
  id_paciente: number;
  id_reserva: number;
  ci:string;
  paterno:string;
  materno:string;
  nombres:string;
  edad: string;
  sexo: string;
  fecha_reserva: string;
  hora_reserva: string;
}

export interface BusquedaPaciente {
  criterio?: string;
}
