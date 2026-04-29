import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { RouteService } from '../../../core/services/route.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  RouteStatus,
  VehicleType,
  ROUTE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
} from '../../../shared/models/route.models';

@Component({
  selector: 'app-route-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './route-form.component.html',
  styleUrls: ['./route-form.component.scss'],
})
export class RouteFormComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly editId = signal<string | null>(null);
  protected readonly isEdit = () => this.editId() !== null;

  protected readonly vehicleTypes: VehicleType[] = [
    'CAMION',
    'TRACTOMULA',
    'FURGONETA',
    'MOTO_CARGO',
  ];
  protected readonly routeStatuses: RouteStatus[] = [
    'ACTIVA',
    'INACTIVA',
    'SUSPENDIDA',
    'EN_MANTENIMIENTO',
  ];
  protected readonly statusLabels = ROUTE_STATUS_LABELS;
  protected readonly vehicleLabels = VEHICLE_TYPE_LABELS;

  protected readonly form = this.fb.group({
    originCity: ['', [Validators.required, Validators.maxLength(100)]],
    destinationCity: ['', [Validators.required, Validators.maxLength(100)]],
    vehicleType: ['' as VehicleType | '', [Validators.required]],
    status: ['' as RouteStatus | '', [Validators.required]],
    carrier: ['', [Validators.required, Validators.maxLength(100)]],
    cost: [null as number | null, [Validators.required, Validators.min(0)]],
    distanceKm: [null as number | null],
    estimatedTimeHours: [null as number | null],
    region: [''],
  });

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.loading.set(true);
      this.routeService.getRouteById(id).subscribe({
        next: (route) => {
          this.form.patchValue({
            originCity: route.originCity,
            destinationCity: route.destinationCity,
            vehicleType: route.vehicleType,
            status: route.status,
            carrier: route.carrier,
            cost: route.cost,
            distanceKm: route.distanceKm ?? null,
            estimatedTimeHours: route.estimatedTimeHours ?? null,
            region: route.region ?? '',
          });
          this.loading.set(false);
        },
        error: () => {
          this.notification.error('No se pudo cargar la ruta');
          this.router.navigate(['/routes']);
        },
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const value = this.form.value as {
      originCity: string;
      destinationCity: string;
      vehicleType: VehicleType;
      status: RouteStatus;
      carrier: string;
      cost: number;
      distanceKm?: number | null;
      estimatedTimeHours?: number | null;
      region?: string;
    };
    const payload = {
      ...value,
      distanceKm: value.distanceKm ?? undefined,
      estimatedTimeHours: value.estimatedTimeHours ?? undefined,
      region: value.region || undefined,
    };

    const request$ = this.isEdit()
      ? this.routeService.updateRoute(this.editId()!, payload)
      : this.routeService.createRoute(payload);

    request$.subscribe({
      next: () => {
        this.notification.success(
          this.isEdit() ? 'Ruta actualizada' : 'Ruta creada',
        );
        this.router.navigate(['/routes']);
      },
      error: (err) => {
        this.notification.error(
          err?.error?.error?.message ?? 'Error al guardar la ruta',
        );
        this.loading.set(false);
      },
    });
  }
}
