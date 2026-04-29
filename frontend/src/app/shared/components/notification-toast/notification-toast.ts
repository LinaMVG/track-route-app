import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (n of notifications(); track n.id) {
        <div class="toast toast--{{ n.type }}" role="alert" (click)="dismiss(n.id)">
          <span class="toast__icon">{{ icons[n.type] }}</span>
          <span class="toast__message">{{ n.message }}</span>
          <button class="toast__close" (click)="$event.stopPropagation(); dismiss(n.id)" aria-label="Cerrar">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; top: 1rem; right: 1rem; z-index: 9999;
      display: flex; flex-direction: column; gap: .5rem; max-width: 400px;
    }
    .toast {
      display: flex; align-items: center; gap: .75rem;
      padding: .875rem 1rem; border-radius: 6px; color: #fff; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      animation: slideIn .3s ease-out;
    }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .toast--success { background: #2e7d32; }
    .toast--error   { background: #c62828; }
    .toast--warning { background: #e65100; }
    .toast--info    { background: #01579b; }
    .toast__message { flex: 1; font-size: .875rem; }
    .toast__close   { background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer; line-height: 1; }
  `],
})
export class NotificationToastComponent {
  private readonly svc = inject(NotificationService);
  protected readonly notifications = this.svc.notifications;
  protected readonly icons: Record<string, string> = {
    success: '✓', error: '✗', warning: '⚠', info: 'ℹ',
  };
  protected dismiss(id: string): void { this.svc.dismiss(id); }
}
