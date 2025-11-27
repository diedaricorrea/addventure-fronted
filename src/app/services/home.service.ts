import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HomeData } from '../models/home-data.model';
import { environment } from '../../environments/environment';

@Injectable({ // Puedo usarlo en cualquier parte de la aplicacion
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = `${environment.apiUrl}/home`;

  // Inyectamos HttpClient para poder hacer peticiones HTTP.
  constructor(private http: HttpClient) { }

   // Método que llama al backend y devuelve un Observable tipado como HomeData.
  // Observable<HomeData> significa que cuando la respuesta llegue,
  // será un objeto que cumple la estructura de la interface HomeData.
  getHomeData(): Observable<HomeData> {
    return this.http.get<HomeData>(this.apiUrl, { withCredentials: true });
  }
}
