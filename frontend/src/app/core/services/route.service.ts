import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Route,
  RouteFilters,
  PaginatedResponse,
  CreateRoutePayload,
} from '../../shared/models/rout.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RouteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/routes`;

  getRoutes(filters: RouteFilters = {}): Observable<PaginatedResponse<Route>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PaginatedResponse<Route>>(this.base, { params });
  }

  getRouteById(id: string): Observable<Route> {
    return this.http
      .get<{ success: boolean; data: Route }>(`${this.base}/${id}`)
      .pipe(map((r) => r.data));
  }

  createRoute(payload: CreateRoutePayload): Observable<Route> {
    return this.http
      .post<{ success: boolean; data: Route }>(this.base, payload)
      .pipe(map((r) => r.data));
  }

  updateRoute(id: string, payload: Partial<CreateRoutePayload>): Observable<Route> {
    return this.http
      .put<{ success: boolean; data: Route }>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  disableRoute(id: string): Observable<Route> {
    return this.http
      .patch<{ success: boolean; data: Route }>(`${this.base}/${id}/disable`, {})
      .pipe(map((r) => r.data));
  }
}
