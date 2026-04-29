import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:2rem">
      <h1>Monitoreo</h1>
      <p style="color:#666">Panel de monitoreo en tiempo real vía SOAP. (Fase 4)</p>
    </div>
  `,
})
export class MonitoringComponent {}
