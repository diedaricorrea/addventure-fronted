import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HomeService } from '../../services/home.service';
import { HomeData } from '../../models/home-data.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  homeData: HomeData | null = null;
  contactForm!: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  successMessage: string | null = null;
  showForm = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private homeService: HomeService
  ) {
    this.createForm();
    this.loadHomeData();
  }

  loadHomeData(): void {
    this.homeService.getHomeData().subscribe({
      next: (data) => {
        this.homeData = data;
      },
      error: (err) => {
        console.error('Error al cargar datos de navbar:', err);
      }
    });
  }

  createForm(): void {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      asunto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      categoria: ['', [Validators.required]],
      mensaje: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.http.post(`${environment.apiUrl}/support/contacto`, this.contactForm.value).subscribe({
      next: (response: any) => {
        this.successMessage = response.mensaje || '¡Mensaje enviado correctamente!';
        this.submitted = true;
        this.showForm = false;
        this.contactForm.reset();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.error = err.error?.error || 'Error al enviar el mensaje. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  sendAnotherMessage(): void {
    this.showForm = true;
    this.submitted = false;
    this.successMessage = null;
    this.error = null;
  }

  scrollToContact(): void {
    document.getElementById('contactForm')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToFAQ(): void {
    document.getElementById('faqSection')?.scrollIntoView({ behavior: 'smooth' });
  }
}
