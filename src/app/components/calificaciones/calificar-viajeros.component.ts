import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { GruposService } from '../../services/grupos.service';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface UsuarioCalificar {
  idUsuario: number;
  nombreCompleto: string;
  fotoPerfil: string;
  iniciales: string;
  calificacion: number;
  comentario: string;
}

@Component({
  selector: 'app-calificar-viajeros',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterLink],
  templateUrl: './calificar-viajeros.component.html',
  styleUrls: ['./calificar-viajeros.component.css']
})
export class CalificarViajerosComponent implements OnInit {
  idGrupo!: number;
  grupo: any = null;
  participantesParaCalificar: UsuarioCalificar[] = [];
  yaCalificados = 0;
  loading = true;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('idGrupo');
    if (id) {
      this.idGrupo = +id;
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/calificaciones/grupo/${this.idGrupo}`)
      .subscribe({
        next: (response) => {
          this.grupo = response.grupo;
          this.yaCalificados = response.yaCalificados;
          this.participantesParaCalificar = response.participantesParaCalificar.map((p: any) => ({
            ...p,
            calificacion: 0,
            comentario: ''
          }));
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar participantes:', error);
          this.toastService.error(error.error?.error || 'Error al cargar participantes');
          this.router.navigate(['/grupos', this.idGrupo]);
        }
      });
  }

  setCalificacion(usuario: UsuarioCalificar, calificacion: number): void {
    usuario.calificacion = calificacion;
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    // Si la URL ya es completa (http/https), devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Si ya tiene /uploads/, agregar solo la base
    if (url.startsWith('/uploads/')) {
      return `${environment.baseUrl}${url}`;
    }
    // Si es solo el nombre del archivo, agregar /uploads/
    return `${environment.baseUrl}/uploads/${url}`;
  }

  enviarCalificaciones(): void {
    const calificacionesPendientes = this.participantesParaCalificar.filter(
      u => u.calificacion > 0
    );

    if (calificacionesPendientes.length === 0) {
      this.toastService.warning('Debes calificar al menos a un participante');
      return;
    }

    this.submitting = true;

    const payload = {
      idGrupo: this.idGrupo,
      calificaciones: calificacionesPendientes.map(p => ({
        idUsuario: p.idUsuario,
        calificacion: p.calificacion,
        comentario: p.comentario
      }))
    };

    this.http.post<any>(`${environment.apiUrl}/calificaciones/calificar`, payload)
      .subscribe({
        next: (response) => {
          this.toastService.success(response.mensaje || 'Calificaciones enviadas exitosamente');
          this.router.navigate(['/grupos', this.idGrupo]);
        },
        error: (error) => {
          console.error('Error al enviar calificaciones:', error);
          this.toastService.error(error.error?.error || 'Error al enviar calificaciones');
          this.submitting = false;
        }
      });
  }
}
