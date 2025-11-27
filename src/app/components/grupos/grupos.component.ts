import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HomeService } from '../../services/home.service';
import { GruposService } from '../../services/grupos.service';
import { HomeData } from '../../models/home-data.model';
import { GrupoViaje, GruposFiltros } from '../../models/grupos.model';

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.css']
})
export class GruposComponent implements OnInit {
  homeData: HomeData | null = null;
  grupos: GrupoViaje[] = [];
  searchForm!: FormGroup;
  loading = false;
  error: string | null = null;

  // Paginación
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  size = 6;

  // Fecha mínima para los inputs de fecha (hoy)
  minDate: string;

  constructor(
    private fb: FormBuilder,
    private homeService: HomeService,
    private gruposService: GruposService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadHomeData();
    this.createForm();
    this.buscarGrupos();
  }

  loadHomeData(): void {
    this.homeService.homeData$.subscribe({
      next: (data) => {
        this.homeData = data;
      }
    });
  }

  createForm(): void {
    this.searchForm = this.fb.group({
      destinoPrincipal: [''],
      fechaInicio: [''],
      fechaFin: [''],
      sort: ['']
    });
  }

  onSubmit(): void {
    this.currentPage = 0; // Reiniciar a la primera página al buscar
    this.buscarGrupos();
  }

  buscarGrupos(): void {
    this.loading = true;
    this.error = null;

    const filtros: GruposFiltros = {
      ...this.searchForm.value,
      page: this.currentPage,
      size: this.size
    };

    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof GruposFiltros] === '' || filtros[key as keyof GruposFiltros] === null) {
        delete filtros[key as keyof GruposFiltros];
      }
    });

    this.gruposService.buscarGrupos(filtros).subscribe({
      next: (response) => {
        this.grupos = response.grupos;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.currentPage = response.currentPage;
        this.loading = false;

        if (response.error) {
          this.error = response.error;
        }
      },
      error: (err) => {
        console.error('Error al buscar grupos:', err);
        this.error = 'Error al cargar los grupos. Por favor, intenta de nuevo.';
        this.grupos = [];
        this.loading = false;
      }
    });
  }

  onSortChange(): void {
    this.currentPage = 0;
    this.buscarGrupos();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.buscarGrupos();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getImageUrl(fotoPerfil: string | null): string {
    return fotoPerfil ? `http://localhost:8080/uploads/${fotoPerfil}` : '';
  }

  getImagenDestacadaUrl(imagenDestacada: string | null | undefined): string {
    return imagenDestacada || 'http://localhost:8080/images/default-trip.jpg';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
