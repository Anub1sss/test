import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Cat } from '../cat.service';

export type CatDialogData = Partial<Cat> & { id?: number; photoFile?: File | null };

@Component({
  standalone: true,
  selector: 'app-cat-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.id ? 'Паспорт кота' : 'Новый кот' }}</h2>
    <mat-dialog-content [formGroup]="form" class="dialog-grid">
      <mat-form-field>
        <mat-label>Имя</mat-label>
        <input matInput formControlName="name" maxlength="120" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Возраст</mat-label>
        <input matInput type="number" min="0" max="40" formControlName="age" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Порода</mat-label>
        <input matInput formControlName="breed" maxlength="120" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Окрас</mat-label>
        <input matInput formControlName="color" maxlength="80" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Волосатость</mat-label>
        <mat-select formControlName="hairiness">
          @for (item of hairinessOptions; track item) {
            <mat-option [value]="item">{{ item }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Характер</mat-label>
        <mat-select formControlName="temperament">
          @for (item of temperamentOptions; track item) {
            <mat-option [value]="item">{{ item }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="wide">
        <mat-label>Подробно о характере</mat-label>
        <textarea matInput rows="3" formControlName="character_details"></textarea>
      </mat-form-field>

      <mat-form-field class="wide">
        <mat-label>Любимая игрушка</mat-label>
        <input matInput formControlName="favorite_toy" maxlength="120" />
      </mat-form-field>

      <mat-form-field class="wide">
        <mat-label>Питание</mat-label>
        <input matInput formControlName="food" maxlength="160" placeholder="корм, натуральное питание, режим" />
      </mat-form-field>

      <mat-checkbox class="wide" formControlName="vaccinated">Прививки сделаны</mat-checkbox>
      <mat-checkbox class="wide" formControlName="litter_trained">Приучен к лотку</mat-checkbox>

      <mat-form-field>
        <mat-label>Статус</mat-label>
        <mat-select formControlName="status">
          <mat-option value="available">Ищет дом</mat-option>
          <mat-option value="reserved">Забронирован</mat-option>
          <mat-option value="stays">Остаётся в питомнике</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Цена, ₽</mat-label>
        <input matInput type="number" min="0" formControlName="price" />
      </mat-form-field>

      <mat-checkbox class="wide" formControlName="show_in_showcase">Показывать в витрине</mat-checkbox>

      <mat-form-field class="wide">
        <mat-label>Описание кота</mat-label>
        <textarea matInput rows="4" formControlName="notes"></textarea>
      </mat-form-field>

      <div class="photo-field wide">
        @if (photoPreview) {
          <img [src]="photoPreview" alt="Фото кота" />
        }
        <div>
          <strong>Фото кота</strong>
          <p>JPG/PNG, будет видно в ленте.</p>
          <input type="file" accept="image/*" (change)="selectPhoto($event)" />
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Отмена</button>
      <button mat-flat-button color="primary" type="button" [disabled]="form.invalid" (click)="save()">
        Сохранить
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px 14px;
        padding-top: 8px;
      }
      .wide {
        grid-column: 1 / -1;
      }
      mat-checkbox {
        margin: 2px 0 12px;
      }
      .photo-field {
        display: flex;
        gap: 14px;
        align-items: center;
        margin-bottom: 12px;
        padding: 14px;
        border-radius: 18px;
        background: #f8efe3;
      }
      .photo-field img {
        width: 88px;
        height: 88px;
        object-fit: cover;
        border-radius: 18px;
      }
      .photo-field p {
        margin: 4px 0 10px;
        color: #75685e;
      }
      @media (max-width: 560px) {
        .dialog-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CatDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<CatDialogComponent, CatDialogData>);
  readonly data = inject<CatDialogData>(MAT_DIALOG_DATA);
  readonly hairinessOptions = ['лысый', 'короткая', 'средняя', 'пушистая', 'королевская'];
  readonly temperamentOptions = ['спокойный', 'игривый', 'важный', 'дикарь', 'обниматель'];

  readonly form = this.fb.nonNullable.group({
    name: [this.data.name ?? '', [Validators.required, Validators.maxLength(120)]],
    age: [this.data.age ?? 1, [Validators.required, Validators.min(0), Validators.max(40)]],
    breed: [this.data.breed ?? '', Validators.maxLength(120)],
    color: [this.data.color ?? '', Validators.maxLength(80)],
    hairiness: [this.data.hairiness ?? 'средняя', [Validators.required, Validators.maxLength(64)]],
    temperament: [this.data.temperament ?? 'спокойный', [Validators.required, Validators.maxLength(80)]],
    character_details: [this.data.character_details ?? ''],
    favorite_toy: [this.data.favorite_toy ?? '', Validators.maxLength(120)],
    food: [this.data.food ?? '', Validators.maxLength(160)],
    litter_trained: [this.data.litter_trained ?? true],
    vaccinated: [this.data.vaccinated ?? false],
    status: [this.data.status ?? 'available'],
    price: [this.data.price ?? 0, [Validators.required, Validators.min(0)]],
    show_in_showcase: [this.data.show_in_showcase ?? true],
    notes: [this.data.notes ?? ''],
  });

  photoFile: File | null = null;
  photoPreview = this.data.photo_url ?? '';

  selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.photoFile = file;
    this.photoPreview = URL.createObjectURL(file);
  }

  save(): void {
    const value = this.form.getRawValue();
    this.ref.close({
      id: this.data.id,
      name: value.name.trim(),
      age: value.age,
      breed: value.breed.trim(),
      color: value.color.trim(),
      hairiness: value.hairiness.trim(),
      temperament: value.temperament.trim(),
      character_details: value.character_details.trim(),
      favorite_toy: value.favorite_toy.trim(),
      food: value.food.trim(),
      litter_trained: value.litter_trained,
      vaccinated: value.vaccinated,
      status: value.status,
      price: value.price,
      show_in_showcase: value.show_in_showcase,
      notes: value.notes.trim(),
      photoFile: this.photoFile,
    });
  }
}
