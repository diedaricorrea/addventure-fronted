import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmDialog } from '../../services/confirm.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (currentDialog) {
      <div class="dialog-backdrop" [@fadeIn] (click)="cancel()">
        <div class="dialog-container" (click)="$event.stopPropagation()" [@slideIn]>
          <div class="dialog-header" [class.dialog-warning]="currentDialog.type === 'warning'"
               [class.dialog-danger]="currentDialog.type === 'danger'">
            <h3>{{ currentDialog.title }}</h3>
          </div>

          <div class="dialog-body">
            <p>{{ currentDialog.message }}</p>
          </div>

          <div class="dialog-actions">
            <button class="btn btn-cancel" (click)="cancel()">
              {{ currentDialog.cancelText || 'Cancelar' }}
            </button>
            <button
              class="btn btn-confirm"
              [class.btn-warning]="currentDialog.type === 'warning'"
              [class.btn-danger]="currentDialog.type === 'danger'"
              (click)="confirm()">
              {{ currentDialog.confirmText || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 450px;
      width: 100%;
      overflow: hidden;
    }

    .dialog-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .dialog-header.dialog-warning {
      background: #fef3c7;
      border-bottom-color: #fde68a;
    }

    .dialog-header.dialog-danger {
      background: #fee2e2;
      border-bottom-color: #fecaca;
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    .dialog-body {
      padding: 24px;
    }

    .dialog-body p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #4b5563;
    }

    .dialog-actions {
      padding: 16px 24px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      outline: none;
    }

    .btn-cancel {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-cancel:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .btn-confirm {
      background: #3b82f6;
      color: white;
    }

    .btn-confirm:hover {
      background: #2563eb;
    }

    .btn-warning {
      background: #f59e0b;
    }

    .btn-warning:hover {
      background: #d97706;
    }

    .btn-danger {
      background: #ef4444;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    @media (max-width: 640px) {
      .dialog-container {
        max-width: 100%;
      }

      .dialog-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
      }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ transform: 'scale(0.9)', opacity: 0 }))
      ])
    ])
  ]
})
export class ConfirmDialogComponent implements OnInit {
  currentDialog: ConfirmDialog | null = null;

  constructor(private confirmService: ConfirmService) {}

  ngOnInit(): void {
    this.confirmService.dialogs$.subscribe(dialog => {
      this.currentDialog = dialog;
    });
  }

  confirm(): void {
    if (this.currentDialog) {
      this.confirmService.respond(this.currentDialog.id, true);
      this.currentDialog = null;
    }
  }

  cancel(): void {
    if (this.currentDialog) {
      this.confirmService.respond(this.currentDialog.id, false);
      this.currentDialog = null;
    }
  }
}
