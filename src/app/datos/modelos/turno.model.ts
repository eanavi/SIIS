import { PrestacionLista } from "./prestacion.model";


export interface Turno {
  id_turno: number;
  id_medico: number;
  dia_semana: string;
  fecha_calendario: string; // Formato: YYYY-MM-DD
  hora_inicio: string;
  hora_final: string;
}

export interface TurnoBase {
  id_medico: number;
  id_prestacion: number;
  fecha_inicio: string;
  fecha_final: string;
  hora_inicio: string;
  hora_final: string;
  dia_semana: string[];
}


export interface TurnoBaseLectura {
  id_turno: number;
  id_medico: number;
  prestacion: PrestacionLista;
  fecha_inicio: string;
  fecha_final: string;
  hora_inicio: string;
  hora_final: string;
  dia_semana: string[];
}


export interface TurnosResponse {
  total: number;
  pagina: number;
  tamanio: number;
  items: TurnoBaseLectura[];
}


export interface DiaSemana {
  codigo: string;
  nombre: string;
  abreviatura: string;
  seleccionado: boolean;
}


export interface BusquedaTurnoParams {
  fecha?: string; // Formato: YYYY-MM-DD
}
