import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { HomeService } from '../../services/home.service';
import { GruposService } from '../../services/grupos.service';
import { ChatService } from '../../services/chat.service';
import { WebSocketService } from '../../services/websocket.service';
import { HomeData } from '../../models/home-data.model';
import { GrupoViaje, Itinerario } from '../../models/grupos.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-grupo-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './grupo-detalle.component.html',
  styleUrls: ['./grupo-detalle.component.css']
})
export class GrupoDetalleComponent implements OnInit, OnDestroy {
  homeData: HomeData | null = null;
  grupo: GrupoViaje | null = null;
  itinerarios: Itinerario[] = [];
  participantesAceptados = 0;
  totalMiembros = 0;
  loading = true;
  error: string | null = null;
  deleteConfirmText = '';
  mensajes: any[] = [];
  private wsSubscription?: Subscription;

  // Permisos del usuario
  permisos: any = {
    isAuthenticated: false,
    isCreador: false,
    isMiembro: false,
    estadoSolicitud: 'NINGUNA',
    puedeUnirse: false,
    puedeAbandonar: false,
    puedeEditar: false,
    puedeEliminar: false,
    puedeCerrar: false,
    puedeCalificar: false,
    puedeVerGaleria: false,
    puedeAccederChat: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public homeService: HomeService,
    private gruposService: GruposService,
    private chatService: ChatService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGrupoDetalle(+id);
    }
  }

  loadHomeData(): void {
    this.homeService.homeData$.subscribe({
      next: (data) => {
        this.homeData = data;
      }
    });
  }

  loadGrupoDetalle(id: number): void {
    this.loading = true;
    this.error = null;

    this.gruposService.obtenerDetalleGrupo(id).subscribe({
      next: (response) => {
        this.grupo = response.grupo;
        this.itinerarios = response.itinerarios;
        this.participantesAceptados = response.participantesAceptados;
        this.totalMiembros = response.totalMiembros;
        this.loading = false;

        // Cargar permisos del usuario
        this.loadPermisos(id);
      },
      error: (err) => {
        console.error('Error al cargar detalle del grupo:', err);
        this.error = 'Error al cargar los detalles del grupo. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  loadPermisos(id: number): void {
    this.gruposService.obtenerPermisosUsuario(id).subscribe({
      next: (response) => {
        this.permisos = response;

        // Si puede acceder al chat, cargar mensajes y conectar WebSocket
        if (this.permisos.puedeAccederChat) {
          this.loadMensajes(id);
          this.connectWebSocket(id);
        }
      },
      error: (err) => {
        console.error('Error al cargar permisos:', err);
        // Si falla, usar permisos por defecto (sin permisos)
      }
    });
  }

  loadMensajes(grupoId: number): void {
    this.chatService.obtenerMensajes(grupoId).subscribe({
      next: (mensajes) => {
        this.mensajes = mensajes;
        // Scroll al final del chat
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Error al cargar mensajes:', err);
      }
    });
  }

  connectWebSocket(grupoId: number): void {
    this.wsSubscription = this.wsService.connect(grupoId).subscribe({
      next: (mensaje) => {
        console.log('Nuevo mensaje recibido:', mensaje);
        this.mensajes.push(mensaje);
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Error en WebSocket:', err);
      }
    });
  }

  scrollToBottom(): void {
    const chatContainer = document.getElementById('chatMessages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    // Limpiar la suscripción de WebSocket
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  unirseGrupo(): void {
    if (!this.grupo) return;

    this.gruposService.unirseGrupo(this.grupo.idGrupo).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage(response.message || 'Solicitud enviada exitosamente');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          this.showErrorMessage(response.error || 'Error al enviar solicitud');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage('Error al unirse al grupo. Inténtalo de nuevo.');
      }
    });
  }

  abandonarGrupo(): void {
    if (!this.grupo) return;

    this.gruposService.abandonarGrupo(this.grupo.idGrupo).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage(response.message || 'Has abandonado el grupo exitosamente');
          setTimeout(() => this.router.navigate(['/grupos']), 1500);
        } else {
          this.showErrorMessage(response.error || 'Error al abandonar el grupo');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage('Error al abandonar el grupo');
      }
    });
  }

  cerrarViaje(): void {
    if (!this.grupo) return;

    if (!confirm('¿Estás seguro de que quieres cerrar este viaje? Esta acción no se puede deshacer y habilitará las calificaciones.')) {
      return;
    }

    this.gruposService.cerrarGrupo(this.grupo.idGrupo).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage('Viaje cerrado exitosamente');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          this.showErrorMessage(response.error || 'Error al cerrar el viaje');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage('Error al cerrar el viaje');
      }
    });
  }

  eliminarGrupo(): void {
    if (!this.grupo) return;

    this.gruposService.eliminarGrupo(this.grupo.idGrupo).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage('Grupo eliminado exitosamente');
          setTimeout(() => this.router.navigate(['/grupos']), 1500);
        } else {
          this.showErrorMessage(response.error || 'Error al eliminar el grupo');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage('Error al eliminar el grupo');
      }
    });
  }

  enviarMensaje(mensaje: string): void {
    if (!this.grupo || !mensaje.trim()) return;

    this.chatService.enviarMensaje(this.grupo.idGrupo, mensaje).subscribe({
      next: (response) => {
        console.log('Mensaje enviado:', response);
        // El mensaje llegará por WebSocket, no lo agregamos aquí
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage('Error al enviar mensaje');
      }
    });
  }

  enviarImagen(event: Event): void {
    if (!this.grupo) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.showErrorMessage('Solo se permiten archivos de imagen');
      input.value = '';
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showErrorMessage('La imagen es demasiado grande. Máximo 5MB');
      input.value = '';
      return;
    }

    this.chatService.enviarImagen(this.grupo.idGrupo, file).subscribe({
      next: (response) => {
        if (response.success || response.idMensaje) {
          input.value = '';
        } else {
          this.showErrorMessage('No se pudo enviar la imagen');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showErrorMessage('Error al enviar imagen');
      }
    });
  }

  onChatKeypress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const input = event.target as HTMLInputElement;
      this.enviarMensaje(input.value);
      input.value = '';
    }
  }

  getImagenDestacadaUrl(imagenDestacada: string | null | undefined): string {
    return imagenDestacada || 'http://localhost:8080/images/default-trip.jpg';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private showSuccessMessage(message: string): void {
    alert(`✅ AddVenture: ${message}`);
  }

  private showErrorMessage(message: string): void {
    alert(`❌ AddVenture: ${message}`);
  }
}
