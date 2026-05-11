import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface TopicReply {
  id: number;
  topic: number;
  author: number;
  author_name: string;
  body: string;
  created_at: string;
}

export interface Topic {
  id: number;
  author: number;
  author_name: string;
  title: string;
  category: string;
  category_label: string;
  body: string;
  reply_count: number;
  replies: TopicReply[];
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly http = inject(HttpClient);

  list(): Observable<Topic[]> {
    return this.http.get<Topic[]>('/api/topics/');
  }

  create(body: Pick<Topic, 'title' | 'category' | 'body'>): Observable<Topic> {
    return this.http.post<Topic>('/api/topics/', body);
  }

  reply(topicId: number, body: string): Observable<TopicReply> {
    return this.http.post<TopicReply>(`/api/topics/${topicId}/reply/`, { body });
  }
}
