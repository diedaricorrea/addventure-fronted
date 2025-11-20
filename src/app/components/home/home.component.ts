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
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  homeData: HomeData | null = null;
  loading = true;
  error: string | null = null;
  private authSubscription?: Subscription;

  // Destinations data
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

  currentSlide = 0;
  slidesPerView = 4;
  private carouselInterval: any;

  constructor(
    private homeService: HomeService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadHomeData();

    // Suscribirse a cambios de autenticación
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      // Recargar datos cuando cambia el estado de autenticación
      this.loadHomeData();
    });

    // Inicializar carrusel después de que la vista se cargue
    setTimeout(() => {
      this.initCarousel();
      this.initFadeAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  loadHomeData(): void {
    this.homeService.getHomeData().subscribe({
      next: (data) => {
        this.homeData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del home:', err);
        this.error = 'Error al cargar los datos. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  initCarousel(): void {
    // Auto slide every 5 seconds
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

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

  get totalSlides(): number {
    return Math.ceil(this.destinations.length / this.slidesPerView);
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
  }

  nextSlide(): void {
    this.currentSlide = this.currentSlide === this.totalSlides - 1 ? 0 : this.currentSlide + 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  getCarouselTransform(): string {
    const slideWidth = 100 / this.slidesPerView;
    return `translateX(-${this.currentSlide * slideWidth * this.slidesPerView}%)`;
  }
}
