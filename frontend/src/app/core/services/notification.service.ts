import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  success(message: string): void { this.add({ type: 'success', message }); }
  error(message: string): void   { this.add({ type: 'error',   message }); }
  warning(message: string): void { this.add({ type: 'warning', message }); }
  info(message: string): void    { this.add({ type: 'info',    message }); }

  dismiss(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  private add(notification: Omit<Notification, 'id'>): void {
    const id = crypto.randomUUID();
    this._notifications.update((list) => [...list, { ...notification, id }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
