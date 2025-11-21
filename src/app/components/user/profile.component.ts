import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { PerfilResponse } from '../../models/perfil.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  perfil: PerfilResponse | null = null;
  loading = true;
  error: string | null = null;
  activeTab: 'perfil' | 'viajes' = 'perfil';

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.cargarPerfilDeOtroUsuario(+userId);
      } else {
        this.cargarPerfilPropio();
      }
    });
  }

  cargarPerfilPropio(): void {
    this.loading = true;
    this.profileService.getPerfilPropio().subscribe({
      next: (data) => {
        this.perfil = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.error = 'No se pudo cargar el perfil';
        this.loading = false;
      }
    });
  }

  cargarPerfilDeOtroUsuario(id: number): void {
    this.loading = true;
    this.profileService.getPerfilUsuario(id).subscribe({
      next: (data) => {
        this.perfil = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.error = 'No se pudo cargar el perfil del usuario';
        this.loading = false;
      }
    });
  }

  switchTab(tab: 'perfil' | 'viajes'): void {
    this.activeTab = tab;
  }

  goBack(): void {
    window.history.back();
  }

  getImageUrl(imagen: string | undefined): string {
    if (!imagen) return 'images/default-cover.jpg';
    return `http://localhost:8080/uploads/${imagen}`;
  }

  getStars(calificacion: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < calificacion);
  }

  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[date.getMonth()]} ${date.getFullYear()}`;
  }

  getLogroBadgeClass(nombreLogro: string): string {
    switch(nombreLogro) {
      case 'Pioneer': return 'bg-warning';
      case 'Pathfinder': return 'bg-primary';
      case 'Verificado': return 'bg-success';
      default: return 'bg-secondary';
    }
  }
}
