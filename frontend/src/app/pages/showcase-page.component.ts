import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CatService, PublicCat } from '../cat.service';

@Component({
  standalone: true,
  selector: 'app-showcase-page',
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <section>
      <div class="hero market">
        <div>
          <p class="eyebrow">Лента питомника</p>
          <h1>Коты заводчиков</h1>
          <p>Ищи котов по заводчику, породе, статусу и сразу пиши владельцу.</p>
        </div>
      </div>

      <div class="tools">
        <mat-form-field>
          <mat-label>Поиск</mat-label>
          <input matInput [ngModel]="query()" (ngModelChange)="query.set($event)" placeholder="имя, окрас, описание" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Заводчик</mat-label>
          <mat-select [ngModel]="ownerId()" (ngModelChange)="ownerId.set($event)">
            <mat-option [value]="0">любой</mat-option>
            @for (owner of owners(); track owner.id) {
              <mat-option [value]="owner.id">{{ owner.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Порода</mat-label>
          <mat-select [ngModel]="breed()" (ngModelChange)="breed.set($event)">
            <mat-option value="">любая</mat-option>
            @for (item of breeds(); track item) {
              <mat-option [value]="item">{{ item }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Статус</mat-label>
          <mat-select [ngModel]="status()" (ngModelChange)="status.set($event)">
            <mat-option value="">любой</mat-option>
            <mat-option value="available">ищет дом</mat-option>
            <mat-option value="reserved">забронирован</mat-option>
            <mat-option value="stays">остаётся</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="empty">Загружаю ленту...</div>
      } @else if (!filtered().length) {
        <div class="empty">По этим фильтрам котов нет.</div>
      } @else {
        <div class="feed">
          @for (cat of filtered(); track cat.id) {
            <mat-card class="feed-card">
              @if (cat.photo_url) {
                <img class="photo" [src]="cat.photo_url" [alt]="cat.name" />
              } @else {
                <div class="photo placeholder">{{ initials(cat.name) }}</div>
              }
              <div class="body">
                <div class="head">
                  <div>
                    <div class="badge">{{ cat.status_label }}</div>
                    <h2>{{ cat.name }}</h2>
                    <p class="owner">{{ cat.owner_name }} · {{ cat.owner_username }}</p>
                  </div>
                  <strong>{{ cat.price ? (cat.price | number) + ' ₽' : 'по договорённости' }}</strong>
                </div>
                <mat-chip-set>
                  <mat-chip>{{ cat.breed || 'без породы' }}</mat-chip>
                  <mat-chip>{{ cat.age }} {{ ageLabel(cat.age) }}</mat-chip>
                  <mat-chip>{{ cat.temperament }}</mat-chip>
                  <mat-chip>{{ cat.litter_trained ? 'лоток: да' : 'лоток: адаптация' }}</mat-chip>
                  @if (cat.vaccinated) {
                    <mat-chip>привит</mat-chip>
                  }
                </mat-chip-set>
                @if (cat.character_details) {
                  <p class="desc strong-desc">{{ cat.character_details }}</p>
                }
                <p class="desc">{{ cat.notes || 'Заводчик пока не добавил описание, но кот уже в ленте.' }}</p>
                <div class="actions">
                  <button mat-stroked-button type="button" (click)="toggleLike(cat)">
                    {{ cat.liked_by_me ? 'Убрать лайк' : 'Лайк' }} · {{ cat.like_count }}
                  </button>
                  <a mat-flat-button color="primary" [routerLink]="['/messages']" [queryParams]="{ peer: cat.owner_id }">
                    Написать заводчику
                  </a>
                </div>
              </div>
            </mat-card>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .market { background: linear-gradient(135deg, #0f766e, #2b1e12); }
      .hero { margin-bottom: 18px; padding: 34px; border-radius: 34px; color: #fff8ef; }
      .eyebrow { margin: 0 0 8px; color: #9af3df; font-size: 12px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
      h1 { margin: 0; font-size: clamp(38px, 7vw, 76px); line-height: .92; }
      .hero p:last-child { max-width: 720px; opacity: .78; }
      .tools { display: grid; grid-template-columns: 1fr 220px 180px 180px; gap: 14px; margin-bottom: 18px; }
      .feed { display: grid; gap: 16px; }
      .feed-card { display: grid; grid-template-columns: 260px 1fr; overflow: hidden; border-radius: 30px; background: rgba(255,255,255,.82); }
      .photo { width: 100%; height: 100%; min-height: 260px; object-fit: cover; background: #2b1e12; color: #fff8ef; }
      .placeholder { display: grid; place-items: center; font-size: 54px; font-weight: 900; }
      .body { padding: 22px; }
      .head { display: flex; gap: 16px; justify-content: space-between; }
      .badge { width: fit-content; margin-bottom: 10px; padding: 7px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 800; }
      h2 { margin: 0; font-size: 30px; }
      .owner { margin: 4px 0 14px; color: #75685e; }
      .desc { color: #5f5044; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-end; }
      .empty { padding: 30px; border-radius: 28px; background: rgba(255,255,255,.74); text-align: center; }
      @media (max-width: 900px) { .tools { grid-template-columns: 1fr 1fr; } .feed-card { grid-template-columns: 1fr; } }
      @media (max-width: 620px) { .tools { grid-template-columns: 1fr; } .hero { padding: 24px; } .actions { justify-content: stretch; } }
    `,
  ],
})
export class ShowcasePageComponent implements OnInit {
  private readonly cats = inject(CatService);

  readonly rows = signal<PublicCat[]>([]);
  readonly loading = signal(false);
  readonly query = signal('');
  readonly ownerId = signal(0);
  readonly breed = signal('');
  readonly status = signal('');

  readonly owners = computed(() => {
    const map = new Map<number, string>();
    for (const cat of this.rows()) map.set(cat.owner_id, cat.owner_name);
    return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly breeds = computed(() => [...new Set(this.rows().map((cat) => cat.breed).filter(Boolean))].sort());

  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const ownerId = this.ownerId();
    const breed = this.breed();
    const status = this.status();
    return this.rows().filter((cat) => {
      const haystack = [cat.name, cat.breed, cat.color, cat.temperament, cat.character_details, cat.food, cat.owner_name, cat.notes].join(' ').toLowerCase();
      return (
        (!query || haystack.includes(query)) &&
        (!ownerId || cat.owner_id === ownerId) &&
        (!breed || cat.breed === breed) &&
        (!status || cat.status === status)
      );
    });
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.cats.showcase().subscribe({
      next: (rows) => this.rows.set(rows),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  toggleLike(cat: PublicCat): void {
    this.cats.like(cat.id).subscribe((result) => {
      this.rows.update((rows) => rows.map((row) => row.id === cat.id ? { ...row, liked_by_me: result.liked, like_count: result.like_count } : row));
    });
  }

  initials(name: string): string {
    return name.trim().slice(0, 2).toUpperCase() || 'КТ';
  }

  ageLabel(age: number): string {
    const last = age % 10;
    const lastTwo = age % 100;
    if (last === 1 && lastTwo !== 11) return 'год';
    if ([2, 3, 4].includes(last) && ![12, 13, 14].includes(lastTwo)) return 'года';
    return 'лет';
  }
}
