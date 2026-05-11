import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Cat {
  id: number;
  name: string;
  age: number;
  breed: string;
  hairiness: string;
  color: string;
  temperament: string;
  character_details: string;
  favorite_toy: string;
  food: string;
  litter_trained: boolean;
  vaccinated: boolean;
  photo: string;
  photo_url: string;
  status: 'available' | 'reserved' | 'stays';
  price: number;
  show_in_showcase: boolean;
  like_count: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PublicCat {
  id: number;
  owner_id: number;
  owner_username: string;
  owner_name: string;
  name: string;
  age: number;
  breed: string;
  hairiness: string;
  color: string;
  temperament: string;
  character_details: string;
  favorite_toy: string;
  food: string;
  litter_trained: boolean;
  vaccinated: boolean;
  photo_url: string;
  status: Cat['status'];
  status_label: string;
  price: number;
  like_count: number;
  liked_by_me: boolean;
  notes: string;
  updated_at: string;
}

export interface LikeResult {
  liked: boolean;
  like_count: number;
}

@Injectable({ providedIn: 'root' })
export class CatService {
  private readonly http = inject(HttpClient);

  list(): Observable<Cat[]> {
    return this.http.get<Cat[]>('/api/cats/');
  }

  showcase(): Observable<PublicCat[]> {
    return this.http.get<PublicCat[]>('/api/showcase/');
  }

  create(body: Partial<Cat> | FormData): Observable<Cat> {
    return this.http.post<Cat>('/api/cats/', body);
  }

  patch(id: number, body: Partial<Cat> | FormData): Observable<Cat> {
    return this.http.patch<Cat>(`/api/cats/${id}/`, body);
  }

  like(id: number): Observable<LikeResult> {
    return this.http.post<LikeResult>(`/api/showcase/${id}/like/`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/cats/${id}/`);
  }
}
