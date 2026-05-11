import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

const LS_ACCESS = 'access';
const LS_REFRESH = 'refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  isLoggedIn(): boolean {
    return !!localStorage.getItem(LS_ACCESS);
  }

  getAccess(): string | null {
    return localStorage.getItem(LS_ACCESS);
  }

  getRefresh(): string | null {
    return localStorage.getItem(LS_REFRESH);
  }

  setTokens(access: string, refresh: string): void {
    localStorage.setItem(LS_ACCESS, access);
    localStorage.setItem(LS_REFRESH, refresh);
  }

  logout(): void {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    this.router.navigateByUrl('/login');
  }

  login(username: string, password: string): Observable<{ access: string; refresh: string }> {
    return this.http
      .post<{ access: string; refresh: string }>('/api/token/', {
        username,
        password,
      })
      .pipe(tap((t) => this.setTokens(t.access, t.refresh)));
  }

  register(payload: {
    username: string;
    password: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  }): Observable<unknown> {
    return this.http.post('/api/register/', payload);
  }

  refresh(): Observable<{ access: string }> {
    const ref = this.getRefresh();
    if (!ref) {
      this.logout();
      return throwError(() => new Error('no refresh'));
    }
    return this.http
      .post<{ access: string }>('/api/token/refresh/', { refresh: ref })
      .pipe(
        tap((t) => localStorage.setItem(LS_ACCESS, t.access)),
        catchError(() => {
          this.logout();
          return throwError(() => new Error('refresh failed'));
        })
      );
  }

  me(): Observable<{ username: string }> {
    return this.http.get<{ username: string }>('/api/me/');
  }
}
