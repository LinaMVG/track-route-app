import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RouteService } from '../../../core/services/route.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Route, RouteFilters, RouteStatus, VehicleType,
  ROUTE_STATUS_LABELS, VEHICLE_TYPE_LABELS,
} from '../../../shared/models/rout.model';
import {
  DataTableComponent, TableColumn, CellTemplateDirective,
} from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DataTableComponent, CellTemplateDirective],
  templateUrl: './route-list.component.html',
  styleUrls: ['./route-list.component.scss'],
})
export class RouteListComponent implements OnInit {
  private readonly routeService  = inject(RouteService);
  private readonly auth          = inject(AuthService);
  private readonly notification  = inject(NotificationService);
  private readonly fb            = inject(FormBuilder);

  protected readonly routes      = signal<Route[]>([]);
  protected readonly loading     = signal(false);
  protected readonly total       = signal(0);
  protected readonly nextCursor  = signal<string | null>(null);
  protected readonly cursorStack = signal<string[]>([]);
  protected readonly isAdmin     = this.auth.isAdmin;
  protected readonly hasPrev     = computed(() => this.cursorStack().length > 0);

  protected readonly filterForm = this.fb.group({
    originCity:      [''],
    destinationCity: [''],
    vehicleType:     ['' as VehicleType | ''],
    status:          ['' as RouteStatus | ''],
    carrier:         [''],
  });

  protected readonly columns: TableColumn<Route>[] = [
    { key: 'originCity',      label: 'Origen',        sortable: true  },
    { key: 'destinationCity', label: 'Destino',        sortable: true  },
    { key: 'vehicleType',     label: 'Vehículo',       sortable: false },
    { key: 'status',          label: 'Estado',         sortable: true  },
    { key: 'carrier',         label: 'Transportista',  sortable: true  },
    { key: 'cost',            label: 'Costo',          sortable: true  },
    { key: 'region',          label: 'Región',         sortable: false },
  ];

  protected readonly statusLabels  = ROUTE_STATUS_LABELS;
  protected readonly vehicleLabels = VEHICLE_TYPE_LABELS;
  protected readonly vehicleTypes: VehicleType[]  = ['CAMION', 'TRACTOMULA', 'FURGONETA', 'MOTO_CARGO'];
  protected readonly routeStatuses: RouteStatus[] = ['ACTIVA', 'INACTIVA', 'SUSPENDIDA', 'EN_MANTENIMIENTO'];

  constructor() {
    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.resetAndLoad());
  }

  ngOnInit(): void { this.loadRoutes(); }

  private buildFilters(cursor?: string): RouteFilters {
    const v = this.filterForm.value;
    return {
      originCity:      v.originCity      || undefined,
      destinationCity: v.destinationCity || undefined,
      vehicleType:     (v.vehicleType    || undefined) as VehicleType | undefined,
      status:          (v.status         || undefined) as RouteStatus | undefined,
      carrier:         v.carrier         || undefined,
      cursor,
      limit: 20,
    };
  }

  private loadRoutes(cursor?: string): void {
    this.loading.set(true);
    this.routeService.getRoutes(this.buildFilters(cursor)).subscribe({
      next: (res) => {
        this.routes.set(res.data);
        this.total.set(res.total);
        this.nextCursor.set(res.nextCursor);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar las rutas');
        this.loading.set(false);
      },
    });
  }

  protected resetAndLoad(): void {
    this.cursorStack.set([]);
    this.nextCursor.set(null);
    this.loadRoutes();
  }

  protected onNextPage(cursor: string): void {
    this.cursorStack.update((s) => [...s, cursor]);
    this.loadRoutes(cursor);
  }

  protected onPrevPage(): void {
    const stack = this.cursorStack();
    const prev  = stack.length >= 2 ? stack[stack.length - 2] : undefined;
    this.cursorStack.update((s) => s.slice(0, -1));
    this.loadRoutes(prev);
  }

  protected onDisable(route: Route): void {
    if (!confirm(`Inhabilitar la ruta ${route.originCity} → ${route.destinationCity}?`)) {
      return;
    }
    this.routeService.disableRoute(route.id).subscribe({
      next: () => { this.notification.success('Ruta inhabilitada'); this.resetAndLoad(); },
      error: () => this.notification.error('Error al inhabilitar la ruta'),
    });
  }

  protected formatCost(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  }

  protected getStatusLabel(status: RouteStatus): string {
  return this.statusLabels[status];
}

  protected getVehicleLabel(type: VehicleType): string {
    return this.vehicleLabels[type];
  }
}
