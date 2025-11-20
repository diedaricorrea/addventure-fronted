import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage = '';
  usernameChecking = false;
  usernameAvailable: boolean | null = null;
  emailChecking = false;
  emailAvailable: boolean | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    this.createForm();
    this.setupUsernameValidation();
    this.setupEmailValidation();
  }

  createForm(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[679]\d{8}$/)]],
      pais: ['Perú', [Validators.required]],
      ciudad: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, this.ageValidator]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmContrasena: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  setupUsernameValidation(): void {
    this.registerForm.get('nombreUsuario')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(username => {
          if (username && username.length >= 3) {
            this.usernameChecking = true;
            return this.authService.checkUsernameAvailability(username);
          }
          return [];
        })
      )
      .subscribe({
        next: (result: any) => {
          this.usernameChecking = false;
          this.usernameAvailable = result.available;
        },
        error: () => {
          this.usernameChecking = false;
          this.usernameAvailable = null;
        }
      });
  }

  setupEmailValidation(): void {
    this.registerForm.get('email')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          const emailControl = this.registerForm.get('email');
          if (email && emailControl?.valid) {
            this.emailChecking = true;
            return this.authService.checkEmailAvailability(email);
          }
          return [];
        })
      )
      .subscribe({
        next: (result: any) => {
          this.emailChecking = false;
          this.emailAvailable = result.available;
        },
        error: () => {
          this.emailChecking = false;
          this.emailAvailable = null;
        }
      });
  }

  ageValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18 ? null : { underAge: true };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('contrasena');
    const confirmPassword = control.get('confirmContrasena');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePassword(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.usernameAvailable || !this.emailAvailable) {
      this.errorMessage = 'Por favor verifica que el usuario y email estén disponibles';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const registerData = {
      ...this.registerForm.value,
      telefono: '+51' + this.registerForm.value.telefono
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al registrar. Por favor intenta de nuevo.';
      }
    });
  }
}
