import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EntornoService } from './nucleo/config/entorno.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('siis');

  private entornoService = inject(EntornoService);
  apiUrl = this.entornoService.obtenerApiUrl();

  constructor(){
    console.log('Api URL', this.apiUrl);
  }

}
