import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:2rem">
      <h1>Dashboard</h1>
      <p style="color:#666">Resumen general del sistema de rutas. (Fase 5)</p>
    </div>
  `,
})
export class DashboardComponent {}
