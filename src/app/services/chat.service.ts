import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = `${environment.apiUrl}/chat/grupo`;

  constructor(private http: HttpClient) { }

  obtenerMensajes(idGrupo: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idGrupo}/mensajes`);
  }

  enviarMensaje(idGrupo: number, mensaje: string): Observable<any> {
    const formData = new FormData();
    formData.append('mensaje', mensaje);
    return this.http.post(`${this.apiUrl}/${idGrupo}/enviar`, formData);
  }

  enviarImagen(idGrupo: number, imagen: File, descripcion?: string): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }
    return this.http.post(`${this.apiUrl}/${idGrupo}/enviar-imagen`, formData);
  }

  eliminarMensaje(idGrupo: number, idMensaje: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idGrupo}/mensaje/${idMensaje}`);
  }
}
