import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeService } from './services/home.service';
import { AuthService } from './services/auth.service';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('addventureFronted');

  constructor(
    private homeService: HomeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Cargar datos del home al iniciar la aplicación
    if (this.authService.isAuthenticated()) {
      this.homeService.getHomeData().subscribe({
        error: (err) => {
          console.error('Error al cargar datos del home:', err);
          // Si hay error, puede ser que el token expiró
          if (err.status === 401) {
            this.authService.logout();
          }
        }
      });
    } else {
      // Cargar datos públicos del home
      this.homeService.getHomeData().subscribe({
        error: (err) => console.error('Error al cargar datos públicos:', err)
      });
    }
  }
}
