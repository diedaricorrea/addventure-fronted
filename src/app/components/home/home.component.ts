import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeService } from '../../services/home.service';
import { AuthService } from '../../services/auth.service';
import { HomeData } from '../../models/home-data.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
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

  // Datos de destinos (esto es estático para mostrar en la UI)
  destinations = [
    {
      id: 1,
      name: "Cusco",
      country: "Perú",
      image: "images/machu-picchu.jpg",
      dates: "Julio - Agosto",
      tag: "AVENTURA",
      tagColor: "bg-success text-white",
    },
    {
      id: 2,
      name: "Buenos Aires",
      country: "Argentina",
      image: "images/buenos-aires.jpg",
      dates: "Septiembre - Octubre",
      tag: "CULTURAL",
      tagColor: "bg-warning text-dark",
    },
    {
      id: 3,
      name: "Cancún",
      country: "México",
      image: "images/Cancun.webp",
      dates: "Febrero - Abril",
      tag: "PLAYA",
      tagColor: "bg-info text-white",
    },
    {
      id: 4,
      name: "Cartagena",
      country: "Colombia",
      image: "images/cartagena.jpeg",
      dates: "Noviembre - Diciembre",
      tag: "GASTRONÓMICO",
      tagColor: "bg-danger text-white",
    },
    {
      id: 5,
      name: "Santiago",
      country: "Chile",
      image: "images/santiago.jpg",
      dates: "Octubre - Noviembre",
      tag: "URBANO",
      tagColor: "bg-primary text-white",
    },
    {
      id: 6,
      name: "Galápagos",
      country: "Ecuador",
      image: "images/galapagos.jpeg",
      dates: "Mayo - Junio",
      tag: "NATURALEZA",
      tagColor: "bg-success text-white",
    },
  ];

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
    return Math.ceil(this.destinations.length / this.slidesPerView);
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
