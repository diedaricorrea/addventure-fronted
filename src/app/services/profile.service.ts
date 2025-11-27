import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PerfilResponse } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/perfil`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener perfil del usuario autenticado
   */
  getPerfilPropio(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(this.apiUrl);
  }

  /**
   * Obtener perfil de otro usuario por ID
   */
  getPerfilUsuario(id: number): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar perfil del usuario autenticado
   */
  actualizarPerfil(data: any): Observable<PerfilResponse> {
    return this.http.put<PerfilResponse>(this.apiUrl, data);
  }

  /**
   * Subir imagen de perfil
   */
  subirImagenPerfil(imagen: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    return this.http.post(`${this.apiUrl}/imagen-perfil`, formData);
  }

  /**
   * Subir imagen de portada
   */
  subirImagenPortada(imagen: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    return this.http.post(`${this.apiUrl}/imagen-portada`, formData);
  }
}
