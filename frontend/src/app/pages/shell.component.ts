import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar class="topbar">
      <a class="brand" routerLink="/cats">Котоферма</a>
      <span class="grow"></span>
      <a mat-button routerLink="/cats" routerLinkActive="active">Коты</a>
      <a mat-button routerLink="/showcase" routerLinkActive="active">Лента</a>
      <a mat-button routerLink="/messages" routerLinkActive="active">Чат</a>
      <a mat-button routerLink="/forum" routerLinkActive="active">Форум</a>
      <button mat-button type="button" (click)="auth.logout()">Выйти</button>
    </mat-toolbar>
    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .topbar {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #160d08;
        color: #fff8ef;
        backdrop-filter: blur(14px);
        box-shadow: 0 12px 36px rgba(22, 13, 8, 0.28);
      }
      .brand {
        color: inherit;
        font-weight: 800;
        letter-spacing: 0.02em;
        text-decoration: none;
      }
      .grow {
        flex: 1;
      }
      .active {
        background: #f0b86d;
        color: #160d08;
        font-weight: 800;
      }
      .content {
        width: min(1120px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 28px 0 48px;
      }
      @media (max-width: 640px) {
        .brand {
          font-size: 16px;
        }
        .content {
          width: min(100vw - 20px, 1120px);
          padding-top: 18px;
        }
      }
    `,
  ],
})
export class ShellComponent {
  readonly auth = inject(AuthService);
}
