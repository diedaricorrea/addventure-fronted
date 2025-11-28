import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Testimonio, CrearTestimonioRequest } from '../models/testimonio.model';

@Injectable({
  providedIn: 'root'
})
export class TestimonioService {
  private apiUrl = `${environment.apiUrl}/testimonios`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo testimonio
   */
  crearTestimonio(request: CrearTestimonioRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request, { withCredentials: true });
  }

  /**
   * Obtener testimonios destacados para el index
   */
  getTestimoniosDestacados(limit: number = 6): Observable<Testimonio[]> {
    return this.http.get<Testimonio[]>(`${this.apiUrl}/destacados?limit=${limit}`);
  }

  /**
   * Obtener todos los testimonios aprobados
   */
  getTestimoniosAprobados(limit: number = 20): Observable<Testimonio[]> {
    return this.http.get<Testimonio[]>(`${this.apiUrl}/aprobados?limit=${limit}`);
  }

  /**
   * Obtener testimonios pendientes (solo admin)
   */
  getTestimoniosPendientes(): Observable<Testimonio[]> {
    return this.http.get<Testimonio[]>(`${this.apiUrl}/pendientes`, { withCredentials: true });
  }

  /**
   * Aprobar testimonio (solo admin)
   */
  aprobarTestimonio(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/aprobar`, {}, { withCredentials: true });
  }

  /**
   * Marcar/desmarcar como destacado (solo admin)
   */
  marcarDestacado(id: number, destacado: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/destacar?destacado=${destacado}`, {}, { withCredentials: true });
  }

  /**
   * Eliminar testimonio
   */
  eliminarTestimonio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
