import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MisViajesResponse } from '../models/mis-viajes.model';

@Injectable({
  providedIn: 'root'
})
export class MisViajesService {
  private apiUrl = `${environment.apiUrl}/mis-viajes`;

  constructor(private http: HttpClient) {}

  getMisViajes(): Observable<MisViajesResponse> {
    return this.http.get<MisViajesResponse>(this.apiUrl);
  }

  abandonarGrupo(idGrupo: number): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/grupos/${idGrupo}/abandonar`,
      {}
    );
  }

  eliminarGrupo(idGrupo: number): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/grupos/${idGrupo}`
    );
  }
}
