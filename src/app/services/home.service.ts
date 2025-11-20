import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HomeData } from '../models/home-data.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = `${environment.apiUrl}/home`;

  constructor(private http: HttpClient) { }

  getHomeData(): Observable<HomeData> {
    return this.http.get<HomeData>(this.apiUrl, { withCredentials: true });
  }
}
