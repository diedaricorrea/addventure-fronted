import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GruposResponse, GruposFiltros, GrupoDetalleResponse } from '../models/grupos.model';

@Injectable({
  providedIn: 'root'
})
export class GruposService {

  private apiUrl = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) { }

  buscarGrupos(filtros: GruposFiltros): Observable<GruposResponse> {
    let params = new HttpParams();

    if (filtros.destinoPrincipal) {
      params = params.set('destinoPrincipal', filtros.destinoPrincipal);
    }
    if (filtros.fechaInicio) {
      params = params.set('fechaInicio', filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      params = params.set('fechaFin', filtros.fechaFin);
    }
    if (filtros.sort) {
      params = params.set('sort', filtros.sort);
    }
    if (filtros.page !== undefined) {
      params = params.set('page', filtros.page.toString());
    }
    if (filtros.size) {
      params = params.set('size', filtros.size.toString());
    }

    return this.http.get<GruposResponse>(this.apiUrl, { params });
  }

  obtenerDetalleGrupo(id: number): Observable<GrupoDetalleResponse> {
    return this.http.get<GrupoDetalleResponse>(`${this.apiUrl}/${id}`);
  }

  obtenerPermisosUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/permisos`);
  }

  unirseGrupo(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/unirse`, {});
  }

  abandonarGrupo(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/abandonar`, {});
  }

  cerrarGrupo(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cerrar`, {});
  }

  eliminarGrupo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
