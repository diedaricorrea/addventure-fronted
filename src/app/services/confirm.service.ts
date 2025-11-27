import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmDialog {
  id: number;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
}

export interface ConfirmResult {
  id: number;
  confirmed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private dialogSubject = new Subject<ConfirmDialog>();
  private resultSubject = new Subject<ConfirmResult>();

  public dialogs$ = this.dialogSubject.asObservable();
  public results$ = this.resultSubject.asObservable();

  private dialogCounter = 0;

  confirm(
    message: string,
    title: string = '¿Estás seguro?',
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar',
    type: 'info' | 'warning' | 'danger' = 'info'
  ): Observable<boolean> {
    const dialogId = ++this.dialogCounter;

    const dialog: ConfirmDialog = {
      id: dialogId,
      title,
      message,
      confirmText,
      cancelText,
      type
    };

    this.dialogSubject.next(dialog);

    return new Observable(observer => {
      const subscription = this.results$.subscribe(result => {
        if (result.id === dialogId) {
          observer.next(result.confirmed);
          observer.complete();
          subscription.unsubscribe();
        }
      });
    });
  }

  respond(id: number, confirmed: boolean): void {
    this.resultSubject.next({ id, confirmed });
  }
}
