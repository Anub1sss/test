import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';

interface Breeder {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  cat_count?: number;
}

interface ApiMessage {
  id: number;
  sender: number | Breeder;
  recipient: number | Breeder;
  body: string;
  created: string;
}

interface Message {
  id: number;
  sender: number;
  recipient: number;
  body: string;
  created: string;
}

interface SocketPayload {
  kind?: string;
  detail?: string;
  id?: number;
  sender_id?: number;
  recipient_id?: number;
  body?: string;
  created?: string;
}

@Component({
  standalone: true,
  selector: 'app-messages-page',
  imports: [DatePipe, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="page">
      <div class="hero">
        <div>
          <p class="eyebrow">Личный чат</p>
          <h1>Чат с заводчиками</h1>
          <p>Выбирай владельца кота, уточняй детали, договаривайся о знакомстве и условиях передачи.</p>
        </div>
      </div>

      @if (status()) {
        <div class="notice">{{ status() }}</div>
      }

      <div class="layout">
        <mat-card class="peers">
          <h2>Заводчики</h2>
          @if (!breeders().length) {
            <p class="muted">Пока не с кем переписываться. Зарегистрируй второго заводчика.</p>
          }
          @for (breeder of breeders(); track breeder.id) {
            <button
              mat-button
              class="peer"
              [class.active]="peerId() === breeder.id"
              type="button"
              (click)="selectPeer(breeder.id)"
            >
              <span>{{ breederName(breeder) }}</span>
              <small>{{ breeder.cat_count ?? 0 }} котов</small>
            </button>
          }
        </mat-card>

        <mat-card class="chat">
          <div class="chat-head">
            <h2>{{ peerTitle() }}</h2>
            <span>{{ thread().length }} сообщений</span>
          </div>

          <div class="thread">
            @if (!peerId()) {
              <div class="empty">Выбери заводчика слева.</div>
            } @else if (!thread().length) {
              <div class="empty">Диалог пуст. Начни первым.</div>
            }

            @for (message of thread(); track message.id) {
              <div class="message" [class.mine]="message.sender === myId()">
                <div class="bubble">
                  <div class="meta">
                    {{ senderName(message) }} · {{ message.created | date: 'short' }}
                  </div>
                  <div>{{ message.body }}</div>
                </div>
              </div>
            }
          </div>

          <div class="send">
            <mat-form-field class="grow">
              <mat-label>Текст</mat-label>
              <textarea
                matInput
                rows="3"
                [(ngModel)]="draft"
                [disabled]="!peerId()"
                (keydown.control.enter)="send()"
              ></textarea>
            </mat-form-field>
            <button
              mat-flat-button
              color="primary"
              type="button"
              [disabled]="!peerId() || !draft.trim() || !socketReady()"
              (click)="send()"
            >
              Отправить
            </button>
          </div>
        </mat-card>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        display: flex;
        gap: 18px;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
        padding: 28px;
        border-radius: 28px;
        background: #22170f;
        color: #fff8ef;
        box-shadow: 0 24px 80px rgba(34, 23, 15, 0.22);
      }
      .eyebrow {
        margin: 0 0 6px;
        color: #f0b86d;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      h1,
      h2 {
        margin: 0;
      }
      h1 {
        font-size: clamp(32px, 6vw, 58px);
        line-height: 0.95;
      }
      .hero p:last-child,
      .muted {
        opacity: 0.7;
      }
      .notice {
        margin-bottom: 14px;
        padding: 12px 16px;
        border-radius: 18px;
        background: #fff7d6;
      }
      .layout {
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
        gap: 16px;
      }
      .peers,
      .chat {
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.78);
      }
      .peers {
        padding: 18px;
      }
      .peer {
        display: block;
        width: 100%;
        margin-top: 8px;
        justify-content: flex-start;
        height: auto;
        padding: 10px 12px;
        text-align: left;
      }
      .peer span,
      .peer small {
        display: block;
      }
      .peer small {
        opacity: 0.55;
      }
      .peer.active {
        background: #f5eadb;
      }
      .chat {
        display: flex;
        min-height: 560px;
        padding: 18px;
        flex-direction: column;
      }
      .chat-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }
      .chat-head span {
        opacity: 0.65;
      }
      .thread {
        flex: 1;
        overflow: auto;
        padding: 16px;
        border-radius: 18px;
        background: linear-gradient(180deg, #fffaf2, #f7f3ed);
      }
      .message {
        display: flex;
        margin-bottom: 10px;
      }
      .message.mine {
        justify-content: flex-end;
      }
      .bubble {
        max-width: min(560px, 82%);
        padding: 11px 13px;
        border-radius: 18px;
        background: #ffffff;
        box-shadow: 0 8px 24px rgba(92, 61, 28, 0.08);
      }
      .mine .bubble {
        background: #2b1e12;
        color: #fff8ef;
      }
      .meta {
        margin-bottom: 4px;
        font-size: 12px;
        opacity: 0.62;
      }
      .empty {
        padding: 42px 12px;
        text-align: center;
        opacity: 0.6;
      }
      .send {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        margin-top: 14px;
      }
      .grow {
        flex: 1;
      }
      @media (max-width: 780px) {
        .hero,
        .send {
          align-items: stretch;
          flex-direction: column;
        }
        .layout {
          grid-template-columns: 1fr;
        }
        .chat {
          min-height: 520px;
        }
      }
    `,
  ],
})
export class MessagesPageComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly breeders = signal<Breeder[]>([]);
  readonly messages = signal<Message[]>([]);
  readonly myId = signal(0);
  readonly peerId = signal<number | null>(null);
  readonly socketReady = signal(false);
  readonly status = signal('');

  draft = '';

  private ws: WebSocket | null = null;
  private destroyed = false;
  private reconnectTimer: number | null = null;
  private requestedPeerId = 0;

  readonly peerTitle = computed(() => {
    const peer = this.breeders().find((x) => x.id === this.peerId());
    return peer ? this.breederName(peer) : 'Диалог';
  });

  readonly thread = computed(() => {
    const peer = this.peerId();
    const me = this.myId();
    if (!peer || !me) return [];
    return this.messages()
      .filter(
        (m) =>
          (m.sender === me && m.recipient === peer) ||
          (m.sender === peer && m.recipient === me)
      )
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
  });

  ngOnInit(): void {
    this.requestedPeerId = Number(this.route.snapshot.queryParamMap.get('peer') || 0);
    this.loadMe();
    this.loadBreeders();
    this.loadMessages();
    this.connect();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  selectPeer(id: number): void {
    this.peerId.set(id);
    this.status.set('');
  }

  send(): void {
    const recipientId = this.peerId();
    const body = this.draft.trim();
    if (!recipientId || !body) return;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.status.set('Чат переподключается');
      return;
    }

    this.ws.send(JSON.stringify({ recipient_id: recipientId, body }));
    this.draft = '';
  }

  breederName(breeder: Breeder): string {
    const fullName = [breeder.first_name, breeder.last_name].filter(Boolean).join(' ');
    return fullName || breeder.username;
  }

  senderName(message: Message): string {
    if (message.sender === this.myId()) return 'я';
    const breeder = this.breeders().find((x) => x.id === message.sender);
    return breeder ? this.breederName(breeder) : 'заводчик';
  }

  private loadMe(): void {
    this.http.get<Breeder>('/api/me/').subscribe({
      next: (user) => this.myId.set(user.id),
      error: () => this.status.set('Не удалось загрузить профиль'),
    });
  }

  private loadBreeders(): void {
    this.http.get<Breeder[]>('/api/breeders/').subscribe({
      next: (rows) => {
        this.breeders.set(rows);
        const requested = rows.find((row) => row.id === this.requestedPeerId);
        if (requested) this.peerId.set(requested.id);
        if (!this.peerId() && rows.length) this.peerId.set(rows[0].id);
      },
      error: () => this.status.set('Не удалось загрузить заводчиков'),
    });
  }

  private loadMessages(): void {
    this.http.get<ApiMessage[]>('/api/messages/').subscribe({
      next: (rows) => this.messages.set(rows.map((row) => this.normalize(row))),
      error: () => this.status.set('Не удалось загрузить сообщения'),
    });
  }

  private connect(): void {
    const token = this.auth.getAccess();
    if (!token) return;

    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${proto}//${location.host}/ws/messages/?token=${encodeURIComponent(token)}`);
    this.ws.onopen = () => {
      this.socketReady.set(true);
      this.status.set('');
    };
    this.ws.onclose = () => {
      this.socketReady.set(false);
      if (!this.destroyed) this.scheduleReconnect();
    };
    this.ws.onerror = () => this.status.set('Нет связи с чатом');
    this.ws.onmessage = (event) => this.handleSocketMessage(event.data);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 1800);
  }

  private handleSocketMessage(data: string): void {
    let payload: SocketPayload;
    try {
      payload = JSON.parse(data) as SocketPayload;
    } catch {
      return;
    }

    if (payload.kind === 'error') {
      this.status.set(payload.detail || 'Сообщение не отправлено');
      return;
    }

    if (!payload.id || !payload.sender_id || !payload.recipient_id || !payload.body || !payload.created) return;

    const row: Message = {
      id: payload.id,
      sender: payload.sender_id,
      recipient: payload.recipient_id,
      body: payload.body,
      created: payload.created,
    };

    this.messages.update((list) => (list.some((x) => x.id === row.id) ? list : [row, ...list]));
  }

  private normalize(row: ApiMessage): Message {
    return {
      id: row.id,
      sender: this.idOf(row.sender),
      recipient: this.idOf(row.recipient),
      body: row.body,
      created: row.created,
    };
  }

  private idOf(value: number | Breeder): number {
    return typeof value === 'number' ? value : value.id;
  }
}
