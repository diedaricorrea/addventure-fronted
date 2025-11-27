import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SolicitudService, SolicitudInfo } from '../../services/solicitud.service';
import { HomeService } from '../../services/home.service';
import { HomeData } from '../../models/home-data.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-solicitudes-grupo',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './solicitudes-grupo.component.html',
  styleUrls: ['./solicitudes-grupo.component.css']
})
export class SolicitudesGrupoComponent implements OnInit {
  homeData: HomeData | null = null;
  solicitudes: SolicitudInfo[] = [];
  idGrupo: number = 0;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: SolicitudService,
    private homeService: HomeService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idGrupo = +id;
      this.cargarSolicitudes();
    }
  }

  loadHomeData(): void {
    this.homeService.homeData$.subscribe({
      next: (data) => {
        this.homeData = data;
      }
    });
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.error = null;

    this.solicitudService.obtenerSolicitudesPendientes(this.idGrupo).subscribe({
      next: (response) => {
        this.solicitudes = response.solicitudes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
        this.error = err.error?.error || 'Error al cargar las solicitudes';
        this.loading = false;
      }
    });
  }

  aceptarSolicitud(solicitud: SolicitudInfo): void {
    this.confirmService.confirm(
      `${solicitud.nombreCompleto} será añadido al grupo de viaje.`,
      'Aceptar solicitud',
      'Aceptar',
      'Cancelar',
      'info'
    ).subscribe(confirmed => {
      if (!confirmed) return;

      this.solicitudService.aceptarSolicitud(this.idGrupo, solicitud.idUsuario).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage('Solicitud aceptada exitosamente');
          // Remover de la lista
          this.solicitudes = this.solicitudes.filter(s => s.idUsuario !== solicitud.idUsuario);
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage(err.error?.error || 'Error al aceptar solicitud');
      }
    });
    });
  }

  rechazarSolicitud(solicitud: SolicitudInfo): void {
    this.confirmService.confirm(
      `${solicitud.nombreCompleto} no podrá unirse al grupo. Podrá intentarlo nuevamente (${3 - solicitud.intentos} intentos restantes).`,
      'Rechazar solicitud',
      'Rechazar',
      'Cancelar',
      'warning'
    ).subscribe(confirmed => {
      if (!confirmed) return;

      this.solicitudService.rechazarSolicitud(this.idGrupo, solicitud.idUsuario).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage('Solicitud rechazada');
          // Remover de la lista
          this.solicitudes = this.solicitudes.filter(s => s.idUsuario !== solicitud.idUsuario);
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage(err.error?.error || 'Error al rechazar solicitud');
      }
    });
    });
  }

  verPerfil(idUsuario: number): void {
    this.router.navigate(['/perfil', idUsuario]);
  }

  getFotoPerfilUrl(fotoPerfil: string | null): string {
    return fotoPerfil
      ? `${environment.baseUrl}/uploads/${fotoPerfil}`
      : `${environment.baseUrl}/images/default-avatar.jpg`;
  }

  formatFecha(fechaString: string): string {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  private showSuccessMessage(message: string): void {
    this.toastService.success(message);
  }

  private showErrorMessage(message: string): void {
    this.toastService.error(message);
  }
}
