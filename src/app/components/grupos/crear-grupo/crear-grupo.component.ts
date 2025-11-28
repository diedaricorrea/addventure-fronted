import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GruposService, CrearGrupoDTO } from '../../../services/grupos.service';
import { ToastService } from '../../../services/toast.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-crear-grupo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './crear-grupo.component.html',
  styleUrls: ['./crear-grupo.component.css']
})
export class CrearGrupoComponent implements OnInit {
  grupoForm!: FormGroup;
  esEdicion = false;
  idGrupo?: number;
  loading = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private gruposService = inject(GruposService);
  private toastService = inject(ToastService);
  submitted = false;

  ngOnInit(): void {
    this.inicializarFormulario();
    
    // Verificar si es edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.esEdicion = true;
        this.idGrupo = +params['id'];
        this.cargarGrupo();
      }
    });
  }

  inicializarFormulario(): void {
    this.grupoForm = this.fb.group({
      nombreViaje: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      destinoPrincipal: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      puntoEncuentro: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      imagenDestacada: ['', Validators.pattern('^(https?://).*')],
      rangoEdadMin: [18, [Validators.required, Validators.min(18), Validators.max(80)]],
      rangoEdadMax: [60, [Validators.required, Validators.min(18), Validators.max(80)]],
      maxParticipantes: [5, [Validators.required, Validators.min(2), Validators.max(20)]],
      etiquetasInput: [''],
      etiquetas: this.fb.array([]),
      diasItinerario: this.fb.array([])
    });
  }

  cargarGrupo(): void {
    if (!this.idGrupo) return;

    this.loading = true;
    this.gruposService.obtenerDetalleGrupo(this.idGrupo).subscribe({
      next: (response: any) => {
        const grupo = response.grupo;
        this.grupoForm.patchValue({
          nombreViaje: grupo.nombreViaje,
          destinoPrincipal: grupo.viaje?.destinoPrincipal,
          fechaInicio: grupo.viaje?.fechaInicio,
          fechaFin: grupo.viaje?.fechaFin,
          descripcion: grupo.viaje?.descripcion,
          puntoEncuentro: grupo.viaje?.puntoEncuentro,
          imagenDestacada: grupo.viaje?.imagenDestacada,
          rangoEdadMin: grupo.viaje?.rangoEdadMin || 18,
          rangoEdadMax: grupo.viaje?.rangoEdadMax || 60,
          maxParticipantes: grupo.maxParticipantes
        });

        // Cargar etiquetas
        if (grupo.etiquetas && grupo.etiquetas.length > 0) {
          const etiquetasArray = this.grupoForm.get('etiquetas') as FormArray;
          grupo.etiquetas.forEach((etiqueta: any) => {
            etiquetasArray.push(this.fb.control(etiqueta.nombreEtiqueta));
          });
        }

        this.loading = false;
      },
      error: (error: any) => {
        this.toastService.error('Error al cargar los datos del grupo');
        this.loading = false;
        this.router.navigate(['/mis-viajes']);
      }
    });
  }

  get etiquetas(): FormArray {
    return this.grupoForm.get('etiquetas') as FormArray;
  }

  get diasItinerario(): FormArray {
    return this.grupoForm.get('diasItinerario') as FormArray;
  }

  agregarEtiqueta(): void {
    const etiquetaInput = this.grupoForm.get('etiquetasInput')?.value?.trim();
    if (etiquetaInput && this.etiquetas.length < 10) {
      if (!this.etiquetas.value.includes(etiquetaInput)) {
        this.etiquetas.push(this.fb.control(etiquetaInput));
        this.grupoForm.patchValue({ etiquetasInput: '' });
      } else {
        this.toastService.warning('Esta etiqueta ya fue agregada');
      }
    } else if (this.etiquetas.length >= 10) {
      this.toastService.warning('Máximo 10 etiquetas permitidas');
    }
  }

  eliminarEtiqueta(index: number): void {
    this.etiquetas.removeAt(index);
  }

  agregarDia(): void {
    const nuevodia = this.fb.group({
      diaNumero: [this.diasItinerario.length + 1],
      actividades: this.fb.array([this.fb.control('')])
    });
    this.diasItinerario.push(nuevodia);
  }

  eliminarDia(index: number): void {
    this.diasItinerario.removeAt(index);
    // Reordenar los números de día
    this.diasItinerario.controls.forEach((dia, i) => {
      dia.get('diaNumero')?.setValue(i + 1);
    });
  }

  getActividades(diaIndex: number): FormArray {
    return this.diasItinerario.at(diaIndex).get('actividades') as FormArray;
  }

  agregarActividad(diaIndex: number): void {
    this.getActividades(diaIndex).push(this.fb.control(''));
  }

  eliminarActividad(diaIndex: number, actIndex: number): void {
    this.getActividades(diaIndex).removeAt(actIndex);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.grupoForm.invalid) {
      this.toastService.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (this.etiquetas.length === 0) {
      this.toastService.error('Debes agregar al menos una etiqueta');
      return;
    }

    // Validar fechas
    const fechaInicio = new Date(this.grupoForm.value.fechaInicio);
    const fechaFin = new Date(this.grupoForm.value.fechaFin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio < hoy) {
      this.toastService.error('La fecha de inicio debe ser en el futuro');
      return;
    }

    if (fechaFin < fechaInicio) {
      this.toastService.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    // Validar rangos de edad
    const edadMin = this.grupoForm.value.rangoEdadMin;
    const edadMax = this.grupoForm.value.rangoEdadMax;
    if (edadMax < edadMin) {
      this.toastService.error('La edad máxima debe ser mayor o igual a la edad mínima');
      return;
    }

    const datos: CrearGrupoDTO = {
      nombreViaje: this.grupoForm.value.nombreViaje,
      destinoPrincipal: this.grupoForm.value.destinoPrincipal,
      fechaInicio: this.grupoForm.value.fechaInicio,
      fechaFin: this.grupoForm.value.fechaFin,
      descripcion: this.grupoForm.value.descripcion,
      puntoEncuentro: this.grupoForm.value.puntoEncuentro,
      imagenDestacada: this.grupoForm.value.imagenDestacada || '',
      rangoEdadMin: edadMin,
      rangoEdadMax: edadMax,
      maxParticipantes: this.grupoForm.value.maxParticipantes,
      etiquetas: this.etiquetas.value,
      diasItinerario: this.diasItinerario.value.filter((dia: any) => {
        const actividadesValidas = dia.actividades.filter((act: string) => act.trim() !== '');
        return actividadesValidas.length > 0;
      }).map((dia: any) => ({
        diaNumero: dia.diaNumero,
        actividades: dia.actividades.filter((act: string) => act.trim() !== '')
      }))
    };

    this.loading = true;

    const operacion = this.esEdicion
      ? this.gruposService.actualizarGrupo(this.idGrupo!, datos)
      : this.gruposService.crearGrupo(datos);

    operacion.subscribe({
      next: (response: any) => {
        this.toastService.success(response.mensaje || 
          (this.esEdicion ? 'Grupo actualizado exitosamente' : 'Grupo creado exitosamente'));
        this.router.navigate(['/mis-viajes']);
      },
      error: (error: any) => {
        this.toastService.error(error.error?.error || 'Error al guardar el grupo');
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/mis-viajes']);
  }

  // Helpers para validación
  isFieldInvalid(field: string): boolean {
    const control = this.grupoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  getFieldError(field: string): string {
    const control = this.grupoForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
      if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;
      if (control.errors['pattern']) return 'URL inválida (debe comenzar con http:// o https://)';
    }
    return '';
  }
}
