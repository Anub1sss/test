import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

function registerErrorText(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const b = err.error;
    if (typeof b === 'object' && b !== null) {
      const parts = Object.entries(b as Record<string, unknown>).flatMap(
        ([k, v]) => {
          if (Array.isArray(v)) return v.map((x) => `${k}: ${String(x)}`);
          if (typeof v === 'string') return [`${k}: ${v}`];
          return [];
        }
      );
      if (parts.length) return parts.join(' · ');
    }
    if (err.status === 0) return 'Нет связи с сервером (проверьте Docker / сеть)';
    return `Ошибка ${err.status}`;
  }
  return 'Не удалось зарегистрироваться';
}

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <div class="auth-page">
      <section class="pitch">
        <p class="eyebrow">Регистрация</p>
        <h1>Стань заводчиком</h1>
        <p>После регистрации сразу попадёшь в личный питомник и сможешь писать другим заводчикам.</p>
      </section>
      <mat-card>
        <mat-card-title>Регистрация заводчика</mat-card-title>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field class="full">
              <mat-label>Имя пользователя</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
            </mat-form-field>
            <mat-form-field class="full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <mat-form-field class="full">
              <mat-label>Имя</mat-label>
              <input matInput formControlName="first_name" />
            </mat-form-field>
            <mat-form-field class="full">
              <mat-label>Фамилия</mat-label>
              <input matInput formControlName="last_name" />
            </mat-form-field>
            <mat-form-field class="full">
              <mat-label>Пароль</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                autocomplete="new-password"
              />
            </mat-form-field>
            @if (err) {
              <p class="err">{{ err }}</p>
            }
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">
              Зарегистрироваться
            </button>
            <a mat-button routerLink="/login">Уже есть аккаунт</a>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .auth-page {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 460px;
        gap: 28px;
        width: min(1040px, calc(100vw - 32px));
        min-height: 100vh;
        margin: 0 auto;
        align-items: center;
      }
      .pitch {
        padding: 36px;
        border-radius: 34px;
        background:
          radial-gradient(circle at 80% 0%, rgba(240, 184, 109, 0.42), transparent 18rem),
          #2b1e12;
        color: #fff8ef;
        box-shadow: 0 30px 90px rgba(34, 23, 15, 0.24);
      }
      .eyebrow {
        margin: 0 0 10px;
        color: #f0b86d;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        font-size: clamp(40px, 7vw, 72px);
        line-height: 0.9;
      }
      .pitch p:last-child {
        opacity: 0.74;
      }
      mat-card {
        padding: 14px;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.78);
      }
      .full {
        width: 100%;
        display: block;
      }
      .err {
        color: var(--mat-sys-error);
        margin: 0 0 10px;
      }
      @media (max-width: 860px) {
        .auth-page {
          grid-template-columns: 1fr;
          padding: 24px 0;
        }
      }
    `,
  ],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  err = '';

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: [''],
    first_name: [''],
    last_name: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    this.err = '';
    const raw = this.form.getRawValue();
    const username = raw.username.trim();
    this.loading = true;
    this.auth
      .register({
        username,
        password: raw.password,
        email: raw.email.trim() || undefined,
        first_name: raw.first_name.trim() || undefined,
        last_name: raw.last_name.trim() || undefined,
      })
      .pipe(
        catchError((e) => {
          this.err = registerErrorText(e);
          this.loading = false;
          return throwError(() => e);
        }),
        switchMap(() => this.auth.login(username, raw.password))
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (e) => {
          if (!this.err) this.err = registerErrorText(e);
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
  }
}
