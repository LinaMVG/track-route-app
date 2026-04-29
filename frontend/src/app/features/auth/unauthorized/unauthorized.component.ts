import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1rem;text-align:center;padding:2rem">
      <h1 style="font-size:5rem;margin:0;color:#c62828">403</h1>
      <h2>Acceso denegado</h2>
      <p style="color:#666;max-width:400px">No tienes permisos para acceder a esta sección.</p>
      <a routerLink="/dashboard" style="color:#1a237e;font-weight:600">← Volver al inicio</a>
    </div>
  `,
})
export class UnauthorizedComponent {}
