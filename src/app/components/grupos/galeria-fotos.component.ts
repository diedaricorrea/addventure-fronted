import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Imagen {
  idMensaje: number;
  archivoUrl: string;
  archivoNombre: string;
  fechaEnvio: string;
  remitente: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    fotoPerfil?: string;
  };
}

@Component({
  selector: 'app-galeria-fotos',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './galeria-fotos.component.html',
  styleUrls: ['./galeria-fotos.component.css']
})
export class GaleriaFotosComponent implements OnInit {
  idGrupo!: number;
  grupo: any = null;
  fotos: Imagen[] = [];
  loading = true;
  imagenAmpliada: Imagen | null = null;

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
      this.cargarGaleria();
    }
  }

  cargarGaleria(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/galeria/grupo/${this.idGrupo}`)
      .subscribe({
        next: (response) => {
          this.grupo = response.grupo;
          this.fotos = response.imagenesCompartidas;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar galería:', error);
          this.toastService.error(error.error?.error || 'Error al cargar la galería');
          this.router.navigate(['/grupos', this.idGrupo]);
        }
      });
  }

  ampliarImagen(imagen: Imagen): void {
    this.imagenAmpliada = imagen;
  }

  cerrarModal(): void {
    this.imagenAmpliada = null;
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

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
