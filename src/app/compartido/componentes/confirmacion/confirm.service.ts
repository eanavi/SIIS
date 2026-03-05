import { Injectable, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Confirmacion } from "./confirmacion";
import { ConfirmOptions } from "../../../datos/modelos/confimacion.modelo";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root'})
export class ConfirmService{
  private dialog = inject(MatDialog);

  confirmar(options: ConfirmOptions): Observable<boolean> {
    const dialogRef = this.dialog.open(Confirmacion, {
      width: '420px',
      disableClose: true,
      data: options
    });

    return dialogRef.afterClosed();
  }
}
