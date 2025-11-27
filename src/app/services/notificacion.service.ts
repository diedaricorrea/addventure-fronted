import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notificacion {
  idNotificacion: number;
  tipo: string;
  contenido: string;
  leido: boolean;
  fecha: string;
  fechaLectura?: string;
  grupo?: {
    idGrupo: number;
    nombreViaje: string;
  };
  solicitante?: {
    idUsuario: number;
    nombreCompleto: string;
    fotoPerfil: string | null;
  };
}

export interface NotificacionesResponse {
  notificaciones: Notificacion[];
  total: number;
  noLeidas: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  obtenerNotificaciones(): Observable<NotificacionesResponse> {
    return this.http.get<NotificacionesResponse>(this.apiUrl);
  }

  obtenerNoLeidas(): Observable<NotificacionesResponse> {
    return this.http.get<NotificacionesResponse>(`${this.apiUrl}/no-leidas`);
  }

  contarNoLeidas(): Observable<{ contador: number }> {
    return this.http.get<{ contador: number }>(`${this.apiUrl}/contador`);
  }

  marcarComoLeida(idNotificacion: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idNotificacion}/leer`, {});
  }

  marcarTodasComoLeidas(): Observable<any> {
    return this.http.put(`${this.apiUrl}/leer-todas`, {});
  }

  eliminarNotificacion(idNotificacion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idNotificacion}`);
  }

  eliminarTodas(): Observable<any> {
    return this.http.delete(this.apiUrl);
  }
}
