export interface Menu {
  nombre_menu: string;
  ruta: string;
  icono: string;
  orden: number;
  metodo: string[];
}

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  orden: number;
  metodos: string[];
}
