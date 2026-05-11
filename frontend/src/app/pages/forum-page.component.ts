import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ForumService, Topic } from '../forum.service';

@Component({
  standalone: true,
  selector: 'app-forum-page',
  imports: [DatePipe, FormsModule, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <section>
      <div class="hero forum-hero">
        <p class="eyebrow">Библиотека и форум</p>
        <h1>Темы о котах</h1>
        <p>Создавай тему по уходу, здоровью, питанию, поведению или разведению. Заводчики отвечают в обсуждении.</p>
      </div>

      <div class="composer">
        <mat-card>
          <h2>Новая тема</h2>
          <div class="form-grid">
            <mat-form-field>
              <mat-label>Заголовок</mat-label>
              <input matInput [(ngModel)]="newTitle" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Категория</mat-label>
              <mat-select [(ngModel)]="newCategory">
                @for (category of categories; track category.value) {
                  <mat-option [value]="category.value">{{ category.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <mat-form-field class="full">
            <mat-label>Описание вопроса или статьи</mat-label>
            <textarea matInput rows="4" [(ngModel)]="newBody"></textarea>
          </mat-form-field>
          <button mat-flat-button color="primary" type="button" [disabled]="!newTitle.trim() || !newBody.trim()" (click)="createTopic()">
            Опубликовать
          </button>
        </mat-card>
      </div>

      <div class="filters">
        <mat-form-field>
          <mat-label>Поиск по форуму</mat-label>
          <input matInput [ngModel]="query()" (ngModelChange)="query.set($event)" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Категория</mat-label>
          <mat-select [ngModel]="category()" (ngModelChange)="category.set($event)">
            <mat-option value="">все</mat-option>
            @for (item of categories; track item.value) {
              <mat-option [value]="item.value">{{ item.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <div class="topics">
        @for (topic of filtered(); track topic.id) {
          <mat-card class="topic" [class.active]="selected()?.id === topic.id" (click)="select(topic)">
            <mat-chip-set><mat-chip>{{ topic.category_label }}</mat-chip></mat-chip-set>
            <h2>{{ topic.title }}</h2>
            <p>{{ topic.body }}</p>
            <div class="meta">{{ topic.author_name }} · {{ topic.reply_count }} ответов · {{ topic.updated_at | date: 'short' }}</div>
          </mat-card>
        }
      </div>

      @if (selected(); as topic) {
        <mat-card class="discussion">
          <h2>{{ topic.title }}</h2>
          <p>{{ topic.body }}</p>
          <div class="replies">
            @for (reply of topic.replies; track reply.id) {
              <div class="reply">
                <b>{{ reply.author_name }}</b>
                <span>{{ reply.created_at | date: 'short' }}</span>
                <p>{{ reply.body }}</p>
              </div>
            }
          </div>
          <mat-form-field class="full">
            <mat-label>Ответить в тему</mat-label>
            <textarea matInput rows="3" [(ngModel)]="replyBody"></textarea>
          </mat-form-field>
          <button mat-flat-button color="primary" type="button" [disabled]="!replyBody.trim()" (click)="sendReply(topic)">
            Отправить ответ
          </button>
        </mat-card>
      }
    </section>
  `,
  styles: [
    `
      .hero { margin-bottom: 18px; padding: 34px; border-radius: 34px; background: linear-gradient(135deg, #111827, #4c1d95); color: #fff; }
      .eyebrow { margin: 0 0 8px; color: #facc15; font-size: 12px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
      h1 { margin: 0; font-size: clamp(38px, 7vw, 76px); line-height: .92; }
      .hero p:last-child { max-width: 780px; opacity: .82; }
      .composer mat-card, .discussion { margin-bottom: 18px; padding: 20px; border-radius: 28px; background: rgba(255,255,255,.86); }
      .form-grid, .filters { display: grid; grid-template-columns: 1fr 220px; gap: 14px; }
      .full { display: block; width: 100%; }
      .topics { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 18px; }
      .topic { padding: 18px; border-radius: 24px; background: rgba(255,255,255,.78); cursor: pointer; }
      .topic.active { outline: 3px solid #f0b86d; }
      .topic h2 { margin: 10px 0 8px; }
      .topic p { color: #5f5044; }
      .meta { color: #75685e; font-size: 13px; }
      .reply { margin-bottom: 12px; padding: 12px; border-radius: 16px; background: #f8efe3; }
      .reply span { margin-left: 8px; color: #75685e; font-size: 12px; }
      @media (max-width: 720px) { .form-grid, .filters { grid-template-columns: 1fr; } .hero { padding: 24px; } }
    `,
  ],
})
export class ForumPageComponent implements OnInit {
  private readonly forum = inject(ForumService);

  readonly topics = signal<Topic[]>([]);
  readonly query = signal('');
  readonly category = signal('');
  readonly selected = signal<Topic | null>(null);

  newTitle = '';
  newCategory = 'care';
  newBody = '';
  replyBody = '';

  readonly categories = [
    { value: 'care', label: 'Уход' },
    { value: 'health', label: 'Здоровье' },
    { value: 'food', label: 'Питание' },
    { value: 'behavior', label: 'Поведение' },
    { value: 'breeding', label: 'Разведение' },
    { value: 'stories', label: 'Истории' },
  ];

  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();
    return this.topics().filter((topic) => {
      const haystack = [topic.title, topic.body, topic.author_name, topic.category_label].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (!category || topic.category === category);
    });
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.forum.list().subscribe((topics) => {
      this.topics.set(topics);
      const current = this.selected();
      if (current) this.selected.set(topics.find((topic) => topic.id === current.id) ?? null);
    });
  }

  select(topic: Topic): void {
    this.selected.set(topic);
  }

  createTopic(): void {
    this.forum.create({ title: this.newTitle.trim(), category: this.newCategory, body: this.newBody.trim() }).subscribe((topic) => {
      this.newTitle = '';
      this.newBody = '';
      this.topics.update((topics) => [topic, ...topics]);
      this.selected.set(topic);
    });
  }

  sendReply(topic: Topic): void {
    this.forum.reply(topic.id, this.replyBody.trim()).subscribe(() => {
      this.replyBody = '';
      this.reload();
    });
  }
}
