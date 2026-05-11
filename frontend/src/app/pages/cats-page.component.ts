import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Cat, CatService } from '../cat.service';
import { CatDialogComponent, CatDialogData } from './cat-dialog.component';

@Component({
  standalone: true,
  selector: 'app-cats-page',
  imports: [
    FormsModule,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  template: `
    <section class="page">
      <div class="hero">
        <div>
          <p class="eyebrow">Личный питомник</p>
          <h1>Коты под контролем</h1>
          <p>Паспорта котов, фото, описание характера, лоток, питание, прививки и быстрый поиск по питомнику.</p>
        </div>
        <button mat-flat-button type="button" (click)="open()">Добавить кота</button>
      </div>

      <div class="stats">
        <mat-card>
          <strong>{{ rows().length }}</strong>
          <span>всего котов</span>
        </mat-card>
        <mat-card>
          <strong>{{ vaccinatedCount() }}</strong>
          <span>с прививками</span>
        </mat-card>
        <mat-card>
          <strong>{{ averageAge() }}</strong>
          <span>средний возраст</span>
        </mat-card>
      </div>

      <div class="filters">
        <mat-form-field>
          <mat-label>Поиск</mat-label>
          <input matInput [ngModel]="query()" (ngModelChange)="query.set($event)" placeholder="имя, порода, характер" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Характер</mat-label>
          <mat-select [ngModel]="temperamentFilter()" (ngModelChange)="temperamentFilter.set($event)">
            <mat-option value="">любой</mat-option>
            @for (item of temperaments(); track item) {
              <mat-option [value]="item">{{ item }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      @if (loading()) {
        <div class="empty">Загружаю питомник...</div>
      } @else if (!rows().length) {
        <div class="empty">
          <h3>Питомник пуст</h3>
          <p>Создай первого кота и проверь весь CRUD: создание, редактирование, удаление.</p>
          <button mat-stroked-button color="primary" type="button" (click)="open()">Создать кота</button>
        </div>
      } @else if (!filteredRows().length) {
        <div class="empty">По фильтрам никого нет.</div>
      } @else {
        <div class="grid">
          @for (cat of filteredRows(); track cat.id) {
            <mat-card class="cat-card" [style.--accent]="accent(cat)">
              @if (cat.photo_url) {
                <img class="cat-photo" [src]="cat.photo_url" [alt]="cat.name" />
              }
              <div class="cat-top">
                <div class="avatar">{{ initials(cat.name) }}</div>
                <div>
                  <h2>{{ cat.name }}</h2>
                  <p>{{ cat.breed || 'порода не указана' }}</p>
                </div>
              </div>

              <mat-chip-set>
                <mat-chip>{{ cat.age }} {{ ageLabel(cat.age) }}</mat-chip>
                <mat-chip>{{ cat.hairiness }}</mat-chip>
                <mat-chip>{{ cat.temperament }}</mat-chip>
                <mat-chip>{{ statusLabel(cat.status) }}</mat-chip>
                @if (cat.price) {
                  <mat-chip>{{ cat.price | number }} ₽</mat-chip>
                }
                @if (cat.vaccinated) {
                  <mat-chip>привит</mat-chip>
                }
                @if (cat.like_count) {
                  <mat-chip>{{ cat.like_count }} лайков</mat-chip>
                }
              </mat-chip-set>

              <div class="profile">
                <span>Окрас</span>
                <b>{{ cat.color || 'не указан' }}</b>
                <span>Игрушка</span>
                <b>{{ cat.favorite_toy || 'секрет' }}</b>
                <span>Лоток</span>
                <b>{{ cat.litter_trained ? 'приучен' : 'нужна адаптация' }}</b>
                <span>Питание</span>
                <b>{{ cat.food || 'не указано' }}</b>
                <span>Витрина</span>
                <b>{{ cat.show_in_showcase ? 'виден в ленте' : 'скрыт' }}</b>
              </div>

              @if (cat.character_details) {
                <p class="notes">{{ cat.character_details }}</p>
              }
              @if (cat.notes) {
                <p class="notes">{{ cat.notes }}</p>
              }

              <mat-card-actions align="end">
                <button mat-button color="primary" type="button" (click)="open(cat)">Изменить</button>
                <button mat-button color="warn" type="button" (click)="remove(cat)">Удалить</button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .hero {
        display: flex;
        gap: 22px;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
        padding: 34px;
        border-radius: 34px;
        background:
          radial-gradient(circle at 84% 10%, rgba(245, 184, 106, 0.46), transparent 17rem),
          linear-gradient(135deg, #2b1e12, #51341d);
        color: #fff8ef;
        box-shadow: 0 28px 90px rgba(45, 29, 13, 0.24);
      }
      .eyebrow {
        margin: 0 0 8px;
        color: #f0b86d;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      h1 {
        max-width: 760px;
        margin: 0;
        font-size: clamp(38px, 7vw, 76px);
        line-height: 0.92;
      }
      .hero p:last-child {
        max-width: 680px;
        margin: 14px 0 0;
        opacity: 0.78;
      }
      .hero button {
        min-width: 160px;
        background: #f0b86d;
        color: #2b1e12;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 14px;
      }
      .stats mat-card {
        padding: 18px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.72);
      }
      .stats strong {
        display: block;
        font-size: 34px;
        line-height: 1;
      }
      .stats span {
        color: rgba(34, 23, 15, 0.62);
      }
      .filters {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 240px;
        gap: 14px;
        margin-bottom: 18px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
      }
      .cat-card {
        position: relative;
        overflow: hidden;
        padding: 18px 18px 8px;
        border-radius: 28px;
        background: linear-gradient(180deg, #fffdf8, #ffffff);
      }
      .cat-photo {
        width: calc(100% + 36px);
        height: 190px;
        margin: -18px -18px 18px;
        object-fit: cover;
      }
      .cat-card::before {
        position: absolute;
        inset: 0 0 auto;
        height: 7px;
        background: var(--accent);
        content: '';
      }
      .cat-top {
        display: flex;
        gap: 14px;
        align-items: center;
        margin-bottom: 16px;
      }
      .avatar {
        display: grid;
        width: 58px;
        height: 58px;
        place-items: center;
        border-radius: 20px;
        background: var(--accent);
        color: white;
        font-weight: 900;
      }
      h2 {
        margin: 0;
        font-size: 24px;
      }
      .cat-top p { margin: 4px 0 0; color: #75685e; }
      mat-chip-set {
        display: block;
        margin-bottom: 16px;
      }
      .profile {
        display: grid;
        grid-template-columns: 82px 1fr;
        gap: 8px 12px;
        padding: 14px;
        border-radius: 18px;
        background: #f8efe3;
      }
      .notes { margin: 14px 0 0; color: #5f5044; }
      .empty,
      .error {
        padding: 30px;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.74);
        text-align: center;
      }
      .error {
        margin-bottom: 16px;
        color: #b3261e;
      }
      @media (max-width: 720px) {
        .hero,
        .filters {
          grid-template-columns: 1fr;
        }
        .hero {
          align-items: stretch;
          flex-direction: column;
          padding: 24px;
        }
        .stats {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CatsPageComponent implements OnInit {
  private readonly catsApi = inject(CatService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly rows = signal<Cat[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly query = signal('');
  readonly temperamentFilter = signal('');

  readonly filteredRows = computed(() => {
    const query = this.query().trim().toLowerCase();
    const temperament = this.temperamentFilter();
    return this.rows().filter((cat) => {
      const haystack = [cat.name, cat.breed, cat.hairiness, cat.color, cat.temperament, cat.character_details, cat.favorite_toy, cat.food, cat.notes]
        .join(' ')
        .toLowerCase();
      return (!query || haystack.includes(query)) && (!temperament || cat.temperament === temperament);
    });
  });

  readonly temperaments = computed(() =>
    [...new Set(this.rows().map((cat) => cat.temperament).filter(Boolean))].sort()
  );

  readonly vaccinatedCount = computed(() => this.rows().filter((cat) => cat.vaccinated).length);

  readonly averageAge = computed(() => {
    const rows = this.rows();
    if (!rows.length) return '0';
    return (rows.reduce((sum, cat) => sum + cat.age, 0) / rows.length).toFixed(1);
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.catsApi.list().subscribe({
      next: (data) => this.rows.set(data),
      error: () => {
        this.error.set('Не удалось загрузить котов');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  open(edit?: Cat): void {
    this.dialog
      .open(CatDialogComponent, {
        width: 'min(680px, calc(100vw - 28px))',
        data: edit ?? this.emptyCat(),
      })
      .afterClosed()
      .subscribe((res?: CatDialogData) => {
        if (!res) return;
        const body = this.toPayload(res);
        const request = res.id ? this.catsApi.patch(res.id, body) : this.catsApi.create(body);

        request.subscribe({
          next: () => {
            this.reload();
            this.toast(res.id ? 'Кот обновлён' : 'Кот создан');
          },
          error: () => this.toast('Сервер не принял кота'),
        });
      });
  }

  remove(cat: Cat): void {
    if (!window.confirm(`Удалить ${cat.name}?`)) return;
    this.catsApi.delete(cat.id).subscribe({
      next: () => {
        this.reload();
        this.toast('Кот удалён');
      },
      error: () => this.toast('Не удалось удалить'),
    });
  }

  initials(name: string): string {
    return name.trim().slice(0, 2).toUpperCase() || 'КТ';
  }

  accent(cat: Cat): string {
    const palette = ['#9b5c1e', '#7c3aed', '#0f766e', '#be123c', '#2563eb'];
    const seed = cat.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return palette[seed % palette.length];
  }

  ageLabel(age: number): string {
    const last = age % 10;
    const lastTwo = age % 100;
    if (last === 1 && lastTwo !== 11) return 'год';
    if ([2, 3, 4].includes(last) && ![12, 13, 14].includes(lastTwo)) return 'года';
    return 'лет';
  }

  private emptyCat(): CatDialogData {
    return {
      name: '',
      age: 1,
      breed: '',
      hairiness: 'средняя',
      color: '',
      temperament: 'спокойный',
      character_details: '',
      favorite_toy: '',
      food: '',
      litter_trained: true,
      vaccinated: false,
      photo_url: '',
      status: 'available',
      price: 0,
      show_in_showcase: true,
      notes: '',
    };
  }

  private toPayload(cat: CatDialogData): FormData {
    const data = new FormData();
    data.set('name', cat.name?.trim() ?? '');
    data.set('age', String(Number(cat.age ?? 1)));
    data.set('breed', cat.breed?.trim() ?? '');
    data.set('hairiness', cat.hairiness?.trim() ?? 'средняя');
    data.set('color', cat.color?.trim() ?? '');
    data.set('temperament', cat.temperament?.trim() ?? 'спокойный');
    data.set('character_details', cat.character_details?.trim() ?? '');
    data.set('favorite_toy', cat.favorite_toy?.trim() ?? '');
    data.set('food', cat.food?.trim() ?? '');
    data.set('litter_trained', String(cat.litter_trained ?? true));
    data.set('vaccinated', String(Boolean(cat.vaccinated)));
    data.set('status', cat.status ?? 'available');
    data.set('price', String(Number(cat.price ?? 0)));
    data.set('show_in_showcase', String(cat.show_in_showcase ?? true));
    data.set('notes', cat.notes?.trim() ?? '');
    if (cat.photoFile) data.set('photo', cat.photoFile);
    return data;
  }

  statusLabel(status: Cat['status']): string {
    return status === 'reserved' ? 'забронирован' : status === 'stays' ? 'остаётся' : 'ищет дом';
  }

  private toast(text: string): void {
    this.snack.open(text, 'Ок', { duration: 2200 });
  }
}
