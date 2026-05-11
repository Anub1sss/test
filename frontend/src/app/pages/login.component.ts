import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
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
        <p class="eyebrow">Котоферма</p>
        <h1>Закрытый кабинет заводчика</h1>
        <p>Коты, паспорта, фото, лента и личный чат с другими заводчиками в одном кабинете.</p>
      </section>
      <mat-card>
        <mat-card-title>Вход</mat-card-title>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field class="full">
              <mat-label>Имя пользователя</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
            </mat-form-field>
            <mat-form-field class="full">
              <mat-label>Пароль</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                autocomplete="current-password"
              />
            </mat-form-field>
            @if (err) {
              <p class="err">{{ err }}</p>
            }
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">
              Войти
            </button>
            <a mat-button routerLink="/register">Регистрация</a>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .auth-page {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 410px;
        gap: 28px;
        width: min(980px, calc(100vw - 32px));
        min-height: 100vh;
        margin: 0 auto;
        align-items: center;
      }
      .pitch {
        padding: 36px;
        border-radius: 34px;
        background: #2b1e12;
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
        max-width: 560px;
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
        margin: 0 0 8px;
      }
      @media (max-width: 820px) {
        .auth-page {
          grid-template-columns: 1fr;
          padding: 24px 0;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  err = '';

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    this.err = '';
    const v = this.form.getRawValue();
    this.loading = true;
    this.auth.login(v.username.trim(), v.password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => {
        this.err = 'Неверные данные';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
