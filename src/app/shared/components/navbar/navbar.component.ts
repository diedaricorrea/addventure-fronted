import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HomeData } from '../../../models/home-data.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() homeData: HomeData | null = null;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  get isAuthenticated(): boolean {
    return this.homeData?.authenticated || false;
  }
  
  logout(): void {
    this.authService.logout();
    // Forzar recarga de la página para limpiar estado
    window.location.href = '/';
  }
}
