import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { HomeService } from '../../services/home.service';
import { PerfilResponse } from '../../models/perfil.model';
import { HomeData } from '../../models/home-data.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  perfil: PerfilResponse | null = null;
  homeData: HomeData | null = null;
  profileForm!: FormGroup;
  loading = true;
  saving = false;
  error: string | null = null;
  successMessage: string | null = null;
  activeTab: 'cuenta' | 'seguridad' = 'cuenta';

  // Preview de imágenes
  coverPreview: string | null = null;
  profilePreview: string | null = null;
  coverFile: File | null = null;
  profileFile: File | null = null;

  constructor(
    private profileService: ProfileService,
    private homeService: HomeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadData();
  }

  createForm(): void {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[679]\d{8}$/)]],
      pais: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      biografia: ['', [Validators.maxLength(500)]]
    });
  }

  loadData(): void {
    this.loading = true;

    // Cargar datos de navbar (esto actualizará la imagen en el navbar)
    this.homeService.getHomeData().subscribe({
      next: (data) => {
        this.homeData = data;
      },
      error: (err) => {
        console.error('Error al cargar datos de navbar:', err);
      }
    });

    // Cargar perfil
    this.profileService.getPerfilPropio().subscribe({
      next: (data) => {
        this.perfil = data;
        this.fillForm(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.error = 'No se pudo cargar la configuración';
        this.loading = false;
      }
    });
  }

  fillForm(perfil: PerfilResponse): void {
    this.profileForm.patchValue({
      nombre: perfil.nombre,
      apellidos: perfil.apellidos,
      username: perfil.username,
      telefono: perfil.telefono,
      pais: perfil.pais,
      ciudad: perfil.ciudad,
      fechaNacimiento: perfil.edad ? this.calculateBirthDate(perfil.edad) : '',
      biografia: perfil.biografia || ''
    });
  }

  calculateBirthDate(edad: number): string {
    const today = new Date();
    const birthYear = today.getFullYear() - edad;
    return `${birthYear}-01-01`; // Aproximación
  }

  switchTab(tab: 'cuenta' | 'seguridad'): void {
    this.activeTab = tab;
  }

  onCoverChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        this.error = 'El archivo debe ser una imagen';
        return;
      }

      this.coverFile = file;

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.coverPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onProfileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        this.error = 'El archivo debe ser una imagen';
        return;
      }

      this.profileFile = file;

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;
    this.successMessage = null;

    const formData = this.profileForm.value;

    // Actualizar perfil
    this.profileService.actualizarPerfil(formData).subscribe({
      next: () => {
        // Si hay imágenes, subirlas
        if (this.coverFile || this.profileFile) {
          this.uploadImages();
        } else {
          this.successMessage = 'Perfil actualizado correctamente';
          this.saving = false;
          this.loadData(); // Recargar datos
        }
      },
      error: (err) => {
        console.error('Error al actualizar perfil:', err);
        this.error = err.error?.error || 'Error al actualizar el perfil';
        this.saving = false;
      }
    });
  }

  uploadImages(): void {
    let uploaded = 0;
    const total = (this.coverFile ? 1 : 0) + (this.profileFile ? 1 : 0);

    const checkComplete = () => {
      uploaded++;
      if (uploaded === total) {
        this.successMessage = 'Perfil e imágenes actualizados correctamente';
        this.saving = false;
        this.coverFile = null;
        this.profileFile = null;
        this.coverPreview = null;
        this.profilePreview = null;
        
        // Recargar datos del perfil
        this.loadData();
        
        // Forzar actualización de la navbar
        this.homeService.refreshHomeData();
      }
    };

    if (this.coverFile) {
      this.profileService.subirImagenPortada(this.coverFile).subscribe({
        next: () => checkComplete(),
        error: (err) => {
          console.error('Error al subir imagen de portada:', err);
          this.error = 'Error al subir la imagen de portada';
          this.saving = false;
        }
      });
    }

    if (this.profileFile) {
      this.profileService.subirImagenPerfil(this.profileFile).subscribe({
        next: () => checkComplete(),
        error: (err) => {
          console.error('Error al subir imagen de perfil:', err);
          this.error = 'Error al subir la imagen de perfil';
          this.saving = false;
        }
      });
    }
  }

  getImageUrl(imagen: string | undefined): string {
    if (!imagen) return '';
    return `http://localhost:8080/uploads/${imagen}`;
  }

  get isVerified(): boolean {
    return this.perfil?.verificado || false;
  }

  get reseniasFaltantes(): number {
    const total = this.perfil?.totalResenas || 0;
    return Math.max(0, 5 - total);
  }
}
