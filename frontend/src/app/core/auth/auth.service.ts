import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import {jwtDecode} from "jwt-decode";
import { AuthUser, LoginResponse } from "../../shared/models/auth.model";
import { environment } from "../../../environments/environment";

interface JwtPayload {
  sub: string;
  username: string;
  role: 'ADMIN' | 'OPERADOR';
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private router = inject(Router);

  private readonly _token = signal<string | null>(this.loadTokenFromStoarge());
  private readonly _user = signal<AuthUser | null>(this.loadUserFromToken(this._token()));

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => {
    const token = this._token();
    if (!token) return false;
    return !this.isTokenExpired(token);
  });
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  async login(username: string, password: string): Promise<void> {
    const response = await firstValueFrom(this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }));
    this.setSession(response.data.accessToken, response.data.user);
  }
  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private loadTokenFromStoarge(): string | null {
    return localStorage.getItem('accessToken');
  }

  private loadUserFromToken(token: string | null): AuthUser | null {
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if(decoded.exp * 1000 < Date.now()) return null;
      return {
        id: decoded.sub,
        username: decoded.username,
        role: decoded.role
      };
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 < Date.now() -10000;
    } catch {
      return true;
    }
  }

  private setSession(token: string, user: AuthUser): void {
    localStorage.setItem('accessToken', token);
    this._token.set(token);
    this._user.set(user);
  }
}
