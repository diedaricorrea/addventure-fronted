import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toasts$ = this.toastSubject.asObservable();
  private toastCounter = 0;

  success(message: string, duration: number = 3000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration: number = 4000): void {
    this.show('error', message, duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show('info', message, duration);
  }

  warning(message: string, duration: number = 3500): void {
    this.show('warning', message, duration);
  }

  private show(type: Toast['type'], message: string, duration: number): void {
    const toast: Toast = {
      id: ++this.toastCounter,
      type,
      message,
      duration
    };
    this.toastSubject.next(toast);
  }
}
