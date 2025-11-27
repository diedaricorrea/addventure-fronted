import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { NotificacionService, Notificacion } from '../../services/notificacion.service';
import { SolicitudService } from '../../services/solicitud.service';
import { WebSocketService } from '../../services/websocket.service';
import { HomeService } from '../../services/home.service';
import { HomeData } from '../../models/home-data.model';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  homeData: HomeData | null = null;
  notificaciones: Notificacion[] = [];
  loading = true;
  error: string | null = null;
  mostrarSoloNoLeidas = false;
  private homeDataSubscription?: Subscription;

  constructor(
    private notificacionService: NotificacionService,
    private solicitudService: SolicitudService,
    private wsService: WebSocketService,
    private homeService: HomeService,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
    this.cargarNotificaciones();
    this.connectWebSocket();
  }

  loadHomeData(): void {
    this.homeDataSubscription = this.homeService.homeData$.subscribe({
      next: (data) => {
        this.homeData = data;
        // Conectar WebSocket cuando tengamos el idUsuario
        if (data && data.idUsuario) {
          this.connectWebSocket();
        }
      }
    });
  }

  connectWebSocket(): void {
    if (!this.homeData?.idUsuario) {
      console.warn('No se puede conectar WebSocket: falta idUsuario');
      return;
    }

    // Conectar al WebSocket de notificaciones
    this.wsService.connectNotifications(this.homeData.idUsuario);

    // Suscribirse al observable de notificaciones
    this.wsService.subscribeToNotifications().subscribe({
      next: (notificacion: any) => {
        console.log('Nueva notificación recibida:', notificacion);

        // Agregar al principio de la lista
        this.notificaciones.unshift(notificacion);

        // Incrementar contador de no leídas
        if (this.homeData) {
          this.homeData.notificacionesNoLeidas++;
        }

        // Mostrar toast
        this.toastService.info('Nueva notificación recibida');
      },
      error: (error) => {
        console.error('Error en WebSocket de notificaciones:', error);
      }
    });
  }

  cargarNotificaciones(): void {
    this.loading = true;
    this.error = null;

    const observable = this.mostrarSoloNoLeidas
      ? this.notificacionService.obtenerNoLeidas()
      : this.notificacionService.obtenerNotificaciones();

    observable.subscribe({
      next: (response) => {
        this.notificaciones = response.notificaciones;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
        this.error = 'Error al cargar las notificaciones';
        this.loading = false;
      }
    });
  }

  toggleFiltro(): void {
    this.mostrarSoloNoLeidas = !this.mostrarSoloNoLeidas;
    this.cargarNotificaciones();
  }

  marcarComoLeida(notificacion: Notificacion): void {
    if (notificacion.leido) return;

    this.notificacionService.marcarComoLeida(notificacion.idNotificacion).subscribe({
      next: () => {
        notificacion.leido = true;
        notificacion.fechaLectura = new Date().toISOString();

        // Actualizar contador en homeData
        if (this.homeData) {
          this.homeData.notificacionesNoLeidas = Math.max(0, this.homeData.notificacionesNoLeidas - 1);
        }
      },
      error: (err) => {
        console.error('Error al marcar como leída:', err);
      }
    });
  }

  marcarTodasComoLeidas(): void {
    this.notificacionService.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.notificaciones.forEach(n => {
          n.leido = true;
          n.fechaLectura = new Date().toISOString();
        });

        if (this.homeData) {
          this.homeData.notificacionesNoLeidas = 0;
        }

        this.showSuccessMessage('Todas las notificaciones marcadas como leídas');
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage('Error al marcar notificaciones');
      }
    });
  }

  eliminarNotificacion(notificacion: Notificacion): void {
    this.confirmService.confirm(
      'Esta notificación se eliminará permanentemente.',
      'Eliminar notificación',
      'Eliminar',
      'Cancelar',
      'danger'
    ).subscribe(confirmed => {
      if (!confirmed) return;

      this.notificacionService.eliminarNotificacion(notificacion.idNotificacion).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter(n => n.idNotificacion !== notificacion.idNotificacion);

        if (!notificacion.leido && this.homeData) {
          this.homeData.notificacionesNoLeidas = Math.max(0, this.homeData.notificacionesNoLeidas - 1);
        }
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.showErrorMessage('Error al eliminar notificación');
      }
    });
    });
  }

  eliminarTodas(): void {
    this.confirmService.confirm(
      'Todas las notificaciones se eliminarán permanentemente. Esta acción no se puede deshacer.',
      'Eliminar todas las notificaciones',
      'Eliminar todas',
      'Cancelar',
      'danger'
    ).subscribe(confirmed => {
      if (!confirmed) return;

      this.notificacionService.eliminarTodas().subscribe({
      next: () => {
        this.notificaciones = [];
        if (this.homeData) {
          this.homeData.notificacionesNoLeidas = 0;
        }
        this.showSuccessMessage('Todas las notificaciones eliminadas');
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage('Error al eliminar notificaciones');
      }
    });
    });
  }

  navegarAGrupo(notificacion: Notificacion): void {
    // Marcar como leída si no lo está
    this.marcarComoLeida(notificacion);

    // Navegar al grupo si existe
    if (notificacion.grupo?.idGrupo) {
      this.router.navigate(['/grupos', notificacion.grupo.idGrupo]);
    }
  }

  verSolicitudes(notificacion: Notificacion): void {
    this.marcarComoLeida(notificacion);

    if (notificacion.grupo?.idGrupo) {
      this.router.navigate(['/grupos', notificacion.grupo.idGrupo, 'solicitudes']);
    }
  }

  getIconoNotificacion(tipo: string): string {
    switch (tipo) {
      case 'SOLICITUD_UNION':
        return 'bi-person-plus-fill';
      case 'SOLICITUD_ACEPTADA':
        return 'bi-check-circle-fill';
      case 'SOLICITUD_RECHAZADA':
        return 'bi-x-circle-fill';
      default:
        return 'bi-bell-fill';
    }
  }

  getColorNotificacion(tipo: string): string {
    switch (tipo) {
      case 'SOLICITUD_UNION':
        return 'text-primary';
      case 'SOLICITUD_ACEPTADA':
        return 'text-success';
      case 'SOLICITUD_RECHAZADA':
        return 'text-warning';
      default:
        return 'text-secondary';
    }
  }

  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  private showSuccessMessage(message: string): void {
    this.toastService.success(message);
  }

  private showErrorMessage(message: string): void {
    this.toastService.error(message);
  }

  ngOnDestroy(): void {
    if (this.homeDataSubscription) {
      this.homeDataSubscription.unsubscribe();
    }
  }
}
