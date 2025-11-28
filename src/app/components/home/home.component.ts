import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeService } from '../../services/home.service';
import { AuthService } from '../../services/auth.service';
import { HomeData } from '../../models/home-data.model';
import { GrupoViaje } from '../../models/grupos.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true, // Componente standalone (sin módulo)
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  // Aquí se almacenarán los datos que vienen del backend
  homeData: HomeData | null = null;

  // Estados para mostrar carga y errores en la interfaz
  loading = true;
  error: string | null = null;

  // Para escuchar cambios en la autenticación
  private authSubscription?: Subscription;

  // Grupos destacados desde el backend
  gruposDestacados: GrupoViaje[] = [];

  // Variables del carrusel
  currentSlide = 0;
  slidesPerView = 4;
  private carouselInterval: any;

  constructor(
    private homeService: HomeService, // Servicio que llama al backend
    private authService: AuthService  // Servicio para detectar autenticación
  ) { }

  ngOnInit(): void {
    // Cargar datos del home al entrar
    this.loadHomeData();
    this.loadGruposDestacados();

    // Nos suscribimos a cambios del usuario autenticado
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      // Si cambia el estado de autenticación, recargo datos
      this.loadHomeData();
    });

    // Inicializa funciones visuales después de cargarse la vista
    setTimeout(() => {
      this.initCarousel();
      this.initFadeAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    // Evitar fugas de memoria: cerrar suscripciones
    this.authSubscription?.unsubscribe();

    // Detener intervalo del carrusel
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  // Método que llama al servicio y obtiene los datos del backend
  loadHomeData(): void {
    this.homeService.getHomeData().subscribe({
      next: (data) => {
        this.homeData = data; // Guardamos los datos recibidos
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del home:', err);
        this.error = 'Error al cargar los datos. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  // Cargar grupos destacados desde el backend
  loadGruposDestacados(): void {
    this.homeService.getGruposDestacados().subscribe({
      next: (grupos) => {
        this.gruposDestacados = grupos;
      },
      error: (err) => {
        console.error('Error al cargar grupos destacados:', err);
      }
    });
  }

  // Configuración del carrusel: cambia automáticamente cada 5s
  initCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  // Añade animaciones de fade al hacer scroll
  initFadeAnimations(): void {
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeInObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-delay') || '0';
            setTimeout(() => {
              entry.target.classList.add('active');
            }, parseInt(delay));
          }
        });
      },
      { threshold: 0.1 }
    );

    fadeElements.forEach((element) => {
      fadeInObserver.observe(element);
    });
  }

  // Número total de slides calculado según items y vista
  get totalSlides(): number {
    return Math.ceil(this.gruposDestacados.length / this.slidesPerView);
  }

  // Obtener URL de imagen
  getImageUrl(imagen: string | null | undefined): string {
    if (!imagen) return `${environment.baseUrl}/images/default-trip.jpg`;
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) return imagen;
    return `${environment.baseUrl}${imagen}`;
  }

  // Formatear fecha
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  // Determinar color del tag según tipo
  getTagColor(tag: string): string {
    const tagColors: { [key: string]: string } = {
      'AVENTURA': 'bg-success text-white',
      'CULTURAL': 'bg-warning text-dark',
      'PLAYA': 'bg-info text-white',
      'NATURALEZA': 'bg-success text-white',
      'MONTAÑA': 'bg-secondary text-white',
      'TURISMO': 'bg-primary text-white',
      'GASTRONÓMICO': 'bg-danger text-white',
      'URBANO': 'bg-dark text-white'
    };
    return tagColors[tag] || 'bg-primary text-white';
  }

  // Navegar al slide anterior
  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
  }

  // Navegar al siguiente slide
  nextSlide(): void {
    this.currentSlide = this.currentSlide === this.totalSlides - 1 ? 0 : this.currentSlide + 1;
  }

  // Ir directamente a un slide
  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  // Mover el carrusel con transformaciones de CSS
  getCarouselTransform(): string {
    const slideWidth = 100 / this.slidesPerView;
    return `translateX(-${this.currentSlide * slideWidth * this.slidesPerView}%)`;
  }
}
