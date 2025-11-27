import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any = null;
  private messageSubject = new Subject<any>();
  private connected = false;

  constructor() {}

  connect(grupoId: number): Observable<any> {
    if (!this.connected) {
      console.log('Connecting to WebSocket...');

      // Obtener el token JWT del localStorage
      const token = localStorage.getItem('authToken');

      // Usar la URL del environment (cambia automáticamente en producción)
      const socket = new (window as any).SockJS(environment.wsUrl);
      this.stompClient = (window as any).Stomp.over(socket);

      // Desactivar logs de debug de Stomp
      this.stompClient.debug = null;

      // Headers con el token JWT
      const headers = token ? {
        'Authorization': `Bearer ${token}`
      } : {};

      this.stompClient.connect(headers, (frame: any) => {
        console.log('Connected to WebSocket:', frame);
        this.connected = true;

        // Suscribirse al canal del grupo
        this.stompClient.subscribe(`/topic/grupo/${grupoId}`, (message: any) => {
          const body = JSON.parse(message.body);
          console.log('Message received via WebSocket:', body);
          this.messageSubject.next(body);
        });
      }, (error: any) => {
        console.error('WebSocket connection error:', error);
        this.connected = false;
      });
    }

    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient !== null && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
      console.log('Disconnected from WebSocket');
    }
  }
}
