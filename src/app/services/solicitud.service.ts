import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SolicitudInfo {
  idUsuario: number;
  nombreCompleto: string;
  email: string;
  fotoPerfil: string | null;
  iniciales: string;
  fechaSolicitud: string;
  intentos: number;
}

export interface SolicitudesResponse {
  solicitudes: SolicitudInfo[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) {}

  unirseGrupo(idGrupo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idGrupo}/unirse`, {});
  }

  obtenerSolicitudesPendientes(idGrupo: number): Observable<SolicitudesResponse> {
    return this.http.get<SolicitudesResponse>(`${this.apiUrl}/${idGrupo}/solicitudes-pendientes`);
  }

  aceptarSolicitud(idGrupo: number, idUsuario: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idGrupo}/solicitudes/${idUsuario}/aceptar`, {});
  }

  rechazarSolicitud(idGrupo: number, idUsuario: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idGrupo}/solicitudes/${idUsuario}/rechazar`, {});
  }
}
